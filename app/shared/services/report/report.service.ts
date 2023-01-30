import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private constantService: ConstantService) { }

  getColumnDef(reportType) {
    let col;
    switch (reportType) {
      case this.constantService.reportTypes.PurchaseReportsByWeeklys:
        col = this.PurchaseReportsByWeeklyCol();
        return col;
      case this.constantService.reportTypes.PurchaseByInvoiceStatusReport:
        col = this.PurchaseByInvoiceStatusReportCol();
        return col;
      case this.constantService.reportTypes.PurchaseByInvoiceStatusReportDetails:
        col = this.PurchaseByInvoiceStatusReportDetailsCol();
        return col;
      case this.constantService.reportTypes.weeklyPurchaseReport:
        col = this.weeklyPurchaseReportCol();
        return col;
      case this.constantService.reportTypes.weeklySaleReport:
        col = this.weeklySaleReportCol();
        return col;
      case this.constantService.reportTypes.weeklySaleByDepartmentTypeReport:
        col = this.weeklySaleByDepartmentTypeReportCol();
        return col;
      case this.constantService.reportTypes.purchaseReportByItem:
        col = this.purchaseReportByItemCol();
        return col;
      case this.constantService.reportTypes.purchaseReportByDepartment:
        col = this.purchaseReportByDepartmentCol();
        return col;
      case this.constantService.reportTypes.fuelSalesReport:
        col = this.fuelSalesReportCol();
        return col;
      case this.constantService.reportTypes.purchaseReportByItemDetail:
        col = this.purchaseReportByItemDetailCol();
        return col;
      case this.constantService.reportTypes.purchaseReport:
        col = this.purchaseReportCol();
        return col;
      case this.constantService.reportTypes.purchaseReportByVendor:
        col = this.purchaseReportByVendorCol();
        return col;

      case this.constantService.reportTypes.departmentSalesReport:
        col = this.departmentSalesReportCol();
        return col;
      case this.constantService.reportTypes.departmentSalesReportDetail:
        col = this.departmentSalesReportDetailCol();
        return col;
      case this.constantService.reportTypes.itemSalesReport:
        col = this.itemSalesReportCol();
        return col;
      case this.constantService.reportTypes.itemSalesReportDetail:
        col = this.itemSalesReportDetailCol();
        return col;
      case this.constantService.reportTypes.salesPercentReport:
        col = this.salesPercentReportCol();
        return col;

      case this.constantService.reportTypes.promotionItemsReport:
        col = this.promotionItemsReportCol();
        return col;

      case this.constantService.reportTypes.salesReportByVendor:
        col = this.salesReportByVendorCol();
        return col;

      case this.constantService.reportTypes.salesReport:
        col = this.salesReportCol();
        return col;

      case this.constantService.reportTypes.salesReportByPriceGroup:
        col = this.salesReportByPriceGroupCol();
        return col;
      case this.constantService.reportTypes.lotteryInventoryReport:
        col = this.lotteryInventoryReportCol();
        return col;
      case this.constantService.reportTypes.inventoryReport:
        col = this.inventoryReportCol();
        return col;
      case this.constantService.reportTypes.unupdatedInventoryReport:
        col = this.unupdatedInventoryReportCol();
        return col;
      case this.constantService.reportTypes.itemTxnReport:
        col = this.itemTxnReportCol();
        return col;
      case this.constantService.reportTypes.shrinkageReport:
        col = this.shrinkageReportCol();
        return col;
      case this.constantService.reportTypes.inventoryPurchaseReport:
        col = this.inventoryPurchaseReportCol();
        return col;
      case this.constantService.reportTypes.inventoryPurchaseDetailReport:
        col = this.inventoryPurchaseDetailReportCol();
        return col;
      case this.constantService.reportTypes.bankDepositReport:
        col = this.bankDepositReportCol();
        return col;
      case this.constantService.reportTypes.bankDepositSummaryReport:
        col = this.bankDepositSummaryReportCol();
        return col;
    }

  }
  PurchaseReportsByWeeklyCol(): any {
    return ['Store Name', 'Depart Type', 'Current Week', 'Previous Week', 'Net Result'];
  }
  PurchaseByInvoiceStatusReportCol(): any {
    return ['Store Name', 'Invoice Date', 'Total Invoice', 'Invoice Status Description'];
  }
  PurchaseByInvoiceStatusReportDetailsCol(): any {
    return [
      'Store Name', 'Invoice Date', 'Invoice Created Date Time', 'Invoice No', 'Vendor Name', 'EDI Invoice', 'Status Change Date Time',
      'Invoice Status ', 'Invoice Action Type Name'
    ];
  }
  weeklyPurchaseReportCol() {
    return ['Store Name', 'Department Type', 'Current Week', ' Previous Week', 'Difference'];
  }

  weeklySaleReportCol() {
    return ['Store Name', 'Department', 'Current Week', ' Previous Week', 'Difference ( Current - Privious)'];
  }

  weeklySaleByDepartmentTypeReportCol() {
    return ['Store Name', 'Department Type', 'Sales Amount', 'Status', 'Difference'];
  }

  purchaseReportByItemCol() {
    return [
      'Store Name', 'Vendor Name', 'UPC Code', 'Item', 'Unit Buying Cost', 'Case Qty', 'Case Price',
      'Total Cost', 'Selling Price', 'Margin',
    ];
  }
  purchaseReportByDepartmentCol() {
    return ['Store Name', 'Department', 'Vendor', 'Invoice Date', 'Invoice No', 'Amount Paid'];
  }
  fuelSalesReportCol() {
    return ['Store Name', 'Gas Grade', 'Date', 'Gas Volume (gal)', 'Gas Amount'];
  }
  purchaseReportByItemDetailCol() {
    return ['Store Name', 'Vendor Name', 'UPC Code', 'Item', 'Unit Buying Cost', 'Unit Buying Quantity',
      'Case Qty', 'Case Price', 'Total Cost', 'Selling Price', 'Margin', 'Unit In Case'
    ];
  }
  purchaseReportCol() {
    return [
      'Store Name', 'Invoice Date', 'Vendor Name', 'Invoice No', 'Invoice Amount', 'Amount Paid',
      'Payment  Type', 'Payment Source', 'Check Number', 'Invoice Status'
    ];
  }
  purchaseReportByVendorCol() {
    return ['Store Name', 'Vendor', 'Invoice Date', 'Invoice No', 'Amount Paid', 'Payment Source', 'Check Number'];
  }
  departmentSalesReportDetailCol() {
    return [
      'Business Date', 'Store Name', 'Department', 'Sales Quantity', 'Sales Amount', 'Percentile of Sales Amount',
      'Buying Cost', 'Profit', 'Margin'
    ];
  }
  itemSalesReportCol() {
    return [
      'Store Name', 'UPC Code', 'Item', 'Department Description', 'Unit Buying Cost', 'Selling Price',
      'Sales Quantity', 'Sales Amount', 'Percentile of Sales Amount', 'Buying Cost', 'Profit', 'Margin'
    ];
  }
  itemSalesReportDetailCol() {
    return [
      'Business Date', 'Store Name', 'Department', 'UPC Code', 'Item', 'Unit Buying Cost', 'Sales Price', 'Sales Quantity',
      'Sales Amount', 'Percentile of Sales Amount', 'Buying Cost', 'Profit', 'Margin', 'Current Inventory'
    ];
  }
  salesPercentReportCol() {
    return ['Store Name', 'Department Description', 'Sales Amount', 'Total Amount'];
  }
  promotionItemsReportCol() {
    return [
      'Business Date', 'Store Name', 'UPC Code', 'Department', 'Description', 'Item Sales Quantity', 'Promotional Sales Quantity',
      'Unit Buying Cost', 'Sales Amount', 'Selling Price'
    ];
  }
  salesReportByVendorCol() {
    return [
      'Store Name', 'UPC Code', 'Description', 'Current Inventory', 'Purchased Quantity', 'Sales Quantity', 'Sales Buying Cost',
      'Selling Price', 'Selling Units', 'Total Buying Cost', 'total Selling Cost'
    ];
  }
  salesReportCol() {
    return ['Store Name', 'Department  Description', 'Department Type Name  ', 'Total Amount ', 'UPC Sales Amount', 'Open Amount  '];
  }
  salesReportByPriceGroupCol() {
    return [
      'Store Name', 'Department Description', 'UPC Code', 'Description', 'Group Name ', 'Unit Sales Cost', 'Sales Qty', 'Sales Amount ',
      'Buying Cost ', 'Unit Buying Cost', 'Proft', 'Margin', 'Total Sales Amount'
    ];
  }
  departmentSalesReportCol() {
    return [
      'Store Name', 'Department', 'Sales Quantity', 'Sales Amount', 'Percentile of Sales Amount', 'Buying Cost', ' Proft', 'Margin'
    ];
  }

  lotteryInventoryReportCol() {
    return [
      'Game No', 'Game Id', 'Game Name', 'Confirms Pack', 'Activated Pack', 'Total Pack', 'Ticket Value', 'Pack Value'
    ];
  }

  inventoryReportCol() {
    return [
      'UPC Code', 'Description', 'Department', 'Store Name', 'Quantity', 'Buying Cost', 'Selling Price', 'Current Inventory', 'Buying Value', 'Selling Value'
    ];
  }
  unupdatedInventoryReportCol() {
    return [
      'Store Name', 'Department Description', 'POS Code', 'Description', 'Inventory As Of Date', 'Current Inventory'
    ];
  }
  itemTxnReportCol() {
    return [
      'UPC Code', 'Description', 'Purchases', 'Sales', 'Stock Adjustment', 'Current Inventory'
    ];
  }
  shrinkageReportCol() {
    return [
      'Store Name', 'Department Description', 'UPC', 'Description', 'Start Inventory Date',
      'Starting Inventory', 'Purchases', 'Sales', 'Final Inventory', 'Final Inventory Date', 'Shrinkage'
    ];
  }
  inventoryPurchaseReportCol() {
    return [
      'Store Name', 'Department', 'Sales Amount', 'Purchase Amount'
    ];
  }
  inventoryPurchaseDetailReportCol() {
    return [
      'Store Name', 'Date', 'Department', 'Sales Amount', 'Purchase Amount'
    ];
  }
  bankDepositReportCol() {
    return [
     
    ];
  }
  bankDepositSummaryReportCol() {
    return [
      'Store Name', 'Date', 'Department', 'Sales Amount', 'Purchase Amount'
    ];
  }
}