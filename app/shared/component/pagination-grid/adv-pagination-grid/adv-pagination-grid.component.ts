import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ElementRef,
} from '@angular/core';
import { GridOptions, ICellRendererParams } from 'ag-grid-community';
import { AdvCellActionRenderer } from '@shared/component/editable-grid/partials/adv-cell-action-renderer.component';
import { AdvActionRenderer } from '@shared/component/editable-grid/partials/adv-action-renderer.component';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from "@shared/services/constant/constant.service";
import { InputCellRendererComponent, InputNumberCellEditorComponent } from '@shared/component/editable-grid/partials/input-cell-renderer.component';
import { AdvSelectMenuCellRenderer } from '@shared/component/editable-grid/partials/adv-select-menu-cell-renderer.component';
import { ButtonCellRendererComponent } from '@shared/component/pagination-grid/partials/button-cell-renderer.component';
import { FourDigitEditor } from '@shared/component/editable-grid/partials/fourdigits.editor.component';
import { ItemUPCDetailsCellRenderer } from '../partials/item-detail-cell-renderer.component';
import { CellActionComponent } from '@shared/component/cstore-grid/partials/cell-action/cell-action.component';
import { DecimalWithDollarEditor } from '@shared/component/editable-grid/partials/decimal.editor.component';
import { BillOfLadingActionsCellRenderer } from '../partials/bill-of-lading-actions-cell-renderer.component';

@Component({
  selector: 'app-adv-pagination-grid',
  templateUrl: './adv-pagination-grid.component.html',
  styleUrls: ['./adv-pagination-grid.component.scss']
})
export class AdvPaginationGridComponent implements OnInit {

  constructor(
    private confirmationDialogService: ConfirmationDialogService,
    private constantService: ConstantService,
    private ele: ElementRef
  ) { }
  // overlay component
  @Input() showOverlayComponent: boolean = false;
  @Input() overlayBodyTemplate: TemplateRef<any>;
  @Input() overlayComponentTemplate: TemplateRef<any>;
  @Output() cellButtonClick: EventEmitter<any> = new EventEmitter();
  @Output() onBackClick: EventEmitter<any> = new EventEmitter();

  @Input() paginationGridOptions?: any;
  @Input() rowData: any = [];
  @Output() rowSelected: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();

  @Input() agGridTheme: 'inline-edit' | 'inline-edit-border-less';
  @Input() textFilter?: string;
  //Cell action renderer actions
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() cellClicked: EventEmitter<any> = new EventEmitter();
  @Output() rowClicked: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() print: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() suspend: EventEmitter<any> = new EventEmitter();
  @Output() recover: EventEmitter<any> = new EventEmitter();
  @Output() cellValueChanged: EventEmitter<any> = new EventEmitter();
  @Output() rowDoubleClick: EventEmitter<any> = new EventEmitter();
  @Output() rowEditingStarted: EventEmitter<any> = new EventEmitter<any>();
  @Output() rowEditingStopped: EventEmitter<any> = new EventEmitter<any>();
  @Output() paginationClick: EventEmitter<any> = new EventEmitter();
  @Output() details: EventEmitter<any> = new EventEmitter();
  @Output() itemHistory: EventEmitter<any> = new EventEmitter();
  @Output() salesActivity: EventEmitter<any> = new EventEmitter();
  @Output() download: EventEmitter<any> = new EventEmitter();
  @Input() detailCellRenderers: any;
  gridOptions: any;
  sideBar: any;
  gridApi: any;
  isCancel: boolean;
  detailCellRendererParams: any;
  detailCellRenderer: any;

