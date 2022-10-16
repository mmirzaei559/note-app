$(document).ready(function () {
    // get existing Notes from localStorage
    var existingNotes = JSON.parse(localStorage.getItem("notes"));

    // checking the value of existingNotes array
    if (existingNotes === null) existingNotes = [];

    // call renderNoteCards after document loaded
    renderNoteCards();

    // is listening to submit a new note or edit a note
    $("#save").on("click", function () {
        var noteId = $(".modal").attr("data-modal-id");
        var noteTitle = $("#noteTitle").val();
        var subtitle = $("#subtitle").val();
        var description = $("#description").val();

        if (noteTitle != "") {
            var getDayName = function () {
                return new Date()
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .substring(0, 3)
                    .toUpperCase();
            };
            var monthNames = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ];
            var note = {
                id: existingNotes.length == 0 ? 1 : existingNotes[existingNotes.length - 1].id + 1,
                noteTitle: noteTitle,
                subtitle: subtitle,
                description: description,
                date: {
                    dayName: getDayName(),
                    day: new Date().getDate(),
                    month: monthNames[new Date().getMonth()].toUpperCase(),
                    year: new Date().getFullYear(),
                },
            };

            // checking for note object is new or existing
            if (noteId != 0) {
                let editedNoteIndex = existingNotes.findIndex(function (n) {
                    return n.id == noteId;
                });
                note.id = +noteId;
                existingNotes[editedNoteIndex] = note;
            } else {
                existingNotes.push(note);
            }
            localStorage.setItem("notes", JSON.stringify(existingNotes));

            $("#noteTitle").val("");
            $("#subtitle").val("");
            $("#description").val("");
            location.reload(true);
        } else return;
    });

    // Listening to clean up the modal form after cancellation
    $("#cancel, .add-note-small-button").on("click", function () {
        $("#add-edit-note").attr("data-modal-id", 0);
        $("#noteTitle").val("");
        $("#subtitle").val("");
        $("#description").val("");
    });

    // Listening to show the appropriate button when at least one note is present
    if (existingNotes.length) {
        $(".add-note-big-button").addClass("d-none");
        $(".add-note-big-button").removeClass("d-flex");
        $(".card").addClass("d-flex");
        $(".card").removeClass("d-none");
    } else {
        $(".add-note-big-button").addClass("d-flex");
        $(".add-note-big-button").removeClass("d-none");
        $(".card").addClass("d-none");
        $(".card").removeClass("d-flex");
    }

    // Listening to delete the selected note through the card
    $(".remove-note").on("click", function (event) {
        let id = event.currentTarget.id;
        deleteNote(id);
    });

    // Listening to delete selected note via card details
    $(document).on("click", ".remove-note", function (event) {
        let id = event.currentTarget.id;
        deleteNote(id);
    });

    // Listening to show card details
    $(".card-generated").on("click", function (event) {
        let id = event.currentTarget.id;
        let note = existingNotes.filter(function (n) {
            return n.id == id;
        });
        showCardDetails(note[0]);
    });

    // Listening to close card details
    $(document).on("click", ".close-card-details", function () {
        $("#card-details").remove();
        $("#main-row").removeClass("row");
        $("#cards").removeClass("col-lg-6");
        $(".card").addClass("col-lg-3");
    });

    // Listening to fill out the form with item card information to edit
    $("#add-edit-note").on("show.bs.modal", function (event) {
        if ($(event.relatedTarget).data("note-id")) {
            let card = $(event.relatedTarget);
            let id = card.data("note-id");
            let note = existingNotes.filter(function (n) {
                return n.id == id;
            });
            var modal = $(this);
            modal.find(".modal-body #noteTitle").val(note[0].noteTitle);
            modal.find(".modal-body #subtitle").val(note[0].subtitle);
            modal.find(".modal-body #description").val(note[0].description);
            modal.attr("data-modal-id", note[0].id);
        } else return;
    });

    function renderNoteCards() {
        let elements = $();
        for (var note of existingNotes) {
            elements = elements.add(`
        <div class="card note-card card-generated border-0 p-0 col-xs-12 col-sm-6 col-lg-3" id=${note.id}>
          <div class="box bg-white d-flex flex-column justify-content-between h-100">
            <div class="card-body">
                <h5 aria-label="note card title" class="card-title">${note.noteTitle}</h5>
                <p aria-label="note card subtitle" class="card-text">${note.subtitle}</p>
            </div>
            <div class="card-footer bg-white border-0 d-flex d-flex justify-content-start align-items-center">
                <img src="./assets/calendar-black.svg" alt="calendar">
                <small aria-label="note card date" class="text-muted">
                    ${note.date.dayName} ${" "}
                    ${note.date.day} ${" "}
                    ${note.date.month} ${" "}
                    ${note.date.year} ${" "}
                </small>
                <div class="ml-auto dropup">
                    <img class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" src="./assets/three-dots-black.svg" alt="edit or delete dropup toggle">
                    <div class="dropdown-menu">
                        <div id=${note.id} class="remove-note d-flex justify-content-start align-items-center dropdown-menu-item">
                            <img src="./assets/delete.svg" alt="delete note">
                            <small aria-label="delete the note card">DELETE NOTE</small>
                        </div>
                        <div data-toggle="modal" 
                            data-target="#add-edit-note"
                            data-note-id=${note.id}
                            class="d-flex justify-content-start align-items-center">
                            <img src="./assets/edit.svg" alt="edit note">
                            <small aria-label="edit the note card">EDIT</small>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>`);
        }
        $("#cards").append(elements);
    }

    function showCardDetails(note) {
        $("#card-details").remove();
        $("#main-row").addClass("row");
        $("#cards").addClass("col-lg-6");
        $(".card").removeClass("col-lg-3");
        let elements = $();
        elements = elements.add(`
            <div id="card-details" class="row col-xs-12 col-lg-6">
            <div class="w-100">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                      <small aria-label="note card title">${note.noteTitle}</small>
                      <small  aria-label="close card details" class="close-card-details">X</small>
                    </div>
                    <div class="card-body p-5">
                        <h2  aria-label="note card title">${note.noteTitle}</h2>
                        <h6  aria-label="note card subtitle">${note.subtitle}</h6>
                        <hr>
                        <pre  aria-label="note card description">${note.description}</pre>
                        <hr>
                        <div class="card-footer border-0 d-flex d-flex justify-content-start align-items-center">
                            <img src="./assets/calendar-white.svg" alt="calendar">
                            <small aria-label="note card date" class="text-muted">
                            ${note.date.dayName} ${" "}
                            ${note.date.day} ${" "}
                            ${note.date.month} ${" "}
                            ${note.date.year} ${" "}
                            </small>
                            <div class="ml-auto dropup">
                                <img class="dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" src="./assets/three-dots-white.svg" alt="edit or delete dropup toggle">
                                <div class="dropdown-menu">
                                    <div id=${note.id} class="remove-note d-flex justify-content-start align-items-center dropdown-menu-item">
                                        <img src="./assets/delete.svg" alt="delete note">
                                        <small aria-label="delete the note card">DELETE NOTE</small>
                                    </div>
                                    <div data-toggle="modal" 
                                        data-target="#add-edit-note"
                                        data-note-id=${note.id}
                                        class="d-flex justify-content-start align-items-center">
                                        <img src="./assets/edit.svg" alt="edit note">
                                        <small aria-label="edit the note card">EDIT</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>`);
        $("#main-row").prepend(elements);
    }

    function deleteNote(id) {
        let notes = existingNotes;
        let length = existingNotes.length;
        notes = notes.filter(function (note) {
            return note.id != id;
        });
        localStorage.setItem("notes", JSON.stringify(notes));
        location.reload(true);
        return notes.length != length;
    }
});
