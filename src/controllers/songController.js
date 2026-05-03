const songRepository = require('../repositories/songRepository');

const getSongs = async (req, res) => {
  try {
    const songs = await songRepository.getAllSongsWithAverages();
    res.json(songs);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching songs" });
  }
};

const getSongById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const [details, rankings] = await Promise.all([
      songRepository.getSongDetails(id),
      songRepository.getSongRankings(id)
    ]);

    if (!details) {
      return res.status(404).json({ error: "Song not found" });
    }

    const responseData = {
      ...details,
      rankings: rankings
    };

    res.json(responseData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error fetching song details" });
  }
};

const addSong = async (req, res) => {
  const { title, artist, tags, discovered_from } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Song title is required" });
  }

  try {
    const newSong = await songRepository.createSong(title, artist, tags, discovered_from);
    res.status(201).json(newSong);
  } catch (err) {
    console.error("Transaction Error:", err.message);
    res.status(500).json({ error: "Server error creating song and relationships" });
  }
};

const editSong = async (req, res) => {
  const { id } = req.params;
  const { title, artist, tags, discovered_from } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Song title is required for update" });
  }

  try {
    const updatedSong = await songRepository.updateSong(id, title, artist, tags, discovered_from);
    res.json(updatedSong);
  } catch (err) {
    console.error("Transaction Error:", err.message);
    res.status(500).json({ error: "Server error updating song" });
  }
};

const removeSong = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSong = await songRepository.deleteSong(id);
    if (!deletedSong) {
      return res.status(404).json({ error: "Song not found" });
    }
    res.json({ message: "Song and all associated rankings/tags deleted cleanly", song: deletedSong });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Server error deleting song" });
  }
};

module.exports = {
  getSongs,
  getSongById,
  addSong,
  editSong,
  removeSong
};