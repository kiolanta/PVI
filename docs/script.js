if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(reg => console.log("✅ Service Worker зареєстровано", reg))
    .catch(err => console.error("❌ SW помилка", err));
}

document.addEventListener('DOMContentLoaded', () => {
  const confirmModal = document.getElementById('confirmModal');
  const studentNameSpan = document.getElementById('studentName');
  let studentToDeleteId = null;
  let rowToEdit = null;

document.querySelector('#studentsTable').addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        const row = deleteButton.closest('tr');
        const studentId = row.dataset.id;
        const studentName = row.querySelector('td:nth-child(3)').textContent;

        studentNameSpan.textContent = studentName;
        studentToDeleteId = studentId;
        confirmModal.style.display = 'block';
        return;
    }

    const editButton = e.target.closest('.edit-btn');
    if (editButton) {
      const row = editButton.closest('tr');
      rowToEdit = row;

      const studentId = row.getAttribute('data-id');
      const group = row.cells[1].textContent.trim();
      const fullName = row.cells[2].textContent.trim();
      let [firstName, lastName] = fullName.split(' ');
      const gender = row.cells[3].textContent.trim();
      const birthdayText = row.cells[4].textContent.trim(); 

    const parts = birthdayText.split('.');
    let isoDate = "";
    if (parts.length === 3) {
      isoDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    document.getElementById('editStudentId').value = studentId;
    document.getElementById('editGroup').value = group;
    document.getElementById('editFirstName').value = firstName;
    document.getElementById('editLastName').value = lastName;
    document.getElementById('editGender').value = gender;
    document.getElementById('editBirthday').value = isoDate;

    document.getElementById('editStudentModal').style.display = 'block';
  }
});

const closeModal = () => {
  confirmModal.style.display = 'none';
  studentToDeleteId = null;
};

document.querySelector('.close').addEventListener('click', closeModal);
document.getElementById('cancelDeleteBtn').addEventListener('click', closeModal);

document.getElementById('confirmBtn').addEventListener('click', () => {
  if (studentToDeleteId) {
      const row = document.querySelector(`tr[data-id="${studentToDeleteId}"]`);
      if (row) row.remove();
      closeModal();
  }
});

const studentModal = document.getElementById('studentModal');
const addBtn = document.getElementById('addStudentBtn');
const cancelAddBtn = document.getElementById('cancelBtn');
const createBtn = document.getElementById('createBtn');
const studentForm = document.getElementById('studentForm');

addBtn.addEventListener('click', () => {
  studentModal.style.display = 'block';
});

cancelAddBtn.addEventListener('click', () => {
  studentModal.style.display = 'none';
  studentForm.reset();
  clearAllErrors();
});

document.querySelector('#studentModal .close').addEventListener('click', () => {
  studentModal.style.display = 'none';
  studentForm.reset();
  clearAllErrors();
});

const fields = [
  { id: 'group', message: 'Please enter group' },
  { id: 'firstName', message: 'Please enter first name', pattern: /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/, patternMessage: 'Only letters allowed' },
  { id: 'lastName', message: 'Please enter last name', pattern: /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/, patternMessage: 'Only letters allowed' },
  { id: 'gender', message: 'Please select gender' },
  { id: 'birthday', message: 'Please select birthday', validateDate: true }
];

fields.forEach(({ id, pattern, patternMessage, validateDate }) => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    const errorMsg = input.parentElement.querySelector('.error-message');

    if (input.value.trim() !== '') {
      input.classList.remove('error');
      if (errorMsg) errorMsg.textContent = '';

      if (pattern && !pattern.test(input.value)) {
        input.classList.add('error');
        errorMsg.textContent = patternMessage;
      }

      if (validateDate) {
        const year = new Date(input.value).getFullYear();
        if (year < 2000 || year > 2007) {
          input.classList.add('error');
          errorMsg.textContent = 'Year must be between 2000 and 2007';
        }
      }
    }
  });
});

function generateUniqueId() {
  return Date.now() + '-' + Math.floor(Math.random() * 1000);
}

