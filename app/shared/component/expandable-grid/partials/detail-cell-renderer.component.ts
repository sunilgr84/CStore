import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agGrid
                 style="width: 100%; height: 130px;"
                 id="detailGrid"
                 class="full-width-grid"
                 [columnDefs]="colDefs"
                 [rowData]="detailsRowData"
                 [suppressContextMenu]="true"
                 (gridReady)="onGridReady($event)"
             >
            </ag-grid-angular>
            </div>`
    // [headerHeight]="0"
    // [domLayout]= "'autoHeight'"

})
// tslint:disable-next-line:component-class-suffix
export class DetailCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agGrid') agGrid: any;

    constructor(private dataService: SetupService) { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        // this.colDefs = this.params.columnApi.columnController.columnDefs;
        // this.colDefs[5].hide =  this.colDefs[6].hide = this.colDefs[0].hide = true;
        // this.colDefs[1].hide = false;
        // this.colDefs[0].cellRenderer = null;
        this.colDefs = this.getColDefs();
        this.getChildGridData(params.data.companyID);
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs()
        };
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
        // params.api.sizeColumnsToFit();
    }
    getChildGridData(companyId) {
        this.showGrid = false;
        this.dataService.getData('StoreLocation/GetStoresDetailsByCompanyId/' + companyId)
            .subscribe((response) => {
                this.detailsRowData = response;
                // this.params.api.gridOptionsWrapper.gridOptions.detailRowHeight = (this.detailsRowData.length * 30) + 50;
                this.showGrid = true;
            });
    }

    getColDefs() {
        return [
            { headerName: 'Store Name', field: 'storeFullName' },
            { headerName: 'Store Address', field: 'storeAddressLine1' },
            { headerName: 'City', field: 'city' },
            { headerName: 'State', field: 'stateCode' },
            { headerName: 'Phone Number', field: 'phoneNo' }
        ];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        // ag-Grid is automatically destroyed
        console.log('removing detail grid info with id: ', detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
}
