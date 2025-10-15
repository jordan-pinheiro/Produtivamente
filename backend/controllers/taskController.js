const Task = require('../models/Task');
const User = require('../models/User');
const { checkAndUnlockAchievements } = require('../services/achievementService'); // Importe no topo do arquivo

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;
    
    let points = 10; // padrão
    if (priority === 'alta') points = 20;
    else if (priority === 'baixa') points = 5;
    
    const newTask = new Task({
      user: req.user.id,
      title,
      description,
      dueDate,
      priority,
      points
    });
    
    const task = await newTask.save();

    // ADICIONE A CHAMADA AQUI TAMBÉM
    // Para verificar conquistas como "TASKS_CREATED_5"
    await checkAndUnlockAchievements(req.user.id);
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Obter todas as tarefas do usuário
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Obter tarefa por ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Verificar se a tarefa existe
    if (!task) {
      return res.status(404).json({ msg: 'Tarefa não encontrada' });
    }
    
    // Verificar se a tarefa pertence ao usuário
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Usuário não autorizado' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tarefa não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};

// Atualizar tarefa
exports.updateTask = async (req, res) => {
  try {
    const { title, description, completed, dueDate, priority } = req.body;
    
    let task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    
    if (!task) {
      return res.status(404).json({ msg: 'Tarefa não encontrada ou não autorizada' });
    }
    
    const wasCompleted = task.completed;
    const isNowCompleted = completed !== undefined ? completed : wasCompleted;
    
    // Atualizar campos
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (dueDate) task.dueDate = dueDate;
    if (priority) {
      task.priority = priority;
      // Atualiza os pontos se a prioridade mudar
      if (priority === 'alta') task.points = 20;
      else if (priority === 'média') task.points = 10;
      else if (priority === 'baixa') task.points = 5;
    }
    
    await task.save();
    
    // --- Bloco de Lógica Único ---
    // Se a tarefa foi marcada como concluída NESTA atualização
    if (!wasCompleted && isNowCompleted) {
      // Busca o usuário para atualizar seus pontos e nível
      const user = await User.findById(req.user.id);
      user.points += task.points;
      
      // Verifica se o usuário subiu de nível
      if (user.points >= user.level * 100) {
        user.level += 1;
      }
      
      // Salva as alterações de pontos e nível do usuário
      await user.save();
      
      // 2. Chama o serviço para verificar se alguma conquista foi desbloqueada
      await checkAndUnlockAchievements(user.id); 
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Excluir tarefa
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    // Verificar se a tarefa existe
    if (!task) {
      return res.status(404).json({ msg: 'Tarefa não encontrada' });
    }
    
    // Verificar se a tarefa pertence ao usuário
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Usuário não autorizado' });
    }
    
    await task.deleteOne();
    
    res.json({ msg: 'Tarefa removida' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Tarefa não encontrada' });
    }
    res.status(500).send('Erro no servidor');
  }
};
