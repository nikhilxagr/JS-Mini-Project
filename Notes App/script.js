
const STORAGE_KEY = "notes_app_v1";
let notes = [];
let editingId = null;


const noteForm = document.getElementById("noteForm");
const titleInput = document.getElementById("titleInput");
const contentInput = document.getElementById("contentInput");
const notesGrid = document.getElementById("notesGrid");
const noteCount = document.getElementById("noteCount");
const submitBtnText = document.getElementById("submitText");
const searchInput = document.getElementById("searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");
const toastIcon = document.getElementById("toastIcon");

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function loadFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      notes = JSON.parse(stored);
    } catch {
      notes = [];
    }
  }
}

function formatDate(ts) {
  const d = new Date(ts);
  return (
    d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " · " +
    d.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

function showToast(message, type = "success") {
  toastMessage.textContent = message;
  if (type === "success") {
    toastIcon.textContent = "✅";
  } else if (type === "delete") {
    toastIcon.textContent = "🗑️";
  } else {
    toastIcon.textContent = "ℹ️";
  }

  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function updateCount() {
  const count = notes.length;
  noteCount.textContent =
    count === 0 ? "No notes yet" : `${count} note${count > 1 ? "s" : ""}`;
}


function renderNotes(filterText = "") {
  notesGrid.innerHTML = "";

  let filtered = notes;
  if (filterText.trim() !== "") {
    const q = filterText.toLowerCase();
    filtered = notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    notesGrid.innerHTML = `
                <div class="empty-state">
                    <span>📝</span>
                    Start by adding a note above.
                </div>
            `;
    updateCount();
    return;
  }

  filtered
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .forEach((note) => {
      const card = document.createElement("article");
      card.className = "note-card";
      card.dataset.id = note.id;

      card.innerHTML = `
                    <h3 class="note-title">${escapeHtml(
                      note.title || "Untitled"
                    )}</h3>
                    <p class="note-body">${escapeHtml(note.content)}</p>
                    <div class="note-meta">
                        <div class="note-date">🕒 ${formatDate(
                          note.updatedAt
                        )}</div>
                        <div class="note-actions">
                            <button class="icon-btn edit" type="button">
                                <span>✏️</span>Edit
                            </button>
                            <button class="icon-btn delete" type="button">
                                <span>🗑️</span>Delete
                            </button>
                        </div>
                    </div>
                `;

     
      card.querySelector(".edit").addEventListener("click", (e) => {
        e.stopPropagation();
        startEditing(note.id);
      });

      
      card.querySelector(".delete").addEventListener("click", (e) => {
        e.stopPropagation();
        deleteNote(note.id);
      });

      notesGrid.appendChild(card);
    });

  updateCount();
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function addNote(title, content) {
  const now = Date.now();
  notes.push({
    id: now.toString(),
    title: title.trim(),
    content: content.trim(),
    createdAt: now,
    updatedAt: now,
  });
  saveToStorage();
  renderNotes(searchInput.value);
  showToast("Note added");
}

function updateNote(id, title, content) {
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return;

  notes[idx].title = title.trim();
  notes[idx].content = content.trim();
  notes[idx].updatedAt = Date.now();
  saveToStorage();
  renderNotes(searchInput.value);
  showToast("Note updated");
}

function deleteNote(id) {
  const confirmDelete = confirm("Delete this note?");
  if (!confirmDelete) return;

  notes = notes.filter((n) => n.id !== id);
  saveToStorage();
  renderNotes(searchInput.value);
  showToast("Note deleted", "delete");
  if (editingId === id) {
    resetForm();
  }
}

function startEditing(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;

  editingId = id;
  titleInput.value = note.title;
  contentInput.value = note.content;
  submitBtnText.textContent = "Update Note";
  showToast("Edit mode");
  titleInput.focus();
}

function resetForm() {
  editingId = null;
  titleInput.value = "";
  contentInput.value = "";
  submitBtnText.textContent = "Add Note";
}

noteForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = titleInput.value;
  const content = contentInput.value;

  if (!title.trim() && !content.trim()) {
    showToast("Note cannot be empty", "info");
    return;
  }

  if (editingId) {
    updateNote(editingId, title, content);
  } else {
    addNote(title, content);
  }

  resetForm();
});

searchInput.addEventListener("input", (e) => {
  renderNotes(e.target.value);
});

clearAllBtn.addEventListener("click", () => {
  if (notes.length === 0) return;
  const confirmClear = confirm("Clear ALL notes?");
  if (!confirmClear) return;
  notes = [];
  saveToStorage();
  renderNotes(searchInput.value);
  resetForm();
  showToast("All notes cleared", "delete");
});

loadFromStorage();
renderNotes();
