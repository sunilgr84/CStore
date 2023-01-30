import { Component, OnDestroy, ViewChild } from '@angular/core';

import {
    ICellRendererAngularComp
} from 'ag-grid-angular';

import {
    TestService
} from '@shared/services/test/test.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
    selector: 'app-fuel-invoice-cell-renderer',
    template: ` 
    
        <ag-grid-angular #agGridfuelDetail style="height:100px"
            id="agGridfuelDetail"
            class=""
            [columnDefs]="colDefs"
            [rowData]="detailsRowData"
            [headerHeight]="0"
            [gridOptions]="gridOptions"
            (gridReady)="onGridReady($event)">
        </ag-grid-angular>
        <div class="row mt-2" style="font-size: 14px;font-weight: bold;">
            <label class="text-right" style="width: 50.3%;">
                <label class="col-sm-6">
                    SUB-TOTAL FOR : {{ (params?.data?.storeFuelGradeName)  }} 
                </label>
                <label class="col-sm-6">
                    Average Unit Price
                </label>
            </label>
            <label class="" style="width: 15%;">{{subtotalUnitPrice ? utilityService.formatSevenDecimal(subtotalUnitPrice) : ''}}</label>
            <label class="col-sm-2">{{params?.data?.ta ? utilityService.formatDecimalCurrency(params?.data?.ta) : '' }}</label>
        </div>
    `
   // ,styles: ['.ag-cell { border: none !important;}']
}

)
// tslint:disable-next-line:component-class-suffix
export class FuelInvoiceCellRender implements ICellRendererAngularComp,
    OnDestroy {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    quantity = 0;
    gridOptions = {}
    subtotalUnitPrice = 0
    
    @ViewChild('agGrid') agGrid: any;

    constructor(private testService: TestService, private dataService: SetupService,
        public utilityService: UtilityService) { 
        this.gridOptions["rowStyle"] = { border: '0px'};
    }

    agInit(params: any): void {
        // console.log(params);
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        this.quantity = params.data.quantityReceived;
        this.colDefs = this.getColDefs();
        this.getChildGridData(params.data);
        this.calculateSubTotalUnitPrice();
    }
    calculateSubTotalUnitPrice() {
        if (this.params && this.params.data && this.params.data.taxData) {
            let sumOfFuelTaxRate = 0;
            let numberOfTaxes = 0;
            this.params.data.taxData.forEach(tax => {
                sumOfFuelTaxRate = sumOfFuelTaxRate + tax.fuelTaxRate;
                numberOfTaxes = numberOfTaxes + 1;
            });

            if (this.params.data && this.params.data.unitCostPrice) {
                sumOfFuelTaxRate = sumOfFuelTaxRate + this.params.data.unitCostPrice;
                numberOfTaxes = numberOfTaxes + 1;
            }
            if (numberOfTaxes && sumOfFuelTaxRate) {
                this.subtotalUnitPrice = sumOfFuelTaxRate / numberOfTaxes;
            }
        }
    }
    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;

        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs()
        }        
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
        
        params.api.sizeColumnsToFit();

       
    }

    getChildGridData(data) {
        this.detailsRowData = data.taxData ? data.taxData : [];
        //this.detailsRowData =this.detailsRowData .concat(this.detailsRowData );
        //this.detailsRowData =this.detailsRowData .concat(this.detailsRowData );

        // this.masterGridApi.getRowHeight = function (params) {
        //     var isDetailRow = params.node.detail;
        
        //     // for all rows that are not detail rows, return nothing
        //     if (!isDetailRow) { return undefined; }
        
        //     // otherwise return height based on number of rows in detail grid
        //     var detailPanelHeight = params.data.children.length * 50;
        //     return detailPanelHeight;
        // }
    }

    getColDefs() {
        return [{
            headerName: 'Description', field: 'taxDescription'
        },
        {
            headerName: 'Quantity',
            field: ''
        },
        {
            headerName: 'Basis',
            field: 'qr',
            cellRenderer: (params) => {
                return this.utilityService.formatDecimalCurrency(params.value);
            }
        },
        {
            headerName: 'Price',
            field: 'fuelTaxRate',
            cellRenderer: (params) => {
                return this.utilityService.formatSevenDecimal(params.value);
            }
        },
        {
            headerName: 'Amount',
            field: 'tta',
            cellRenderer: (params) => {
                return this.utilityService.formatDecimalCurrency(params.value);
            }
        },
        {
            headerName: '', field: 'dummy'
        },
        ];
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        // ag-Grid is automatically destroyed
        // console.log('removing detail grid info with id: ', detailGridId);
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }
}
