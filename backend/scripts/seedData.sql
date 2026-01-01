USE elearning_platform;

-- Clear tables (safe when dev only)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE forum_post_likes;
TRUNCATE TABLE forum_posts;
TRUNCATE TABLE forum_topics;
TRUNCATE TABLE instructor_comments;
TRUNCATE TABLE lesson_comments;
TRUNCATE TABLE payments;
TRUNCATE TABLE lesson_progress;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE lessons;
TRUNCATE TABLE course_tags;
TRUNCATE TABLE tags;
TRUNCATE TABLE courses;
TRUNCATE TABLE categories;
TRUNCATE TABLE instructors;
TRUNCATE TABLE users;
TRUNCATE TABLE cart;
SET FOREIGN_KEY_CHECKS = 1;

-- Users
INSERT INTO users (user_id, name, email, password_hash, role, avatar_url)
VALUES
 (1, 'Alice Nguyen', 'alice@example.com', 'password-hash-placeholder', 'student', NULL),
 (2, 'Bob Tran', 'bob@example.com', 'password-hash-placeholder', 'instructor', NULL),
 (3, 'Carol Le', 'carol@example.com', 'password-hash-placeholder', 'instructor', NULL),
 (4, 'Admin', 'admin@example.com', 'password-hash-placeholder', 'admin', NULL);

-- Instructors (link to users)
INSERT INTO instructors (instructor_id, user_id, bio, expertise)
VALUES
 (1, 2, 'Senior Web Developer with 8 years experience', 'JavaScript, React, Node.js'),
 (2, 3, 'Data Scientist and ML Engineer', 'Python, ML, Data Analysis');

-- Categories
INSERT INTO categories (category_id, name) VALUES
 (1, 'Programming'),
 (2, 'Data Science'),
 (3, 'Design');

-- Tags
INSERT INTO tags (tag_id, name) VALUES
 (1, 'javascript'),
 (2, 'react'),
 (3, 'nodejs'),
 (4, 'python'),
 (5, 'machine-learning'),
 (6, 'ui-ux');

-- Courses
INSERT INTO courses (course_id, instructor_id, title, description, level, price, thumbnail, category_id)
VALUES
 (1, 1, 'JavaScript Basics', 'Learn JavaScript fundamentals: variables, functions, DOM.', 'beginner', 0.00, '/uploads/thumb_js_basics.jpg', 1),
 (2, 1, 'React for Beginners', 'Build reactive UIs with React and hooks.', 'beginner', 29.99, '/uploads/thumb_react.jpg', 1),
 (3, 2, 'Intro to Python for Data Science', 'Python basics and data handling with pandas.', 'beginner', 19.99, '/uploads/thumb_python.jpg', 2),
 (4, 2, 'Machine Learning 101', 'Supervised learning, basic algorithms and workflows.', 'intermediate', 49.99, '/uploads/thumb_ml.jpg', 2);

-- Course <-> Tag relationships
INSERT INTO course_tags (course_id, tag_id) VALUES
 (1, 1), -- js
 (1, 3), -- nodejs
 (2, 1), -- js
 (2, 2), -- react
 (3, 4), -- python
 (3, 5), -- ml (optional)
 (4, 4),
 (4, 5);

-- Lessons
INSERT INTO lessons (lesson_id, course_id, title, content, video_url, position)
VALUES
 (1, 1, 'Variables & Types', 'Intro to variables', 'https://example.com/video1.mp4', 1),
 (2, 1, 'Functions', 'Function basics', 'https://example.com/video2.mp4', 2),
 (3, 2, 'React Components', 'Components & props', 'https://example.com/video3.mp4', 1),
 (4, 3, 'Python Syntax', 'Python basic syntax', 'https://example.com/video4.mp4', 1),
 (5, 4, 'Supervised Learning', 'Overview of supervised methods', 'https://example.com/video5.mp4', 1);

-- Enrollments (so course_popularity view will show counts)
INSERT INTO enrollments (enrollment_id, user_id, course_id)
VALUES
 (1, 1, 1),
 (2, 1, 2),
 (3, 1, 3),
 (4, 4, 2),
 (5, 4, 4);

-- Lesson progress (example)
INSERT INTO lesson_progress (id, user_id, lesson_id, watched_duration, is_completed)
VALUES
 (1, 1, 1, 120, TRUE),
 (2, 1, 2, 30, FALSE);

-- Forum topics & posts (optional)
INSERT INTO forum_topics (topic_id, course_id, user_id, title) VALUES
 (1, 1, 1, 'Question about Variables');

INSERT INTO forum_posts (post_id, topic_id, user_id, content) VALUES
 (1, 1, 2, 'Great question — check the examples in lesson 1.');

-- Notifications (optional)
INSERT INTO notifications (notification_id, user_id, title, message)
VALUES
 (1, 1, 'Welcome', 'Welcome to the platform!');

-- Ensure course_popularity view is refreshed automatically (it's a view so no action needed)