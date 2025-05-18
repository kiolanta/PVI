const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const Message = require('./models/Message');
const Chat = require('./models/Chat');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*', // Вкажіть точний origin вашого фронтенду
    methods: ['GET', 'POST'],
  },
});

// Підключення до MongoDB
mongoose.connect('mongodb://localhost:27017/chatApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB підключено'))
  .catch(err => console.error('❌ Помилка підключення до MongoDB', err));

// Зберігаємо сокети користувачів
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Користувач підключився:', socket.id);

  // Реєстрація користувача
  socket.on('register', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`🧍 Користувач ${userId} зареєстрований`);
  });

  socket.on('startChatRoom', async ({ userIds, groupName }, callback) => {
  try {
    const isGroup = userIds.length > 2;
    let chat;

    if (isGroup) {
      chat = await Chat.create({
        participants: userIds,
        isGroup: true,
        groupName,
      });
    } else {
      chat = await Chat.findOne({
        participants: { $all: userIds, $size: 2 },
        isGroup: false,
      });
      if (!chat) {
        chat = await Chat.create({
          participants: userIds,
          isGroup: false,
        });
      }
    }

    socket.join(chat._id.toString());
    callback({ chatId: chat._id.toString() });

    userIds.forEach(uid => {
      const sockId = onlineUsers.get(uid);
      if (sockId) {
        io.to(sockId).emit('newChatAvailable', chat);
      }
    });
  } catch (err) {
    console.error('❌ Помилка створення чату:', err);
    callback({ error: 'Помилка створення чату' });
  }
});

socket.on('addMembersToChat', async ({ chatId, newUserIds }, callback) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat || !chat.isGroup) {
      return callback({ error: 'Чат не знайдено або не є груповим' });
    }

    // Уникаємо дублікатів
    const updatedParticipants = [...new Set([...chat.participants, ...newUserIds])];
    chat.participants = updatedParticipants;
    await chat.save();

    // Оповістити всіх нових користувачів
    newUserIds.forEach(uid => {
      const sockId = onlineUsers.get(uid);
      if (sockId) {
        io.to(sockId).emit('newChatAvailable', chat);
      }
    });

    // Оновити всім іншим теж
    updatedParticipants.forEach(uid => {
      const sockId = onlineUsers.get(uid);
      if (sockId) {
        io.to(sockId).emit('chatUpdated', chat);
      }
    });

    callback({ success: true, participants: updatedParticipants });
  } catch (err) {
    console.error('❌ Помилка при додаванні учасників:', err);
    callback({ error: 'Не вдалося додати учасників' });
  }
});


  socket.on('sendMessage', async (message, callback) => {
    try {
      const newMessage = new Message({
        chatId: message.chatId,
        senderId: message.senderId,
        receiverIds: message.receiverIds,
        text: message.text,
        timestamp: new Date(),
      });
  
      // Переконайся, що повідомлення зберігається правильно в MongoDB
      const savedMessage = await newMessage.save(); 
      console.log('Повідомлення збережено в MongoDB:', savedMessage);
  
      io.to(message.chatId).emit('receiveMessage', savedMessage); // Відправляємо в кімнату чат
      callback({ success: true });
    } catch (err) {
      console.error('❌ Помилка збереження повідомлення:', err);
      callback({ error: 'Не вдалося зберегти повідомлення' });
    }
  });
  

  // Відключення користувача
  socket.on('disconnect', () => {
    for (let [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        console.log(`🔌 Користувач ${userId} вийшов`);
        break;
      }
    }
  });
});

app.post('/chats/create', async (req, res) => {
    const { user1, user2 } = req.body;
    let chat = await Chat.findOne({ participants: { $all: [user1, user2] } });
    if (!chat) {
      chat = new Chat({ participants: [user1, user2] });
      await chat.save();
    }
    res.json(chat);
  });
  
// На сервері (Express.js)
app.get('/chats/:userId', async (req, res) => {
    const { userId } = req.params;
    const chats = await Chat.find({ participants: userId });
    res.json(chats);
  });

// Маршрут для отримання всіх повідомлень чату
app.get('/messages/:chatId', async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('❌ Помилка при отриманні повідомлень:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// На сервері (наприклад, Express.js)
app.get('/chats/verify/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;
    const chat = await Chat.findOne({
      participants: { $all: [user1, user2] }
    });
    res.json(!!chat); // Повертає true, якщо чат існує, інакше false
  });

// ✅ Отримати чат за ID (для updateMembers)
app.get('/chat/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Чат не знайдено' });
    }
    res.json(chat);
  } catch (err) {
    console.error('❌ Помилка при отриманні чату:', err);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

server.listen(3000, () => {
  console.log('🚀 Сервер Socket.IO працює на http://localhost:3000');
});