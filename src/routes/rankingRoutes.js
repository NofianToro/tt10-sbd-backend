const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');

router.post('/', rankingController.createRanking);
router.put('/', rankingController.updateRanking);
router.delete('/:user_id/:song_id', rankingController.removeRanking);

module.exports = router;