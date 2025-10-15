const User = require('../models/User');
const Task = require('../models/Task');
const Achievement = require('../models/Achievement');

const checkAndUnlockAchievements = async (userId) => {
  try {
    // 1. Busca o usuário e suas conquistas já desbloqueadas
    const user = await User.findById(userId);
    if (!user) return;

    const unlockedIds = user.unlockedAchievements.map(ua => ua.achievement.toString());

    // 2. Busca todas as definições de conquistas que o usuário AINDA NÃO TEM
    const potentialAchievements = await Achievement.find({ _id: { $nin: unlockedIds } });

    if (potentialAchievements.length === 0) {
      return; // Nenhuma nova conquista para verificar
    }

    // 3. Coleta todas as estatísticas necessárias de uma só vez para otimização
    const stats = {
      tasksCompleted: await Task.countDocuments({ user: userId, completed: true }),
      tasksCreated: await Task.countDocuments({ user: userId }),
      highPriorityTasksCompleted: await Task.countDocuments({ user: userId, completed: true, priority: 'alta' }),
      userLevel: user.level,
      userPoints: user.points
    };

    const newlyUnlocked = [];

    // 4. Itera sobre as conquistas possíveis e verifica os critérios
    for (const achievement of potentialAchievements) {
      let shouldUnlock = false;
      switch (achievement.criteria) {
        case 'TASKS_COMPLETED_1':
          if (stats.tasksCompleted >= 1) shouldUnlock = true;
          break;
        case 'TASKS_CREATED_5':
          if (stats.tasksCreated >= 5) shouldUnlock = true;
          break;
        case 'TASKS_COMPLETED_10':
          if (stats.tasksCompleted >= 10) shouldUnlock = true;
          break;
        case 'TASKS_COMPLETED_50':
          if (stats.tasksCompleted >= 50) shouldUnlock = true;
          break;
        case 'REACH_LEVEL_5':
          if (stats.userLevel >= 5) shouldUnlock = true;
          break;
        case 'POINTS_EARNED_1000':
          if (stats.userPoints >= 1000) shouldUnlock = true;
          break;
        case 'HIGH_PRIORITY_TASKS_5':
          if (stats.highPriorityTasksCompleted >= 5) shouldUnlock = true;
          break;
        // Adicione outros 'case' aqui para novas conquistas
      }

      if (shouldUnlock) {
        newlyUnlocked.push(achievement);
      }
    }

    // 5. Se alguma nova conquista foi desbloqueada, atualiza o usuário
    if (newlyUnlocked.length > 0) {
      let pointsFromAchievements = 0;
      
      newlyUnlocked.forEach(ach => {
        user.unlockedAchievements.push({ achievement: ach._id });
        pointsFromAchievements += ach.points;
      });

      user.points += pointsFromAchievements;
      
      // Re-verifica o nível após ganhar pontos das conquistas
      // (Esta lógica pode ser extraída para uma função de serviço do usuário também)
      const nextLevelPoints = user.level * 100;
      if (user.points >= nextLevelPoints) {
          user.level += 1;
      }
      
      await user.save();
      console.log(`Usuário ${user.name} desbloqueou ${newlyUnlocked.length} nova(s) conquista(s)!`);
    }

  } catch (error) {
    console.error(`Erro ao verificar conquistas para o usuário ${userId}:`, error);
  }
};

module.exports = { checkAndUnlockAchievements };