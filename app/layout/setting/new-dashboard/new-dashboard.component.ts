import { Component, OnInit, OnDestroy } from '@angular/core';
import * as moment from 'moment';
import { StoreMessageService } from '@shared/services/commmon/store-message.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions } from 'chart.js';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridApi } from 'ag-grid-community';

@Component({
  selector: 'app-new-dashboard',
  templateUrl: './new-dashboard.component.html',
  styleUrls: ['./new-dashboard.component.scss']
})

export class NewDashboardComponent implements OnInit, OnDestroy {
  topSellingItemsArr = [];
  gridOptions: any;
  topTrendingItems = [];
  filterText: string;
  userInfo = this.constantService.getUserInfo();
  storeLocationId: any;
  pieChartOptions: ChartOptions = {
    legend: {
      display: true,
      position: 'right',
    }
  };

  public pieChartData: number[] = [500, 400, 500, 100, 150];
  public pieChartType = 'doughnut';

  public count = 0;

  // Data for fuel and lottery widget
  fuelandLottery: any = {};

  // Data for Critical Stats widget
  criticalStats: any = [];

  // Data for Fuel Sales widget
  fuelSales: number[] = [];
  // fuel sales pie chart labels
  fuelSalesPieChartLabels: string[] = [];

  // Data for Department Type Sales widget
  departmentTypeSales: number[] = [];
  // department type sales pie chart labels
  departmentTypeSalesPieChartLabels: string[] = [];

  // Data for Scan Percentage widget
  scanPercentage: any = {};

  // Data for Fuel Delivery widget
  fuelDelivery = 0;

  // Data for Purchase widget
  purchase: any = { TotalItemCost: 0.0, TotalItemPurchase: 0.0 };
  gridApi: GridApi;
  currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY');
  subscription: any;

