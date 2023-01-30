import {
  Component, OnInit, ViewChild, TemplateRef, ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import * as moment from 'moment';
// new calender
import {
  startOfDay, endOfDay, subDays, addDays, endOfMonth,
  addHours, addWeeks, addMonths, startOfWeek, startOfMonth
} from 'date-fns';
import { Subject } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView, CalendarMonthViewDay } from 'angular-calendar';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridService } from '@shared/services/grid/grid.service';
import { TestService } from '@shared/services/test/test.service';
import { FormBuilder } from '@angular/forms';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '@shared/services/store/store.service';
import { Router } from '@angular/router';
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3'
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF'
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA'
  }
};
type CalendarPeriod = 'day' | 'week' | 'month';
function addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
  return {
    day: addDays,
    week: addWeeks,
    month: addMonths
  }[period](date, amount);
}
function startOfPeriod(period: CalendarPeriod, date: Date): Date {
  return {
    day: startOfDay,
    week: startOfWeek,
    month: startOfMonth
  }[period](date);
}
@Component({
  selector: 'app-day-recon',
  templateUrl: './day-recon.component.html',
  styleUrls: ['./day-recon.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class DayReconsComponent implements OnInit {


  selectedDayDate: String;
  isDailyEntryData = false;
  _date = moment().format('MM-DD-YYYY');

  // ===================================== new calender ========================================== //
  @ViewChild('modalContent') modalContent: TemplateRef<any>;

  view: CalendarView = CalendarView.Month;

  CalendarView = CalendarView;

  viewDate: Date = new Date();
  maxDate: Date = addMonths(new Date(), 0);
  nextBtnDisabled = false;
  modalData: {
    action: string;
    event: CalendarEvent;
  };
  actions: CalendarEventAction[] = [
    {
      label: '<i class=fa fa-fw fa-pencil></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class=fa fa-fw fa-times></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  refresh: Subject<any> = new Subject();

  events: CalendarEvent[] = [
    {
      start: subDays(startOfDay(new Date()), 1),
      end: addDays(new Date(), 1),
      title: 'A 3 day event',
      color: colors.red,
      actions: this.actions,
      allDay: true,
      // resizable: {
      //   beforeStart: true,
      //   afterEnd: true
      // },
      // draggable: true
    },
    {
      start: startOfDay(new Date()),
      title: 'An event with no end date',
      color: colors.yellow,
      actions: this.actions
    },
    {
      start: subDays(endOfMonth(new Date()), 3),
      end: addDays(endOfMonth(new Date()), 3),
      title: 'A long event that spans 2 months',
      color: colors.blue,
      allDay: true
    },
    {
      start: addHours(startOfDay(new Date()), 2),
      end: new Date(),
      title: 'A draggable and resizable event',
      color: colors.yellow,
      actions: this.actions,

    }
  ];

  activeDayIsOpen = false;
  // end

  shiftList = [
    { name: 'Day Close', value: 0 },
    { name: 'Shift 1', value: 1 },
    { name: 'Shift 2', value: 2 },
    { name: 'Shift 3', value: 3 },
  ];
  storeLocationList;
  userInfo = this.constantService.getUserInfo();
  currentDate = new Date();
  batchList = [
    {},
    // {}
  ];
  currentDateDecTwoMonth = new Date();
  currentDateDecOneMonth = new Date();
  currentDateIncOneMonth = new Date();
  currentDateIncTwoMonth = new Date();
  shiftWiseValue: any = null;
  storeLocationId: any = null;
  dayReconData: any;
  criticalStats: any;
  departmentSalesTypeobject: any;
  isDayRecondData: boolean;
  isResponse: boolean;
  isMovementHeader: boolean;
  prevColorId = null;
  gridOptions: any;
  rowData = [];
  selectedMomentHeader: any;
  posPayInPayouts: any;
  isLoading = true;
  entriesForm = this.fb.group({

    posdailyPayinobject: this.fb.group({
      // taxableSales: [2],
      dayReconPayINID: [''],
      movementHeaderID: [],
      taxableSales: [],
      nonTaxableSales: [],
      totalGrocerySales: [],
      salesTax: [],
      cashCardJobber: [],
      cashCardNonJobber: [],
      instantTicketSales: [],
      otherIncome: [],
      moneyFromBank: [],
      fuelAmount: [],
      dailyLoanAccountReceivable: [],
      moneyTransfer: [],
      moneyTransferFee: [],
      moneyOrder: [],
      moneyOrderFee: [],
      lotterySales: [],
      lotto: [],
    }),
    dayReconPayIN: this.fb.group({
      // taxableSales: [5],
      dayReconPayINID: [],
      movementHeaderID: [],
      taxableSales: [],
      nonTaxableSales: [],
      totalGrocerySales: [],
      salesTax: [],
      cashCardJobber: [],
      cashCardNonJobber: [],
      instantTicketSales: [],
      otherIncome: [],
      moneyFromBank: [],
      fuelAmount: [],
      dailyLoanAccountReceivable: [],
      moneyTransfer: [],
      moneyTransferFee: [],
      moneyOrder: [],
      moneyOrderFee: [],
      lotterySales: [],
      lotto: [],
      totalIn: [],
    }),
    posdailypayoutobject: this.fb.group({
      dayReconPayOutID: [],
      movementHeaderID: [],
      deposit: [],
      creditCardNonJobber: [],
      foodStamps: [],
      creditCardJobber: [],
      cashPurchase: [],
      dailyLoanChargeAccount: [],
      withdrawal: [],
      expenses: [],
      atm: [],
      lottoCashes: [],
      scratchOffCashes: [],
      dailyClosingCash: [],
      dailyClosingCheck: [],

    }),
    dayreconPayOut: this.fb.group({
      dayReconPayOutID: [],
      movementHeaderID: [],
      deposit: [],
      creditCardNonJobber: [],
      foodStamps: [],
      creditCardJobber: [],
      cashPurchase: [],
      dailyLoanChargeAccount: [],
      withdrawal: [],
      expenses: [],
      atm: [],
      lottoCashes: [],
      scratchOffCashes: [],
      dailyClosingCash: [],
      dailyClosingCheck: [],
      totalOut: [],
      overShort: [],
    }),
  });
  shortOverBackgroundColor = 'green';
  isShowDetails: boolean;
  isShowCalender = true;
  isShowExpenses = false;
  inputStatusString: any;
  // Add new line
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDayViewDate: Date;
  selectedDays: any = [];
  isDayDetail: boolean;
  totalPosSales: any;
  dayReconInfoData: {
    storeName: any,
    selectedDate: Date,
    totalPosSales: any,
    saleTaxObj: any,
    selectedInfo: any,
    criticalStats: any,
    departmentSalesTypeobject: any,
    posPayInPayouts: any
  };
  saleTaxObj: any;
  showSettings: boolean | false;
  constructor(private modal: NgbModal, private setupService: SetupService, private spinner: NgxSpinnerService,
    private constantService: ConstantService, private gridService: GridService, private storeService: StoreService,
    private fb: FormBuilder, private toastr: ToastrService, private router: Router) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.dayReconGrid);
    this.dateOrViewChanged();
  }

  /*
  // @params Form Group get value method
  */
  get firstGroup() { return this.entriesForm.get('posdailyPayinobject').value; }
  get dayReconOutGroup() { return this.entriesForm.get('posdailypayoutobject').value; }
  get dayReconPayINValues(): any { return this.entriesForm.get('dayReconPayIN'); }
  get dayreconPayOutValues(): any { return this.entriesForm.get('dayreconPayOut'); }
  ngOnInit() {
    this.getStoreLocationDetails();
    this.setMonth();
    var ext = ['CompanyAdmin', 'SuperAdmin', 'StoreManager'];
    if (this.userInfo.roles.some(item => ext.includes(item))) {
      this.showSettings = true;
    }
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  openSalesTotalMgmt() {
    this.router.navigate(['admin-accounting/sales-total-mgmt']);
  }
  getStoreLocationDetails() {
    if (this.storeService.storeLocation) {
      this.isLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.storeLocationId = this.storeLocationList[0].storeLocationID;
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.storeLocationId = this.storeLocationList[0].storeLocationID;
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  yesterdayDateSelect() {
    this._date = moment(this._date, 'MM-DD-YYYY').subtract(1, 'day').format('MM-DD-YYYY');
    // this._date = subDays(this._date, 1).format('MM-DD-YYYY');
    this.selectedDayDate = moment(this._date).format('dddd, MMMM Do YYYY');
    this.viewDate = startOfDay(this._date);

  }
  tomorrowDateSelect() {
    this._date = moment(this._date, 'MM-DD-YYYY').add(1, 'day').format('MM-DD-YYYY');
    this.selectedDayDate = moment(this._date).format('dddd, MMMM Do YYYY');
    this.viewDate = startOfDay(this._date);
  }
  back() {
    this.isShowCalender = true;
    this.isDailyEntryData = false;
    this.isShowDetails = this.isDayDetail = false;
  }
  setMonth() {
    this.currentDateDecTwoMonth = new Date(this.currentDateDecTwoMonth.setMonth(this.currentDate.getMonth() - 2));
    this.currentDateDecOneMonth = new Date(this.currentDateDecOneMonth.setMonth(this.currentDate.getMonth() - 1));
    this.currentDateIncOneMonth = new Date(this.currentDateIncOneMonth.setMonth(this.currentDate.getMonth() + 1));
    this.currentDateIncTwoMonth = new Date(this.currentDateIncTwoMonth.setMonth(this.currentDate.getMonth() + 2));
  }
  // ======================================== new calender ==============================================//
  // dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
  dayClicked(day: CalendarMonthViewDay): void {
    if (day.date > new Date()) {
      return;
    }
    this.currentDate = day.date;
    this.viewDate = this.currentDate;

    this.setMonth();
    // this.currentDate = moment(date).format('dddd, MMMM Do YYYY');
    this.getDayReconData();
    this.selectedMonthViewDay = day;
    const selectedDateTime = this.selectedMonthViewDay.date.getTime();
    const dateIndex = this.selectedDays.findIndex(
      selectedDay => selectedDay.date.getTime() === selectedDateTime
    );
    delete this.selectedMonthViewDay.cssClass;
    this.selectedDays.splice(dateIndex, 1);
    // if (dateIndex > -1) {
    //   delete this.selectedMonthViewDay.cssClass;
    //   this.selectedDays.splice(dateIndex, 1);
    // } else {
    //   this.selectedDays.push(this.selectedMonthViewDay);
    //   day.cssClass = 'cal-day-selected';
    //   this.selectedMonthViewDay = day;
    // }
    this.selectedDays.push(this.selectedMonthViewDay);
    day.cssClass = 'cal-day-selected';
    this.selectedMonthViewDay = day;
    return;
    // old logic
    // this.selectedDayDate = moment(day.date).format('dddd, MMMM Do YYYY');
    // this.isDailyEntryData = true;
    // this._date = moment(day.date).format('MM-DD-YYYY');
    // if (isSameMonth(date, this.viewDate)) {
    //   if (
    //     (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
    //     events.length === 0
    //   ) {
    //     this.activeDayIsOpen = false;
    //   } else {
    //     this.activeDayIsOpen = true;
    //   }
    //   this.viewDate = date;
    // }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach(day => {
      if (
        this.selectedDays.some(
          selectedDay => selectedDay.date.getTime() === day.date.getTime()
        )
      ) {
        if (!this.dateIsValid(day.date)) {
          day.cssClass = 'cal-day-selected cal-disabled';
        } else {
          day.cssClass = 'cal-day-selected';
        }

      }
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map(iEvent => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this.modal.open(this.modalContent, { size: 'lg' });
  }

  addEvent(): void {
    this.events = [
      ...this.events,
      {
        title: 'New event',
        start: startOfDay(new Date()),
        end: endOfDay(new Date()),
        color: colors.red,
        draggable: true,
        resizable: {
          beforeStart: true,
          afterEnd: true
        }
      }
    ];
  }

  deleteEvent(eventToDelete: CalendarEvent) {
    this.events = this.events.filter(event => event !== eventToDelete);
  }

  getDayReconData() {
    this.isResponse = false;
    if (this.storeLocationId === null || this.shiftWiseValue === null || !this.shiftWiseValue) {
      return;
    }
    this.spinner.show();
    const postData = {
      currentDate: moment(this.currentDate).format('MM-DD-YYYY')
    };
    this.selectedMomentHeader = {};
    this.setupService.getData('MovementHeader/getDayReconDataObject?businessDate=' +
      postData.currentDate + '&StoreLocationID=' + this.storeLocationId + '&shiftWiseValue='
      + this.shiftWiseValue.value).subscribe((response) => {
        this.spinner.hide();
        this.isResponse = true;
        this.isMovementHeader = false;
        this.prevColorId = null;
        if (response && response.length === 1) {
          this.isDayRecondData = true;
          this.isMovementHeader = true;
          this.dayReconData = response;
          this.selectedMomentHeader = response[0];
          this.departmentSalesTypeobject = response[0].departmentSalesTypeobject;
          this.totalPosSales = this.departmentSalesTypeobject.reduce((acc, obj) => acc + obj.totalAmount, 0);
          // add new req
          this.saleTaxObj = _.find(this.departmentSalesTypeobject, ['departmentTypeName', 'Sales Tax']);
          if (this.saleTaxObj === undefined || this.saleTaxObj === null) {
            this.saleTaxObj = {
              "departmentTypeID": 0,
              "departmentTypeName": "Default Values",
              "nonTaxableInsideSales": 0,
              "taxableInsideSales": 0,
              "totalAmount": 0
            }
          }
          this.criticalStats = response[0].criticalStats;
          this.getPOSPayInPayouts();
        } else if (response && response.length > 0) {
          this.isDayRecondData = true;
          this.dayReconData = response;
        } else {
          this.dayReconData = [];
          this.isDayRecondData = false;
        }
      }, (error) => {
        this.spinner.hide();
        this.isResponse = false;
      });
  }

  getPOSPayInPayouts() {
    if (this.storeLocationId === null || this.shiftWiseValue === null || !this.shiftWiseValue) {
      return;
    }
    this.setupService.getData('IncomeExpense/GetPayInpayoutsFromPOS?MovementHeaderID=' + this.selectedMomentHeader.movementHeaderData.movementHeaderID +
      '&shiftWiseValue=' + this.shiftWiseValue.value).subscribe((response) => {
        this.posPayInPayouts = response;
      }, (error) => {
        this.spinner.hide();
        this.isResponse = false;
      });
  }

  movementHeader(params, index) {
    this.isMovementHeader = true;
    this.selectedMomentHeader = params;
    this.departmentSalesTypeobject = params.departmentSalesTypeobject;
    this.totalPosSales = this.departmentSalesTypeobject.reduce((acc, obj) => acc + obj.totalAmount, 0);
    this.criticalStats = params.criticalStats;
    const id = params.movementHeaderData.movementHeaderID + index;
    // tslint:disable-next-line:no-unused-expression
    this.prevColorId === id ? this.prevColorId = null : '';
    document.getElementById(id).style.backgroundColor = '#26AEF9';
    // tslint:disable-next-line:no-unused-expression
    this.prevColorId !== null ? document.getElementById(this.prevColorId).style.backgroundColor = '#3C83F9' : '';
    this.prevColorId = id;
    this.saleTaxObj = _.find(this.departmentSalesTypeobject, ['departmentTypeName', 'Sales Tax']);
    if (this.saleTaxObj === undefined || this.saleTaxObj === null) {
      this.saleTaxObj = {
        "departmentTypeID": 0,
        "departmentTypeName": "Default Values",
        "nonTaxableInsideSales": 0,
        "taxableInsideSales": 0,
        "totalAmount": 0
      }
    }
  }

  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
    this.currentDate = this.viewDate;
    this.setMonth();
  }

  getColor(deptName) {
    switch (deptName) {
      case 'Inside Sales':
        return '#0F8AD4';
      case 'Discounts & Promotions':
        return '#26AEF9';
      case 'Sales Tax':
        return '#3BBAFF';
      case 'Phone Cards':
        return '#26AEF9';
      case 'Fuel':
        return '#0F8AD4';
      case 'Lottery':
        return '#22A6EE';
      case 'Lotto':
        return '#25AEFA';
      case 'Total POS Sales':
        return '#159F7D';
      case 'Short Over':
        return '#159F7D';
      default:
        return '#26AEF9';
    }
  }

  getDailyColor(params) {
    // tslint:disable-next-line:prefer-const
    let isCheck = false;
    switch (params) {
      case 'taxableSales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('taxableSales').value) > this.firstGroup.taxableSales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'nonTaxableSales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('nonTaxableSales').value) > this.firstGroup.nonTaxableSales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'nonTaxableSales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('nonTaxableSales').value) > this.firstGroup.nonTaxableSales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';

      case 'salesTax':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('salesTax').value) > this.firstGroup.salesTax) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'totalGrocerySales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('totalGrocerySales').value) > this.firstGroup.totalGrocerySales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'cashCardJobber':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('cashCardJobber').value) > this.firstGroup.cashCardJobber) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'cashCardNonJobber':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('cashCardNonJobber').value) > this.firstGroup.cashCardNonJobber) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'instantTicketSales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('instantTicketSales').value) > this.firstGroup.instantTicketSales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'otherIncome':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('otherIncome').value) > this.firstGroup.otherIncome) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'moneyFromBank':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('moneyFromBank').value) > this.firstGroup.moneyFromBank) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'fuelAmount':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('fuelAmount').value) > this.firstGroup.fuelAmount) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'dailyLoanAccountReceivable':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('dailyLoanAccountReceivable').value) > this.firstGroup.dailyLoanAccountReceivable) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'moneyTransfer':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('moneyTransfer').value) > this.firstGroup.moneyTransfer) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'moneyTransferFee':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('moneyTransferFee').value) > this.firstGroup.moneyTransferFee) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'moneyOrder':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('moneyOrder').value) > this.firstGroup.moneyOrder) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'moneyOrderFee':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('moneyOrderFee').value) > this.firstGroup.moneyOrderFee) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'lotterySales':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('lotterySales').value) > this.firstGroup.lotterySales) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'lotto':
        isCheck = false;
        if (Number(this.dayReconPayINValues.get('lotto').value) > this.firstGroup.lotto) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';

      default: return '1px solid #ced4da';
    }
  }

  getDailyOutColor(params) {
    let isCheck = false;
    switch (params) {
      case 'deposit':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('deposit').value) > this.dayReconOutGroup.deposit) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'creditCardNonJobber':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('creditCardNonJobber').value) > this.dayReconOutGroup.creditCardNonJobber) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'foodStamps':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('foodStamps').value) > this.dayReconOutGroup.foodStamps) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'creditCardJobber':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('creditCardJobber').value) > this.dayReconOutGroup.creditCardJobber) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'cashPurchase':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('cashPurchase').value) > this.dayReconOutGroup.cashPurchase) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'dailyLoanChargeAccount':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('dailyLoanChargeAccount').value) > this.dayReconOutGroup.dailyLoanChargeAccount) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'withdrawal':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('withdrawal').value) > this.dayReconOutGroup.withdrawal) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'expenses':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('expenses').value) > this.dayReconOutGroup.expenses) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'atm':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('atm').value) > this.dayReconOutGroup.atm) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'lottoCashes':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('lottoCashes').value) > this.dayReconOutGroup.lottoCashes) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'scratchOffCashes':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('scratchOffCashes').value) > this.dayReconOutGroup.scratchOffCashes) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'dailyClosingCash':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('dailyClosingCash').value) > this.dayReconOutGroup.dailyClosingCash) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';
      case 'dailyClosingCheck':
        isCheck = false;
        if (Number(this.dayreconPayOutValues.get('dailyClosingCheck').value) > this.dayReconOutGroup.dailyClosingCheck) {
          isCheck = true;
        }
        return isCheck ? '1px solid red' : '1px solid #ced4da';


      default: return '1px solid #ced4da';
    }
  }
  makeEntries() {

    this.getposdailyData();
  }



  getposdailyData() {
    const postData = {
      MovementHeaderID: this.selectedMomentHeader.movementHeaderData.movementHeaderID,
      StoreLocationID: this.storeLocationId,
      Shiftwisevalue: this.shiftWiseValue.value,
    };
    this.spinner.show();
    this.setupService.getData('MovementHeader/getposdaily?storeLocationID=' +
      postData.StoreLocationID + '&movementHeaderID=' + postData.MovementHeaderID + '&shiftwiseValue=' + postData.Shiftwisevalue)
      .subscribe((response) => {
        this.spinner.hide();
        this.isShowCalender = false;
        this.isDailyEntryData = true;
        if (response) {
          const dayReconPayINID = response.dayReconPayIN.dayReconPayINID;
          const dayReconPayOutID = response.dayreconPayOut.dayReconPayOutID;
          const constposdailyPayinobject = response.posdailyPayinobject;
          const constdayReconPayIN = response.dayReconPayIN;
          const constposdailypayoutobject = response.posdailypayoutobject;
          const constdayreconPayOut = response.dayreconPayOut;
          const dayRecIn = constdayReconPayIN;
          delete dayRecIn.movementHeaderID;
          delete dayRecIn.dayReconPayINID;
          const dayRecOut = constdayreconPayOut;
          delete dayRecOut.movementHeaderID;
          delete dayRecOut.dayReconPayOutID;
          const totalIn = _.reduce(dayRecIn, (acc, n) => {
            return acc + n;
          });
          const totalOut = _.reduce(dayRecOut, (acc, n) => {
            return acc + n;
          });
          const overShort = Number(totalIn) - Number(totalOut);
          this.setShortOverBackgroundColor(overShort);
          this.entriesForm.patchValue({
            posdailyPayinobject: ({
              ...constposdailyPayinobject,
            }),
            dayReconPayIN: ({
              ...constdayReconPayIN,
              totalIn: totalIn,
              dayReconPayINID: dayReconPayINID
            }),
            posdailypayoutobject: ({
              ...constposdailypayoutobject,
            }),
            dayreconPayOut: ({
              ...constdayreconPayOut,
              totalOut: totalOut,
              overShort: overShort,
              dayReconPayOutID: dayReconPayOutID,
            }),
          });
        }

      }, (error) => {
        this.spinner.hide(); console.log(error);
      });
  }

  setShortOverBackgroundColor(value) {
    this.shortOverBackgroundColor = value < 0 ? 'red' : 'green';
  }
  backToList() {
    this.isShowCalender = false;
    this.isDailyEntryData = true;
    this.isShowDetails = false;
  }



  saveEntries() {
    this.entriesForm.get('dayReconPayIN').patchValue({
      movementHeaderID: this.selectedMomentHeader.movementHeaderData.movementHeaderID
    });
    const postData = {
      ... this.dayReconPayINValues.value,
      ...this.dayreconPayOutValues.value,
      dayReconPayINID: this.dayReconPayINValues.value.dayReconPayINID ? this.dayReconPayINValues.value.dayReconPayINID : 0,
      dayReconPayOutID: this.dayreconPayOutValues.value.dayReconPayOutID ? this.dayreconPayOutValues.value.dayReconPayOutID : 0,
      movementHeaderID: this.selectedMomentHeader.movementHeaderData.movementHeaderID
    };
    postData.dayReconPayOutID = postData.dayReconPayOutID ? postData.dayReconPayOutID : 0;
    if (postData.movementHeaderID === null) {
      this.toastr.warning('', 'warning');
      return;
    }
    this.spinner.show();
    this.setupService.postData('DayReconPayIN/SaveDayReconPayINNOut', postData).subscribe((response) => {
      this.spinner.hide();
      if (response && response === '1') {
        this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Success');
      } else {
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
      }
    }, (error) => {
      console.log(error);
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Error');
    });
  }

  details() {
    const postData = {
      MovementHeaderID: this.selectedMomentHeader.movementHeaderData.movementHeaderID,
      StoreLocationID: this.storeLocationId,
      Shiftwisevalue: this.shiftWiseValue.value,
    };
    this.isShowDetails = true;
    this.isDailyEntryData = false;
    this.isShowCalender = false;
    this.spinner.show();
    // this.setupService.getData('MovementHeader/GetDepartmenTypesales/621284/100/0').subscribe((response) => {
    this.setupService.getData('MovementHeader/GetDepartmenTypesales/' + postData.MovementHeaderID
      + '/' + postData.StoreLocationID + '/' + postData.Shiftwisevalue).subscribe((response) => {
        this.spinner.hide();
        this.rowData = [];
        this.rowData = response.map((x) => {
          return {
            ...x,
            typeOfSell: 'Type of Sale: ' + x.departmentTypeName,
          };
        });
      }, (error) => {
        console.log(error);
        this.spinner.hide();
      });
  }
  addExpenses(params) {
    this.inputStatusString = params;
    this.isShowCalender = this.isDailyEntryData = this.isShowDetails = false;
    this.isShowExpenses = true;
  }
  backToDayReconList(params) {
    this.isDailyEntryData = params;
    this.isShowDetails = this.isShowCalender = this.isDayDetail = this.isShowExpenses = false;
  }

  increment(): void {
    if (this.viewDate > new Date()) {
      this.nextBtnDisabled = true;
      this.currentDate = new Date();
      this.viewDate = this.currentDate;
      delete this.selectedMonthViewDay.cssClass;
      this.selectedDays.splice(0, 1);
      return;
    }
    this.dateOrViewChanged();
  }

  decrement(): void {
    this.dateOrViewChanged();
  }

  dateIsValid(date: Date): boolean {
    return date <= this.maxDate;
  }
  dateOrViewChanged(): void {
    this.nextBtnDisabled = !this.dateIsValid(
      startOfPeriod(this.view, addPeriod(this.view, this.viewDate, 1))
    );
  }
  dayReconDetails() {
    this.isDayDetail = true;
    this.isShowExpenses = this.isDailyEntryData = this.isShowCalender = false;
    const selectedStore = this.storeLocationList.find((i) => i.storeLocationID === this.storeLocationId);
    this.dayReconInfoData = {
      storeName: selectedStore.storeName,
      selectedDate: this.currentDate,
      totalPosSales: this.totalPosSales,
      saleTaxObj: this.saleTaxObj,
      selectedInfo: selectedStore,
      criticalStats: this.criticalStats,
      departmentSalesTypeobject: this.departmentSalesTypeobject,
      posPayInPayouts: this.posPayInPayouts
    };
  }
}
