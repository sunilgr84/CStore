import { Component, OnDestroy, OnInit, EventEmitter, Output } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { CellActionRenderer } from '@shared/component/editable-grid/partials/cell-action-renderer.component';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '@shared/services/commmon/common.service';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
    selector: 'app-group-detail-cell-renderer',
    template: ` 
    <div [ngStyle]="childGridOverlayHeight" *ngIf="showGrid">
    <ag-grid-angular
        id="detailGrid"
        style="width:100%;"
        [columnDefs]="colDefs"
        [rowData]="detailsRowData"
        [suppressContextMenu]="true"
        [editType]="editType"
        (gridReady)="onGridReady($event)"
        (cellClicked)="onCellClickedDetailGrid($event)"
        [frameworkComponents]="frameworkComponents"
        class="ag-theme-material  master-details full-width-grid"
        [gridOptions]="gridOptions"  [enableColResize]="true"
    >
   </ag-grid-angular>
  </div>`, styles: [`
  ::ng-deep .fixed-height .ag-full-width-row{
      overflow: auto !important;
  }
  .master-details .full-width-grid {
    // padding: 0;
 }`]
})
// tslint:disable-next-line:component-class-suffix
export class GroupDetailCellRenderer implements ICellRendererAngularComp, OnDestroy, OnInit {
    // called on init
    params: any;
    masterGridApi: any;
    masterRowIndex: any;
    colDefs: any;
    detailsRowData: any;
    showGrid = false;
    gridType: any = '';
    parentRowData: any = '';
    gridOptions: any;
    gridApi: any;
    frameworkComponents: any;
    childGridOverlayHeight: any;
    constructor(private constantService: ConstantService, private setupService: SetupService, private confirmationDialogService: ConfirmationDialogService,
        private spinner: NgxSpinnerService, private toastr: ToastrService, private commonService: CommonService,
        private utilityService: UtilityService) {
        this.commonService.getCellChange().subscribe(data => {
            if (this.gridType === 'itemListChildGrpGridChildGrid' || this.gridType === 'itemListOverlayGrpGridChildGrid') {
                this.gridApi.setQuickFilter(data);
                this.gridApi.sizeColumnsToFit();
            }
        });
    }

    ngOnInit() {
        this.gridOptions = <GridOptions>{
            rowHeight: 30,
            headerHeight: 30,
            domLayout: 'autoHeight',
            overlayNoRowsTemplate: 'No rows to display',
        };
    }

    agInit(params: any): void {
        this.gridType = params.context.componentParent.paginationGridOptions.childGridType;
        if (this.gridType === 'itemListOverlayGrpGridChildGrid' || this.gridType === 'itemListChildGrpGridChildGrid') {
            this.childGridOverlayHeight = {
                'height': '150px',
                'overflow-y': 'auto'
            };
        } else
            this.childGridOverlayHeight = '';
        this.parentRowData = params.data;
        this.params = params;
        this.masterGridApi = params.api;
        this.masterRowIndex = params.rowIndex;
        this.frameworkComponents = {
            CellActionRenderer: CellActionRenderer
        };
        this.colDefs = this.getColDefs();
        this.getChildGridData();
    }

    onGridReady(params) {
        const detailGridId = 'detail_' + this.masterRowIndex;
        const gridInfo = {
            id: detailGridId,
            api: params.api,
            columnApi: this.getColDefs(),
            context: {
                componentParent: this
            }
        };
        this.gridApi = params.api;
        this.masterGridApi.addDetailGridInfo(detailGridId, gridInfo);
        params.api.sizeColumnsToFit();
    }
    getChildGridData() {
        this.showGrid = false;
        switch (this.gridType) {
            case this.constantService.gridTypes.itemListChildGrpGridChildGrid:
                return this.itemListGrpChildGridRowData();
            case this.constantService.gridTypes.itemListOverlayGrpGridChildGrid:
                return this.itemListGrpChildGridRowData();
        }
    }

    getColDefs() {
        switch (this.gridType) {
            case this.constantService.gridTypes.itemListChildGrpGridChildGrid:
                return this.itemListChildGrpGridChildGridCol();
            case this.constantService.gridTypes.itemListOverlayGrpGridChildGrid:
                return this.itemListChildGrpGridChildGridCol();
        }
    }

    // called when the cell is refreshed
    refresh(params: any): boolean {
        return false;
    }

