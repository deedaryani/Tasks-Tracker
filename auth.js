/* Client-side authorisation for Tasks Tracker.

   NOTE: this app has no backend/server, so there's nowhere secure
   to check a password. Accounts and (hashed) passwords are stored
   in the browser's localStorage. This keeps tasks private *per
   browser profile* and stops someone from casually opening the
   app and seeing another user's list - it is NOT real security,
   since anyone with dev tools could read localStorage directly. */

const USERS_STORAGE_KEY   = 'ttUsers';          // { username: passwordHash }
const SESSION_STORAGE_KEY = 'ttCurrentUser';     // username of whoever is logged in

const authContainer     = document.getElementById('authContainer');
const appContainer      = document.getElementById('appContainer');
const authForm          = document.getElementById('authForm');
const authHeading       = document.getElementById('authHeading');
const authSubtext       = document.getElementById('authSubtext');
const authUsernameField = document.getElementById('authUsernameField');
const authPasswordField = document.getElementById('authPasswordField');
const authErrorMessage  = document.getElementById('authErrorMessage');
const authSubmitButton  = document.getElementById('authSubmitButton');
const authSwitchButton  = document.getElementById('authSwitchButton');
const authSwitchText    = document.getElementById('authSwitchText');
const logoutButton      = document.getElementById('logoutButton');
const loggedInUsername  = document.getElementById('loggedInUsername');

let authMode = 'login'; // or 'signup'

/* a small, non-cryptographic hash - good enough to avoid storing
   plain-text passwords for a client-only demo app, nothing more */
function hashPassword(password) {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = ((hash * 33) ^ password.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function getStoredUsers() {
  return JSON.parse(localStorage.getItem(USERS_STORAGE_KEY)) || {};
}

function saveStoredUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function showAuthError(message) {
  authErrorMessage.textContent = message;
  authErrorMessage.classList.add('showError');
}

function hideAuthError() {
  authErrorMessage.textContent = '';
  authErrorMessage.classList.remove('showError');
}

/* flip the form between "log in" and "sign up" */
function setAuthMode(mode) {
  authMode = mode;
  hideAuthError();
  authPasswordField.value = '';

  if (mode === 'signup') {
    authHeading.textContent = 'Sign up';
    authSubtext.textContent = 'Create an account to start tracking tasks.';
    authSubmitButton.textContent = 'Sign up';
    authSwitchText.textContent = 'Already have an account?';
    authSwitchButton.textContent = 'Log in';
    authPasswordField.autocomplete = 'new-password';
  } else {
    authHeading.textContent = 'Log in';
    authSubtext.textContent = 'Log in to see your tasks.';
    authSubmitButton.textContent = 'Log in';
    authSwitchText.textContent = "Don't have an account?";
    authSwitchButton.textContent = 'Sign up';
    authPasswordField.autocomplete = 'current-password';
  }
}

function handleSignup(username, password) {
  if (username.length < 3) {
    return 'Username needs to be at least 3 characters.';
  }
  if (password.length < 4) {
    return 'Password needs to be at least 4 characters.';
  }
  let users = getStoredUsers();
  if (users[username]) {
    return 'That username is already taken.';
  }
  users[username] = hashPassword(password);
  saveStoredUsers(users);
  logInAs(username);
  return null;
}

function handleLogin(username, password) {
  let users = getStoredUsers();
  if (!users[username] || users[username] !== hashPassword(password)) {
    return 'Wrong username or password.';
  }
  logInAs(username);
  return null;
}

function logInAs(username) {
  localStorage.setItem(SESSION_STORAGE_KEY, username);
  showApp(username);
}

function showApp(username) {
  authContainer.style.display = 'none';
  appContainer.style.display = '';
  loggedInUsername.textContent = username;
  initTasksApp(username);
}

function showAuthScreen() {
  appContainer.style.display = 'none';
  authContainer.style.display = 'flex';
  authUsernameField.value = '';
  authPasswordField.value = '';
  hideAuthError();
  authUsernameField.focus();
}

function logOut() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  resetTasksApp();
  setAuthMode('login');
  showAuthScreen();
}

authForm.addEventListener('submit', function (e) {
  e.preventDefault();
  hideAuthError();

  let username = authUsernameField.value.trim();
  let password = authPasswordField.value;

  if (!username || !password) {
    showAuthError('Fill in both fields.');
    return;
  }

  let error = authMode === 'signup'
    ? handleSignup(username, password)
    : handleLogin(username, password);

  if (error) showAuthError(error);
});

authSwitchButton.addEventListener('click', function () {
  setAuthMode(authMode === 'login' ? 'signup' : 'login');
});

logoutButton.addEventListener('click', logOut);

/* on page load, resume the session if someone's already logged in */
(function restoreSession() {
  let existingUsername = localStorage.getItem(SESSION_STORAGE_KEY);
  let users = getStoredUsers();
  if (existingUsername && users[existingUsername]) {
    showApp(existingUsername);
  } else {
    showAuthScreen();
  }
})();
