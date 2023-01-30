import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { CellActionComponent } from '../cstore-grid/partials/cell-action/cell-action.component';
// import { DetailCellRenderer } from './partials/detail-cell-renderer.component';
import * as _ from 'lodash';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { CellActionRenderer } from '@shared/component/editable-grid/partials/cell-action-renderer.component';


@Component({
  selector: 'app-expandable-grid',
  templateUrl: './expandable-grid.component.html',
  styleUrls: ['./expandable-grid.component.scss'],
})
export class ExpandableGridComponent implements OnInit, OnChanges {

  @ViewChild('expandableGrid') expandableGrid: any;

  @Input() rowData: any;
  @Input() expandableGridOptions?: any;
  @Input() gridHeight?: string;
  @Input() getRowNodeId?: any;
  @Input() fullRowEditabeRequired?: string;

  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();
  @Output() cellValueChanged: EventEmitter<any> = new EventEmitter();
  @Output() rowEditingStarted: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowEditingStopped: EventEmitter<any> = new EventEmitter<any>();
  @Input() externalFilterPresent = true;
  private getRowHeight;
  private gridApi;
  private gridColumnApi;
  private isRowMaster;
  public detailRowHeight: any;
  detailCellRenderer: any;
  @Input() detailCellRenderers: any;
  domLayout: string;
  columnDefs: any;
  gridOptions: GridOptions;
  detailCellRendererParams: any;
  frameworkComponents: any;
  defaultColDef: any;
  rowSelection = 'single';
  editType: string;
  // pagination
  paginationPageSize: number;
  currentPage = 1;
  totalPageCount: number;
  isPaginationShow: boolean;
  @Input() suppressContextMenu = true;
  roleName = 'superadmin';
  userInfo: any;
  filterText: string;
  isSearchTextBoxRequired: boolean;


  constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService) {

    this.getRowHeight = function (params) {
      //debugger;
      // if (params.node && params.node.detail) {
      //   debugger;
      //   var offset = 80;
      //   var allDetailRowHeight = params.data.callRecords.length * 28;
      //   return allDetailRowHeight + offset;
      // } else {
      //   return 60;
      // }
    };

  }
  ngOnInit() {

    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    this.editType = this.fullRowEditabeRequired ? 'fullRow' : '';
    this.columnDefs = this.expandableGridOptions.columnDefs;
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    if (!this.gridHeight) {
      this.domLayout = 'autoHeight';
      this.gridHeight = 'auto';
    }


    this.defaultColDef = {
      autoHeight: true,
      cellClass: 'cell-wrap-text',
      filter: true
    };

    this.detailCellRenderer = 'myDetailCellRenderer';

    this.frameworkComponents = {
      CellRenderer: CellActionComponent,
      myDetailCellRenderer: this.detailCellRenderers,
      CellActionRenderer: CellActionRenderer,
    };
    if (this.userInfo.roleName === this.roleName) {
      this.suppressContextMenu = false;
    }
    //if(!this.expandableGridOptions.detailRowHeight)
    this.detailRowHeight = this.expandableGridOptions && this.expandableGridOptions.rowHeight ? this.expandableGridOptions.rowHeight : 130;
    //// else
    //this.detailRowHeight = '100%';

    this.isSearchTextBoxRequired = this.expandableGridOptions.isSearchTextBoxRequired;
    if (this.expandableGridOptions && this.expandableGridOptions.RowSelection)
      this.rowSelection = this.expandableGridOptions.RowSelection;
    if (this.expandableGridOptions && this.expandableGridOptions.enableRangeSelection)
      this.rowSelection = '';

    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: '<img src="assets/images/spinner.gif" tag="loading.."/>',
      // suppressClickEdit: true,
      rowSelection: this.rowSelection,
      domLayout: this.domLayout ? this.domLayout : 'normal',
      headerHeight: this.expandableGridOptions.headerHeight,
      pagination: false, // this.expandableGridOptions ? this.expandableGridOptions.pagination : false,
      suppressPaginationPanel: true,
      // paginationPageSize: this.expandableGridOptions ? this.expandableGridOptions.paginationPageSize : 10,
      // isExternalFilterPresent: this.externalFilterPresent,
    };
    this.setRowColor();
  }

  ngOnChanges() {
    const isArray = _.isArray(this.rowData);
    if (!isArray) {
      this.rowData = [];
    }
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
  }
  editAction(params) {
    this.edit.emit(params);
  }

  saveAction(params) {
    this.save.emit(params);
  }

  delAction(params) {
    this.confirmationDialogService.confirm(this.constantsService.infoMessages.confirmTitle,
      this.constantsService.infoMessages.confirmMessage)
      .then(() => {
        this.delete.emit(params);
      }).catch(() => console.log('User dismissed the dialog'));
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridReady.emit(params);
  }
  onCellChanged(params) {
    this.cellValueChanged.emit(params);
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }


  setRowColor() {
    if (!this.gridOptions) {
      return;
    }
    switch (this.expandableGridOptions.gridType) {
      case this.constantsService.editableGridConfig.gridTypes.tankVolumeHistoryGrid:
        return this.tankVolumeHistoryGridEditableSetColor();
      default: this.gridOptions.getRowStyle = function (params) {
        if (params.data && params.data.noOfItemInError > 0) {
          return { background: '#19b5fe' };
        }
      };
    }
  }

  tankVolumeHistoryGridEditableSetColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data && params.data.storeTankVolumeHistoryID === 0) {
        return { background: '#c9c9e8' };
      } else {
        return { background: '#ffffff' };;
      }
    };
  }

  onRowEditingStarted(params) {
    this.rowEditingStarted.emit(params);
  }

  onRowEditingStopped(params) {
    this.rowEditingStopped.emit(params);
  }
}
