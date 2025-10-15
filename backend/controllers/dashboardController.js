const Task = require('../models/Task');
const User = require('../models/User');
// Se você for usar as sugestões de IA aqui, importe o serviço
// const { generateContent } = require('../services/geminiService');

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Buscar estatísticas de tarefas
    const pendingTasks = await Task.countDocuments({ user: userId, completed: false });
    const completedTasks = await Task.countDocuments({ user: userId, completed: true });

    // 2. Buscar tarefas recentes (as 5 últimas criadas)
    const recentTasks = await Task.find({ user: userId })
      .sort({ createdAt: -1 }) // Ordena pelas mais novas
      .limit(5);

    // 3. Buscar conquistas recentes
    // Para isso, buscamos o usuário e populamos as conquistas
    const user = await User.findById(userId)
      .populate({
        path: 'unlockedAchievements.achievement', // Popula os detalhes da conquista
        model: 'Achievement'
      });
      
    const unlockedAchievementsCount = user.unlockedAchievements.length;
    
    // Pega as 5 conquistas desbloqueadas mais recentemente
    const recentAchievements = user.unlockedAchievements
      .sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt)) // Ordena pela data de desbloqueio
      .slice(0, 5)
      .map(ua => ua.achievement); // Pega apenas os detalhes da conquista

    // 4. (Opcional) Buscar sugestões de IA
    // Por simplicidade, vamos retornar uma lista estática aqui.
    // Você poderia chamar seu serviço de IA para sugestões dinâmicas.
    const aiSuggestions = [
      { title: 'Técnica Pomodoro', description: 'Trabalhe em blocos de 25 minutos com intervalos de 5 minutos para aumentar seu foco.' },
      { title: 'Planejamento matinal', description: 'Reserve 15 minutos todas as manhãs para planejar seu dia e definir prioridades.' }
    ];

    // 5. Montar o objeto de resposta final
    const dashboardData = {
      stats: {
        pendingTasks,
        completedTasks,
        unlockedAchievements: unlockedAchievementsCount
      },
      recentTasks,
      recentAchievements,
      aiSuggestions
    };

    res.json(dashboardData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};