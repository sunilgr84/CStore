import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { CellActionComponent } from './partials/cell-action/cell-action.component';
import { CheckUncheckIconCellRendererComponent } from './partials/check-uncheck-icon.cell-renderer.component';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as _ from 'lodash';
import { CheckboxPrivilegeRenderer } from './partials/checkbox-privilege-renderer.component';
import { ChildSelectRenderer } from '../expandable-grid/partials/childselect.component';
import { ChildRowRenderer } from '../expandable-grid/partials/childRow.component';
import { ViewFileButtonComponent } from './partials/view-file-button.component';

@Component({
  selector: 'app-cstore-grid',
  templateUrl: './cstore-grid.component.html',
  styleUrls: ['./cstore-grid.component.scss']
})
export class CstoreGridComponent implements OnInit, OnChanges {
  @Input() ellipses = true;
  @Input() paginationCenter = true;
  @Input() rowData: any;
  @Input() cStoreGridOptions?: any;
  @Input() gridHeight?: string;
  @Input() textFilter?: string;
  @Input() isPageSizeShow = true;
  @Input() getRowNodeId?: any;
  @Input() fullRowEditabeRequired?: string;
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() approve: EventEmitter<any> = new EventEmitter();
  @Output() reject: EventEmitter<any> = new EventEmitter();
  @Output() rejectEmployee: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() clone: EventEmitter<any> = new EventEmitter();
  @Output() change: EventEmitter<any> = new EventEmitter();
  @Output() BtStopEditing: EventEmitter<any> = new EventEmitter();
  @Output() note: EventEmitter<any> = new EventEmitter();
  @Output() open: EventEmitter<any> = new EventEmitter();
  @Output() added: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();
  @Output() rowSelected: EventEmitter<any> = new EventEmitter();
  @Output() details: EventEmitter<any> = new EventEmitter();
  @Output() download: EventEmitter<any> = new EventEmitter();
  @Output() child: EventEmitter<any> = new EventEmitter();
  @Output() suspend: EventEmitter<any> = new EventEmitter();
  @Output() recover: EventEmitter<any> = new EventEmitter();
  @Output() viewFile: EventEmitter<any> = new EventEmitter();
  @Output() viewFileDelete: EventEmitter<any> = new EventEmitter();
  @Output() columnResized: EventEmitter<any> = new EventEmitter();
  @Output() modelUpdated: EventEmitter<any> = new EventEmitter();
  @Output() cellClicked: EventEmitter<any> = new EventEmitter();

  domLayout: string;
  columnDefs: any;
  gridOptions: GridOptions;
  frameworkComponents: any;
  gridApi;
  gridColumnApi;
  defaultColDef;
  autoGroupColumnDef;

