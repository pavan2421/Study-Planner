// Elements
const taskInput = document.getElementById("taskInput");
const subjectInput = document.getElementById("subjectInput");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("tasks");
const filterButtons = document.querySelectorAll("#filters button");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const themeToggle = document.getElementById("themeToggle");
const calendar = document.getElementById("calendar");
const searchInput = document.getElementById("searchInput");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

// Add Task
addTaskBtn.addEventListener("click", () => {
  const task = {
    id: Date.now(),
    subject: subjectInput.value.trim(),
    title: taskInput.value.trim(),
    date: taskDate.value,
    priority: taskPriority.value,
    completed: false
  };
  if (task.title && task.date && task.subject) {
    tasks.push(task);
    saveTasks();
    renderTasks();
    renderCalendar();
    subjectInput.value = "";
    taskInput.value = "";
    taskDate.value = "";
  }
});

// Save to localStorage
function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render Tasks
function renderTasks(filter = "all") {
  taskList.innerHTML = "";
  let filtered = tasks;

  const today = new Date().toISOString().split("T")[0];
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);

  if (filter === "today") {
    filtered = tasks.filter(t => t.date === today);
  } else if (filter === "week") {
    filtered = tasks.filter(t => new Date(t.date) <= weekFromNow && new Date(t.date) >= new Date());
  } else if (filter === "completed") {
    filtered = tasks.filter(t => t.completed);
  }

  // Apply search filter
  if (searchInput.value.trim()) {
    filtered = filtered.filter(t =>
      t.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchInput.value.toLowerCase())
    );
  }

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");
    li.draggable = true;

    li.innerHTML = `
      <div>
        <strong>[${task.subject}]</strong> ${task.title}
        <span class="priority-${task.priority.toLowerCase()}">(${task.priority})</span>
        <br><small>Due: ${task.date}</small>
      </div>
      <div>
        <input type="checkbox" ${task.completed ? "checked" : ""} onchange="toggleComplete(${task.id})">
        <button onclick="deleteTask(${task.id})">🗑</button>
      </div>
    `;
    taskList.appendChild(li);
  });

  updateProgress();
}

// Toggle Complete
function toggleComplete(id) {
  tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
  saveTasks();
  renderTasks();
  renderCalendar();
}

// Delete Task
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
  renderCalendar();
}

// Filters
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTasks(btn.dataset.filter);
  });
});

// Search
searchInput.addEventListener("input", () => renderTasks(document.querySelector("#filters .active").dataset.filter));

// Progress
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressFill.style.width = percent + "%";
  progressText.textContent = `${percent}% completed (${completed}/${total})`;
}

// Theme Toggle
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
});

// Load Theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
}

// Calendar
function renderCalendar() {
  calendar.innerHTML = "";
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill blanks before month start
  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("div");
    calendar.appendChild(empty);
  }

  // Fill actual days
  for (let day = 1; day <= daysInMonth; day++) {
    const div = document.createElement("div");
    div.className = "calendar-day";
    div.innerHTML = `<span>${day}</span>`;

    const dateStr = `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    if (tasks.some(t => t.date === dateStr)) {
      div.classList.add("has-task");
    }

    calendar.appendChild(div);
  }
}

// Initial render
renderTasks();
renderCalendar();
