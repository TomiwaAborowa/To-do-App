// Global variables to store application state
let todos = []
let currentFilter = "all"
let currentCategoryFilter = "all"

// Initialize the application when the page loads
document.addEventListener("DOMContentLoaded", () => {
  loadSampleData()
  renderTasks()
  updateStats()
  updateFilterCounts()
})

// Sample data to demonstrate the app
function loadSampleData() {
  const sampleTodos = [
    {
      id: "1",
      title: "Build an amazing TODO app",
      description: "Create a full-stack application with unique features",
      completed: false,
      priority: "high",
      category: "Work",
      dueDate: getDateString(7), // 7 days from now
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Add analytics dashboard",
      description: "Implement task statistics and completion tracking",
      completed: true,
      priority: "medium",
      category: "Work",
      createdAt: getDateString(-1), // 1 day ago
      completedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Buy groceries",
      description: "Milk, bread, eggs, and vegetables",
      completed: false,
      priority: "low",
      category: "Shopping",
      dueDate: getDateString(2), // 2 days from now
      createdAt: getDateString(-2), // 2 days ago
    },
  ]

  todos = sampleTodos
}

// Helper function to get date string relative to today
function getDateString(daysFromNow) {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString()
}

// Tab switching functionality
function showTab(tabName) {
  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content")
  tabContents.forEach((tab) => tab.classList.remove("active"))

  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((btn) => btn.classList.remove("active"))

  // Show selected tab content
  document.getElementById(tabName + "-tab").classList.add("active")

  // Add active class to clicked tab button
  event.target.classList.add("active")

  // Update analytics when switching to analytics tab
  if (tabName === "analytics") {
    updateStats()
  }
}

// Add new task function
function addTask() {
  const title = document.getElementById("task-title").value.trim()
  const description = document.getElementById("task-description").value.trim()
  const priority = document.getElementById("task-priority").value
  const category = document.getElementById("task-category").value
  const dueDate = document.getElementById("task-due-date").value

  // Validate required fields
  if (!title) {
    alert("Please enter a task title")
    return
  }

  // Create new task object
  const newTask = {
    id: Date.now().toString(), // Simple ID generation
    title: title,
    description: description,
    completed: false,
    priority: priority,
    category: category,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null,
    createdAt: new Date().toISOString(),
  }

  // Add to todos array
  todos.push(newTask)

  // Clear form
  clearForm()

  // Re-render tasks and update stats
  renderTasks()
  updateStats()
  updateFilterCounts()
}

// Clear the add task form
function clearForm() {
  document.getElementById("task-title").value = ""
  document.getElementById("task-description").value = ""
  document.getElementById("task-priority").value = "medium"
  document.getElementById("task-category").value = "General"
  document.getElementById("task-due-date").value = ""
}

// Toggle task completion status
function toggleTask(taskId) {
  const task = todos.find((t) => t.id === taskId)
  if (task) {
    task.completed = !task.completed
    task.completedAt = task.completed ? new Date().toISOString() : null

    renderTasks()
    updateStats()
    updateFilterCounts()
  }
}

// Delete a task
function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task?")) {
    todos = todos.filter((t) => t.id !== taskId)
    renderTasks()
    updateStats()
    updateFilterCounts()
  }
}

// Filter tasks by status (all, active, completed)
function filterTasks(filter) {
  currentFilter = filter

  // Update active filter button
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((btn) => btn.classList.remove("active"))
  event.target.classList.add("active")

  renderTasks()
}

// Filter tasks by category
function filterByCategory() {
  currentCategoryFilter = document.getElementById("category-filter").value
  renderTasks()
}

// Get filtered tasks based on current filters
function getFilteredTasks() {
  return todos.filter((task) => {
    // Status filter
    const statusMatch =
      currentFilter === "all" ||
      (currentFilter === "active" && !task.completed) ||
      (currentFilter === "completed" && task.completed)

    // Category filter
    const categoryMatch = currentCategoryFilter === "all" || task.category === currentCategoryFilter

    return statusMatch && categoryMatch
  })
}

