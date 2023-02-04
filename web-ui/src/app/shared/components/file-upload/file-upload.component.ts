import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from "@angular/core";
import * as CryptoJS from 'crypto-js';
import { FileHash } from "@mlaide/state/validation-data-set/validation-data-set.models";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  @Output() newFilesForUploadWithHashesAddedEvent = new EventEmitter<UploadFilesWithFileHashes[]>();

  uploadFilesWithHashes: UploadFilesWithFileHashes[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  async prepareFilesList(files: Array<File>) {
    for (const item of files) {
      this.files.push(item);
      var md5 = await this.calculateHashForFile(item);
      this.uploadFilesWithHashes.push({
        file: item,
        fileHash: {
          fileName: item.name,
          fileHash: md5
        }
      })
    }
    this.newFilesForUploadWithHashesAddedEvent.emit(this.uploadFilesWithHashes);
    this.fileDropEl.nativeElement.value = "";
  }

  private async calculateHashForFile(file: any): Promise<string> {
    // https://stackoverflow.com/questions/28437181/md5-hash-of-a-file-using-javascript#28458081
    // https://stackoverflow.com/questions/45068925/how-to-use-cryptojs-with-angular-4
    return new Promise((resolve, reject) => {
      var fileReader: FileReader = new FileReader();
      var md5;
      fileReader.onloadend = (e) => {
        var result = fileReader.result;
        var wordArray = CryptoJS.lib.WordArray.create(result as any);
        md5 = CryptoJS.MD5(wordArray).toString();
        resolve(md5);
      };
      fileReader.readAsArrayBuffer(file);
    });
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }
  constructor() { }

  ngOnInit(): void {
  }

}

export interface UploadFilesWithFileHashes {
  file: File;
  fileHash: FileHash;
}
