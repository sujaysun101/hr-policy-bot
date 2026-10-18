export type TopicMatch = {
  topic: string
  summary: string
  outline: string
}

const TOPICS: { pattern: RegExp; topic: string; summary: string; outline: string }[] = [
  {
    pattern: /\b(dog|dogs|cat|cats|pet|pets|animal|puppy|kennel)\b/i,
    topic: "Animals in the workplace",
    summary: "People are asking whether animals can come to the studio or the warehouse. The handbook never mentions pets.",
    outline:
      "Add a section under Conduct. State whether animals are allowed in the studio, the warehouse, and retail, any exception for service animals, and who approves a one-day visit.",
  },
  {
    pattern: /\b(equity|stock options?|rsus?|shares|option pool|equity refresh)\b/i,
    topic: "Equity compensation",
    summary: "Employees are asking about ownership. The handbook explains the 401(k) and does not mention stock, options, or refreshes.",
    outline:
      "Add a section under Pay. Say plainly whether Cedar & Pine grants equity. If it does not, say so, and point people to the 401(k) match in section 6.2 so the two are not confused.",
  },
  {
    pattern: /\b(political|campaign|election|partisan)\b/i,
    topic: "Political expression at work",
    summary: "People are asking what they can wear or display about campaigns while they are working.",
    outline:
      "Add a short section under Conduct. Cover buttons, posters, and customer-facing shifts. Protect the right to discuss working conditions, and separate that from speaking for the brand.",
  },
  {
    pattern: /\b(volunteer|volunteering|vto)\b/i,
    topic: "Volunteer time",
    summary: "Employees are asking for paid time to volunteer. PTO and sick time do not mention community service.",
    outline:
      "Decide whether to offer paid volunteer time, how many hours a year, how far ahead it is requested, and whether a nonprofit has to be approved.",
  },
  {
    pattern: /\b(fertility|ivf|egg freezing|adoption assistance)\b/i,
    topic: "Fertility and family-building benefits",
    summary: "Parental leave is documented. Fertility treatment, IVF, and adoption assistance are not.",
    outline:
      "Add a benefits subsection that either describes a family-building benefit or states that the medical plan is the only coverage and names where to read the plan booklet.",
  },
  {
    pattern: /\b(relocation|relocate|moving stipend|move to bend|moving expenses)\b/i,
    topic: "Relocation assistance",
    summary: "People are asking whether a move to Bend, or a move for the job, is paid for. Travel reimbursement is not a relocation policy.",
    outline:
      "Add a section under Pay. State whether moving costs are covered, any cap, which receipts are required, and that a move between approved remote states is or is not included.",
  },
  {
    pattern: /\bsabbatical\b/i,
    topic: "Sabbatical leave",
    summary: "Someone is asking for a sabbatical. Unpaid personal leave caps at 30 days and is not described as a sabbatical.",
    outline:
      "Either add a sabbatical section with tenure, length, pay, and how the role is covered, or add one sentence to section 4.7 that Cedar & Pine does not offer sabbaticals.",
  },
]

export function classifyTopic(question: string): TopicMatch {
  for (const topic of TOPICS) {
    if (topic.pattern.test(question)) {
      return { topic: topic.topic, summary: topic.summary, outline: topic.outline }
    }
  }
  const words = question
    .replace(/[?!.]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 6)
  const topic = words.length > 0 ? words.join(" ") : "Uncategorized question"
  return {
    topic,
    summary: "Employees asked about this, and Liam could not find a handbook section that answers it.",
    outline: `Draft a short handbook section that answers: "${question}" Name who approves exceptions and when it takes effect.`,
  }
}
