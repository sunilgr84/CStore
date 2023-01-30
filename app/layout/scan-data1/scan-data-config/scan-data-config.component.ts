import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DownloadConfirmModalComponent } from '../download-confirm-modal/download-confirm-modal.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-scan-data-config',
  templateUrl: './scan-data-config.component.html',
  styleUrls: ['./scan-data-config.component.scss']
})
export class ScanDataConfigComponent implements OnInit {

  constructor(private gridService: PaginationGridService, private constants: ConstantService,
    private scandataService: ScanDataService, private toastr: ToastrService, private toaster: ToastrService,
    private confirmationDialogService: ConfirmationDialogService, private spinner: NgxSpinnerService, private modalService: NgbModal) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.scanDataConfig);
    this.userInfo = this.constants.getUserInfo();
  }

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  gridOptions: any;
  gridApi: any;
  dateSpanList: any;
  manufacturers: any;
  manufactureId: any;
  dateRange: any;
  selectedDateRange: any;
  userInfo: any;
  selectedScanDataConfig: any;
  filterText: string;
  showFilter: any = false;
  rowIndexQueue: any;
  showDateRange: any;

  ngOnInit() {
    this.rowIndexQueue = [];
    this.getManufacturers();
    this.showDateRange = false;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onMnfcChange(event) {
    this.dateRange = "";
    if (event.id === 1)
      this.dateSpanList = this.getLast6Weeks(0);
    else
      this.dateSpanList = this.getLast6Weeks(1);
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  onDateRangeChange(event) {
    this.selectedDateRange = event;
  }

  dateTimeRangeChange(event) {
    this.selectedDateRange = event;
    this.selectedDateRange.start = moment(event.fDate).format("MM-DD-YYYY");
    this.selectedDateRange.end = moment(event.tDate).format("MM-DD-YYYY")
    this.selectedDateRange.range = moment(event.fDate).format("MM-DD-YYYY") + " To " + moment(event.tDate).format("MM-DD-YYYY")
  }

  getLast6Weeks(dayStart) {
    //dayStart will be 0 or 1
    let todayDate = new Date();
    let todayDay = todayDate.getDay();
    let diff = todayDate.getDate() - todayDay + (todayDay == 0 ? -6 : dayStart);
    let weekStartDay = new Date(todayDate.setDate(diff));
    let allDates = [];
    var startDay = new Date(weekStartDay);
    var endDay = new Date(weekStartDay);
    for (let i = 0; i < 6; i++) {
      let start = new Date(startDay.setDate(startDay.getDate() - 7));
      let end;
      if (i === 0) {
        end = new Date(endDay.setDate(endDay.getDate() - 1));
      }
      else
        end = new Date(endDay.setDate(endDay.getDate() - 7));
      let response = {
        start: moment(start).format("MM-DD-YYYY"),
        end: moment(end).format("MM-DD-YYYY"),
        range: moment(start).format("MM-DD-YYYY") + " To " + moment(end).format("MM-DD-YYYY")
      }
      if (i === 0) {
        this.selectedDateRange = _.clone(response);
        this.dateRange = this.selectedDateRange.end;
      }
      allDates.push(response);
    }
    return allDates;
  }

  getManufacturers() {
    this.scandataService.getManufacturers().subscribe(res => {
      this.manufacturers = res.result;
    });
  }

  searchScanDataConfig() {
    this.showFilter = true;
    if (this.manufactureId === undefined || this.manufactureId === null || this.manufactureId === "") {
      this.toastr.error('Manufacturer Selection Required', 'Error');
    } else if (!this.showDateRange && this.dateRange === undefined || this.dateRange === null || this.dateRange === "") {
      this.toastr.error('Date Range Selection Required', 'Error');
    } else if (this.showDateRange && this.selectedDateRange === undefined || this.selectedDateRange === null || this.selectedDateRange === "") {
      const dateRange = { fDate: moment().format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange", end: moment().format('YYYY-MM-DD') };
      this.selectedDateRange = dateRange;
    } else {
      let endDate;
      if (this.showDateRange) {
        endDate = this.selectedDateRange.end;
      } else {
        endDate = this.dateRange;
      }
      let postData = {
        "manufacturerId": this.manufactureId,
        "date": endDate,
        "pageNo": 0,
        "perPageCount": 0
      };
      this.scandataService.getScanDataReport(postData).subscribe(res => {
        this.gridApi.setRowData(res.result.result);
      });
    }
  }

  onSubmit(event) {
    this.spinner.show();
    this.scandataService.reSubmitData(event.data.weekendDate, event.data.manufactureId, event.data.companyId, event.data.storeLocationId, this.userInfo.userName).subscribe(res => {
      this.spinner.hide();
      if (res.status) {
        this.searchScanDataConfig();
        this.toaster.success(res.message);
      } else {
        this.toaster.error(res.message);
      }
    });
  }

  onReview(event) {
    console.log(event);
  }

  onRefresh(event) {
    this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
      "Syncing may reset if any changes done. Do you wish to proceed")
      .then(() => {
        this.scandataService.resyncScanData(this.selectedDateRange.start, this.selectedDateRange.end, event.data.manufactureId, event.data.companyId, event.data.storeLocationId, this.userInfo.userName).subscribe(res => {
          if (res.status === 1) {
            this.toastr.success(res.message, 'Success');
          } else {
            this.toastr.error(res.message, 'Error');
          }
        });
      }).catch((e) => console.log(e));
  }

  openDownloadConfirmModal(res) {
    let modalRef = this.modalService.open(DownloadConfirmModalComponent);
    modalRef.componentInstance.title = 'Download File.';
    modalRef.componentInstance.body = '<span style="font-size: 16px;" class="text-danger">There are some errors in data, please fix these errors before download.</span>'
    modalRef.componentInstance.message = res.message;
    modalRef.componentInstance.errors = res.result;
    modalRef.result.then(res => {
      if (res.status) {
        this.downloadFileFromLog(res.id);
      }
    }).catch(err => {
    });
  }

  downloadFileFromLog(logId) {
    this.scandataService.downloadFileFromLog(logId).subscribe(res => {
      const blob = new Blob([res], { type: 'text' });
      saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
    });
  }

  onDownload(event) {
    this.selectedScanDataConfig = event.data;
    this.selectedScanDataConfig.rowIndex = event.rowIndex;
    this.modalService.open(this.modalContent, { size: 'sm' });
  }

  affectChangesYes() {
    this.showDownloadLoader(this.selectedScanDataConfig.rowIndex);
    this.downloadScanDataFile();
    this.scandataService.markAsSubmit(this.selectedScanDataConfig.weekendDate, this.selectedScanDataConfig.manufactureId, this.selectedScanDataConfig.companyId, this.selectedScanDataConfig.storeLocationId, this.userInfo.userName).subscribe(res => {
      // if (res.status) {
      //   this.toaster.success(res.message);
      // } else {
      //   this.toaster.error(res.message);
      // }
    });
  }

  affectChangesNo() {
    this.showDownloadLoader(this.selectedScanDataConfig.rowIndex);
    this.downloadScanDataFile();
  }

  downloadScanDataFile() {
    this.modalService.dismissAll();
    this.scandataService.downloadScanDataFile(this.selectedDateRange.start, this.selectedDateRange.end, this.selectedScanDataConfig.manufactureId, this.selectedScanDataConfig.companyId, this.selectedScanDataConfig.storeLocationId, this.userInfo.userName).subscribe(res => {
      this.hideDownloadLoader();
      let parsRes;
      try {
        parsRes = JSON.parse(res);
      } catch (e) { }
      if (parsRes && parsRes.result) {
        this.openDownloadConfirmModal(parsRes);
      } else {
        const blob = new Blob([res], { type: 'text' });
        saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
      }
    });
  }

  showDownloadLoader(rowIndex) {
    let rowNode = this.gridApi.getRowNode(rowIndex);
    rowNode.data.showDownloadLoader = true;
    this.gridApi.redrawRows({ rowNodes: [rowNode] });
    this.rowIndexQueue.push(rowIndex);
  }

  hideDownloadLoader() {
    let rowNode = this.gridApi.getRowNode(this.rowIndexQueue.shift());
    let rowData = rowNode.data;
    rowData.showDownloadLoader = false;
    this.gridApi.redrawRows({ rowNodes: [rowNode] });
  }

  onDateEditor() {
    this.selectedDateRange = undefined;
    if (!this.showDateRange)
      this.showDateRange = true;
    else if (this.showDateRange)
      this.showDateRange = false;
  }
}
