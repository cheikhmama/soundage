-- Ensure a seed admin user exists (for created_by on poll)
INSERT INTO users (name, last_name, email, password, role_id, enabled)
SELECT 'Admin', 'Seed', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', r.id, true
FROM roles r
WHERE r.name = 'ADMIN'
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@example.com')
LIMIT 1;

-- Insert example poll (created_by = seed admin)
INSERT INTO polls (title, description, is_active, starts_at, ends_at, created_by)
SELECT 'Product feedback 2025', 'Sample survey for testing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '7 days', u.id
FROM users u
WHERE u.email = 'admin@example.com'
LIMIT 1;

-- Insert questions (same poll) — one INSERT per row to avoid Flyway splitting on UNION
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'single_choice', 'How did you hear about us?', true, false, 0 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'multiple_choice', 'Which features do you use?', true, true, 1 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'rating', 'Rate from 1 to 5', true, false, 2 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'text', 'Additional comments', false, false, 3 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'yes_no', 'Would you recommend us?', true, false, 4 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;
INSERT INTO questions (poll_id, type, title, is_required, allow_multiple, sort_order)
SELECT p.id, 'ranking', 'Order by preference', true, false, 5 FROM polls p WHERE p.title = 'Product feedback 2025' LIMIT 1;

-- Options for Q1 (single_choice): Search, Social, Friend
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Search', 0 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 0;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Social', 1 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 0;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Friend', 2 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 0;

-- Options for Q2 (multiple_choice): Reports, Export, API
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Reports', 0 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 1;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Export', 1 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 1;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'API', 2 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 1;

-- Options for Q3 (rating): 1, 2, 3, 4, 5
INSERT INTO options (question_id, type, numeric_value, sort_order)
SELECT q.id, 'NUMERIC', 1, 0 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 2;
INSERT INTO options (question_id, type, numeric_value, sort_order)
SELECT q.id, 'NUMERIC', 2, 1 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 2;
INSERT INTO options (question_id, type, numeric_value, sort_order)
SELECT q.id, 'NUMERIC', 3, 2 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 2;
INSERT INTO options (question_id, type, numeric_value, sort_order)
SELECT q.id, 'NUMERIC', 4, 3 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 2;
INSERT INTO options (question_id, type, numeric_value, sort_order)
SELECT q.id, 'NUMERIC', 5, 4 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 2;

-- Options for Q4 (text): no options

-- Options for Q5 (yes_no): Yes, No
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Yes', 0 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 4;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'No', 1 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 4;

-- Options for Q6 (ranking): Price, Quality, Support
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Price', 0 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 5;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Quality', 1 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 5;
INSERT INTO options (question_id, type, text_content, sort_order)
SELECT q.id, 'TEXT', 'Support', 2 FROM questions q JOIN polls p ON q.poll_id = p.id WHERE p.title = 'Product feedback 2025' AND q.sort_order = 5;

-- Response A: authenticated user (admin@example.com)
INSERT INTO responses (poll_id, user_id, anonymous_id)
SELECT p.id, u.id, NULL
FROM polls p, users u
WHERE p.title = 'Product feedback 2025' AND u.email = 'admin@example.com'
LIMIT 1;

-- Response B: anonymous
INSERT INTO responses (poll_id, user_id, anonymous_id)
SELECT p.id, NULL, 'sess_abc123'
FROM polls p
WHERE p.title = 'Product feedback 2025'
LIMIT 1;

-- Answers for Response A (admin user)
-- Q1 single_choice: Search (first option of Q1)
INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id ORDER BY o.sort_order LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 0
LIMIT 1;

-- Q2 multiple_choice: Reports, Export, API (all three options of Q2)
INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, o.id
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id JOIN options o ON o.question_id = q.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 1
LIMIT 3;

-- Q3 rating: option with numeric_value 4
INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id AND o.numeric_value = 4 LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 2
LIMIT 1;

-- Q4 text: "Great product"
INSERT INTO answers (response_id, question_id, text_value)
SELECT r.id, q.id, 'Great product'
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 3
LIMIT 1;

-- Q5 yes_no: Yes (first option of Q5)
INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id AND o.text_content = 'Yes' LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 4
LIMIT 1;

-- Q6 ranking: Price=1, Quality=2, Support=3
INSERT INTO answers (response_id, question_id, option_id, position)
SELECT r.id, q.id, o.id, (ROW_NUMBER() OVER (ORDER BY o.sort_order))::int
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id JOIN options o ON o.question_id = q.id
WHERE p.title = 'Product feedback 2025' AND r.user_id IS NOT NULL AND q.sort_order = 5;

-- Answers for Response B (anonymous): Q1 Social, Q2 Reports+API, Q3 rating 3, Q4 "Good", Q5 No, Q6 Quality=1, Price=2, Support=3
INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id AND o.text_content = 'Social' LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 0
LIMIT 1;

INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, o.id
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id JOIN options o ON o.question_id = q.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 1 AND o.text_content IN ('Reports', 'API');

INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id AND o.numeric_value = 3 LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 2
LIMIT 1;

INSERT INTO answers (response_id, question_id, text_value)
SELECT r.id, q.id, 'Good'
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 3
LIMIT 1;

INSERT INTO answers (response_id, question_id, option_id)
SELECT r.id, q.id, (SELECT o.id FROM options o WHERE o.question_id = q.id AND o.text_content = 'No' LIMIT 1)
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 4
LIMIT 1;

INSERT INTO answers (response_id, question_id, option_id, position)
SELECT r.id, q.id, o.id, CASE o.text_content WHEN 'Quality' THEN 1 WHEN 'Price' THEN 2 WHEN 'Support' THEN 3 END
FROM responses r JOIN polls p ON r.poll_id = p.id JOIN questions q ON q.poll_id = p.id JOIN options o ON o.question_id = q.id
WHERE p.title = 'Product feedback 2025' AND r.anonymous_id = 'sess_abc123' AND q.sort_order = 5 AND o.text_content IN ('Quality', 'Price', 'Support');
