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
        updateStudentsStatusOffline();  // Оновлюємо статус на офлайн
      }
      location.reload();  // Перезавантаження сторінки для відображення змін
    })
    .catch(error => {
      console.error('Помилка при логауті:', error);
    });
};

// Оновлення статусу студентів на офлайн
function updateStudentsStatusOffline() {
  // Отримуємо список студентів через AJAX запит
  fetch('index.php?route=students')
    .then(response => response.json())
    .then(data => {
      if (data && Array.isArray(data.students)) {
        const studentsTable = document.querySelector('#studentsTable');
        if (studentsTable) {
          const rows = studentsTable.querySelectorAll('tr');
          rows.forEach(row => {
            const studentId = row.getAttribute('data-id');  // припускаємо, що ID студента є в атрибуті data-id
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