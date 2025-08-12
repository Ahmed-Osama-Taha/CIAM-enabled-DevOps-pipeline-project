CREATE DATABASE feedback;

\c feedback;

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    text TEXT
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    user_id VARCHAR(255),
    username VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);