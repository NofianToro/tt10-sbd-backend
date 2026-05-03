const rankingRepository = require('../repositories/rankingRepository');
const songRepository = require('../repositories/songRepository');

const createRanking = async (req, res) => {
  const { user_id, song_id, grade } = req.body;

  if (!user_id || !song_id || !grade) {
    return res.status(400).json({ error: "user_id, song_id, and grade are required" });
  }

  const validGrades = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
  if (!validGrades.includes(grade.toUpperCase())) {
    return res.status(400).json({ error: "Invalid grade. Must be S, A, B, C, D, E, or F" });
  }

  try {
    const newRanking = await rankingRepository.addRanking(user_id, song_id, grade.toUpperCase());
    res.status(201).json(newRanking);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: "This user has already ranked this song. Use PUT to update." });
    }
    if (err.code === '23503') {
      return res.status(404).json({ error: "User or Song not found in the database." });
    }
    console.error(err.message);
    res.status(500).json({ error: "Server error adding ranking" });
  }
};

const updateRanking = async (req, res) => {
  const { user_id, song_id, grade } = req.body;

  if (!user_id || !song_id || !grade) {
    return res.status(400).json({ error: "user_id, song_id, and grade are required" });
  }

  const validGrades = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
  if (!validGrades.includes(grade.toUpperCase())) {
    return res.status(400).json({ error: "Invalid grade. Must be S, A, B, C, D, E, or F" });
  }

  try {
    const updatedRanking = await rankingRepository.updateRanking(user_id, song_id, grade.toUpperCase());
    if (!updatedRanking) {
      return res.status(404).json({ error: "Ranking not found." });
    }
    res.json(updatedRanking);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error updating ranking" });
  }
};

const removeRanking = async (req, res) => {
  const { user_id, song_id } = req.params;

  try {
    const deletedRanking = await rankingRepository.deleteRanking(user_id, song_id);
    if (!deletedRanking) {
      return res.status(404).json({ error: "Ranking not found." });
    }

    // Auto-delete the song if it has no remaining rankings
    const remaining = await rankingRepository.countRankingsForSong(song_id);
    if (remaining === 0) {
      await songRepository.deleteSong(song_id);
      return res.json({
        message: "Ranking deleted and song removed (no rankings left).",
        ranking: deletedRanking,
        song_deleted: true
      });
    }

    res.json({ message: "Ranking deleted successfully", ranking: deletedRanking, song_deleted: false });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting ranking" });
  }
};

module.exports = { createRanking, updateRanking, removeRanking };