// Render all tasks in the task list
function renderTasks() {
  const taskList = document.getElementById("task-list")
  const filteredTasks = getFilteredTasks()

  if (filteredTasks.length === 0) {
    taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add your first task above!</p>
            </div>
        `
    return
  }

  // Sort tasks: incomplete first, then by creation date
  filteredTasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  taskList.innerHTML = filteredTasks.map((task) => createTaskHTML(task)).join("")
}

// Create HTML for a single task
function createTaskHTML(task) {
  const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date()
  const dueDateFormatted = task.dueDate ? formatDate(new Date(task.dueDate)) : null

  return `
        <div class="task-item ${task.completed ? "completed" : ""}">
            <div class="task-header">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? "checked" : ""} 
                    onchange="toggleTask('${task.id}')"
                >
                <div class="task-content">
                    <div class="task-title ${task.completed ? "completed" : ""}">${task.title}</div>
                    ${task.description ? `<div class="task-description ${task.completed ? "completed" : ""}">${task.description}</div>` : ""}
                    <div class="task-badges">
                        <span class="badge priority-${task.priority}">${task.priority} priority</span>
                        <span class="badge category">${task.category}</span>
                        ${dueDateFormatted ? `<span class="badge due-date ${isOverdue ? "overdue" : ""}">${dueDateFormatted}${isOverdue ? " (Overdue)" : ""}</span>` : ""}
                    </div>
                </div>
                <div class="task-actions">
                    <button class="btn btn-danger btn-small" onclick="deleteTask('${task.id}')">Delete</button>
                </div>
            </div>
        </div>
    `
}

// Format date for display
function formatDate(date) {
  const options = { month: "short", day: "numeric" }
  return date.toLocaleDateString("en-US", options)
}

// Update filter counts
function updateFilterCounts() {
  const allCount = todos.length
  const activeCount = todos.filter((t) => !t.completed).length
  const completedCount = todos.filter((t) => t.completed).length

  document.getElementById("all-count").textContent = allCount
  document.getElementById("active-count").textContent = activeCount
  document.getElementById("completed-count").textContent = completedCount
}

// Update analytics/statistics
function updateStats() {
  const total = todos.length
  const completed = todos.filter((t) => t.completed).length
  const overdue = todos.filter((t) => t.dueDate && !t.completed && new Date(t.dueDate) < new Date()).length

  // Update basic stats
  document.getElementById("total-tasks").textContent = total
  document.getElementById("completed-tasks").textContent = completed
  document.getElementById("overdue-tasks").textContent = overdue

  // Update completion rate
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0
  document.getElementById("completion-rate").textContent = completionRate + "%"

  // Update progress bar
  const progressBar = document.getElementById("completion-progress")
  progressBar.style.width = completionRate + "%"

  // Update priority stats
  const highPriority = todos.filter((t) => t.priority === "high").length
  const mediumPriority = todos.filter((t) => t.priority === "medium").length
  const lowPriority = todos.filter((t) => t.priority === "low").length

  document.getElementById("high-priority-count").textContent = highPriority
  document.getElementById("medium-priority-count").textContent = mediumPriority
  document.getElementById("low-priority-count").textContent = lowPriority

  // Update category stats
  updateCategoryStats()
}

// Update category statistics
function updateCategoryStats() {
  const categoryStats = {}
  todos.forEach((task) => {
    categoryStats[task.category] = (categoryStats[task.category] || 0) + 1
  })

  const categoryChart = document.getElementById("category-chart")
  categoryChart.innerHTML = Object.entries(categoryStats)
    .map(
      ([category, count]) => `
            <div class="category-item">
                <span>${category}</span>
                <span class="category-count">${count}</span>
            </div>
        `,
    )
    .join("")
}
