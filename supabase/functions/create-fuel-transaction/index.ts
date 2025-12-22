import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Driver-Token",
};

interface FuelTransactionRequest {
  vehicleId: string;
  garageId: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  odometerReading: number;
  location?: string;
  fuelType: string;
  licenseDiskImage?: string;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  previousOdometerReading?: number | null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get driver token from header
    const driverToken = req.headers.get("X-Driver-Token");
    if (!driverToken) {
      return new Response(
        JSON.stringify({ error: "Driver token required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate driver session
    const { data: session, error: sessionError } = await supabase
      .from("driver_sessions")
      .select("driver_id, expires_at")
      .eq("token", driverToken)
      .maybeSingle();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired session" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Session expired" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get driver details
    const { data: driver, error: driverError } = await supabase
      .from("drivers")
      .select("id, organization_id, status")
      .eq("id", session.driver_id)
      .maybeSingle();

    if (driverError || !driver) {
      return new Response(
        JSON.stringify({ error: "Driver not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (driver.status !== "active") {
      return new Response(
        JSON.stringify({ error: "Driver account is not active" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const transactionData: FuelTransactionRequest = await req.json();

    // Validate vehicle belongs to driver's organization
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("organization_id, tank_capacity")
      .eq("id", transactionData.vehicleId)
      .maybeSingle();

    if (vehicleError || !vehicle) {
      return new Response(
        JSON.stringify({ error: "Vehicle not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (vehicle.organization_id !== driver.organization_id) {
      return new Response(
        JSON.stringify({ error: "Vehicle does not belong to driver's organization" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validate refuel liters against tank capacity
    if (vehicle.tank_capacity) {
      const maxAllowedLiters = Number(vehicle.tank_capacity) + 2;
      if (transactionData.liters > maxAllowedLiters) {
        return new Response(
          JSON.stringify({
            error: `Refuel amount (${transactionData.liters}L) exceeds vehicle tank capacity (${vehicle.tank_capacity}L + 2L buffer = ${maxAllowedLiters}L)`
          }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Check if the driver has drawn this vehicle
    const { data: hasDrawn, error: drawCheckError } = await supabase
      .rpc("check_vehicle_drawn_by_driver", {
        p_vehicle_id: transactionData.vehicleId,
        p_driver_id: driver.id,
      });

    if (drawCheckError) {
      console.error("Draw check error:", drawCheckError);
      return new Response(
        JSON.stringify({ error: "Failed to verify vehicle draw status" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!hasDrawn) {
      return new Response(
        JSON.stringify({ error: "You must draw this vehicle before you can refuel it" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create fuel transaction
    const { data: transaction, error: insertError } = await supabase
      .from("fuel_transactions")
      .insert({
        organization_id: driver.organization_id,
        vehicle_id: transactionData.vehicleId,
        garage_id: transactionData.garageId,
        driver_id: driver.id,
        liters: transactionData.liters,
        price_per_liter: transactionData.pricePerLiter,
        total_amount: transactionData.totalAmount,
        commission_rate: transactionData.commissionRate,
        commission_amount: transactionData.commissionAmount,
        net_amount: transactionData.netAmount,
        previous_odometer_reading: transactionData.previousOdometerReading,
        odometer_reading: transactionData.odometerReading,
        location: transactionData.location || "Unknown",
        fuel_type: transactionData.fuelType,
        license_disk_image: transactionData.licenseDiskImage,
        number_plate_image: null,
        verified: true,
        authorized_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Insert error:", insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, transaction }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});