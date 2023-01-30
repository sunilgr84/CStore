import { Component, Output, Input, OnChanges, EventEmitter, ViewChild, HostListener, SimpleChanges, ViewChildren, QueryList } from '@angular/core';
import { NgbDatepicker, NgbDate, NgbCalendar, NgbDateParserFormatter, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-daterangepicker',
  templateUrl: './daterangepicker.component.html',
  styleUrls: ['./daterangepicker.component.scss']
})
export class DaterangepickerComponent implements OnChanges {

  @Output() dateRangeSelecetd = new EventEmitter<{ fDate: string, tDate: string, selectionType: string }>();
  @Input('fromValue') fromValue: null;
  @Input('selectedDateRange') selectedDateRange: any;
  @ViewChild('popOver') public popover: NgbPopover;
  @ViewChild('popContent') public popContent: any;
  @ViewChild('dp') datepicker: NgbDatepicker;
  @Input('openPopover') openPopover: any;
  @Input('placement') placement: any;

  maxDate: any;
  selectionType: any;
  hoveredDate: NgbDate;
  fromDate: NgbDate;
  toDate: NgbDate;
  selectionCount: number = 0;
  defaultPlacement = 'bottom-left';
  constructor(private calendar: NgbCalendar, public formatter: NgbDateParserFormatter) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getToday();
    this.maxDate = {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate()
    };
  }

  @HostListener('click')
  onClickDateRangePicker() {
    this.selectionCount = 0;
    if (typeof (this.selectedDateRange) !== 'undefined') {
      let fromDateArr = this.selectedDateRange.fDate.split("-");
      this.fromDate.year = parseInt(fromDateArr[0]);
      this.fromDate.month = parseInt(fromDateArr[1]);
      this.fromDate.day = parseInt(fromDateArr[2]);
      let toDateArr = this.selectedDateRange.tDate.split("-");
      this.toDate =this.calendar.getToday();
      this.toDate.year = parseInt(toDateArr[0]);
      this.toDate.month = parseInt(toDateArr[1]);
      this.toDate.day = parseInt(toDateArr[2]);
      this.selectionType = this.selectedDateRange.selectionType;
      if (document.getElementById(this.selectionType))
        document.getElementById(this.selectionType).classList.add('btn-primary-active');
      if (this.datepicker !== undefined) {
        this.datepicker.navigateTo(this.fromDate);
      } else {
        document.getElementById('dummyButton').click();
      }
    }
  }

  reset(dateRange) {
    if (typeof (dateRange) !== 'undefined') {
      let fromDateArr = dateRange.fDate.split("-");
      this.fromDate.year = parseInt(fromDateArr[0]);
      this.fromDate.month = parseInt(fromDateArr[1]);
      this.fromDate.day = parseInt(fromDateArr[2]);
      let toDateArr = dateRange.tDate.split("-");
      this.toDate.year = parseInt(toDateArr[0]);
      this.toDate.month = parseInt(toDateArr[1]);
      this.toDate.day = parseInt(toDateArr[2]);
      this.selectionType = dateRange.selectionType;
    }
  }

  selectToday(event: any, dp: any) {
    this.datepicker = dp;
    this.fromDate = this.calendar.getToday();
    this.toDate = this.calendar.getToday();
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectYesterday(event: any, dp: any) {
    this.datepicker = dp;
    this.fromDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 1);
    this.toDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 1);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectLast7Days(event: any, dp: any) {
    this.datepicker = dp;
    this.fromDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 7);
    this.toDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 1);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectLst30Days(event: any, dp: any) {
    this.datepicker = dp;
    this.fromDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 30);
    this.toDate = this.calendar.getPrev(this.calendar.getToday(), 'd', 1);
    this.datepicker.navigateTo(this.fromDate);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectThisMonth(event: any, dp: any) {
    this.datepicker = dp;
    this.fromDate = this.calendar.getPrev(this.calendar.getToday(), 'd', this.calendar.getToday().day - 1);
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 1);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectLastMonth(event: any, dp: any) {
    this.datepicker = dp;
    let todayDate = new Date();
    let firstDay = new Date(todayDate.getFullYear(), todayDate.getMonth() - 1, 1);
    let lastDay = new Date(todayDate.getFullYear(), todayDate.getMonth(), 0);
    //setting start date of month
    this.fromDate.day = firstDay.getDate();
    this.fromDate.month = firstDay.getMonth() + 1;
    this.fromDate.year = firstDay.getFullYear();
    //setting last date of month
    this.toDate.day = lastDay.getDate();
    this.toDate.month = lastDay.getMonth() + 1;
    this.toDate.year = lastDay.getFullYear();
    this.datepicker.navigateTo(this.fromDate);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectThisYear(event: any, dp: any) {
    this.datepicker = dp;
    let todayDate = new Date();
    let firstDay = new Date(todayDate.getFullYear(), 0, 1);
    //setting start date of month
    this.fromDate.day = firstDay.getDate();
    this.fromDate.month = firstDay.getMonth() + 1;
    this.fromDate.year = firstDay.getFullYear();
    //setting last date of month
    this.toDate = this.calendar.getNext(this.calendar.getToday(), 'd', 0);
    this.datepicker.navigateTo(this.fromDate);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  selectLastYear(event: any, dp: any) {
    this.datepicker = dp;
    let todayDate = new Date();
    let firstDay = new Date(todayDate.getFullYear() - 1, 0, 1);
    let lastDay = new Date(todayDate.getFullYear() - 1, 11, 31);
    //setting start date of month
    this.fromDate.day = firstDay.getDate();
    this.fromDate.month = firstDay.getMonth() + 1;
    this.fromDate.year = firstDay.getFullYear();
    //setting last date of month
    this.toDate = this.calendar.getToday();
    this.toDate.day = lastDay.getDate();
    this.toDate.month = lastDay.getMonth() + 1;
    this.toDate.year = lastDay.getFullYear();
    this.datepicker.navigateTo(this.fromDate);
    this.dateRangeSelecetd.emit({
      fDate: this.formatter.format(this.fromDate),
      tDate: this.formatter.format(this.toDate),
      selectionType: event.srcElement.id
    });
    if (this.popover.isOpen()) this.popover.close();
    this.setBtnActiveStatus(event);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.placement && changes.placement.currentValue)
      this.defaultPlacement = changes.placement.currentValue;
    this.reset(changes.selectedDateRange.currentValue);
    if (this.openPopover) {
      setTimeout(() => {
        this.popover.open();
      }, 0);
      this.openPopover = false;
    }
  }

  selectCustomRange(event, dp) { }

  selectDummyButton(event, dp) {
    this.datepicker = dp;
    if (this.datepicker !== undefined) {
      this.datepicker.navigateTo(this.fromDate);
    }
  }

  //calendar selection events
  onDateSelection(date: NgbDate) {
    ++this.selectionCount;
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    //on custom range selection
    if (this.selectionCount % 2 == 0) {
      //if same date is selected twice
      if (this.toDate == null) {
        this.toDate = date;
      }
      //emitting data on date selection
      this.dateRangeSelecetd.emit({
        fDate: this.formatter.format(this.fromDate),
        tDate: this.formatter.format(this.toDate),
        selectionType: "CustomRange"
      });
    } else {
      let isCertainButtonAlreadyActive = document.getElementById("date-btn-group").querySelector(".btn-primary-active");
      // if a Button already has Class: .btn-primary-active
      if (isCertainButtonAlreadyActive) {
        isCertainButtonAlreadyActive.classList.remove("btn-primary-active");
      }
      if (document.getElementById("CustomRange"))
        document.getElementById("CustomRange").classList.add('btn-primary-active');
    }

  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || date.equals(this.toDate) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate, input: string): NgbDate {
    const parsed = this.formatter.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }

  daysInMonth(selectedYear: number, selectedMonth: number) {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }

  setBtnActiveStatus(event: any) {
    let clickedElement = event.target || event.srcElement;
    if (clickedElement.nodeName === "BUTTON") {
      let isCertainButtonAlreadyActive = clickedElement.parentElement.querySelector(".btn-primary-active");
      // if a Button already has Class: .btn-primary-active
      if (isCertainButtonAlreadyActive) {
        isCertainButtonAlreadyActive.classList.remove("btn-primary-active");
      }
      clickedElement.className += " btn-primary-active";
    }
  }

}