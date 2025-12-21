const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function localOptimizePrompt(prompt: string): string {
  let optimized = prompt.trim();
  
  if (!optimized.endsWith('.') && !optimized.endsWith('?') && !optimized.endsWith('!')) {
    optimized += '.';
  }
  
  const enhancements: string[] = [];
  
  if (!optimized.toLowerCase().includes('step by step') && !optimized.toLowerCase().includes('detailed')) {
    enhancements.push('Provide a detailed, step-by-step response.');
  }
  
  if (!optimized.toLowerCase().includes('example')) {
    enhancements.push('Include relevant examples where appropriate.');
  }
  
  if (!optimized.toLowerCase().includes('clear') && !optimized.toLowerCase().includes('concise')) {
    enhancements.push('Be clear and concise in your explanation.');
  }
  
  if (optimized.length < 50) {
    optimized = `Please help me with the following request: ${optimized}`;
  }
  
  if (enhancements.length > 0) {
    optimized = `${optimized}\n\n${enhancements.join(' ')}`;
  }
  
  return optimized;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const picaSecretKey = Deno.env.get('PICA_SECRET_KEY');
    const picaOpenaiConnectionKey = Deno.env.get('PICA_OPENAI_CONNECTION_KEY');

    if (picaSecretKey && picaOpenaiConnectionKey) {
      try {
        const response = await fetch('https://api.picaos.com/v1/passthrough/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-pica-secret': picaSecretKey,
            'x-pica-connection-key': picaOpenaiConnectionKey,
            'x-pica-action-id': 'conn_mod_def::GDzgi1QfvM4::4OjsWvZhRxmAVuLAuWgfVA',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert at optimizing prompts for AI models. Analyze the given prompt and provide an improved version that is clearer, more specific, and more effective. Return only the optimized prompt without explanations.',
              },
              {
                role: 'user',
                content: `Optimize this prompt:\n\n${prompt}`,
              },
            ],
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const optimizedPrompt = data.choices?.[0]?.message?.content || '';
          
          if (optimizedPrompt) {
            return new Response(
              JSON.stringify({ optimizedPrompt, source: 'ai' }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            );
          }
        }
      } catch (aiError) {
        console.log('AI optimization failed, using local fallback');
      }
    }

    const optimizedPrompt = localOptimizePrompt(prompt);
    
    return new Response(
      JSON.stringify({ optimizedPrompt, source: 'local' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