  // global action callback
  @Output() onAction: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    this.isCancel = true;
    this.detailCellRenderer = 'myDetailCellRenderer';
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this,
      },
      rowData: this.rowData,
      defaultColDef: {
        suppressMovable: true,
        resizable: true,
        suppressMenu: this.paginationGridOptions.isSuppressMenu
          ? this.paginationGridOptions.isSuppressMenu
          : false,
      },
      columnDefs: this.paginationGridOptions.columnDefs,
      frameworkComponents: {
        //Detail Cell Renderer
        myDetailCellRenderer: this.detailCellRenderers,
        //Select menu renderer
        advSelectMenuCellRenderer: AdvSelectMenuCellRenderer,

        //Date and date time renderer
        //  inputDateCellRenderer: InputDateCellRenderer,

        //edit, save, cancel, delete, print action renderer
        advCellActionRenderer: AdvCellActionRenderer,
        advActionRenderer: AdvActionRenderer,
        inputNumberCellEditor: InputNumberCellEditorComponent,
        decimalWithDollarEditor: DecimalWithDollarEditor,
        inputCellRendererComponent: InputCellRendererComponent,
        fourDigitEditor: FourDigitEditor,
        btnCellRenderer: ButtonCellRendererComponent,
        itemUPCDetailsCellRenderer: ItemUPCDetailsCellRenderer,
        CellRenderer: CellActionComponent,
        billOfLadingActionsCellRenderer: BillOfLadingActionsCellRenderer
      },
      rowSelection: this.paginationGridOptions
        ? this.paginationGridOptions.RowSelection
        : 'single',
      suppressRowClickSelection: this.paginationGridOptions
        .suppressRowClickSelection,
      rowDeselection: this.paginationGridOptions.rowDeselection
        ? this.paginationGridOptions.rowDeselection
        : false,
      suppressCellSelection: this.paginationGridOptions.suppressCellSelection
        ? this.paginationGridOptions.suppressCellSelection
        : false,
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: this.paginationGridOptions.overlayLoadingTemplate
        ? '<img src="assets/images/spinner.gif" tag="loading.."/>'
        : '',
      suppressClickEdit: this.paginationGridOptions.suppressClickEdit,
      domLayout: 'autoHeight',
      pagination: this.paginationGridOptions
        ? this.paginationGridOptions.pagination
        : false,
      paginationPageSize: this.paginationGridOptions.paginationPageSize
        ? this.paginationGridOptions.paginationPageSize
        : 10,
      suppressPaginationPanel: false,
      headerHeight: this.paginationGridOptions.headerHeight
        ? this.paginationGridOptions.headerHeight
        : 25,
      enableSorting: this.paginationGridOptions.enableSorting
        ? this.paginationGridOptions.enableSorting
        : false,
      enableColResize: true,
      animateRows: true,
      editType: this.paginationGridOptions.fullRowEditabeRequired
        ? 'fullRow'
        : '',
      suppressContextMenu: false,
      rowModelType: this.paginationGridOptions.rowModelType,
      cacheBlockSize: this.paginationGridOptions.paginationPageSize
        ? this.paginationGridOptions.paginationPageSize
        : 10,
      rowHeight: this.paginationGridOptions.rowHeight ? this.paginationGridOptions.rowHeight : 36,
      onRowDoubleClicked: this.onRowDoubleClicked.bind(this),
      groupUseEntireRow: this.paginationGridOptions.groupUseEntireRow
        ? this.paginationGridOptions.groupUseEntireRow
        : false,
      groupRowRendererParams: this.paginationGridOptions.groupRowRendererParams
        ? this.paginationGridOptions.groupRowRendererParams
        : '',
      groupSelectsChildren: this.paginationGridOptions.groupSelectsChildren,
      masterDetail: this.paginationGridOptions.masterDetail,
      groupDefaultExpanded: this.paginationGridOptions.groupDefaultExpanded,
    };
    this.sideBar = this.paginationGridOptions.isSideBarRequired;
    this.setRowColor();
  }
  setRowColor() {
    if (!this.gridOptions) {
      return;
    }
    switch (this.paginationGridOptions.gridType) {
      case this.constantService.gridTypes.storeItemsGrid:
        return this.storeItemsGridSetColor();
      case this.constantService.gridTypes.storeItemsGridCase:
        return this.storeItemsGridSetColor();
      //  case this.constantService.gridTypes.vendorInvoiceGrid:
      //    return this.vendorInvoiceGridRowColor();
    }
  }

  storeItemsGridSetColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.posSyncStatusID === 2) {
        return { background: '#01b401' };
      }
      if (params.data.posSyncStatusID === 3) {
        return { background: 'orange ' };
      }
      if (params.data.posSyncStatusID === 4) {
        return { background: 'red' };
      }
    };
  }

  ngOnChanges() {
    if (this.gridApi) {
      this.onFilterTextBoxChanged(this.textFilter);
      return true;
    }
  }
  onFilterTextBoxChanged(filterText) {
    this.gridApi.setQuickFilter(filterText);
  }

  onGridReady(event) {
    this.gridApi = event.api;
    event.api.hideOverlay();
    this.gridReady.emit(event);
  }
  onBtStopEditing(rowIndex) {
    this.save.emit(rowIndex);
  }

  onCellClicked(params) {
    this.cellClicked.emit(params);
  }

  onRowClicked(params) {
    this.rowClicked.emit(params);
  }

  onRowDoubleClicked(params) {
    this.rowDoubleClick.emit(params);
  }
  onRowSelected(event) {
    // const selectedRows = event.api.getSelectedNodes();
    this.rowSelected.emit(event);
  }
  onCellValueChanged(params) {
    this.cellValueChanged.emit(params);
  }
  editAction(params) {
    this.edit.emit(params);
  }
  cellButtonAction(e: Event, params: ICellRendererParams) {
    this.cellButtonClick.emit({ e, params });
  }
  cancelAction(params) {
    this.cancel.emit(params);
  }
  saveAction(params) {
    this.save.emit(params);
  }
  deleteAction(params) {
    this.confirmationDialogService
      .confirm(
        this.constantService.infoMessages.confirmTitle,
        this.constantService.infoMessages.confirmDeleteMessage
      )
      .then(() => {
        this.delete.emit(params);
      })
      .catch(() => console.log('User dismissed the dialog'));
  }
  printAction(params) {
    this.print.emit(params);
  }
  suspendAction(params) {
    this.suspend.emit(params);
  }
  recoverAction(params) {
    this.recover.emit(params);
  }
  paginationChanged(params) {
    this.paginationClick.emit(params);
  }
  detailsAction(param) {
    this.details.emit(param);
  }
  vendorInvoiceGridRowColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params && params.data && params.data.InvoiceStatusID === 5) {
        return { background: 'lightyellow' };
      }
    };
  }

  handleAction(params: ActionParams) {
    this.onAction.emit(params);
  }
  setHeight(height) {
    this.ele.nativeElement.children[0].style.height = height;
  }

  itemHistoryAction(params) {
    this.itemHistory.emit(params);
  }

  salesActivityAction(params) {
    this.salesActivity.emit(params);
  }

  onRowEditingStarted(params) {
    this.rowEditingStarted.emit(params);
  }

  onRowEditingStopped(params) {
    this.rowEditingStopped.emit(params);
  }

  downloadAction(params) {
    this.download.emit(params);
  }
}

export interface ActionParams {
  type: string;
  evt: Event;
  params: any;
}

