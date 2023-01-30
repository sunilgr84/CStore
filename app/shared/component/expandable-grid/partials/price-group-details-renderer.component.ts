import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonService } from '@shared/services/commmon/common.service';
import { GridOptions } from 'ag-grid-community';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
    <div class="justify-content-center row mt-1"> Price Book Linked Item Details </div>
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agGrid
                 style="width: 100%; height: 120px;"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="colDefs"
                 [rowData]="detailsRowData"
                 [suppressContextMenu]="true"
                 (gridReady)="onGridReady($event)"
                 [gridOptions]="gridOptions"
             >
            </ag-grid-angular>
            </div>


            <div class="justify-content-center row"> Carton Price Book Details </div>
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agGrid
                 style="width: 100%; height: 110px;"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="cartonPriceBookColDefs"
                 [rowData]="cartonPriceBookRowData"
                 [suppressContextMenu]="true"
                 (gridReady)="onGridReadyCartonPriceBook($event)"
                 [gridOptions]="gridOptions"
             >
            </ag-grid-angular>
            </div>`
    // [headerHeight]="0"
    // [domLayout]= "'autoHeight'"

})
// tslint:disable-next-line:component-class-suffix
export class PriceGroupDetailsCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agGrid') agGrid: any;
    masterGridCartonPriceApi: any;
    masterCartonPriceBookRowIndex: string;
    cartonPriceBookColDefs: { headerName: string; field: string; }[];
    cartonPriceBookRowData: any[];
    gridOptions: GridOptions;
    constructor(private commonService: CommonService) { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;

        this.masterGridCartonPriceApi = params.api;
        this.masterCartonPriceBookRowIndex = params.rowIndex;
        // this.colDefs = this.params.columnApi.columnController.columnDefs;
        // this.colDefs[5].hide =  this.colDefs[6].hide = this.colDefs[0].hide = true;
        // this.colDefs[1].hide = false;
        // this.colDefs[0].cellRenderer = null;
        this.colDefs = this.getColDefs();
        this.cartonPriceBookColDefs = this.getColDefsCartonPriceBook();
        this.getChildGridData(params.data.masterPriceBookItemID);
        this.gridOptions = <GridOptions>{
            headerHeight: 31,
        };
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs()
        };
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
        params.api.sizeColumnsToFit();
    }
    onGridReadyCartonPriceBook(params) {
        const detailGridId = 'detail_' + this.masterCartonPriceBookRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefsCartonPriceBook()
        };
        this.masterGridCartonPriceApi.addDetailGridInfo(detailGridId, gridInfo);
        params.api.sizeColumnsToFit();
    }
    getChildGridData(masterPriceBookItemID) {
        this.showGrid = false;
        this.detailsRowData = this.cartonPriceBookRowData = [];
        this.commonService.masterPriceGroupDetails.filter((x) => {
            if (x['masterPriceBookDetails'].masterPriceBookItemID === masterPriceBookItemID) {
                this.detailsRowData = x['masterPriceBookLinkedItemDetails'];
                this.cartonPriceBookRowData = x['masterCartonPriceBookDetails'] !== null ? x['masterCartonPriceBookDetails'] : [];
            }
        });
        this.showGrid = true;
    }

    getColDefs() {
        return [
            { headerName: 'UPC Code', field: 'upcCode' },
            { headerName: 'Description', field: 'description' },
            { headerName: 'Discount Amount', field: 'promoDiscountAmount' },
            // { headerName: 'linkedTypeDescription', field: 'linkedTypeDescription' },
        ];
    }
    getColDefsCartonPriceBook() {
        return [
            { headerName: 'UPC Code', field: 'upcCode' },
            { headerName: 'Description', field: 'description' },
            // { headerName: 'Discount Amount', field: 'promoDiscountAmount' },
        ];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const cartonPriceGridId = 'detail_' + this.masterCartonPriceBookRowIndex;
        // ag-Grid is automatically destroyed
        console.log('removing detail grid info with id: ', detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
        this.masterGridCartonPriceApi.removeDetailGridInfo(cartonPriceGridId);
    }
}