  // pagination
  paginationPageSize: number;
  currentPage = 1;
  totalPageCount: number;
  isPaginationShow: boolean;
  sideBar: any;
  filterText: string;
  isSearchTextBoxRequired: boolean;
  currentPageSize = 0;
  suppressContextMenu = false;
  selectedPageSize = null;
  pageSizeList = [{ key: '5', value: 5 }, { key: '10', value: 10 },{ key: '20', value: 20 },
  { key: '30', value: 30 }, { key: '50', value: 50 }, { key: '100', value: 100 }];
  editType: string;
  constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService) { }

  ngOnInit() {
    this.editType = this.fullRowEditabeRequired ? 'fullRow' : '';
    this.columnDefs = this.cStoreGridOptions.columnDefs;
    this.isSearchTextBoxRequired = false;
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    if (!this.gridHeight) {
      this.domLayout = 'autoHeight';
      this.gridHeight = 'auto';
    }
    this.frameworkComponents = {
      CellRenderer: CellActionComponent,
      CheckUncheckIconCellRenderer: CheckUncheckIconCellRendererComponent,
      CheckboxPrivilegeRenderer: CheckboxPrivilegeRenderer,
      childSelectRenderer: ChildSelectRenderer,
      childRowRenderer: ChildRowRenderer,
      viewFileButtonRenderer: ViewFileButtonComponent
    };
    this.paginationPageSize = this.cStoreGridOptions ? this.cStoreGridOptions.paginationPageSize : 10;
    this.selectedPageSize = this.paginationPageSize;
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: this.cStoreGridOptions.overlayLoadingTemplate ? '<img src="assets/images/spinner.gif" tag="loading.."/>' : '',
      suppressClickEdit: true,
      rowSelection: this.cStoreGridOptions ? this.cStoreGridOptions.RowSelection : 'single',
      domLayout: this.domLayout ? this.domLayout : 'normal',
      pagination: this.cStoreGridOptions ? this.cStoreGridOptions.pagination : false,
      suppressPaginationPanel: true,
      suppressRowClickSelection: (this.cStoreGridOptions.suppressRowClickSelection === true || this.cStoreGridOptions.suppressRowClickSelection === false) ? this.cStoreGridOptions.suppressRowClickSelection : true,
      headerHeight: this.cStoreGridOptions.headerHeight ? this.cStoreGridOptions.headerHeight : 25,
      suppressCellSelection: this.cStoreGridOptions.suppressCellSelection ? this.cStoreGridOptions.suppressCellSelection : false,
      rowDeselection: this.cStoreGridOptions.rowDeselection ? this.cStoreGridOptions.rowDeselection : false,
      rowHeight: this.cStoreGridOptions.rowHeight !== 130 ? this.cStoreGridOptions.rowHeight : 30
      // paginationPageSize: this.cStoreGridOptions ? this.cStoreGridOptions.paginationPageSize : 10,
    };
    // if (this.userInfo.roleName === this.roleName) {
    //   this.suppressContextMenu = false;
    // }
    this.pageCount();
    this.isSearchTextBoxRequired = this.cStoreGridOptions.isSearchTextBoxRequired;

    this.defaultColDef = {
      suppressMovable: true,
      suppressMenu: this.cStoreGridOptions.isSuppressMenu ? this.cStoreGridOptions.isSuppressMenu : false
    };
    this.sideBar = this.cStoreGridOptions.isSideBarRequired;
    if (this.cStoreGridOptions.isSideBarRequired) {
      this.defaultColDef = Object.assign({ suppressMenu: true }, this.defaultColDef);
      // this.sideBar = {
      //   toolPanels: [
      //     {
      //       id: 'columns',
      //       labelDefault: 'Columns',
      //       labelKey: 'columns',
      //       iconKey: 'columns',
      //       toolPanel: 'agColumnsToolPanel',
      //       // toolPanelParams: {
      //       //   suppressRowGroups: true,
      //       //   suppressValues: true,
      //       //   suppressPivots: true,
      //       //   suppressPivotMode: true,
      //       //   suppressSideButtons: true,
      //       //   suppressColumnFilter: true,
      //       //   suppressColumnSelectAll: true,
      //       //   suppressColumnExpandAll: true
      //       // }
      //     }
      //   ],
      //   defaultToolPanel: 'columns'
      // };
    }
    this.setRowColor();
  }

  ngOnChanges() {
    if (this.gridApi) {
      this.onFilterTextBoxChanged(this.textFilter);
      if (!this.textFilter) {
        this.totalPageCount = this.rowData ? this.rowData.length : 0;
      }
      return true;
    }
    const isArray = _.isArray(this.rowData);
    if (!isArray) {
      this.rowData = [];
    }
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    this.pageCount();
    this.setRowColor();
  }

  pageCount() {
    this.currentPageSize = 0;
    if (this.rowData && this.rowData.length) {
      this.currentPageSize = (this.cStoreGridOptions.paginationPageSize > this.rowData.length)
        ? this.rowData.length : this.cStoreGridOptions.paginationPageSize;
    }
  }
  /**
   * On component ready below method got called
   * @param params - it provides grid instance when compponent is load
   */
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    // params.api.hideOverlay();
    this.gridReady.emit(params);
    // this.gridApi.showNoRowsOverlay();
  }

  pageSizeChanged(pageNumber) {
    const pageSize = this.rowData && this.rowData.length > 0 ? this.cStoreGridOptions.paginationPageSize : 0;
    const totalPageRecord = this.rowData && this.rowData.length;
    this.currentPageSize = pageNumber * pageSize;
    if (this.currentPageSize > totalPageRecord) {
      this.currentPageSize = totalPageRecord;
    }
    this.gridApi.paginationGoToPage(pageNumber - 1);
  }
  Edit(params) {
    this.editAction(params);
  }
  /**
   * ON edit button call
   * @param params - selected row data
   */
  editAction(params, _rowIndex?) {
    // this.edit.emit(params);
    if (_rowIndex)
      this.edit.emit(params);
    else
      this.edit.emit(params);
  }

  approveAction(params, _rowIndex?) {
    // this.edit.emit(params);
    if (_rowIndex)
      this.approve.emit(params);
    else
      this.approve.emit(params);
  }

  rejectAction(params, _rowIndex?) {
    // this.edit.emit(params);
    if (_rowIndex)
      this.reject.emit(params);
    else
      this.reject.emit(params);
  }

  rejectEmployeeAction(params, _rowIndex?) {
    // this.edit.emit(params);
    if (_rowIndex)
      this.rejectEmployee.emit(params);
    else
      this.rejectEmployee.emit(params);
  }

  /**
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

  viewFileAction(params) {
    this.viewFile.emit(params);
  }

  viewFileDeleteAction(params) {
    this.viewFileDelete.emit(params);
  }

  onRowSelected(event) {

    const selectedRows = event.api.getSelectedNodes();
    this.rowSelected.emit(selectedRows);
  }

  cloneAction(params) {
    this.clone.emit(params);
  }
  childAction(params) {
    this.child.emit(params);
  }
  onChange(a, b, c, d, e) {
    let event = { a: a, b: b, c: c, d: d, e: e }
    this.change.emit(event);
  }
  onBtStopEditing($event) {
    this.BtStopEditing.emit($event);
  }
  noteAction(params) {
    this.note.emit(params);
  }

  openAction(param) {
    this.open.emit(param);
  }

  addAction(param) {
    this.added.emit(param);
  }
  detailsAction(param) {
    this.details.emit(param);
  }
  downloadAction(param) {
    this.download.emit(param);
  }
  onFilterTextBoxChanged(filterText) {
    this.gridApi.setQuickFilter(filterText);
    this.totalPageCount = this.gridApi.rowModel.getRowCount();
    if (this.gridApi.getDisplayedRowCount() === 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  getPageRowCount() {
    return this.currentPageSize = this.gridApi.paginationGetPageSize();
  }

  setPageRowCount(pageSize) {
    if (this.rowData.length <= 1) {
      return;
    }
    pageSize = pageSize && pageSize !== 'null' ? pageSize : this.cStoreGridOptions.paginationPageSize;
    const pageNumber = 1;
    this.currentPageSize = pageSize;
    this.paginationPageSize = pageSize;
    this.currentPageSize = pageNumber * pageSize;
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    this.gridApi.paginationSetPageSize(Number(pageSize));
  }
  setRowColor() {
    if (!this.gridOptions) {
      return;
    }
    switch (this.cStoreGridOptions.gridType) {
      case this.constantsService.gridTypes.invoicesDepartmentDetailsGrid:
        return this.invoicesDepartmentDetailsGridColor();
      case this.constantsService.editableGridConfig.gridTypes.lotteryInventoryGrid:
        return this.lotteryInventoryGridSetColor();
      case this.constantsService.gridTypes.invoicesDetailsGrid:
        return this.invoicesDetailsGridRowColor();
    }
  }
  invoicesDepartmentDetailsGridColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data && params.data.departmentDescription === 'Total') {
        return { background: 'lightyellow' };
      }
    };
  }

  lotteryInventoryGridSetColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.isSold && params.data.openingTicketNo === 0) {
        return { background: '#7cd67c' };
      } else if (params.data.openingTicketNo === 0) {
        return { background: '#f1f18c' };
      } else if (params.data.isSold) {
        return { background: '#7cd67c' };
      }
    };
  }

  invoicesDetailsGridRowColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.invoiceStatusID === 5) {
        return { background: 'lightyellow' };
      }
    };
  }

  suspendAction(params) {
    this.suspend.emit(params);
  }

  recoverAction(params) {
    this.recover.emit(params);
  }
  onColumnResized(params) {
    this.columnResized.emit(params);
  }
  onModelUpdated(params) {
    this.modelUpdated.emit(params);
  }

  onCellClicked(params) {
    this.cellClicked.emit(params);
  }
}
