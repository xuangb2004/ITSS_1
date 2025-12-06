-- Create database
CREATE DATABASE elearning_platform;

-- Move to database
\c elearning_platform;

-- Users
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'admin')) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructors
CREATE TABLE instructors (
    instructor_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    bio TEXT,
    expertise VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories: Chủ đề chính của một khóa học
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

-- Courses
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    instructor_id INT REFERENCES instructors(instructor_id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(20) CHECK (level IN ('beginner','intermediate','advanced')) DEFAULT 'beginner',
    price NUMERIC(10,2) DEFAULT 0,
    thumbnail TEXT,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags: Nhãn cho khóa học, một khóa học có thể có nhiều nhãn
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

-- Liên kết N-N giữa course và tag
CREATE TABLE course_tags (
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, tag_id)
);

-- Lessons
CREATE TABLE lessons (
    lesson_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    video_url TEXT,
    position INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enrollments
CREATE TABLE enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    progress INT DEFAULT 0,
    UNIQUE (user_id, course_id)
);

-- Lesson progress
CREATE TABLE lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    lesson_id INT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    last_watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    watched_duration INT DEFAULT 0, -- minutes watched, users know when to continue
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE (user_id, lesson_id)
);

-- Payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lesson Comments
CREATE TABLE lesson_comments (
    comment_id SERIAL PRIMARY KEY,
    lesson_id INT REFERENCES lessons(lesson_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INT CHECK (rating BETWEEN 0 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Instructor Comments
CREATE TABLE instructor_comments (
    comment_id SERIAL PRIMARY KEY,
    instructor_id INT REFERENCES instructors(instructor_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Topics
CREATE TABLE forum_topics (
    topic_id SERIAL PRIMARY KEY,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forum Posts
CREATE TABLE forum_posts (
    post_id SERIAL PRIMARY KEY,
    topic_id INT REFERENCES forum_topics(topic_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
    notification_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index

-- Users
CREATE INDEX idx_users_email ON users(email);

-- Courses
CREATE INDEX idx_courses_instructor ON courses(instructor_id);

-- Lessons
CREATE INDEX idx_lessons_course ON lessons(course_id);
CREATE INDEX idx_lessons_position ON lessons(course_id, position);

-- Enrollments
CREATE INDEX idx_enrollments_user ON enrollments(user_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);

-- Lesson Progress
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);

-- Forum
CREATE INDEX idx_forum_topics_course ON forum_topics(course_id);
CREATE INDEX idx_forum_posts_topic ON forum_posts(topic_id);

-- Notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Index phục vụ tìm kiếm khóa học theo từ khóa
CREATE INDEX idx_courses_ft
ON courses USING GIN(to_tsvector('simple', title || ' ' || description));

-- Index phục vụ tìm kiếm giáo viên
CREATE INDEX idx_instructors_name_ft
ON instructors USING GIN(to_tsvector('simple', name));

-- Index cho course và category
CREATE INDEX idx_courses_category ON courses(category_id);

-- Index cho course và level
CREATE INDEX idx_courses_level ON courses(level);

-- Index cho course và price
CREATE INDEX idx_courses_price ON courses(price);

-- Index cho tag
CREATE INDEX idx_course_tags ON course_tags(tag_id);

-- Tính enrollments hỗ trợ sắp xếp theo phổ biến
CREATE VIEW course_popularity AS
SELECT course_id, COUNT(*) AS enroll_count
FROM enrollments
GROUP BY course_id;





