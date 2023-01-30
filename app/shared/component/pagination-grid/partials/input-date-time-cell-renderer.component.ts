import { Component, ViewChild, ElementRef, HostListener } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'input-date-time-cell-renderer',
  template:
    `<mat-form-field class="date-time-cell-render">
            <mat-label>{{placeHolder}}</mat-label>
            <input matInput #input [ngxMatDatetimePicker]="timePicker" [(ngModel)]="params.value"
            (click)="timePicker.open()">
            <mat-datepicker-toggle matSuffix [for]="timePicker">
                <mat-icon matDatepickerToggleIcon>arrow_drop_down</mat-icon>
            </mat-datepicker-toggle>
            <ngx-mat-datetime-picker #timePicker >
            </ngx-mat-datetime-picker>
        </mat-form-field>`,
  styles: [`.date-time-cell-render{
            border-radius: 4px !important;
            min-height:28px;
            height:28px;
        }
        ::ng-deep .date-time-cell-render>.mat-form-field-wrapper>.mat-form-field-flex{
            border-radius: 4px !important;
            line-height: 26px !important;
            font-size:inherit !important;
        }
        ::ng-deep .date-time-cell-render>.mat-form-field-wrapper>.mat-form-field-flex>
        .mat-form-field-infix>.mat-form-field-label-wrapper>.mat-form-field-label{
            top: 0.9em !important;
            color: #AAAAAA !important;
            padding-left: 10px;
        }
        ::ng-deep ngx-mat-datetime-content> .mat-calendar {
            width: 220px !important;
            height: 250px !important;
          }
          ::ng-deep .ngx-mat-timepicker table {
            margin-bottom: 0px;
          }
          ::ng-deep .ngx-mat-timepicker form .table .tbody tr td {
            text-align: center;
            padding: 0.15rem;
          }
          ::ng-deep .ngx-mat-timepicker > table > input.mat-input-element {
            padding-left: 0px !important;
          }
          ::ng-deep ngx-mat-datetime-content> .actions {
            padding: 0px !important;
          }
          ::ng-deep .ngx-mat-timepicker form .table .tbody tr td .mat-form-field .mat-form-field-infix input {
            padding: 0px !important;
            color: #007bff;
          }
          ::ng-deep .mat-calendar-body-selected {
            background-color: #007bff !important;
          }
          ::ng-deep .mat-calendar-controls {
            margin: 0px !important;
          }
          ::ng-deep .ngx-mat-timepicker form .table .tbody tr td .mat-form-field-wrapper {
            padding-bottom: 0.25rem !important;
          }
          ::ng-deep .mat-datepicker-content .time-container{
            padding-top: 0px;
          }`]
})
export class InputDateTimeCellRenderer implements ICellRendererAngularComp {
  public params: any;
  public placeHolder: any;
  @ViewChild('timePicker') public picker: any;

  @ViewChild('input') public input: any;
  constructor(private eRef: ElementRef) { }

  agInit(params: any): void {
    this.params = params;
    console.log(params);
    this.placeHolder = this.params.placeHolder;
  }
  refresh(): boolean {
    return false;
  }
  getValue(): any {
    try {
      return this.params.value.format('YYYY-MM-DDThh:mm:ss');
    } catch (Error) {
      return this.params.value;
    }
  }

  @HostListener('document:click', ['$event'])
  clickout(event) {
    if (this.eRef.nativeElement.contains(event.target) || event.target.closest("ngx-mat-datetime-content") !== null) {
      // console.log("clicked inside");
    } else {
      this.picker.close();
    }
  }
}