import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CellActionRenderer } from './partials/cell-action-renderer.component';
import { GridOptions } from 'ag-grid-community';
import { CheckboxCellRenderer } from './customGridControls/checkbox-cell-renderer.component';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as _ from 'lodash';
import { CheckboxCellRendererSelesTax } from './customGridControls/checkbox-cell-renderer-sales-tax.component';
import { CheckboxCellRendererStoreFees } from './customGridControls/checkbox-cell-renderer-store-fees.component';
import { CheckboxCellRendererMOP } from './customGridControls/checkbox-cell-renderer-mop.component';
import { CheckboxCellRendererSalesRestriction } from './customGridControls/checkbox-cell-renderer.sales-restriction.component';
import { NumericEditor } from './partials/numeric-editor.component';
import { OnlyNumericEditor } from './partials/onlynumber-editor.component';
import { FourDigitEditor } from './partials/fourdigits.editor.component';
import { DecimalEditor } from './partials/decimal.editor.component';
import { ChildSelectRenderer } from '../expandable-grid/partials/childselect.component';
import { CheckboxCellEditor } from './partials/checkbox-cell-editor.component';
import { SixDecimalNumericEditor } from './partials/sixdecimal.editor.component';
import { CellActionComponent } from '../cstore-grid/partials/cell-action/cell-action.component';
import { ATMActionRenderer } from './partials/atm-action-cell-renderer.component';
@Component({
  selector: 'app-editable-grid',
  templateUrl: './editable-grid.component.html',
  styleUrls: ['./editable-grid.component.scss']
})
export class EditableGridComponent implements OnInit, OnChanges {

  @Input() rowData: any = [];
  @Input() editGridOptions?: any;
  @Input() gridHeight?: string;
  @Input() gridWidth?: string;
  @Input() textFilter?: string;
  @Input() fullRowEditabeRequired?: string;
  @Input() fontSizeDecrease?: boolean;

  @Output() rowDoubleClick: EventEmitter<any> = new EventEmitter();
  @Output() edit: EventEmitter<any> = new EventEmitter();
  @Output() delete: EventEmitter<any> = new EventEmitter();
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() print: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();
  @Output() cellValueChanged: EventEmitter<any> = new EventEmitter();
  @Output() selectionChanged: EventEmitter<any> = new EventEmitter();
  @Output() cellClicked: EventEmitter<any> = new EventEmitter();
  @Output() rowSelected: EventEmitter<any> = new EventEmitter();
  @Output() suspend: EventEmitter<any> = new EventEmitter();
  @Output() recover: EventEmitter<any> = new EventEmitter();
  @Output() view: EventEmitter<any> = new EventEmitter();
  @Output() download: EventEmitter<any> = new EventEmitter();
  domLayout: string;

