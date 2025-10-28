// elements
const radioViewOptions = document.querySelectorAll("input[name='view-option']");
const listView = document.getElementById("list-view");
const boardView = document.getElementById("board-view");
const addTaskCTA = document.getElementById("add-task-cta");
const setTaskOverlay = document.getElementById("set-task-overlay");
const closeButtons = document.querySelectorAll(".close-button");
const statusSelect = document.getElementById("status-select");
const statusDropdown = document.getElementById("status-dropdown");
const viewTaskOverlay = document.getElementById("view-task-overlay");
const deleteTaskCTA = document.getElementById("delete-task-cta");
const notification = document.getElementById("notification");
const setTaskForm = document.getElementById("set-task-form");
const setTaskSubmit = document.getElementById("set-task-submit");
const taskIdInput = document.getElementById("task-id");
const progressInput = document.getElementById("progress");
const viewTaskName = document.getElementById("view-task-name");
const viewTaskDesc = document.getElementById("view-task-desc");
const viewTaskStatus = document.getElementById("view-task-status");
const viewTaskProgress = document.getElementById("view-task-progress");
const editTaskCTA = document.getElementById("edit-task-cta");
const signOutCTA = document.getElementById("sign-out-cta");

let activeOverlay = null;

// In-memory task store (id, name, desc, due, status, progress)
let tasks = [];
let nextId = 1;

//event listeners
radioViewOptions.forEach((radioButton) => {
  radioButton.addEventListener("change", (event) => {
    const eventTarget = event.target;
    const viewOption = eventTarget.value;

    switch (viewOption) {
      case "board":
        listView.classList.add("hide");
        boardView.classList.remove("hide");
        break;
      case "list":
        boardView.classList.add("hide");
        listView.classList.remove("hide");
        break;
    }
  });
});
//when clicking on add task, show popup
addTaskCTA.addEventListener("click", () => {
  openSetTaskOverlay();
});

//closing the add task popup
closeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (activeOverlay) {
      activeOverlay.classList.add("hide");
      activeOverlay = null;
      document.body.classList.remove("overflow-hidden");
    }
  });
});

//toggle the dropdown for status of task
statusSelect.addEventListener("click", () => {
  statusDropdown.classList.toggle("hide");
});
// create a DOM task element for a given task object
function createTaskElement(task) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = task.id;

  const btn = document.createElement("button");
  btn.className = "task-button";

  const nameP = document.createElement("p");
  nameP.className = "task-name";
  nameP.textContent = task.name;

  const dueP = document.createElement("p");
  dueP.className = "task-due-date";
  dueP.textContent = task.due || "";

  btn.appendChild(nameP);
  btn.appendChild(dueP);

  const arrow = document.createElement("iconify-icon");
  arrow.setAttribute("icon", "material-symbols:arrow-back-ios-rounded");
  arrow.style.color = "black";
  arrow.width = 18;
  arrow.height = 18;
  arrow.className = "arrow-icon";
  btn.appendChild(arrow);

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openViewTask(task.id);
  });

  li.appendChild(btn);
  return li;
}

function renderTasks() {
  // Find all .tasks-list containers (both in list view and board view)
  const allLists = Array.from(document.querySelectorAll(".tasks-list"));

  // Map each DOM list element -> inferred status string (To do / Doing / Done)
  const listStatusMap = new Map();
  allLists.forEach((list) => {
    let status = null;
    // First, try to infer from the list's own classes
    if (list.classList.contains("pink")) status = "To do";
    if (list.classList.contains("blue")) status = "Doing";
    if (list.classList.contains("green")) status = "Done";

    // Fallback: check closest .list-container for a color class
    if (!status) {
      const container = list.closest(".list-container");
      if (container) {
        if (container.classList.contains("pink")) status = "To do";
        if (container.classList.contains("blue")) status = "Doing";
        if (container.classList.contains("green")) status = "Done";
      }
    }

    // Default fallback
    listStatusMap.set(list, status || "To do");
    list.innerHTML = "";
  });

  // Append each task into every matching DOM list so list and board views stay in sync
  tasks.forEach((task) => {
    listStatusMap.forEach((status, listEl) => {
      if (status === task.status) {
        listEl.appendChild(createTaskElement(task));
      }
    });
  });
}

function openSetTaskOverlay(taskId) {
  // prepare form for add or edit
  setTaskForm.reset();
  taskIdInput.value = "";
  progressInput.value = 0;
  setTaskSubmit.textContent = "Add task";

  if (taskId) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      taskIdInput.value = task.id;
      setTaskForm.name.value = task.name;
      setTaskForm.description.value = task.description;
      setTaskForm["due-date-day"].value = task.dueDay || "";
      setTaskForm["due-date-month"].value = task.dueMonth || "";
      setTaskForm["due-date-year"].value = task.dueYear || "";
      progressInput.value = task.progress || 0;
      // set status radio
      const statusRadio = document.querySelector(
        `input[name='status-option'][value='${task.status}']`
      );
      if (statusRadio) statusRadio.checked = true;
      setTaskSubmit.textContent = "Save changes";
    }
  }

  setTaskOverlay.classList.remove("hide");
  activeOverlay = setTaskOverlay;
  document.body.classList.add("overflow-hidden");
}

