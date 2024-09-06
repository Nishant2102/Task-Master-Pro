// Global Variables
let todaysTasks = [];
let recentEvents = [];
let dailyChecks = [];
let focusAreas = [];

// Utility Functions
function renderList(list, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    list.forEach(item => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.draggable = true;  // Make tasks draggable
        taskItem.dataset.id = item.id; // Assign id to draggable items
        taskItem.innerHTML = `
            <span>${item.time || item.date || ''} ${item.task || item.event || item.area}</span>
            <button onclick="removeItem('${item.id}', '${containerId}')">Remove</button>
        `;
        
        // Add drag event listeners
        taskItem.addEventListener('dragstart', dragStart);
        taskItem.addEventListener('dragend', dragEnd);

        container.appendChild(taskItem);
    });
    saveData(containerId);  // Save data every time list is rendered
}

function addTask() {
    const time = document.getElementById('newTaskTime').value;
    const task = document.getElementById('newTaskInput').value;
    if (time && task) {
        const newTask = { id: Date.now().toString(), time, task };
        todaysTasks.push(newTask);
        renderList(todaysTasks, 'todaysTasks');
        document.getElementById('newTaskTime').value = '';
        document.getElementById('newTaskInput').value = '';
    }
}

function addEvent() {
    const date = document.getElementById('newEventDate').value;
    const event = document.getElementById('newEventInput').value;
    if (date && event) {
        const newEvent = { id: Date.now().toString(), date, event };
        recentEvents.push(newEvent);
        renderList(recentEvents, 'recentEvents');
        document.getElementById('newEventDate').value = '';
        document.getElementById('newEventInput').value = '';
    }
}

function addDailyCheck() {
    const task = document.getElementById('newDailyCheck').value;
    if (task) {
        const newCheck = { id: Date.now().toString(), task };
        dailyChecks.push(newCheck);
        renderList(dailyChecks, 'dailyChecks');
        document.getElementById('newDailyCheck').value = '';
    }
}

function addFocusArea() {
    const area = document.getElementById('newFocusArea').value;
    if (area) {
        const newArea = { id: Date.now().toString(), area };
        focusAreas.push(newArea);
        renderList(focusAreas, 'focusAreas');
        document.getElementById('newFocusArea').value = '';
    }
}

function removeItem(id, containerId) {
    switch (containerId) {
        case 'todaysTasks':
            todaysTasks = todaysTasks.filter(item => item.id !== id);
            renderList(todaysTasks, 'todaysTasks');
            break;
        case 'recentEvents':
            recentEvents = recentEvents.filter(item => item.id !== id);
            renderList(recentEvents, 'recentEvents');
            break;
        case 'dailyChecks':
            dailyChecks = dailyChecks.filter(item => item.id !== id);
            renderList(dailyChecks, 'dailyChecks');
            break;
        case 'focusAreas':
            focusAreas = focusAreas.filter(item => item.id !== id);
            renderList(focusAreas, 'focusAreas');
            break;
    }
}

// Drag & Drop Functions
let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    setTimeout(() => event.target.style.display = 'none', 0);
}

function dragEnd(event) {
    setTimeout(() => {
        draggedItem.style.display = 'block';
        draggedItem = null;
    }, 0);
}

function handleDragOver(event) {
    event.preventDefault();  // Necessary to allow drop
}

function handleDrop(event, containerId) {
    const itemId = draggedItem.dataset.id;
    const sourceContainerId = draggedItem.closest('.task-list').id;

    moveItem(itemId, sourceContainerId, containerId);
}

function moveItem(itemId, sourceContainerId, destinationContainerId) {
    let item;

    // Find the item in the source list
    switch (sourceContainerId) {
        case 'todaysTasks':
            item = todaysTasks.find(task => task.id === itemId);
            todaysTasks = todaysTasks.filter(task => task.id !== itemId);
            break;
        case 'recentEvents':
            item = recentEvents.find(event => event.id === itemId);
            recentEvents = recentEvents.filter(event => event.id !== itemId);
            break;
        case 'dailyChecks':
            item = dailyChecks.find(check => check.id === itemId);
            dailyChecks = dailyChecks.filter(check => check.id !== itemId);
            break;
        case 'focusAreas':
            item = focusAreas.find(area => area.id === itemId);
            focusAreas = focusAreas.filter(area => area.id !== itemId);
            break;
    }

    // Move the item to the destination list
    switch (destinationContainerId) {
        case 'todaysTasks':
            todaysTasks.push(item);
            renderList(todaysTasks, 'todaysTasks');
            break;
        case 'recentEvents':
            recentEvents.push(item);
            renderList(recentEvents, 'recentEvents');
            break;
        case 'dailyChecks':
            dailyChecks.push(item);
            renderList(dailyChecks, 'dailyChecks');
            break;
        case 'focusAreas':
            focusAreas.push(item);
            renderList(focusAreas, 'focusAreas');
            break;
    }
}

// Saving and Loading Data from localStorage
function saveData(containerId) {
    switch (containerId) {
        case 'todaysTasks':
            localStorage.setItem('todaysTasks', JSON.stringify(todaysTasks));
            break;
        case 'recentEvents':
            localStorage.setItem('recentEvents', JSON.stringify(recentEvents));
            break;
        case 'dailyChecks':
            localStorage.setItem('dailyChecks', JSON.stringify(dailyChecks));
            break;
        case 'focusAreas':
            localStorage.setItem('focusAreas', JSON.stringify(focusAreas));
            break;
    }
}

function loadData() {
    todaysTasks = JSON.parse(localStorage.getItem('todaysTasks')) || [];
    recentEvents = JSON.parse(localStorage.getItem('recentEvents')) || [];
    dailyChecks = JSON.parse(localStorage.getItem('dailyChecks')) || [];
    focusAreas = JSON.parse(localStorage.getItem('focusAreas')) || [];

    renderList(todaysTasks, 'todaysTasks');
    renderList(recentEvents, 'recentEvents');
    renderList(dailyChecks, 'dailyChecks');
    renderList(focusAreas, 'focusAreas');
}

// Tab Switching
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        button.classList.add('active');
        document.getElementById(button.dataset.tab).classList.add('active');
    });
});

// Adding Drop Zones to Each List
document.querySelectorAll('.task-list').forEach(list => {
    list.addEventListener('dragover', handleDragOver);
    list.addEventListener('drop', (event) => handleDrop(event, list.id));
});

// Initial Rendering
window.onload = loadData;  // Load data when the page is loaded

// Chatbot (Basic Implementation)
function handleChatbotSubmit() {
    const input = document.getElementById('chatbotInput').value;
    if (input.trim()) {
        addChatbotMessage('user', input);
        getChatbotResponse(input);
        document.getElementById('chatbotInput').value = '';
    }
}

function handleChatbotKeypress(event) {
    if (event.key === 'Enter') {
        handleChatbotSubmit();
    }
}

function addChatbotMessage(sender, message) {
    const messageContainer = document.getElementById('chatbotMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `chatbot-message ${sender}`;
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function getChatbotResponse(input) {
    // Simple rule-based chatbot response
    let response;
    if (input.toLowerCase().includes('hello')) {
        response = "Hello! How can I assist you today?";
    } else if (input.toLowerCase().includes('help')) {
        response = "I'm here to help! What do you need assistance with?";
    } else {
        response = "Sorry, I didn't understand that. Can you try rephrasing?";
    }
    addChatbotMessage('bot', response);
}
