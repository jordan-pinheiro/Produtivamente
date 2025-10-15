const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const taskController = require('../controllers/taskController');

// @route   POST api/tasks
// @desc    Criar nova tarefa
// @access  Private
router.post('/', auth, taskController.createTask);

// @route   GET api/tasks
// @desc    Obter todas as tarefas do usuário
// @access  Private
router.get('/', auth, taskController.getTasks);

// @route   GET api/tasks/:id
// @desc    Obter tarefa por ID
// @access  Private
router.get('/:id', auth, taskController.getTaskById);

// @route   PUT api/tasks/:id
// @desc    Atualizar tarefa
// @access  Private
router.put('/:id', auth, taskController.updateTask);

// @route   DELETE api/tasks/:id
// @desc    Excluir tarefa
// @access  Private
router.delete('/:id', auth, taskController.deleteTask);

module.exports = router;
