-- Polls: one row per poll (title, description, active, start/end, creator, optional settings)
CREATE TABLE polls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    settings JSONB,
    CONSTRAINT fk_polls_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_polls_created_by ON polls(created_by);
CREATE INDEX IF NOT EXISTS idx_polls_active_schedule ON polls(is_active, starts_at, ends_at);

-- Questions: one row per question in a poll (type, title, required, allow_multiple, sort_order, settings)
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(1000) NOT NULL,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    allow_multiple BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0,
    settings JSONB,
    CONSTRAINT fk_questions_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_poll_sort ON questions(poll_id, sort_order);

-- Options: one row per choice/rating option (question_id, type, text/image/numeric, sort_order, weight)
CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    text_content VARCHAR(1000),
    image_url VARCHAR(2000),
    numeric_value NUMERIC(20, 4),
    sort_order INT NOT NULL DEFAULT 0,
    weight NUMERIC(20, 4),
    CONSTRAINT fk_options_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_options_question_sort ON options(question_id, sort_order);

-- Responses: one submission per user (or anonymous) per poll
CREATE TABLE responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    poll_id UUID NOT NULL,
    user_id UUID,
    anonymous_id VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_responses_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
    CONSTRAINT fk_responses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_responses_identifier CHECK (
        (user_id IS NOT NULL AND anonymous_id IS NULL) OR (user_id IS NULL AND anonymous_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_poll_user ON responses(poll_id, user_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_responses_poll_anonymous ON responses(poll_id, anonymous_id) WHERE anonymous_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_responses_poll ON responses(poll_id);
CREATE INDEX IF NOT EXISTS idx_responses_user ON responses(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_responses_created_at ON responses(created_at);

-- Answers: one row per answer slot (option, text, numeric, or ranking position)
CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL,
    question_id UUID NOT NULL,
    option_id UUID,
    text_value TEXT,
    numeric_value NUMERIC(20, 4),
    position INT,
    CONSTRAINT fk_answers_response FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    CONSTRAINT fk_answers_option FOREIGN KEY (option_id) REFERENCES options(id) ON DELETE CASCADE,
    CONSTRAINT chk_answers_value CHECK (
        option_id IS NOT NULL OR text_value IS NOT NULL OR numeric_value IS NOT NULL
    )
);

CREATE INDEX IF NOT EXISTS idx_answers_response ON answers(response_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_option ON answers(option_id);
