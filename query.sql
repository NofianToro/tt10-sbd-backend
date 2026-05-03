CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE songs (
  song_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  artist VARCHAR(100)
);

CREATE TABLE tags (
  tag_id SERIAL PRIMARY KEY,
  tag_name VARCHAR(50) UNIQUE
);

CREATE TABLE discoveries (
  rec_id SERIAL PRIMARY KEY,
  rec_source VARCHAR(50) UNIQUE
);

CREATE TABLE grade_scales (
  grade VARCHAR(1) PRIMARY KEY,
  score_value INT NOT NULL
);

INSERT INTO grade_scales (grade, score_value) VALUES
  ('S', 6),
  ('A', 5),
  ('B', 4),
  ('C', 3),
  ('D', 2),
  ('E', 1),
  ('F', 0);

CREATE TABLE rankings (
  ranking_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
  song_id INT REFERENCES songs(song_id) ON DELETE CASCADE,
  grade VARCHAR(1) REFERENCES grade_scales(grade),
  UNIQUE(user_id, song_id)
);

CREATE TABLE song_tags (
  song_id INT REFERENCES songs(song_id) ON DELETE CASCADE,
  tag_id INT REFERENCES tags(tag_id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, tag_id)
);

CREATE TABLE song_dis_sources (
  song_id INT REFERENCES songs(song_id) ON DELETE CASCADE,
  rec_id INT REFERENCES discoveries(rec_id) ON DELETE CASCADE,
  PRIMARY KEY (song_id, rec_id)
);

ALTER TABLE users ADD COLUMN password VARCHAR(255);