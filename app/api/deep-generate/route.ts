import { NextResponse } from 'next/server';
import { generateFromPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const prompt = `Create a detailed learning module about "${topic}". Write specific, factual content about ${topic}.

Return this JSON format:
{
  "sections": [
    {
      "id": "section1",
      "title": "Introduction to ${topic}",
      "content": "Write 200+ words explaining what ${topic} is, its definition, history, and importance. Be specific.",
      "quiz": {
        "questions": [
          {
            "id": "q1",
            "question": "What is ${topic}?",
            "type": "short",
            "answer": "Specific answer about ${topic}"
          },
          {
            "id": "q2",
            "question": "Why is ${topic} important?",
            "type": "mcq",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
          }
        ]
      }
    }
  ]
}

Create exactly 5 sections:
1. Introduction to ${topic}
2. Key components of ${topic}
3. How ${topic} works
4. Applications of ${topic}
5. Future of ${topic}

Each section: 200+ words about ${topic} specifically, 2 questions. Return only JSON.`;

    const response = await generateFromPrompt(prompt, 0.3);
    
    // Clean text function to remove asterisks and markdown
    function cleanText(text: string): string {
      if (!text) return text;
      return text
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
        .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
        .replace(/`(.*?)`/g, '$1')      // Remove `code`
        .replace(/#{1,6}\s*/g, '')      // Remove # headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove [links](url)
        .replace(/^\s*[-*+]\s+/gm, '')  // Remove bullet points
        .replace(/^\s*\d+\.\s+/gm, '')  // Remove numbered lists
        .trim();
    }
    
    // Safe parsing helper
    function tryParseModelJson(raw: string) {
      if (!raw) return null;

      const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      let candidate = fenceMatch ? fenceMatch[1] : (raw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)?.[0] ?? null);
      if (!candidate) return null;

      candidate = candidate.trim();

      try {
        return JSON.parse(candidate);
      } catch (e) {
        let s = candidate
          .replace(/^`+|`+$/g, '')
          .replace(/([{,]\s*)'([^']+)'\s*:/g, '$1"$2":')
          .replace(/:\s*'([^']*)'(?=\s*[,\}])/g, ': "$1"')
          .replace(/,(\s*[}\]])/g, '$1');

        try {
          return JSON.parse(s);
        } catch (err) {
          return null;
        }
      }
    }

    const parsed = tryParseModelJson(response);
    
    if (parsed && parsed.sections && parsed.sections.length > 0) {
      // Clean content in parsed sections
      parsed.sections = parsed.sections.map((section: any) => ({
        ...section,
        content: cleanText(section.content),
        title: cleanText(section.title)
      }));
      return NextResponse.json(parsed);
    }
    
    // Generate AI content for fallback instead of hardcoded
    const fallbackPrompt = `Explain "${topic}" in 5 detailed sections. Write actual content about ${topic}, not generic text.

Section 1: What is ${topic}? (200 words)
Section 2: Key parts of ${topic} (200 words)  
Section 3: How ${topic} works (200 words)
Section 4: Uses of ${topic} (200 words)
Section 5: Future of ${topic} (200 words)

Write specific information about ${topic}.`;

    const fallbackResponse = await generateFromPrompt(fallbackPrompt, 0.5);
    
    // Create structured fallback from AI response
    const sections = fallbackResponse.split(/Section \d+:/i).slice(1);
    
    const fallbackData = {
      sections: sections.slice(0, 5).map((section, index) => ({
        id: `section${index + 1}`,
        title: [
          `Introduction to ${topic}`,
          `Key Components of ${topic}`,
          `How ${topic} Works`,
          `Applications of ${topic}`,
          `Future of ${topic}`
        ][index],
        content: cleanText(section.trim()) || `This section covers important aspects of ${topic}. ${topic} involves multiple concepts and applications that are essential to understand.`,
        quiz: {
          questions: [
            {
              id: `q${index * 2 + 1}`,
              question: `What is a key aspect of ${topic}?`,
              type: 'short',
              answer: 'Important concept'
            },
            {
              id: `q${index * 2 + 2}`,
              question: `How does ${topic} benefit users?`,
              type: 'mcq',
              options: ['Provides value', 'Offers solutions', 'Enables progress', 'All of the above'],
              answer: 'All of the above'
            }
          ]
        }
      }))
    };
    
    return NextResponse.json(fallbackData);
  } catch (err: any) {
    console.error('API /deep-generate error:', err);
    
    const { topic } = await req.json();
    const errorFallback = {
      sections: [
        {
          id: 'section1',
          title: `Learning ${topic}`,
          content: `This module covers ${topic} comprehensively. Please try again for more detailed content.`,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: `What would you like to learn about ${topic}?`,
                type: 'short',
                answer: 'Key concepts'
              }
            ]
          }
        }
      ]
    };
    
    return NextResponse.json(errorFallback);
  }
}