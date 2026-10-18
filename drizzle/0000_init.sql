CREATE TABLE IF NOT EXISTS orgs (
  id text PRIMARY KEY,
  name text NOT NULL,
  created_at text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS handbooks (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  title text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL,
  status text NOT NULL,
  chunk_count integer NOT NULL DEFAULT 0,
  uploaded_by text NOT NULL,
  uploaded_by_name text NOT NULL,
  created_at text NOT NULL,
  sample boolean NOT NULL DEFAULT false
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS handbooks_org_idx ON handbooks (org_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS chunks (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  handbook_id text NOT NULL,
  handbook_title text NOT NULL,
  section_number text NOT NULL,
  section_title text NOT NULL,
  content text NOT NULL,
  page integer NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS chunks_org_idx ON chunks (org_id);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS chunks_handbook_idx ON chunks (handbook_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  topic text NOT NULL,
  source_question_id text,
  created_by_name text NOT NULL,
  created_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS knowledge_org_idx ON knowledge_entries (org_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS conversations (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  title text NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS conversations_org_user_idx ON conversations (org_id, user_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS messages (
  id text PRIMARY KEY,
  conversation_id text NOT NULL,
  org_id text NOT NULL,
  role text NOT NULL,
  content text NOT NULL,
  citations jsonb NOT NULL,
  confidence text,
  suggest_ask_hr boolean NOT NULL DEFAULT false,
  sample boolean NOT NULL DEFAULT false,
  question_id text,
  created_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS messages_conversation_idx ON messages (conversation_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS hr_questions (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  asked_by_user_id text NOT NULL,
  asked_by_name text NOT NULL,
  question text NOT NULL,
  conversation_id text,
  message_id text,
  status text NOT NULL,
  answer text,
  answered_by_name text,
  answered_at text,
  added_to_kb boolean NOT NULL DEFAULT false,
  topic text NOT NULL,
  closest_section text,
  created_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS hr_questions_org_idx ON hr_questions (org_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS policy_gaps (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  topic text NOT NULL,
  summary text NOT NULL,
  question_count integer NOT NULL DEFAULT 1,
  sample_questions jsonb NOT NULL,
  status text NOT NULL,
  suggested_outline text NOT NULL,
  updated_at text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS policy_gaps_org_idx ON policy_gaps (org_id);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS asks (
  id text PRIMARY KEY,
  org_id text NOT NULL,
  user_id text NOT NULL,
  user_name text NOT NULL,
  question text NOT NULL,
  created_at text NOT NULL,
  outcome text NOT NULL,
  section_title text,
  conversation_id text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS asks_org_idx ON asks (org_id);
