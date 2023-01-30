import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agTankDetails
                 style="width: 100%; height: 90px;"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="colDefs"
                 [rowData]="detailsRowData"
                 [suppressContextMenu]="true"
                 (gridReady)="onGridReady($event)"
             >
            </ag-grid-angular>
            </div>`

})
// tslint:disable-next-line:component-class-suffix
export class TankDetailCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agTankDetails') agGrid: any;

    constructor() { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        params.api.sizeColumnsToFit();
        this.masterRowIndex = params.rowIndex;
        this.colDefs = this.params.columnApi.columnController.columnDefs;
        this.colDefs[7].hide = true;
        this.getChildGridData(params.data);
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.params.columnApi
        };
        params.api.sizeColumnsToFit();
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
    }
    getChildGridData(data) {
        this.showGrid = true;
        this.detailsRowData = data && [data.connectedStoreTankDetail];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        console.log('removing detail grid info with id: ', detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
}
