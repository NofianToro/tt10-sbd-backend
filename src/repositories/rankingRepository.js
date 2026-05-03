const pool = require('../config/db');

const addRanking = async (userId, songId, grade) => {
  const query = `
    INSERT INTO rankings (user_id, song_id, grade) 
    VALUES ($1, $2, $3) 
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, songId, grade]);
  return result.rows[0];
};

const updateRanking = async (userId, songId, newGrade) => {
  const query = `
    UPDATE rankings 
    SET grade = $1 
    WHERE user_id = $2 AND song_id = $3 
    RETURNING *;
  `;
  const result = await pool.query(query, [newGrade, userId, songId]);
  return result.rows[0];
};

const deleteRanking = async (userId, songId) => {
  const query = `
    DELETE FROM rankings 
    WHERE user_id = $1 AND song_id = $2 
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, songId]);
  return result.rows[0];
};

const countRankingsForSong = async (songId) => {
  const query = 'SELECT COUNT(*) FROM rankings WHERE song_id = $1;';
  const result = await pool.query(query, [songId]);
  return parseInt(result.rows[0].count, 10);
};

module.exports = { addRanking, updateRanking, deleteRanking, countRankingsForSong };