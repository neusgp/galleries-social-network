DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS chat_messages;
DROP TABLE IF EXISTS friendships;
DROP TABLE IF EXISTS password_reset_codes;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    first      VARCHAR(15) NOT NULL CHECK (first ~* '^[a-z ]*$'),
    last       VARCHAR(15) NOT NULL CHECK (last ~* '^[a-z ]*$'),
    email           VARCHAR(40) NOT NULL UNIQUE,
    profile_picture_url TEXT DEFAULT ('https://mywatercolorimageboard.s3.eu-central-1.amazonaws.com/user.png'),
    profile_picture_key TEXT,
    city            TEXT,
    bio             TEXT,
    password_hash   VARCHAR NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE password_reset_codes (
    id              SERIAL PRIMARY KEY,
    code            VARCHAR(6) NOT NULL,
    email           VARCHAR(50) NOT NULL,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships(
  id SERIAL PRIMARY KEY,
  sender_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL ,
  recipient_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  accepted BOOLEAN DEFAULT false
);

CREATE TABLE chat_messages (
    id              SERIAL PRIMARY KEY,
    sender_id       INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    text            TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE artworks (
id SERIAL PRIMARY KEY,
user_id INT REFERENCES users(id) ON DELETE CASCADE NOT NULL,
artwork_id TEXT,
url     TEXT,
title   TEXT,
artist  TEXT,
date    TEXT,
description TEXT,
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
);