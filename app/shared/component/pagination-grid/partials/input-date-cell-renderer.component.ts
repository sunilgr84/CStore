import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'input-date-cell-renderer',
    template:
        `<mat-form-field class="date-cell-render">
            <mat-label>{{placeHolder}}</mat-label>
            <input [(ngModel)]="params.value" (click)="picker.open()" matInput [min]="minDate" [matDatepicker]="picker">
            <mat-datepicker-toggle matSuffix [for]="picker">
                <mat-icon matDatepickerToggleIcon>arrow_drop_down</mat-icon>
            </mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>`,
    styles: [
        `.date-cell-render{
            border-radius: 4px !important;
            min-height:28px;
            height:28px;
        }
        ::ng-deep .date-cell-render>.mat-form-field-wrapper>.mat-form-field-flex{
            border-radius: 4px !important;
            line-height: 26px !important;
            font-size:inherit !important;
        }
        ::ng-deep .date-cell-render>.mat-form-field-wrapper>.mat-form-field-flex>
        .mat-form-field-infix>.mat-form-field-label-wrapper>.mat-form-field-label{
            top: 0.9em !important;
            color: #AAAAAA !important;
            padding-left: 10px;
        }`
    ]
})
export class InputDateCellRenderer implements ICellRendererAngularComp {
    public params: any;
    public placeHolder: any;
    public minDate = null;
    agInit(params: any): void {
        this.params = params;
        if(this.params.minDate)
            this.minDate = this.params.minDate;
        this.placeHolder = this.params.placeHolder;
    }
    refresh(): boolean {
        return false;
    }
    getValue(): any {
        return this.params.value;
    }
}