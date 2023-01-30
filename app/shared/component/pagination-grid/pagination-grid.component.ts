import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { CellActionRenderer } from '../editable-grid/partials/cell-action-renderer.component';
import { ToggleRenderer } from './partials/toggle-renderer.component';
import { ChildSaveButtonComponent } from '../expandable-grid/partials/childSaveButton.component';
import { CellActionComponent } from '../cstore-grid/partials/cell-action/cell-action.component';
import { SaveButtonComponent } from '../expandable-grid/partials/save-button.component';
import { SelectMenuCellRenderer } from './partials/select-menu-cell-renderer.component';
import { InputDateCellRenderer } from './partials/input-date-cell-renderer.component';
import { DecimalEditor, DecimalWithDollarEditor } from '../editable-grid/partials/decimal.editor.component';
import { OnlyNumericEditor } from '../editable-grid/partials/onlynumber-editor.component';
import { InputDateTimeCellRenderer } from './partials/input-date-time-cell-renderer.component';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ScanDataActionsCellRenderer } from './partials/scan-data-actios-cell-renderer.component';
import { VendorInvoiceActionsCellRenderer } from './partials/vendor-invoice-actions-cell-renderer.component';
import { VendorInvoiceCellRenderer } from './partials/vendor-invoice-cell-renderer.component';
import { SelectRenderer } from '../expandable-grid/partials/select.component';
import { ChildSelectRenderer } from '../expandable-grid/partials/childselect.component';
import { ChildInputRenderer } from '../expandable-grid/partials/childinput.component';
import { DateTimeSelectMenuCellRenderer } from './partials/date-time-selectmenu-cell-renderer.component';
import { SixDecimalNumericEditor } from '../editable-grid/partials/sixdecimal.editor.component';
import { BillOfLadingActionsCellRenderer } from './partials/bill-of-lading-actions-cell-renderer.component';
import { FuelInvoiceActionsCellRenderer } from './partials/fuel-invoice-action-cell-renderer.component';
import { ItemUPCDetailsCellRenderer } from './partials/item-detail-cell-renderer.component';
import { ScanDataStoreNameCellRenderer } from './partials/scan-data-store-name-cell-renderer.component';
import { ScanDataAckStatusCellRenderer } from './partials/scan-data-ack-status-cell-renderer.component';
import { ScanDataNoOfAtteptsCellRenderer } from './partials/scan-data-no-of-attempts-cell-renderer.component';

@Component({
  selector: 'app-pagination-grid',
  templateUrl: './pagination-grid.component.html',
  styleUrls: ['./pagination-grid.component.scss']
})
export class PaginationGridComponent implements OnInit {

  constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService) { }

  @Input() paginationGridOptions?: any;
  @Input() isPageSizeShow?: boolean;
  @Input() rowData: any = [];
  @Output() rowSelected: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() view: EventEmitter<any> = new EventEmitter();
  @Output() print: EventEmitter<any> = new EventEmitter();
  @Output() cellClicked: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() recover: EventEmitter<any> = new EventEmitter();
  @Output() suspend: EventEmitter<any> = new EventEmitter();
  @Output() history: EventEmitter<any> = new EventEmitter();
  @Output() activity: EventEmitter<any> = new EventEmitter();
  @Output() rowEditingStopped: EventEmitter<any> = new EventEmitter();

  @Output() refresh: EventEmitter<any> = new EventEmitter();
  @Output() download: EventEmitter<any> = new EventEmitter();
  @Output() review: EventEmitter<any> = new EventEmitter();
  @Output() submit: EventEmitter<any> = new EventEmitter();
  @Output() columnResized: EventEmitter<any> = new EventEmitter();

  @Output() cellValueChanged: EventEmitter<any> = new EventEmitter();
  @Input() detailCellRenderers: any;
  gridOptions: any;
  sideBar: any;
  gridApi: any;
  isCancel: boolean;
  detailCellRendererParams: any;
  detailCellRenderer: any;
  getRowHeight: any;
  // pagination
  paginationPageSize: number;
  currentPage = 1;
  totalPageCount: number;
  isPaginationShow: boolean;
  filterText: string;
  isSearchTextBoxRequired: boolean;
  currentPageSize = 0;
  suppressContextMenu = false;
  selectedPageSize = null;
  pageSizeList = [{ key: '5', value: 5 }, { key: '10', value: 10 },
  { key: '25', value: 25 }, { key: '50', value: 50 }, { key: '100', value: 100 }];
  ngOnInit() {
    this.selectedPageSize = this.paginationGridOptions.paginationPageSize ? this.paginationGridOptions.paginationPageSize : 10;
    this.isCancel = true;
    this.detailCellRenderer = 'myDetailCellRenderer';
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      rowData: this.rowData,
      defaultColDef: {
        suppressMovable: true,
        suppressMenu: this.paginationGridOptions.isSuppressMenu ? this.paginationGridOptions.isSuppressMenu : false,
        autoHeight: this.paginationGridOptions.autoHeight ? this.paginationGridOptions.autoHeight : false
      },
      columnDefs: this.paginationGridOptions.columnDefs,
      frameworkComponents: {
        CellRenderer: CellActionComponent,
        saveCellRenderer: ChildSaveButtonComponent,
        myDetailCellRenderer: this.detailCellRenderers,
        CellActionRenderer: CellActionRenderer,
        toggleRenderer: ToggleRenderer,
        SaveButtonComponent: SaveButtonComponent,
        selectMenuCellRenderer: SelectMenuCellRenderer,
        inputDateCellRenderer: InputDateCellRenderer,
        inputDateTimeCellRenderer: InputDateTimeCellRenderer,
        decimalEditor: DecimalEditor,
        decimalWithDollarEditor: DecimalWithDollarEditor,
        onlyNumericEditor: OnlyNumericEditor,
        scanDataActionsCellRenderer: ScanDataActionsCellRenderer,
        scanDataStoreNameCellRenderer: ScanDataStoreNameCellRenderer,
        scanDataAckStatusCellRenderer: ScanDataAckStatusCellRenderer,
        scanDataNoOfAtteptsCellRenderer: ScanDataNoOfAtteptsCellRenderer,
        vendorInvoiceActionsCellRenderer: VendorInvoiceActionsCellRenderer,
        fuelInvoiceActionsCellRenderer: FuelInvoiceActionsCellRenderer,
        billOfLadingActionsCellRenderer: BillOfLadingActionsCellRenderer,
        vendorInvoiceCellRenderer: VendorInvoiceCellRenderer,
        SelectRenderer: SelectRenderer,
        childSelectRenderer: ChildSelectRenderer,
        childInputRenderer: ChildInputRenderer,
        dateTimeSelectMenuCellRenderer: DateTimeSelectMenuCellRenderer,
        sixDecimalNumericEditor: SixDecimalNumericEditor,
        itemUPCDetailsCellRenderer: ItemUPCDetailsCellRenderer
      },
      rowSelection: this.paginationGridOptions ? this.paginationGridOptions.RowSelection : 'single',
      suppressRowClickSelection: this.paginationGridOptions.suppressRowClickSelection,
      rowDeselection: this.paginationGridOptions.rowDeselection ? this.paginationGridOptions.rowDeselection : false,
      suppressCellSelection: this.paginationGridOptions.suppressCellSelection ? this.paginationGridOptions.suppressCellSelection : false,
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: this.paginationGridOptions.overlayLoadingTemplate ? '<img src="assets/images/spinner.gif" tag="loading.."/>' : '',
      suppressClickEdit: true,
      domLayout: 'autoHeight',
      pagination: this.paginationGridOptions ? this.paginationGridOptions.pagination : false,
      paginationPageSize: this.paginationGridOptions.paginationPageSize ? this.paginationGridOptions.paginationPageSize : 10,
      suppressPaginationPanel: false,
      headerHeight: this.paginationGridOptions.headerHeight ? this.paginationGridOptions.headerHeight : 25,
      enableSorting: this.paginationGridOptions.enableSorting ? this.paginationGridOptions.enableSorting : false,
      enableColResize: true,
      animateRows: true,
      editType: this.paginationGridOptions.fullRowEditabeRequired ? 'fullRow' : '',
      suppressContextMenu: false,
      rowModelType: this.paginationGridOptions.rowModelType,
      cacheBlockSize: this.paginationGridOptions.paginationPageSize ? this.paginationGridOptions.paginationPageSize : 10,
      rowHeight: this.paginationGridOptions.rowHeight ? this.paginationGridOptions.rowHeight : 30,
      detailRowHeight: this.paginationGridOptions.detailRowHeight ? this.paginationGridOptions.detailRowHeight : 250,
      rowMultiSelectWithClick: this.paginationGridOptions.rowMultiSelectWithClick ? this.paginationGridOptions.rowMultiSelectWithClick : false
    };
    this.sideBar = this.paginationGridOptions.isSideBarRequired;
    this.getRowHeight = (params) => {
      if (this.paginationGridOptions.gridType === "invoicesDetailsGrid") {
        if (params.data.paymentMethods.length <= 1) {
          return this.paginationGridOptions.rowHeight;
        } else {
          return 75 + (15 * params.data.paymentMethods.length);
        }
      }
      else if (this.paginationGridOptions.gridType === "itemListChildGrpGrid" || this.paginationGridOptions.gridType === "itemListOverlayGrpGrid") {
        var isDetailRow = params.node.detail;
        // for all rows that are not detail rows, return nothing
        if (!isDetailRow) { return 30; }
        // otherwise return height based on number of rows in detail grid
        // var detailPanelHeight = params.data.children.length * 50;
        // return detailPanelHeight;
        return 150;
      }
      else return this.paginationGridOptions.rowHeight;
    };
  }

  onGridReady(event) {
    this.gridApi = event.api;
    // this.gridColumnApi = event.columnApi;
    event.api.hideOverlay();
    this.gridReady.emit(event);
    this.setRowColor();
    let ele = document.getElementsByClassName('ag-paging-row-summary-panel')[0];
    let parent = document.getElementsByClassName('ag-paging-panel')[0];
    if (document.getElementsByClassName('ag-paging-panel')[0].childNodes[1].nodeValue !== "Showing") {
      let content = document.createTextNode("Showing");
      parent.insertBefore(content, ele);
    }
  }

  onBtStopEditing(rowIndex) {
    this.save.emit(rowIndex);
  }

  onRowSelected(event) {
    const selectedRows = event.api.getSelectedNodes();
    this.rowSelected.emit(selectedRows);
  }

  viewAction(params) {
    this.view.emit(params);
  }

  saveAction(params) {
    this.save.emit(params);
  }


  printAction(params) {
    this.print.emit(params);
  }

  editAction(params) {
    this.edit.emit(params);
  }

  itemHistoryAction(params) {
    this.history.emit(params);
  }

  salesActivityAction(params) {
    this.activity.emit(params);
  }

  Edit(params) {
    this.edit.emit(params);
  }

  Cancel(rowIndex) {
    this.cancel.emit(rowIndex);
  }

  Delete(rowIndex) {
    this.delete.emit(rowIndex);
  }

  onCellClicked(params) {
    this.cellClicked.emit(params);
  }

  onCellValueChanged(params) {
    this.cellValueChanged.emit(params);
  }

  onChange(i, valuefield, value, textfield, text, event?) {
    if (valuefield === 'storeLocationID' || valuefield === 'manufacturerID' ||
      valuefield === 'manufacturerBuydownScheduleID' || valuefield === 'itemListId') {
      event.data.i = i;
      event.data.valuefield = valuefield;
      event.data.value = value;
      event.data.textfield = textfield;
      event.data.text = text;
      this.cellValueChanged.emit(event);
    }
  }

  /**
   * For Cell Action Renderer
   * Delete action performed
   * @param params - deleted row data
   */
  delAction(params) {
    this.confirmationDialogService.confirm(this.constantsService.infoMessages.confirmTitle,
      this.constantsService.infoMessages.confirmMessage)
      .then(() => {
        this.delete.emit(params);
      }).catch(() => console.log('User dismissed the dialog'));
  }

  suspendAction(params) {
    this.suspend.emit(params);
  }

  recoverAction(params) {
    this.recover.emit(params);
  }

  refreshAction(params) {
    this.refresh.emit(params);
  }

  downloadAction(params) {
    this.download.emit(params);
  }

  reviewAction(params) {
    this.review.emit(params);
  }

  submitScanDataAction(params) {
    this.submit.emit(params);
  }

  onColumnResized(params) {
    this.columnResized.emit(params);
  }

  setRowColor() {
    switch (this.paginationGridOptions.gridType) {
      case this.constantsService.gridTypes.invoicesDetailsGrid:
        return this.invoicesDetailsGridRowColor();
    }
  }

  invoicesDetailsGridRowColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data && params.data.invoiceStatusID === 5) {
        return { background: 'lightyellow' };
      }
    };
  }
  onRowEditingStopped(params) {
    this.rowEditingStopped.emit(params);
  }
  pageSizeChanged(pageNumber) {
    const pageSize = this.rowData && this.rowData.length > 0 ? this.gridOptions.paginationPageSize : 0;
    const totalPageRecord = this.rowData && this.rowData.length;
    this.currentPageSize = pageNumber * pageSize;
    if (this.currentPageSize > totalPageRecord) {
      this.currentPageSize = totalPageRecord;
    }
    this.gridApi.paginationGoToPage(pageNumber - 1);
  }
  getPageRowCount() {
    return this.currentPageSize = this.gridApi.paginationGetPageSize();
  }
  setPageRowCount(pageSize) {
    if (this.rowData.length <= 1) {
      return;
    }
    pageSize = pageSize && pageSize !== 'null' ? pageSize : this.gridOptions.paginationPageSize;
    const pageNumber = 1;
    this.currentPageSize = pageSize;
    this.paginationPageSize = pageSize;
    this.currentPageSize = pageNumber * pageSize;
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    this.gridApi.paginationSetPageSize(Number(pageSize));
  }
}
