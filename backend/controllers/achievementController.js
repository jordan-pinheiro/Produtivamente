// controllers/achievementController.js

const Achievement = require('../models/Achievement');
const User = require('../models/User');

// @route   GET api/achievements
// @desc    Obter todas as definições de conquistas e o status para o usuário logado
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    // 1. Pega todas as definições de conquistas que existem no jogo
    const allAchievements = await Achievement.find().lean(); // .lean() para performance

    // 2. Pega os dados das conquistas desbloqueadas pelo usuário
    const user = await User.findById(req.user.id).select('unlockedAchievements').populate('unlockedAchievements.achievement');

    // 3. Mapeia as conquistas desbloqueadas pelo usuário para fácil acesso
    const unlockedMap = new Map();
    for (const unlocked of user.unlockedAchievements) {
      unlockedMap.set(unlocked.achievement._id.toString(), unlocked.unlockedAt);
    }

    // 4. Combina as duas listas
    const result = allAchievements.map(achievement => ({
      ...achievement,
      isUnlocked: unlockedMap.has(achievement._id.toString()),
      unlockedAt: unlockedMap.get(achievement._id.toString()) || null
    }));

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};