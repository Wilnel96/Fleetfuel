import { createClient } from 'npm:@supabase/supabase-js@2.83.0';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface SetPINRequest {
  driverId: string;
  pin: string;
  oldPin?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { driverId, pin, oldPin }: SetPINRequest = await req.json();

    if (!driverId || !pin) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN must be exactly 4 digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for weak PINs
    if (/^(\d)\1{3}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN cannot be all same digits' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (pin === '1234' || pin === '4321') {
      return new Response(
        JSON.stringify({ error: 'PIN cannot be sequential' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (/^(\d{2})\1$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: 'PIN cannot be repeating pattern' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing payment settings
    const { data: settings } = await supabase
      .from('driver_payment_settings')
      .select('pin_hash, is_pin_active')
      .eq('driver_id', driverId)
      .maybeSingle();

    // If changing PIN, verify old PIN first
    if (settings?.is_pin_active && oldPin) {
      const oldPinValid = await bcrypt.compare(oldPin, settings.pin_hash);
      if (!oldPinValid) {
        return new Response(
          JSON.stringify({ error: 'Current PIN is incorrect' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Hash the new PIN
    const salt = await bcrypt.genSalt(12);
    const hashedPin = await bcrypt.hash(pin, salt);

    // Update driver payment settings
    const { error: updateError } = await supabase
      .from('driver_payment_settings')
      .update({
        pin_hash: hashedPin,
        pin_salt: salt,
        is_pin_active: true,
        pin_last_changed: new Date().toISOString(),
        require_pin_change: false,
        failed_pin_attempts: 0,
        locked_until: null,
      })
      .eq('driver_id', driverId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'PIN set successfully',
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('PIN setup error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
