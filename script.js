
const balance = document.getElementById('balance');
const money_plus = document.getElementById('money-plus');
const money_minus = document.getElementById('money-minus');
const list = document.getElementById('list');
const form = document.getElementById('form');
const text = document.getElementById('text');
const amount = document.getElementById('amount');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const showLoginBtn = document.getElementById('show-login-btn');
const showRegisterBtn = document.getElementById('show-register-btn');
const expenseTracker = document.querySelector('.expense-tracker');
const chartCanvas = document.getElementById('income-expense-chart');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');
// const deleteAccountBtn = document.getElementById('delete-account-btn');


let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = localStorage.getItem('currentUser');

let chart;



// Show login form
function showLoginForm() {
  loginForm.style.display = 'block';
  registerForm.style.display = 'none';
}

// Show register form
function showRegisterForm() {
  registerForm.style.display = 'block';
  loginForm.style.display = 'none';
}

// Show expense tracker
function showExpenseTracker() {
  expenseTracker.style.display = 'block';
  showLoginBtn.style.display = 'none';
  showRegisterBtn.style.display = 'none';
  logoutBtn.style.display = 'block';
//   deleteAccountBtn.style.display = 'block';
  userInfo.style.display = 'block';
  usernameDisplay.textContent = currentUser;
}

// Hide expense tracker
function hideExpenseTracker() {
  expenseTracker.style.display = 'none';
  showLoginBtn.style.display = 'block';
  showRegisterBtn.style.display = 'block';
  logoutBtn.style.display = 'none';
//   deleteAccountBtn.style.display = 'none';
  userInfo.style.display = 'none';
}


// Login event
loginBtn.addEventListener('click', e => {
  e.preventDefault();
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    // if (username === 'user' && password === 'pass') {

    alert('Login successful!');
    currentUser = username;
    localStorage.setItem('currentUser', username);
    showExpenseTracker();
    init();
    loginForm.style.display="none"
  } else {
    alert('Invalid username or password');
  }
});

// Register event
registerBtn.addEventListener('click', e => {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;

  if (users.find(user => user.username === username)) {
    alert('Username already exists!');
    
  } else {
    users.push({ username, password });
    localStorage.setItem('users', JSON.stringify(users));
    alert(`User '${username}' registered successfully!`);
    showExpenseTracker();
    registerForm.style.display="none"
  }
});

// Logout event
logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem('currentUser');
  hideExpenseTracker();
  alert('Logged out successfully.');
});
// Delete account event listener
// deleteAccountBtn.addEventListener('click', () => {
//     if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
//       localStorage.removeItem('currentUser');
//       localStorage.removeItem('transactions');
//       currentUser = null;
//       hideExpenseTracker();
//       alert('Account deleted successfully.');
//     }
//   });

if (currentUser) {
    showExpenseTracker();
  }else {
    hideExpenseTracker();
  }
// Event listeners to show login/register forms
showLoginBtn.addEventListener('click', showLoginForm);
showRegisterBtn.addEventListener('click', showRegisterForm);

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  if (text.value.trim() === '' || amount.value.trim() === '') {
    alert('Please add a transaction and amount');
  } else {
    const transaction = {
      id: generateID(),
      text: text.value,
      amount: +amount.value,
      user: currentUser
    };

    transactions.push(transaction);

    addTransactionDOM(transaction);

    updateValues();

    updateLocalStorage();

    text.value = '';
    amount.value = '';
  }
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 100000000);
}

// Add transactions to DOM list
function addTransactionDOM(transaction) {
  if (transaction.user !== currentUser) return;

  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');

  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span> 
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;

  list.appendChild(item);
}

// Update the balance, income, and expense
function updateValues() {
  const amounts = transactions.filter(transaction => transaction.user === currentUser).map(transaction => transaction.amount);

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  const income = amounts.filter(item => item > 0).reduce((acc, item) => (acc += item), 0).toFixed(2);
  const expense = (amounts.filter(item => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `$${income}`;
  money_minus.innerText = `$${expense}`;
  updateChart(income, expense);
}
function updateChart(income, expense) {
    if (chart) {
      chart.data.datasets[0].data = [income, expense];
      chart.update();
    } else {
      chart = new Chart(chartCanvas, {
        type: 'bar',
        data: {
          labels: ['Income', 'Expense'],
          datasets: [{
            label: 'Amount',
            data: [income, expense],
            backgroundColor: ['#00478F', '#FF5D00']
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  init();
}

// Update local storage transactions
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Init app
function init() {
  list.innerHTML = '';

  if (currentUser) {
    showExpenseTracker();
    transactions.forEach(addTransactionDOM);
    updateValues();
  } else {
    hideExpenseTracker();
  }
}

init();

form.addEventListener('submit', addTransaction);
