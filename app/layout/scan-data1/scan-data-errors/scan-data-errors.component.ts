import { Component, OnInit } from '@angular/core';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { saveAs } from 'file-saver';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-scan-data-errors',
  templateUrl: './scan-data-errors.component.html',
  styleUrls: ['./scan-data-errors.component.scss']
})
export class ScanDataErrorsComponent implements OnInit {

  errors: any[] = [];
  constructor(private scanDataService: ScanDataService,
              private spinner: NgxSpinnerService,
              private toaster: ToastrService) { }

  ngOnInit() {
    this.getScanDataLogs();
  }

  getScanDataLogs() {
    this.scanDataService.getScanDataLogs().subscribe( res => {
      this.errors = res.result;
    });
  }

  getScanDataFile(id, filename) {
    this.spinner.show();
    this.scanDataService.getScanDataFile(id).subscribe(res => {
      this.spinner.hide();
      var blob = new Blob([res], {type: "text/plain;charset=utf-8"});
      saveAs(blob, filename);
    });
  }

  closeAlert(error) {
    this.errors.splice(this.errors.indexOf(error), 1);
  }

  downloadFile(fileUrl) {
    // var FileSaver = require('file-saver');
    saveAs('http://104.239.143.92:5007/' + fileUrl, 'file.txt');
  }

  retryScanDataLog(errorId) {
    this.spinner.show()
    this.scanDataService.retryScanDataLogs(errorId).subscribe( res => {
      this.spinner.hide();
      if (!res.status) {
        this.toaster.error(res.result,res.message);
      } else {
        this.toaster.success(res.message);
      }
    });
  }

}
