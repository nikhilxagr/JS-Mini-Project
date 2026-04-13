const STORAGE_KEY = "notes_app_v1";
const THEME_KEY = "notes_theme_pref";
const CATEGORY_OPTIONS = [
  "General",
  "Work",
  "Personal",
  "Study",
  "Ideas",
  "Tasks",
];
const COLOR_OPTIONS = ["slate", "ember", "moss", "ocean", "amber", "stone"];

let notes = [];
let editingId = null;
let activeSearch = "";
let activeCategory = "all";
let activeSort = "updated_desc";

const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const categoryInput = document.getElementById("categoryInput");
const colorInput = document.getElementById("colorInput");
const charCount = document.getElementById("charCount");
const notesGrid = document.getElementById("notesGrid");
const noteCount = document.getElementById("noteCount");
const submitBtnText = document.getElementById("submitText");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

const themeToggleBtn = document.getElementById("themeToggleBtn");
const clearAllBtn = document.getElementById("clearAllBtn");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");

function applyTheme(theme) {
  const isDark = theme === "dark";
  document.body.classList.toggle("dark-theme", isDark);

  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDark ? "Light Theme" : "Dark Theme";
    themeToggleBtn.setAttribute("aria-pressed", String(isDark));
  }
}

function initTheme() {
  const storedTheme = localStorage.getItem(THEME_KEY);
  if (storedTheme === "dark" || storedTheme === "light") {
    applyTheme(storedTheme);
    return;
  }

  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  applyTheme(prefersDark ? "dark" : "light");
}

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeCategory(value) {
  return CATEGORY_OPTIONS.includes(value) ? value : "General";
}

function safeColor(value) {
  return COLOR_OPTIONS.includes(value) ? value : "slate";
}

function normalizeNote(rawNote, index) {
  const fallbackTime = Date.now() - index;
  const createdAt =
    Number(rawNote?.createdAt) || Number(rawNote?.updatedAt) || fallbackTime;
  const updatedAt = Number(rawNote?.updatedAt) || createdAt;

  return {
    id: String(rawNote?.id || `${createdAt}-${index}`),
    title: String(rawNote?.title || "").trim(),
    content: String(rawNote?.content || "").trim(),
    category: safeCategory(rawNote?.category),
    color: safeColor(rawNote?.color),
    pinned: Boolean(rawNote?.pinned),
    createdAt,
    updatedAt,
  };
}

function saveToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    showToast("Storage is full. Remove some notes.", "info");
  }
}

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    notes = [];
    return;
  }

  try {
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      notes = [];
      return;
    }

    notes = parsed.map((note, index) => normalizeNote(note, index));
    saveToStorage();
  } catch {
    notes = [];
  }
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function showToast(message, type = "info") {
  const icons = {
    success: "ok",
    delete: "x",
    info: "i",
  };

  toastMessage.textContent = message;
  toastIcon.textContent = icons[type] || icons.info;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function updateCharacterCount() {
  const count = contentInput.value.length;
  charCount.textContent = `${count} character${count === 1 ? "" : "s"}`;
}

function updateCount(filteredCount = notes.length) {
  if (notes.length === 0) {
    noteCount.textContent = "No notes yet";
    return;
  }

  const pinnedCount = notes.filter((note) => note.pinned).length;
  let label = `${notes.length} note${notes.length === 1 ? "" : "s"}`;

  if (pinnedCount > 0) {
    label += ` · ${pinnedCount} pinned`;
  }

  if (filteredCount !== notes.length) {
    label += ` · ${filteredCount} shown`;
  }

  noteCount.textContent = label;
}

function createSortComparator(sortBy) {
  if (sortBy === "updated_asc") {
    return (a, b) => a.updatedAt - b.updatedAt;
  }

  if (sortBy === "title_asc") {
    return (a, b) => a.title.localeCompare(b.title);
  }

  return (a, b) => b.updatedAt - a.updatedAt;
}

function getVisibleNotes() {
  const query = activeSearch.trim().toLowerCase();
  const base = notes.filter((note) => {
    const searchMatch =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.category.toLowerCase().includes(query);
    const categoryMatch =
      activeCategory === "all" || note.category === activeCategory;

    return searchMatch && categoryMatch;
  });

  const comparator = createSortComparator(activeSort);

  return base.sort((a, b) => {
    if (a.pinned !== b.pinned) {
      return a.pinned ? -1 : 1;
    }

    return comparator(a, b);
  });
}

function getActionIcon(action) {
  if (action === "pin") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 4h8l-1.5 5 3.5 3v1H6v-1l3.5-3z"></path>
        <path d="M12 13v7"></path>
      </svg>
    `;
  }

  if (action === "copy") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="9" y="9" width="11" height="11" rx="2"></rect>
        <path d="M5 15V6a2 2 0 0 1 2-2h9"></path>
      </svg>
    `;
  }

  if (action === "edit") {
    return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 20h4l10-10-4-4L4 16z"></path>
        <path d="M13 7l4 4"></path>
      </svg>
    `;
  }

  return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h12"></path>
      <path d="M9 7V5h6v2"></path>
      <path d="M8 7l1 12h6l1-12"></path>
    </svg>
  `;
}

function renderNotes() {
  const visibleNotes = getVisibleNotes();
  notesGrid.innerHTML = "";

  if (visibleNotes.length === 0) {
    const emptyMessage =
      notes.length === 0
        ? "Create your first note from the form above."
        : "No notes match the current filters.";

    notesGrid.innerHTML = `
      <div class="empty-state">
        <strong>Nothing to show</strong>
        <span>${emptyMessage}</span>
      </div>
    `;
    updateCount(0);
    return;
  }

  visibleNotes.forEach((note) => {
    const card = document.createElement("article");
    card.className = `note-card note-color-${note.color}${note.pinned ? " pinned" : ""}`;
    card.dataset.id = note.id;

    card.innerHTML = `
      <div class="note-head">
        <h3 class="note-title">${escapeHtml(note.title || "Untitled")}</h3>
        ${note.pinned ? '<span class="pin-state">Pinned</span>' : ""}
      </div>
      <p class="note-body">${escapeHtml(note.content || "No content")}</p>
      <div class="note-tags">
        <span class="note-tag">${escapeHtml(note.category)}</span>
      </div>
      <div class="note-meta">
        <div class="note-date">${formatDate(note.updatedAt)}</div>
        <div class="note-actions">
          <button class="icon-btn ${note.pinned ? "active" : ""}" data-action="pin" type="button" aria-label="${note.pinned ? "Unpin note" : "Pin note"}">
            ${getActionIcon("pin")}
            <span>${note.pinned ? "Unpin" : "Pin"}</span>
          </button>
          <button class="icon-btn" data-action="copy" type="button" aria-label="Copy note">
            ${getActionIcon("copy")}
            <span>Copy</span>
          </button>
          <button class="icon-btn" data-action="edit" type="button" aria-label="Edit note">
            ${getActionIcon("edit")}
            <span>Edit</span>
          </button>
          <button class="icon-btn delete" data-action="delete" type="button" aria-label="Delete note">
            ${getActionIcon("delete")}
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;

    card.addEventListener("click", () => {
      startEditing(note.id);
    });

    card.querySelectorAll(".icon-btn").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        const action = btn.dataset.action;

        if (action === "pin") {
          togglePin(note.id);
          return;
        }

        if (action === "copy") {
          copyNote(note.id);
          return;
        }

        if (action === "edit") {
          startEditing(note.id);
          return;
        }

        deleteNote(note.id);
      });
    });

    notesGrid.appendChild(card);
  });

  updateCount(visibleNotes.length);
}

function resetForm() {
  editingId = null;
  titleInput.value = "";
  contentInput.value = "";
  categoryInput.value = "General";
  colorInput.value = "slate";
  submitBtnText.textContent = "Add Note";
  updateCharacterCount();
}

function startEditing(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  categoryInput.value = note.category;
  colorInput.value = note.color;
  submitBtnText.textContent = "Update Note";
  updateCharacterCount();
  titleInput.focus();
  showToast("Edit mode", "info");
}

function addNote(title, content, category, color) {
  const now = Date.now();
  notes.push({
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: title.trim(),
    content: content.trim(),
    category: safeCategory(category),
    color: safeColor(color),
    pinned: false,
    createdAt: now,
    updatedAt: now,
  });

  saveToStorage();
  renderNotes();
  showToast("Note added", "success");
}

function updateNote(id, title, content, category, color) {
  const index = notes.findIndex((note) => note.id === id);
  if (index < 0) return;

  notes[index].title = title.trim();
  notes[index].content = content.trim();
  notes[index].category = safeCategory(category);
  notes[index].color = safeColor(color);
  notes[index].updatedAt = Date.now();

  saveToStorage();
  renderNotes();
  showToast("Note updated", "success");
}

function togglePin(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  note.pinned = !note.pinned;
  note.updatedAt = Date.now();
  saveToStorage();
  renderNotes();
  showToast(note.pinned ? "Note pinned" : "Note unpinned", "info");
}

async function copyNote(id) {
  const note = notes.find((item) => item.id === id);
  if (!note) return;

  const textToCopy = [note.title, note.content, `Category: ${note.category}`]
    .filter(Boolean)
    .join("\n");

  try {
    await navigator.clipboard.writeText(textToCopy);
    showToast("Copied to clipboard", "success");
  } catch {
    const holder = document.createElement("textarea");
    holder.value = textToCopy;
    holder.style.position = "fixed";
    holder.style.opacity = "0";
    document.body.appendChild(holder);
    holder.select();
    document.execCommand("copy");
    holder.remove();
    showToast("Copied to clipboard", "success");
  }
}

function deleteNote(id) {
  const confirmed = confirm("Delete this note?");
  if (!confirmed) return;

  notes = notes.filter((note) => note.id !== id);

  if (editingId === id) {
    resetForm();
  }

  saveToStorage();
  renderNotes();
  showToast("Note deleted", "delete");
}

noteForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value;
  const content = contentInput.value;
  const category = categoryInput.value;
  const color = colorInput.value;

  if (!title.trim() && !content.trim()) {
    showToast("Note cannot be empty", "info");
    return;
  }

  if (editingId) {
    updateNote(editingId, title, content, category, color);
  } else {
    addNote(title, content, category, color);
  }

  resetForm();
});

contentInput.addEventListener("input", updateCharacterCount);

searchInput.addEventListener("input", (event) => {
  activeSearch = event.target.value;
  renderNotes();
});

clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  activeSearch = "";
  renderNotes();
});

categoryFilter.addEventListener("change", (event) => {
  activeCategory = event.target.value;
  renderNotes();
});

sortSelect.addEventListener("change", (event) => {
  activeSort = event.target.value;
  renderNotes();
});

clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;

  const confirmed = confirm("Clear all notes?");
  if (!confirmed) return;

  notes = [];
  saveToStorage();
  renderNotes();
  resetForm();
  showToast("All notes cleared", "delete");
});

if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-theme")
      ? "light"
      : "dark";
    applyTheme(nextTheme);
    localStorage.setItem(THEME_KEY, nextTheme);
  });
}

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    event.preventDefault();
    noteForm.requestSubmit();
    return;
  }

  if (event.key === "Escape" && editingId) {
    resetForm();
    showToast("Edit cancelled", "info");
  }
});

initTheme();
loadFromStorage();
resetForm();
renderNotes();
