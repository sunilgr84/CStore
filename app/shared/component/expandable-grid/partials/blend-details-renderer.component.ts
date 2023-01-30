import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';

@Component({
    selector: 'app-detail-cell-renderer',
    template: `
        <div class="master-details" *ngIf="showGrid">
             <ag-grid-angular
                 #agGridBlend
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
export class BlendDetailCellRenderer implements ICellRendererAngularComp, OnDestroy {
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    @ViewChild('agGridBlend') agGrid: any;

    constructor(private dataService: SetupService) { }

    agInit(params: any): void {
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        this.colDefs = this.getColDefs();
        this.getChildGridData(params.data.storeFuelGradeID);
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs()
        };
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
    }
    getChildGridData(storeFuelGradeId) {
        this.showGrid = false;
        this.dataService.getData('StoreFuelGradeBlend/get/' + storeFuelGradeId)
            .subscribe((response) => {
                this.detailsRowData = [response];
                this.showGrid = true;
            });
    }

    getColDefs() {
        return [
            { headerName: 'Primary Fuel Blend', field: 'primaryFuelGradeBlendID' },
            { headerName: 'Primary Percentage', field: 'primaryFuelBlendPercentage' },
            { headerName: 'Secondary Fuel Blend', field: 'secondaryFuelGradeBlendID' },
            { headerName: 'Secondary Percentage', field: 'secondaryFuelBlendPercentage' },
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
