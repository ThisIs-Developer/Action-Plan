let hoverTimeout;

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(function () {
    document.querySelector(".preloader").classList.add("fade-out");
  }, 1000);

  setTimeout(function () {
    document.querySelector(".fixed-header").style.display = "flex";
    document.querySelector(".container").style.display = "inherit";
    document.querySelector(".preloader").style.display = "none";
  }, 1500);
});

document.addEventListener("DOMContentLoaded", () => {
  const cookieModal = document.getElementById("cookieModal");
  const acceptCookiesBtn = document.getElementById("acceptCookiesBtn");
  const cookiesAccepted = localStorage.getItem("cookiesAccepted");
  const resetBtn = document.getElementById('resetBtn');
  const confirmResetBtn = document.getElementById('confirmResetBtn');
  const resetConfirmationModal = document.getElementById('resetConfirmationModal');

  if (!cookiesAccepted) {
    $("#cookieModal").modal("show");
  }

  acceptCookiesBtn.addEventListener("click", () => {
    localStorage.setItem("cookiesAccepted", true);
    $("#cookieModal").modal("hide");
  });

  const noteInput = document.getElementById("noteInput");
  const noteDate = document.getElementById("noteDate");
  const noteTime = document.getElementById("noteTime");
  const addNoteBtn = document.getElementById("addNoteBtn");
  const noteList = document.getElementById("noteList");

  let notes = JSON.parse(localStorage.getItem("notes")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  function saveToLocalStorage() {
    localStorage.setItem("notes", JSON.stringify(notes));
    localStorage.setItem("trash", JSON.stringify(trash));
  }

  function renderNotes() {
    if (noteList) {
      noteList.innerHTML = "";
      notes.forEach((note, index) => {
        const li = document.createElement("li");
        li.className = `list-group-item ${note.completed ? "completed" : ""}`;
        li.dataset.index = index;
        li.draggable = true;
  
        let noteContent = `${note.content}`;
        if (note.date || note.time) {
          const date = note.date ? new Date(note.date) : null;
          const dateString = date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
          const dayOfWeek = date ? date.getDay() : null;
          const dayColor = dayOfWeek === 0 || dayOfWeek === 6 ? 'color: red;' : ''; // Red color for Sunday (0) and Saturday (6)
          const dayWord = dateString.split(',')[0]; // Extract the day word from the full date string
          const formattedDate = dateString.replace(dayWord, `<span style="${dayColor}">${dayWord}</span>`); // Wrap the day word in a span with the specified color
          noteContent += `<br><small>${formattedDate} ${note.time || ""}</small>`;
        }
  
        li.innerHTML = `
          <div class="note-content">
            ${noteContent}
          </div>
          <div class="note-buttons">
            <button class="btn btn-sm btn-primary float-right save-btn d-none">Save</button>
            <button class="btn btn-sm btn-secondary float-right edit-btn">Edit</button>
            <button class="btn btn-sm btn-success float-right done-btn">${note.completed ? 'Undone' : 'Done'}</button>
            <button class="btn btn-sm btn-danger float-right delete-btn">Delete</button>
          </div>
        `;
        noteList.appendChild(li);
  
        li.querySelector(".done-btn").addEventListener("click", () => {
          notes[index].completed = !notes[index].completed;
          saveToLocalStorage();
          renderNotes();
          const doneButton = li.querySelector(".done-btn");
          doneButton.textContent = notes[index].completed ? 'Undone' : 'Done';
        });        
  
        li.querySelector(".edit-btn").addEventListener("click", () => {
          const editContent = li.querySelector(".note-content");
          const editButtons = li.querySelector(".note-buttons");
          
          editContent.innerHTML = `
            <input type="text" class="form-control edit-content" value="${notes[index].content}">
            <input type="date" class="form-control edit-date" value="${notes[index].date}">
            <input type="time" class="form-control edit-time" value="${notes[index].time}">
          `;
          
          editButtons.innerHTML = `
            <button class="btn btn-sm btn-primary float-right save-btn">Save</button>
            <button class="btn btn-sm btn-secondary float-right cancel-btn">Cancel</button>
          `;
  
          editButtons.querySelector(".save-btn").addEventListener("click", () => {
            const newContent = editContent.querySelector(".edit-content").value;
            const newDate = editContent.querySelector(".edit-date").value;
            const newTime = editContent.querySelector(".edit-time").value;
  
            notes[index].content = newContent;
            notes[index].date = newDate;
            notes[index].time = newTime;
  
            saveToLocalStorage();
            renderNotes();
          });
  
          editButtons.querySelector(".cancel-btn").addEventListener("click", () => {
            renderNotes();
          });
        });
      });
    }
  }  

  function showToast(message, type) {
    Toastify({
      text: message,
      duration: 3000,
      close: true,
      gravity: "top",
      position: "right",
      backgroundColor: type === "error" ? "#FF0000" : "#5cb85c",
    }).showToast();
  }

  hoverTimeout = setTimeout(() => {
    Toastify({
      text: "Tip: You can change the position of any notes by dragging them.",
      duration: 5000,
      gravity: "bottom",
      position: "center",
      backgroundColor: "linear-gradient(to right, #00bcd4, #03a9f4)",
      style: {
        margin: '20px',
      },
    }).showToast();
  }, 2000);

  noteList.addEventListener("mouseover", (e) => {
    if (e.target.tagName === "LI") {
      clearTimeout(hoverTimeout);
    }
  });

  noteList.addEventListener("mouseout", (e) => {
    if (e.target.tagName === "LI") {
      hoverTimeout = setTimeout(() => {
        Toastify({
          text: "Tip: You can change the position of any notes by dragging them.",
          duration: 5000,
          gravity: "bottom",
          position: "center",
          backgroundColor: "linear-gradient(to right, #00bcd4, #03a9f4)",
          style: {
            margin: '20px',
          },
        }).showToast();
      }, 1000);
    }
  });

  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", () => {
      const noteContent = noteInput.value.trim();
      const noteDateValue = noteDate.value;
      const noteTimeValue = noteTime.value;

      if (!localStorage.getItem("cookiesAccepted")) {
        showToast("Please accept cookies to save notes.", "error");
      } else if (!noteContent) {
        showToast("Note cannot be empty.", "error");
      } else {
        notes.push({
          content: noteContent,
          date: noteDateValue,
          time: noteTimeValue,
          completed: false,
        });
        noteInput.value = "";
        noteDate.value = "";
        noteTime.value = "";
        saveToLocalStorage();
        renderNotes();
      }
    });
  }

  if (noteList) {
    noteList.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("delete-btn")) {
        const index = target.parentElement.parentElement.dataset.index;
        const note = notes.splice(index, 1)[0];
        note.trashDate = new Date().toISOString();
        trash.push(note);
        saveToLocalStorage();
        renderNotes();
      }

      if (e.target.classList.contains("done-btn")) {
        notes[index].completed = !notes[index].
        completed;
        saveToLocalStorage();
        renderNotes();
      }

      if (target.classList.contains("edit-btn")) {
        const index = target.parentElement.parentElement.dataset.index;
        const li = target.parentElement.parentElement;
        li.innerHTML = `
          <div class="note-content">
            <input type="text" class="form-control edit-content" value="${notes[index].content}">
            <input type="date" class="form-control edit-date" value="${notes[index].date}">
            <input type="time" class="form-control edit-time" value="${notes[index].time}">
          </div>
          <div class="note-buttons">
            <button class="btn btn-sm btn-primary float-right save-btn">Save</button>
            <button class="btn btn-sm btn-secondary float-right cancel-btn">Cancel</button>
          </div>
        `;

        const editDateInput = li.querySelector(".edit-date");
        const editTimeInput = li.querySelector(".edit-time");
        if (notes[index].date) {
          const dateParts = notes[index].date.split("-");
          const year = dateParts[0];
          const month = dateParts[1].padStart(2, "0");
          const day = dateParts[2].padStart(2, "0");
          editDateInput.value = `${year}-${month}-${day}`;
        }
        if (notes[index].time) {
          editTimeInput.value = notes[index].time;
        }

        editButtons.querySelector(".save-btn").addEventListener("click", () => {
          const newContent = li.querySelector(".edit-content").value;
          const newDate = li.querySelector(".edit-date").value;
          const newTime = li.querySelector(".edit-time").value;

          notes[index].content = newContent;
          notes[index].date = newDate;
          notes[index].time = newTime;

          saveToLocalStorage();
          renderNotes();
        });

        editButtons.querySelector(".cancel-btn").addEventListener("click", () => {
          renderNotes();
        });
      }

      if (target.classList.contains("save-btn")) {
        const index = target.parentElement.parentElement.dataset.index;
        const li = target.parentElement.parentElement;
        const newContent = li.querySelector(".edit-content").value;
        const newDate = li.querySelector(".edit-date").value;
        const newTime = li.querySelector(".edit-time").value;

        notes[index].content = newContent;
        notes[index].date = newDate;
        notes[index].time = newTime;

        saveToLocalStorage();
        renderNotes();
      }

      if (target.classList.contains("cancel-btn")) {
        renderNotes();
      }
    });

    new Sortable(noteList, {
      animation: 150,
      onEnd: () => {
        notes = Array.from(noteList.children).map(
          (li) => notes[li.dataset.index]
        );
        saveToLocalStorage();
      },
    });    
  }

  renderNotes();

  resetBtn.addEventListener('click', () => {
    $('#resetConfirmationModal').modal('show');
  });

  confirmResetBtn.addEventListener('click', () => {
    localStorage.removeItem('cookiesAccepted');
    localStorage.removeItem('notes');
    localStorage.removeItem('trash');
    window.location.reload();
  });
});