    itemListChildGrpGridChildGridCol() {
        if (this.parentRowData.companyPriceGroupID) {
            if (this.parentRowData.storeLocationID === null) {
                return [
                    { headerName: 'UPC Code', field: 'upcCode', suppressSizeToFit: true, width: 180, },
                    { headerName: 'Description', field: 'description' }
                ];
            }
            else if (this.parentRowData.storeLocationID != null) {
                return [
                    { headerName: 'UPC Code', field: 'upcCode' },
                    { headerName: 'Description', field: 'description' },
                    {
                        headerName: 'Selling Price', field: 'regularSellPrice', cellRenderer: (params) => {
                            return this.utilityService.formatDecimalCurrency(params.value);
                        },
                        cellClass: 'text-right',
                        headerClass: 'header-text-center'
                    }
                ];
            }
        } else {
            if (this.parentRowData.storeLocationID === null) {
                return [
                    { headerName: 'UPC Code', field: 'upcCode', suppressSizeToFit: true, width: 180, },
                    { headerName: 'Description', field: 'description' },
                    {
                        headerName: 'Actions', field: '', suppressSizeToFit: true, width: 120, cellRenderer: 'CellActionRenderer',
                        cellRendererParams: {
                            hideEditAction: true, isSaveRequired: false, hideDeleteAction: false,
                            context: {
                                componentParent: this
                            }
                        },
                    }
                ];
            }
            else if (this.parentRowData.storeLocationID != null) {
                return [
                    { headerName: 'UPC Code', field: 'upcCode' },
                    { headerName: 'Description', field: 'description' },
                    {
                        headerName: 'Selling Price', field: 'regularSellPrice', cellRenderer: (params) => {
                            return this.utilityService.formatDecimalCurrency(params.value);
                        },
                        cellClass: 'text-right',
                        headerClass: 'header-text-center'
                    },
                    {
                        headerName: 'Actions', field: '', cellRenderer: 'CellActionRenderer',
                        cellRendererParams: {
                            hideEditAction: true, isSaveRequired: false, hideDeleteAction: false,
                            context: {
                                componentParent: this
                            }
                        },
                    }
                ];
            }
        }
    }

    itemListGrpChildGridRowData() {
        if (this.parentRowData.companyPriceGroupID === null) {
            this.detailsRowData = this.parentRowData.childGridData;
            this.showGrid = true;
        } else {
            if (this.parentRowData.storeLocationID === null) {
                this.setupService.getData('Item/GetAllItemsByPriceGroupID/' + this.parentRowData.companyPriceGroupID).subscribe(
                    (res) => {
                        this.detailsRowData = res;
                        this.showGrid = true;
                    }, (error) => {
                        console.log(error);
                    }
                );
            }
            else if (this.parentRowData.storeLocationID != null) {
                this.setupService.getData('Promotion/ItemList/GetListPriceGroupDetailsByItemListID?ItemListID=' + this.parentRowData.itemListID + '&StorelocationID=' + this.parentRowData.storeLocationID).subscribe(
                    (res) => {
                        this.detailsRowData = [...res];
                        this.showGrid = true;
                    }, (error) => {
                        console.log(error);
                    }
                );
            }

        }
    }

    ngOnDestroy(): void {
        const detailGridId = 'detail_' + this.masterRowIndex;
        this.masterGridApi.removeDetailGridInfo(detailGridId);
    }

    /**
   * For Cell Action Renderer
   * Delete action performed
   * @param params - deleted row data
   */
    delAction(params) {
        this.confirmationDialogService.confirm(this.constantService.infoMessages.confirmTitle,
            this.constantService.infoMessages.confirmMessage)
            .then(() => {
                this.setupService.deleteData(`Promotion/itemListItem/delete/` + params.data.itemListItemID).subscribe(result => {
                    this.spinner.hide();
                    if (result === '0') {
                        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
                    } else if (result === '1') {
                        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
                        const allNodesData = Array<any>()
                        this.gridApi.forEachNode((node, i) => {
                            if (params.rowIndex !== parseInt(node.id)) {
                                allNodesData.push(node.data);
                            }
                        });
                        this.gridApi.setRowData(allNodesData);
                    }
                }, error => {
                    this.spinner.hide();
                    this.toastr.error(this.constantService.infoMessages.contactAdmin);
                });
            }).catch(() => console.log('User dismissed the dialog'));
    }

    onCellClickedDetailGrid(params) {
        console.log(params);
        if (params.colDef.field === "upcCode" || params.colDef.field === "posCodeWithCheckDigit") {
            this.utilityService.copyText(params.value);
            this.toastr.success('UPC Code Copied');
        }
        if (params.colDef.field === "description") {
            this.utilityService.copyText(params.value);
            this.toastr.success('Description Copied');
        }
    }
}
