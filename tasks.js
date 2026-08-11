/* tasks are loaded per logged-in user once auth.js calls initTasksApp() */
let myTaskList = [];
let taskIdCounter = 1;
let taskListStorageKey = null;
let taskIdCounterStorageKey = null;

/* grab all the elements i need from the page */
const taskInputField       = document.getElementById('taskInputField');
const addTaskButton        = document.getElementById('addTaskButton');
const todoList             = document.getElementById('todoList');
const completedList        = document.getElementById('completedList');
const errorMessage         = document.getElementById('errorMessage');
const progressRingFill     = document.getElementById('progressRingFill');
const progressRingText     = document.getElementById('progressRingPercentText');
const pendingCount         = document.getElementById('pendingCount');
const completedCount       = document.getElementById('completedCount');
const completedSection     = document.getElementById('completedSection');
const pendingSectionLabel  = document.getElementById('pendingSectionLabel');
const ringCircumference    = 138.2;

/* icons for the buttons */
const editIcon   = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>`;
const trashIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
const checkIcon  = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
const cancelIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

/* check if the task is valid before adding it */
function checkIfTaskIsValid(taskText) {
  if (!taskText.trim()) {
    return 'Write something first.';
  }

  let alreadyExists = myTaskList.some(function(task) {
    return task.text.toLowerCase() === taskText.trim().toLowerCase();
  });
  if (alreadyExists) {
    return 'That task is already on the list.';
  }
  return null;
}

/* add a new task to the list */
function addNewTask() {
  let validationError = checkIfTaskIsValid(taskInputField.value);
  if (validationError) {
    showErrorMessage(validationError);
    return;
  }
  hideErrorMessage();
  myTaskList.push({
    id: taskIdCounter,
    text: taskInputField.value.trim(),
    done: false
  });
  taskIdCounter = taskIdCounter + 1;
  taskInputField.value = '';
  updateThePage();
  taskInputField.focus();
}

/* remove a task from the array by its id */
function deleteTask(taskId) {
  myTaskList = myTaskList.filter(function(task) {
    return task.id !== taskId;
  });
  updateThePage();
}

/* flip the done/not done status */
function markTaskAsDone(taskId) {
  myTaskList = myTaskList.map(function(task) {
    if (task.id === taskId) {
      return { id: task.id, text: task.text, done: !task.done };
    }
    return task;
  });
  updateThePage();
}

/* switch a task row into edit mode */
function startEditingTask(taskId) {
  let taskRow = document.querySelector('[data-id="' + taskId + '"]');
  if (!taskRow) return;

  let taskData = myTaskList.find(function(task) { return task.id === taskId; });
  taskRow.classList.add('isBeingEdited');

  let taskTextSpan = taskRow.querySelector('.taskText');
  let buttonsGroup = taskRow.querySelector('.taskButtonsGroup');

  /* replace the text with an input field */
  let editInputBox = document.createElement('input');
  editInputBox.type = 'text';
  editInputBox.className = 'taskEditInputBox';
  editInputBox.value = taskData.text;
  editInputBox.maxLength = 200;
  taskTextSpan.replaceWith(editInputBox);
  editInputBox.focus();
  editInputBox.select();

  /* swap the edit/delete buttons for save/cancel */
  buttonsGroup.innerHTML =
    '<li><button class="iconButton saveButton" title="Save">' + checkIcon + '</button></li>' +
    '<li><button class="iconButton deleteButton" title="Cancel">' + cancelIcon + '</button></li>';

  buttonsGroup.children[0].addEventListener('click', function() {
    saveEditedTask(taskId, editInputBox);
  });
  buttonsGroup.children[1].addEventListener('click', function() {
    updateThePage();
  });

  editInputBox.addEventListener('keydown', function(keyEvent) {
    if (keyEvent.key === 'Enter')  saveEditedTask(taskId, editInputBox);
    if (keyEvent.key === 'Escape') updateThePage();
  });
}

/* save the edited text */
function saveEditedTask(taskId, editInputBox) {
  let newTaskText = editInputBox.value.trim();
  let isDuplicate = myTaskList.find(function(task) {
    return task.id !== taskId && task.text.toLowerCase() === newTaskText.toLowerCase();
  });
  if (!newTaskText || isDuplicate) {
    editInputBox.classList.add('inputHasError');
    return;
  }
  myTaskList = myTaskList.map(function(task) {
    if (task.id === taskId) {
      return { id: task.id, text: newTaskText, done: task.done };
    }
    return task;
  });
  updateThePage();
}

/* build one task row element */
function createTaskRow(taskData) {
  let listItem = document.createElement('li');
  listItem.className = 'taskItem' + (taskData.done ? ' completedTask' : '');
  listItem.dataset.id = taskData.id;
  listItem.innerHTML =
    '<input type="checkbox" class="taskCheckbox" ' + (taskData.done ? 'checked' : '') + ' aria-label="' + (taskData.done ? 'Mark undone' : 'Mark done') + '" />' +
    '<p class="taskText">' + taskData.text + '</p>' +
    '<menu class="taskButtonsGroup">' +
      '<li><button class="iconButton" title="Edit" aria-label="Edit task">' + editIcon + '</button></li>' +
      '<li><button class="iconButton deleteButton" title="Delete" aria-label="Delete task">' + trashIcon + '</button></li>' +
    '</menu>';

  listItem.querySelector('.taskCheckbox').addEventListener('change', function() {
    markTaskAsDone(taskData.id);
  });
  listItem.querySelectorAll('.iconButton')[0].addEventListener('click', function() {
    startEditingTask(taskData.id);
  });
  listItem.querySelectorAll('.iconButton')[1].addEventListener('click', function() {
    deleteTask(taskData.id);
  });

  return listItem;
}

/* re-draw the whole page whenever something changes */
function updateThePage() {
  let pendingTasks   = myTaskList.filter(function(task) { return !task.done; });
  let completedTasks = myTaskList.filter(function(task) { return task.done; });
  let totalTasks     = myTaskList.length;

  /* show pending tasks (or the empty state message) */
  todoList.innerHTML = '';
  if (totalTasks === 0) {
    todoList.innerHTML =
      '<li><article class="emptyStateBox">' +
        '<p class="emptyStateIcon">✓</p>' +
        '<h3>All clear</h3>' +
        '<p>Add your first task above<br>to get started.</p>' +
      '</article></li>';
  }
  pendingTasks.forEach(function(task) {
    todoList.appendChild(createTaskRow(task));
  });
  pendingSectionLabel.style.display = pendingTasks.length > 0 ? '' : 'none';

  /* show completed tasks section */
  completedList.innerHTML = '';
  completedTasks.forEach(function(task) {
    completedList.appendChild(createTaskRow(task));
  });
  completedSection.style.display = completedTasks.length > 0 ? '' : 'none';

  /* update the progress ring */
  let percentDone = totalTasks === 0 ? 0 : Math.round(completedTasks.length / totalTasks * 100);
  progressRingFill.style.strokeDashoffset = ringCircumference - (ringCircumference * percentDone / 100);
  progressRingText.textContent = percentDone + '%';

  /* update the stat pills */
  pendingCount.textContent   = pendingTasks.length;
  completedCount.textContent = completedTasks.length;

  /* save everything to localStorage */
  saveToLocalStorage();
}

/* save the current task list to localStorage so it survives a page refresh */
function saveToLocalStorage() {
  if (!taskListStorageKey) return;
  localStorage.setItem(taskListStorageKey, JSON.stringify(myTaskList));
  localStorage.setItem(taskIdCounterStorageKey, JSON.stringify(taskIdCounter));
}

function showErrorMessage(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('showError');
  taskInputField.style.color = 'var(--redColor)';
}

function hideErrorMessage() {
  errorMessage.textContent = '';
  errorMessage.classList.remove('showError');
  taskInputField.style.color = '';
}

/* hook up the form submit */
document.getElementById('addTaskForm').addEventListener('submit', function(e) {
  e.preventDefault();
  addNewTask();
});
taskInputField.addEventListener('input', hideErrorMessage);

/* called by auth.js once a user is logged in, so each account gets its own tasks */
function initTasksApp(username) {
  taskListStorageKey = 'myTaskList_' + username;
  taskIdCounterStorageKey = 'taskIdCounter_' + username;

  myTaskList = JSON.parse(localStorage.getItem(taskListStorageKey)) || [];
  taskIdCounter = JSON.parse(localStorage.getItem(taskIdCounterStorageKey)) || 1;

  updateThePage();
  taskInputField.focus();
}

/* called by auth.js on logout so a new login doesn't inherit the old state */
function resetTasksApp() {
  myTaskList = [];
  taskIdCounter = 1;
  taskListStorageKey = null;
  taskIdCounterStorageKey = null;
}