  columnDefs: any;
  gridOptions: GridOptions;
  private gridApi;
  private gridColumnApi;
  frameworkComponents: any;
  filterText: string;
  isSearchTextBoxRequired: boolean;
  editType: string;
  constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService) { }

  ngOnInit() {
    const isArray = _.isArray(this.rowData);
    if (!isArray) {
      this.rowData = [];
    }

    this.editType = this.fullRowEditabeRequired ? 'fullRow' : '';
    this.columnDefs = this.editGridOptions.columnDefs;
    this.frameworkComponents = {
      CellActionRenderer: CellActionRenderer,
      CheckboxCellRenderer: CheckboxCellRenderer,
      CheckboxCellRendererSelesTax: CheckboxCellRendererSelesTax,
      CheckboxCellRendererStoreFees: CheckboxCellRendererStoreFees,
      CheckboxCellRendererMOP: CheckboxCellRendererMOP,
      CheckboxCellRendererSalesRestriction: CheckboxCellRendererSalesRestriction,
      numericEditor: NumericEditor,
      onlyNumericEditor: OnlyNumericEditor,
      fourDigitEditor: FourDigitEditor,
      decimalEditor: DecimalEditor,
      childSelectRenderer: ChildSelectRenderer,
      checkboxCellEditor: CheckboxCellEditor,
      sixDecimalNumericEditor: SixDecimalNumericEditor,
      CellRenderer: CellActionComponent,
      ATMActionRenderer: ATMActionRenderer
    };
    if (!this.gridHeight) {
      this.domLayout = 'autoHeight';
      this.gridHeight = 'auto';
    }

    this.isSearchTextBoxRequired = this.editGridOptions.isSearchTextBoxRequired;

    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: '', // '<img src="assets/images/spinner.gif" tag="loading.."/>',
      // singleClickEdit: this.editGridOptions ? this.editGridOptions.SingleClickEdit : true,
      rowSelection: this.editGridOptions ? this.editGridOptions.RowSelection : 'single',
      suppressRowClickSelection: this.editGridOptions.suppressRowClickSelection,
      headerHeight: this.editGridOptions.headerHeight ? this.editGridOptions.headerHeight : 25,
      domLayout: this.domLayout ? this.domLayout : 'normal',
      onRowDoubleClicked: this.onRowDoubleClicked.bind(this)
    };
    this.setRowColor();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.hideOverlay();
    // params.api.sizeColumnsToFit();
    this.gridReady.emit(params);
  }

  ngOnChanges() {
    this.setRowColor();
    if (this.gridApi) {
      this.onFilterTextBoxChanged(this.textFilter);
      return true;
    }
  }

  onCellValueChanged(params) {
    this.cellValueChanged.emit(params);
  }
  onSelectionChanged(params) {
    this.selectionChanged.emit(params);
  }
  onRowDoubleClicked(params) {
    this.rowDoubleClick.emit(params);
  }
  editAction(params) {
    // if (this.fullRowEditabeRequired) {
    //   this.onBtStartEditing(params);
    // }
    this.edit.emit(params);
  }
  delAction(params) {
    this.confirmationDialogService.confirm(this.constantsService.infoMessages.confirmTitle,
      this.constantsService.infoMessages.confirmMessage)
      .then(() => {
        this.delete.emit(params);
      }).catch(() => console.log('User dismissed the dialog'));
  }
  saveAction(params) {
    this.save.emit(params);
  }

  printAction(params) {
    this.print.emit(params);
  }
  onFilterTextBoxChanged(filterText) {
    this.gridApi.setQuickFilter(filterText);
  }

  onCellClicked(params) {
    this.cellClicked.emit(params);
  }

  onRowSelected(event) {
    const selectedRows = event.api.getSelectedNodes();
    this.rowSelected.emit(selectedRows);
  }

  viewAction(params) {
    this.view.emit(params);
  }

  downloadAction(params) {
    this.download.emit(params);
  }

  // onBtStopEditing() {
  //   this.gridApi.stopEditing();
  // }

  // onBtStartEditing(event) {
  //   this.gridApi.setFocusedCell(2, 'make');
  //   this.gridApi.startEditingCell({
  //     rowIndex: 2,
  //     colKey: 'make'
  //   });
  // }
  setRowColor() {
    if (!this.gridOptions) {
      return;
    }
    switch (this.editGridOptions.gridType) {
      case this.constantsService.editableGridConfig.gridTypes.storeItemsGridEditable:
        return this.storeItemsGridEditableSetColor();
      case this.constantsService.editableGridConfig.gridTypes.addInvoicesDetailsGrid:
        return this.invoiceDetailNewItem();
      case this.constantsService.editableGridConfig.gridTypes.lotteryInventoryGrid:
        return this.lotteryInventoryGridSetColor();
    }
  }

  lotteryInventoryGridSetColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.isSold && params.data.openingTicketNo === 0) {
        return { background: '#7cd67c' };
      } else if (params.data.openingTicketNo === 0) {
        return { background: '#f1f18c' };
      } else if (params.data.isSold) {
        return { background: '#7cd67c' };
      } else {
        return { background: '#ffffff' };
      }
    };
  }
  storeItemsGridEditableSetColor() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data.posSyncStatusID === 2) {
        return { background: 'green' };
      }
      if (params.data.posSyncStatusID === 3) {
        return { background: 'orange ' };
      }
      if (params.data.posSyncStatusID === 4) {
        return { background: 'red' };
      }
    };
  }
  invoiceDetailNewItem() {
    this.gridOptions.getRowStyle = function (params) {
      if (params.data && params.data.isNewItem) {
        return { background: 'green' };
      }
    };
  }

  onChange(i, valuefield, value, textfield, text, event?) {
    event.data.i = i;
    event.data.valuefield = valuefield;
    event.data.value = value;
    event.data.textfield = textfield;
    event.data.text = text;
    if (valuefield === 'methodOfPaymentDescription' || valuefield === 'sourceName') {
      this.cellValueChanged.emit(event);
    }
    if (valuefield === "departmentID") {
      this.gridApi.getRowNode(i).data["isEdit"] = false;
      this.gridApi.getRowNode(i).data[valuefield] = value;
      this.gridApi.getRowNode(i).data[textfield] = text;
      console.log(this.gridApi.getRowNode(i));
      var rowNodes = [this.gridApi.getRowNode(i)];
      var params = {
        rowNodes: rowNodes,
      };
      this.gridApi.redrawRows(params);
    }
  }

  suspendAction(params) {
    this.suspend.emit(params);
  }

  recoverAction(params) {
    this.recover.emit(params);
  }

}
