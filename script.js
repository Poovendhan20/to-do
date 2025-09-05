// --- Page Elements ---
const welcomeScreen = document.getElementById('welcome-screen');
const nameForm = document.getElementById('name-form');
const nameInput = document.getElementById('name-input');
const appContainer = document.getElementById('app-container');
const appTitle = document.getElementById('app-title');
const greeting = document.getElementById('greeting'); // Added for potential future use

// --- To-Do App Elements ---
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const taskCountElement = document.getElementById('task-count');
const emptyStateElement = document.getElementById('empty-state');
const controlsElement = document.getElementById('controls');
const filterButtons = document.querySelectorAll('.filter-btn');
const clearCompletedButton = document.getElementById('clear-completed');
const dateInput = document.getElementById('task-date-input');
const timeInput = document.getElementById('task-time-input');

let currentFilter = 'all';

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', () => {
    checkForName();
    loadTasks();
    updateUI();
});

// --- Name Handling ---
function checkForName() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        showApp(userName);
    } else {
        showWelcomeScreen();
    }
}

nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userName = nameInput.value.trim();
    if (userName) {
        localStorage.setItem('userName', userName);
        showApp(userName);
    }
});

function showWelcomeScreen() {
    appContainer.classList.add('hidden');
    welcomeScreen.classList.remove('hidden');
}

function showApp(name) {
    welcomeScreen.classList.add('hidden');
    appContainer.classList.remove('hidden');
    appTitle.textContent = `${name}'s Tasks`;
    greeting.textContent = `Let's get organized, ${name}!`;
}


// --- To-Do App Logic ---

// Event listener for adding a new task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value.trim();
    const taskDate = dateInput.value;
    const taskTime = timeInput.value;

    if (taskText !== '') {
        addTask(taskText, false, taskDate, taskTime);
        taskInput.value = '';
        dateInput.value = '';
        timeInput.value = '';
        taskInput.focus();
        saveTasks();
        updateUI();
    }
});

// Function to create and add a task to the DOM
function addTask(text, isCompleted = false, date = '', time = '') {
    const taskItem = document.createElement('li');
    // Updated to remove styling classes now handled by style.css
    taskItem.className = 'task-item flex items-center justify-between cursor-pointer';
    if (isCompleted) {
        taskItem.classList.add('completed');
    }
    taskItem.dataset.date = date;
    taskItem.dataset.time = time;


    // Wrapper for text and date/time
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'flex-grow'; 

    // Task text
    const taskTextElement = document.createElement('span');
    taskTextElement.textContent = text;
    taskTextElement.className = 'task-text';
    contentWrapper.appendChild(taskTextElement);

    // Date and Time display
    if (date || time) {
        const dateTimeElement = document.createElement('div');
        dateTimeElement.className = 'text-xs text-secondary-color mt-1'; // Use new color class
        
        let dateTimeString = '';
        if (date) {
            const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
            dateTimeString += formattedDate;
        }
        if (time) {
            // More robust time formatting
            const [hours, minutes] = time.split(':');
            const dateForFormatting = new Date(1970, 0, 1, hours, minutes);
            const formattedTime = dateForFormatting.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit', hour12: true });
            dateTimeString += (date ? ' @ ' : '') + formattedTime;
        }
        dateTimeElement.textContent = dateTimeString;
        contentWrapper.appendChild(dateTimeElement);
    }
    
    taskItem.appendChild(contentWrapper);

    // Toggle completion on click (now on the whole item)
    taskItem.addEventListener('click', (e) => {
        taskItem.classList.toggle('completed');
        saveTasks();
        updateUI();
    });

    taskList.appendChild(taskItem);
}


// --- Event Listeners for new features ---

// Filter tasks
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Updated to only toggle the 'active' class
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentFilter = button.dataset.filter;
        filterTasks();
    });
});

// Clear completed tasks
clearCompletedButton.addEventListener('click', () => {
    const completedTasks = document.querySelectorAll('.task-item.completed');
    completedTasks.forEach(task => {
        task.classList.add('removing');
        task.addEventListener('animationend', () => {
            taskList.removeChild(task);
            saveTasks();
            updateUI();
        });
    });
    if (completedTasks.length === 0) {
         // If no tasks were removed, still update UI in case something is out of sync
         updateUI();
    }
});


// --- UI Update Functions ---

function updateUI() {
    updateTaskCount();
    checkEmptyState();
    filterTasks();
}

function filterTasks() {
    const tasks = document.querySelectorAll('.task-item');
    tasks.forEach(task => {
        let show = false;
        const isCompleted = task.classList.contains('completed');
        switch (currentFilter) {
            case 'active':
                if (!isCompleted) show = true;
                break;
            case 'completed':
                if (isCompleted) show = true;
                break;
            case 'all':
            default:
                show = true;
                break;
        }
        task.style.display = show ? 'flex' : 'none';
    });
}

function updateTaskCount() {
    const activeTasks = document.querySelectorAll('.task-item:not(.completed)').length;
    taskCountElement.textContent = `${activeTasks} item${activeTasks !== 1 ? 's' : ''} left`;
}

function checkEmptyState() {
    const totalTasks = document.querySelectorAll('.task-item').length;
    if (totalTasks === 0) {
        emptyStateElement.classList.remove('hidden');
        taskList.classList.add('hidden');
        controlsElement.classList.add('hidden');
    } else {
        emptyStateElement.classList.add('hidden');
        taskList.classList.remove('hidden');
        controlsElement.classList.remove('hidden');
    }
}


// --- Local Storage Functions ---

// Function to save tasks to local storage
function saveTasks() {
    const tasks = [];
    document.querySelectorAll('#task-list li').forEach(taskItem => {
        tasks.push({
            text: taskItem.querySelector('.task-text').textContent,
            completed: taskItem.classList.contains('completed'),
            date: taskItem.dataset.date,
            time: taskItem.dataset.time
        });
    });
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks'));
    if (tasks) {
        tasks.forEach(task => addTask(task.text, task.completed, task.date, task.time));
    }
}