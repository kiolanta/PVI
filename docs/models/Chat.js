const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [String], // масив ID студентів
  isGroup: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);
