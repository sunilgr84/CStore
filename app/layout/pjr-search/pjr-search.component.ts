import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import { ConstantService } from '@shared/services/constant/constant.service';
import { StoreService } from '@shared/services/store/store.service';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgSelectComponent } from '@ng-select/ng-select';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { forkJoin } from 'rxjs';
import { MessageService } from '@shared/services/commmon/message-Service';

@Component({
  selector: 'app-pjr-search',
  templateUrl: './pjr-search.component.html',
  styleUrls: ['./pjr-search.component.scss']
})
export class PjrSearchComponent implements OnInit {
  inputEndDate = moment().format('MM-DD-YYYY');
  inputDate = moment().format('MM-DD-YYYY');
  inputEndTime = new Date().setHours(0, 0, 0, 0);
  inputTime = new Date().setHours(0, 0, 0, 0);
  selectedDateRange: any;
  selectedDateTimeRange: any;
  openPopover: any;
  gridOptions: any;
  gridApi: any;
  rowData = [];
  storeLocationList: any = [];
  userInfo: any;
  isLoading = true;
  isSearch = false;
  showCalendarDate = true;
  showBusinessDate = false;
  businessDatesList: any = [];
  storeLocationId: any = '';
  totalDocumentCount: any = -1;
  pjrSearchForm = this.fb.group({
    storeLocationId: '',
    startDate: this.inputDate,
    endDate: this.inputEndDate,
    freeText: '',
    toTime: [],
    fromTime: [],
    isSearchByTime: false,
    departmentName: '',
    cashierId: [''],
    voidCashierIDs: [],
    transactionStatus: '',
    eventType: '',
    hasItemSale: '',
    hasDepSale: '',
    hasFuelSale: '',
    noOfRecords: '',
    dateType: false,
    businessDate: '',
    from: '',
  });
  totalNetAmount: any;
  selectedRowData: any;
  salesTableDescData = [];
  transactionTaxDetailList = [];
  tenderInfoData = [];
  itemLineData = [];
  fuelLineData = [];
  lineChartItemLabels: any = [];
  lineChartItemLabelsWithDates: any = [];
  lineChartItemData: any = [];
  isSalesDetail = false;
  aggrPanelList: any;
  departmentList = [];
  cashiersList: any;
  transactionStatusList: any;
  saleWithList = [];
  eventTypeList: any;
  voidTransactionsList: any;
  isRowData: boolean = false;
  isPanelData: boolean;
  switchControl: any;
  @ViewChild('BusinessDates') bDatesNGSelect: NgSelectComponent;
  @Output() openDateTimePicker = new EventEmitter();
  salesTotals: any;
  showSalesTotals: any = false;
  insideSales: boolean = false;
  fuelSales: boolean = false;
  promotionalSalesFlag: boolean = false;
  showNoRowsMessage: any = false;
  showPromotionalSalesTotals: boolean = false;
  promotionalSales: any;
  promotionalSalesQty: any;

  isEventCollapsed: boolean = false;
  isDeptCollapsed: boolean = false;
  isCashierCollapsed: boolean = false;
  isVoidCollapsed: boolean = false;
  isTStatusCollapsed: boolean = false;
  isSaleWithCollapsed: boolean = false;

