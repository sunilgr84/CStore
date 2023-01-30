import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss'],
  animations: [routerTransition()],
  encapsulation: ViewEncapsulation.None
})
export class StoreComponent implements OnInit {
  gridApi: any;
  gridOptions: any;
  rowData: any;
  editRowData: any;
  isAddStores: boolean;
  columnDefs: any;
  storeLocationID: any;
  // disable tabs
  isEnableTab = true;
  userInfo: any;
  filterText: string;
  gridColumnApi: any;
  hederTitle = 'Store Information';
  @ViewChild('tabs') public tabs: NgbTabset;
  lotteryStateCode: any;
  constructor(private gridService: GridService, private constantsService: ConstantService, private dataService: SetupService
    , private logger: LoggerService, private toastr: ToastrService,
    private spinner: NgxSpinnerService) {
    this.gridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.storeInfoGrid);
  }

  ngOnInit() {
    this.columnDefs = this.gridOptions.columnDefs;
    this.userInfo = this.constantsService.getUserInfo();
    this.getStoreListByCompanyId(this.userInfo.companyId);
  }
  onGridReady(params) {
    this.gridApi = params.api;
    // this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  getStoreListByCompanyId(companyId) {
    this.spinner.show();
    this.dataService.getData('StoreLocation/GetStoresDetailsByCompanyId/' + companyId).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  addStore(isAdd) {
    this.isEnableTab = true;
    this.editRowData = null;
    this.isAddStores = isAdd;
  }
  backToStoreList(isAdd) {
    this.editRowData = null;
    this.enableAllTabs(true);
    this.getStoreListByCompanyId(this.userInfo.companyId);
    this.isAddStores = isAdd;
  }
  editAction(params) {
    this.enableAllTabs({ isDisabledTab: false });
    this.editRowData = params.data;
    this.storeLocationID = this.editRowData.storeLocationID;
    this.lotteryStateCode = this.editRowData.stateCode;
    this.logger.log(this.editRowData);
    this.isAddStores = true;
  }
  enableAllTabs(event) {
    if (event.data) {
      this.editRowData = event.data;
      this.storeLocationID = this.editRowData.storeLocationID;
      this.lotteryStateCode = this.editRowData.stateCode;
    }

    this.isEnableTab = event.isDisabledTab;
    //   throw new Error("Method not implemented.");
  }
  delAction(params) {
    this.spinner.show();
    this.dataService.deleteData(`StoreLocation/${params.data.storeLocationID}`).
      subscribe((response: any) => {
        // this.spinner.hide();
        if (response) {
          this.spinner.hide();
          this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
          this.rowData = this.rowData.filter(r => r.storeLocationID !== params.data.storeLocationID);
        } else {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.contactAdmin);
      });
  }
  tabChange(params) {
    const activeTab = params && params.nextId;
    switch (activeTab) {
      case 'tab-store-information':
        this.hederTitle = 'Add Store';
        break;
      case 'tab-sales-tax-setup':
        this.hederTitle = 'Add Sales Tax Setup';
        break;
      case 'tab-sales-restriction':
        this.hederTitle = 'Add Sales Restriction';
        break;
      case 'tab-fuel-setup':
        this.hederTitle = 'Add Fuel Setup';
        break;
      case 'tab-store-fees':
        this.hederTitle = 'Add Store Fees';
        break;
      case 'tab-method-of-payment':
        this.hederTitle = 'Add Method Of Payment';
        break;
      case 'tab-store-services':
        this.hederTitle = 'Add Store Services';
        break;
      case 'tab-accounting':
        this.hederTitle = 'Add Accounting';
        break;
      case 'tab-setting-time-off':
        this.hederTitle = 'Setting (Time off)';
        break;
      case 'tab-timesheet-timeoff':
        this.hederTitle = 'Timesheet (Time off)';
        break;
      default:
        this.hederTitle = null;
        break;
    }

  }
  selectTab(params) {
    this.tabs.select(params.tabId);
  }

}
