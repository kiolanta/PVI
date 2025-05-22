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

  function clearLocalStorageForUser(userId) {
  console.log('Очищено localStorage для:', userId);
  localStorage.removeItem(`chats_${userId}`);
}

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

  const bell = document.getElementById("notificationBell");
  bell.addEventListener("click", () => {
    window.location.href = "messages.html";
  });
  const indicator = document.getElementById("notificationIndicator");
  const dropdown  = document.getElementById("notificationDropdown"); 

  async function triggerNotification(message) {

    bell.querySelector("i").classList.add("bell-animate");
    setTimeout(() => bell.querySelector("i").classList.remove("bell-animate"), 1000);

    indicator.style.display = "block";
    const count = parseInt(indicator.textContent||"0",10)+1;
    indicator.textContent = count;

    const { firstName, lastName } = await getNameById(message.senderId);
    const item = document.createElement("div");
    item.className = "notification-item";
    item.innerHTML = `
      <img src="../ava.jpg" alt="Avatar">
      <div>
        <span>${firstName} ${lastName}</span>
        <div class="messagee">${message.text}</div>
      </div>
    `;

  item.addEventListener("click", () => {
    console.log("➡️ Notification clicked, going to chatId =", message.chatId);
    window.location.href = `messages.html?chatId=${message.chatId}`;
  });

  dropdown.prepend(item);
  if (dropdown.children.length > 5) {
    dropdown.removeChild(dropdown.lastChild);
  }
}

const socket = io("http://localhost:3000");
const currentUserId = String(user?.id);
let chatId = null;
const studentCache = {};

socket.emit('register', currentUserId);
window.addEventListener('DOMContentLoaded', () => loadChatsFromStorage());

function getNameById(id) {
  if (studentCache[id]) return Promise.resolve(studentCache[id]);
  return fetch(`index.php?route=student&id=${id}`, {
    method: 'GET',
    credentials: 'include',
  })
    .then(res => res.text())
    .then(text => {
      try {
        const student = JSON.parse(text);
        const fullName = student.name || 'Unknown Unknown';
        const [firstName, lastName] = fullName.split(' ');
        studentCache[id] = {
          firstName: firstName || 'Unknown',
          lastName: lastName || 'User',
        };
        return studentCache[id];
      } catch {
        return { firstName: 'Unknown', lastName: 'User' };
      }
    })
    .catch(() => ({ firstName: 'Unknown', lastName: 'User' }));
}

async function loadStudentList() {
  try {
    const list = document.getElementById('student-list');
    list.innerHTML = '';
    const limit = 5;
    let page = 1;
    let allStudents = [];

    const initialResponse = await fetch(`index.php?route=students&page=${page}&limit=${limit}`, {
      method: 'GET',
      credentials: 'include'
    });
    if (!initialResponse.ok) throw new Error('Не вдалося завантажити студентів');
    const initialData = await initialResponse.json();
    allStudents = allStudents.concat(initialData.data);
    const totalPages = initialData.totalPages || 1;

    const pagePromises = [];
    for (let p = 2; p <= totalPages; p++) {
      pagePromises.push(
        fetch(`index.php?route=students&page=${p}&limit=${limit}`, {
          method: 'GET',
          credentials: 'include'
        })
          .then(res => {
            if (!res.ok) throw new Error('Не вдалося завантажити сторінку ' + p);
            return res.json();
          })
          .then(data => data.data)
      );
    }

    const additionalPages = await Promise.all(pagePromises);
    additionalPages.forEach(pageData => {
      allStudents = allStudents.concat(pageData);
    });

    allStudents.forEach(student => {
      if (String(student.id) === currentUserId) return;
      const fullName = student.name || 'Unknown Unknown';
      const [firstName, lastName] = fullName.split(' ');
      studentCache[student.id] = { firstName: firstName || 'Unknown', lastName: lastName || 'User' };
      const li = document.createElement('li');
      li.innerHTML = `<label for="student-${student.id}"><input type="checkbox" id="student-${student.id}" name="student" value="${student.id}" data-name="${student.name}"> ${firstName} ${lastName}</label>`;
      list.appendChild(li);
    });

    const checkboxes = document.querySelectorAll('input[name="student"]');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selectedCount = document.querySelectorAll('input[name="student"]:checked').length;
        const groupNameSection = document.getElementById('group-name-section');
        groupNameSection.style.display = selectedCount > 1 ? 'block' : 'none';
      });
    });
  } catch (err) {
    console.error('Помилка при отриманні студентів:', err);
    alert('Не вдалося завантажити список студентів');
  }
}

document.querySelector('.new-chat')?.addEventListener('click', () => {
  document.getElementById('newChatModal').style.display = 'block';
  document.getElementById('group-name-section').style.display = 'none';
  document.getElementById('group-name-input').value = '';
  loadStudentList();
});

document.getElementById('closeModal')?.addEventListener('click', () => {
  document.getElementById('newChatModal').style.display = 'none';
});

