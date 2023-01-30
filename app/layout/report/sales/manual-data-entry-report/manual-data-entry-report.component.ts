import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manual-data-entry-report',
  templateUrl: './manual-data-entry-report.component.html',
  styleUrls: ['./manual-data-entry-report.component.scss']
})
export class ManualDataEntryReportComponent implements OnInit {

  inputDOB: any;
  LocationList: any;
  constructor() { }

  ngOnInit() {
  }

}
