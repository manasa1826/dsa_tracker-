/* DSA Tracker App Script */

const STORAGE_KEY = "dsaTrackerProblems";
const form = document.getElementById("problem-form");
const titleInput = document.getElementById("problem-title");
const categoryInput = document.getElementById("problem-category");
const difficultyInput = document.getElementById("problem-difficulty");
const problemList = document.getElementById("problem-list");

const filterCategory = document.getElementById("filter-category");
const filterDifficulty = document.getElementById("filter-difficulty");
const filterStatus = document.getElementById("filter-status");
const searchInput = document.getElementById("search-problem");

const totalCountEl = document.getElementById("total-count");
const solvedCountEl = document.getElementById("solved-count");
const pendingCountEl = document.getElementById("pending-count");
const progressFill = document.getElementById("progress-fill");
const progressPercent = document.getElementById("progress-percent");
const progressBar = document.querySelector(".progress");

let problems = [];

/* Retrieve saved problems from localStorage */
function loadFromStorage() {
  const data = localStorage.getItem(STORAGE_KEY);
  problems = data ? JSON.parse(data) : [];
}

/* Persist problems to localStorage */
function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(problems));
}

/* Handle form submission and add a new problem */
function addProblem(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  if (!title) {
    titleInput.focus();
    return;
  }

  const problem = {
    id: crypto.randomUUID(),
    title,
    category: categoryInput.value,
    difficulty: difficultyInput.value,
    solved: false,
    createdAt: new Date().toISOString(),
  };

  problems.unshift(problem);
  saveToStorage();
  form.reset();
  renderProblems();
}

/* Render cards after applying filters */
function renderProblems() {
  problemList.innerHTML = "";

  const filtered = applyFilters();
  if (!filtered.length) {
    problemList.innerHTML = `<p class="empty-state">No problems match the filters.</p>`;
  } else {
    const fragment = document.createDocumentFragment();
    filtered.forEach((problem) => fragment.appendChild(createCardElement(problem)));
    problemList.appendChild(fragment);
  }

  updateSummary();
}

/* Create DOM node for a single problem card */
function createCardElement(problem) {
  const card = document.createElement("article");
  card.className = `problem-card ${problem.solved ? "solved" : ""}`;

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = problem.title;

  const tag = document.createElement("span");
  tag.className = `tag ${problem.difficulty}`;
  tag.textContent = problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1);

  header.append(title, tag);

  const meta = document.createElement("div");
  meta.className = "card-footer";
  meta.innerHTML = `
    <span>${problem.category.replace("-", " ")}</span>
    <span>${new Date(problem.createdAt).toLocaleDateString()}</span>
  `;

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.textContent = problem.solved ? "Mark Pending" : "Mark Solved";
  toggleBtn.addEventListener("click", () => toggleSolved(problem.id));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => deleteProblem(problem.id));

  actions.append(toggleBtn, deleteBtn);

  card.append(header, meta, actions);
  return card;
}

/* Toggle solved flag for a problem */
function toggleSolved(id) {
  problems = problems.map((problem) =>
    problem.id === id ? { ...problem, solved: !problem.solved } : problem
  );
  saveToStorage();
  renderProblems();
}

/* Delete a problem from the list */
function deleteProblem(id) {
  problems = problems.filter((problem) => problem.id !== id);
  saveToStorage();
  renderProblems();
}

/* Apply filter controls to the problems array */
function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();

  return problems.filter((problem) => {
    const matchesCategory =
      filterCategory.value === "all" || problem.category === filterCategory.value;
    const matchesDifficulty =
      filterDifficulty.value === "all" || problem.difficulty === filterDifficulty.value;
    const matchesStatus =
      filterStatus.value === "all" ||
      (filterStatus.value === "solved" && problem.solved) ||
      (filterStatus.value === "pending" && !problem.solved) ||
      (filterStatus.value === "review" && !problem.solved); // adjust condition if review status is added later
    const matchesSearch = problem.title.toLowerCase().includes(searchText);

    return matchesCategory && matchesDifficulty && matchesStatus && matchesSearch;
  });
}

/* Update summary stats and progress bar */
function updateSummary() {
  const total = problems.length;
  const solved = problems.filter((p) => p.solved).length;
  const pending = total - solved;
  const percent = total ? Math.round((solved / total) * 100) : 0;

  totalCountEl.textContent = total;
  solvedCountEl.textContent = solved;
  pendingCountEl.textContent = pending;
  progressFill.style.width = `${percent}%`;
  progressBar.setAttribute("aria-valuenow", percent);
  progressPercent.textContent = `${percent}%`;
}

/* Initial setup: load, render, and attach listeners */
function init() {
  loadFromStorage();
  renderProblems();

  form.addEventListener("submit", addProblem);
  filterCategory.addEventListener("change", renderProblems);
  filterDifficulty.addEventListener("change", renderProblems);
  filterStatus.addEventListener("change", renderProblems);
  searchInput.addEventListener("input", renderProblems);
}

init();