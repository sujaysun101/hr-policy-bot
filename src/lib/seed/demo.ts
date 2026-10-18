import { composeGrounded } from "@/lib/ai/grounded"
import { classifyTopic } from "@/lib/retrieval/topics"
import { searchCorpus } from "@/lib/retrieval/search"
import { HANDBOOK_SECTIONS, SAMPLE_HANDBOOK_FILE, SAMPLE_HANDBOOK_TITLE } from "@/lib/seed/handbook"
import type { Ask, Chunk, Conversation, GapStatus, Handbook, HrQuestion, KnowledgeEntry, Message, PolicyGap } from "@/lib/types"

export const DEMO_ORG_ID = "org_cedar_pine"
export const DEMO_ORG_NAME = "Cedar & Pine"

export const DEMO_PEOPLE = [
  { id: "user_avery", name: "Avery Chen", title: "People Lead" },
  { id: "user_jordan", name: "Jordan Hale", title: "E-commerce" },
  { id: "user_priya", name: "Priya Shah", title: "Product design" },
  { id: "user_mateo", name: "Mateo Ruiz", title: "Wholesale" },
  { id: "user_lila", name: "Lila Nguyen", title: "Customer care" },
  { id: "user_evan", name: "Evan Brooks", title: "Studio manager" },
  { id: "user_leo", name: "Leo Berg", title: "Web" },
  { id: "user_nadia", name: "Nadia Petrov", title: "Design" },
  { id: "user_theo", name: "Theo Lang", title: "Retail" },
  { id: "user_sam", name: "Sam Okonkwo", title: "Operations" },
] as const

type Plan = {
  personId: string
  daysAgo: number
  hour: number
  question: string
  /** Historical questions HR already answered into the knowledge base. */
  knowledge?: { topic: string; answer: string }
}

const PLANS: Plan[] = [
  { personId: "user_jordan", daysAgo: 28, hour: 9, question: "How many vacation days do I get?" },
  { personId: "user_priya", daysAgo: 27, hour: 11, question: "When can I start using paid time off?" },
  { personId: "user_mateo", daysAgo: 26, hour: 14, question: "What holidays does Cedar & Pine close for?" },
  { personId: "user_lila", daysAgo: 24, hour: 10, question: "How does sick time work, and does it roll over?" },
  { personId: "user_sam", daysAgo: 23, hour: 16, question: "How long is parental leave if I am the birthing parent?" },
  { personId: "user_leo", daysAgo: 22, hour: 9, question: "Which days are we expected in the studio?" },
  { personId: "user_nadia", daysAgo: 21, hour: 13, question: "Can I work from California for a few weeks?" },
  { personId: "user_theo", daysAgo: 20, hour: 15, question: "Do I need a receipt for a $40 team lunch?" },
  { personId: "user_jordan", daysAgo: 19, hour: 10, question: "When do we get paid?" },
  { personId: "user_priya", daysAgo: 17, hour: 11, question: "What is the 401(k) match?" },
  { personId: "user_evan", daysAgo: 16, hour: 8, question: "Is there any help for biking to the studio?", knowledge: {
    topic: "Bike commuting",
    answer:
      "Cedar & Pine reimburses up to $20 a month for bike maintenance if you commute to the Bend studio at least four days that month. Submit the shop receipt in the expense tool. This is not in the handbook PDF yet. Avery Chen added it on March 4, 2026.",
  } },
  { personId: "user_mateo", daysAgo: 15, hour: 14, question: "What is the learning stipend, and can it pay for a conference?" },
  { personId: "user_lila", daysAgo: 14, hour: 9, question: "Can I bring a friend to the studio for lunch?", knowledge: {
    topic: "Studio guests",
    answer:
      "A teammate may host one guest for lunch in the studio kitchen. Guests do not go onto the warehouse floor, and they do not stay past 1:30 p.m. Tell the studio manager that morning. Overnight guests are not allowed.",
  } },
  { personId: "user_sam", daysAgo: 13, hour: 15, question: "How many bereavement days do I get if a parent dies?" },
  { personId: "user_leo", daysAgo: 12, hour: 10, question: "What is the introductory period?" },
  { personId: "user_nadia", daysAgo: 10, hour: 11, question: "How do I report harassment?" },
  { personId: "user_theo", daysAgo: 9, hour: 16, question: "Do hourly people get overtime after 40 hours?" },
  { personId: "user_jordan", daysAgo: 8, hour: 9, question: "What happens to my laptop if I resign?" },
  { personId: "user_priya", daysAgo: 7, hour: 13, question: "Does the secondary parent get paid parental leave too?" },
  { personId: "user_mateo", daysAgo: 6, hour: 10, question: "Can I carry unused vacation into next year?" },
  { personId: "user_sam", daysAgo: 5, hour: 15, question: "What is the meal break rule on a shipping shift?" },
  { personId: "user_lila", daysAgo: 4, hour: 9, question: "Are we paid if the studio closes for snow?" },
  { personId: "user_evan", daysAgo: 3, hour: 8, question: "Can I bring my dog to the studio on Fridays?" },
  { personId: "user_nadia", daysAgo: 3, hour: 14, question: "Do we get stock options or an equity refresh?" },
  { personId: "user_leo", daysAgo: 2, hour: 11, question: "Is there paid volunteer time?" },
  { personId: "user_theo", daysAgo: 2, hour: 16, question: "Can I wear a campaign button on a retail shift?" },
  { personId: "user_jordan", daysAgo: 1, hour: 10, question: "Does Cedar & Pine offer a fertility or IVF benefit?" },
  { personId: "user_priya", daysAgo: 1, hour: 15, question: "Do we offer a sabbatical after five years?" },
  { personId: "user_mateo", daysAgo: 0, hour: 9, question: "How much is the wellness stipend?" },
  { personId: "user_avery", daysAgo: 0, hour: 11, question: "How many vacation days do full-time employees receive?" },
]

