let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let timers = {};  // Store timeout IDs for reminders keyed by task id

function addTask() {
  const taskText = document.getElementById("taskInput").value.trim();
  const taskTime = document.getElementById("taskTime").value;
  if (!taskText || !taskTime) {
    alert("Please enter task and time.");
    return;
  }

  const task = {
    text: taskText,
    time: new Date(taskTime).toISOString(),
    id: Date.now()
  };

  tasks.push(task);
  saveTasks();
  displayTasks();

  // Clear any existing timer for this task (shouldn't happen for new task, but safe)
  if (timers[task.id]) {
    clearTimeout(timers[task.id]);
  }
  timers[task.id] = setReminder(task);

  // Clear inputs after adding task
  document.getElementById("taskInput").value = "";
  document.getElementById("taskTime").value = "";
}

function deleteTask(id) {
  // Clear timer for this task if exists
  if (timers[id]) {
    clearTimeout(timers[id]);
    delete timers[id];
  }
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  displayTasks();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function displayTasks() {
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  tasks.forEach(task => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${task.text} <br><small>${new Date(task.time).toLocaleString()}</small>
      <button onclick="deleteTask(${task.id})">Delete</button>
    `;
    list.appendChild(li);
  });
}

function setReminder(task) {
  const now = new Date();
  const taskDate = new Date(task.time);
  const timeToAlert = taskDate - now;

  if (timeToAlert > 0) {
    return setTimeout(() => {
      showNotification(task.text, task.id);
    }, timeToAlert);
  }
  return null;
}

function showNotification(taskText, taskId) {
  const sound = document.getElementById("reminderSound");
  sound.play().catch(e => console.log("Sound play error:", e));

  if (Notification.permission === 'granted') {
    navigator.serviceWorker.getRegistration().then(reg => {
      if (reg) {
        reg.showNotification("⏰ Task Reminder", {
          body: taskText,
          icon: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png'
        });
      }
    });
  } else {
    alert("Reminder: " + taskText);
  }

  // Stop the reminder so it doesn't repeat
  stopReminder(taskId);
}

function stopReminder(taskId) {
  // Clear timer if exists
  if (timers[taskId]) {
    clearTimeout(timers[taskId]);
    delete timers[taskId];
  }

  // Remove the task from the list after reminder
  deleteTask(taskId);
}

// Initialize: display tasks and set reminders on page load
tasks.forEach(task => {
  timers[task.id] = setReminder(task);
});
displayTasks();

// Request notification permission on page load
document.addEventListener("DOMContentLoaded", () => {
  requestNotificationPermission();
});

function requestNotificationPermission() {
  if ('Notification' in window) {
    Notification.requestPermission().then(permission => {
      console.log("Notification permission:", permission);
    });
  }
}
