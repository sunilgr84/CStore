import { Component, OnInit, ViewEncapsulation, ViewChild, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { CellActionComponent } from '../cstore-grid/partials/cell-action/cell-action.component';
// import { DetailCellRenderer } from './partials/detail-cell-renderer.component';
import * as _ from 'lodash';
import { ConfirmationDialogService } from '../confirmation-dialog/confirmation-dialog.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-report-grid',
  templateUrl: './report-grid.component.html',
  styleUrls: ['./report-grid.component.scss']
})
export class ReportGridComponent implements OnInit, OnChanges {

  @ViewChild('expandableGrid') expandableGrid: any;

  @Input() rowData: any;
  @Input() expandableGridOptions?: any;
  @Input() gridHeight?: string;

  @Output() exportTo: EventEmitter<any> = new EventEmitter();
  @Output() gridReady: EventEmitter<any> = new EventEmitter();
  @Input() externalFilterPresent = true;
  @Input() enableSort: any;
  private gridApi;
  private gridColumnApi;
  private isRowMaster;
  detailRowHeight: any;
  detailCellRenderer: any;
  @Input() detailCellRenderers: any;
  domLayout: string;
  columnDefs: any;
  gridOptions: GridOptions;
  detailCellRendererParams: any;
  frameworkComponents: any;
  defaultColDef: any;
  rowSelection = 'single';

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
  autoGroupColumnDef: { headerName: string; width: number; field: string; };
  enableSorting: boolean;
  gridOp = '';
  constructor(private confirmationDialogService: ConfirmationDialogService, private constantsService: ConstantService) {
  }
  ngOnInit() {
    this.enableSorting = this.enableSort == false ? false : true;
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    this.columnDefs = this.expandableGridOptions.columnDefs;
    this.totalPageCount = this.rowData ? this.rowData.length : 0;
    this.gridOp = this.expandableGridOptions.gridType;
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
    if (this.userInfo.roleName === this.roleName) {
      this.suppressContextMenu = false;
    }
    this.detailRowHeight = this.expandableGridOptions && this.expandableGridOptions.rowHeight ? this.expandableGridOptions.rowHeight : 130;

    this.isSearchTextBoxRequired = this.expandableGridOptions.isSearchTextBoxRequired;

    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      overlayNoRowsTemplate: 'No rows to display',
      overlayLoadingTemplate: '<img src="assets/images/spinner.gif" tag="loading.."/>',
      // suppressClickEdit: true,
      rowSelection: this.expandableGridOptions ? this.expandableGridOptions.RowSelection : 'single',
      domLayout: this.domLayout ? this.domLayout : 'normal',
      headerHeight: this.expandableGridOptions.headerHeight,
      pagination: this.expandableGridOptions ? this.expandableGridOptions.pagination : false,
      suppressPaginationPanel: this.expandableGridOptions ? this.expandableGridOptions.suppressPaginationPanel : true,
      paginationPageSize: this.expandableGridOptions ? this.expandableGridOptions.paginationPageSize : 100,
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
  generatedPDfExcel(params) {
    this.exportTo.emit(params);
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridReady.emit(params);
    this.gridApi.sizeColumnsToFit();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }
  groupRowAggNodes(nodes) {
    const result = {
      salesQuantity: 0,
      salesAmount: 0,
      totalSalesAmount: 0,
      buyingCost: 0,
      invoiceValuePrice: 0,
      buyingCaseQuantity: 0,
      casePrice: 0,
      itemCost: 0,
      paidAmount: 0, invoiceAmount: 0,
      amountPaid: 0, totalInvoice: 0,
      openAmount: 0, totalAmount: 0, upcSalesAmount: 0,
      purchaseBuyingCost: 0, purchasedQuantity: 0, salesBuyingCost: 0,
      sellingPrice: 0, sellingUnits: 0, totalBuyingCost: 0,
      totalSellingCost: 0, unitBuyingCost: 0, promotionalSalesQuantity: 0,
      itemSalesQuantity: 0,
    };

    nodes.forEach(function (node) {
      const data = node.group ? node.aggData : node.data;
      if (typeof data.salesQuantity === 'number') {
        result.salesQuantity += data.salesQuantity;
      }
      if (typeof data.salesAmount === 'number') {
        result.salesAmount += data.salesAmount;
      }
      if (typeof data.totalSalesAmount === 'number') {
        result.totalSalesAmount += data.totalSalesAmount;
      }
      if (typeof data.buyingCost === 'number') {
        result.buyingCost += data.buyingCost;
      }
      if (typeof data.invoiceValuePrice === 'number') {
        result.invoiceValuePrice += data.invoiceValuePrice;
      }
      if (typeof data.buyingCaseQuantity === 'number') {
        result.buyingCaseQuantity += data.buyingCaseQuantity;
      }
      if (typeof data.casePrice === 'number') {
        result.casePrice += data.casePrice;
      }
      if (typeof data.itemCost === 'number') {
        result.itemCost += data.itemCost;
      }
      if (typeof data.paidAmount === 'number') {
        result.paidAmount += data.paidAmount;
      }
      if (typeof data.amountPaid === 'number') {
        result.amountPaid += data.amountPaid;
      }
      if (typeof data.totalInvoice === 'number') {
        result.totalInvoice += data.totalInvoice;
      }
      if (typeof data.invoiceAmount === 'number') {
        result.invoiceAmount += data.invoiceAmount;
      }
      if (typeof data.openAmount === 'number') {
        result.openAmount += data.openAmount;
      }
      if (typeof data.totalAmount === 'number') {
        result.totalAmount += data.totalAmount;
      }
      if (typeof data.upcSalesAmount === 'number') {
        result.upcSalesAmount += data.upcSalesAmount;
      }

      if (typeof data.purchaseBuyingCost === 'number') {
        result.purchaseBuyingCost += data.purchaseBuyingCost;
      }
      if (typeof data.purchasedQuantity === 'number') {
        result.purchasedQuantity += data.purchasedQuantity;
      }
      if (typeof data.salesBuyingCost === 'number') {
        result.salesBuyingCost += data.salesBuyingCost;
      }
      if (typeof data.sellingPrice === 'number') {
        result.sellingPrice += data.sellingPrice;
      }
      if (typeof data.sellingUnits === 'number') {
        result.sellingUnits += data.sellingUnits;
      }
      if (typeof data.totalBuyingCost === 'number') {
        result.totalBuyingCost += data.totalBuyingCost;
      }
      if (typeof data.totalSellingCost === 'number') {
        result.totalSellingCost += data.totalSellingCost;
      }
      if (typeof data.unitBuyingCost === 'number') {
        result.unitBuyingCost += data.unitBuyingCost;
      }
      if (typeof data.promotionalSalesQuantity === 'number') {
        result.promotionalSalesQuantity += data.promotionalSalesQuantity;
      }
      if (typeof data.itemSalesQuantity === 'number') {
        result.itemSalesQuantity += data.itemSalesQuantity;
      }
    });
    result.totalSalesAmount = Number(result.totalSalesAmount.toFixed(2));
    result.salesAmount = Number(result.salesAmount.toFixed(2));
    result.buyingCost = Number(result.buyingCost.toFixed(2));
    result.invoiceValuePrice = Number(result.invoiceValuePrice.toFixed(2));
    result.buyingCaseQuantity = Number(result.buyingCaseQuantity.toFixed(2));
    result.casePrice = Number(result.casePrice.toFixed(2));
    result.itemCost = Number(result.itemCost.toFixed(2));
    result.paidAmount = Number(result.paidAmount.toFixed(2));
    result.amountPaid = Number(result.amountPaid.toFixed(2));
    result.totalInvoice = Number(result.totalInvoice.toFixed(2));
    result.invoiceAmount = Number(result.invoiceAmount.toFixed(2));
    result.openAmount = Number(result.openAmount.toFixed(2));
    result.totalAmount = Number(result.totalAmount.toFixed(2));
    result.upcSalesAmount = Number(result.upcSalesAmount.toFixed(2));

    result.purchaseBuyingCost = Number(result.purchaseBuyingCost.toFixed(2));
    result.purchasedQuantity = Number(result.purchasedQuantity.toFixed(2));
    result.salesBuyingCost = Number(result.salesBuyingCost.toFixed(2));
    result.sellingPrice = Number(result.sellingPrice.toFixed(2));
    result.sellingUnits = Number(result.sellingUnits.toFixed(2));
    result.totalBuyingCost = Number(result.totalBuyingCost.toFixed(2));
    result.totalSellingCost = Number(result.totalSellingCost.toFixed(2));
    result.unitBuyingCost = Number(result.unitBuyingCost.toFixed(2));
    result.promotionalSalesQuantity = Number(result.promotionalSalesQuantity.toFixed(2));
    result.itemSalesQuantity = Number(result.itemSalesQuantity.toFixed(2));
    return result;
  }
  setRowColor() {
    if (!this.gridOptions) {
      return;
    }
    this.gridOptions.getRowStyle = function (params) {
      if (!params.data) {
        return { background: '#f1f1f1' };
      }
    };
  }
}