  constructor(
    private constantService: ConstantService,
    private setupService: SetupService,
    private gridService: GridService,
    private spinner: NgxSpinnerService,
    private storeMessageService: StoreMessageService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.dashboardGrid);
    this.subscription = this.storeMessageService.getMessage().subscribe(userInf => {
      const id = userInf && userInf.text;
      this.currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY'); // '07-11-2018';
      this.storeLocationId = this.constantService.getStoreLocationId();
      this.getAllWidgetsDetails();
    });
  }

  ngOnInit() {
    this.currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY'); // '07-11-2018';
    this.storeLocationId = this.constantService.getStoreLocationId();
    this.getAllWidgetsDetails();
  }
  /** Get all widget details */
  public getAllWidgetsDetails = (): void => {
    this.GetTopSellingItems();
    this.getWidgetsDataForFuelandLottery('');
    this.getCriticalStatByBusinessDate('');
    this.getFuelSalesByBusinessDate('');
    this.getWidgetDepartmentTypeSales('');
    this.getWidgetScanPercentage('');
    this.getWidgetFuelDelivery('');
    this.getWidgetPurchase('');
  }

  GetTopSellingItems() {
    const currentDates = moment().subtract(1, 'days').format('YYYY-MM-DD');
    this.topSellingItemsArr = [];
    if (this.storeLocationId) {
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`Pjr/GetTopSellingItems/company/${this.userInfo.companyId}/store/${this.storeLocationId}/date/${currentDates}`).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res.aggregations && res.aggregations.ReportPosCode && res.aggregations.ReportPosCode.buckets.length > 0) {
            res.aggregations.ReportPosCode.buckets.map((i) => {
              if (i && i.Description && i.Description.buckets.length > 0) {
                this.topSellingItemsArr.push({ upcCode: i.key, count: i.doc_count, description: i.Description.buckets[0].key });
              } else {
                this.topSellingItemsArr.push({ upcCode: i.key, count: i.doc_count, description: '' });
              }
            });
          }
          this.topTrendingItems = this.topSellingItemsArr;
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        });
    }
  }
  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  // Refresh all widgets
  public onRefreshWidgets = (event: MouseEvent): void => {
    this.getAllWidgetsDetails();
  }

  // Refresh single widget whichever requested
  public onRefreshWidget = (event: MouseEvent): void => {
    console.log('refresh widget', event);
  }

  // redirect to the widget details screen if available
  public onWidgetdetails = (p): void => {
    console.log('delete widget', event);
  }

  /**Get the details for Lottery widget (Normal Type) */
  getWidgetsDataForFuelandLottery = (p) => {

    if (this.storeLocationId) {
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`LotteryWidgets/GetWidgetsDataForFuelandLottery/${this.currentDate}/${this.storeLocationId}/${this.userInfo.companyId}`)
        .subscribe((res) => {
          this.spinner.hide();
          this.fuelandLottery = res && res[0] ? res[0] : {};
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Critical Stats widget (Grid Type) */
  getCriticalStatByBusinessDate = (p) => {

    if (this.storeLocationId) {
      this.spinner.show();
      // Last parameter is Shiftwisevalue & it will be always 0 (Zero)
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`MovementHeader/GetCriticalStatByBusinessDate/${this.currentDate}/${this.storeLocationId}/0`)
        .subscribe((res) => {
          this.spinner.hide();
          this.criticalStats = res ? res : [];
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Fuel Sales widget (Pie Chart Type)  */
  getFuelSalesByBusinessDate = (p) => {
    if (this.storeLocationId) {
      this.spinner.show();
      // TODO: Remove hardcode values
      // tslint:disable-next-line:max-line-length
      this.setupService.getData(`MovementHeader/GetFuelSalesByBusinessDate/${this.currentDate}/${this.storeLocationId}/0`)
        .subscribe((res) => {
          this.spinner.hide();
          const datas = [];
          const labels = [];
          this.fuelSales = [];
          this.fuelSalesPieChartLabels = [];

          if (res && res.length > 0) {
            res.forEach(fuel => {
              datas.push(fuel.fuelGradeSalesAmount);
              labels.push(fuel.gasGradeName);
            });
            this.fuelSales = datas;
            setTimeout(() => this.fuelSalesPieChartLabels = labels);
          }
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Department Type Sales widget (Pie Chart Type) */
  getWidgetDepartmentTypeSales = (p) => {
    if (this.storeLocationId) {
      this.spinner.show();
      // TODO: Remove hardcode values
      this.setupService.getData(`MovementHeader/GetWidgetDepartmentTypeSales/
      ${this.storeLocationId}/${this.userInfo.companyId}/${this.currentDate}`)
        .subscribe((res) => {
          this.spinner.hide();
          const labels = [];
          const data = [];
          this.departmentTypeSales = [];
          this.departmentTypeSalesPieChartLabels = [];

          if (res && res.length > 0) {
            res.forEach(department => {
              data.push(department.TotalAmount);
              labels.push(department.DepartmentTypeName);
            });

            setTimeout(() => this.departmentTypeSalesPieChartLabels = labels);
            setTimeout(() => this.departmentTypeSales = data);
          }
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Scan Percentage widget (Normal Type) */
  getWidgetScanPercentage = (p) => {
    const currentDate = new Date();
    // Get previous day by subtracting 1 day
    currentDate.setDate(currentDate.getDate() - 1);
    const startAndEndDate = this.currentDate;
    if (this.storeLocationId) {
      this.spinner.show();
      // TODO: Check hardcode values for EndBusinessDate & StartBusinessDate 
      this.setupService.getData(`MovementHeader/GetWidgetScanPercentage/
      ${this.storeLocationId}/${startAndEndDate}/${startAndEndDate}/${this.userInfo.companyId}`)
        .subscribe((res) => {
          this.spinner.hide();
          this.scanPercentage = res ? res[0] : {};
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Fuel Delivery widget (Normal Type)  */
  getWidgetFuelDelivery = (p) => {
    const currentDate = new Date();
    // Get previous day by subtracting 1 day
    currentDate.setDate(currentDate.getDate() - 1);
    const startAndEndDate = this.currentDate; // moment(currentDate).format('YYYY-MM-DD');

    if (this.storeLocationId) {
      this.spinner.show();
      // TODO: Check hardcode values for EndBusinessDate & StartBusinessDate
      this.setupService.getData(`MovementHeader/GetWidgetFuelDelivery/
      ${this.currentDate}/${this.currentDate}/${this.storeLocationId}/${this.userInfo.companyId}`)
        .subscribe((res) => {
          this.spinner.hide();
          const fuelDeliveryObject = res && res[0] ? res[0] : {};
          const jsonString = JSON.stringify(fuelDeliveryObject);
          const fuelDeliveryObjectParts = jsonString.split(':');
          const currency = fuelDeliveryObjectParts[fuelDeliveryObjectParts.length - 1].split('}')[0];
          this.fuelDelivery = currency ? Number(currency) : 0;
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  /**Get the details for Purchases widget (Normal Type) */
  getWidgetPurchase = (p) => {
    if (this.storeLocationId) {
      this.spinner.show();
      // TODO: Check hardcode values for EndBusinessDate & StartBusinessDate
      this.setupService.getData(`MovementHeader/GetWidgetPurchase/
      ${this.currentDate}/${this.storeLocationId}/${this.userInfo.companyId}`)
        .subscribe((res) => {
          this.spinner.hide();
          if (res && res[0]) {
            this.purchase = res[0];
          }
        },
          (err) => {
            this.spinner.hide();
            console.log(err);
          });
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
