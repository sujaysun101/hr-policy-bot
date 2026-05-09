import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { question, policies } = await req.json();
  const policiesContext = policies ? `\n\nCompany policies provided:\n${policies}` : "";
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are an expert HR policy assistant. Answer the following employee question clearly and accurately based on standard HR best practices and any company policies provided.${policiesContext}\n\nEmployee question: ${question}\n\nProvide a helpful, professional answer. Return JSON with: {"answer": "your detailed answer here", "followUpQuestions": ["optional follow-up Q1", "optional follow-up Q2"]}`,
      },
    ],
  });
  const content = message.content[0];
  if (content.type !== "text") return NextResponse.json({ error: "No response" }, { status: 500 });
  try {
    const text = content.text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return NextResponse.json(JSON.parse(jsonMatch[0]));
    return NextResponse.json({ answer: text, followUpQuestions: [] });
  } catch {
    return NextResponse.json({ answer: content.text, followUpQuestions: [] });
  }
}
