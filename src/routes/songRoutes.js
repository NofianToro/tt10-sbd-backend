const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

router.get('/', songController.getSongs);
router.get('/:id', songController.getSongById);
router.post('/', songController.addSong);
router.put('/:id', songController.editSong);
router.delete('/:id', songController.removeSong);

module.exports = router;