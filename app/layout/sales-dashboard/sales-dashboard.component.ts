import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { ChartType, ChartOptions, ChartDataSets } from 'chart.js';
import { Color } from 'ng2-charts';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import * as moment from 'moment';
import { FormControl } from '@angular/forms';
import { $ } from 'protractor';
// import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.scss']
})
export class SalesDashboardComponent implements OnInit {

  storeLocationList: any;
  storeLocationListBuyDown: any;
  userInfo: any;
  selectedCompanyId: any;
  currentBuydownCycleList: Array<any> = []
  mRPByBrandList: Array<any> = [];
  selectedDateRange: any;
  placement = "bottom-right";
  selectedStores = new FormControl();
  dashboardDefaultData = {
    "grossSale": 0,
    "grossSaleNF": 0,
    "storeSale": 0,
    "storeSaleNF": 0,
    "fuelSale": 0,
    "fuelSaleNF": 0,
    "fuelGasVolume": 0,
    "customerCount": 0,
    "cash": 0,
    "cashNF": 0,
    "network": 0,
    "networkNF": 0,
    "credit": 0,
    "creditNF": 0,
    "debit": 0,
    "debitNF": 0,
    "voids": 0,
    "voidsNF": 0,
    "refunds": 0,
    "refundsNF": 0
  };
  dashboardData: any;
  dashboardResponse: any = [];
  buyDownStoreLocationId: any;