function openViewTask(taskId) {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return;
  viewTaskName.textContent = task.name;
  viewTaskDesc.textContent = task.description;
  // status badge
  viewTaskStatus.innerHTML = "";
  const circle = document.createElement("span");
  circle.className =
    "circle " +
    (task.status === "Doing"
      ? "blue-background"
      : task.status === "Done"
      ? "green-background"
      : "pink-background");
  const text = document.createElement("span");
  text.textContent = task.status;
  viewTaskStatus.appendChild(circle);
  viewTaskStatus.appendChild(text);
  viewTaskProgress.textContent = (task.progress || 0) + "%";

  // store current id on overlay for delete/edit
  viewTaskOverlay.dataset.id = task.id;

  viewTaskOverlay.classList.remove("hide");
  activeOverlay = viewTaskOverlay;
  document.body.classList.add("overflow-hidden");
}

// handle delete
deleteTaskCTA.addEventListener("click", () => {
  const id = parseInt(viewTaskOverlay.dataset.id, 10);
  if (!id) return;
  tasks = tasks.filter((t) => t.id !== id);
  viewTaskOverlay.classList.add("hide");
  activeOverlay = null;
  document.body.classList.remove("overflow-hidden");
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 3000);
  renderTasks();
});

// edit from view overlay
editTaskCTA.addEventListener("click", () => {
  const id = parseInt(viewTaskOverlay.dataset.id, 10);
  if (!id) return;
  viewTaskOverlay.classList.add("hide");
  openSetTaskOverlay(id);
});

// submit add/edit form
setTaskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = taskIdInput.value ? parseInt(taskIdInput.value, 10) : null;
  const name = setTaskForm.name.value.trim();
  const description = setTaskForm.description.value.trim();
  const dueDay = setTaskForm["due-date-day"].value.trim();
  const dueMonth = setTaskForm["due-date-month"].value.trim();
  const dueYear = setTaskForm["due-date-year"].value.trim();
  const statusEl = document.querySelector(
    "input[name='status-option']:checked"
  );
  const status = statusEl ? statusEl.value : "To do";
  const progress = parseInt(progressInput.value, 10) || 0;

  if (!name) return alert("Please enter a task name");

  if (id) {
    // update
    const task = tasks.find((t) => t.id === id);
    if (task) {
      task.name = name;
      task.description = description;
      task.dueDay = dueDay;
      task.dueMonth = dueMonth;
      task.dueYear = dueYear;
      task.due = `Due on ${dueMonth} ${dueDay}, ${dueYear}`;
      task.status = status;
      task.progress = progress;
    }
  } else {
    // create
    const newTask = {
      id: nextId++,
      name,
      description,
      dueDay,
      dueMonth,
      dueYear,
      due:
        dueDay && dueMonth && dueYear
          ? `Due on ${dueMonth} ${dueDay}, ${dueYear}`
          : "",
      status,
      progress,
    };
    tasks.push(newTask);
  }

  setTaskOverlay.classList.add("hide");
  activeOverlay = null;
  document.body.classList.remove("overflow-hidden");
  renderTasks();
});

// simple sign out navigation
if (signOutCTA) {
  signOutCTA.addEventListener("click", () => {
    // simple client-side sign-out: navigate to login
    window.location.href = "./login.html";
  });
}

// initial sample tasks to keep UI populated
tasks.push({
  id: nextId++,
  name: "Design UI",
  description: "Create mockups",
  due: "Due on September 5, 2025",
  dueDay: "5",
  dueMonth: "September",
  dueYear: "2025",
  status: "To do",
  progress: 0,
});
tasks.push({
  id: nextId++,
  name: "Implement auth",
  description: "Add login flow",
  due: "Due on September 6, 2025",
  dueDay: "6",
  dueMonth: "September",
  dueYear: "2025",
  status: "Doing",
  progress: 30,
});
tasks.push({
  id: nextId++,
  name: "Write tests",
  description: "Add unit tests",
  due: "Due on September 7, 2025",
  dueDay: "7",
  dueMonth: "September",
  dueYear: "2025",
  status: "Done",
  progress: 100,
});

// render initial tasks
renderTasks();

// Wire login form redirect in login page if present
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    // very simple client-side 'auth' - redirect to dashboard
    window.location.href = "./dashboard.html";
  });
}
