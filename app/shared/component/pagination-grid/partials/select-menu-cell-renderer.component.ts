import { Component, ViewChild } from "@angular/core";
import { ICellRendererAngularComp } from 'ag-grid-angular';


@Component({
    selector: 'select-menu-cell-renderer',
    template:
        `<ng-select #input  appendTo="body" class="select-menu-custom-renderer" [items]="selectionList" [hideSelected]="true"
            bindLabel="{{bindLabel}}" bindValue="{{bindValue}}" placeholder="{{placeHolder}}"
            [(ngModel)]="selectedId" (change)="onChange($event)">
        </ng-select>`,
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
export class SelectMenuCellRenderer implements ICellRendererAngularComp {

    @ViewChild('input') input: any;

    public params: any;
    public gridApi: any;
    public rowIndex: any;
    public selectionList: any = [];
    public bindLabel: any;
    public bindValue: any;
    public selectedId: any;
    public placeHolder: any = "";

    agInit(params: any): void {
        this.params = params;
        this.gridApi = params.api;
        this.rowIndex = params.rowIndex;
        this.bindLabel = this.params.bindLabel;
        this.bindValue = this.params.bindValue;
        this.selectionList = this.params.selectionList;
        this.selectedId = this.params.selectedId;
        this.placeHolder = this.params.placeHolder;
    }
    refresh(): boolean {
        return false;
    }
    onChange(event) {
        this.params.value = event[this.bindValue];
    }

    getValue(): any {
        return this.params.value;
    }
    focusIn() {
        this.input.nativeElement.focus();
    }

}