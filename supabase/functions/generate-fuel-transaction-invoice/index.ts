import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.83.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateInvoiceRequest {
  fuelTransactionId: string;
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

    const { fuelTransactionId }: GenerateInvoiceRequest = await req.json();

    if (!fuelTransactionId) {
      return new Response(
        JSON.stringify({ error: "Fuel transaction ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: transaction, error: transactionError } = await supabase
      .from("fuel_transactions")
      .select(`
        id,
        organization_id,
        vehicle_id,
        driver_id,
        garage_id,
        fuel_type,
        liters,
        price_per_liter,
        total_amount,
        odometer_reading,
        transaction_date,
        invoice_id,
        has_additional_items,
        items_subtotal_excl_vat,
        items_vat_amount,
        items_total_incl_vat
      `)
      .eq("id", fuelTransactionId)
      .maybeSingle();

    if (transactionError || !transaction) {
      return new Response(
        JSON.stringify({ error: "Fuel transaction not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (transaction.invoice_id) {
      return new Response(
        JSON.stringify({
          error: "Invoice already exists for this transaction",
          invoiceId: transaction.invoice_id
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const [orgResult, vehicleResult, driverResult, garageResult] = await Promise.all([
      supabase
        .from("organizations")
        .select("name, billing_contact_email, billing_contact_name")
        .eq("id", transaction.organization_id)
        .maybeSingle(),
      supabase
        .from("vehicles")
        .select("registration_number")
        .eq("id", transaction.vehicle_id)
        .maybeSingle(),
      supabase
        .from("drivers")
        .select("first_name, surname")
        .eq("id", transaction.driver_id)
        .maybeSingle(),
      transaction.garage_id ? supabase
        .from("garages")
        .select("name, address_line_1, address_line_2, city, province, postal_code, vat_number")
        .eq("id", transaction.garage_id)
        .maybeSingle() : Promise.resolve({ data: null, error: null }),
    ]);

    if (orgResult.error || !orgResult.data) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (vehicleResult.error || !vehicleResult.data) {
      return new Response(
        JSON.stringify({ error: "Vehicle not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (driverResult.error || !driverResult.data) {
      return new Response(
        JSON.stringify({ error: "Driver not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (garageResult.error) {
      return new Response(
        JSON.stringify({ error: "Error fetching garage information" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const organization = orgResult.data;
    const vehicle = vehicleResult.data;
    const driver = driverResult.data;
    const garage = garageResult.data;

    // Fetch additional items if transaction has them
    let additionalItems: any[] = [];
    if (transaction.has_additional_items) {
      const { data: items, error: itemsError } = await supabase
        .from("fuel_transaction_items")
        .select("*")
        .eq("fuel_transaction_id", transaction.id);

      if (!itemsError && items) {
        additionalItems = items;
      }
    }

    // Calculate fuel amount (fuel is VAT zero-rated)
    const fuelAmount = Number(transaction.liters) * Number(transaction.price_per_liter);
    const itemsSubtotalExclVat = Number(transaction.items_subtotal_excl_vat || 0);
    const itemsVatAmount = Number(transaction.items_vat_amount || 0);
    const itemsTotalInclVat = Number(transaction.items_total_incl_vat || 0);

    const { data: invoiceNumber, error: invoiceNumberError } = await supabase
      .rpc("generate_fuel_invoice_number");

    if (invoiceNumberError || !invoiceNumber) {
      return new Response(
        JSON.stringify({ error: "Failed to generate invoice number" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const garageAddress = garage ? [
      garage.address_line_1,
      garage.address_line_2,
      `${garage.city}, ${garage.province} ${garage.postal_code}`,
    ]
      .filter(Boolean)
      .join(", ") : "Not recorded";

    const { data: invoice, error: invoiceError } = await supabase
      .from("fuel_transaction_invoices")
      .insert({
        fuel_transaction_id: transaction.id,
        organization_id: transaction.organization_id,
        invoice_number: invoiceNumber,
        invoice_date: new Date().toISOString(),
        fuel_type: transaction.fuel_type,
        liters: transaction.liters,
        price_per_liter: transaction.price_per_liter,
        fuel_amount: fuelAmount,
        subtotal: fuelAmount,
        vat_rate: 0,
        vat_amount: itemsVatAmount,
        items_subtotal_excl_vat: itemsSubtotalExclVat,
        items_vat_amount: itemsVatAmount,
        items_total_incl_vat: itemsTotalInclVat,
        total_amount: transaction.total_amount,
        vehicle_registration: vehicle.registration_number,
        driver_name: `${driver.first_name} ${driver.surname}`,
        garage_name: garage ? garage.name : "Not recorded",
        garage_address: garageAddress,
        garage_vat_number: garage?.vat_number || "",
        odometer_reading: transaction.odometer_reading,
        transaction_date: transaction.transaction_date,
        email_recipient: organization.billing_contact_email || null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice insert error:", invoiceError);
      return new Response(
        JSON.stringify({ error: "Failed to create invoice" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await supabase
      .from("fuel_transactions")
      .update({ invoice_id: invoice.id })
      .eq("id", transaction.id);

    if (updateError) {
      console.error("Transaction update error:", updateError);
    }

    // Build additional items section for email
    let additionalItemsSection = "";
    if (additionalItems.length > 0) {
      additionalItemsSection = "\n\nAdditional Items:\n";
      for (const item of additionalItems) {
        additionalItemsSection += `- ${item.item_type}: ${Number(item.quantity_liters).toFixed(2)}L @ R ${Number(item.total_price_incl_vat).toFixed(2)}\n`;
      }
    }

    // Build breakdown section
    let breakdownSection = "\n";
    if (additionalItems.length > 0) {
      breakdownSection += `Fuel Amount (VAT Zero-Rated): R ${fuelAmount.toFixed(2)}\n`;
      breakdownSection += `Additional Items Subtotal: R ${itemsSubtotalExclVat.toFixed(2)}\n`;
      breakdownSection += `VAT (15%): R ${itemsVatAmount.toFixed(2)}\n`;
      breakdownSection += `\nTotal Amount: R ${Number(invoice.total_amount).toFixed(2)}`;
    } else {
      breakdownSection += `Total Amount (VAT Zero-Rated): R ${Number(invoice.total_amount).toFixed(2)}`;
    }

    const emailSubject = `Fuel Transaction Invoice - ${invoiceNumber}`;
    const emailBody = `
Dear ${organization.billing_contact_name || organization.name},

Please find below the details of your fuel transaction invoice:

Invoice Number: ${invoiceNumber}
Invoice Date: ${new Date(invoice.invoice_date).toLocaleDateString("en-ZA")}
Transaction Date: ${new Date(invoice.transaction_date).toLocaleDateString("en-ZA")}

Vehicle Registration: ${invoice.vehicle_registration}
Driver: ${invoice.driver_name}
Odometer Reading: ${invoice.odometer_reading} km

Fuel Station: ${invoice.garage_name}
Address: ${invoice.garage_address}

Fuel Type: ${invoice.fuel_type}
Liters: ${Number(invoice.liters).toFixed(2)}L
Price per Liter: R ${Number(invoice.price_per_liter).toFixed(2)}
Fuel Amount: R ${fuelAmount.toFixed(2)}
${additionalItemsSection}${breakdownSection}

This invoice is for accounting and tax compliance purposes.

Thank you for your business.

Best regards,
MyFuelApp Management
`;

    console.log("Invoice generated:", invoice.id);
    console.log("Email would be sent to:", invoice.email_recipient);
    console.log("Email subject:", emailSubject);
    console.log("Email body:", emailBody);

    return new Response(
      JSON.stringify({
        success: true,
        invoice: {
          ...invoice,
          additional_items: additionalItems,
        },
        message: "Invoice generated successfully",
      }),
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