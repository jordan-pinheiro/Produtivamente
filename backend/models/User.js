const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  points: {
    type: Number,
    default: 0
  },
  unlockedAchievements: [{
    achievement: { // A referência para a definição da conquista
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedAt: { // A data em que foi desbloqueada
      type: Date,
      default: Date.now
    }
  }],
   // vvv ADICIONE ESTE NOVO CAMPO vvv
  activeChallenges: [{
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endsAt: {
      type: Date
    },
    progress: {
      type: Number,
      default: 0
    }
  }],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
