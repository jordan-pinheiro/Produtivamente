const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const achievementController = require('../controllers/achievementController');

// @route   GET api/achievements
// @desc    Obter todas as conquistas do usuário
// @access  Private
router.get('/', auth, achievementController.getAchievements);

module.exports = router;
