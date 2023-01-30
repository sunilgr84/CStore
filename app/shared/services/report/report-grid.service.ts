import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';
import { UtilityService } from '../utility/utility.service';
import { BarCodeComponent } from '@shared/component/expandable-grid/partials/barCode.component';

@Injectable({
    providedIn: 'root'
})
export class ReportGridService {
    gridOption: any;
    constructor(private constantService: ConstantService, private utilityService: UtilityService) { }

    /**
     * To fecth grid configuration
     * @param gridType - grid type required
     */
    getGridOption(gridType) {
        this.gridOption = this.overrideDefault(gridType);
        return this.gridOption;
    }

    /**
     * to get the grid defaukt config
     * @param gridType - grid name required
     */
    overrideDefault(gridType) {
        let gridOptions;
        if (gridType === this.constantService.reportTypes.fuelSalesReport) {
            gridOptions = {
                RowSelection: 'single',
                SingleClickEdit: false,
                columnDefs: null,
                pagination: true,
                suppressPaginationPanel: false,
                paginationPageSize: 10,
                headerHeight: 41,
                suppressRowClickSelection: true,
                isSideBarRequired: false,
                isSuppressMenu: false,
                isSearchTextBoxRequired: true,
                overlayLoadingTemplate: true,
                rowHeight: 130,
                gridType: gridType
            };
        } else {
            gridOptions = {
                RowSelection: 'single',
                SingleClickEdit: false,
                columnDefs: null,
                pagination: false,
                paginationPageSize: 10,
                headerHeight: 41,
                suppressRowClickSelection: true,
                isSideBarRequired: false,
                isSuppressMenu: false,
                isSearchTextBoxRequired: true,
                overlayLoadingTemplate: true,
                rowHeight: 130,
                gridType: gridType
            };
        }
        // let defaultSetting = this.constantService.defaultSetting[gridType];
        // defaultSetting = defaultSetting ? defaultSetting : this.constantService.defaultSetting['DEFAULT'];
        // gridOptions.RowSelection = defaultSetting.rowSelection ? defaultSetting.rowSelection : gridOptions.RowSelection;
        // gridOptions.SingleClickEdit = defaultSetting.singleClickEdit;
        // gridOptions.pagination = defaultSetting.pagination ? defaultSetting.pagination : gridOptions.pagination;
        // gridOptions.paginationPageSize = defaultSetting.paginationPageSize ?
        //     defaultSetting.paginationPageSize : gridOptions.paginationPageSize;
        // gridOptions.headerHeight = defaultSetting.headerHeight ? defaultSetting.headerHeight : gridOptions.headerHeight;
        // gridOptions.isSideBarRequired = defaultSetting.isSideBarRequired ? defaultSetting.isSideBarRequired : false;
        // gridOptions.isSuppressMenu = defaultSetting.isSuppressMenu ? defaultSetting.isSuppressMenu : false;
        // gridOptions.suppressRowClickSelection = defaultSetting.suppressRowClickSelection ? true : false;
        // gridOptions.overlayLoadingTemplate = defaultSetting.overlayLoadingTemplate ? false : true;
        // gridOptions.rowHeight = defaultSetting.rowHeight ? defaultSetting.rowHeight : gridOptions.rowHeight;

        // gridOptions.isSearchTextBoxRequired =
        //     (defaultSetting.isSearchTextBoxRequired || defaultSetting.isSearchTextBoxRequired === undefined) ? true : false;

        gridOptions.columnDefs = this.getColumnDef(gridType);
        return gridOptions;
    }
    /**
     * To get column definations
     * @param gridType - grid name required to fetch specific column defintions
     */
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
            case this.constantService.reportTypes.SalesComparisonReport:
                col = this.SalesComparisonReportCol();
                return col;
            case this.constantService.reportTypes.taxableItemsReport: col = this.taxableItemsReportCol();
                return col;
            case this.constantService.reportTypes.salesComparisionYearAgoReport: col = this.salesComparisionYearAgoReportCol();
                return col;
            case this.constantService.reportTypes.abnormalProfitMarginReport: col = this.abnormalProfitMarginReportCol();
                return col;
            case this.constantService.reportTypes.salesHistoryByUPCReport: col = this.salesHistoryByUPCReportCol();
                return col;
            case this.constantService.reportTypes.modifierSalesReport: col = this.modifierSalesReportCol();
                return col;
            case this.constantService.reportTypes.sirInventoryControlReport: col = this.sirInventoryControlReportCol();
                return col;
            case this.constantService.reportTypes.lotteryInventoryReport: col = this.lotteryInventoryReport();
                return col;
            case this.constantService.reportTypes.inventoryReport:
                col = this.inventoryReport();
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
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            {
                headerName: 'Invoice Date', field: 'invoiceDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Total Invoice', field: 'totalInvoice' },
            { headerName: 'Invoice Status Description', field: 'invoiceStatusDescription' },
            // 'Store Name', 'Invoice Date', 'Total Invoice', 'Invoice Status Description'
        ];
    }
    PurchaseByInvoiceStatusReportDetailsCol(): any {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 200, rowGroup: true, hide: true },
            {
                headerName: 'Invoice Date', field: 'invoiceDate', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Invoice Created Date Time', field: 'invoiceCreatedDateTime', },
            { headerName: 'Invoice No', field: 'invoiceNo' },
            { headerName: 'Vendor Name', field: 'vendorName' },
            { headerName: 'EDI Invoice', field: 'isEDIInvoice', width: 100, },
            { headerName: 'Status Change Date Time', field: 'actionDateTime' },
            { headerName: 'Invoice Status', field: 'invoiceStatusDescription' },
            { headerName: 'Invoice Action Type Name', field: 'invoiceActionTypeName' },

            // 'Store Name', 'Invoice Date', 'Invoice Created Date Time', 'Invoice No',
            // 'Vendor Name', 'EDI Invoice', 'Status Change Date Time',
            // 'Invoice Status ', 'Invoice Action Type Name'
        ];
    }
    weeklyPurchaseReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department Type', field: 'departType' },
            { headerName: 'Current Week', field: 'currentWeek' },
            { headerName: 'Previous Week', field: 'previousWeek' },
            { headerName: 'Difference', field: 'netResult' },

            // 'Store Name', 'Department Type', 'Current Week', ' Previous Week', 'Difference'
        ];
    }

    weeklySaleReportCol() {
        return [
            { headerName: 'Store Name', field: 'storename', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department Type', field: 'rowcolumn' },
            { headerName: 'Current Week', field: 'currentWeek' },
            { headerName: 'Previous Week', field: 'previousWeek' },
            { headerName: 'Net Value', field: 'netValue' },
            // { headerName: 'Difference ( Current - Privious)', field: 'departmentDescription' },

            // 'Store Name', 'Department', 'Current Week', ' Previous Week', 'Difference ( Current - Privious)'
        ];
    }

    weeklySaleByDepartmentTypeReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department Type', field: 'departmentTypeName' },
            {
                headerName: 'Sales Amount', field: 'salesAmount', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Status', field: 'status1' },
            { headerName: 'Difference', field: 'diff' },
            // 'Store Name', 'Department Type', 'Sales Amount', 'Status', 'Difference'
        ];
    }

    purchaseReportByItemCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 150, rowGroup: true, hide: true },
            { headerName: 'Vendor Name', field: 'vendorName', width: 150 },
            { headerName: 'UPC Code', field: 'posCode', width: 150 },
            { headerName: 'Item', field: 'description', width: 150 },
            {
                headerName: 'Unit Buying Cost', field: 'invoiceValuePrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                },
            },
            { headerName: 'Case Qty', field: 'buyingCaseQuantity', width: 100 },
            {
                headerName: 'Case Price', field: 'casePrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Total Cost', field: 'itemCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                },
            },
            {
                headerName: 'Selling Price', field: 'regularSellPrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                },
            },
            { headerName: 'Margin', field: 'profitMargin', width: 100 },


            // 'Store Name', 'Vendor Name', 'UPC Code', 'Item', 'Unit Buying Cost', 'Case Qty', 'Case Price',
            // 'Total Cost', 'Selling Price', 'Margin',
        ];
    }
    purchaseReportByDepartmentCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Vendor Name', field: 'vendorName' },
            {
                headerName: 'Invoice Date', field: 'invoiceDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Invoice No', field: 'invoiceNo' },
            {
                headerName: 'Amount Paid', field: 'amountPaid', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            // 'Store Name', 'Department', 'Vendor', 'Invoice Date', 'Invoice No', 'Amount Paid'
        ];
    }
    fuelSalesReportCol() {
        return [
            { headerName: 'Store Name', headerClass: 'header-text-center', field: 'StoreName', width: 150, minWidth: 150, cellStyle: { 'text-align': 'center' } },
            { headerName: 'Gas Grade', headerClass: 'header-text-center', field: 'FuelGradeName', width: 150, minWidth: 150, cellStyle: { 'text-align': 'center' } },
            {
                headerName: 'Date', headerClass: 'header-text-center', field: 'BusinessDate', cellStyle: { 'text-align': 'center' }, width: 150, minWidth: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Gas Volume (gal)', headerClass: 'header-text-center', field: 'SaleVolume', width: 150, minWidth: 150, cellStyle: { 'text-align': 'center' } },
            {
                headerName: 'Gas Amount', headerClass: 'header-text-right', field: 'SaleAmount', cellStyle: { 'text-align': 'right' }, width: 150, minWidth: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
        ];
    }
    purchaseReportByItemDetailCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Vendor Name', field: 'vendorName' },
            { headerName: 'UPC Code', field: 'posCode' },
            { headerName: 'Item', field: 'description' },
            { headerName: 'Unit Buying Cost', field: 'invoiceValuePrice' },
            { headerName: 'Unit Buying Quantity', field: 'buyingUnitQuantity' },
            { headerName: 'Case Qty', field: 'buyingCaseQuantity' },
            {
                headerName: 'Case Price', field: 'casePrice', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Total Cost', field: 'itemCost', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Selling Price', field: 'regularSellPrice' },
            { headerName: 'Margin', field: 'profitMargin' },
            { headerName: 'Unit In Case', field: 'unitsInCase' },


            // 'Store Name', 'Vendor Name', 'UPC Code', 'Item', 'Unit Buying Cost', 'Unit Buying Quantity',
            // 'Case Qty', 'Case Price', 'Total Cost', 'Selling Price', 'Margin', 'Unit In Case'
        ];
    }
    purchaseReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 150, rowGroup: true, hide: true },
            {
                headerName: 'Invoice Date', field: 'invoiceDate', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Vendor Name', field: 'vendorName' },
            { headerName: 'Invoice No', field: 'invoiceNo' },
            {
                headerName: 'Invoice Amount', field: 'invoiceAmount', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Amount Paid', field: 'paidAmount', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Payment  Type', field: 'paymentType' },
            { headerName: 'Payment Source', field: 'paymentDetail' },
            { headerName: 'Check Number', field: 'lastCheckNumber' },
            { headerName: 'Invoice Status', field: 'invoiceStatusDescription' },

            // 'Store Name', 'Invoice Date', 'Vendor Name', 'Invoice No', 'Invoice Amount', 'Amount Paid',
            // 'Payment  Type', 'Payment Source', 'Check Number', 'Invoice Status'
        ];
    }
    purchaseReportByVendorCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Vendor Name', field: 'vendorName' },
            {
                headerName: 'Invoice Date', field: 'invoiceDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Invoice No', field: 'invoiceNo' },
            {
                headerName: 'Amount Paid', field: 'amountPaid', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Payment Source', field: 'paymentSource' },
            { headerName: 'Check Number', field: 'checkNumber' },

            // 'Store Name', 'Vendor', 'Invoice Date', 'Invoice No', 'Amount Paid', 'Payment Source', 'Check Number'
        ];
    }
    departmentSalesReportDetailCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            {
                headerName: 'Business Date', field: 'businessDate', width: 100,
                cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Sales Quantity', field: 'salesQuantity', width: 100, },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Percentile of Sales Amount', field: 'totalSalesAmount', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Buying Cost', field: 'buyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Profit', field: 'prof', width: 100 },
            { headerName: 'Margin', field: 'margin', width: 100 },
        ];

    }
    itemSalesReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            {
                headerName: 'UPC Code', field: 'posCode', width: 200,
                cellRendererFramework: BarCodeComponent,
            },
            { headerName: 'Item', field: 'description' },
            { headerName: 'Department', field: 'departmentDescription', width: 100, },
            {
                headerName: 'Unit Buying Cost', field: 'singleUnitBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Price', field: 'singleUnitSalesCost', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Sales Quantity', field: 'salesQuantity', width: 100 },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Percentile of Sales Amount', field: 'totalSalesAmount', width: 100 },
            {
                headerName: 'Buying Cost', field: 'buyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Profit', field: 'profit', width: 100 },
            { headerName: 'Margin', field: 'margin', width: 100 },
        ];
    }
    itemSalesReportDetailCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            {
                headerName: 'Business Date', field: 'businessDate', width: 100
                , cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            {
                headerName: 'UPC Code', field: 'posCode', width: 100
            },
            { headerName: 'Department', field: 'departmentDescription', width: 100, },

            { headerName: 'Item', field: 'description' },
            {
                headerName: 'Unit Buying Cost', field: 'singleUnitBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Price', field: 'singleUnitSalesCost', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Sales Quantity', field: 'salesQuantity', width: 100 },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Percentile of Sales Amount', field: 'totalSalesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Buying Cost', field: 'buyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Profit', field: 'prof', width: 100 },
            { headerName: 'Margin', field: 'margin', width: 100 },
        ];
    }
    salesPercentReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department Description', field: 'departmentDescription', width: 200, },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 200, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Total Sales Amount', field: 'totalSalesAmount', width: 200, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
        ];
    }
    promotionItemsReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 150, rowGroup: true, hide: true },
            {
                headerName: 'Business Date', field: 'businessDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Department Name', field: 'departmentName', width: 100, },
            { headerName: 'UPC Code', field: 'posCode', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            {
                headerName: 'Unit Buying Cost', field: 'unitBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Price', field: 'sellingPrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Promotional Sales Quantity', field: 'promotionalSalesQuantity', width: 100, },
            { headerName: 'Item Sales Quantity', field: 'itemSalesQuantity', width: 100, },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },

            // 'Business Date', 'Store Name', 'UPC Code', 'Department', 'Description', 'Item Sales Quantity', 'Promotional Sales Quantity',
            // 'Unit Buying Cost', 'Sales Amount', 'Selling Price'
        ];
    }
    salesReportByVendorCol() {
        return [
            { headerName: 'Store Name', field: 'storename', width: 150, rowGroup: true, hide: true },
            { headerName: 'UPC Code', field: 'posCode', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            { headerName: 'Selling Units', field: 'sellingUnits', width: 100, },
            { headerName: 'Sales Quantity', field: 'salesQuantity', width: 100, },
            {
                headerName: 'Buying Cost', field: 'salesBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Cost', field: 'sellingPrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Purchased Quantity', field: 'purchasedQuantity', width: 100, },
            {
                headerName: 'Purchase Amount', field: 'purchaseBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Current Inventory', field: 'currentinventory', width: 100, },
            {
                headerName: 'Total Buying Cost', field: 'totalBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Total Selling Cost', field: 'totalSellingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            // { headerName: 'totalBuyingCost', field: 'totalBuyingCost', width: 100, },

            // 'Store Name', 'UPC Code', 'Description', 'Current Inventory', 'Purchased Quantity', 'Sales Quantity', 'Sales Buying Cost',
            // 'Selling Price', 'Selling Units', 'Total Buying Cost', 'total Selling Cost'
        ];
    }
    salesReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 50, rowGroup: true, hide: true },
            { headerName: 'Department  Description', field: 'departmentDescription', width: 100, },
            { headerName: 'Department Type Name', field: 'departmentTypeName', width: 100, },
            {
                headerName: 'Total Amount', field: 'totalAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'UPC Sales Amount', field: 'upcSalesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Open Amount', field: 'openAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            // 'Store Name', 'Department  Description', 'Department Type Name  ', 'Total Amount ', 'UPC Sales Amount', 'Open Amount  '
        ];
    }
    salesReportByPriceGroupCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 50, rowGroup: true, hide: true },
            { headerName: 'Department  Description', field: 'departmentDescription', width: 100, },
            { headerName: 'UPC Code', field: 'posCode', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            { headerName: 'Group Name', field: 'groupName', width: 100, },
            {
                headerName: 'Unit Sales Cost', field: 'singleUnitSalesCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Sales Qty', field: 'salesQuantity', width: 100, },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Buying Cost ', field: 'buyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Unit Buying Cost', field: 'singleUnitBuyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Proft', field: 'profit', width: 100, },
            { headerName: 'Margin', field: 'margin', width: 100, },
            {
                headerName: 'Total Sales Amount', field: 'totalSalesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },

            // 'Store Name', 'Department Description', 'UPC Code', 'Description',
            // 'Group Name ', 'Unit Sales Cost', 'Sales Qty', 'Sales Amount ',
            // 'Buying Cost ', 'Unit Buying Cost', 'Proft', 'Margin', 'Total Sales Amount'
        ];
    }
    departmentSalesReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Sales Quantity', field: 'salesQuantity', width: 100, },
            {
                headerName: 'Sales Amount', field: 'salesAmount', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Percentile of Sales Amount', field: 'totalSalesAmount', width: 150, cellRenderer: (params) => {
                    return this.utilityService.formatSalespercentage(params.value);
                }
            },
            {
                headerName: 'Buying Cost', field: 'buyingCost', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Profit', field: 'prof', width: 100 },
            { headerName: 'Margin', field: 'margin', width: 100 },
        ];

    }
    SalesComparisonReportCol() {
        return [
            { headerName: 'Store Name', field: 'storename', width: 200, rowGroup: true, hide: true },
            { headerName: 'Tag', field: 'tag', },
            { headerName: 'Department', field: 'rowcolumn', },
            { headerName: 'Period', field: 'period', },
            {
                headerName: 'Current Week', field: 'currentWeek', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Previous Week', field: 'previousWeek', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Net Value', field: 'netValue', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Percent Change', field: 'percentChange', cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },

        ];
    }
    taxableItemsReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },
            {
                headerName: 'Business Date', field: 'businessDate', cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Department Name', field: 'departmentName', },
            { headerName: 'UPC Code', field: 'posCode', },
            { headerName: 'Description', field: 'description', },
            { headerName: 'Tax Strategy Description', field: 'taxStrategyDescription', },

        ];
    }
    salesComparisionYearAgoReportCol() {
        return [
            { headerName: 'Department Description', field: 'departmentDescription', width: 100, },
            { headerName: 'Department Type', field: 'departmentType', width: 100, },
            {
                headerName: 'Business Date', field: 'businessDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            {
                headerName: 'Comapred Date', field: 'comapredDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Dated Sales Qty', field: 'datedSalesQty', width: 100, },
            { headerName: 'Compared Sales Qty', field: 'comparedSalesQty', width: 100, },
        ];
    }
    abnormalProfitMarginReportCol() {
        return [
            { headerName: 'Vendor Name', field: 'vendorName', width: 100, },
            { headerName: 'Invoice No', field: 'invoiceNo', width: 100, },
            {
                headerName: 'Created Date Time', field: 'createdDateTime', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            {
                headerName: 'Invoice Value Price', field: 'invoiceValuePrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Regular Sell Price', field: 'regularSellPrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Profit Margin', field: 'profitMargin', width: 100, },
            { headerName: 'Invoice Status Description', field: 'invoiceStatusDescription', width: 100, },
        ];
    }
    salesHistoryByUPCReportCol() {
        return [
            {
                headerName: 'Business Date', field: 'businessDate', width: 60, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'POS Code', field: 'posCode', width: 70, },
            { headerName: 'Description', field: 'description', width: 170, },
            { headerName: 'Department Description', field: 'departmentDescription', width: 60, },
            { headerName: 'Units In Case', field: 'unitsInCase', width: 50, },
            { headerName: 'Last Inventory', field: 'lastInventory', width: 50, },
            { headerName: 'Purchase', field: 'purchase', width: 40, },
            { headerName: 'Sales Qty', field: 'salesqty', width: 40, },
            { headerName: 'Current Inventory', field: 'currentInventory', width: 80, },


        ];
        /*  return [
             { headerName: 'Fuel Grade Name', field: 'fuelGradeName', width: 100, },
             {
                 headerName: 'Business Date', field: 'bdate', width: 100, cellRenderer: (params) => {
                     return this.utilityService.formatDateEmpty(params.value);
                 }
             },
             { headerName: 'Fuel GradeSales Volume', field: 'fuelGradeSalesVolume', width: 100, },
             { headerName: 'Quantity Received', field: 'quantityReceived', width: 100, },
             { headerName: 'Physical Inventory', field: 'physicalInventory', width: 100, },
             { headerName: 'Prev Inv', field: 'previnv', width: 100, },
         ]; */
    }
    modifierSalesReportCol() {
        return [
            { headerName: 'Item Code', field: 'vendorItemCode', width: 100, },
            { headerName: 'UPC code', field: 'poscode', width: 100, },
            { headerName: 'Description', field: 'description', width: 200, },
            { headerName: 'Sold Quantity', field: 'salesQuantity', width: 100, },
            { headerName: 'Min Inventory', field: 'minInventory', width: 100, },
            { headerName: 'Max Inventory', field: 'maxInventory', width: 100, },
            // { headerName: 'departmentDescription', field: 'departmentDescription', width: 100, },
        ];
    }
    sirInventoryControlReportCol() {
        return [
            { headerName: 'Fuel Grade Name', field: 'fuelGradeName', width: 100, },
            {
                headerName: 'Business Date', field: 'bdate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Fuel Grade Sales Volume', field: 'fuelGradeSalesVolume', width: 100, },
            { headerName: 'Quantity Received', field: 'quantityReceived', width: 100, },
            { headerName: 'Physical Inventory', field: 'physicalInventory', width: 100, },
            { headerName: 'Prev Inv', field: 'previnv', width: 100, },
        ];
    }
    lotteryInventoryReport() {
        return [
            { headerName: 'Game No', field: 'gameNo', width: 100, },
            { headerName: 'Game Id', field: 'lotteryGameID', width: 100, },
            { headerName: 'Game Name', field: 'gameName', width: 100, },
            { headerName: 'Confirms Pack', field: 'confirmsPack', width: 100, },
            { headerName: 'Activated Pack', field: 'activatedPack', width: 100, },
            { headerName: 'Total Pack', field: 'totalPack', width: 100, },
            { headerName: 'Ticket Value', field: 'ticketValue', width: 100, },
            { headerName: 'Pack Value', field: 'packValue', width: 100, },
        ];
    }
    inventoryReport() {
        return [
            { headerName: 'UPC Code', field: 'posCode', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            { headerName: 'Department', field: 'departmentDescription', width: 100, },
            { headerName: 'Store Name', field: 'storeName', width: 100, },
            { headerName: 'Quantity', field: 'posCodeModifier', width: 100, },
            {
                headerName: 'Buying Cost', field: 'inventoryValuePrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Price', field: 'regularSellPrice', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            { headerName: 'Current Inventory', field: 'currentInventory', width: 100, },
            {
                headerName: 'Buying Value', field: 'buyingValue', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
            {
                headerName: 'Selling Value', field: 'sellingValue', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDecimalCurrency(params.value);
                }
            },
        ];
    }
    unupdatedInventoryReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, },
            { headerName: 'Department Description', field: 'departmentDescription', width: 100, },
            { headerName: 'POS Code', field: 'posCode', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            { headerName: 'Inventory As Of Date', field: 'inventoryAsOfDate', width: 100, },
            { headerName: 'Current Inventory', field: 'currentInventory', width: 100, },
        ];
    }
    itemTxnReportCol() {
        return [
            { headerName: 'UPC Code', field: 'posCode', width: 60, },
            { headerName: 'Description', field: 'description', width: 150, },
            { headerName: 'Purchases', field: 'purchases', width: 40, },
            { headerName: 'Sales', field: 'sales', width: 40, },
            { headerName: 'Stock Adjustment', field: 'stockAdjustment', width: 60, },
            { headerName: 'Current Inventory', field: 'currentInventory', width: 60, },
        ];
    }
    shrinkageReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, },
            { headerName: 'Department Description', field: 'departmentDescription', width: 100, },
            { headerName: 'UPC', field: 'upc', width: 100, },
            { headerName: 'Description', field: 'description', width: 100, },
            {
                headerName: 'Start Inventory Date', field: 'startInventoryDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Starting Inventory', field: 'startingInventory', width: 100, },
            { headerName: 'Purchases', field: 'purchases', width: 100, },
            { headerName: 'Sales', field: 'sales', width: 100, },
            { headerName: 'Final Inventory', field: 'finalInventory', width: 100, },
            {
                headerName: 'Final Inventory Date', field: 'finalInventoryDate', width: 100, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Shrinkage', field: 'shrinkage', width: 100, },
        ];
    }

    inventoryPurchaseReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', width: 100, rowGroup: true, hide: true },

            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Sales Amount', field: 'salesAmount' },
            {
                headerName: 'Purchase Amount', field: 'purchaseAmount', cellRenderer: (params) => {
                    return (params.value !== null || params.value === 'null') ? "-" : params.value;
                }
            },
        ];
    }

    inventoryPurchaseDetailReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', rowGroup: true, hide: true },
            {
                headerName: 'Date', field: 'date', rowGroup: true, hide: true, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Sales Amount', field: 'salesAmount' },
            {
                headerName: 'Purchase Amount', field: 'purchaseAmount', cellRenderer: (params) => {
                    return (params.value !== null || params.value === 'null') ? "-" : params.value;
                }
            },
        ];
    }
    bankDepositReportCol() {
        return [
            /*  { headerName: 'Store Name', field: 'storeName', rowGroup: true, hide: true },
             {
                 headerName: 'Date', field: 'date', rowGroup: true, hide: true, cellRenderer: (params) => {
                     return this.utilityService.formatDateEmpty(params.value);
                 }
             },
             { headerName: 'Department', field: 'departmentDescription' },
             { headerName: 'Sales Amount', field: 'salesAmount' },
             {
                 headerName: 'Purchase Amount', field: 'purchaseAmount', cellRenderer: (params) => {
                     return (params.value !== null || params.value === 'null') ? "-" : params.value;
                 }
             }, */
        ];
    }
    bankDepositSummaryReportCol() {
        return [
            { headerName: 'Store Name', field: 'storeName', rowGroup: true, hide: true },
            {
                headerName: 'Date', field: 'date', rowGroup: true, hide: true, cellRenderer: (params) => {
                    return this.utilityService.formatDateEmpty(params.value);
                }
            },
            { headerName: 'Department', field: 'departmentDescription' },
            { headerName: 'Sales Amount', field: 'salesAmount' },
            {
                headerName: 'Purchase Amount', field: 'purchaseAmount', cellRenderer: (params) => {
                    return (params.value !== null || params.value === 'null') ? "-" : params.value;
                }
            },
        ];
    }
}