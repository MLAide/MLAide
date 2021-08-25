import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: 'app-run-note',
  templateUrl: './run-note.component.html',
  styleUrls: ['./run-note.component.scss']
})
export class RunNoteComponent implements OnInit {
  @Input()
  public note: string;

  @Output()
  public updateNote = new EventEmitter<string>();

  // the note action buttons (save & cancel) are only visible while focus is on textarea
  public showNoteActionButtons = false;
  public currentNote: string;

  private canceledEditNote = false;

  constructor() { }

  ngOnInit(): void {
    this.currentNote = this.note || "";
  }

  public focusedNoteTextarea() {
    this.showNoteActionButtons = true;
  }

  public unfocusedNoteTextarea() {
    this.showNoteActionButtons = false;

    if (!this.canceledEditNote) {
      this.save();
    }
    this.canceledEditNote = false;
  }

  public save() {
    if (this.note !== this.currentNote) {
      this.updateNote.emit(this.currentNote);
    }
  }

  public cancel() {
    this.canceledEditNote = true;
    this.currentNote = this.note || "";
  }
}
