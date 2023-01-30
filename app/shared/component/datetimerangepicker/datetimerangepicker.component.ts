import { Component, OnInit, ViewChild, Output, Input, EventEmitter, HostListener, ElementRef, OnChanges } from '@angular/core';
import { NgbPopover, NgbDatepicker, NgbCalendar, NgbDate, NgbTimepicker, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-datetimerangepicker',
  templateUrl: './datetimerangepicker.component.html',
  styleUrls: ['./datetimerangepicker.component.scss']
})
export class DatetimerangepickerComponent implements OnInit, OnChanges {

  constructor(private calendar: NgbCalendar, public formatter: NgbDateParserFormatter, private eRef: ElementRef) {
    this.fromDate = calendar.getToday();
    this.toDate = calendar.getToday();
    var todayFromDate = new Date();
    todayFromDate.setHours(0, 0, 0, 0);
    var todayToDate = new Date();
    todayToDate.setHours(23, 59, 59, 0);
    this.fromTime = todayFromDate;
    this.toTime = todayToDate;
  }
  @Output() dateTimeRangeSelected = new EventEmitter<{ fDate: string, fTime: string, tDate: string, tTime: string }>();
  @Input('selectedDateTimeRange') selectedDateTimeRange: any;
  @Input('openPopover') openPopover: any;
  startDate: any;
  endDate: any;
  @ViewChild('popOver') public popover: NgbPopover;
  @ViewChild('fromDP') fromDP: NgbDatepicker;
  @ViewChild('toDP') toDP: NgbDatepicker;
  fromDate: NgbDate;
  toDate: NgbDate;
  @ViewChild('fromTP') fromTP: NgbTimepicker;
  @ViewChild('toTP') toTP: NgbTimepicker;
  fromTime: any;
  toTime: any;

  ngOnInit() {
  }

  ngOnChanges() {
    if (this.openPopover) {
      setTimeout(() => {
        this.popover.open();
      }, 0);
      this.openPopover = false;
    }
  }

  ok() {
    this.dateTimeRangeSelected.emit({
      fDate: this.formatter.format(this.fromDate),
      fTime: ("0" + this.fromTime.getHours()).slice(-2) + ":" + ("0" + this.fromTime.getMinutes()).slice(-2) + ":" + ("0" + this.fromTime.getSeconds()).slice(-2),
      tDate: this.formatter.format(this.toDate),
      tTime: ("0" + this.toTime.getHours()).slice(-2) + ":" + ("0" + this.toTime.getMinutes()).slice(-2) + ":" + ("0" + this.toTime.getSeconds()).slice(-2),
    });
    this.popover.close();
  }

  cancel() {
    this.popover.close();
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target) || event.target.closest("ngb-popover-window") !== null) {
      //events for clicking inside
    } else if (this.popover.isOpen()) {
      this.dateTimeRangeSelected.emit({
        fDate: this.formatter.format(this.fromDate),
        fTime: ("0" + this.fromTime.getHours()).slice(-2) + ":" + ("0" + this.fromTime.getMinutes()).slice(-2) + ":" + ("0" + this.fromTime.getSeconds()).slice(-2),
        tDate: this.formatter.format(this.toDate),
        tTime: ("0" + this.toTime.getHours()).slice(-2) + ":" + ("0" + this.toTime.getMinutes()).slice(-2) + ":" + ("0" + this.toTime.getSeconds()).slice(-2),
      });
      this.popover.close();
    }
  }

}
