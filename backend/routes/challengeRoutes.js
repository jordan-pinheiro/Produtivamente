const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const challengeController = require('../controllers/challengeController');

// @route   GET /api/challenges
// @desc    Listar todos os desafios ativos
// @access  Private
router.get('/', auth, challengeController.listChallenges);

// @route   POST /api/challenges/:id/accept
// @desc    Usuário aceita um desafio
// @access  Private
router.post('/:id/accept', auth, challengeController.acceptChallenge);

module.exports = router;