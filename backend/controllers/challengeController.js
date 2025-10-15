const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Função para listar todos os desafios que estão ativos no sistema
exports.listChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({ active: true });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};

// Função para um usuário aceitar um desafio
exports.acceptChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.id;

    // 1. Encontrar a definição do desafio
    const challenge = await Challenge.findById(challengeId);
    if (!challenge || !challenge.active) {
      return res.status(404).json({ msg: 'Desafio não encontrado ou inativo.' });
    }

    // 2. Encontrar o usuário
    const user = await User.findById(userId);

    // 3. Verificar se o usuário já não aceitou este desafio
    const alreadyAccepted = user.activeChallenges.some(
      (uc) => uc.challenge.toString() === challengeId
    );
    if (alreadyAccepted) {
      return res.status(400).json({ msg: 'Você já aceitou este desafio.' });
    }

    // 4. Adicionar o desafio à lista de desafios ativos do usuário
    const endsAt = new Date();
    endsAt.setDate(endsAt.getDate() + challenge.duration); // Calcula a data final

    user.activeChallenges.push({
      challenge: challengeId,
      endsAt: endsAt
    });

    await user.save();

    res.json({ msg: 'Desafio aceito com sucesso!', challenge: user.activeChallenges.slice(-1) });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
};