function atDaysAgo(now: Date, daysAgo: number, hour: number): string {
  const date = new Date(now)
  date.setDate(date.getDate() - daysAgo)
  date.setHours(hour, 12, 0, 0)
  return date.toISOString()
}

function person(id: string) {
  const found = DEMO_PEOPLE.find((item) => item.id === id)
  if (!found) throw new Error(`Unknown demo person ${id}`)
  return found
}

export type DemoDataset = {
  handbook: Handbook
  chunks: Chunk[]
  knowledge: KnowledgeEntry[]
  conversations: Conversation[]
  messages: Message[]
  questions: HrQuestion[]
  gaps: PolicyGap[]
  asks: Ask[]
}

export function buildDemoDataset(orgId: string, now = new Date()): DemoDataset {
  const createdAt = atDaysAgo(now, 40, 9)
  const handbookId = `hb_${orgId}_2026`
  const handbook: Handbook = {
    id: handbookId,
    orgId,
    title: SAMPLE_HANDBOOK_TITLE,
    fileName: SAMPLE_HANDBOOK_FILE,
    mimeType: "application/pdf",
    status: "ready",
    chunkCount: HANDBOOK_SECTIONS.length,
    uploadedBy: "user_avery",
    uploadedByName: "Avery Chen",
    createdAt,
    sample: true,
  }
  const chunks: Chunk[] = HANDBOOK_SECTIONS.map((section, index) => ({
    id: `chk_${orgId}_${index + 1}`,
    orgId,
    handbookId,
    handbookTitle: handbook.title,
    sectionNumber: section.sectionNumber,
    sectionTitle: section.sectionTitle,
    content: section.content,
    page: section.page,
  }))

  const knowledge: KnowledgeEntry[] = []
  const conversations: Conversation[] = []
  const messages: Message[] = []
  const questions: HrQuestion[] = []
  const gaps: PolicyGap[] = []
  const asks: Ask[] = []

  PLANS.forEach((plan, index) => {
    const when = atDaysAgo(now, plan.daysAgo, plan.hour)
    if (plan.knowledge) {
      knowledge.push({
        id: `kb_${orgId}_${index + 1}`,
        orgId,
        question: plan.question,
        answer: plan.knowledge.answer,
        topic: plan.knowledge.topic,
        createdByName: "Avery Chen",
        createdAt: when,
      })
    }
  })

  PLANS.forEach((plan, index) => {
    const who = person(plan.personId)
    const when = atDaysAgo(now, plan.daysAgo, plan.hour)
    const hits = searchCorpus(chunks, knowledge, plan.question)
    const grounded = composeGrounded(plan.question, hits, false)
    const conversationId = `con_${orgId}_${index + 1}`
    const userMessageId = `msg_${orgId}_${index + 1}_u`
    const assistantMessageId = `msg_${orgId}_${index + 1}_a`
    const answeredAt = new Date(new Date(when).getTime() + 1000 * 60 * 18).toISOString()

    conversations.push({
      id: conversationId,
      orgId,
      userId: who.id,
      userName: who.name,
      title: plan.question,
      createdAt: when,
      updatedAt: answeredAt,
    })
    messages.push({
      id: userMessageId,
      conversationId,
      orgId,
      role: "user",
      content: plan.question,
      citations: [],
      suggestAskHr: false,
      sample: false,
      createdAt: when,
    })

    let questionId: string | undefined
    if (plan.knowledge) {
      const entry = knowledge.find((item) => item.question === plan.question)
      questionId = `hq_${orgId}_${index + 1}`
      questions.push({
        id: questionId,
        orgId,
        askedByUserId: who.id,
        askedByName: who.name,
        question: plan.question,
        conversationId,
        messageId: assistantMessageId,
        status: "answered",
        answer: plan.knowledge.answer,
        answeredByName: "Avery Chen",
        answeredAt,
        addedToKb: true,
        topic: plan.knowledge.topic,
        closestSection: grounded.closestSection,
        createdAt: when,
      })
      if (entry) entry.sourceQuestionId = questionId
    } else if (grounded.suggestAskHr) {
      const topic = classifyTopic(plan.question)
      questionId = `hq_${orgId}_${index + 1}`
      questions.push({
        id: questionId,
        orgId,
        askedByUserId: who.id,
        askedByName: who.name,
        question: plan.question,
        conversationId,
        messageId: assistantMessageId,
        status: "open",
        addedToKb: false,
        topic: topic.topic,
        closestSection: grounded.closestSection,
        createdAt: when,
      })
      const existing = gaps.find((gap) => gap.topic === topic.topic)
      if (existing) {
        existing.questionCount += 1
        if (!existing.sampleQuestions.includes(plan.question) && existing.sampleQuestions.length < 4) {
          existing.sampleQuestions.push(plan.question)
        }
        existing.updatedAt = when
      } else {
        gaps.push({
          id: `gap_${orgId}_${gaps.length + 1}`,
          orgId,
          topic: topic.topic,
          summary: topic.summary,
          questionCount: 1,
          sampleQuestions: [plan.question],
          status: "suggested" satisfies GapStatus,
          suggestedOutline: topic.outline,
          updatedAt: when,
        })
      }
    }

    messages.push({
      id: assistantMessageId,
      conversationId,
      orgId,
      role: "assistant",
      content: grounded.content,
      citations: grounded.citations,
      confidence: grounded.confidence,
      suggestAskHr: grounded.suggestAskHr && !plan.knowledge,
      sample: false,
      questionId,
      createdAt: answeredAt,
    })

    const outcome = plan.knowledge ? "escalated" : grounded.suggestAskHr ? "escalated" : grounded.citations[0]?.source === "knowledge" ? "knowledge" : "handbook"
    asks.push({
      id: `ask_${orgId}_${index + 1}`,
      orgId,
      userId: who.id,
      userName: who.name,
      question: plan.question,
      createdAt: when,
      outcome,
      sectionTitle: grounded.suggestAskHr ? undefined : grounded.closestSection,
      conversationId,
    })
  })

  return { handbook, chunks, knowledge, conversations, messages, questions, gaps, asks }
}
