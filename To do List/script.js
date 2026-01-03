
let tasks = [];


const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const totalTasksSpan = document.getElementById('total-tasks');
const completedTasksSpan = document.getElementById('completed-tasks');
const progressBar = document.getElementById('progress');
const numbersDiv = document.getElementById('numbers');

// Add task
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const text = taskInput.value.trim();
    
    if (text) {
        tasks.push({
            text: text,
            completed: false
        });
        taskInput.value = '';
        updateTasksList();
        updateStats();
    }
});

// Update tasks list
function updateTasksList() {
    taskList.innerHTML = '';
    
    tasks.forEach((task, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';
        
        listItem.innerHTML = `
            <div class="task">
                <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${index})">
                <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            </div>
            <button class="delete-btn" onclick="deleteTask(${index})">×</button>
        `;
        
        taskList.appendChild(listItem);
    });
}


function toggleTask(index) {
    tasks[index].completed = !tasks[index].completed;
    updateTasksList();
    updateStats();
}


function deleteTask(index) {
    tasks.splice(index, 1);
    updateTasksList();
    updateStats();
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    
    totalTasksSpan.textContent = total;
    completedTasksSpan.textContent = completed;
    numbersDiv.textContent = `${completed}/${total}`;
    
 
    if (total > 0) {
        const percentage = (completed / total) * 100;
        progressBar.style.width = percentage + '%';
    } else {
        progressBar.style.width = '0%';
    }

    if (completed === total && total > 0) {
        blashkConfetti();
    }
}


updateStats();

const blashkConfetti = ()=>{
    const count = 200,
  defaults = {
    origin: { y: 0.7 },
  };

function fire(particleRatio, opts) {
  confetti(
    Object.assign({}, defaults, opts, {
      particleCount: Math.floor(count * particleRatio),
    })
  );
}

fire(0.25, {
  spread: 26,
  startVelocity: 55,
});

fire(0.2, {
  spread: 60,
});

fire(0.35, {
  spread: 100,
  decay: 0.91,
  scalar: 0.8,
});

fire(0.1, {
  spread: 120,
  startVelocity: 25,
  decay: 0.92,
  scalar: 1.2,
});

fire(0.1, {
  spread: 120,
  startVelocity: 45,
});
}