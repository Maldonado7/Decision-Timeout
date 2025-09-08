import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { decision, pros, cons, emotionScore } = await request.json()

    if (!decision) {
      return NextResponse.json({ error: 'Decision text is required' }, { status: 400 })
    }

    const prosText = pros?.length ? pros.join(', ') : 'None listed'
    const consText = cons?.length ? cons.join(', ') : 'None listed'
    const emotionLabel = getEmotionLabel(emotionScore)

    const prompt = `User is trying to decide: "${decision}"

Their pros: ${prosText}
Their cons: ${consText}
Their current emotional state: ${emotionLabel} (${emotionScore}/5)

Please provide:
1. A helpful reflection question that broadens their perspective
2. A thoughtful, empathetic reframe of the situation to reduce anxiety and provide clarity
3. A brief inspiring quote or mindset shift to encourage clear thinking

Guidelines:
- Be supportive, calm, and insightful
- Avoid giving direct advice; instead encourage reflection
- Help them see the situation from different angles
- Keep the tone professional yet warm
- Focus on reducing decision paralysis and building confidence

Format your response as:
**Reflection Question:** [question]

**Reframe:** [reframe paragraph]

**Mindset Shift:** [quote or insight]`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a wise decision-making coach who helps people make clearer, more confident decisions. You provide thoughtful insights without being prescriptive.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const insight = completion.choices[0]?.message?.content

    if (!insight) {
      return NextResponse.json({ error: 'Failed to generate insight' }, { status: 500 })
    }

    return NextResponse.json({ insight })

  } catch (error) {
    console.error('OpenAI API error:', error)

    // Return a fallback insight if OpenAI fails
    const fallbackInsights = [
      {
        question: "What would your future self thank you for?",
        reframe: "This decision isn't just about now—it's about the person you're becoming. Both paths have merit, but which aligns better with your long-term vision?",
        quote: "The best time to make a decision was yesterday. The second best time is now."
      },
      {
        question: "What would happen if you chose based on growth over comfort?",
        reframe: "Fear often disguises itself as rational thinking. Consider whether your hesitation comes from genuine concerns or from avoiding the unfamiliar.",
        quote: "Comfort is the enemy of progress. Sometimes the scariest path leads to the most beautiful destinations."
      },
      {
        question: "What advice would you give your best friend in this situation?",
        reframe: "We often see our own situations as more complex than they are. Step back and view this with the same clarity you'd offer someone you care about.",
        quote: "Trust yourself. You know more than you think you do."
      }
    ]
    
    const fallback = fallbackInsights[Math.floor(Math.random() * fallbackInsights.length)]
    const fallbackText = `**Reflection Question:** ${fallback.question}

**Reframe:** ${fallback.reframe}

**Mindset Shift:** ${fallback.quote}`

    return NextResponse.json({ insight: fallbackText })
  }
}

function getEmotionLabel(score: number): string {
  const labels = {
    1: 'Stressed',
    2: 'Worried', 
    3: 'Uncertain',
    4: 'Hopeful',
    5: 'Confident'
  }
  return labels[score as keyof typeof labels] || 'Uncertain'
}