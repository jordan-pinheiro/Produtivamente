const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Nosso middleware para proteger a rota
const dashboardController = require('../controllers/dashboardController'); // O controller que vamos criar a seguir

// @route   GET /api/dashboard
// @desc    Obter dados agregados para o dashboard do usuário
// @access  Private
router.get('/', auth, dashboardController.getDashboardData);

module.exports = router;