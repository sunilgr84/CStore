import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agLinkItem
                 style="width: 100%; height: 150px;"
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
export class MasterLinkedItemCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agLinkItem') agGrid: any;

    constructor() { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        //  params.api.sizeColumnsToFit();
        this.masterRowIndex = params.rowIndex;
        this.colDefs = this.getColDefs();
        //   this.colDefs[7].hide = true;
        this.getChildGridData(params.data);
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;

        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs()
        }

            ;
        params.api.sizeColumnsToFit();
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
    }
    getChildGridData(data) {
        this.showGrid = true;
        this.detailsRowData = data && [data.masterLinkedItemdata][0];
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
    getColDefs() {
        return [
            { headerName: 'UPC Code', field: 'posCode', editable: true, width: 150, headerClass: 'header-text-wrap' },
            { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap' },
            { headerName: 'linkItemID', field: 'linkItemID', hide: true },
            {
                headerName: 'Link Type', field: 'linkedTypeDescription', editable: true
                , headerClass: 'header-text-wrap'
            },
            {
                headerName: 'Discount', field: 'promoDiscountAmount', editable: true, headerClass: 'header-text-wrap',
                cellEditor: 'numericEditor'
            }
        ];
    }
}
