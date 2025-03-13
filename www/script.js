document.addEventListener('DOMContentLoaded', () => {
  const confirmModal = document.getElementById('confirmModal');
  const studentNameSpan = document.getElementById('studentName');
  let studentToDelete = null;

  document.querySelector('#studentsTable').addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
     if (deleteButton) {
          const row = e.target.closest('tr');
          const studentName = row.querySelector('td:nth-child(3)').textContent;
          studentNameSpan.textContent = studentName;
          studentToDelete = row;
          confirmModal.style.display = 'block';
      }
  });

  document.querySelector('.close').addEventListener('click', () => {
      confirmModal.style.display = 'none';
  });

  document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
    confirmModal.style.display = 'none';
  });

  document.getElementById('confirmBtn').addEventListener('click', () => {
      if(studentToDelete) {
          studentToDelete.remove();
          studentToDelete = null;
          confirmModal.style.display = 'none';
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
    document.getElementById('studentForm').reset();
    clearAllErrors();
  });

  document.querySelector('#studentModal .close').addEventListener('click', () => {
    studentModal.style.display = 'none';
    document.getElementById('studentForm').reset();
    clearAllErrors();
  });
  
  const fields = [
    { id: 'group', message: 'Please enter group' },
    { id: 'firstName', message: 'Please enter first name' },
    { id: 'lastName', message: 'Please enter last name' },
    { id: 'gender', message: 'Please select gender' },
    { id: 'birthday', message: 'Please select birthday' }
  ];

  fields.forEach(({ id }) => {
    const input = document.getElementById(id);
    input.addEventListener('input', () => {
      if (input.value.trim() !== '') {
        input.classList.remove('error');
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) {
          errorMsg.textContent = '';
        }
      }
    });
  });

  createBtn.addEventListener('click', () => {
    let isFormValid = true;

    fields.forEach(({ id, message }) => {
      const input = document.getElementById(id);
      const wrapper = input.parentElement; 
      const errorMsg = wrapper.querySelector('.error-message');

      if (!input.value.trim()) {
        isFormValid = false;
        input.classList.add('error');
        errorMsg.textContent = message;
      }
    });

    if (isFormValid) {
      const group = document.getElementById('group').value;
      const firstName = document.getElementById('firstName').value;
      const lastName = document.getElementById('lastName').value;
      const gender = document.getElementById('gender').value;
      const birthday = document.getElementById('birthday').value;

      addStudentToTable(group, firstName, lastName, gender, birthday);

      studentModal.style.display = 'none';
      studentForm.reset();
      clearAllErrors();
    }
  });

  function addStudentToTable(group, firstName, lastName, gender, birthday) {
    const tbody = document.querySelector('#studentsTable tbody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
      <td><input type="checkbox" class="student-checkbox"/></td>
      <td>${group}</td>
      <td>${firstName} ${lastName}</td>
      <td>${gender}</td>
      <td>${new Date(birthday).toLocaleDateString()}</td>
      <td><span class="status status-inactive"></span></td>
      <td>
        <button class="edit-btn">
          <i class="fa fa-pencil" title="Edit student"></i>
        </button>
        <button class="delete-btn">
          <i class="fa fa-remove" title="Delete student"></i>
        </button>
      </td>
    `;
  
    tbody.appendChild(newRow);
    
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

let rowToEdit = null;

document.querySelector('#studentsTable').addEventListener('click', (e) => {
  if (e.target.closest('.edit-btn')) {
    const row = e.target.closest('tr');
    rowToEdit = row;

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

    document.getElementById('editGroup').value = group;
    document.getElementById('editFirstName').value = firstName;
    document.getElementById('editLastName').value = lastName;
    document.getElementById('editGender').value = gender;
    document.getElementById('editBirthday').value = isoDate;

    document.getElementById('editStudentModal').style.display = 'block';
  }
});

document.getElementById('editSaveBtn').addEventListener('click', () => {
  if (rowToEdit) {
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

    rowsToDelete = checkedCheckboxes.map(chk => chk.closest('tr'));
    confirmDeleteAllModal.style.display = 'block';
  });

  cancelDeleteAllBtn.addEventListener('click', () => {
    confirmDeleteAllModal.style.display = 'none';
    rowsToDelete = [];
  });

  confirmDeleteAllBtn.addEventListener('click', () => {
    rowsToDelete.forEach(row => row.remove());
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