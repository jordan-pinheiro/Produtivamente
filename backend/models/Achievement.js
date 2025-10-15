const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const achievementSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true // Garante que não haja duas conquistas com o mesmo título
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'default-icon.png' // Um ícone padrão
  },
  points: {
    type: Number,
    required: true,
    default: 50
  },
  // O critério é a "chave" que o código usará para verificar se a conquista foi alcançada
  criteria: {
    type: String,
    required: true,
    unique: true,
    // Exemplos de critérios que você pode usar:
    // 'TASKS_COMPLETED_1', 'TASKS_COMPLETED_10', 'REACH_LEVEL_5'
    enum: ['TASKS_COMPLETED_1', 'TASKS_COMPLETED_10', 'TASKS_COMPLETED_25', 'REACH_LEVEL_5']
  }
});

module.exports = mongoose.model('Achievement', achievementSchema);