const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiController');

// @route   POST api/ai/task-suggestions
// @desc    Gerar sugestões de tarefas com base no comportamento do usuário
// @access  Private
router.post('/task-suggestions', auth, aiController.generateTaskSuggestions);

// @route   POST api/ai/daily-routine
// @desc    Gerar rotina diária personalizada
// @access  Private
router.post('/daily-routine', auth, aiController.generateDailyRoutine);

// @route   POST api/ai/productivity-tips
// @desc    Gerar dicas de produtividade personalizadas
// @access  Private
router.post('/productivity-tips', auth, aiController.generateProductivityTips);

module.exports = router;
