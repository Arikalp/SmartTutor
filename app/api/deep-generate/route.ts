import { NextResponse } from 'next/server';
import { generateFromPrompt } from '@/lib/gemini';

export async function POST(req: Request) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: 'Missing topic' }, { status: 400 });
    }

    const prompt = `Create a comprehensive deep learning module for: "${topic}"

You MUST create exactly 5 sections. Return ONLY valid JSON in this exact format:

{
  "sections": [
    {
      "id": "section1",
      "title": "Introduction and Fundamentals",
      "content": "Detailed 200+ word explanation covering basic concepts, definitions, and foundational knowledge.",
      "quiz": {
        "questions": [
          {
            "id": "q1",
            "question": "What is the primary purpose of [topic]?",
            "type": "mcq",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "answer": "Option A"
          },
          {
            "id": "q2",
            "question": "Define the key concept of [topic]",
            "type": "short",
            "answer": "Brief answer"
          }
        ]
      }
    }
  ]
}

Create 5 sections covering:
1. Introduction and Fundamentals
2. Key Components/Elements
3. Process/Methods/Techniques
4. Applications and Examples
5. Advanced Concepts and Future

Each section needs 200+ words and 2-3 questions. Return ONLY the JSON.`;

    const response = await generateFromPrompt(prompt, 0.7);
    
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
    
    if (parsed && parsed.sections) {
      return NextResponse.json(parsed);
    }
    
    // Comprehensive fallback structure with 5 sections
    const fallbackData = {
      sections: [
        {
          id: 'section1',
          title: 'Introduction and Fundamentals',
          content: `Welcome to this comprehensive learning module on ${topic}. This foundational section introduces the core concepts, definitions, and basic principles that form the backbone of understanding ${topic}. We'll explore the historical context, key terminology, and fundamental theories that every learner should grasp. Understanding these basics is crucial as they serve as building blocks for more advanced concepts. The importance of ${topic} in today's world cannot be overstated, as it impacts various aspects of our daily lives and professional endeavors. By the end of this section, you'll have a solid foundation to build upon in subsequent modules.`,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: `What is the primary purpose of ${topic}?`,
                type: 'short',
                answer: 'To provide understanding and practical knowledge'
              },
              {
                id: 'q2',
                question: `Which best describes the importance of ${topic}?`,
                type: 'mcq',
                options: ['Limited application', 'Moderate relevance', 'High significance', 'Outdated concept'],
                answer: 'High significance'
              }
            ]
          }
        },
        {
          id: 'section2',
          title: 'Key Components and Elements',
          content: `This section delves into the essential components that make up ${topic}. We'll examine each element in detail, understanding how they interact and contribute to the overall system or concept. The relationship between different components is crucial for comprehending the bigger picture. We'll analyze the structure, hierarchy, and interdependencies that exist within ${topic}. Real-world examples will illustrate how these components work together in practical scenarios. Understanding these elements will enable you to identify patterns, troubleshoot issues, and optimize performance in various applications related to ${topic}.`,
          quiz: {
            questions: [
              {
                id: 'q3',
                question: `What are the main components of ${topic}?`,
                type: 'short',
                answer: 'Various interconnected elements and systems'
              },
              {
                id: 'q4',
                question: `How do components in ${topic} typically interact?`,
                type: 'mcq',
                options: ['Independently', 'Through complex relationships', 'Randomly', 'In isolation'],
                answer: 'Through complex relationships'
              }
            ]
          }
        },
        {
          id: 'section3',
          title: 'Methods and Techniques',
          content: `Here we explore the various methods, processes, and techniques used in ${topic}. This practical section focuses on the "how-to" aspects, providing step-by-step guidance and best practices. We'll cover both traditional approaches and modern innovations, comparing their effectiveness and appropriate use cases. The methodology behind ${topic} has evolved significantly over time, incorporating new technologies and refined processes. Understanding these techniques is essential for practical application and professional competency. We'll also discuss common pitfalls to avoid and strategies for successful implementation in different contexts and environments.`,
          quiz: {
            questions: [
              {
                id: 'q5',
                question: `What is a key technique used in ${topic}?`,
                type: 'short',
                answer: 'Systematic approach and best practices'
              },
              {
                id: 'q6',
                question: `Which approach is most effective for ${topic}?`,
                type: 'mcq',
                options: ['Traditional methods only', 'Modern techniques only', 'Combination of both', 'Trial and error'],
                answer: 'Combination of both'
              }
            ]
          }
        },
        {
          id: 'section4',
          title: 'Applications and Real-World Examples',
          content: `This section showcases practical applications of ${topic} across various industries and contexts. We'll examine case studies, success stories, and real-world implementations that demonstrate the value and impact of ${topic}. From small-scale applications to large enterprise solutions, the versatility of ${topic} becomes apparent through these examples. We'll analyze different scenarios, challenges faced, and solutions implemented. Understanding these applications helps bridge the gap between theoretical knowledge and practical implementation. The examples provided will inspire creative thinking and help you identify opportunities to apply ${topic} in your own field or area of interest.`,
          quiz: {
            questions: [
              {
                id: 'q7',
                question: `Name a common application of ${topic}`,
                type: 'short',
                answer: 'Practical implementation in various fields'
              },
              {
                id: 'q8',
                question: `What makes ${topic} versatile in applications?`,
                type: 'mcq',
                options: ['Limited scope', 'Adaptability to different contexts', 'Single use case', 'Complex requirements'],
                answer: 'Adaptability to different contexts'
              }
            ]
          }
        },
        {
          id: 'section5',
          title: 'Advanced Concepts and Future Directions',
          content: `In this final section, we explore advanced concepts, emerging trends, and future directions in ${topic}. We'll discuss cutting-edge developments, research frontiers, and potential innovations that may shape the future landscape. Understanding these advanced topics prepares you for continued learning and professional growth. We'll examine current challenges, ongoing research, and potential solutions being developed. The future of ${topic} holds exciting possibilities, with new technologies and methodologies constantly emerging. This forward-looking perspective helps you stay ahead of the curve and positions you to contribute to the evolution of ${topic} in your professional journey.`,
          quiz: {
            questions: [
              {
                id: 'q9',
                question: `What represents the future direction of ${topic}?`,
                type: 'short',
                answer: 'Innovation and emerging technologies'
              },
              {
                id: 'q10',
                question: `How should professionals approach the future of ${topic}?`,
                type: 'mcq',
                options: ['Ignore changes', 'Continuous learning', 'Stick to basics', 'Wait for others'],
                answer: 'Continuous learning'
              }
            ]
          }
        }
      ]
    };
    
    return NextResponse.json(fallbackData);
  } catch (err: any) {
    console.error('API /deep-generate error:', err);
    
    // Return the same comprehensive fallback
    const fallbackData = {
      sections: [
        {
          id: 'section1',
          title: 'Introduction and Fundamentals',
          content: `Welcome to this comprehensive learning module. This foundational section introduces the core concepts and basic principles. Understanding these basics is crucial as they serve as building blocks for more advanced concepts. The importance of this topic in today's world cannot be overstated, as it impacts various aspects of our daily lives and professional endeavors.`,
          quiz: {
            questions: [
              {
                id: 'q1',
                question: 'What is the primary focus of this learning module?',
                type: 'short',
                answer: 'Comprehensive understanding'
              }
            ]
          }
        }
      ]
    };
    
    return NextResponse.json(fallbackData);
  }
}