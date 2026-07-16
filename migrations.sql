-- Enable pgvector extension for RAG vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Reports Metadata Table
CREATE TABLE IF NOT EXISTS hirac_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    ref_no VARCHAR(100) UNIQUE NOT NULL,
    department VARCHAR(100),
    location VARCHAR(255) NOT NULL,
    activity_assessed VARCHAR(255) NOT NULL,
    date_created DATE NOT NULL DEFAULT CURRENT_DATE,
    date_reviewed DATE,
    assessor_team TEXT NOT NULL,
    prepared_by_name VARCHAR(100),
    prepared_by_role VARCHAR(100),
    approved_by_name VARCHAR(100),
    approved_by_role VARCHAR(100),
    acknowledged_by_name VARCHAR(100),
    acknowledged_by_role VARCHAR(100),
    footer_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Report Rows (The actual table lines)
CREATE TABLE IF NOT EXISTS hirac_rows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES hirac_reports(id) ON DELETE CASCADE,
    row_order INT NOT NULL,
    operation_type TEXT NOT NULL,
    generic_hazard TEXT NOT NULL,
    risks TEXT NOT NULL,
    existing_defenses TEXT NOT NULL,
    initial_likelihood INT NOT NULL CHECK (initial_likelihood BETWEEN 1 AND 5),
    initial_severity INT NOT NULL CHECK (initial_severity BETWEEN 1 AND 5),
    initial_risk_score INT NOT NULL, -- L * S
    initial_risk_index VARCHAR(10) NOT NULL, -- 'Low', 'Medium', 'High'
    mitigating_actions TEXT NOT NULL,
    residual_likelihood INT NOT NULL CHECK (residual_likelihood BETWEEN 1 AND 5),
    residual_severity INT NOT NULL CHECK (residual_severity BETWEEN 1 AND 5),
    residual_risk_score INT NOT NULL, -- L * S
    residual_risk_index VARCHAR(10) NOT NULL, -- 'Low', 'Medium', 'High'
    remarks TEXT,
    target_date DATE,
    department_responsible VARCHAR(150),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Document Chunks Table (For RAG vector search)
CREATE TABLE IF NOT EXISTS safety_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(384), -- Vector dimensions for 384-dimensional embeddings (e.g. all-MiniLM-L6-v2)
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index for fast vector similarity search using Cosine Distance
CREATE INDEX IF NOT EXISTS safety_documents_embedding_idx ON safety_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- RPC Stored Procedure for Cosine Distance vector search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  document_name varchar,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    safety_documents.id,
    safety_documents.document_name,
    safety_documents.content,
    safety_documents.metadata,
    1 - (safety_documents.embedding <=> query_embedding) AS similarity
  FROM safety_documents
  WHERE 1 - (safety_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY safety_documents.embedding <=> query_embedding LIMIT match_count;
$$;

-- 4. User Profiles Table
CREATE TABLE IF NOT EXISTS safira_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    daily_limit INT DEFAULT 20, -- Default daily limit for testers
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. User AI Usage Rate Limiting Table
CREATE TABLE IF NOT EXISTS safira_user_usage (
    user_id UUID REFERENCES safira_users(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    request_count INT DEFAULT 1,
    PRIMARY KEY (user_id, usage_date)
);

-- Associate Reports with Users
ALTER TABLE hirac_reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES safira_users(id) ON DELETE CASCADE;
