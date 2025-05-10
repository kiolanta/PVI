if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("../sw.js")
    .then(reg => console.log("✅ Service Worker зареєстровано", reg))
    .catch(err => console.error("❌ SW помилка", err));
}

const loginModal = document.getElementById('loginModal');
const openLoginBtn = document.createElement('button');
const profileMenu = document.querySelector(".profile-menu");
const notificationHeader = document.querySelector(".notification-header");

openLoginBtn.textContent = 'Log In';
openLoginBtn.id = 'loginBtn';

openLoginBtn.style.padding = '10px 20px';
openLoginBtn.style.borderRadius = '20px';
openLoginBtn.style.border = 'none';
openLoginBtn.style.backgroundColor = 'rgb(178, 214, 238)'; 
openLoginBtn.style.color = 'black';
openLoginBtn.style.fontSize = '16px';
openLoginBtn.style.cursor = 'pointer';
openLoginBtn.style.transition = 'all 0.3s ease'; 
openLoginBtn.style.marginRight = '20px';

openLoginBtn.addEventListener('mouseenter', () => {
  openLoginBtn.style.backgroundColor = 'rgb(193, 178, 238)'; 
  openLoginBtn.style.transform = 'scale(1.05)';
});

openLoginBtn.addEventListener('mouseleave', () => {
  openLoginBtn.style.backgroundColor = 'rgb(178, 214, 238)';
  openLoginBtn.style.transform = 'scale(1)';
});

const header = document.querySelector('.user-info');
const user = JSON.parse(localStorage.getItem('user'));

if (!user) {
  if (header) header.appendChild(openLoginBtn);
  if (profileMenu) profileMenu.style.display = "none";
  if (notificationHeader) notificationHeader.style.display = "none";

  const restrictedZones = [".sideburger"];
  restrictedZones.forEach(selector => {
    const el = document.querySelector(selector);
    if (el) {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        alert("🔒 Будь ласка, увійдіть для подальших дій.");
      });
    }
  });

} else {
  const existingLoginBtn = document.getElementById('loginBtn');
  if (existingLoginBtn) existingLoginBtn.remove();

  if (profileMenu) profileMenu.style.display = "flex";
  if (notificationHeader) notificationHeader.style.display = "flex";

  const usernameEl = profileMenu?.querySelector('.username');
  if (usernameEl) {
    usernameEl.textContent = user.name;
  }
}

if (loginModal) {
  openLoginBtn.addEventListener('click', () => {
  loginModal.style.display = 'block';
});

document.querySelector('.login-close')?.addEventListener('click', () => {
  loginModal.style.display = 'none';
  clearLoginForm();
});

document.getElementById('cancelLoginBtn')?.addEventListener('click', () => {
  loginModal.style.display = 'none';
  clearLoginForm();
});
  
function clearLoginForm() {
  const loginInput = document.getElementById('loginName');
  const passwordInput = document.getElementById('loginPassword');
  if (loginInput) loginInput.value = '';
  if (passwordInput) passwordInput.value = '';
}
  
const submitLoginBtn = document.getElementById('submitLoginBtn');
if (submitLoginBtn) {
  submitLoginBtn.addEventListener('click', async () => {
    const login = document.getElementById('loginName')?.value.trim();
    const password = document.getElementById('loginPassword')?.value.trim();

    if (!login || !password) return;

    const response = await fetch('index.php?route=login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password })
    });

    if (response.ok) {
      const result = await response.json();
      localStorage.setItem('user', JSON.stringify(result.user));
      loginModal.style.display = 'none';
      location.reload();
    } else {
      alert("Невірний логін або пароль");
    }
  });
}
}

window.logout = function () {
  fetch('index.php?route=logout')
    .then(response => {
      if (response.ok) {
        localStorage.removeItem('user');
        updateStudentsStatusOffline();  
        clearLocalStorageForUser(currentUserId);
      }
      location.reload();  
    })
    .catch(error => {
      console.error('Помилка при логауті:', error);
    });
};


function updateStudentsStatusOffline() {
  fetch('index.php?route=students')
    .then(response => response.json())
    .then(data => {
      if (data && Array.isArray(data.students)) {
        const studentsTable = document.querySelector('#studentsTable');
        if (studentsTable) {
          const rows = studentsTable.querySelectorAll('tr');
          rows.forEach(row => {
            const studentId = row.getAttribute('data-id'); 
            const statusCell = row.querySelector('.status-cell');
            const student = data.students.find(student => student.id == studentId);
            
            if (student && statusCell) {
              if (student.status === 'offline') {
                statusCell.classList.remove('status-active');
                statusCell.classList.add('status-inactive');
                statusCell.innerText = 'offline';
              }
            }
          });
        }
      }
    })
    .catch(error => {
      console.error('Помилка при оновленні статусу:', error);
    });
}


