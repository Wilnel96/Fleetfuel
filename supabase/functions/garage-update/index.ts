import { createClient } from 'npm:@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { garageEmail, garagePassword, garageId, updateData } = await req.json();

    // Validate garage credentials
    const { data: garages, error: garageError } = await supabase
      .from('garages')
      .select('id, name, contact_persons, status');

    if (garageError) throw garageError;

    let authenticatedGarage = null;
    for (const garage of garages || []) {
      if (garage.status !== 'active') continue;

      const contactPersons = garage.contact_persons as Array<{
        email: string;
        password: string;
      }>;

      if (!contactPersons) continue;

      const matchedContact = contactPersons.find(
        (contact: any) =>
          contact.email?.toLowerCase() === garageEmail?.toLowerCase() &&
          contact.password === garagePassword
      );

      if (matchedContact) {
        authenticatedGarage = garage;
        break;
      }
    }

    if (!authenticatedGarage) {
      return new Response(
        JSON.stringify({ error: 'Invalid garage credentials' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the garage is updating their own data
    if (authenticatedGarage.id !== garageId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Cannot update another garage' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the garage
    const { data, error } = await supabase
      .from('garages')
      .update(updateData)
      .eq('id', garageId)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
