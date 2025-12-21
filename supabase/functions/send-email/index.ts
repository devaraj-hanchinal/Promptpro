const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { to, subject, html, text, from, replyTo, cc, bcc }: EmailRequest = await req.json();

    if (!to || !subject) {
      return new Response(
        JSON.stringify({ error: 'Recipient (to) and subject are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const picaSecretKey = Deno.env.get('PICA_SECRET_KEY');
    const picaResendConnectionKey = Deno.env.get('PICA_RESEND_CONNECTION_KEY');

    if (!picaSecretKey || !picaResendConnectionKey) {
      return new Response(
        JSON.stringify({ error: 'Email service configuration missing. Please check your environment variables.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const emailPayload: Record<string, any> = {
      from: from || "PromptPro <noreply@promptpro.dev>",
      to: Array.isArray(to) ? to : [to],
      subject,
    };

    if (html) emailPayload.html = html;
    if (text) emailPayload.text = text;
    if (replyTo) emailPayload.reply_to = replyTo;
    if (cc) emailPayload.cc = Array.isArray(cc) ? cc : [cc];
    if (bcc) emailPayload.bcc = Array.isArray(bcc) ? bcc : [bcc];

    const response = await fetch('https://api.picaos.com/v1/passthrough/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-pica-secret': picaSecretKey,
        'x-pica-connection-key': picaResendConnectionKey,
        'x-pica-action-id': 'conn_mod_def::GC4q4JE4I28::x8Elxo0VRMK1X-uH1C3NeA',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: errorText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