const bell = document.querySelector(".notification-bell");
const indicator = document.getElementById("notificationIndicator");
const bellIcon = document.querySelector(".fa-bell"); 

  if (bell && indicator && bellIcon) {
    bellIcon.classList.add("bell-animate");
    setTimeout(() => {
      indicator.style.display = "block";
    }, 800); 
    
    bell.addEventListener("click", function() {
      indicator.style.display = "none";
      window.location.href = "messages.html";
    });
  }

  const socket = io("http://localhost:3000");
  const currentUserId = user?.id;
  console.log('Ініціалізація, currentUserId:', currentUserId);
  
  let chatId = null;
  let chatIdParticipantId = null;
  const studentCache = {};
  
  socket.emit('register', currentUserId);
  
  window.addEventListener('DOMContentLoaded', () => {
    loadChatsFromStorage();
  });
  
  function getNameById(id) {
    if (studentCache[id]) return Promise.resolve(studentCache[id]);
  
    console.log('Запит імені для id:', id);
    return fetch(`index.php?route=student&id=${id}`, {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => {
        console.log('Сира відповідь сервера для id:', id, res);
        return res.text(); // Отримуємо як текст для дебагу
      })
      .then(text => {
        console.log('Текст відповіді для id:', id, text);
        try {
          const student = JSON.parse(text);
          studentCache[id] = student.name || 'Unknown';
          return studentCache[id];
        } catch (err) {
          console.error('Помилка парсингу JSON для id:', id, err, 'Текст:', text);
          return 'Unknown';
        }
      })
      .catch(err => {
        console.error('Помилка отримання імені студента для id:', id, err);
        return 'Unknown';
      });
  }
  
  document.querySelector('.new-chat').addEventListener('click', () => {
    document.getElementById('newChatModal').style.display = 'block';
    loadStudentList();
  });
  
  document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('newChatModal').style.display = 'none';
  });
  
  function loadStudentList() {
    fetch(`http://localhost:3000/chats/${currentUserId}`)
      .then(res => res.json())
      .then(chats => {
        const existingChatParticipants = chats.flatMap(chat => chat.participants).filter(id => id !== currentUserId);
  
        fetch('index.php?route=students', {
          method: 'GET',
          credentials: 'include',
        })
          .then(res => res.json())
          .then(response => {
            const students = response.data;
            const list = document.getElementById('student-list');
            list.innerHTML = '';
  
            students.forEach(student => {
              if (student.id == currentUserId || existingChatParticipants.includes(student.id)) return;
  
              studentCache[student.id] = student.name;
  
              const li = document.createElement('li');
              li.textContent = student.name;
              li.dataset.userId = student.id;
  
              li.addEventListener('click', () => {
                document.getElementById('newChatModal').style.display = 'none';
                addChatItem(student.id, student.name);
                loadChatWith(student.id);
              });
  
              list.appendChild(li);
            });
          })
          .catch(err => console.error('Помилка при отриманні студентів:', err));
      })
      .catch(err => console.error('Помилка при отриманні чатів:', err));
  }
  
  function clearLocalStorageForUser(userId) {
    console.log('Очищено localStorage для:', userId);
    localStorage.removeItem(`chats_${userId}`);
  }
  
  window.logout = function () {
    fetch('index.php?route=logout')
      .then(response => {
        if (response.ok) {
          localStorage.removeItem('user');
          updateStudentsStatusOffline();
          if (currentUserId) {
            clearLocalStorageForUser(currentUserId);
          } else {
            console.warn('currentUserId не визначено під час logout');
          }
          location.reload();
        } else {
          alert('Не вдалося вийти. Спробуйте ще раз.');
        }
      })
      .catch(error => {
        console.error('Помилка при логауті:', error);
        alert('Помилка під час виходу. Перевірте підключення.');
      });
  };
  
  function addChatItem(userId, name) {
    const chatList = document.getElementById('chat-list');
  
    if ([...chatList.children].some(el => el.dataset.userId === userId)) return;
  
    fetch('http://localhost:3000/chats/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1: currentUserId, user2: userId }),
    })
      .then(res => res.json())
      .then(chat => {
        const li = document.createElement('li');
        li.classList.add('chat-item');
        li.dataset.userId = userId;
        li.innerHTML = `<img src="../ava.jpg" class="chat-avatar"><span>${name}</span>`;
        li.addEventListener('click', () => {
          loadChatWith(userId);
          document.getElementById('room-title').textContent = `Chat room: ${name}`;
        });
        chatList.appendChild(li);
        console.log('Додано чат з userId:', userId, 'іменем:', name);
  
        const existingChats = JSON.parse(localStorage.getItem(`chats_${currentUserId}`)) || [];
        if (!existingChats.some(c => c.participants.includes(userId))) {
          existingChats.push({
            participants: [currentUserId, userId],
            name: name,
          });
          localStorage.setItem(`chats_${currentUserId}`, JSON.stringify(existingChats));
        }
      })
      .catch(err => console.error('Помилка створення чату:', err));
  }
  
  function loadChatsFromStorage() {
    const chatList = document.getElementById('chat-list');
    chatList.innerHTML = '';
  
    fetch('index.php?route=students', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(response => {
        const students = response.data;
        students.forEach(student => {
          studentCache[student.id] = student.name;
        });
        console.log('studentCache:', studentCache);
  
        fetch(`http://localhost:3000/chats/${currentUserId}`)
          .then(res => {
            if (!res.ok) throw new Error(`Помилка ${res.status}: ${res.statusText}`);
            return res.json();
          })
          .then(chats => {
            console.log('Чати з сервера:', chats);
            localStorage.setItem(`chats_${currentUserId}`, JSON.stringify(chats));
  
            const promises = chats.map(chat => {
              const otherId = chat.participants.find(id => String(id) !== String(currentUserId));
              console.log('chat:', chat, 'otherId:', otherId);
              if (otherId) {
                return getNameById(otherId).then(name => ({ otherId, name }));
              }
              return Promise.resolve(null);
            });
  
            Promise.all(promises).then(results => {
              results.forEach(result => {
                if (result) {
                  console.log('Додаємо чат з otherId:', result.otherId, 'іменем:', result.name);
                  addChatItem(result.otherId, result.name);
                }
              });
            });
          })
          .catch(err => console.error('Помилка завантаження чатів:', err));
      })
      .catch(err => console.error('Помилка завантаження студентів:', err));
  }
  
  function loadChatWith(selectedUserId) {
    chatIdParticipantId = selectedUserId;
  
    socket.emit('startChat', { user1: currentUserId, user2: selectedUserId }, (response) => {
      if (response.error) {
        console.error('Помилка при створенні чату:', response.error);
        return;
      }
  
      chatId = response.chatId;
      document.getElementById('chat-messages').innerHTML = '';
      loadMessages(chatId);
    });
  }
  
  function loadMessages(chatId) {
    fetch(`http://localhost:3000/messages/${chatId}`)
      .then(res => res.json())
      .then(messages => {
        console.log('Завантажені повідомлення:', messages);
        if (messages.length > 0) {
          messages.forEach(msg => appendMessage(msg, msg.senderId == currentUserId));
        } else {
          console.log('Повідомлень немає');
        }
      })
      .catch(err => console.error('Помилка завантаження повідомлень:', err));
  }
  
  function appendMessage(message, isSentByCurrentUser) {
    const chatMessages = document.getElementById('chat-messages');
    const msgElem = document.createElement('div');
    msgElem.classList.add('message');
    msgElem.classList.add(isSentByCurrentUser ? 'sent' : 'received');
  
    msgElem.innerHTML = `
      <img src="../ava.jpg" alt="avatar" class="message-avatar">
      <div class="message-text">
          <div class="message-content">${message.text}</div>
      </div>
    `;
  
    chatMessages.appendChild(msgElem);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
  
  const sendBtn = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');
  
  sendBtn.addEventListener('click', () => {
    const text = messageInput.value.trim();
    if (!text || !chatId || !chatIdParticipantId) return;
  
    const message = {
      chatId: chatId,
      senderId: currentUserId,
      receiverIds: [chatIdParticipantId],
      text: text,
    };
  
    socket.emit('sendMessage', message, (response) => {
      if (response.error) {
        console.error('Помилка надсилання повідомлення:', response.error);
        return;
      }
      appendMessage(message, true);
      messageInput.value = '';
    });
  });
  
  socket.on('receiveMessage', (message) => {
    if (message.chatId === chatId && String(message.senderId) !== String(currentUserId)) {
      appendMessage(message, false);
    } else {
      console.log('Нове повідомлення в іншому чаті або моє власне:', message);
    }
  });