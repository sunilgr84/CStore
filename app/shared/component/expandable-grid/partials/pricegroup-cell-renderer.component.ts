import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agPriceGroup
                 style="width: 100%; height: 500px;"
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
export class PriceGroupCellRenderer implements ICellRendererAngularComp, OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agPriceGroup') agGrid: any;

    constructor(private dataService: SetupService) { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        this.colDefs = this.getColDefs();
        this.getChildGridData(params.data.companyPriceGroupID);
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
    getChildGridData(companyPriceGroupID) {
        this.showGrid = false;
        // this.detailsRowData = data && [data.connectedStoreTankDetail];
        this.dataService.getData('ItemPriceGroup/GetByPriceGroupID/' + companyPriceGroupID)
            .subscribe((response) => {
                this.detailsRowData = response;
                // this.params.api.gridOptionsWrapper.gridOptions.detailRowHeight = (this.detailsRowData.length * 30) + 50;
                this.showGrid = true;
            });
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }
    getColDefs() {
        return [
            { headerName: 'UPC Code', field: 'posCode' },
            { headerName: 'Description', field: 'description' }
        ];
    }
    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        console.log('removing detail grid info with id: ', detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
}