document.getElementById('cancelChatBtn')?.addEventListener('click', () => {
  document.getElementById('newChatModal').style.display = 'none';
});

document.getElementById('createChatBtn')?.addEventListener('click', () => {
  const selectedInputs = [...document.querySelectorAll('input[name="student"]:checked')];
  const selectedUsers = selectedInputs.map(input => input.value);

  if (selectedUsers.length === 0) return alert('Оберіть хоча б одного студента!');

  let groupName = '';
  if (selectedUsers.length > 1) {
    groupName = document.getElementById('group-name-input').value.trim();
    if (!groupName) return alert('Введіть назву групи для групового чату!');
  }

  socket.emit('startChatRoom', {
    userIds: [currentUserId, ...selectedUsers],
    groupName: groupName,
  }, ({ chatId: id, error }) => {
    if (error) return alert(error);
    chatId = id;
    document.getElementById('room-title').textContent = `Chat room:`;
    document.getElementById('newChatModal').style.display = 'none';
    loadMessages(chatId);
    updateMembers(chatId);
  });
});

socket.on('newChatAvailable', (chat) => {
  addChatToList(chat);
  socket.emit('joinChatRoom', chat._id);
});

function addChatToList(chat) {
  const chatList = document.getElementById('chat-list');
  if ([...chatList.children].some(el => el.dataset.chatId === chat._id)) return;

  let name = 'Невідомий чат';
  if (chat.isGroup) {
    name = chat.groupName;
  } else {
    const otherId = chat.participants.find(id => id !== String(currentUserId));
    const user = studentCache[otherId] || { firstName: 'Приватний', lastName: 'чат' };
    name = `${user.firstName} ${user.lastName}`;
  }

  const li = document.createElement('li');
  li.classList.add('chat-item');
  li.dataset.chatId = chat._id;
  li.innerHTML = `<img src="../ava.jpg" class="chat-avatar"><span>${name}</span>`;
  li.addEventListener('click', () => {
    chatId = chat._id;
    document.getElementById('room-title').textContent = `Chat room: ${name}`;
    document.getElementById('chat-messages').innerHTML = '';
    socket.emit('joinChatRoom', chat._id, () => {
      loadMessages(chat._id);
      updateMembers(chat._id);
    });
    toggleAddButtonVisibility(chat.isGroup);
  });
  chatList.appendChild(li);
  socket.emit('joinChatRoom', chat._id);
}

function loadChatsFromStorage() {
  fetch('index.php?route=students')
    .then(res => res.json())
    .then(response => {
      const students = response.data;
      students.forEach(student => {
        const fullName = student.name || 'Unknown Unknown';
        const [firstName, lastName] = fullName.split(' ');
        studentCache[student.id] = { firstName: firstName || 'Unknown', lastName: lastName || 'User' };
      });
      return fetch(`http://localhost:3000/chats/${currentUserId}`);
    })
    .then(res => res.json())
    .then(chats => {
      chats.forEach(async chat => {
        if (!chat.isGroup) {
          const otherId = chat.participants.find(id => id !== String(currentUserId));
          if (!studentCache[otherId]) {
            const name = await getNameById(otherId);
            studentCache[otherId] = name;
          }
        }
        addChatToList(chat);
        socket.emit('joinChatRoom', chat._id);
        if (chatId === chat._id) {
          updateMembers(chatId);
        }
      });
    })
    .catch(err => console.error('Помилка завантаження чатів:', err));
}

function loadMessages(chatId) {
  fetch(`http://localhost:3000/messages/${chatId}`)
    .then(res => res.json())
    .then(messages => {
      Promise.all(messages.map(msg => appendMessage(msg, msg.senderId == currentUserId)));
    })
    .catch(err => console.error('Помилка завантаження повідомлень:', err));
}

