const pool = require('../config/db');

const getAllUsers = async () => {
  const result = await pool.query('SELECT user_id, username FROM users ORDER BY user_id ASC');
  return result.rows;
};

const createUser = async (username, hashedPassword) => {
  const query = `
    INSERT INTO users (username, password) 
    VALUES ($1, $2) 
    RETURNING user_id, username; -- Only return safe data
  `;
  const result = await pool.query(query, [username, hashedPassword]);
  return result.rows[0];
};

const getUserByUsername = async (username) => {
  const query = 'SELECT * FROM users WHERE username = $1;';
  const result = await pool.query(query, [username]);
  return result.rows[0];
};

const deleteUser = async (userId) => {
  const query = 'DELETE FROM users WHERE user_id = $1 RETURNING user_id, username;';
  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const updateUser = async (userId, newUsername) => {
  const query = `
    UPDATE users 
    SET username = $1 
    WHERE user_id = $2 
    RETURNING user_id, username;
  `;
  const result = await pool.query(query, [newUsername, userId]);
  return result.rows[0];
};

module.exports = { getAllUsers, createUser, getUserByUsername, deleteUser, updateUser };