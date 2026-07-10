-- The Kadawala Collection — Neon Postgres schema
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  wing TEXT NOT NULL,
  color TEXT NOT NULL,
  color_name TEXT NOT NULL,
  ordinal INT NOT NULL,
  blurb TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS pieces (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category_slug TEXT NOT NULL REFERENCES categories(slug) ON DELETE CASCADE,
  year INT NOT NULL,
  year_is_placeholder BOOLEAN NOT NULL DEFAULT TRUE,
  image TEXT NOT NULL,
  catalog_no TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  description_is_placeholder BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS code_projects (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  tech TEXT[] NOT NULL DEFAULT '{}',
  github TEXT NOT NULL DEFAULT '',
  live TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  ordinal INT NOT NULL
);

CREATE TABLE IF NOT EXISTS museum (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  about TEXT NOT NULL,
  contact TEXT NOT NULL
);
