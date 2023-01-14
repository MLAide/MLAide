import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import * as CryptoJS from 'crypto-js';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {
  @ViewChild("fileDropRef", { static: false }) fileDropEl: ElementRef;
  files: any[] = [];
  myFiles: {
    fileName: string;
    file: File;
    fileHash: string;
  }[] = [];

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
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 1000);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  async prepareFilesList(files: Array<File>) {

    for (const item of files) {
      var name = item.name;
      this.files.push(item);
      var md5 = await this.calculateHashForFile(item);
      this.myFiles.push({fileName: name, file: item, fileHash: md5})
      //console.log("md5 " + md5);
      console.log(JSON.stringify(this.myFiles));
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
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
