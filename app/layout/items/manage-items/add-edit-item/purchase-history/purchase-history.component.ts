import { Component, Input, OnInit } from '@angular/core';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-purchase-history',
  templateUrl: './purchase-history.component.html',
  styleUrls: ['./purchase-history.component.scss']
})
export class PurchaseHistoryComponent implements OnInit {

  @Input() itemId: any;

  storeList: any;
  selectedStore: any;
  userInfo = this.constantService.getUserInfo();
  selectedDateRange: any;
  showOnlyPriceChanges: any;

  historyList: any;
  gridApi: any;
  paginationGridOptions: any;

  constructor(private storeService: StoreService, private constantService: ConstantService, private setupService: SetupService, private calendar: NgbCalendar, private paginationGridService: PaginationGridService, private spinner: NgxSpinnerService
    , private toaster: ToastrService) {
    this.paginationGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.itemHistoryReportGrid);
  }

  ngOnInit() {
    this.getStoreLocationList();
    const dateRange = {
      fDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
      tDate: moment().format('YYYY-MM-DD'),
      selectionType: "CustomRange"
    };
    this.selectedDateRange = dateRange;
  }

  getStoreLocationList() {
    this.spinner.show();
    if (this.storeService.storeLocation) {
      this.storeList = this.storeService.storeLocation;
      if (this.storeList && this.storeList.length === 1) {
        this.selectedStore = this.storeList[0].storeLocationID;
        const dateRange = {
          fDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
          tDate: moment().format('YYYY-MM-DD'),
          selectionType: "CustomRange"
        };
        this.selectedDateRange = dateRange;
        this.searchActivity();
      }
      this.spinner.hide();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.spinner.hide();
        this.storeList = this.storeService.storeLocation;
        if (this.storeList && this.storeList.length === 1) {
          this.selectedStore = this.storeList[0].storeLocationID;
          const dateRange = {
            fDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
            tDate: moment().format('YYYY-MM-DD'),
            selectionType: "CustomRange"
          };
          this.selectedDateRange = dateRange;
          this.searchActivity();
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData([]);
  }

  searchActivity() {
    if (!this.selectedStore) {
      this.toaster.error('Store Selection Required', this.constantService.infoMessages.error);
      return;
    }
    this.spinner.show();
    this.setupService.getData('Item/GetItemActivity?startDate=' + this.selectedDateRange.fDate + '&endDate=' + this.selectedDateRange.tDate + '&storelocations=' + this.selectedStore + '&itemID=' + this.itemId).subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.historyList = [];
        this.gridApi.setRowData(this.historyList);
        this.onOnlyPriceChanges();
        return;
      }
      this.historyList = [];
      let responseActivityLog = response.activityLogList;
      for (let i = 0; i < responseActivityLog.length; i++) {
        let log = responseActivityLog[i].log;
        let updatedFields = log.split(/\r\n/).filter(item => item);
        for (let j = 0; j < updatedFields.length; j++) {
          let fieldName = updatedFields[j].substring(0, updatedFields[j].indexOf('updated')).trim();
          let rowData = JSON.parse(JSON.stringify(responseActivityLog[i]));
          let fromIndex = updatedFields[j].indexOf(' from ');
          let toIndex = updatedFields[j].indexOf(' to ');
          rowData.from = updatedFields[j].substring(fromIndex + 6, toIndex).trim().replaceAll('"', '');
          rowData.to = updatedFields[j].substring(toIndex + 4).trim().replaceAll('"', '');
          if (fieldName === "InventoryValuePrice") {
            rowData.changeIn = 'Buying Cost';
            rowData.from = "$" + Number(rowData.from).toFixed(2);
            rowData.to = "$" + Number(rowData.to).toFixed(2);
          } else if (fieldName === "RegularSellPrice") {
            rowData.changeIn = 'Selling Price';
            rowData.from = "$" + Number(rowData.from).toFixed(2);
            rowData.to = "$" + Number(rowData.to).toFixed(2);
          } else if (fieldName === "StoreLocationTaxID") {
            rowData.changeIn = 'Tax ID';
          } else {
            rowData.changeIn = fieldName;
          }
          rowData.fieldName = fieldName;
          this.historyList.push(rowData);
        }
      }
      this.gridApi.setRowData(this.historyList);
      this.onOnlyPriceChanges();
    });
  }

  onOnlyPriceChanges() {
    let filteredData = []
    if (this.showOnlyPriceChanges && this.historyList && this.historyList.length > 0) {
      for (let k = 0; k < this.historyList.length; k++) {
        if (this.historyList[k].fieldName === "RegularSellPrice") {
          filteredData.push(this.historyList[k]);
        }
      }
      this.gridApi.setRowData(filteredData);
    } else {
      this.gridApi.setRowData(this.historyList);
    }
  }

}