async function appendMessage(message, isSentByCurrentUser) {
  const chatMessages = document.getElementById('chat-messages');
  const msgElem = document.createElement('div');
  msgElem.classList.add('message', isSentByCurrentUser ? 'sent' : 'received');

  let sender = studentCache[message.senderId] || (await getNameById(message.senderId));
  let firstName = sender.firstName;
  let lastName = sender.lastName;

  msgElem.innerHTML = `
    <div class="message-wrapper">
      <img src="../ava.jpg" alt="avatar" class="message-avatar">
      <div class="message-sender">
        <span class="sender-firstname">${firstName}</span>
        <span class="sender-lastname">${lastName}</span>
      </div>
    </div>
    <div class="message-text">
      <div class="message-content">${message.text}</div>
    </div>
  `;
  chatMessages.appendChild(msgElem);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function updateMembers(chatId) {
  try {
    const response = await fetch(`http://localhost:3000/chat/${chatId}`);
    if (!response.ok) {
      console.error('Помилка при завантаженні чату:', response.statusText);
      return;
    }

    const chat = await response.json();
    const participants = chat.participants || [];
    const memberAvatars = document.querySelector('.member-avatars');
    const membersLabel = document.querySelector('.members span');
    memberAvatars.innerHTML = '';

    membersLabel.textContent = `Members `;

    const visibleParticipants = participants.slice(0, 3);
    const extraCount = participants.length - 3;

    for (let i = 0; i < visibleParticipants.length; i++) {
      const participantId = visibleParticipants[i];
      const sender = studentCache[participantId] || (await getNameById(participantId));
      const fullName = `${sender.firstName} ${sender.lastName}`;
      const avatarImg = document.createElement('img');
      avatarImg.src = '../ava.jpg';
      avatarImg.alt = fullName;
      avatarImg.className = 'member-avatar';
      avatarImg.title = fullName;
      memberAvatars.appendChild(avatarImg);
    }

    if (extraCount > 0) {
      const moreSpan = document.createElement('span');
      moreSpan.className = 'more-members';
      moreSpan.textContent = `+${extraCount}`;
      memberAvatars.appendChild(moreSpan);
    }
  } catch (err) {
    console.error('Помилка при завантаженні учасників:', err);
  }
}

const membersSection = document.querySelector('.members');
const addBtn = document.createElement('button');
addBtn.textContent = '➕';
addBtn.id = 'add-members-btn';
addBtn.style.marginLeft = '10px';
addBtn.style.display = 'none';
membersSection.appendChild(addBtn);

const modal = document.getElementById('add-members-modal');
const closeModalBtn = document.getElementById('close-add-members-modal');
const confirmBtn = document.getElementById('confirm-add-members');
const cancelBtn = document.getElementById('cancel-add-members');

closeModalBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

confirmBtn.addEventListener('click', () => {
  const selected = [...document.querySelectorAll('input[name="new-member"]:checked')].map(i => i.value);
  if (selected.length === 0) return alert('Виберіть хоча б одного');

  socket.emit('addMembersToChat', {
    chatId,
    newUserIds: selected
  }, ({ success, error }) => {
    if (error) return alert(error);
    updateMembers(chatId);
    modal.style.display = 'none';
  });
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

addBtn.addEventListener('click', async () => {
  const res = await fetch(`http://localhost:3000/chat/${chatId}`);
  const chat = await res.json();
  if (!chat.isGroup) return;

  let allStudents = [];
  const limit = 5;
  let page = 1;

  const initialResponse = await fetch(`index.php?route=students&page=${page}&limit=${limit}`, { credentials: 'include' });
  if (!initialResponse.ok) {
    alert('Не вдалося завантажити студентів');
    return;
  }
  const initialData = await initialResponse.json();
  allStudents = allStudents.concat(initialData.data);
  const totalPages = initialData.totalPages || 1;

  const pagePromises = [];
  for (let p = 2; p <= totalPages; p++) {
    pagePromises.push(
      fetch(`index.php?route=students&page=${p}&limit=${limit}`, { credentials: 'include' })
        .then(res => {
          if (!res.ok) throw new Error(`Не вдалося завантажити сторінку ${p}`);
          return res.json();
        })
        .then(data => data.data)
    );
  }

  const additionalPages = await Promise.all(pagePromises);
  additionalPages.forEach(pageData => {
    allStudents = allStudents.concat(pageData);
  });

  const nonMembers = allStudents.filter(s => !chat.participants.includes(String(s.id)));
  if (nonMembers.length === 0) return alert('Усі студенти вже в чаті');

  const listHtml = nonMembers.map(s => {
    return `<label><input type="checkbox" name="new-member" value="${s.id}"> ${s.name}</label><br>`;
  }).join('');

  const membersList = document.getElementById('members-list');
  membersList.innerHTML = listHtml;

  modal.style.display = 'block';
});

socket.on('chatUpdated', chat => {
  if (chat._id === chatId) {
    updateMembers(chatId);
  }
});

function toggleAddButtonVisibility(isGroup) {
  const addBtn = document.getElementById('add-members-btn');
  if (addBtn) {
    addBtn.style.display = isGroup ? 'inline-block' : 'none';
  }
}

const sendBtn = document.getElementById('send-button');
const messageInput = document.getElementById('message-input');

sendBtn.addEventListener('click', async () => {
  const text = messageInput.value.trim();
  if (!text || !chatId) return;
  const message = {
    chatId: chatId,
    senderId: currentUserId,
    text: text,
  };
  socket.emit('sendMessage', message, async (response) => {
    if (response.error) return console.error('❌ Помилка надсилання:', response.error);
    await appendMessage({ ...message, timestamp: new Date() }, true);
    messageInput.value = '';
  });
});

socket.on("receiveMessage", async (message) => {
    if (String(message.senderId) === currentUserId) return;

    const onMessagesPage = window.location.pathname.endsWith("messages.html");
    const inSameChat     = (chatId === message.chatId);

    if (onMessagesPage && inSameChat) {
      await appendMessage(message, false);
    } else {
      await triggerNotification(message);
    }
  });