  //Bar Chart Options
  showBarChart = false;
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    // We use these empty structures as placeholders for dynamic theming.
    scales: { xAxes: [{}], yAxes: [{}] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
  };
  public barChartLabels: any[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartData: ChartDataSets[] = [];

  //Line Chart
  showLineChart: any = false;
  public lineChartData: ChartDataSets[] = [];
  public lineChartLabels: any[] = [];
  public lineChartLegend = true;
  public lineChartType: ChartType = 'line';
  public lineChartOptions: (ChartOptions & { annotation: any }) = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      line: {
        tension: 0
      }
    },
    scales: {
      // We use this empty structure as a placeholder for dynamic theming.
      xAxes: [{}],
      yAxes: [{}]
    },
    annotation: {
      annotations: [
        {
          type: 'line',
          mode: 'vertical',
          scaleID: 'x-axis-0',
          value: 'March',
          borderColor: 'orange',
          borderWidth: 2,
          label: {
            enabled: true,
            fontColor: 'orange',
            content: 'LineAnno'
          }
        },
      ],
    },
  };
  public lineChartColors: Color[] = [
    { // Green
      backgroundColor: 'rgba(79,160,61,0.2)',
      borderColor: 'rgba(79,160,61,1)',
      pointBackgroundColor: 'rgba(79,160,61,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(79,160,61,0.8)'
    },
    { //blue
      backgroundColor: 'rgba(82,136,189,0.2)',
      borderColor: 'rgba(82,136,189,1)',
      pointBackgroundColor: 'rgba(82,136,189,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(82,136,189,1)'
    },
    { // red
      backgroundColor: 'rgba(255,0,0,0.3)',
      borderColor: 'red',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];

  // Pie
  showPieChart: any = false;
  public pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          let sum = 0;
          let dataArr = ctx.chart.data.datasets[0].data;
          dataArr.map(data => {
            sum += data;
          });
          let percentage = (value * 100 / sum).toFixed(2) + "%";
          return percentage;
        },
        color: '#fff',
      }
    }
  };
  public pieChartLabels: any[] = [];
  public pieChartData: number[] = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = true;
  // public pieChartPlugins = [pluginDataLabels];
  public pieChartColors = [
    {
      backgroundColor: [
        '#F39C12', // 'rgba(110, 114, 20, 1)',
        '#3498DB', //'rgba(118, 183, 172, 1)',
        '#34495E',//'rgba(0, 148, 97, 1)',
        '#17A589',// 'rgba(129, 78, 40, 1)',
        '#C0392B',//'rgba(129, 199, 111, 1)'
        '#F5B041',
        '#82E0AA'],
    },
  ];
  topSellingItems = [];
  topSellingItemsByDept = [];
  chartOfAccountByMonthList = [];
  chartOfAccountByMonthFinalList = [];

  buydownWidgetDetails4: any = [];
  buydownWidgetDetails70: any = [];
  buydownWidgetDetails77: any = [];
  buydownProgramOptionsList4: any = [];
  buydownProgramOptionsList70: any = [];
  buydownProgramOptionsList77: any = [];

  constructor(private storeService: StoreService, private constantService: ConstantService, private setupService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService) {
  }

  ngOnInit() {
    const dateRange = { fDate: moment().startOf('month').format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
    this.userInfo = this.constantService.getUserInfo();
    this.selectedCompanyId = this.constantService.getUserInfo().companyId;
    this.getStoreLocationDetails();
    this.dashboardData = _.cloneDeep(this.dashboardDefaultData);
    this.getCurrentBuyDownCycle();
    this.getMRPByBrand();
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.getDashboardData();
  }

  getStoreLocationDetails() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
      this.storeLocationListBuyDown = this.storeService.storeLocation;
      this.storeLocationList.map((store) => {
        let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
        store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
        return store;
      });
      this.selectedStores.patchValue(this.storeLocationList);
      this.getDashboardData();
      this.chartOfAccountByMonth();
    } else {
      this.spinner.show();
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.spinner.hide();
        this.storeLocationList = this.storeService.storeLocation;
        this.storeLocationListBuyDown = this.storeService.storeLocation;
        this.storeLocationList.map((store) => {
          let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
          store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
          return store;
        });
        this.selectedStores.patchValue(this.storeLocationList);
        this.getDashboardData();
        this.chartOfAccountByMonth();
      }, (error) => {
        console.log(error);
      });
    }
  }

  getDashboardData() {
    if (this.selectedStores && this.selectedStores.value === null) {
      return;
    }
    let postData = {
      "storeLocations": (this.selectedStores && this.selectedStores.value) ? this.selectedStores.value.map(x => x.storeLocationID).join(',') : this.storeLocationList.map(x => x.storeLocationID).join(','),
      "companyID": 0,
      "startDate": this.selectedDateRange.fDate,
      "endDate": this.selectedDateRange.tDate,
    }
    this.barChartLabels = [];
    this.pieChartLabels = [];
    this.pieChartData = [];
    this.dashboardResponse = [];
    this.spinner.show();
    this.showBarChart = false;
    this.showPieChart = false;
    this.setupService.postData('SalesPurchaseReport/SummaryByStore', postData).subscribe((response) => {
      this.spinner.hide();
      this.dashboardData = _.cloneDeep(this.dashboardDefaultData);
      if (response && response.length > 0) {
        this.dashboardResponse = response;
        this.showBarChart = true;
        this.showPieChart = true;
        let storeSales = [];
        let fuelSales = [];
        _.each(response, (data) => {
          this.dashboardData.grossSale += data.grossSale;
          this.dashboardData.storeSale += data.storeSale;
          this.dashboardData.fuelSale += data.fuelSale;
          this.dashboardData.fuelGasVolume += data.fuelGasVolume;
          this.dashboardData.customerCount += data.customerCount;
          this.dashboardData.cash += data.cash;
          this.dashboardData.network += data.network;
          this.dashboardData.credit += data.credit;
          this.dashboardData.debit += data.debit;
          this.dashboardData.voids += data.voids;
          this.dashboardData.refunds += data.refunds;
          this.barChartLabels.push(data.storeName);
          this.pieChartLabels.push(data.storeName);
          this.pieChartData.push(data.grossSale);
          storeSales.push(data.storeSale);
          fuelSales.push(data.fuelSale);
        });
        this.dashboardData.grossSaleNF = this.numberWithCommas(this.dashboardData.grossSale);
        this.dashboardData.grossSale = this.numFormatter(this.dashboardData.grossSale);
        this.dashboardData.storeSaleNF = this.numberWithCommas(this.dashboardData.storeSale);
        this.dashboardData.storeSale = this.numFormatter(this.dashboardData.storeSale);
        this.dashboardData.fuelSaleNF = this.numberWithCommas(this.dashboardData.fuelSale);
        this.dashboardData.fuelSale = this.numFormatter(this.dashboardData.fuelSale);
        this.dashboardData.fuelGasVolume = this.numberWithCommas(this.dashboardData.fuelGasVolume);
        this.dashboardData.customerCount = this.numberWithCommasString(this.dashboardData.customerCount);
        this.dashboardData.cashNF = this.numberWithCommas(this.dashboardData.cash);
        this.dashboardData.cash = this.numFormatter(this.dashboardData.cash);
        this.dashboardData.networkNF = this.numberWithCommas(this.dashboardData.network);
        this.dashboardData.network = this.numFormatter(this.dashboardData.network);
        this.dashboardData.creditNF = this.numberWithCommas(this.dashboardData.credit);
        this.dashboardData.credit = this.numFormatter(this.dashboardData.credit);
        this.dashboardData.debitNF = this.numberWithCommas(this.dashboardData.debit);
        this.dashboardData.debit = this.numFormatter(this.dashboardData.debit);
        this.dashboardData.voidsNF = this.numberWithCommas(this.dashboardData.voids);
        this.dashboardData.voids = this.numFormatter(this.dashboardData.voids);
        this.dashboardData.refundsNF = this.numberWithCommas(this.dashboardData.refunds);
        this.dashboardData.refunds = this.numFormatter(this.dashboardData.refunds);
        this.barChartData = [
          { data: storeSales, label: 'Store Sales' },
          { data: fuelSales, label: 'Fuel Sales' }
        ];
      }
    }, (error) => {
      this.dashboardData = _.cloneDeep(this.dashboardDefaultData);
      this.spinner.hide();
      console.log(error);
    });

    this.lineChartData = [];
    this.lineChartLabels = [];
    this.showLineChart = false;
    this.setupService.postData('SalesPurchaseReport/StoreFuelGraph', postData).subscribe((response) => {
      this.spinner.hide();
      let storeSales = [];
      let fuelGasVolume = [];
      if (response && response.length > 0) {
        this.showLineChart = true;
        _.each(response, (data) => {
          this.lineChartLabels.push(data.businessDate);
          storeSales.push(data.storeSale);
          fuelGasVolume.push(data.fuelGasVolume);
        });
        this.lineChartData.push({ data: storeSales, label: 'Store Sales' });
        this.lineChartData.push({ data: fuelGasVolume, label: 'Gas Volume' });
      }
    }, (error) => {
      // this.dashboardData = _.cloneDeep(this.dashboardDefaultData);
      this.spinner.hide();
      console.log(error);
    });

    this.getTopSellingItems(postData);
    this.getTopSellingItemsByDept(postData);
  }

  numberWithCommas(x) {
    return new Intl.NumberFormat().format(x.toFixed(2));
  }

  numberWithCommasString(x) {
    return new Intl.NumberFormat().format(x);
  }

  numFormatter(num) {
    if (num > 999 && num < 1000000) {
      return (num / 1000).toFixed(2) + 'K'; // convert to K for number from > 1000 < 1 million 
    } else if (num > 1000000) {
      return (num / 1000000).toFixed(2) + 'M'; // convert to M for number from > 1 million 
    } else if (num < 900) {
      return num.toFixed(2); // if value < 1000, nothing to do
    }
  }

  getTopSellingItems(requestData) {
    this.topSellingItems = [];
    this.setupService.getData('MovementHeader/GetTopSellingItems?StoreLocationID=' + requestData.storeLocations + '&CompanyID=' + this.userInfo.companyId + '&Limit=10&StartDate=' + requestData.startDate + '&EndDate=' + requestData.endDate)
      .subscribe((response) => {
        this.topSellingItems = response;
      }, (error) => {
        console.log(error);
      });
  }

  getTopSellingItemsByDept(requestData) {
    this.topSellingItems = [];
    this.setupService.getData('MovementHeader/GetTopSalesByDepartment?StoreLocationID=' + requestData.storeLocations + '&CompanyID=' + this.userInfo.companyId + '&Limit=10&StartDate=' + requestData.startDate + '&EndDate=' + requestData.endDate)
      .subscribe((response) => {
        this.topSellingItemsByDept = [];
        if (response && response.length > 0) {
          this.topSellingItemsByDept = _.orderBy(response, [function (o) { return o.tAmount; }], ['desc']);
        }
      }, (error) => {
        console.log(error);
      });
  }


  getCurrentBuyDownCycle() {
    this.setupService.getData('Buydown/getCurrentBuyDownCycle?companyId=' + this.userInfo.companyId)
      .subscribe((response) => {
        this.currentBuydownCycleList = response;
        if (this.currentBuydownCycleList.length > 0) {
          this.currentBuydownCycleList[0].StartDate = moment(this.currentBuydownCycleList[0].StartDate).format('MM/DD/YYYY');
          this.currentBuydownCycleList[0].EndDate = moment(this.currentBuydownCycleList[0].EndDate).format('MM/DD/YYYY');
        }
      }, (error) => {
        console.log(error);
      });
  }


  getMRPByBrand() {
    this.setupService.getData('CompanyPriceGroup/getMRPByBrand?CompanyId=' + this.userInfo.companyId)
      .subscribe((response) => {
        this.mRPByBrandList = response.sort();
      }, (error) => {
        console.log(error);
      });
  }

  chartOfAccountByMonth() {
    let storeLocationID = (this.selectedStores && this.selectedStores.value) ? this.selectedStores.value.map(x => x.storeLocationID).join(',') : this.storeLocationList.map(x => x.storeLocationID).join(',');
    this.setupService.getData('ChartOfAccountCategories/GetChartofAccAmntByMonth?StoreLocationID=' + storeLocationID)
      .subscribe((response) => {
        var tempObj = { "CACCName": "", "januaryAmount": '0', "februaryAmount": '0', "marchAmount": '0', "aprilAmount": '0', "mayAmount": '0', "juneAmount": '0', "julyAmount": '0', "augustAmount": '0', "septemberAmount": '0', "octomberAmount": '0', "novemberAmount": '0', "decemberAmount": '0',"total":'0' };
        var monthArray = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        this.chartOfAccountByMonthList = response.sort();
        var flags = [], output = [], l = this.chartOfAccountByMonthList.length, i;
        for (i = 0; i < l; i++) {
          if (flags[this.chartOfAccountByMonthList[i].CACCName]) continue;
          flags[this.chartOfAccountByMonthList[i].CACCName] = true;
          tempObj = { "CACCName": "", "januaryAmount": '0', "februaryAmount": '0', "marchAmount": '0', "aprilAmount": '0', "mayAmount": '0', "juneAmount": '0', "julyAmount": '0', "augustAmount": '0', "septemberAmount": '0', "octomberAmount": '0', "novemberAmount": '0', "decemberAmount": '0',"total":'0' };
          tempObj.CACCName = "this.chartOfAccountByMonthList[i].CACCName";
          output.push(this.chartOfAccountByMonthList[i].CACCName);
        }
        for (let m = 0; m < output.length; m++) {
          tempObj = { "CACCName": "", "januaryAmount": '0', "februaryAmount": '0', "marchAmount": '0', "aprilAmount": '0', "mayAmount": '0', "juneAmount": '0', "julyAmount": '0', "augustAmount": '0', "septemberAmount": '0', "octomberAmount": '0', "novemberAmount": '0', "decemberAmount": '0',"total":"0" };
          for (i = 0; i < l; i++) {
            if (this.chartOfAccountByMonthList[i].CACCName == output[m]) {
              tempObj.CACCName = this.chartOfAccountByMonthList[i].CACCName;
              for (let n = 0; n < monthArray.length; n++) {
                if (this.chartOfAccountByMonthList[i].Monthname == monthArray[n]) {
                  if (this.chartOfAccountByMonthList[i].Monthname == "January") {
                    tempObj.januaryAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "February") {
                    tempObj.februaryAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "March") {
                    tempObj.marchAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "April") {
                    tempObj.aprilAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "May") {
                    tempObj.mayAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "June") {
                    tempObj.juneAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "July") {
                    tempObj.julyAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "August") {
                    tempObj.augustAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "September") {
                    tempObj.septemberAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "October") {
                    tempObj.octomberAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "November") {
                    tempObj.novemberAmount = this.chartOfAccountByMonthList[i].Amount;
                  } else if (this.chartOfAccountByMonthList[i].Monthname == "December") {
                    tempObj.decemberAmount = this.chartOfAccountByMonthList[i].Amount;
                  }
                }
              }
            }
          }
          this.chartOfAccountByMonthFinalList.push(tempObj);
        }
        var me = this;
        this.chartOfAccountByMonthFinalList.forEach(e=>{
          e.total = Number(e.januaryAmount) + Number(e.februaryAmount) + Number(e.marchAmount) + Number(e.aprilAmount) + Number(e.mayAmount) + Number(e.juneAmount) + Number(e.julyAmount) + Number(e.augustAmount) + Number(e.septemberAmount) + Number(e.octomberAmount) + Number(e.novemberAmount) + Number(e.decemberAmount); 
          e.total = me.numberWithCommas(e.total); 
          e.januaryAmount = me.numberWithCommas(Number(e.januaryAmount));
          e.februaryAmount = me.numberWithCommas(Number(e.februaryAmount));
          e.marchAmount = me.numberWithCommas(Number(e.marchAmount));
          e.aprilAmount = me.numberWithCommas(Number(e.aprilAmount));
          e.mayAmount = me.numberWithCommas(Number(e.mayAmount));
          e.juneAmount = me.numberWithCommas(Number(e.juneAmount));
          e.julyAmount = me.numberWithCommas(Number(e.julyAmount));
          e.augustAmount = me.numberWithCommas(Number(e.augustAmount));
          e.septemberAmount = me.numberWithCommas(Number(e.septemberAmount));
          e.octomberAmount = me.numberWithCommas(Number(e.octomberAmount));
          e.novemberAmount = me.numberWithCommas(Number(e.novemberAmount));
          e.decemberAmount = me.numberWithCommas(Number(e.decemberAmount));
        })
      }, (error) => {
        console.log(error);
      });
  }

  pad(input, size) {
    while (input.length < (size || 2)) {
      input = "0" + input;
    }
    return input;
  }


  getBuydownWidgetDetails(StoreLocationID) {
    this.spinner.show();
    this.setupService.getData('Buydown/getBuydownWidgetDetails?CompanyID=' + this.userInfo.companyId + '&StoreLocationID=' + StoreLocationID + '&CompanyCode=4')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownWidgetDetails4 = response;
      }, (error) => {
        console.log(error);
      });
    this.setupService.getData('Buydown/getBuydownWidgetDetails?CompanyID=' + this.userInfo.companyId + '&StoreLocationID=' + StoreLocationID + '&CompanyCode=1070')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownWidgetDetails70 = response;
      }, (error) => {
        console.log(error);
      });
    this.setupService.getData('Buydown/getBuydownWidgetDetails?CompanyID=' + this.userInfo.companyId + '&StoreLocationID=' + StoreLocationID + '&CompanyCode=1077')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownWidgetDetails77 = response;
      }, (error) => {
        console.log(error);
      });
  }

  getBuydownProgramOptionsList(StoreLocationID) {
    this.spinner.show();
    this.setupService.getData('Buydown/getProgramoptionsList?StoreLocationID=' + StoreLocationID + '&ManufacturerID=1&CompanyCode=4')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownProgramOptionsList4 = response;
      }, (error) => {
        console.log(error);
      });
    this.setupService.getData('Buydown/getProgramoptionsList?StoreLocationID=' + StoreLocationID + '&ManufacturerID=1&CompanyCode=1070')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownProgramOptionsList70 = response;
      }, (error) => {
        console.log(error);
      });
    this.setupService.getData('Buydown/getProgramoptionsList?StoreLocationID=' + StoreLocationID + '&ManufacturerID=1&CompanyCode=1077')
      .subscribe((response) => {
        this.spinner.hide();
        this.buydownProgramOptionsList77 = response;
      }, (error) => {
        console.log(error);
      });
  }

  selectBuydownStore() {
    if (this.buyDownStoreLocationId) {
      this.getBuydownWidgetDetails(this.buyDownStoreLocationId.storeLocationID);
      this.getBuydownProgramOptionsList(this.buyDownStoreLocationId.storeLocationID);
    } else {
      this.buydownWidgetDetails4 = [];
      this.buydownWidgetDetails70 = [];
      this.buydownWidgetDetails77 = [];
      this.buydownProgramOptionsList4 = [];
      this.buydownProgramOptionsList70 = [];
      this.buydownProgramOptionsList77 = [];
    }
  }
}