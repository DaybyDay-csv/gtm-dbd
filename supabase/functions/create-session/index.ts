import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate new session token
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
    
    // Get client IP
    const ipAddress = req.headers.get('x-forwarded-for') || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    // Store session in database
    const { error: insertError } = await supabase
      .from('anonymous_sessions')
      .insert({
        token,
        expires_at: expiresAt.toISOString(),
        ip_address: ipAddress
      });

    if (insertError) {
      console.error('Error creating session:', insertError);
      throw insertError;
    }

    console.log(`Session created: ${token} for IP: ${ipAddress}`);

    return new Response(
      JSON.stringify({
        token,
        expiresAt: expiresAt.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in create-session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});