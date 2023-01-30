import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import * as moment from 'moment';
import { StoreMessageService } from '@shared/services/commmon/store-message.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChartOptions, ChartDataSets, Chart } from 'chart.js';
import { Color, BaseChartDirective } from 'ng2-charts';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridApi } from 'ag-grid-community';
import * as _ from 'lodash';
import { routerTransition } from 'src/app/router.animations';
import { StoreService } from '@shared/services/store/store.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit, OnDestroy {

    topSellingItems = [];
    topSellingItemsByDept = [];
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
    scanPercentOptions: ChartOptions = {
        title: {
            text: 'scanPercent',
            count: 0,
            display: false
        },
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                fontSize: 10,
                usePointStyle: true
            }
        },
        cutoutPercentage: 60,
        centerText: true
    };
    deptOptions: ChartOptions = {
        title: {
            text: 'department',
            count: 0,
            display: false
        },
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                fontSize: 10,
                usePointStyle: true
            }
        },
        cutoutPercentage: 60,
        centerText: true
    };
    fuelChartOptions: ChartOptions = {
        title: {
            text: 'fuel',
            count: 0,
            display: false
        },
        legend: {
            display: false,
            position: 'bottom',
            labels: {
                fontSize: 10,
                usePointStyle: true
            }
        },
        cutoutPercentage: 60,
        centerText: true
    };
    fromTime: any;
    toTime: any;
    public pieChartType = 'doughnut';
    private doughnutColors = [
        {
            backgroundColor: [
                '#F39C12', // 'rgba(110, 114, 20, 1)',
                '#3498DB', //'rgba(118, 183, 172, 1)',
                '#34495E',//'rgba(0, 148, 97, 1)',
                '#17A589',// 'rgba(129, 78, 40, 1)',
                '#C0392B',//'rgba(129, 199, 111, 1)'
                '#F5B041',
                '#82E0AA'
            ]
        }
    ];
    private scanPercentColors = [
        {
            backgroundColor: [
                '#239B56',
                '#C0392B'
            ]
        }
    ];
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
    scanPercentageChartLabels: string[] = ['Scan Count', 'Non Scan Count'];


    // Data for Scan Percentage widget
    scanPercentage: any = {};

    // Data for Fuel Delivery widget
    fuelDelivery = 0;

    // Data for Purchase widget
    purchase: any = { TotalItemCost: 0.0, TotalItemPurchase: 0.0 };
    gridApi: GridApi;
    currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY');
    subscription: any;
    isShowdepartmentType: any;
    storeLocationList: any;
    isStoreLoading = true;
    selectedCompanyId: any;
    showLottery: boolean | false;

    // promotionsRowData: any = [];
    // promotionsGridOptions: any;
    // bankDepositGridAPI: any;
    totalDiscount: any = 0.00;
    totalSalesAmount: any = 0.00;
    totalSalesQty: any = 0.00;
    transcationCount: any = 0;
    scanPercentageChartData: number[] = [];



    constructor(
        private constantService: ConstantService,
        private setupService: SetupService,
        private gridService: GridService,
        private spinner: NgxSpinnerService,
        private storeService: StoreService,
        public router: Router,
        private storeMessageService: StoreMessageService, private constantsService: ConstantService) {
        this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.dashboardGrid);
        this.subscription = this.storeMessageService.getMessage().subscribe(userInf => {
            const id = userInf && userInf.text;
            this.currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY'); // '07-11-2018';
            this.storeLocationId = this.constantService.getStoreLocationId();
        });
        let fromDate = new Date();
        fromDate.setHours(fromDate.getHours() - 12);
        this.fromTime = fromDate.valueOf();
        this.toTime = new Date().valueOf();
        // this.promotionsGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.dayReconPromotionsDetailGrid);
    }

    ngAfterViewInit() {
        Chart.plugins.register({
            afterDatasetsDraw: function (chart) {
                if (!chart.options.centerText) return;
                var ctx = chart.ctx,
                    width = chart.canvas.width,
                    height = chart.canvas.height;
                var fontSize = (height / 250).toFixed(2);
                ctx.font = fontSize + "em Verdana";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                var text = '$' + (chart.options.title.count).toFixed(2),
                    textX = Math.round((width - 25 - ctx.measureText(text).width) / 3),
                    textY = height / 3;
                if (chart.options.title.text == "scanPercent") {
                    text = (chart.options.title.count);
                    textX = Math.round((width - ctx.measureText(text).width) / 3);
                }
                ctx.fillText(text, textX, textY);
                ctx.restore();
            }
        });
    }
    ngOnInit() {
        this.currentDate = moment().subtract(1, 'days').format('MM-DD-YYYY'); // '07-11-2018';
        this.selectedCompanyId = this.constantService.getUserInfo().companyId;
        this.storeLocationId = this.constantService.getStoreLocationId();
        this.getStoreLocationList();
        // this.getPromotionsList();
    }

    storeLocationChange(params) {
        if (params) {
            let selectedstore = this.storeLocationList.filter((store) => { return store.storeLocationID == params })[0]
            this.showLottery = selectedstore.isLotteryStartingFromZero;
            sessionStorage.setItem('selectedStoreLocationId', params);
            this.storeMessageService.changeStoreLocationId(params);
            setTimeout(() => {
                this.getAllWidgetsDetails();
                /*  const href = this.router.url;
                 if (href !== '/dashboard') {
                     this.router.navigate(['dashboard']);
                 } */
            }, 500);
        }
    }
    pad(input, size) {
        while (input.length < (size || 2)) {
            input = "0" + input;
        }
        return input;
    }
    getStoreLocationList() {
        this.isStoreLoading = true;
        let id = this.constantService.getStoreLocationId();
        if (this.storeService.storeLocation) {
            this.isStoreLoading = false;
            this.storeLocationList = this.storeService.storeLocation;
            this.storeLocationList.map((store) => {
                let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
                store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
                return store;
            });
            if (this.storeLocationList && this.storeLocationList.length > 0) {
                if (id) {
                    this.storeLocationId = id;
                    this.storeLocationChange(this.storeLocationId);
                } else {
                    this.storeLocationId = this.storeLocationList[0].storeLocationID;
                    this.storeLocationChange(this.storeLocationId);
                }
            }
        } else {
            this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
                this.isStoreLoading = false;
                this.storeLocationList = this.storeService.storeLocation;
                this.storeLocationList.map((store) => {
                    let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
                    store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
                    return store;
                });
                if (this.storeLocationList && this.storeLocationList.length > 0) {
                    if (id) {
                        this.storeLocationId = id;
                        this.storeLocationChange(this.storeLocationId);
                    } else {
                        this.storeLocationId = this.storeLocationList[0].storeLocationID;
                        this.storeLocationChange(this.storeLocationId);
                    }
                }
            }, (error) => {
                console.log(error);
            });
        }
    }

    /** Get all widget details */
    public getAllWidgetsDetails = (): void => {
        //   this.getTopTrendingItems();
        this.getTopSellingItems();
        this.getWidgetsDataForFuelandLottery('');
        this.getCriticalStatByBusinessDate('');
        this.getFuelSalesByBusinessDate('');
        this.getWidgetDepartmentTypeSales('');
        this.getWidgetScanPercentage('');
        this.getWidgetFuelDelivery('');
        // this.getWidgetPurchase('');
        this.getPJRHourlyItemSales();
        this.getPJRHourlyFuelSales();
        this.getPromotionsList();
        this.getTopSellingItemsByDept();
    }

    getTopTrendingItems() {
        const currentDates = moment().subtract(1, 'days').format('YYYY-MM-DD');
        this.topTrendingItems = [];
        if (this.storeLocationId) {
            this.spinner.show();
            let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
            let startDate = moment().format('MM-DD-YYYY') + "T00:00:00" + timeZone;
            let endDate = moment().format('MM-DD-YYYY') + "T23:59:59" + timeZone;
            // tslint:disable-next-line:max-line-length
            this.setupService.getDataElastic(`elastic/getTopSellingItems?dateFrom=${startDate}&dateTo=${endDate}&storeLocationID=${this.storeLocationId}&companyID=${this.userInfo.companyId}`).subscribe(
                // this.setupService.getData(`Pjr/GetTopSellingItems/company/${this.userInfo.companyId}/store/${this.storeLocationId}/date/${currentDates}`).subscribe(
                (res) => {
                    this.spinner.hide();
                    let buckets = res.aggregations.StoreLocationID.buckets.length > 0 ? res.aggregations.StoreLocationID.buckets[0].ReportPosCode.buckets : [];
                    _.each(buckets, (bucket) => {
                        this.topTrendingItems.push({
                            upcCode: bucket.key,
                            count: bucket.SalesQuantity.value,
                            description: bucket.Description.buckets[0].key
                        });
                    });
                    // if (res && res.aggregations && res.aggregations.ReportPosCode && res.aggregations.ReportPosCode.buckets.length > 0) {
                    //     res.aggregations.ReportPosCode.buckets.map((i) => {
                    //         if (i && i.Description && i.Description.buckets.length > 0) {
                    //             this.topSellingItemsArr.push({
                    //                 upcCode: i.key, count: i.doc_count,
                    //                 description: i.Description.buckets[0].key
                    //             });
                    //         } else {
                    //             this.topSellingItemsArr.push({ upcCode: i.key, count: i.doc_count, description: '' });
                    //         }
                    //     });
                    // }
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
        console.log('delete widget', p);
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
            // tslint:disable-next-line:max-line-length
            this.setupService.getData(`MovementHeader/GetFuelSalesByBusinessDate/${this.currentDate}/${this.storeLocationId}/0`)
                .subscribe((res) => {
                    this.spinner.hide();
                    const datas = [];
                    const labels = [];
                    this.fuelSales = [];
                    this.fuelSalesPieChartLabels = [];
                    let count = 0;
                    if (res && res.length > 0) {
                        res.forEach(fuel => {
                            count += fuel.fuelGradeSalesAmount;
                            datas.push(fuel.fuelGradeSalesAmount);
                            labels.push(fuel.gasGradeName);
                        });
                        this.fuelChartOptions.title.count = count;
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

            this.setupService.getData(`MovementHeader/GetWidgetDepartmentTypeSales/${this.storeLocationId}/${this.userInfo.companyId}/${this.currentDate}`)
                .subscribe((res) => {
                    this.isShowdepartmentType = true;
                    this.spinner.hide();
                    const labels = [];
                    const data = [];
                    this.departmentTypeSales = [];
                    this.departmentTypeSalesPieChartLabels = [];
                    if (res && res.length > 0) {

                        let count = 0;
                        res.forEach(department => {
                            data.push(department.TotalAmount);
                            count += department.TotalAmount;
                            labels.push(department.DepartmentTypeName);
                        });
                        this.deptOptions.title.count = count;
                        if (res && res.length === 1 && res[0].TotalAmount === 0 && res[0].DepartmentTypeName === 'Discounts & Promotions') {
                            this.isShowdepartmentType = false;
                        }
                        setTimeout(() => {
                            this.departmentTypeSalesPieChartLabels = labels;
                            this.departmentTypeSales = data;
                        });
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
        const startAndEndDate = this.currentDate;
        if (this.storeLocationId) {
            this.spinner.show();
            this.scanPercentageChartData = [];
            this.setupService.getData(`MovementHeader/GetWidgetScanPercentage/${this.storeLocationId}/${startAndEndDate}/${startAndEndDate}/${this.userInfo.companyId}`)
                .subscribe((res) => {
                    this.spinner.hide();
                    this.scanPercentage = res ? res[0] : {};
                    if (this.scanPercentage.UPCSalesQty) this.scanPercentageChartData.push(this.scanPercentage.UPCSalesQty);
                    if (this.scanPercentage.OpenCount) this.scanPercentageChartData.push(this.scanPercentage.OpenCount);
                    this.scanPercentOptions.title.count = this.scanPercentage.RecentSales;
                },
                    (err) => {
                        this.spinner.hide();
                        console.log(err);
                    });
        }
    }

    /**Get the details for Fuel Delivery widget (Normal Type)  */
    getWidgetFuelDelivery = (p) => {
        if (this.storeLocationId) {
            this.spinner.show();
            this.setupService.getData(`MovementHeader/GetWidgetFuelDelivery/${this.currentDate}/${this.currentDate}/${this.storeLocationId}/${this.userInfo.companyId}`)
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
            this.setupService.getData(`MovementHeader/GetWidgetPurchase/${this.currentDate}/${this.storeLocationId}/${this.userInfo.companyId}`)
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

    //PJRHourlySales 

    @ViewChild(BaseChartDirective, {}) chart: BaseChartDirective;
    public lineChartLegend = true;
    public lineChartType = 'line';
    public lineChartOptions: (ChartOptions & { annotation: any }) = {
        responsive: true,
        scales: {
            // We use this empty structure as a placeholder for dynamic theming.
            xAxes: [{}],
            yAxes: [{}]
        }
    };

    //item sales data
    lineChartItemLabels: any[] = [];
    lineChartItemData: ChartDataSets[] = [{ data: [], label: 'Items' }];
    lineChartItemColors: Color[] = [
        { // orange
            backgroundColor: '#f3a563',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
    getPJRHourlyItemSales() {
        this.spinner.show();
        this.setupService.getData(`Pjr/GetPJRHourlySales?dateFrom=` + this.fromTime + `&dateTo=` + this.toTime + `&storeLocationIDs=` + this.storeLocationId + `&interval=1h&isFuelNotItem=false`)
            .subscribe((res) => {
                this.spinner.hide();
                let itemSalesData = res.aggregations.horly_aggregate.buckets;
                let itemSalesTimes = [];
                let itemSalesAmount = [];
                _.each(itemSalesData, function (data) {
                    let salesTime = new Date(data.key)
                    itemSalesTimes.push(salesTime.getHours().toString() + ":" + salesTime.getMinutes().toString());
                    itemSalesAmount.push(data.sales_quantity.value.toString());
                });
                setTimeout(() => {
                    if (this.lineChartItemLabels.length === 0) {
                        this.lineChartItemLabels = [];
                        this.lineChartItemLabels = itemSalesTimes;
                    }
                    this.lineChartItemData = [{ data: itemSalesAmount, label: 'Items' }];
                });
            },
                (err) => {
                    this.spinner.hide();
                    console.log(err);
                });
    }

    //fuel sales data
    lineChartFuelLabels: any[] = [];
    lineChartFuelData: ChartDataSets[] = [{ data: [], label: 'Gallons' }];
    lineChartFuelColors: Color[] = [
        { // green
            backgroundColor: '#8fd0ac',
            borderColor: 'rgba(148,159,177,1)',
            pointBackgroundColor: 'rgba(148,159,177,1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(148,159,177,0.8)'
        }
    ];
    getPJRHourlyFuelSales() {
        this.spinner.show();
        this.setupService.getData(`Pjr/GetPJRHourlySales?dateFrom=` + this.fromTime + `&dateTo=` + this.toTime + `&storeLocationIDs=` + this.storeLocationId + `&interval=1h&isFuelNotItem=true`)
            .subscribe((res) => {
                this.spinner.hide();
                let itemSalesData = res.aggregations.horly_aggregate.buckets;
                let itemSalesTimes = [];
                let itemSalesAmount = [];
                _.each(itemSalesData, function (data) {
                    let salesTime = new Date(data.key)
                    itemSalesTimes.push(salesTime.getHours().toString() + ":" + salesTime.getMinutes().toString());
                    itemSalesAmount.push(data.sales_quantity.value.toString());
                });
                setTimeout(() => {
                    if (this.lineChartFuelLabels.length === 0) {
                        this.lineChartFuelLabels = [];
                        this.lineChartFuelLabels = itemSalesTimes;
                    }
                    this.lineChartFuelData = [{ data: itemSalesAmount, label: 'Gallons' }];
                });
            },
                (err) => {
                    this.spinner.hide();
                    console.log(err);
                });
    }

    getPromotionsList() {
        this.setupService.getData('PromotionReport/PromotionsReportBySearchFilter?StorelocationId=' + this.storeLocationId + '&fromdate=' + this.currentDate + '&todate=' + this.currentDate)
            .subscribe((response) => {
                if (response.status === 1) {
                    this.totalDiscount = response.data.totalDiscount;
                    this.totalSalesAmount = response.data.totalSalesAmount;
                    this.totalSalesQty = response.data.totalSalesQty;
                    this.transcationCount = response.data.transcationCount;
                    // this.promotionsRowData = response.data.details;
                    // this.bankDepositGridAPI.sizeColumnsToFit();
                }
            }, (error) => {
                console.log(error);
            });
    }
    // onPromotionsGridReady(params) {
    //     this.bankDepositGridAPI = params.api;
    //     this.bankDepositGridAPI.gridOptionsWrapper.gridOptions.groupRowInnerRenderer = function (params) { return params.node.allLeafChildren[0].data.departmentDescription; };
    //     // this.bankDepositGridAPI.gridOptionsWrapper.gridOptions.groupDefaultExpanded=-1;
    //     params.api.sizeColumnsToFit();
    // }

    getTopSellingItems() {
        this.topSellingItems = [];
        this.setupService.getData('MovementHeader/GetTopSellingItems?StoreLocationID=' + this.storeLocationId + '&CompanyID=' + this.userInfo.companyId + '&Limit=10&StartDate=' + this.currentDate + '&EndDate=' + this.currentDate)
            .subscribe((response) => {
                this.topSellingItems = response;
            }, (error) => {
                console.log(error);
            });
    }

    getTopSellingItemsByDept() {
        this.topSellingItems = [];
        this.setupService.getData('MovementHeader/GetTopSalesByDepartment?StoreLocationID=' + this.storeLocationId + '&CompanyID=' + this.userInfo.companyId + '&Limit=10&StartDate=' + this.currentDate + '&EndDate=' + this.currentDate)
            .subscribe((response) => {
                this.topSellingItemsByDept = [];
                if (response && response.length > 0) {
                    this.topSellingItemsByDept = _.sortBy(response, function (o) { return o.tAmount; });
                }
            }, (error) => {
                console.log(error);
            });
    }

}

