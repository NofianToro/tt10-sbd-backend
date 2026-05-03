const bcrypt = require('bcrypt');
const userRepository = require('../repositories/userRepository');

const getUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching users" });
  }
};

const addUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userRepository.createUser(username, hashedPassword);
    
    res.status(201).json(newUser);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error(err.message);
    res.status(500).json({ error: "Server error creating user" });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required" });
  }

  try {
    const user = await userRepository.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" }); // Keep errors vague for security
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        username: user.username
      }
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error during login" });
  }
};

const removeUser = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await userRepository.deleteUser(id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting user" });
  }
};

const editUser = async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: "New username is required" });
  }

  try {
    const updatedUser = await userRepository.updateUser(id, username);
    
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json(updatedUser);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "Username already taken" });
    }
    console.error(err.message);
    res.status(500).json({ error: "Server error updating user" });
  }
};

module.exports = { getUsers, addUser, loginUser, removeUser, editUser };

