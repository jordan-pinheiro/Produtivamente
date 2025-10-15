const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   POST api/users/register
// @desc    Registrar usuário
// @access  Public
router.post('/register', userController.register);

// @route   POST api/users/login
// @desc    Autenticar usuário e obter token
// @access  Public
router.post('/login', userController.login);

// @route   GET api/users/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', auth, userController.getCurrentUser);

// @route   PUT api/users/points
// @desc    Atualizar pontos do usuário
// @access  Private
router.put('/points', auth, userController.updatePoints);

// @route   PUT api/users/profile
// @desc    Atualizar perfil do usuário (nome e senha)
// @access  Private
router.put('/profile', auth, userController.updateProfile);

module.exports = router;
