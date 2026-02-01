export async function generateFromPrompt(prompt: string, temperature = 0.7) {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error('GROQ_API_KEY not found in environment variables');
    throw new Error('GROQ_API_KEY not configured');
  }

  console.log('🤖 Calling Groq API with temperature:', temperature);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: temperature,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();
    
    if (response.status === 429) {
      console.error('⚠️ Groq rate limit exceeded');
      throw new Error('RATE_LIMIT_EXCEEDED');
    }
    
    if (!response.ok) {
      console.error('❌ Groq API error:', response.status, data);
      throw new Error(`Groq API error: ${data.error?.message || JSON.stringify(data)}`);
    }

    const result = data.choices?.[0]?.message?.content;
    if (!result) {
      console.error('❌ No content generated:', data);
      throw new Error('No content was generated');
    }
    
    console.log('✅ Groq API call successful');
    return result.trim();
  } catch (error) {
    // Don't log rate limit errors - they're expected and handled
    if (error instanceof Error && error.message !== 'RATE_LIMIT_EXCEEDED') {
      console.error('❌ Groq error:', error);
    }
    throw error;
  }
}
