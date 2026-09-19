-- DebugMind AI - Database Schema (PostgreSQL)

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    root_path TEXT,
    language VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analyses (
    id VARCHAR(64) PRIMARY KEY,
    project_id VARCHAR(64) REFERENCES projects(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    health_score INTEGER NOT NULL,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS issues (
    id VARCHAR(64) PRIMARY KEY,
    analysis_id VARCHAR(64) REFERENCES analyses(id) ON DELETE CASCADE,
    issue_code VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    start_line INTEGER NOT NULL,
    end_line INTEGER NOT NULL,
    start_column INTEGER,
    end_column INTEGER,
    explanation TEXT,
    suggested_fix TEXT,
    confidence NUMERIC(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fixes (
    id VARCHAR(64) PRIMARY KEY,
    issue_id VARCHAR(64) REFERENCES issues(id) ON DELETE CASCADE,
    description TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    edits_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(64) PRIMARY KEY,
    fix_id VARCHAR(64) REFERENCES fixes(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    passed_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    compile_success BOOLEAN DEFAULT FALSE,
    output_log TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issues_analysis_id ON issues(analysis_id);
CREATE INDEX IF NOT EXISTS idx_fixes_issue_id ON fixes(issue_id);
