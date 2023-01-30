import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ScanDataService } from '@shared/services/scanDataService/scan-data.service';
import { StoreService } from '@shared/services/store/store.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { saveAs } from 'file-saver';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-scan-data-acknowledgment',
  templateUrl: './scan-data-acknowledgment.component.html',
  styleUrls: ['./scan-data-acknowledgment.component.scss']
})
export class ScanDataAcknowledgmentComponent implements OnInit {

  constructor(private gridService: PaginationGridService, private constants: ConstantService,
    private scandataService: ScanDataService, private toastr: ToastrService, private toaster: ToastrService,
    private spinner: NgxSpinnerService, private modalService: NgbModal, private storeService: StoreService, private setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.scanDataAcknowledgment);
    this.userInfo = this.constants.getUserInfo();
  }

  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  gridOptions: any;
  gridApi: any;
  userInfo: any;
  filterText: string;
  showFilter: any = false;
  companyList: any;
  selectedCompanyId: any;
  storeList: any;
  storeLocationID: any;
  weekendDate: any;
  popupData: any;

  ngOnInit() {
    this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.userInfo.companyId);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  getCompaniesById(roleName, userName, companyId) {
    this.setupService.getData('Company/GetCompanysList/' + roleName + '/' + userName + '/' + companyId).subscribe(
      (response) => {
        this.companyList = response;
        this.companyList.map((company) => {
          let formattedCompanyId = this.pad(company.companyID.toString(), 4);
          company.companyDetailName = company.companyName + " (" + formattedCompanyId + ")";
          return company;
        });
      });
  }

  companyChange(event) {
    if (event) {
      this.getStoreLocationList(event.companyID);
    } else {
      this.storeList = [];
      this.storeLocationID = null;
    }
  }

  getStoreLocationList(companyId) {
    this.spinner.show();
    this.setupService.getData(`StoreLocation/getByCompanyId/${Number(companyId)}/${this.userInfo.userName}`).subscribe((response) => {
      this.spinner.hide();
      this.storeList = response;
      if (this.storeList && this.storeList.length === 1) {
        this.storeLocationID = this.storeList[0].storeLocationID;
      }
    }, (error) => {
      console.log(error);
    });
  }


  dateChange(event) {
    this.weekendDate = event.formatedDate;
  }

  searchScanDataAck() {
    this.showFilter = true;
    if (this.storeLocationID === undefined || this.storeLocationID === null || this.storeLocationID === "") {
      this.storeLocationID = 0;
    }
    if (this.weekendDate === undefined || this.weekendDate === null || this.weekendDate === "") {
      this.toastr.error('Weekend Selection Required', 'Error');
    } else {
      let postData = {
        "storeLocationID": this.storeLocationID,
        "weekendDate": moment(this.weekendDate).format('YYYY-MM-DD'),
        "status": ""
      };
      this.spinner.show();
      this.scandataService.getScanDataAcknowledgment(postData).subscribe(res => {
        this.spinner.hide();
        if (Array.isArray(res.result)) {
          this.gridApi.setRowData(res.result);
        } else {
          this.gridApi.setRowData([]);
        }
      });
    }
  }

  openDownloadShowModal(res) {
    this.spinner.show();
    this.scandataService.getScanDataAcknowledgmentJsonFile(res.value).subscribe(res => {
      this.spinner.hide();
      if (res.status === 1) {
        this.popupData = res.result;
        this.modalService.open(this.modalContent, { size: 'lg' });
      } else {
        this.toaster.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
      }
    });
  }

  downloadScanDataFile(rejectedFileName) {
    this.modalService.dismissAll();
    if (rejectedFileName === undefined || rejectedFileName === null || rejectedFileName === "") {
      this.toaster.error("File Not Found", this.constants.infoMessages.error);
    } else {
      this.spinner.show();
      this.scandataService.downloadScanDataAcknowledgmentFile(rejectedFileName).subscribe(res => {
        this.spinner.hide();
        const blob = new Blob([res], { type: 'text' });
        saveAs(blob, `${new Date().toISOString().trim().replace(/[^a-zA-Z0-9]/g, '')}.txt`);
      });
    }
  }

  pad(input, size) {
    while (input.length < (size || 2)) {
      input = "0" + input;
    }
    return input;
  }

}
