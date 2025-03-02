document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('auth-form');
    const toggleAuthButton = document.getElementById('toggle-auth');
    const authTitle = document.getElementById('auth-title');
    const taskForm = document.getElementById('task-form');
    const taskListTodo = document.getElementById('task-list-todo');
    const taskListInProgress = document.getElementById('task-list-inprogress');
    const taskListDone = document.getElementById('task-list-done');
    const todoApp = document.getElementById('todo-app');
    const authSection = document.getElementById('auth');
    const taskModal = document.getElementById('task-modal');
    const openTaskModalButton = document.getElementById('open-task-modal');
    const closeTaskModalButton = document.querySelector('.close');

    let currentUser = null;
    let isLogin = false;

    toggleAuthButton.addEventListener('click', () => {
        isLogin = !isLogin;
        authTitle.textContent = isLogin ? 'Login' : 'Sign Up';
        toggleAuthButton.textContent = isLogin ? 'Switch to Sign Up' : 'Switch to Login';
    });

    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (isLogin) {
            if (localStorage.getItem(username) === password) {
                currentUser = username;
                authSection.style.display = 'none';
                todoApp.style.display = 'block';
                loadTasks();
            } else {
                alert('Invalid username or password');
            }
        } else {
            if (username && password) {
                localStorage.setItem(username, password);
                alert('User registered successfully!');
                authForm.reset();
            }
        }
    });

    openTaskModalButton.addEventListener('click', () => {
        taskModal.style.display = 'block';
    });

    closeTaskModalButton.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    };

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const desc = document.getElementById('task-desc').value;
        const deadline = document.getElementById('task-deadline').value;

        if (title && desc && deadline) {
            const task = {
                title,
                desc,
                deadline,
                status: 'todo',
                user: currentUser
            };
            saveTask(task);
            loadTasks();
            taskForm.reset();
            taskModal.style.display = 'none';
        }
    });

    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        taskListTodo.innerHTML = '';
        taskListInProgress.innerHTML = '';
        taskListDone.innerHTML = '';
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.user === currentUser);
        tasks.forEach(task => {
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';
            taskDiv.draggable = true;
            taskDiv.innerHTML = `
                <div>
                    <h3>${task.title}</h3>
                    <p>${task.desc}</p>
                    <small>Deadline: ${task.deadline}</small>
                </div>
                <div>
                    <button onclick="deleteTask('${task.title}')">X</button>
                </div>
            `;
            taskDiv.addEventListener('dragstart', () => {
                taskDiv.classList.add('dragging');
            });
            taskDiv.addEventListener('dragend', () => {
                taskDiv.classList.remove('dragging');
            });
            if (task.status === 'todo') {
                taskListTodo.appendChild(taskDiv);
            } else if (task.status === 'inprogress') {
                taskListInProgress.appendChild(taskDiv);
            } else if (task.status === 'done') {
                taskListDone.appendChild(taskDiv);
            }
        });
    }

    function updateTaskStatus(title, newStatus) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            if (task.title === title && task.user === currentUser) {
                task.status = newStatus;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }

    window.deleteTask = function(title) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => !(task.title === title && task.user === currentUser && task.status !== 'done'));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    };

    const taskLists = document.querySelectorAll('.task-list');
    taskLists.forEach(taskList => {
        taskList.addEventListener('dragover', (e) => {
            e.preventDefault();
            const draggingTask = document.querySelector('.dragging');
            taskList.appendChild(draggingTask);
        });

        taskList.addEventListener('drop', (e) => {
            const draggingTask = document.querySelector('.dragging');
            const newStatus = taskList.id.split('-')[2];
            const title = draggingTask.querySelector('h3').textContent;
            updateTaskStatus(title, newStatus);
        });
    });
});