(() => {
  "use strict";

  const STORAGE_KEY = "muyu-tasks";
  const starterTasks = [
    { id: "welcome", title: "规划今天最重要的三件事", done: false, priority: "important", createdAt: 1 },
    { id: "break", title: "午后散步 20 分钟", done: false, priority: "normal", createdAt: 2 },
    { id: "inbox", title: "整理收件箱", done: true, priority: "normal", createdAt: 3 },
  ];

  const elements = {
    form: document.querySelector("#add-form"),
    input: document.querySelector("#new-task"),
    list: document.querySelector("#task-list"),
    date: document.querySelector("#current-date"),
    remaining: document.querySelector("#remaining-count"),
    total: document.querySelector("#total-count"),
    clear: document.querySelector("#clear-completed"),
    progressValue: document.querySelector("#progress-value"),
    progressBar: document.querySelector("#progress-bar"),
    progressTrack: document.querySelector(".progress-track"),
    progressMessage: document.querySelector("#progress-message"),
    filters: [...document.querySelectorAll("[data-filter]")],
  };

  let tasks = loadTasks();
  let filter = "all";

  function isTask(value) {
    return value && typeof value.id === "string" && typeof value.title === "string" &&
      typeof value.done === "boolean" && ["normal", "important"].includes(value.priority);
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === null) return structuredClone(starterTasks);
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) && parsed.every(isTask) ? parsed : structuredClone(starterTasks);
    } catch {
      return structuredClone(starterTasks);
    }
  }

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function visibleTasks() {
    if (filter === "active") return tasks.filter((task) => !task.done);
    if (filter === "done") return tasks.filter((task) => task.done);
    return tasks;
  }

  function updateTask(id, patch) {
    tasks = tasks.map((task) => task.id === id ? { ...task, ...patch } : task);
    saveTasks();
    render();
  }

  function makeButton(className, label, text, onClick) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    button.addEventListener("click", onClick);
    return button;
  }

  function renderTask(task) {
    const article = document.createElement("article");
    article.className = `task${task.done ? " is-done" : ""}`;

    const check = makeButton("check", task.done ? `恢复任务：${task.title}` : `完成任务：${task.title}`, "", () => updateTask(task.id, { done: !task.done }));
    const checkMark = document.createElement("span");
    checkMark.textContent = "✓";
    check.append(checkMark);

    const copy = document.createElement("div");
    copy.className = "task-copy";
    const input = document.createElement("input");
    input.value = task.title;
    input.maxLength = 200;
    input.setAttribute("aria-label", "编辑任务");
    input.addEventListener("change", () => {
      const title = input.value.trim();
      if (title) updateTask(task.id, { title }); else input.value = task.title;
    });
    const status = document.createElement("small");
    status.textContent = task.done ? "已完成" : task.priority === "important" ? "重要任务" : "今天";
    copy.append(input, status);

    const star = makeButton(`star${task.priority === "important" ? " selected" : ""}`, "切换重要任务", "★", () => updateTask(task.id, { priority: task.priority === "important" ? "normal" : "important" }));
    const remove = makeButton("remove", `删除任务：${task.title}`, "×", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      render();
    });

    article.append(check, copy, star, remove);
    return article;
  }

  function renderEmpty() {
    const empty = document.createElement("div");
    empty.className = "empty";
    const icon = document.createElement("span");
    icon.textContent = "✓";
    const title = document.createElement("h2");
    title.textContent = "这里已经清空了";
    const message = document.createElement("p");
    message.textContent = filter === "done" ? "还没有已完成的任务。" : "给自己留一点空白，也很好。";
    empty.append(icon, title, message);
    return empty;
  }

  function render() {
    const completed = tasks.filter((task) => task.done).length;
    const remaining = tasks.length - completed;
    const progress = tasks.length ? Math.round(completed / tasks.length * 100) : 0;
    const visible = visibleTasks();

    elements.list.replaceChildren(...(visible.length ? visible.map(renderTask) : [renderEmpty()]));
    elements.remaining.textContent = String(remaining);
    elements.total.textContent = String(tasks.length);
    elements.clear.hidden = completed === 0;
    elements.progressValue.textContent = `${progress}%`;
    elements.progressBar.style.width = `${progress}%`;
    elements.progressTrack.setAttribute("aria-valuenow", String(progress));
    elements.progressMessage.textContent = completed ? `已经完成 ${completed} 件，继续保持。` : "从一件小事开始。";
    elements.filters.forEach((button) => button.classList.toggle("active", button.dataset.filter === filter));
  }

  elements.date.textContent = new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date());
  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const title = elements.input.value.trim();
    if (!title) return;
    tasks.unshift({ id: createId(), title, done: false, priority: "normal", createdAt: Date.now() });
    elements.input.value = "";
    saveTasks();
    render();
  });
  elements.filters.forEach((button) => button.addEventListener("click", () => { filter = button.dataset.filter; render(); }));
  elements.clear.addEventListener("click", () => { tasks = tasks.filter((task) => !task.done); saveTasks(); render(); });
  render();
})();
