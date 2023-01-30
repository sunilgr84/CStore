import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { NgxSpinnerService } from 'ngx-spinner';
import { Color } from 'ng2-charts';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { I } from '@angular/cdk/keycodes';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/commmon/common.service';
import { MatSelect } from '@angular/material';
@Component({
  selector: 'app-manage-stock-transactions',
  templateUrl: './stock-transactions.component.html',
  styleUrls: ['./stock-transactions.component.scss']
})
export class StockTransactionsComponent implements OnInit {

  @Input() itemId: any;
  @ViewChild('storeSelect') storeSelect: MatSelect;
  @ViewChild('tabs') public tabs: NgbTabset;

  showLineChart: any = false;
  showBarChart: any = false;
  showGraph: any = false;
  status: any = false;
  placement = "bottom-right";
  showStoreSelection: any = true;
  selectedStores = new FormControl();
  storeLocationList: any;
  userInfo: any;
  selectedCompanyId: any;
  selectedDateRange: any;
  stockTransactionsList: any = [];
  stockTransactionsQtySum: any = 0;
  stockTransactionsSalesAmountSum: any = 0;

  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: any[] = [];
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    legend: {
      display: false
    },
    scales: {
      xAxes: [{
        gridLines: {
          drawOnChartArea: false
        }
      }],
      yAxes: [{
        gridLines: {
          drawOnChartArea: false
        }
      }]
    },
  };
  public lineChartPlugins = [];

  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';

  public lineChartColors: Color[] = [
    {
      backgroundColor: 'rgba(82,136,189,0.2)',
      borderColor: '#6a6a6a',
      pointBackgroundColor: '#989898',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#989898'
    }
  ];

  public barChartLabels: any[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataSets[] = [];
  public barChartOptions: any['options'] = {
    responsive: true,
    legend: {
      display: false,
    },
    scales: {
      x: {},
      y: {
        min: 10
      },
      xAxes: [{
        gridLines: {
          drawOnChartArea: false
        }
      }],
      yAxes: [{
        gridLines: {
          drawOnChartArea: false
        }
      }]
    },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end'
      }
    }
  };

  public barChartPlugins = [];

  stockTxnsGridOptions: any;
  purchaseHistoryGridOptions: any;
  gridApi: any;
  purchaseHistoryGridApi: any;
  totalPurchaseQty: any = 0;
  totalPurchaseAmount: any = 0.00;

  constructor(private storeService: StoreService, private constantService: ConstantService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService, private paginationGridService: PaginationGridService, public router: Router, private commonService: CommonService) {
    this.stockTxnsGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.itemHistoryByStoreGrid);
    this.purchaseHistoryGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.purchaseHistoryGrid);
  }

  ngOnInit() {
    const dateRange = {
      fDate: moment().subtract(30, 'd').format('YYYY-MM-DD'),
      tDate: moment().format('YYYY-MM-DD'),
      selectionType: "CustomRange"
    };
    this.selectedDateRange = dateRange;
    this.userInfo = this.constantService.getUserInfo();
    this.getStoreLocationDetails();
    this.selectedCompanyId = this.constantService.getUserInfo().companyId;
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    this.gridApi.setRowData([]);
  }

  onPurchaseHistoryGridReady(params) {
    this.purchaseHistoryGridApi = params.api;
    // this.purchaseHistoryGridApi.sizeColumnsToFit();
    // this.purchaseHistoryGridApi.setRowData([]);
  }

  getStoreLocationDetails() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      this.storeLocationList.map((store) => {
        let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
        store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
        return store;
      });
      this.selectedStores.patchValue(this.storeLocationList[0]);
      // setTimeout(() => {
      //   this.storeSelect.open();
      // });
      this.getDashboardData();
    } else {
      this.spinner.show();
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.spinner.hide();
        this.storeLocationList = this.storeService.storeLocation;
        this.storeLocationList.map((store) => {
          let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
          store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
          return store;
        });
        this.selectedStores.patchValue(this.storeLocationList[0]);
        // setTimeout(() => {
        //   this.storeSelect.open();
        // });
        this.getDashboardData();
      }, (error) => {
        console.log(error);
      });
    }
  }

  pad(input, size) {
    while (input.length < (size || 2)) {
      input = "0" + input;
    }
    return input;
  }

  getDashboardData() {
    if (this.selectedStores && this.selectedStores.value === null) {
      return;
    }
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.showStoreSelection = false;
    }
    let fromDate = this.selectedDateRange.fDate;
    let toDate = this.selectedDateRange.tDate;
    let storeLocationIds = (this.selectedStores && this.selectedStores.value) ? this.selectedStores.value.storeLocationID : this.storeLocationList[0].storeLocationID;
    if (!storeLocationIds) {
      this.toastr.error("Please select stored location", this.constantService.infoMessages.error);
      return;
    }
    this.showLineChart = false;
    this.spinner.show();
    this.setupService.getData("Item/SalesHistoryOfItem?startDate=" + fromDate + "&endDate=" + toDate + "&storelocations=" + storeLocationIds + "&itemID=" + this.itemId).subscribe((response) => {
      this.spinner.hide();
      this.lineChartData = [];
      this.lineChartLabels = [];
      this.barChartLabels = [];
      this.stockTransactionsQtySum = 0;
      this.stockTransactionsSalesAmountSum = 0;
      let storeSales = [];
      if (response) {
        this.showLineChart = true;
        _.each(response, (element) => {
          this.stockTransactionsQtySum += element.Qty;
          this.stockTransactionsSalesAmountSum += element.SalesAmount;
          storeSales.push(element.SalesAmount);
          this.lineChartLabels.push(moment(element.BusinessDate).format('YYYY-MM-DD'));
          this.barChartLabels.push(moment(element.BusinessDate).format('YYYY-MM-DD'));
        });
        if (storeSales.length > 0) {
          this.lineChartData.push({ data: storeSales, label: '' });
          this.barChartData = [
            { data: storeSales, label: '' }
          ];
        }
      }
    });
    this.getItemHistoryByStore();
    this.getPurchaseHistoryByStore();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.getDashboardData();
  }

  onStatusChange() {
    this.status = !this.status;
    if (this.status) {
      this.showLineChart = false;
      this.showBarChart = true;
    } else {
      this.showLineChart = true;
      this.showBarChart = false;
    }
  }

  getItemHistoryByStore() {
    if (this.selectedStores && this.selectedStores.value === null) {
      return;
    }
    let fromDate = this.selectedDateRange.fDate;
    let toDate = this.selectedDateRange.tDate;
    let storeLocationIds = (this.selectedStores && this.selectedStores.value) ? this.selectedStores.value.storeLocationID : this.storeLocationList[0].storeLocationID;
    if (!storeLocationIds) {
      this.toastr.error("Please select stored location", this.constantService.infoMessages.error);
      return;
    }
    // this.spinner.show();
    this.setupService.getData("Item/GetItemHistoryByStore?start=" + fromDate + "&end=" + toDate + "&StorelocationID=" + storeLocationIds + "&itemID=" + this.itemId).subscribe((response) => {
      // this.spinner.hide();
      if (response && response['statusCode']) {
        this.gridApi.setRowData([]);
        return;
      }
      this.gridApi.setRowData(response);
    });
  }

  getPurchaseHistoryByStore() {
    if (this.selectedStores && this.selectedStores.value === null) {
      return;
    }
    let fromDate = this.selectedDateRange.fDate;
    let toDate = this.selectedDateRange.tDate;
    let storeLocationIds = (this.selectedStores && this.selectedStores.value) ? this.selectedStores.value.storeLocationID : this.storeLocationList[0].storeLocationID;
    if (!storeLocationIds) {
      this.toastr.error("Please select stored location", this.constantService.infoMessages.error);
      return;
    }
    this.spinner.show();
    this.setupService.getData("Item/PurchaseHistoryByItem?startDate=" + fromDate + "&endDate=" + toDate + "&storelocations=" + storeLocationIds + "&itemID=" + this.itemId).subscribe((response) => {
      // this.setupService.getData("Item/PurchaseHistoryByItem?startDate=12-01-2019&endDate=12-30-2020&storelocations=94&itemID=445826").subscribe((response) => {
      this.spinner.hide();
      if (response && (response['statusCode'] || response.length === 0)) {
        this.purchaseHistoryGridApi.setRowData([]);
        return;
      }
      this.totalPurchaseQty = 0;
      this.totalPurchaseAmount = 0.00
      _.each(response, (element) => {
        this.totalPurchaseQty += element.PackQty;
        this.totalPurchaseAmount += (element.PackQty * element.CasePrice);
      });
      let purchaseHistoryGridOptionsColumn;
      if (response[0].hasOwnProperty('CartonPOSCode') && response[0].CartonPOSCode != null) {
        purchaseHistoryGridOptionsColumn = _.cloneDeep(this.paginationGridService.getGridOption(this.constantService.gridTypes.purchaseHistoryCartonGrid));
      } else {
        purchaseHistoryGridOptionsColumn = _.cloneDeep(this.paginationGridService.getGridOption(this.constantService.gridTypes.purchaseHistoryGrid));
      }
      this.purchaseHistoryGridApi.setColumnDefs(purchaseHistoryGridOptionsColumn.columnDefs);
      this.purchaseHistoryGridApi.setRowData(response);
    });
  }

  tabChange(params) {
    const activeTab = params && params.nextId;
    if (activeTab === "purchases-history") {
      this.purchaseHistoryGridApi.sizeColumnsToFit();
    } else if (activeTab === "stock-transactions") {
      this.gridApi.sizeColumnsToFit();
    }
  }

  detailsAction(params) {
    this.commonService.invoiceid = Number(params.data.InvoiceID);
    this.router.navigate(['invoice/vendor-invoice']);
  }
}