createBtn.addEventListener('click', () => {
  let isFormValid = true;

  fields.forEach(({ id, message, pattern, patternMessage, validateDate }) => {
    const input = document.getElementById(id);
    const errorMsg = input.parentElement.querySelector('.error-message');

    if (!input.value.trim()) {
      isFormValid = false;
      input.classList.add('error');
      errorMsg.textContent = message;
    } else if (pattern && !pattern.test(input.value)) {
      isFormValid = false;
      input.classList.add('error');
      errorMsg.textContent = patternMessage;
    } else if (validateDate) {
      const year = new Date(input.value).getFullYear();
      if (year < 2000 || year > 2007) {
        isFormValid = false;
        input.classList.add('error');
        errorMsg.textContent = 'Year must be between 2000 and 2007';
      }
    }
  });

  if (isFormValid) {
    const studentId = generateUniqueId();
    const group = document.getElementById('group').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const gender = document.getElementById('gender').value;
    const birthday = document.getElementById('birthday').value;

    addStudentToTable(studentId, group, firstName, lastName, gender, birthday);

    studentModal.style.display = 'none';
    studentForm.reset();
    clearAllErrors();
  }
});

  function addStudentToTable(studentId, group, firstName, lastName, gender, birthday) {
    const tbody = document.querySelector('#studentsTable tbody');
    const newRow = document.createElement('tr');

    const dateObj = new Date(birthday);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedBirthday = `${day}.${month}.${year}`;
    
    newRow.setAttribute('data-id', studentId);
    newRow.innerHTML = `
      <td><input type="checkbox" id="student-${studentId}" class="student-checkbox" aria-label="Select ${firstName} ${lastName}"
             title="Student ID: ${studentId}"/>
      <label for="student-${studentId}" class="visually-hidden">Select ${firstName} ${lastName}</label></td>
      <td>${group}</td>
      <td>${firstName} ${lastName}</td>
      <td>${gender}</td>
      <td>${formattedBirthday}</td>
      <td><span class="status status-inactive"></span></td>
      <td>
        <button class="edit-btn" aria-label="Edit student">
          <i class="fa fa-pencil" title="Edit student"></i>
        </button>
        <button class="delete-btn" aria-label="Delete student">
          <i class="fa fa-remove" title="Delete student"></i>
        </button>
      </td>
    `;
  
    tbody.appendChild(newRow);
    newRow.querySelector('input[type="checkbox"]').addEventListener('change', updateSelectAllCheckbox);
  }

  function clearAllErrors() {
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    document.querySelectorAll('.error-message').forEach(msg => msg.textContent = '');
  }

  window.addEventListener('click', (e) => {
    if (e.target === confirmModal) {
      confirmModal.style.display = 'none';
    }
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === studentModal) {
      studentModal.style.display = 'none';
      document.getElementById('studentForm').reset();
      clearAllErrors();
    }
  });

const Editfields = [
  { id: 'editFirstName', message: 'Please enter first name', pattern: /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/, patternMessage: 'Only letters allowed' },
  { id: 'editLastName', message: 'Please enter last name', pattern: /^[A-Za-zА-Яа-яІіЇїЄєҐґ]+$/, patternMessage: 'Only letters allowed' },
  { id: 'editBirthday', message: 'Please select birthday', validateDate: true }
];

Editfields.forEach(({ id, pattern, patternMessage, validateDate }) => {
  const input = document.getElementById(id);
  input.addEventListener('input', () => {
    const errorMsg = input.parentElement.querySelector('.error-message');

    if (input.value.trim() !== '') {
      input.classList.remove('error');
      if (errorMsg) errorMsg.textContent = '';

      if (pattern && !pattern.test(input.value)) {
        input.classList.add('error');
        errorMsg.textContent = patternMessage;
      }

      if (validateDate) {
        const year = new Date(input.value).getFullYear();
        if (year < 2000 || year > 2007) {
          input.classList.add('error');
          errorMsg.textContent = 'Year must be between 2000 and 2007';
        }
      }
    }
  });
});

document.getElementById('editSaveBtn').addEventListener('click', () => {
  let isFormValid = true;

  Editfields.forEach(({ id, message, pattern, patternMessage, validateDate }) => {
    const input = document.getElementById(id);
    const errorMsg = input.parentElement.querySelector('.error-message');

    if (!input.value.trim()) {
      isFormValid = false;
      input.classList.add('error');
      errorMsg.textContent = message;
    } else if (pattern && !pattern.test(input.value)) {
      isFormValid = false;
      input.classList.add('error');
      errorMsg.textContent = patternMessage;
    } else if (validateDate) {
      const year = new Date(input.value).getFullYear();
      if (year < 2000 || year > 2007) {
        isFormValid = false;
        input.classList.add('error');
        errorMsg.textContent = 'Year must be between 2000 and 2007';
      }
    }
  });

  if (isFormValid) {
    const studentId = document.getElementById('editStudentId').value;
    const group = document.getElementById('editGroup').value;
    const firstName = document.getElementById('editFirstName').value.trim();
    const lastName = document.getElementById('editLastName').value.trim();
    const gender = document.getElementById('editGender').value;
    const birthday = document.getElementById('editBirthday').value;

    const dateObj = new Date(birthday);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const formattedBirthday = `${day}.${month}.${year}`;

    rowToEdit.cells[1].textContent = group;
    rowToEdit.cells[2].textContent = `${firstName} ${lastName}`;
    rowToEdit.cells[3].textContent = gender;
    rowToEdit.cells[4].textContent = formattedBirthday;

    const studentData = {
      studentId,
      group,
      firstName,
      lastName,
      gender,
      birthday: formattedBirthday,
    };

    console.log('Updated Student Data:', JSON.stringify(studentData));

    document.getElementById('editStudentModal').style.display = 'none';
    document.getElementById('editStudentForm').reset();
    rowToEdit = null;
  }
});

