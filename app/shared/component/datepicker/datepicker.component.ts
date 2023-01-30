import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as moment from 'moment';
import { MatDatepickerInputEvent } from '@angular/material';

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ]
})
export class DatepickerComponent implements OnInit, OnChanges {
  // maxDate = null;
  myplaceHolder = null;
  date: any;
  @Input() inputDate?: any;
  @Input() isMaxDate?: any;
  @Input() maxDate?: any;
  @Output() dateChange: EventEmitter<any> = new EventEmitter();
  @Input() disabled?: any = false;

  constructor() { }

  ngOnInit() {
    this.appDateChanges();
  }

  ngOnChanges() {
    this.appDateChanges();
  }
  dateChangeEvent(event: MatDatepickerInputEvent<Date>) {
    const date = event.value && event.value['_d'];
    const emitObj = {
      date: date,
      formatedDate: moment(date).format('MM-DD-YYYY'),
      objInstance: event
    };
    this.dateChange.emit(emitObj);
  }

  appDateChanges() {
    this.inputDate = this.inputDate ? new Date(this.inputDate) : '';
    this.maxDate = this.maxDate ? new Date(this.maxDate) : this.isMaxDate ? new Date() : null;
    const day = moment(this.inputDate, 'MM-DD-YYYY').date();
    const month = moment(this.inputDate, 'MM-DD-YYYY').month();
    const year = moment(this.inputDate, 'MM-DD-YYYY').year();
    this.date = new FormControl(moment([year, month, day]));
    if (JSON.parse(this.disabled)) {
      this.date.disable();
    }
  }

}
