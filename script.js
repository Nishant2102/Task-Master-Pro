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
        taskItem.draggable = true;
        taskItem.dataset.id = item.id;
        taskItem.innerHTML = `
            <span>${item.time || item.date || ''} ${item.task || item.event || item.area}</span>
            <button onclick="removeItem('${item.id}', '${containerId}')">Remove</button>
        `;
        
        // Add event listeners for both mouse and touch events
        taskItem.addEventListener('mousedown', dragStart);
        taskItem.addEventListener('touchstart', dragStart, {passive: false});
        
        container.appendChild(taskItem);
    });
    saveData(containerId);
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
let touchStartY = 0;
let touchStartX = 0;

function dragStart(event) {
    event.preventDefault(); // Prevent default behavior
    draggedItem = event.target.closest('.task-item');
    
    if (event.type === 'touchstart') {
        touchStartY = event.touches[0].clientY;
        touchStartX = event.touches[0].clientX;
    } else {
        touchStartY = event.clientY;
        touchStartX = event.clientX;
    }
    
    setTimeout(() => {
        draggedItem.style.opacity = '0.5';
    }, 0);
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMove, {passive: false});
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
}

function dragMove(event) {
    event.preventDefault();
    if (!draggedItem) return;

    let clientY, clientX;
    if (event.type === 'touchmove') {
        clientY = event.touches[0].clientY;
        clientX = event.touches[0].clientX;
    } else {
        clientY = event.clientY;
        clientX = event.clientX;
    }
    
    // Get all task lists
    const taskLists = document.querySelectorAll('.task-list');
    
    // Find the list the pointer is currently over
    let targetList = null;
    for (const list of taskLists) {
        const rect = list.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
            targetList = list;
            break;
        }
    }
    
    if (targetList) {
        const items = Array.from(targetList.children);
        let closestItem = null;
        let closestDistance = Infinity;
        
        items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const distance = Math.abs(clientY - (rect.top + rect.height / 2));
            if (distance < closestDistance) {
                closestItem = item;
                closestDistance = distance;
            }
        });
        
        if (closestItem !== draggedItem) {
            const isBefore = clientY < closestItem.getBoundingClientRect().top + closestItem.offsetHeight / 2;
            targetList.insertBefore(draggedItem, isBefore ? closestItem : closestItem.nextSibling);
        }
    }
}

function dragEnd(event) {
    if (!draggedItem) return;
    
    draggedItem.style.opacity = '1';
    
    const newContainerId = draggedItem.closest('.task-list').id;
    const oldContainerId = getItemListId(draggedItem.dataset.id);
    
    if (newContainerId !== oldContainerId) {
        moveItem(draggedItem.dataset.id, oldContainerId, newContainerId);
    }
    
    draggedItem = null;
    
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('touchmove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
    document.removeEventListener('touchend', dragEnd);
}

function getItemListId(itemId) {
    if (todaysTasks.some(task => task.id === itemId)) return 'todaysTasks';
    if (recentEvents.some(event => event.id === itemId)) return 'recentEvents';
    if (dailyChecks.some(check => check.id === itemId)) return 'dailyChecks';
    if (focusAreas.some(area => area.id === itemId)) return 'focusAreas';
    return null;
}

function moveItem(itemId, sourceContainerId, destinationContainerId) {
    let item;
    let sourceList, destinationList;

    switch (sourceContainerId) {
        case 'todaysTasks':
            sourceList = todaysTasks;
            break;
        case 'recentEvents':
            sourceList = recentEvents;
            break;
        case 'dailyChecks':
            sourceList = dailyChecks;
            break;
        case 'focusAreas':
            sourceList = focusAreas;
            break;
    }

    switch (destinationContainerId) {
        case 'todaysTasks':
            destinationList = todaysTasks;
            break;
        case 'recentEvents':
            destinationList = recentEvents;
            break;
        case 'dailyChecks':
            destinationList = dailyChecks;
            break;
        case 'focusAreas':
            destinationList = focusAreas;
            break;
    }

    item = sourceList.find(i => i.id === itemId);
    sourceList = sourceList.filter(i => i.id !== itemId);
    destinationList.push(item);

    // Update the global variables
    switch (sourceContainerId) {
        case 'todaysTasks':
            todaysTasks = sourceList;
            break;
        case 'recentEvents':
            recentEvents = sourceList;
            break;
        case 'dailyChecks':
            dailyChecks = sourceList;
            break;
        case 'focusAreas':
            focusAreas = sourceList;
            break;
    }

    switch (destinationContainerId) {
        case 'todaysTasks':
            todaysTasks = destinationList;
            break;
        case 'recentEvents':
            recentEvents = destinationList;
            break;
        case 'dailyChecks':
            dailyChecks = destinationList;
            break;
        case 'focusAreas':
            focusAreas = destinationList;
            break;
    }

    renderList(sourceList, sourceContainerId);
    renderList(destinationList, destinationContainerId);
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
function initializeTabs() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            button.classList.add('active');
            document.getElementById(button.dataset.tab).classList.add('active');
        });
    });
}

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

// Initial Rendering
window.onload = function() {
    loadData();
    initializeTabs();
    document.addEventListener('touchmove', function(event) {
        if (draggedItem) {
            event.preventDefault();
        }
    }, {passive: false});
};
