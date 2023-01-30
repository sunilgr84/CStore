import { Component } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    selector: 'date-time-select-menu-cell-renderer',
    template:
        `<div class="row"  *ngIf="!showRangePicker">
            <div class="col-md-10">
                <ng-select appendTo="body" class="select-menu-custom-renderer" [items]="selectionList" [hideSelected]="true"
                    bindLabel="{{bindLabel}}" bindValue="{{bindValue}}" placeholder="{{placeHolder}}"
                    [(ngModel)]="selectedId" (change)="onChange($event)">
                </ng-select>
            </div>
            <div class="col-md-2">
                <i class="fa fa-edit float-left pt-2 pr-2" title="Edit" (click)="onEdit($event)"></i>
            </div>
        </div>
        <div *ngIf="showRangePicker">
            <app-daterangepicker [selectedDateRange]="selectedDateRange"
            (dateRangeSelecetd)="dateTimeRangeChange($event)"></app-daterangepicker>
        </div>`,
    styles: [
        `.ng-select.select-menu-custom-renderer ::ng-deep .ng-select-container {
                border-radius: 4px !important;
                min-height:28px;
                height:28px;
            }
            .ng-select.select-menu-custom-renderer.ng-touched  ::ng-deep .ng-has-value,.ng-select.select-menu-custom-renderer.ng-touched  ::ng-deep .ng-select-container{
                padding-top:15px;
            }`
    ]
})
export class DateTimeSelectMenuCellRenderer implements ICellRendererAngularComp {

    public params: any;
    public gridApi: any;
    public rowIndex: any;
    public selectionList: any = [];
    public bindLabel: any;
    public bindValue: any;
    public selectedId: any;
    public placeHolder: any = "";

    selectedDateRange: any;
    openPopover: any;

    showRangePicker: any;

    agInit(params: any): void {
        this.params = params;
        this.gridApi = params.api;
        this.rowIndex = params.rowIndex;
        this.bindLabel = this.params.bindLabel;
        this.bindValue = this.params.bindValue;
        this.selectionList = this.params.selectionList;
        this.selectedId = this.params.selectedId;
        this.placeHolder = this.params.placeHolder;
        if (this.params.showRangePicker) {
            this.showRangePicker = this.params.showRangePicker;
        } else {
            this.showRangePicker = false;
        }
    }
    refresh(): boolean {
        return false;
    }
    onChange(event) {
        this.params.value = event[this.bindValue];
    }

    getValue(): any {
        // let rowNode = this.gridApi.getRowNode(this.rowIndex);
        // rowNode.setDataValue(this.bindValue, this.params.data[this.bindValue]);
        return this.params.value;
    }

    onEdit(event: any) {
        this.showRangePicker = true;
    }

    dateTimeRangeChange(event: any) {
        this.selectedDateRange = _.cloneDeep(event);
        let beginDate = this.selectedDateRange.fDate;
        let endDate = this.selectedDateRange.tDate;
        this.params.value = beginDate + " - " + endDate;
    }
}