document.getElementById('editCancelBtn').addEventListener('click', () => {
  document.getElementById('editStudentModal').style.display = 'none';
  document.getElementById('editStudentForm').reset();
  rowToEdit = null;
});

document.querySelector('#editStudentModal .edit-close').addEventListener('click', () => {
  document.getElementById('editStudentModal').style.display = 'none';
  document.getElementById('editStudentForm').reset();
  rowToEdit = null;
});

window.addEventListener('click', (e) => {
  const editModal = document.getElementById('editStudentModal');
  if (e.target === editModal) {
    editModal.style.display = 'none';
    document.getElementById('editStudentForm').reset();
    rowToEdit = null;
  }
});

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

  const selectAllCheckbox = document.getElementById('selectAll');
  selectAllCheckbox.addEventListener('change', () => {
    const studentCheckboxes = document.querySelectorAll('#studentsTable tbody input[type="checkbox"]');
    studentCheckboxes.forEach(chk => {
      chk.checked = selectAllCheckbox.checked;
    });
  });
  
  function updateSelectAllCheckbox() {
    const studentCheckboxes = document.querySelectorAll('#studentsTable tbody input[type="checkbox"]');
    const allChecked = Array.from(studentCheckboxes).every(chk => chk.checked);
    selectAllCheckbox.checked = allChecked;
  }
  
  document.querySelectorAll('#studentsTable tbody input[type="checkbox"]').forEach(chk => {
    chk.addEventListener('change', updateSelectAllCheckbox);
  });

  const confirmDeleteAllModal = document.getElementById('confirmDeleteAllModal');
  const confirmDeleteAllText = document.getElementById('confirmDeleteAllText');
  const cancelDeleteAllBtn = document.getElementById('cancelDeleteAllBtn');
  const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
  const deleteAllBtn = document.getElementById('deleteAllBtn');
  let rowsToDelete = [];

  deleteAllBtn.addEventListener('click', () => {
    const checkboxes = document.querySelectorAll('#studentsTable tbody input[type="checkbox"]');
    const checkedCheckboxes = Array.from(checkboxes).filter(chk => chk.checked);

    if (checkedCheckboxes.length === 0) {
      alert("Please select at least one student to delete.");
      return;
    }

    if (checkedCheckboxes.length === checkboxes.length) {
      confirmDeleteAllText.textContent = "Are you sure you want to delete all students?";
    } else {
      confirmDeleteAllText.textContent = `Are you sure you want to delete selected student (${checkedCheckboxes.length})?`;
    }

    const idsToDelete = checkedCheckboxes.map(chk => chk.closest('tr').dataset.id);
    rowsToDelete = idsToDelete;
    confirmDeleteAllModal.style.display = 'block';
  });

  cancelDeleteAllBtn.addEventListener('click', () => {
    confirmDeleteAllModal.style.display = 'none';
    rowsToDelete = [];
  });

  confirmDeleteAllBtn.addEventListener('click', () => {
    rowsToDelete.forEach(id => {
      const row = document.querySelector(`tr[data-id="${id}"]`);
      if (row) {
        row.remove();
      }
    });
    rowsToDelete = [];
    confirmDeleteAllModal.style.display = 'none';
    document.getElementById('selectAll').checked = false;
  });

  confirmDeleteAllModal.querySelector('.close').addEventListener('click', () => {
    confirmDeleteAllModal.style.display = 'none';
    rowsToDelete = [];
  });

  window.addEventListener('click', (e) => {
    if (e.target === confirmDeleteAllModal) {
      confirmDeleteAllModal.style.display = 'none';
      rowsToDelete = [];
    }
  });

});