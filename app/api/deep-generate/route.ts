import { NextResponse } from 'next/server';
import { generateFromPrompt } from '@/lib/groq';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const prompt = `Create a detailed learning module about "${topic}". Write content in clear point-wise format.

Return this JSON format:
{
  "sections": [
    {
      "id": "section1",
      "title": "Introduction to ${topic}",
      "content": "## What is ${topic}?\n\n• Definition and basic concept\n• Key characteristics\n• Historical background\n• Why it matters\n\n## Core Principles\n\n• Fundamental principle 1\n• Fundamental principle 2\n• How these principles work together",
      "quiz": {
        "questions": [
          {
            "id": "q1",
            "question": "What is ${topic}?",
            "type": "short",
            "answer": "Specific answer"
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

Format each section with:
- Clear headings (##)
- Bullet points (•) for key information
- Organized subsections
- 200+ words total per section
- 2 quiz questions each

Return only JSON.`;

    const response = await generateFromPrompt(prompt, 0.3);
    
    // Convert text to point-wise format
    function formatToPoints(text: string): string {
      if (!text) return text;
      
      // Clean all markdown formatting
      let cleaned = text
        .replace(/\*{1,3}(.*?)\*{1,3}/g, '$1')  // Remove all asterisks (*, **, ***)
        .replace(/_{1,3}(.*?)_{1,3}/g, '$1')    // Remove underscores
        .replace(/`{1,3}(.*?)`{1,3}/g, '$1')    // Remove backticks
        .replace(/#{1,6}\s*/g, '')              // Remove headers
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/\*/g, '')                     // Remove any remaining asterisks
        .replace(/_/g, '')                      // Remove any remaining underscores
      
      // Split into sentences and convert to bullet points
      const sentences = cleaned
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10); // Filter out very short fragments
      
      // Group sentences into logical points (2-3 sentences per point)
      const points = [];
      for (let i = 0; i < sentences.length; i += 2) {
        const point = sentences.slice(i, i + 2).join('. ');
        if (point.trim()) {
          points.push('• ' + point.trim() + (point.endsWith('.') ? '' : '.'));
        }
      }
      
      return points.join('\n\n');
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
      // Format content to points in parsed sections
      parsed.sections = parsed.sections.map((section: any) => ({
        ...section,
        content: formatToPoints(section.content),
        title: section.title.replace(/\*{1,3}(.*?)\*{1,3}/g, '$1').replace(/\*/g, '').replace(/_/g, '')
      }));
      return NextResponse.json(parsed);
    }
    
    // Generate AI content for fallback instead of hardcoded
    const fallbackPrompt = `Explain "${topic}" in 5 detailed sections using point-wise format.

Section 1: What is ${topic}?
• Definition
• Key features
• Importance

Section 2: Key components of ${topic}
• Main elements
• How they work
• Relationships

Section 3: How ${topic} works
• Process steps
• Methods
• Techniques

Section 4: Applications of ${topic}
• Real-world uses
• Examples
• Benefits

Section 5: Future of ${topic}
• Trends
• Innovations
• Challenges

Write specific information about ${topic} in bullet points.`;

    const fallbackResponse = await generateFromPrompt(fallbackPrompt, 0.5);
    
    // Create structured fallback from AI response
    const sections: string[] = fallbackResponse.split(/Section \d+:/i).slice(1);
    
    const mappedSections = sections.slice(0, 5).map((section: string, index: number) => {
      const titles = [
        `Introduction to ${topic}`,
        `Key Components of ${topic}`,
        `How ${topic} Works`,
        `Applications of ${topic}`,
        `Future of ${topic}`
      ];
      
      return {
        id: `section${index + 1}`,
        title: titles[index],
        content: formatToPoints(section.trim()) || `• ${topic} involves multiple important concepts and principles\n\n• Understanding these aspects is essential for practical application\n\n• This knowledge forms the foundation for advanced topics`,
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
      };
    });
    
    const fallbackData = {
      sections: mappedSections
    };
    
    return NextResponse.json(fallbackData);
  } catch (err: any) {
    console.error('API /deep-generate error:', err);
    
    let topic = 'Unknown Topic';
    try {
      const body = await req.json();
      topic = body.topic || 'Unknown Topic';
    } catch (parseErr) {
      console.error('Failed to parse request body in error handler');
    }
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