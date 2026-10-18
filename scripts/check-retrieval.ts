import { buildDemoDataset, DEMO_ORG_ID } from "../src/lib/seed/demo"
import { searchCorpus } from "../src/lib/retrieval/search"
import { composeGrounded } from "../src/lib/ai/grounded"

const data = buildDemoDataset(DEMO_ORG_ID)
const queries = [
  "How many vacation days do I get?",
  "What is the parental leave policy?",
  "Do I need a receipt for a $40 team lunch?",
  "Can I bring my dog to the studio on Fridays?",
  "Do we get stock options or an equity refresh?",
  "Is there paid volunteer time?",
  "Can I wear a campaign button on a retail shift?",
  "Does Cedar & Pine offer a fertility or IVF benefit?",
  "Is there a relocation package if I move to Bend?",
  "Do we offer a sabbatical after five years?",
  "Is there any help for biking to the studio?",
  "Can I bring a friend to the studio for lunch?",
  "What is the 401(k) match?",
  "Can I work from California for a few weeks?",
  "How does sick time work?",
]

let failed = 0
for (const query of queries) {
  const hits = searchCorpus(data.chunks, data.knowledge, query).slice(0, 3)
  const answer = composeGrounded(query, hits, false)
  const top = hits[0]
  console.log(
    `\n${answer.suggestAskHr ? "ESCALATE" : "ANSWER"} ${answer.confidence} | ${query}\n  -> ${top ? `${top.score.toFixed(2)} ${top.sectionNumber} ${top.sectionTitle} answerable=${top.answerable}` : "none"}`,
  )
  console.log(`  ${answer.content.slice(0, 180)}`)
}

const open = data.questions.filter((question) => question.status === "open")
const gaps = data.gaps.filter((gap) => gap.status === "suggested")
console.log(`\nopen queue ${open.length}: ${open.map((question) => question.topic).join(" | ")}`)
console.log(`gaps ${gaps.length}: ${gaps.map((gap) => gap.topic).join(" | ")}`)
console.log(`asks ${data.asks.length} handbook ${data.asks.filter((ask) => ask.outcome === "handbook").length}`)

if (open.length < 4) {
  console.error("Expected several open HR questions")
  failed += 1
}
if (gaps.length < 4) {
  console.error("Expected several policy gaps")
  failed += 1
}
const pto = composeGrounded("How many vacation days do I get?", searchCorpus(data.chunks, data.knowledge, "How many vacation days do I get?"), false)
if (pto.suggestAskHr || !pto.content.includes("18 days")) {
  console.error("PTO answer missed 18 days", pto.content)
  failed += 1
}
const dog = composeGrounded("Can I bring my dog to the studio on Fridays?", searchCorpus(data.chunks, data.knowledge, "Can I bring my dog to the studio on Fridays?"), false)
if (!dog.suggestAskHr) {
  console.error("Dog question should escalate", dog.content)
  failed += 1
}

if (failed) process.exit(1)
console.log("\nretrieval checks passed")
