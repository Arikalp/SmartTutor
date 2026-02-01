import { NextResponse } from 'next/server';
import { generateFromPrompt } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    // 1) Generate explanation
    const explanationPrompt = `Explain the following topic to a 2nd year college student in clear steps and examples: "${topic}". Keep it concise (~250-400 words).`;
    const explanation = await generateFromPrompt(explanationPrompt, 0.4);

    // 2) Generate quiz (5 questions: mix of MCQ and short answer)
    const quizPrompt = `Create 5 quiz questions (mix of multiple-choice and short-answer) based on the explanation below. Return JSON with structure { questions: [ { id, type: 'mcq'|'short', question, options?: [], answer } ] }. Explanation:\n\n${explanation}`;
    const quizRaw = await generateFromPrompt(quizPrompt, 0.5);

    // Safe parsing helper — preserves markdown like **bold** (does not strip asterisks)
    function tryParseModelJson(raw: string) {
      if (!raw) return null;

      // Prefer JSON inside code fence first
      const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let candidate = fenceMatch ? fenceMatch[1] : (raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)?.[0] ?? null);
      if (!candidate) return null;

      candidate = candidate.trim();

      try {
        return JSON.parse(candidate);
      } catch (e) {
        // Heuristic sanitization:
        let s = candidate
          // remove surrounding backticks if any
          .replace(/^`+|`+$/g, '')
          // convert keys: { 'key':  or , 'key':
          .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
          // convert single-quoted values to double quotes (simple cases)
          .replace(/:\s*'([^']*)'(?=\s*[,\}])/g, ': "$1"')
          // remove trailing commas before } or ]
          .replace(/,(\s*[}\]])/g, '$1');

        try {
          return JSON.parse(s);
        } catch (err) {
          return null;
        }
      }
    }

    const parsed = tryParseModelJson(quizRaw);
    const quiz = parsed ?? { raw: quizRaw };

    return NextResponse.json({ explanation, quiz });
  } catch (err: any) {
    console.error('API /generate error:', err);
    
    if (err.message === 'RATE_LIMIT_EXCEEDED') {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }
    
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}