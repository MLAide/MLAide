import { Directive, EventEmitter, HostBinding, HostListener, Output } from "@angular/core";

@Directive({
  selector: '[appDragNDrop]'
})
export class DragNDropDirective {

  @HostBinding('class.fileover') fileOver: boolean;
  @Output() fileDropped = new EventEmitter<any>();

  // Dragover listener
  @HostListener('dragover', ['$event']) onDragOver(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = true;
  }

  // Dragleave listener
  @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;
  }

  // Drop listener
  @HostListener('drop', ['$event']) public ondrop(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    this.fileOver = false;

    // https://stackoverflow.com/questions/3590058/does-html5-allow-drag-drop-upload-of-folders-or-a-folder-tree
    const items = evt.dataTransfer.items;
    for (const item of items) {
      if(item.webkitGetAsEntry().isFile) {
        let files = evt.dataTransfer.files;
        if (files.length > 0) {
          this.fileDropped.emit(files);
        }
      } else if (item.webkitGetAsEntry().isDirectory) {
        // TODO: Handle directories
      }
    }
  }

}
