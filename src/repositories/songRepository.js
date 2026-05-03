const pool = require('../config/db');

const getAllSongsWithAverages = async () => {
  const query = `
    SELECT 
      s.song_id, 
      s.title, 
      s.artist, 
      ROUND(AVG(gs.score_value), 2) AS average_score_numeric,
      COUNT(DISTINCT r.ranking_id) AS total_rankings,
      ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS tags
    FROM songs s
    LEFT JOIN rankings r ON s.song_id = r.song_id
    LEFT JOIN grade_scales gs ON r.grade = gs.grade
    LEFT JOIN song_tags st ON s.song_id = st.song_id
    LEFT JOIN tags t ON st.tag_id = t.tag_id
    GROUP BY s.song_id, s.title, s.artist
    ORDER BY average_score_numeric DESC NULLS LAST;
  `;
  const result = await pool.query(query);
  return result.rows;
};

const getSongDetails = async (songId) => {
  const query = `
    SELECT 
      s.song_id,
      s.title,
      s.artist,
      ARRAY_AGG(DISTINCT t.tag_name) FILTER (WHERE t.tag_name IS NOT NULL) AS tags,
      ARRAY_AGG(DISTINCT d.rec_source) FILTER (WHERE d.rec_source IS NOT NULL) AS discovered_from
    FROM songs s
    LEFT JOIN song_tags st ON s.song_id = st.song_id
    LEFT JOIN tags t ON st.tag_id = t.tag_id
    LEFT JOIN song_dis_sources sds ON s.song_id = sds.song_id
    LEFT JOIN discoveries d ON sds.rec_id = d.rec_id
    WHERE s.song_id = $1
    GROUP BY s.song_id, s.title, s.artist;
  `;
  const result = await pool.query(query, [songId]);
  return result.rows[0]; 
};

const getSongRankings = async (songId) => {
  const query = `
    SELECT u.username, r.grade
    FROM rankings r
    JOIN users u ON r.user_id = u.user_id
    WHERE r.song_id = $1;
  `;
  const result = await pool.query(query, [songId]);
  return result.rows;
};

const createSong = async (title, artist, tags = [], discoveredFrom = []) => {
  const client = await pool.connect(); 

  try {
    await client.query('BEGIN');

    const songRes = await client.query(
      'INSERT INTO songs (title, artist) VALUES ($1, $2) RETURNING song_id;',
      [title, artist]
    );
    const songId = songRes.rows[0].song_id;

    for (const tag of tags) {
      await client.query(
        'INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT (tag_name) DO NOTHING;',
        [tag]
      );
      const tagRes = await client.query('SELECT tag_id FROM tags WHERE tag_name = $1;', [tag]);
      const tagId = tagRes.rows[0].tag_id;
      
      await client.query(
        'INSERT INTO song_tags (song_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
        [songId, tagId]
      );
    }

    for (const source of discoveredFrom) {
      await client.query(
        'INSERT INTO discoveries (rec_source) VALUES ($1) ON CONFLICT (rec_source) DO NOTHING;',
        [source]
      );
      const sourceRes = await client.query('SELECT rec_id FROM discoveries WHERE rec_source = $1;', [source]);
      const sourceId = sourceRes.rows[0].rec_id;

      await client.query(
        'INSERT INTO song_dis_sources (song_id, rec_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;',
        [songId, sourceId]
      );
    }

    await client.query('COMMIT'); 
    return { song_id: songId, title, artist, tags, discovered_from: discoveredFrom };

  } catch (err) {
    await client.query('ROLLBACK'); 
    throw err;
  } finally {
    client.release(); 
  }
};

const updateSong = async (songId, title, artist, tags = [], discoveredFrom = []) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      'UPDATE songs SET title = $1, artist = $2 WHERE song_id = $3;',
      [title, artist, songId]
    );

    await client.query('DELETE FROM song_tags WHERE song_id = $1;', [songId]);
    await client.query('DELETE FROM song_dis_sources WHERE song_id = $1;', [songId]);

    for (const tag of tags) {
      await client.query('INSERT INTO tags (tag_name) VALUES ($1) ON CONFLICT DO NOTHING;', [tag]);
      const tagRes = await client.query('SELECT tag_id FROM tags WHERE tag_name = $1;', [tag]);
      await client.query('INSERT INTO song_tags (song_id, tag_id) VALUES ($1, $2);', [songId, tagRes.rows[0].tag_id]);
    }

    for (const source of discoveredFrom) {
      await client.query('INSERT INTO discoveries (rec_source) VALUES ($1) ON CONFLICT DO NOTHING;', [source]);
      const sourceRes = await client.query('SELECT rec_id FROM discoveries WHERE rec_source = $1;', [source]);
      await client.query('INSERT INTO song_dis_sources (song_id, rec_id) VALUES ($1, $2);', [songId, sourceRes.rows[0].rec_id]);
    }

    await client.query('COMMIT');
    return { song_id: songId, title, artist, tags, discovered_from: discoveredFrom };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteSong = async (songId) => {
  const query = 'DELETE FROM songs WHERE song_id = $1 RETURNING *;';
  const result = await pool.query(query, [songId]);
  return result.rows[0];
};

module.exports = {
  getAllSongsWithAverages,
  getSongDetails,
  getSongRankings,
  createSong,
  updateSong,
  deleteSong
};