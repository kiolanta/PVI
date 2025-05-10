const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  receiverIds: [{ type: String, required: true }],
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  readBy: [{ type: String }]
});

module.exports = mongoose.model('Message', messageSchema);