  constructor(private gridService: PaginationGridService, private constants: ConstantService, private setupService: SetupService,
    private storeService: StoreService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService,
    private messageService: MessageService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.pjrSearchGrid);
    this.userInfo = this.constants.getUserInfo();
  }

  ngOnInit() {
    setTimeout(() => {
      this.messageService.sendMessage('expanded_collaps');
    });
    let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
    this.inputDate = moment().format('MM-DD-YYYY') + "T00:00:00" + timeZone;
    this.inputEndDate = moment().format('MM-DD-YYYY') + "T23:59:59" + timeZone;
    this.getStoreLocation();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    var datasource = this.ServerSideDatasource();
    this.gridApi.setServerSideDatasource(datasource);
  }

  bindStoreList(response) {
    this.storeLocationList = response;
    if (response && response.length > 0) {
      this.pjrSearchForm.get('storeLocationId').setValue(response[0].storeLocationID);
      // setTimeout(() => {
      this.pjrSearchForm.patchValue({
        dateType: true
      });
      // });
      this.showBusinessDate = true;
      this.showCalendarDate = false;
      this.fetchBusinessDates();
    }
  }
  getStoreLocation() {
    if (this.storeService.storeLocation) {
      this.bindStoreList(this.storeService.storeLocation);
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.bindStoreList(this.storeService.storeLocation);
      }, (error) => {
        console.log(error);
      });
    }
  }
  get pjrSearchValue() { return this.pjrSearchForm.value; }

  getPJRPanelAggs() {
    let postData = this.postData();
    this.spinner.show();
    this.departmentList = this.cashiersList = this.transactionStatusList = this.saleWithList = [];
    this.eventTypeList = this.voidTransactionsList = [];
    this.isPanelData = false;
    this.setupService.getDataElastic('elastic/getAggregations?dateFrom=' + postData.dateFrom + '&dateTo=' + postData.dateTo +
      '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID + '&fuelSales=' + postData.fuelSales +
      '&promotionalSales=' + postData.promotionalSales + '&insideSales=' + postData.insideSales +
      (postData.freeText.length > 0 ? '&query=' + postData.freeText : ''))
      .subscribe((response) => {
        // if (!this.isSearch)
        //   this.spinner.hide();
        // this.isSearch = false;
        if (response && response.aggregations) {
          if (response.aggregations.departmentName) {
            this.departmentList = response.aggregations.departmentName.buckets;
            this.departmentList.map((i) => i.isChecked = false);
          }
          if (response.aggregations.cashierId) {
            this.cashiersList = response.aggregations.cashierId.buckets;
            this.cashiersList.map((i) => { i.keys = 'Cashier-' + i.key; i.isChecked = false; });
          }
          if (response.aggregations.eventType) {
            this.eventTypeList = response.aggregations.eventType.buckets;
            this.eventTypeList.map((i) => i.isChecked = false);
          }
          if (response.aggregations.transactionStatus) {
            this.transactionStatusList = response.aggregations.transactionStatus.buckets;
            this.transactionStatusList.map((i) => i.isChecked = false);
          }
          if (response.aggregations.VoidCashiers) {
            this.voidTransactionsList = response.aggregations.VoidCashiers.buckets;
            this.voidTransactionsList.map((i) => { i.keys = 'Cashier-' + i.key; i.isChecked = false; });
          }

          if (this.departmentList.length > 0 || this.cashiersList.length > 0 || this.eventTypeList.length > 0 || this.transactionStatusList.length > 0 || this.voidTransactionsList.length > 0) {
            this.isPanelData = true;
          }
          // response.aggregations.ItemSale.buckets.map((i) => {
          //   i.keys = 'Item-' + i.key, i.name = 'item'; i.isChecked = false;
          //   this.saleWithList.push(i);
          // });
          // response.aggregations.DepSale.buckets.map((i) => {
          //   i.keys = 'Departmnet-' + i.key, i.name = 'departmnet'; i.isChecked = false;
          //   this.saleWithList.push(i);
          // });
          // response.aggregations.FuelSale.buckets.map((i) => {
          //   i.keys = 'Fuel-' + i.key, i.name = 'fuel'; i.isChecked = false;
          //   this.saleWithList.push(i);
          // });
          // this.spinner.hide();
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  getDocumentTrends() {
    let postData = this.postData();
    this.setupService.getDataElastic('elastic/getDocumentsTrend?dateFrom='
      + postData.dateFrom + '&dateTo=' + postData.dateTo
      + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
      (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
      (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
      (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
      (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
      (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
      (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
      (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
      (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
      (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : ''))
      .subscribe((response) => {
        let trendData: [] = response.aggregations[2].buckets;
        let docCounts = [];
        let docDateRanges = [];
        let docDateRangesWithDates = [];
        _.each(trendData, (trend: any) => {
          docCounts.push(trend.doc_count);
          docDateRanges.push(this.formatDate(trend.key_as_string));
          docDateRangesWithDates.push(trend.key_as_string);
        });
        this.lineChartItemLabels = docDateRanges;
        this.lineChartItemLabelsWithDates = docDateRangesWithDates;
        this.lineChartItemData = [{ data: docCounts, label: 'Date Range' }]
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  postData() {
    const postData = {
      dateFrom: this.inputDate,
      dateTo: this.inputEndDate,
      companyID: this.userInfo.companyId,
      storeLocationID: this.pjrSearchValue.storeLocationId,
      departmentName: this.pjrSearchValue.departmentName.toString(),
      cashierId: this.pjrSearchValue.cashierId.toString(),
      voidCashierIDs: this.pjrSearchValue.voidCashierIDs,
      transactionStatus: this.pjrSearchValue.transactionStatus,
      eventType: this.pjrSearchValue.eventType,
      freeText: this.pjrSearchValue.freeText,
      hasItemSale: this.pjrSearchValue.hasItemSale,
      hasDepSale: this.pjrSearchValue.hasDepSale,
      hasFuelSale: this.pjrSearchValue.hasFuelSale,
      noOfRecords: this.pjrSearchValue.noOfRecords,
      fuelSales: this.fuelSales,
      insideSales: this.insideSales,
      promotionalSales: this.promotionalSalesFlag,
      from: '0'
    };
    return postData;
  }

  search() {
    this.fuelSales = false;
    this.insideSales = false;
    this.promotionalSalesFlag = false;
    if (this.pjrSearchForm.get('storeLocationId').value === '') {
      this.toastr.error('Please Select Store');
      return;
    }
    if (this.showBusinessDate) {
      let selectedBusiDate = this.pjrSearchForm.get('businessDate').value;
      if (selectedBusiDate != "") {
        let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
        let stDateNTime = selectedBusiDate.split('-').slice(0, 3);
        let stYearNTime = stDateNTime[2].split(' ');
        stDateNTime[2] = stYearNTime[0];
        this.inputDate = moment(stDateNTime.join('-').trim()).format('MM-DD-YYYY');
        let stTime = "T" + stYearNTime[1].trim() + ":00" + timeZone;
        this.inputDate = this.inputDate + stTime;
        let endDateNTime = selectedBusiDate.split('-').slice(3, 6);
        let endYearNTime = endDateNTime[2].split(' ');
        endDateNTime[2] = endYearNTime[0];
        this.inputEndDate = moment(endDateNTime.join('-').trim()).format('MM-DD-YYYY');
        let endTime = "T" + endYearNTime[1].trim() + ":59" + timeZone;
        this.inputEndDate = this.inputEndDate + endTime;
      } else {
        this.toastr.error('Please Select Business Date');
        return;
      }
    } else if (this.selectedDateTimeRange !== undefined) {
      let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
      this.inputDate = moment(this.selectedDateTimeRange.fDate).format('MM-DD-YYYY') + "T" + this.selectedDateTimeRange.fTime + timeZone;
      if (this.selectedDateTimeRange.tTime === "00:00:00") {
        this.inputEndDate = moment(this.selectedDateTimeRange.tDate).format('MM-DD-YYYY') + "T23:59:59" + timeZone;
      } else this.inputEndDate = moment(this.selectedDateTimeRange.tDate).format('MM-DD-YYYY') + "T" + this.selectedDateTimeRange.tTime + timeZone;
    } else if (this.selectedDateTimeRange === undefined) {
      let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
      this.inputDate = moment().format('MM-DD-YYYY') + "T00:00:00" + timeZone;
      this.inputEndDate = moment().format('MM-DD-YYYY') + "T23:59:59" + timeZone;
    }
    this.pjrSearchForm.get('startDate').setValue(this.inputDate);
    this.pjrSearchForm.get('endDate').setValue(this.inputEndDate);
    this.fetchData();
  }

  fetchData() {
    this.showNoRowsMessage = true;
    this.pjrSearchForm.patchValue({
      departmentName: [],
      cashierId: [],
      voidCashierIDs: [],
      transactionStatus: '',
      eventType: '',
      hasItemSale: '',
      hasDepSale: '',
      hasFuelSale: '',
      noOfRecords: 10,
    });
    this.isSearch = true;
    this.getPJRPanelAggs();
    if (this.isRowData) this.gridApi.purgeServerSideCache([]);
    else this.isRowData = true;
    this.getChartData();
    // this.getDocumentTrends();
    // this.getPjerSearchData();
  }

  getPjerSearchData(params) {
    let postData = this.postData();
    this.spinner.show();
    this.rowData = [];
    this.selectedRowData = null;
    this.isSalesDetail = false;
    this.setupService.getDataElastic('elastic/getDocuments?dateFrom=' + postData.dateFrom +
      '&dateTo=' + postData.dateTo + '&companyID=' + postData.companyID + '&storeLocationID=' + postData.storeLocationID +
      (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
      (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
      (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
      (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
      (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
      (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
      (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
      (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
      (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '') +
      '&fuelSales=' + postData.fuelSales + '&insideSales=' + postData.insideSales + '&promotionalSales=' + postData.promotionalSales
      + '&from=' + params.request.startRow + '&size=' + params.request.endRow
    ).subscribe((response) => {
      // if (!this.isSearch)
      this.spinner.hide();
      // this.isSearch = false;
      const tempRowData = [];
      if (response && response.hits && response.hits.hits.length > 0) {
        const data = response;
        this.totalDocumentCount = data.hits.total;
        data.hits.hits.map((i) => {
          let rowData = i._source.NAXML_POSJournal.JournalReport;
          let rowDataTrans = i._source.NAXML_POSJournal.TransmissionHeader;
          let keys = Object.keys(rowData);
          let eventData;
          let janlHeaderData;
          _.each(keys, (key) => {
            if (key.includes("Event"))
              eventData = rowData[key];
            else
              janlHeaderData = rowData[key];
          });
          tempRowData.push({
            date: eventData.EventStartDate ? eventData.EventStartDate : '',
            time: eventData.EventStartTime ? eventData.EventStartTime : '',
            netAmt: eventData.TransactionSummary ? eventData.TransactionSummary.TransactionTotalNetAmount : '0.00',
            event: janlHeaderData.EventType ? janlHeaderData.EventType : '',
            events: eventData,
            storeName: rowDataTrans.StoreName ? rowDataTrans.StoreName : ''
          })
        });
        params.successCallback(tempRowData, this.totalDocumentCount);
        // this.rowData = tempRowData;
        this.totalNetAmount = tempRowData.reduce((acc, i) => (acc + Number(i.netAmt)), 0);
        this.totalNetAmount = this.totalNetAmount.toFixed(3);
      } else {
        this.isRowData = false;
        this.totalDocumentCount = 0;
        params.successCallback(tempRowData, this.totalDocumentCount);
      }
    }, (error) => {
      this.spinner.hide();
      params.failCallback();
      console.log(error);
    });
  }

  rowSelected(params) {
    this.itemLineData.length = this.tenderInfoData.length = this.transactionTaxDetailList.length = this.salesTableDescData.length = this.fuelLineData.length = 0;
    if (params.length > 0) {
      this.selectedRowData = params[0].data;
      if (!this.isSalesDetail) {
        this.isSalesDetail = true;
        setTimeout(() => {
          this.gridApi.sizeColumnsToFit();
        }, 50)
      }
      else
        this.isSalesDetail = true;
      this.selectedRowData.events.TransactionDetailGroup.TransactionLine.map((x) => {
        if (x.TransactionTax) {
          this.transactionTaxDetailList.push(x.TransactionTax);
        } else if (x.MerchandiseCodeLine) {
          this.salesTableDescData.push(x.MerchandiseCodeLine);
        } else if (x.TenderInfo) {
          this.tenderInfoData.push(x.TenderInfo);
        } else if (x.ItemLine) {
          this.itemLineData.push(x.ItemLine);
        } else if (x.FuelLine) {
          this.fuelLineData.push(x.FuelLine);
        }
      });
    }
    else {
      this.deSelect(true);
    }

  }
  deSelect(isRowClick) {
    this.isSalesDetail = false;
    this.selectedRowData = null;
    setTimeout(() => {
      this.gridApi.sizeColumnsToFit();
    }, 50)
    if (!isRowClick)
      this.gridApi.deselectAll();
  }
  getPJRSearchRecordByDept() {
    const temp = [];
    this.departmentList.map((i) => {
      if (i.isChecked === true) {
        temp.push(i.key);
      }
    });
    const p = _.join(temp, ',');
    this.pjrSearchForm.get('departmentName').setValue(p.toString());
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  getPJRSearchRecordByCashier() {
    const temp = [];
    this.cashiersList.map((i) => {
      if (i.isChecked === true) {
        temp.push(i.key);
      }
    });
    const p = _.join(temp, ',');
    this.pjrSearchForm.get('cashierId').setValue(p.toString());
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  getPJRSearchRecordByVoidTransaction() {
    const temp = [];
    this.voidTransactionsList.map((i) => {
      if (i.isChecked === true) {
        temp.push(i.key);
      }
    });
    const p = _.join(temp, ',');
    this.pjrSearchForm.get('voidCashierIDs').setValue(p.toString());
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  getPJRSearchRecordByTransactionStatus() {
    const temp = [];
    this.transactionStatusList.map((i) => {
      if (i.isChecked === true) {
        temp.push(i.key);
      }
    });
    const p = _.join(temp, ',');
    this.pjrSearchForm.get('transactionStatus').setValue(p.toString());
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  getPJRSearchRecordByEventType() {
    const temp = [];
    this.eventTypeList.map((i) => {
      if (i.isChecked === true) {
        temp.push(i.key);
      }
    });
    const p = _.join(temp, ',');
    this.pjrSearchForm.get('eventType').setValue(p.toString());
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  getPJRSearchRecordBySaleWith() {
    this.pjrSearchForm.get('hasItemSale').setValue('');
    this.pjrSearchForm.get('hasDepSale').setValue('');
    this.pjrSearchForm.get('hasFuelSale').setValue('');
    this.saleWithList.map((i) => {
      if (i.isChecked === true && i.name === 'item') {
        this.pjrSearchForm.get('hasItemSale').setValue(true);
      } else if (i.isChecked === true && i.name === 'departmnet') {
        this.pjrSearchForm.get('hasDepSale').setValue(true);
      } else if (i.isChecked === true && i.name === 'fuel') {
        this.pjrSearchForm.get('hasFuelSale').setValue(true);
      }
    });
    this.getChartData();
    this.gridApi.purgeServerSideCache([]);
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
  }

  chartRangeSelected(event: any) {
    let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
    this.inputDate = moment(event.startRange).format('MM-DD-YYYY') + "T" + moment(event.startRange).format("HH:mm:SS") + timeZone;
    this.inputEndDate = moment(event.endRange).format('MM-DD-YYYY') + "T" + moment(event.endRange).format("HH:mm:SS") + timeZone;
    this.fetchData();
  }

  dateTimeRangeChange(event: any) {
    this.selectedDateTimeRange = _.cloneDeep(event);
    let timeZone = encodeURIComponent(new Date().toTimeString().substring(12, 17));
    this.inputDate = moment(this.selectedDateTimeRange.fDate).format('MM-DD-YYYY') + "T" + this.selectedDateTimeRange.fTime + timeZone;
    if (this.selectedDateTimeRange.tTime === "00:00:00") {
      this.inputEndDate = moment(this.selectedDateTimeRange.tDate).format('MM-DD-YYYY') + "T23:59:59" + timeZone;
    } else this.inputEndDate = moment(this.selectedDateTimeRange.tDate).format('MM-DD-YYYY') + "T" + this.selectedDateTimeRange.tTime + timeZone;
  }

  onDateTypeChange(event) {
    if (event.checked) {
      if (this.pjrSearchForm.get('storeLocationId').value === '' || this.pjrSearchForm.get('storeLocationId').value === null) {
        this.toastr.error('Please Select Store');
        setTimeout(() => {
          this.pjrSearchForm.patchValue({
            dateType: false
          });
        });
      } else {
        setTimeout(() => {
          this.pjrSearchForm.patchValue({
            dateType: true
          });
        });
        this.showBusinessDate = true;
        this.showCalendarDate = false;
        this.fetchBusinessDates();
      }
    } else {
      setTimeout(() => {
        this.pjrSearchForm.patchValue({
          dateType: false
        });
      });
      this.showCalendarDate = true;
      this.showBusinessDate = false;
      this.openPopover = true;
    }
  }

  onStoreSelection(event) {
    if (this.showBusinessDate) this.fetchBusinessDates();
  }

  fetchBusinessDates() {
    let isCurrent = false;
    this.setupService.getData('MovementHeader/GetmovementHeaderByStoreLocation/' + this.pjrSearchForm.get('storeLocationId').value + '/' + isCurrent + '/' + 10)
      .subscribe((response) => {
        this.spinner.hide();
        if (response) {
          this.businessDatesList = [];
          let tempBusinessDatesList = [...response];
          tempBusinessDatesList.sort((a, b) => +new Date(a.endTime) - +new Date(b.endTime));
          let maxBussDate = tempBusinessDatesList[tempBusinessDatesList.length - 1];
          let currBussDate = moment(maxBussDate.endTime).format('MM-DD-YYYY HH:mm') + " - " + moment().format('MM-DD-YYYY HH:mm') + " (Live Sales)";
          let businessDates: any = [];
          businessDates.push(currBussDate);
          _.each(response, (data) => {
            let displayDate = moment(data.beginTime).format('MM-DD-YYYY HH:mm') + " - " + moment(data.endTime).format('MM-DD-YYYY HH:mm');
            businessDates.push(displayDate);
          });
          setTimeout(() => {
            this.businessDatesList = businessDates;
            // if (this.storeLocationList.length > 1)
            //   this.bDatesNGSelect.open();
            // else
            this.pjrSearchForm.patchValue({
              businessDate: currBussDate
            });
            this.search();
          }, 0);
        } else {
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  formatDate(date) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;
    // return [month, day, year].join('-') + ' ' + d.getHours() + ":" + d.getMinutes();
    return d.getHours() + ":" + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
  }

  applyFilters() {
    //selected departments
    if (this.departmentList.length > 0) {
      const departmentSelectionList = [];
      this.departmentList.map((i) => {
        if (i.isChecked === true) {
          departmentSelectionList.push(i.key);
        }
      });
      const selectedDepartments = _.join(departmentSelectionList, ',');
      this.pjrSearchForm.get('departmentName').setValue(selectedDepartments.toString());
    }

    //selected Cashiers
    if (this.cashiersList.length > 0) {
      const cashiersSelectionList = [];
      this.cashiersList.map((i) => {
        if (i.isChecked === true) {
          cashiersSelectionList.push(i.key);
        }
      });
      const selectedCashiers = _.join(cashiersSelectionList, ',');
      this.pjrSearchForm.get('cashierId').setValue(selectedCashiers.toString());
    }

    //selected void Transactions
    if (this.voidTransactionsList.length > 0) {
      const voidTransactionsSelectionList = [];
      this.voidTransactionsList.map((i) => {
        if (i.isChecked === true) {
          voidTransactionsSelectionList.push(i.key);
        }
      });
      const SelectionVoidTransactionsList = _.join(voidTransactionsSelectionList, ',');
      this.pjrSearchForm.get('voidCashierIDs').setValue(SelectionVoidTransactionsList.toString());
    }

    //selectedTxnStatus
    if (this.transactionStatusList.length > 0) {
      const transactionStatusSelectionList = [];
      this.transactionStatusList.map((i) => {
        if (i.isChecked === true) {
          transactionStatusSelectionList.push(i.key);
        }
      });
      const selectedTxnStatus = _.join(transactionStatusSelectionList, ',');
      this.pjrSearchForm.get('transactionStatus').setValue(selectedTxnStatus.toString());
    }

    //selected event types
    if (this.eventTypeList.length > 0) {
      const eventTypeSelectionList = [];
      this.eventTypeList.map((i) => {
        if (i.isChecked === true) {
          eventTypeSelectionList.push(i.key);
        }
      });
      const selectedEventTypes = _.join(eventTypeSelectionList, ',');
      this.pjrSearchForm.get('eventType').setValue(selectedEventTypes.toString());
    }

    //selected sale type
    if (this.saleWithList.length > 0) {
      this.pjrSearchForm.get('hasItemSale').setValue('');
      this.pjrSearchForm.get('hasDepSale').setValue('');
      this.pjrSearchForm.get('hasFuelSale').setValue('');
      this.saleWithList.map((i) => {
        if (i.isChecked === true && i.name === 'item') {
          this.pjrSearchForm.get('hasItemSale').setValue(true);
        } else if (i.isChecked === true && i.name === 'departmnet') {
          this.pjrSearchForm.get('hasDepSale').setValue(true);
        } else if (i.isChecked === true && i.name === 'fuel') {
          this.pjrSearchForm.get('hasFuelSale').setValue(true);
        }
      });
    }
    this.gridApi.purgeServerSideCache([]);
    // this.getDocumentTrends();
  }

  clearFilters() {
    //selected departments
    if (this.departmentList.length > 0) {
      this.departmentList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('departmentName').setValue("");

    //selected Cashiers
    if (this.cashiersList.length > 0) {
      this.cashiersList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('cashierId').setValue("");

    //selected void Transactions
    if (this.voidTransactionsList.length > 0) {
      this.voidTransactionsList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('voidCashierIDs').setValue("");

    //selectedTxnStatus
    if (this.transactionStatusList.length > 0) {
      this.transactionStatusList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('transactionStatus').setValue("");

    //selected event types
    if (this.eventTypeList.length > 0) {
      this.eventTypeList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('eventType').setValue("");

    //selected sale type
    if (this.saleWithList.length > 0) {
      this.saleWithList.map((i) => {
        if (i.isChecked === true) {
          i.isChecked = false;
          return i;
        }
      });
    }
    this.pjrSearchForm.get('hasItemSale').setValue('');
    this.pjrSearchForm.get('hasDepSale').setValue('');
    this.pjrSearchForm.get('hasFuelSale').setValue('');

    this.gridApi.purgeServerSideCache([]);
  }

  ServerSideDatasource() {
    return {
      getRows: (params) => {
        this.getPjerSearchData(params);
      },
    };
  }

  getChartData() {
    let postData = this.postData();
    forkJoin(this.setupService.getDataElastic('elastic/getFuelSales?dateFrom='
      + postData.dateFrom + '&dateTo=' + postData.dateTo
      + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
      (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
      (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
      (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
      (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
      (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
      (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
      (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
      (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
      (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '')),

      this.setupService.getDataElastic('elastic/getNonFuelSales?dateFrom='
        + postData.dateFrom + '&dateTo=' + postData.dateTo
        + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
        (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
        (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
        (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
        (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
        (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
        (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
        (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
        (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
        (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '')),

      this.setupService.getDataElastic('elastic/getInsiderSales?dateFrom='
        + postData.dateFrom + '&dateTo=' + postData.dateTo
        + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
        (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
        (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
        (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
        (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
        (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
        (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
        (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
        (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
        (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '')),

      this.setupService.getDataElastic('elastic/getSalesTrend?dateFrom='
        + postData.dateFrom + '&dateTo=' + postData.dateTo
        + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
        (postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
        (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
        (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
        (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
        (postData.freeText.length > 0 ? '&query=' + postData.freeText : '') +
        (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
        (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
        (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
        (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '')),

      this.setupService.getDataElastic('elastic/getPromotionalSales?dateFrom='
        + postData.dateFrom + '&dateTo=' + postData.dateTo
        + '&storeLocationID=' + postData.storeLocationID + '&companyID=' + postData.companyID +
        (postData.freeText.length > 0 ? '&query=' + postData.freeText : '')
        // +(postData.departmentName.length > 0 ? '&departmentName=' + postData.departmentName : '') +
        // (postData.cashierId.length > 0 ? '&cashierId=' + postData.cashierId : '') +
        // (postData.transactionStatus.length > 0 ? '&transactionStatus=' + postData.transactionStatus : '') +
        // (postData.eventType.length > 0 ? '&eventType=' + postData.eventType : '') +
        // (postData.hasItemSale.length > 0 ? '&hasItemSale=' + postData.hasItemSale : '') +
        // (postData.hasDepSale.length > 0 ? '&hasDepSale=' + postData.hasDepSale : '') +
        // (postData.hasFuelSale.length > 0 ? '&hasFuelSale=' + postData.hasFuelSale : '') +
        // (postData.voidCashierIDs.length > 0 ? '&voidCashierIDs=' + postData.voidCashierIDs : '')
      )
    ).subscribe(
      (response) => {
        //fuel sales
        let docCountsFuelSales = [];
        let docDateRanges = [];
        let docDateRangesWithDates = [];
        if (response[0].aggregations.store.buckets[0]) {
          let fuelSalesData: [] = response[0].aggregations.store.buckets[0].date.buckets;
          _.each(fuelSalesData, (fuelSales: any) => {
            docCountsFuelSales.push(fuelSales.doc_count);
            docDateRanges.push(this.formatDate(fuelSales.key_as_string));
            docDateRangesWithDates.push(fuelSales.key_as_string)
          });
          this.lineChartItemLabels = docDateRanges;
          this.lineChartItemLabelsWithDates = docDateRangesWithDates;
        }
        //Non Fuel sales
        let docCountsNonFuelSales = [];
        if (response[1] && response[1].aggregations.store.buckets[0]) {
          let nonFuelSalesData: [] = response[1].aggregations.store.buckets[0].date.buckets;
          _.each(nonFuelSalesData, (nonFuelSales: any) => {
            docCountsNonFuelSales.push(nonFuelSales.doc_count);
          });
        }
        //Insider Sales
        let docCountsInsiderSales = [];
        if (response[2] && response[2].aggregations.store.buckets[0]) {
          let insiderSalesData: [] = response[2].aggregations.store.buckets[0].date.buckets;
          _.each(insiderSalesData, (insiderSales: any) => {
            docCountsInsiderSales.push(insiderSales.doc_count);
          });
        }
        this.lineChartItemData = [
          { data: docCountsNonFuelSales, label: 'Non Fuel Sales' },
          { data: docCountsFuelSales, label: 'Fuel Sales' },
          { data: docCountsInsiderSales, label: 'Merchandise Sales' }
        ];
        if (response[3]) {
          this.salesTotals = response[3];
          this.showSalesTotals = true;
        }
        if (response[4].aggregations.store.buckets[0]) {
          this.promotionalSales = response[4].aggregations.store.buckets[0].total_promotional_sales.value;
          this.promotionalSalesQty = response[4].aggregations.store.buckets[0].sales_quantity.value;
          this.showPromotionalSalesTotals = true;
        }
      },
      (error) => {
      },
    );
  }

  onClickFuelSales() {
    this.promotionalSalesFlag = false;
    this.fuelSales = true;
    this.insideSales = false;
    this.getPJRPanelAggs();
    this.gridApi.purgeServerSideCache([]);
  }

  onClickInsideSales() {
    this.promotionalSalesFlag = false;
    this.insideSales = true;
    this.fuelSales = false;
    this.getPJRPanelAggs();
    this.gridApi.purgeServerSideCache([]);
  }

  onClickPromotionSales() {
    this.insideSales = false;
    this.fuelSales = false;
    this.promotionalSalesFlag = true;
    this.getPJRPanelAggs();
    this.gridApi.purgeServerSideCache([]);
  }
}
