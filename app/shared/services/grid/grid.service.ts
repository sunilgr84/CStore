import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';
import { PercentPipe } from '@angular/common';
import { UtilityService } from '../utility/utility.service';
import { CommonService } from '../commmon/common.service';
import * as moment from 'moment';
import { UploadButtonComponent } from '@shared/component/expandable-grid/partials/upload-button.component';
import { DetailButtonComponent } from '@shared/component/expandable-grid/partials/details-button-renderer.component';
import { BankLogoButtonComponent } from '@shared/component/expandable-grid/partials/bank-logo.component';
import { debug } from 'console';

@Injectable()
export class GridService {
  gridOption: any;
  constructor(private constantService: ConstantService, private utilityService: UtilityService
    , private commonService: CommonService) {

  }

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
    const gridOptions = {
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
      rowClassRules: {},
      gridType: gridType,
      suppressCellSelection: false,
      rowDeselection: false,
      detailRowHeight: null,
      enableRangeSelection: false
    };
    let defaultSetting = this.constantService.defaultSetting[gridType];
    defaultSetting = defaultSetting ? defaultSetting : this.constantService.defaultSetting['DEFAULT'];
    gridOptions.RowSelection = defaultSetting.rowSelection ? defaultSetting.rowSelection : gridOptions.RowSelection;
    gridOptions.SingleClickEdit = defaultSetting.singleClickEdit;
    gridOptions.pagination = defaultSetting.pagination ? defaultSetting.pagination : gridOptions.pagination;
    gridOptions.paginationPageSize = defaultSetting.paginationPageSize ? defaultSetting.paginationPageSize : gridOptions.paginationPageSize;
    gridOptions.headerHeight = defaultSetting.headerHeight ? defaultSetting.headerHeight : gridOptions.headerHeight;
    gridOptions.isSideBarRequired = defaultSetting.isSideBarRequired ? defaultSetting.isSideBarRequired : false;
    gridOptions.isSuppressMenu = defaultSetting.isSuppressMenu ? defaultSetting.isSuppressMenu : false;
    gridOptions.suppressRowClickSelection = (defaultSetting.suppressRowClickSelection === true || defaultSetting.suppressRowClickSelection === false) ? defaultSetting.suppressRowClickSelection : gridOptions.suppressRowClickSelection;
    gridOptions.overlayLoadingTemplate = defaultSetting.overlayLoadingTemplate ? false : true;
    gridOptions.rowHeight = defaultSetting.rowHeight ? defaultSetting.rowHeight : gridOptions.rowHeight;
    gridOptions.suppressCellSelection = defaultSetting.suppressCellSelection ? defaultSetting.suppressCellSelection : false;
    gridOptions.isSearchTextBoxRequired =
      (defaultSetting.isSearchTextBoxRequired || defaultSetting.isSearchTextBoxRequired === undefined) ? true : false;
    gridOptions.rowDeselection = defaultSetting.rowDeselection ? defaultSetting.rowDeselection : gridOptions.rowDeselection;
    gridOptions.detailRowHeight = defaultSetting.detailRowHeight ? defaultSetting.detailRowHeight : null;
    gridOptions.enableRangeSelection = defaultSetting.enableRangeSelection ? defaultSetting.enableRangeSelection : false;
    gridOptions.columnDefs = this.getColumnDef(gridType);
    return gridOptions;
  }
  /**
   * To get column definations
   * @param gridType - grid name required to fetch specific column defintions
   */
  getColumnDef(gridType) {
    let col;
    switch (gridType) {
      case this.constantService.gridTypes.demoGrid:
        col = this.demoGridCol();
        return col;
      case this.constantService.gridTypes.companyUserMgmtGrid:
        col = this.companyUserMgmtGridCols();
        return col;
      case this.constantService.gridTypes.companyGrid:
        col = this.getCompanyGridCol();
        return col;
      case this.constantService.gridTypes.paymentSourceGrid:
        col = this.paymentSourceGridCol();
        return col;
      case this.constantService.gridTypes.employeeTimeCardGrid:
        col = this.employeeTimeCardGridGridCol();
        return col;
      case this.constantService.gridTypes.siteMessageGrid:
        col = this.siteMessageGridCol();
        return col;
      case this.constantService.gridTypes.itemRefenceGrid:
        col = this.itemReferenceCol();
        return col;
      case this.constantService.gridTypes.storeInfoGrid:
        col = this.storeInfoGridCol();
        return col;
      case this.constantService.gridTypes.fuelInventoryActivityGrid:
        col = this.fuelInventoryActivityGridCol();
        return col;
      case this.constantService.gridTypes.detailTableGrid:
        col = this.detailTableGrid();
        return col;
      case this.constantService.gridTypes.demoExpandableGrid:
        col = this.demoExpandableGrid();
        return col;
      case this.constantService.gridTypes.storeCompetitorGrid:
        col = this.storeCompetitorGridCol();
        return col;
      // case this.constantService.gridTypes.salesRestrictionGrid:
      //   col = this.salesRestrictionGridCol();
      //   return col;
      case this.constantService.gridTypes.departmentGrid:
        col = this.departmentGridCol();
        return col;
      case this.constantService.gridTypes.departmentLocationGrid:
        col = this.departmentLocationGridCol();
        return col;
      case this.constantService.gridTypes.departmentHistoryGrid:
        col = this.departmentHistoryGridCol();
        return col;
      case this.constantService.gridTypes.deptWithoutLocGrid:
        col = this.deptWithoutLocGridCol();
        return col;
      case this.constantService.gridTypes.fuelGradeMappingGrid:
        col = this.fuelGradeMappingGridCol();
        return col;
      case this.constantService.editableGridConfig.fuelGradeTankDetailsGrid:
        col = this.fuelGradeTankDetailsGridCol();
        return col;
      case this.constantService.gridTypes.storeFuelGradeTaxesGrid:
        col = this.storeFuelGradeTaxesGridCol();
        return col;
      case this.constantService.gridTypes.salesTaxGrid:
        col = this.salesTaxGridCol();
        return col;
      // case this.constantService.gridTypes.paymentMethodGrid:
      //   col = this.paymentMethodGridCol();
      //   return col;
      case this.constantService.gridTypes.invoicesDetailsGrid:
        col = this.invoicesDetailsGridCol();
        return col;
      case this.constantService.gridTypes.vendorGrid:
        col = this.vendorGridCol();
        return col;
      case this.constantService.gridTypes.lotteryInventoryGrid:
        col = this.lotteryInventoryGridCol();
        return col;
      case this.constantService.gridTypes.lotteryGameGrid:
        col = this.lotteryGameGridCol();
        return col;
      // case this.constantService.gridTypes.storeFeesGrid:
      //   col = this.storeFeesGridCol();
      //   return col;
      case this.constantService.gridTypes.comfirmPackGrid:
        col = this.comfirmPackGridCol();
        return col;
      case this.constantService.gridTypes.activatePackGrid:
        col = this.activatePackGridCol();
        return col;
      case this.constantService.gridTypes.masterDepartmentGrid:
        col = this.masterDepartmentGridCol();
        return col;
      case this.constantService.gridTypes.masterDepartmentTypeGrid:
        col = this.masterDepartmentTypeGridCol();
        return col;
      case this.constantService.gridTypes.houseAccountGrid:
        col = this.houseAccountGridCol();
        return col;
      case this.constantService.gridTypes.priceGroupGrid:
        col = this.priceGroupGrid();
        return col;
      case this.constantService.gridTypes.activateConfirmGrid:
        col = this.activateConfirmGrid();
        return col;
      case this.constantService.gridTypes.mixMatchesGroupGrid:
        col = this.mixMatchesGroupGridCol();
        return col;
      case this.constantService.gridTypes.vendorItemGrid:
        col = this.vendorItemGridCol();
        return col;
      case this.constantService.gridTypes.mixMatchItemGrid:
        col = this.mixMatchItemGridCol();
        return col;
      case this.constantService.gridTypes.mixMatchPriceLocationGrid:
        col = this.mixMatchPriceLocationGridCol();
        return col;
      case this.constantService.gridTypes.mixMatchStoreGrid:
        col = this.mixMatchStoreGridCol();
        return col;
      case this.constantService.gridTypes.deletePOSItemGrid:
        col = this.getPOSItemGridCol();
        return col;
      case this.constantService.gridTypes.itemMaintanenceGrid:
        col = this.itemMaintanenceGridCol();
        return col;
      case this.constantService.gridTypes.includedItemListMaintanenceGrid:
        col = this.includedItemListMaintanenceGridCol();
        return col;
      case this.constantService.gridTypes.itemListMaintanenceGrid:
        col = this.itemListMaintanenceGridCol();
        return col;
      case this.constantService.gridTypes.physicalInventoryGrid:
        col = this.physicalInventoryGridCol();
        return col;
      case this.constantService.gridTypes.multipacksIGrid:
        col = this.multipacksIGridCol();
        return col;
      case this.constantService.gridTypes.stockTransactionsGrid:
        col = this.stockTransactionsGrid();
        return col;
      case this.constantService.gridTypes.masterInventoryBuyTagGrid:
        col = this.masterInventoryBuyTagGridCol();
        return col;
      case this.constantService.gridTypes.supreItemsGrid:
        col = this.supreItemsGridCol();
        return col;
      case this.constantService.gridTypes.cBuyDownScheduleGrid:
        col = this.cBuyDownScheduleGridCol();
        return col;
      case this.constantService.gridTypes.addBuyDownScheduleGrid:
        col = this.addBuyDownScheduleGridCol();
        return col;
      case this.constantService.gridTypes.currentPriceScheduleGrid:
        col = this.currentPriceScheduleGridCol();
        return col;
      case this.constantService.gridTypes.newPriceScheduleGrid:
        col = this.newPriceScheduleGridCol();
        return col;
      case this.constantService.gridTypes.masterPriceGroupGrid:
        col = this.masterPriceGroupGridCol();
        return col;
      case this.constantService.gridTypes.userRoleWiseCompanyGrid:
        col = this.userRoleWiseCompanyGridCol();
        return col;
      case this.constantService.gridTypes.privilageGrid:
        col = this.privilageGridCol();
        return col;
      case this.constantService.gridTypes.storeFuelGrid:
        col = this.storeFuelGridCol();
        return col;
      case this.constantService.gridTypes.fuelGradeTankGrid:
        col = this.fuelGradeTankGridCol();
        return col;
      case this.constantService.gridTypes.fuelGradeBlendDetailsGrid:
        col = this.fuelGradeBlendDetailsGridCol();
        return col;
      // case this.constantService.gridTypes.fuelTaxGrid:
      //   col = this.fuelTaxGridCol();
      //   return col;
      case this.constantService.gridTypes.fuelInvoiceGrid:
        col = this.fuelInvoiceGridCol();
        return col;
      case this.constantService.gridTypes.binInvoiceGrid:
        col = this.binInvoiceGridCol();
        return col;
      case this.constantService.gridTypes.actionInvoiceGrid:
        col = this.actionInvoiceGrid();
        return col;
      case this.constantService.gridTypes.filesInvoiceGrid:
        col = this.filesInvoiceGridCol();
        return col;
      case this.constantService.gridTypes.orderManagementGrid:
        col = this.orderManagementGridCol();
        return col;
      case this.constantService.gridTypes.vendorPaymentGrid:
        col = this.vendorPaymentGridCol();
        return col;
      case this.constantService.gridTypes.reconcileHouseGrid:
        col = this.reconcileHouseGridCol();
        return col;
      case this.constantService.gridTypes.validateInvoiceGrid:
        col = this.validateInvoiceGridCol();
        return col;
      case this.constantService.gridTypes.excessInventoryGrid:
        col = this.excessInventoryGridCol();
        return col;
      // case this.constantService.gridTypes.addInvoicesDetailsGrid:
      //   col = this.addInvoicesDetailsGridCol();
      //   return col;
      case this.constantService.gridTypes.invoicesDepartmentDetailsGrid:
        col = this.invoicesDepartmentDetailsGridCol();
        return col;
      case this.constantService.gridTypes.fuelInvoiceDetailGrid:
        col = this.fuelInvoiceDetailGridCol();
        return col;
      case this.constantService.gridTypes.fuelInvoiceTotalGrid:
        col = this.fuelInvoiceTotalGridCol();
        return col;
      case this.constantService.gridTypes.pjrSearchGrid:
        col = this.pjrSearchGridCol();
        return col;
      case this.constantService.gridTypes.importGroupGrid:
        col = this.importGroupGridCol();
        return col;
      case this.constantService.gridTypes.itemPriceGroupExpandGrid:
        col = this.itemPriceGroupGridCol();
        return col;
      case this.constantService.gridTypes.comboMaintanenceGrid:
        col = this.comboMaintanenceGridCol();
        return col;
      case this.constantService.gridTypes.mixMatchMaintanenceGrid:
        col = this.mixMatchMaintanenceGridCol();
        return col;
      case this.constantService.gridTypes.companyPriceGroupGrid:
        col = this.companyPriceGroupGridCol();
        return col;
      case this.constantService.gridTypes.competitorPricingGrid:
        col = this.competitorPricingGridCol();
        return col;
      case this.constantService.gridTypes.networkSummaryGrid:
        col = this.networkSummaryGridCol();
        return col;
      case this.constantService.gridTypes.fuelReconciliationGrid:
        col = this.fuelReconciliationGridCol();
        return col;
      case this.constantService.gridTypes.fuelReconciliationNetworkBatchGrid:
        col = this.fuelReconciliationNetworkBatchGridCol();
        return col;
      case this.constantService.gridTypes.fuelReconciliationFuelInvoicechGrid:
        col = this.fuelReconciliationFuelInvoicechGridCol();
        return col;

      case this.constantService.gridTypes.scanDataSetupGrid:
        col = this.scanDataSetupGridCol();
        return col;
      case this.constantService.gridTypes.billofLadingGrid:
        col = this.billofLadingGridCol();
        return col;
      case this.constantService.gridTypes.taxStrategyGrid:
        col = this.taxStrategyGridCol();
        return col;
      case this.constantService.gridTypes.salesRestrictCodeGrid:
        col = this.salesRestrictCodeGridCol();
        return col;
      case this.constantService.gridTypes.tenderCodeGrid:
        col = this.tenderCodeGridCol();
        return col;
      case this.constantService.gridTypes.mdseCodeGrid:
        col = this.mdseCodeGridCol();
        return col;
      case this.constantService.gridTypes.passportItemGrid:
        col = this.passportItemGridCol();
        return col;
      case this.constantService.gridTypes.sapphireCustIDGrid:
        col = this.sapphireCustIDGridCol();
        return col;
      case this.constantService.gridTypes.sapphireDepartmentGrid:
        col = this.sapphireDepartmentGridCol();
        return col;
      case this.constantService.gridTypes.sapphireMOPGrid:
        col = this.sapphireMOPGridCol();
        return col;
      case this.constantService.gridTypes.sapphireTaxGrid:
        col = this.sapphireTaxGridCol();
        return col;
      case this.constantService.gridTypes.passportHtmlGrid:
        col = this.passportHtmlGridCol();
        return col;
      case this.constantService.gridTypes.sapphireItemGrid:
        col = this.sapphireItemGridCol();
        return col;
      case this.constantService.gridTypes.custIDGrid:
        col = this.custIDGridCol();
        return col;
      case this.constantService.gridTypes.rubyDepartmentGrid:
        col = this.rubyDepartmentGridCol();
        return col;
      case this.constantService.gridTypes.itemFromCSVGrid:
        col = this.itemFromCSVGridCol();
        return col;
      case this.constantService.gridTypes.rubyMOPGrid:
        col = this.rubyMOPGridCol();
        return col;
      case this.constantService.gridTypes.rubyTaxGrid:
        col = this.rubyTaxGridCol();
        return col;
      case this.constantService.gridTypes.rubySubashGrid:
        col = this.rubySubashGridCol();
        return col;
      case this.constantService.gridTypes.rubyRGISGrid:
        col = this.rubyRGISGridCol();
        return col;
      case this.constantService.gridTypes.ediInvoiceGrid:
        col = this.ediInvoiceGridCol();
        return col;
      case this.constantService.gridTypes.ediProcessGrid:
        col = this.ediProcessGridCol();
        return col;
      case this.constantService.gridTypes.editfuelReconciliationFuelInvoicechGrid:
        col = this.editfuelReconciliationFuelInvoicechGridCol();
        return col;
      case this.constantService.gridTypes.editFuelReconciliationNetworkBatchGrid:
        col = this.editFuelReconciliationNetworkBatchGridCol();
        return col;
      case this.constantService.gridTypes.MasterPriceBookItemGrid:
        col = this.MasterPriceBookItemGridCol();
        return col;
      case this.constantService.gridTypes.employeeSetupGrid:
        col = this.employeeSetupGridCol();
        return col;
      case this.constantService.gridTypes.repCashCheckAmounGrid:
        col = this.repCashCheckAmounGridCol();
        return col;
      case this.constantService.gridTypes.repDepartmentTypeSalesGrid:
        col = this.repDepartmentTypeSalesGridCol();
        return col;
      case this.constantService.gridTypes.repGasGradeDatasGrid:
        col = this.repGasGradeDatasGridCol();
        return col;
      case this.constantService.gridTypes.repMOPDetailsGrid:
        col = this.repMOPDetailsGridCol();
        return col;
      case this.constantService.gridTypes.zReportGrid:
        col = this.zReportGridCol();
        return col;
      case this.constantService.gridTypes.dayReconGrid:
        col = this.dayReconGridCol();
        return col;
      case this.constantService.gridTypes.storeHealthGrid:
        col = this.storeHealthGridCol();
        return col;
      case this.constantService.gridTypes.serviceHealthGrid:
        col = this.serviceHealthGridCol();
        return col;
      case this.constantService.gridTypes.pjrGrid:
        col = this.pjrGridCol();
        return col;
      case this.constantService.gridTypes.dashboardGrid:
        col = this.dashboardGridCol();
        return col;
      case this.constantService.gridTypes.storeBillingSubPaymentHistoryGrid:
        col = this.storeBillingSubPaymentHistoryGridCol();
        return col;
      case this.constantService.gridTypes.storeBillingSubSubscriptionHistoryGrid:
        col = this.storeBillingSubSubscriptionHistoryGridCol();
        return col;
      case this.constantService.gridTypes.subscriptionDetailGrid:
        col = this.subscriptionDetailGridGridCol();
        return col;
      case this.constantService.gridTypes.expensesGrid:
        col = this.expensesGridCol();
        return col;
      case this.constantService.gridTypes.dayReconGasDetailGrid:
        col = this.dayReconGasDetailGridCol();
        return col;
      case this.constantService.gridTypes.networkCardGrid:
        col = this.networkCardGridCol();
        return col;
      case this.constantService.gridTypes.categoryCardGrid:
        col = this.categoryCardGridCol();
        return col;
      case this.constantService.gridTypes.purchasesGrid:
        col = this.purchasesGridCol();
        return col;
      case this.constantService.gridTypes.importPurchasesGrid:
        col = this.importPurchasesGridCol();
        return col;
      case this.constantService.gridTypes.importFuelPurchasesGrid:
        col = this.importFuelPurchasesGridCol();
        return col;
      case this.constantService.gridTypes.dayReconPromotionsDetailGrid:
        col = this.dayReconPromotionsDetailGridCol();
        return col;
      case this.constantService.gridTypes.expensesDetailGrid:
        col = this.expensesDetailGridCol();
        return col;
      case this.constantService.gridTypes.masterPriceGropDetailGrid:
        col = this.masterPriceGropDetailGridCol();
        return col;
      case this.constantService.gridTypes.dataFromPOSGrid:
        col = this.getDataFromPOSGridCol();
        return col;
      case this.constantService.gridTypes.dataToPOSGrid:
        col = this.getDataToPOSGridCol();
        return col;
      case this.constantService.gridTypes.comfirmPackBatchGrid:
        col = this.comfirmPackBatchGridCol();
        return col;
      case this.constantService.gridTypes.activatePackBatchGrid:
        col = this.activatePackBatchGridCol();
        return col;
      case this.constantService.gridTypes.dashboardSettingGrid:
        col = this.dashboardSettingGridCol();
        return col;
      case this.constantService.gridTypes.dashboardSettingNonFunGrid:
        col = this.dashboardSettingNonFunGridCol();
        return col;
      case this.constantService.gridTypes.itemListChildGrpGrid:
        col = this.itemListChildGrpGridCol();
        return col;
      case this.constantService.gridTypes.defaultRolePrivilegeGrid:
        col = this.defaultRolePrivilegeGridCol();
        return col;
      case this.constantService.gridTypes.userPrivilegeGrid:
        return this.userPrivilegeGridCol();
      case this.constantService.gridTypes.salesTotalMgmtGrid:
        col = this.salestotalMgmtCol();
        return col;
      case this.constantService.gridTypes.priceGrpItemDetailGrid:
        col = this.priceGrpItemDetailGridCol();
        return col;
      case this.constantService.gridTypes.companyPriceGroupChildGrid:
        col = this.companyPriceGroupGridChildCol();
        return col;
      case this.constantService.gridTypes.companyPriceGroupGridChildColWithSPGrid:
        col = this.companyPriceGroupGridChildColWithSPCol();
        return col;
      case this.constantService.gridTypes.storeGrpGrid:
        col = this.storeGrpGridCol();
        return col;
      case this.constantService.gridTypes.timeOffGetGrid:
        col = this.timeOffGetGrid();
        return col;
      case this.constantService.gridTypes.timeOffGetGridByRole:
        col = this.timeOffGetGridByRole();
        return col;
      case this.constantService.gridTypes.gridemployeeTimesheetDetail:
        col = this.gridemployeeTimesheetDetail();
        return col;
      case this.constantService.gridTypes.adjustemployeeTimesheetDetail:
        col = this.adjustemployeeTimesheetDetail();
        return col;
    }
  }

  /**
   * return with percent string format
   * @param params parameter of cell
   */
  percentCellRenderer(params) {
    let value = params.value;
    if (value === undefined || value == null) { value = 0; }
    const percentPipe = new PercentPipe('en-US');
    // console.log(params.value, percentPipe.transform(value, '2.2-2')); // actually below should like this line
    return percentPipe.transform(value / 100, '2.2-2'); // whats wrong with this? 25 --> 2500.00%
  }
  dateFormat(value) {
    return moment(value).format('MM-DD-YYYY');
  }

  dateFormatBySplit(value) {
    if (value !== undefined) {
      let date = value.split("-");
      return date[1] + "-" + date[2] + "-" + date[0];
    } else {
      return "";
    }
  }

  nonEditableCheckBoxCellRenderer = (isChecked: boolean) => {
    if (isChecked) {
      return '<div class="text-center"><i style="font-size: 18px;padding-top: 0.4rem !important;color: green;" class="fa fa-check-circle pt-1" aria-hidden="true"></i></div>';
    } else {
      return '<div class="text-center"><i style="font-size: 18px;padding-top: 0.4rem !important;" class="fa fa-times-circle pt-1" aria-hidden="true"></i></div>';
    }
  }
  eventClicked(event){
    debugger
    console.log("Event change called",event.target.value);

  }

  InputCellRenderer = (isChecked: boolean) => {
    if(isChecked){
      return '<input type="text" name="updatedinventory" style="border:none;outline:0px;" (change)="eventClicked($event)" />';
    }
    else{

    }
  }



  demoGridCol() {
    return [
      { headerName: '', field: '', checkboxSelection: true, width: 55, suppressSorting: true },
      { headerName: 'UPC Code', field: 'upcCode', width: 120 },
      { headerName: 'Description', field: 'description', width: 250 },
      { headerName: 'Active Department', field: 'activeDept' },
      { headerName: 'Selling Units', field: 'sellingUnits' },
      { headerName: 'Unit Per Case', field: 'unitCase' },
      { headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer', colId: 'params', width: 150, suppressSorting: false }
    ];
  }
  companyUserMgmtGridCols() {
    return [
      { headerName: 'Company', field: 'companyName' },
      { headerName: 'User Name', field: 'userName' },
      { headerName: 'Email', field: 'email' },
      { headerName: 'Role', field: 'role' },
      { headerName: 'Store Name', field: 'storeNames' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
        width: 100, suppressSorting: false
      },
    ];
  }
  getCompanyGridCol() {
    return [
      { field: 'companyName', headerName: 'Company Name', cellRenderer: 'agGroupCellRenderer', },
      { field: 'companyLoginCode', headerName: 'Store Name', hide: true },
      { field: 'companyAddressLine1', headerName: 'Address', },
      { field: 'city', headerName: 'City', },
      { field: 'stateCode', headerName: 'State', width: 90 },
      { field: 'phoneNo', headerName: 'Phone No', width: 120 },
      // {
      //   field: 'enableMobileLogging', headerName: 'Enable Mobile Login',
      //   cellRenderer: (params) => {
      //     if (params.data.enableMobileLogging) {
      //       return '<i class="fa fa-check-square-o" aria-hidden="true"></i>'
      //     } else {
      //       return '<i class="fa fa-ban" aria-hidden="true"></i>'
      //     }
      //   },
      // },
      {
        field: 'isActive', headerName: 'Status', filter: false, width: 90,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isActive)
      },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer', colId: 'params',
        filter: false, width: 90, suppressSorting: false,
        cellRendererParams: { hideDeleteAction: true },
      }
    ];
  }
  paymentSourceGridCol() {
    return [
      { headerName: 'Bank Name', field: 'sourceName', width: 240, cellRenderer: 'agGroupCellRenderer' },
      { headerName: 'Routing Number', field: 'routingNumber', width: 100 },
      { headerName: 'Account Type', field: 'chartOfAccountTypeName', width: 200 },
      { headerName: 'City', field: 'city', width: 150 },
      { headerName: 'State', field: 'stateCode', width: 70 },
      {
        headerName: 'Signature', field: 'value', width: 100, editable: false, suppressSorting: false,
        cellRendererFramework: UploadButtonComponent
      },
      {
        headerName: 'Bank Logo', field: 'value', width: 100, editable: false, suppressSorting: false,
        cellRendererFramework: BankLogoButtonComponent,
      },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer',
        filter: false, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }

  employeeTimeCardGridGridCol() {
    return [
      { headerName: 'Employee Id', field: 'employeeId' },
      { headerName: 'Name', field: 'name' },
      { headerName: 'Date', field: 'date', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Clock-In Time', field: 'clockInTime' },
      { headerName: 'Clock-Out Time', field: 'clockOutTime' },
      { headerName: 'Total Hours', field: 'totalHours' },
    ];
  }

  siteMessageGridCol() {
    return [
      { headerName: 'MessageHeader', field: 'MessageHeader' },
      { headerName: 'Message', field: 'Message', width: 300 },
      { headerName: 'Effective From', field: 'EffectiveFromDateTime' },
      { headerName: 'Effective Till', field: 'EffectiveTillDateTime' },
      { headerName: 'Display Order', field: 'DisplayOrder' },
      { headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params', width: 100, suppressSorting: false },
    ];
  }

  itemReferenceCol() {
    return [
      { headerName: 'UPC Code', field: 'UPCCode', width: 100 },
      { headerName: 'Description', field: 'Description', width: 100 },
      { headerName: 'Department', field: 'Department', width: 100 },
      { headerName: 'Price Group', field: 'PriceGroup', width: 100 },
      { headerName: 'package Size', field: 'PackageSize', width: 100 },
      {
        headerName: 'Suggested Selling Price', field: 'SuggestedSellingPrice', width: 150,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Vender ItemCode', field: 'VenderItemCode', width: 150 },
      { headerName: 'Brand', field: 'Brand', width: 100 },
      { headerName: 'UPC Code Format', field: 'UPCCodeFormat', width: 150 },
      { headerName: 'Selling Units', field: 'sellingUnits', width: 100 },
      { headerName: 'Unit Per Case', field: 'unitPerCase', width: 100 },
      {
        headerName: 'Last Modified Date', field: 'lastModifiedDate', width: 150,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer', colId: 'params', width: 90, suppressSorting: false }
    ];
  }
  storeInfoGridCol() {
    return [
      { field: 'storeName', headerName: 'Store', width: 150 },
      { field: 'storeAddressLine1', headerName: 'Address', width: 200 },
      { field: 'city', headerName: 'City', width: 120 },
      // { field: 'stateCode', headerName: 'State', width: 120 },
      { field: 'posSystemCD', headerName: 'POS Type', width: 120 }, // pOsSystemName
      { field: 'phoneNo', headerName: 'Contact', width: 150 },
      {
        field: 'isInPOSSyncStatus', headerName: 'Status', width: 100,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isInPOSSyncStatus)
      },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer',
        colId: 'params', width: 105, suppressSorting: false,
        cellRendererParams: {
        hideDeleteAction: true
      },
      }
    ];
  }
  demoExpandableGrid() {
    return [
      {
        field: 'name',
        cellRenderer: 'agGroupCellRenderer'
      },
      { field: 'account' },
      { field: 'calls' },
      {
        field: 'minutes',
        valueFormatter: 'x.toLocaleString()' + 'm'
      }
    ];
  }
  storeCompetitorGridCol() {
    return [
      { headerName: 'Competitor Name', field: 'storeCompetitorName' },
      { headerName: 'Store Name', field: 'storeName' },
      { headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer', colId: 'params', width: 90, suppressSorting: false }
    ];
  }


  departmentGridCol() {

    return [
      {
        headerName: '', field: 'department', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true,
      },
      { headerName: 'No of Items', field: 'noOfItems', cellStyle: { 'text-align': 'right' }, width: 120 },
      { headerName: 'Department', field: 'departmentDescription', width: 120 },
      { headerName: 'Department Type', field: 'departmentTypeName', width: 210 },
      {
        headerName: 'Status', field: 'activeFlag', width: 85,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.activeFlag)
      },
      {
        headerName: 'Allow Open Department Sale', field: 'isDepartmentOpen', width: 180,
        headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isDepartmentOpen)
      },
      {
        headerName: 'Profit Margin', field: 'departmentProfitMargin', width: 100, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'POS Department Code', field: 'POSDepartmentCode', headerClass: 'header-text-wrap', width: 150 },
      { headerName: 'Store Name', field: 'storeName', width: 100 },
      {
        headerName: 'Profit Percent', field: 'profitPercent', width: 120, headerClass: 'header-text-wrap',
        cellRenderer: this.percentCellRenderer
      },
      {
        headerName: 'Allow Food Stamps', field: 'allowFoodStampsFlag', width: 120, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.allowFoodStampsFlag)
      },
      {
        headerName: 'Department Negative', field: 'isDepartmentNegative', width: 120, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isDepartmentNegative)
      },
      {
        headerName: 'BlueLaw1 Enabled', field: 'isBlueLaw1Enabled', width: 120,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isBlueLaw1Enabled)
      },
      {
        headerName: 'BlueLaw2 Enabled', field: 'isBlueLaw2Enabled', width: 120,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isBlueLaw2Enabled)
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
        width: 100, suppressSorting: false, pinned: 'right'
      },
    ];
  }
  departmentLocationGridCol() {

    return [
      { headerName: 'Store Name', field: 'storeName' },
      { headerName: 'POS Department Code', field: 'posDepartmentCode', width: 200, headerClass: 'header-text-wrap' },
      { headerName: 'Location Department Description', field: 'posDepartmentDescription', width: 200, headerClass: 'header-text-wrap' },
      { headerName: 'Sales Restriction Description', field: 'salesRestrictionDescription', width: 200, headerClass: 'header-text-wrap' },
      { headerName: 'Tax Name', field: 'taxStrategyDescription', width: 180, headerClass: 'header-text-wrap' },
      { headerName: 'Profit Percent', field: 'profitPercent', width: 100, cellRenderer: this.percentCellRenderer },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
        width: 100, suppressSorting: false,
      },
    ];
  }

  departmentHistoryGridCol() {
    return [
      { headerName: 'Store', field: 'store' },
      { headerName: 'Buying Cost', field: 'buyingCost' },
      { headerName: 'Qty Purchased', field: 'qtyPurchased' },
      { headerName: 'Non UPC Sales Qty', field: 'nonUPCSalesQty', width: 80 },
      { headerName: 'UPC Sales Qty', field: 'upcSalesQty', width: 250 },
      { headerName: 'Total Sales Qty', field: 'totalSalesQty', width: 120 },
      { headerName: 'Sales Amount', field: 'salesAmount', width: 120 },
      { headerName: 'Percent Profit Margin', field: 'percentProfitMargin', width: 100 },
    ];
  }

  deptWithoutLocGridCol() {
    return [
      { headerName: 'Store Name', field: 'storeName', width: 135 },
      { headerName: 'Department Description', field: 'departmentDescription', width: 210 },
      { headerName: 'No of Items in Department', field: 'noOfItemsInDepartment', width: 220 },
    ];
  }

  fuelGradeMappingGridCol() {
    return [
      // { headerName: 'Store Fuel Grade No', field: 'storeFuelGradeNo' },
      { headerName: 'Fuel Grade', field: 'fuelGrade', width: 200 },
      { headerName: 'Store Fuel Grade', field: 'fuelGradeName', width: 200 },
      { headerName: 'Department', field: 'departmentDescription', width: 200 },
      { headerName: 'Color', field: 'color', width: 137 },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', width: 100, suppressSorting: false, pinned: 'right'
      },
    ];
  }
  fuelGradeTankDetailsGridCol() {
    return [
      { headerName: 'Tank Number', field: 'storeTankNo', headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'tankName', headerClass: 'header-text-wrap' },
      { headerName: 'Capacity', field: 'tankVolume', headerClass: 'header-text-wrap' },
      { headerName: 'Reorder Level', field: 'isBlend', headerClass: 'header-text-wrap' },
      { headerName: 'Tank Ullage', field: 'tankUllage', headerClass: 'header-text-wrap' },
      { headerName: 'Current Tank Volume', field: 'currentTankVolume', headerClass: 'header-text-wrap' },
      { headerName: 'Tank Type', field: 'isTankUnderground', headerClass: 'header-text-wrap' },
    ];
  }
  storeFuelGradeTaxesGridCol() {
    return [
      { headerName: 'Fuel Tax Name', field: 'fuelTaxDescription' },
      { headerName: 'Fuel Grade Name', field: 'fuelGradeName' },
      {
        headerName: 'Fuel Tax Rate', field: 'fuelTaxRate', width: 100,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalDigit(params.value);
        }
      },
      {
        headerName: 'Apply To All Grades', field: 'isApplyPrice',
        valueFormatter: (params) => {
          if (params.value === true) {
            return 'Yes';
          } else {
            return 'No';
          }
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', width: 100, suppressSorting: false, pinned: 'right'
      },
    ];
  }


  salesTaxGridCol() {
    return [
      { headerName: 'POS Tax', field: 'posTaxStrategyID', width: 120 },
      { headerName: 'Tax Name', field: 'taxStrategyDescription', width: 210 },
      {
        headerName: 'City Tax', field: 'cityTax', width: 100,
        cellRenderer: (params) => {
          params.value = this.utilityService.formatDecimalDigit(params.value);
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'County Tax', field: 'countyTax', width: 120,
        cellRenderer: (params) => {
          params.value = this.utilityService.formatDecimalDigit(params.value);
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'State Tax', field: 'stateTax', width: 120,
        cellRenderer: (params) => {
          params.value = this.utilityService.formatDecimalDigit(params.value);
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params', width: 80, suppressSorting: false },

    ];
  }
  // paymentMethodGridCol() {
  //   return [
  //     { headerName: 'Store MOPNo', field: 'storeMOPNo', width: 300 },
  //     { headerName: 'MOP Name', field: 'mopName', width: 300 },
  //     {
  //       field: 'isSystemMOP', headerName: 'System MOP', filter: false,
  //       cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isSystemMOP)
  //     },
  //     {
  //       headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
  //       colId: 'params', width: 120, suppressSorting: false,
  //     },
  //   ];
  // }
  invoicesDetailsGridCol() {
    return [
      {
        headerName: '', field: 'itemCheck', width: 30, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true
      },
      {
        headerName: 'Invoice Date', field: 'invoiceDate', width: 90, cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Invoice No', field: 'invoiceNo', width: 90, },
      // { headerName: 'Invoice Name', field: '', width: 150 },
      // {
      //   headerName: 'Invoice Date', field: 'invoiceDate', width: 150
      //   , cellRenderer: (params) => {
      //     return this.utilityService.formatDate(params.value);
      //   }
      // },
      { headerName: 'Location', field: 'storeName', width: 120 },
      { headerName: 'Vendor', field: 'vendorName', width: 140 },
      {
        headerName: 'Invoice Amount', field: 'invoiceAmount', width: 100, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Paid Amount', field: 'paidAmount', width: 100, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      // { headerName: 'Payment Source', field: 'sourceName', width: 130 },
      // { headerName: 'Check No', field: 'lastCheckNumber', width: 100, },

      {
        headerName: 'Status', field: 'invoiceStatusDescription', width: 130,
        cellRenderer: (params: any) => {
          if (params.data.invoiceStatusID === 5) return '<div class="badge badge-success fs-12">' + params.value + '</div>';
          else return params.value;
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
        cellRendererParams: { showClone: true, showNote: true, showOpen: false, hideDeleteAction: true },
        width: 100, suppressSorting: false, pinned: 'right'
        // hide: true
      },
    ];
  }
  vendorGridCol() {
    return [
      { headerName: 'Account Code', field: 'vendorCode', width: 150, cellRenderer: 'agGroupCellRenderer' },
      { headerName: 'Account Name', field: 'vendorName', width: 250 },
      { headerName: 'City', field: 'city', width: 110 },
      { headerName: 'State', field: 'stateName', width: 110 },
      { headerName: 'Phone No', field: 'companyPhoneNo', width: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Sales Contact Name', field: 'salesContactName', width: 160, headerClass: 'header-text-wrap' },
      { headerName: 'Sales Contact Phone', field: 'salesContactPhoneNo', width: 150, headerClass: 'header-text-wrap' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', width: 100, suppressSorting: false,
      },
    ];
  }
  lotteryInventoryGridCol() {
    return [
      { headerName: 'Bin/Slot', field: 'binNo', width: 120, },
      { headerName: 'Game No', field: 'gameNo', width: 130, },
      { headerName: 'Game', field: 'gameName', width: 150, },
      {
        headerName: 'Pack Value', field: 'packValue', width: 100, headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Ticket Value', field: 'ticketValue', width: 105, headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Pack No', field: 'packNumber', width: 100, headerClass: 'header-text-wrap' },
      {
        headerName: 'Activation Date', field: 'activationDateTime', headerClass: 'header-text-wrap'
        , width: 140, cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Opening Ticket No', field: 'openingTicketNo', width: 140, headerClass: 'header-text-wrap' },
      // { headerName: 'End Ticket No', field: 'currentTicketNo', width: 110, headerClass: 'header-text-wrap' },
      { headerName: 'End Ticket No', field: 'ticketNo', width: 110, headerClass: 'header-text-wrap' },
      {
        headerName: 'All Sold', field: 'isSold', width: 90,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isSold), headerClass: 'header-text-wrap'
      },
      { headerName: 'Aging', field: 'aging', width: 110, headerClass: 'header-text-wrap' },
      { headerName: 'Total Qty Sold', field: 'totalQtySold', width: 110, headerClass: 'header-text-wrap' },
      {
        headerName: 'Amount', field: 'amount', width: 130, headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      // {
      //   headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
      //   colId: 'params', width: 100, suppressSorting: false, pinned: 'right'
      // },
    ];
  }
  lotteryGameGridCol() {
    return [
      {
        headerName: '', field: 'department', width: 55, checkboxSelection: true,
        suppressMenu: true,
        suppressSorting: true,
      },
      { headerName: 'Game Number', field: 'gameNo', width: 150 },
      { headerName: 'Game Name', field: 'gameName', width: 150 },
      {
        headerName: 'Ticket Value$', field: 'ticketSellingPrice', width: 150, editable: true,
        cellEditor: 'numericEditor'
      },
      {
        headerName: 'Status', field: 'isActive', width: 150,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isActive)
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        colId: 'params', width: 100, suppressSorting: false,
        cellRendererParams: { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false },
      },
    ];
  }
  // storeFeesGridCol() {
  //   return [
  //     { headerName: 'Fees Name', field: 'feeDescription', width: 150 },
  //     { headerName: 'POS Fee ID', field: 'posFeeID', width: 150 },
  //     {
  //       headerName: 'POS Fee', field: 'posFee', width: 150, cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     {
  //       headerName: 'POS Amount Range', field: 'posAmountRange', width: 200, cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     {
  //       headerName: 'Is Refundable', field: 'isRefundable', width: 150,
  //       cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isRefundable)
  //     },
  //     {
  //       headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
  //       colId: 'params', width: 100, suppressSorting: false
  //     },
  //   ];
  // }
  comfirmPackGridCol(): any {
    return [
      { headerName: 'Game Number', field: 'gameNo' },
      { headerName: 'Game Name', field: 'gameName' },
      { headerName: 'Pack Number', field: 'packNumber' },
      { headerName: 'Confirmed Date', field: 'confirmationDateTime', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Confirmed By', field: 'confirmedBy' },
    ];
  }
  comfirmPackBatchGridCol(): any {
    return [
      { headerName: 'Game Number', field: 'lotteryGameNo' },
      { headerName: 'Pack Number', field: 'packNo' }
    ];
  }
  activatePackBatchGridCol(): any {
    return [
      { headerName: 'Game Number', field: 'lotteryGameNo' },
      { headerName: 'Pack Number', field: 'packNo' },
      { headerName: 'Bin Number', field: 'binNo', editable: true },
    ];
  }
  activatePackGridCol(): any {
    return [
      { headerName: 'Bin Number', field: 'binNo' },
      { headerName: 'Game Number', field: 'gameNo' },
      { headerName: 'Game Name', field: 'gameName' },
      { headerName: 'Pack Number', field: 'packNumber' },
      { headerName: 'Activate Date', field: 'confirmationDateTime', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Activate By', field: 'activatedBy' },
    ];
  }
  masterDepartmentGridCol(): any {
    return [
      // { headerName: 'Sr. No.', field: 'no' },
      { headerName: 'Department Description', minWidth: 100, field: 'masterDepartmentDescription', headerClass: 'header-text-center' },
      { headerName: 'Department Type', minWidth: 100, field: 'departmentTypeName', headerClass: 'header-text-center' },
      { headerName: 'Department Product Code', minWidth: 100, field: 'naxProductCode', headerClass: 'header-text-center' },
      {
        headerName: 'Is Fuel Product', field: 'isFuelProduct', headerClass: 'header-text-center', minWidth: 100,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isFuelProduct)
      },
      {
        headerName: 'Action', headerClass: 'header-text-center', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', width: 100, minWidth: 50, suppressSorting: false,
        cellRendererParams: { hideDeleteAction: false, hideEditAction: false, gridType: this.constantService.gridTypes.masterDepartmentGrid }
      },
    ];
  }
  masterDepartmentTypeGridCol() {
    return [
      { headerName: 'Department Type', field: 'departmentTypeName', minWidth: 75, width: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Naxml Department Type', field: 'naxmlDepartmentTypeCodeID', minWidth: 70, width: 140, headerClass: 'header-text-wrap' },
      {
        headerName: 'Is Fractional Qty Allowed', field: 'isFractionalQtyAllowedFlag', headerClass: 'header-text-wrap', minWidth: 65, width: 130,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isFractionalQtyAllowedFlag)
      },
      {
        headerName: 'Is Item Returnable', field: 'isItemReturnableFlag', minWidth: 60, width: 125, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isItemReturnableFlag)
      },
      {
        headerName: 'Is Department Negative', field: 'isDepartmentNegative', minWidth: 70, width: 140, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isDepartmentNegative)
      },
      {
        headerName: 'Is Inside Sales Dept', field: 'isInsideSalesDept', minWidth: 60, width: 115, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isInsideSalesDept)
      },
      {
        headerName: 'Allow Food Stamps', field: 'allowFoodStampsFlag', minWidth: 60, width: 120, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.allowFoodStampsFlag)
      },
      {
        headerName: 'Sales Restriction Required', field: 'salesRestrictionRequiredFlag', minWidth: 75, width: 150, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.salesRestrictionRequiredFlag)
      },
      {
        headerName: 'Display Order', field: 'displayOrder', width: 100, minWidth: 50, headerClass: 'header-text-wrap',
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', width: 100, minWidth: 50, cellRenderer: 'CellRenderer',
        cellRendererParams: { hideDeleteAction: false, hideEditAction: false, gridType: this.constantService.gridTypes.masterDepartmentTypeGrid }
      }
    ];
  }
  houseAccountGridCol(): any {
    return [
      { headerName: 'Account Code', field: 'accountCode', width: 100, minWidth: 100, headerClass: 'header-text-wrap' },
      { headerName: 'Account Name', field: 'accountName', width: 130, minWidth: 130, headerClass: 'header-text-wrap' },
      { headerName: 'Payment Terms', field: 'paymentTerms', width: 130, minWidth: 130, headerClass: 'header-text-wrap' },
      {
        headerName: 'Credit Limit', field: 'creditLimit', width: 90, minWidth: 90, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return params.value === 0 ? "$0" : this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Fed ID', field: 'fedID', width: 100, minWidth: 100, headerClass: 'header-text-wrap' },
      { headerName: 'Contact Name', field: 'name', width: 100, minWidth: 100, headerClass: 'header-text-wrap' },
      { headerName: 'Phone No', field: 'phoneNo', width: 150, minWidth: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Email', field: 'email', width: 175, minWidth: 175, },
      {
        headerName: 'Address', field: 'address', width: 155, minWidth: 155,
        cellRenderer: (params) => {
          return !params.value ? "-" : params.value;
        }
      },
      {
        headerName: 'City', field: 'city', width: 100, minWidth: 100,
        cellRenderer: (params) => {
          return !params.value ? "-" : params.value;
        }
      },
      {
        headerName: 'State', field: 'stateName', width: 100, minWidth: 100,
        cellRenderer: (params) => {
          // console.log(params)
          return !params.value ? "-" : params.value;
        }
      },
      {
        headerName: 'County', field: 'countyName', width: 90, minWidth: 90, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return !params.value ? "-" : params.value;
        }
      },
      {
        headerName: 'Zip Code', field: 'zipCode', width: 90, minWidth: 90, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return !params.value ? "-" : params.value;
        }
      },
      { headerName: 'Action', field: 'action', colId: 'params', width: 100, minWidth: 100, cellRenderer: 'CellRenderer', pinned: 'right' }
    ];
  }
  priceGroupGrid() {
    return [
      { headerName: 'Group Name', field: 'masterGroupName', minWidth: 100, headerClass: 'header-text-center' },
      { headerName: 'Brand', field: 'brandName', minWidth: 100, headerClass: 'header-text-center' },
      {
        headerName: 'Is Default', field: 'isDefault', minWidth: 100, width: 150, headerClass: 'header-text-center',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isDefault)
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', minWidth: 70, cellRenderer: 'CellRenderer', width: 100, headerClass: 'header-text-center',
        cellRendererParams: { hideDeleteAction: false, hideEditAction: false, showDetails: true, gridType: this.constantService.gridTypes.priceGroupGrid },
      }
    ];
  }
  activateConfirmGrid() {
    return [
      { headerName: 'Game No', field: 'lotteryGameNo' },
      {
        headerName: '', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 60,
        cellRendererParams: { hideEditAction: true },
      }

    ];
  }
  mixMatchesGroupGridCol() {
    return [
      { headerName: 'Mix & Match Name', field: 'mixMatchName' },
      { headerName: 'Promotion Type', field: 'promotionType' },
      { headerName: 'Mix & Match Item Count', field: 'mixMatchItemCount' },
      { headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 120 }
    ];
  }
  vendorItemGridCol() {
    return [
      { headerName: 'Vendor', field: 'vendorName' },
      { headerName: 'Vendor Code', field: 'vendorCode' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 80,
        cellRendererParams: { hideEditAction: false, hideDeleteAction: true },
      }

    ];
  }


  mixMatchItemGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description', width: 400 },
      { headerName: 'Active', field: 'active' },
      { headerName: 'Department', field: 'department' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 100
      }
    ];
  }
  mixMatchPriceLocationGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description', width: 400 },
      { headerName: 'Price', field: 'price' },
      { headerName: 'Department', field: 'department' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 80
      }
    ];
  }
  mixMatchStoreGridCol() {
    return [
      { headerName: 'Store Name', field: 'storeName' },
      {
        headerName: 'Begin Date', field: 'beginDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'End Date', field: 'endDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Co-Fund', field: 'coFund' },
      { headerName: 'Manufacturer Funded', field: 'manufacturerFunded' },
      { headerName: 'Retaller Funded', field: 'retallerFunded' },
      { headerName: 'MixMatch Value', field: 'mixMatchValue' },
      { headerName: 'MixMatch Qty', field: 'mixMatchQty' },
      { headerName: 'POSSyncStatus', field: 'posSyncStatus' },
      { headerName: 'Sent To POS Data', field: 'sentToPOSData' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRendererParams: { hideEditAction: true },
        cellRenderer: 'CellRenderer', width: 80
      }
    ];
  }

  getPOSItemGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Department', field: 'department' },
      { headerName: 'POS Department Code', field: 'departmentCode' },
      { headerName: 'Location Deleted', field: 'deletedLocation' },
      { headerName: 'Store', field: 'store' },
      { headerName: 'Deleted Date Time', field: 'dateTime', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'POS Sync Status', field: 'posSyncStatus' },
      { headerName: 'Deleted By', field: 'deletedBy' }
    ];
  }
  itemMaintanenceGridCol() {
    return [
      { headerName: 'Item List Name', field: 'itemListName' },
      { headerName: 'Item Count', field: 'itemCount', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center', },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer', width: 50,
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
      }
    ];
  }
  includedItemListMaintanenceGridCol() {
    return [
      { headerName: 'UPC', field: 'posCode', width: 150 },
      { headerName: 'Description', field: 'description', width: 150 },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRendererParams: { hideEditAction: true },
        cellRenderer: 'CellRenderer', width: 90
      }
    ];
  }
  itemListMaintanenceGridCol() {
    return [
      { headerName: 'UPC', field: 'posCode', width: 150 },
      { headerName: 'Description', field: 'description', width: 150 },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRendererParams: {
          hideEditAction: true,
          hideDeleteAction: true, hideAddAction: true
        },
        cellRenderer: 'CellRenderer', width: 90
      }
    ];
  }
  physicalInventoryGridCol() {
    return [
      // { headerName: 'Sr No', field: 'srNo' },
      { headerName: 'Department', field: 'departmentDescription', headerClass: 'header-text-wrap' },
      { headerName: 'UPC Code', field: 'poscode', headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap' },
      { headerName: 'Store Name', field: 'storeName', headerClass: 'header-text-wrap' },
      {
        headerName: 'Inventory Date', field: 'inventoryDate', cellRenderer: (params: any) => this.dateFormat(params.value),
        headerClass: 'header-text-wrap'
      },
      { headerName: 'Checked By', field: 'createdBy', headerClass: 'header-text-wrap' },
      {
        headerName: 'Buying Cost', field: 'inventoryValuePrice', cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap header-text-center', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Selling Price', field: 'regularSellPrice', cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap header-text-center', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Physical Inventory', field: 'physicalInventory', headerClass: 'header-text-wrap' },
      { headerName: 'Current Inventory', field: 'currentInventory', headerClass: 'header-text-wrap' },
    ];
  }
  multipacksIGridCol() {
    return [
      { headerName: 'POS Code Modifier', field: 'posCodeModifier', width: 250, cellStyle: { 'text-align': 'center' }, },
      {
        headerName: 'Cost Price', field: 'unitCostPrice', width: 250,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Selling Price', field: 'regularPackageSellPrice', width: 250,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Profit %', field: 'grossProfit', width: 260,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      // {
      //   headerName: 'Action', field: 'action', colId: 'params', cellRendererParams: { hideEditAction: false },
      //   cellRenderer: 'CellRenderer', width: 80
      // }
    ];
  }
  stockTransactionsGrid() {
    return [
      { headerName: 'UPC Code', field: 'posCode' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Transactions Type', field: 'stockTransactionTypeDescription', headerClass: 'header-text-center' },
      { headerName: 'Store', field: 'storeName' },
      { headerName: 'To Store', field: 'toStoreName' },
      {
        headerName: 'Selling Price', field: 'regularSellPrice', headerClass: 'header-text-center', cellStyle: { 'text-align': 'right' }, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Quantity', field: 'transactionQuantity', headerClass: 'header-text-center', cellStyle: { 'text-align': 'center' }, },
      { headerName: 'Notes', field: 'notes' },
      {
        headerName: 'Transaction Date', field: 'createdDateTime', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          params.data.createdDateTime = this.utilityService.formatDate(params.value);
          return this.utilityService.formatDate(params.value);
        }
      },
    ];
  }
  masterInventoryBuyTagGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Department', field: 'department' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRendererParams: { hideEditAction: false },
        cellRenderer: 'CellRenderer', width: 75
      }
    ];
  }
  supreItemsGridCol() {
    return [
      { headerName: 'POS Code', field: 'posCode' },
      { headerName: 'Item Description', field: 'itemDescription' },
      { headerName: 'Company Name', field: 'companyName' },
      { headerName: 'Department Description', field: 'departmentDescription' },
      { headerName: 'Unit Per Case', field: 'unitPerCase' },
    ];
  }
  cBuyDownScheduleGridCol() {
    return [
      { headerName: 'Store', field: 'Store' },
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'Description' },
      { headerName: 'Start Date', field: 'startDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'End Date', field: 'endDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Buy Down', field: 'buyDown' },
      { headerName: 'Price Push Date Time', field: 'pricePushDate', cellRenderer: (params: any) => this.dateFormat(params.value) }
    ];
  }
  addBuyDownScheduleGridCol() {
    return [
      {
        headerName: 'Action', field: 'itemCheck', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      { headerName: 'Store', field: 'Store' },
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'Description' },
      { headerName: 'Price', field: 'pricePush' },
      { headerName: 'Item Popup', field: 'itemPopup' }
    ];
  }
  currentPriceScheduleGridCol() {
    return [
      { headerName: 'Store', field: 'store' },
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Start Date', field: 'startDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'End Date', field: 'endDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Promotion Price', field: 'promotionPrice' },
      { headerName: 'Regular Selling Price', field: 'regularSellingPrice' },
    ];
  }
  newPriceScheduleGridCol() {
    return [
      { headerName: 'Store', field: 'store' },
      { headerName: 'UPC Code', field: 'upcCode' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Selling Units', field: 'sellingUnits' },
      { headerName: 'Price', field: 'price' },
    ];
  }
  masterPriceGroupGridCol() {
    return [
      { headerName: 'Group Name', field: 'groupName' },
      { headerName: 'Update Price', field: 'updatePrice' },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 80
      }
    ];
  }
  userRoleWiseCompanyGridCol() {
    return [
      {
        headerName: '', field: 'isAssigned', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true,
        cellRenderer: (params: any) => {
          if (this.commonService.companyNames) {
            this.commonService.companyNames.forEach((x) => {
              if (x.trim() === params.data.companyName.trim()) {
                params.node.setSelected(true);
              }
            });
          }
        }
      },
      { headerName: 'Companies', field: 'companyName', width: 400 },
    ];
  }
  privilageGridCol() {
    return [
      { headerName: '', field: 'parentName', hide: true, rowGroup: true },
      { headerName: 'Privilege Title', field: 'normaliseName' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params', width: 80,
        cellRendererParams: { hideEditAction: true, hideDeleteAction: false }, suppressSorting: false
      }
    ];
  }
  storeFuelGridCol() {
    return [
      {
        headerName: 'Store Fuel Grade No', field: 'storeFuelGradeNo', cellRenderer: 'agGroupCellRenderer',
        // rowGroup: true
      },
      // { headerName: ' Fuel Grade ', field: 'storeFuelGradeName', hide: true },
      { headerName: 'Store Fuel Grade Name', field: 'storeFuelGradeName' },
      { headerName: 'Fuel Department', field: 'departmentDescription' },
      { headerName: 'Tax', field: 'taxDescription' },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 115, cellRendererParams: { hideDeleteAction: false },
      }
    ];
  }
  fuelGradeTankGridCol() {
    return [
      { headerName: 'Tank Number', field: 'storeTankNo', cellRenderer: 'agGroupCellRenderer', headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'tankName', headerClass: 'header-text-wrap' },
      { headerName: 'Capacity (gal.)', field: 'tankVolume', headerClass: 'header-text-wrap' },
      { headerName: 'Reorder Level (gal.)', field: 'tankReOrderVolume', headerClass: 'header-text-wrap' },
      { headerName: 'Tank Ullage (%)', field: 'tankUllage', headerClass: 'header-text-wrap' },
      { headerName: 'Current Tank Volume', field: 'currentTankVolume', width: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Tank Type', field: 'tankTypeName', headerClass: 'header-text-wrap' },
      {
        headerName: 'Connect Tank', field: 'connectedStoreTankID', headerClass: 'header-text-wrap',
        // cellRendererParams: { hideEditAction: true }, colId: 'params',
        suppressSorting: false,
        editable: true,
        // pinned: 'right',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          if (!params.data.connectedStoreTankDetail && params.data.tankTypeName === 'Manifold') {
            const allowedTanks = this.getTankListArray(params.data.storeTankNo, params.data.connectedStoreTankID);
            return {
              values: allowedTanks,
            };
          }
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 115, cellRendererParams: { hideDeleteAction: false },
      }
    ];
  }
  fuelGradeBlendDetailsGridCol() {
    return [
      { headerName: 'Fuel Grade', field: 'primaryFuelGradeBlendID', editable: true },
      { headerName: 'Percentage', field: 'primaryFuelBlendPercentage', editable: true },
    ];
  }
  getTankListArray(storeTankNo, connectedStoreTankID) {
    const tankList = this.utilityService._storeFuelGradeList;
    const finalArray = [''];
    if (tankList) {
      tankList.forEach((x) => {
        if (x.storeTankNo !== storeTankNo && x.connectedStoreTankID === connectedStoreTankID && x.tankTypeName === 'Manifold') {
          const contct = x.storeTankNo + ',' + x.tankName;
          finalArray.push(contct);
        }
      });
      return finalArray;
    }
  }
  // fuelTaxGridCol() {
  //   return [
  //     { headerName: 'Fuel Tax Description', field: 'fuelTaxDescription' },
  //     {
  //       headerName: 'Fuel Tax Rate', field: 'fuelTaxRate', cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     {
  //       headerName: 'State Tax', field: '', cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     { headerName: 'Tax Calculation Method', field: '' },
  //     {
  //       headerName: 'Tax to all Fuel Grade', field: 'isApplyPrice',
  //       cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isApplyPrice)
  //     },

  //     {
  //       headerName: 'Action', field: 'action', colId: 'params',
  //       cellRenderer: 'CellRenderer', width: 110, cellRendererParams: { hideDeleteAction: false, hideEditAction: false },
  //     }
  //   ];
  // }
  fuelInvoiceGridCol() {
    return [
      {
        headerName: 'Invoice Date', field: 'invoiceDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Store', field: 'storeName' },
      { headerName: 'Vendor', field: 'vendorName' },
      {
        headerName: 'Invoice Amount', field: 'invocieAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Total Gallon', field: 'totalQuantityReceived' },
      { headerName: 'Invoice No.', field: 'invoiceNo' },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 115, cellRendererParams: { hideDeleteAction: false, hideEditAction: false },
      }
    ];
  }
  binInvoiceGridCol() {
    return [
      { headerName: 'Store Name', field: 'storeName' },
      { headerName: 'Vendor Name', field: 'vendorName' },
      { headerName: 'Invoice No.', field: 'invoiceNo' },
      { headerName: 'Invoice Date', field: 'invoiceDate', cellRenderer: (params: any) => this.dateFormat(params.value) },
      {
        headerName: 'Invoice Amount', field: 'invoiceAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Created Date', field: 'createdDateTime', cellRenderer: (params: any) => this.dateFormat(params.value) },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 115, cellRendererParams: {
          hideDeleteAction: false, hideEditAction: false, showDownload: true
        },
      }
    ];
  }
  actionInvoiceGrid() {
    return [
      { headerName: 'Invoice No', field: 'invoiceNo' },
      { headerName: 'Invoice Status', field: 'invoiceStatusDescription' },
      { headerName: 'Action Type', field: 'invoiceActionTypeName' },
      {
        headerName: 'Action Date', field: 'actionDateTime',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Action By', field: 'actionBy' },
    ];
  }
  filesInvoiceGridCol() {
    return [
      { headerName: 'Store Name', field: 'storeName' },
      { headerName: 'Invoice No', field: 'invoiceNo' },
      {
        headerName: 'Created Date', field: 'createdDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Vendor Name', field: 'vendorName' },
      { headerName: 'File Name', field: 'fileName' },
    ];
  }
 
  fuelInventoryActivityGridCol() {
    return [
      { headerName: 'Fuel Grade', field: 'gradeName' },
      { headerName: 'Date', field: 'date',
       cellRenderer: (params: any) => {
        params.data.createdDateTime = this.utilityService.formatDate(params.value);
        return this.utilityService.formatDate(params.value);
      }
      },
      { headerName: 'Opening Balance', field: 'openingBalance' },
      { headerName: 'Purchase', field: 'purchase' },
      { headerName: 'Sale', field: 'sales' },
      { headerName: 'Closing Balance', field: 'closingBalance' },
    ];
  }

  detailTableGrid() {
    return [
      { headerName: 'UPC code', field: 'ISMUPC' },
      { headerName: 'Item Description', field: 'Description' },
      { headerName: 'Quantity', field: 'SalesQuantity' },
      { headerName: 'Selling Price', field: 'SalesAmount' },
      { headerName: 'Buying Cost', field: 'ActualBuyingCost' }
    ]
  }

  orderManagementGridCol() {
    return [
      { headerName: 'Store Name', field: 'storeName' },
      { headerName: 'Vendor Name', field: 'vendorName' },
      {
        headerName: 'Order Date', field: 'orderDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 115, cellRendererParams: { hideDeleteAction: false, hideEditAction: false },
      }
    ];
  }
  vendorPaymentGridCol(): any {
    return [
      { headerName: 'Payment Type', field: '' },
      { headerName: 'Store', field: '' },
      { headerName: 'Vendor Name', field: '' },
      { headerName: 'Source Name', field: '' },
      { headerName: 'Date Of Issue', field: '', },
      { headerName: 'Date Of Payment', field: '' },
      { headerName: 'Actual Payment Date', field: '' },
      {
        headerName: 'Amount', field: '', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  reconcileHouseGridCol(): any {
    return [
      { headerName: 'Account Name', field: 'accountName' },
      { headerName: 'Amount Due', field: 'dueAmount' },
      {
        headerName: 'Paid Amount', field: 'amountPaid', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Paid Date', field: 'paidDate' },
      { headerName: 'Payment Terms', field: 'paymentType' },
      { headerName: 'Check No.', field: 'checkNo' },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', cellRendererParams: { hideDeleteAction: false, hideEditAction: false },
      }
    ];
  }
  validateInvoiceGridCol(): any {
    return [
      {
        headerName: 'Invoice Date', field: 'invoiceDate', headerClass: 'header-text-wrap'
        , cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Invoice No', field: 'invoiceNo', headerClass: 'header-text-wrap' },
      { headerName: 'Location', field: 'storeName', headerClass: 'header-text-wrap' },
      { headerName: 'Vendor', field: 'vendorName', headerClass: 'header-text-wrap' },
      {
        headerName: 'Invoice Amount', field: 'invoiceAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Paid Amount', field: 'paidAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Difference Amount', field: 'dueAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      }
    ];
  }
  excessInventoryGridCol(): any {
    return [
      { headerName: 'Vendor Code', field: '' },
      { headerName: 'Vendor Item No', field: '' },
      { headerName: 'Pack POS Code', field: '' },
      { headerName: 'Description', field: '' },
      { headerName: 'Department Name', field: '' },
      { headerName: 'Week Avg Purchases', field: '' },
      { headerName: 'Week Avg Sales', field: '' },
      { headerName: 'Project Sales Till Order', field: '' },
      { headerName: 'Current Inventory', field: '' },
      { headerName: 'Excess Inventory', field: '' },
      {
        headerName: 'selling Price', field: '', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Total Amount', field: '', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      }
    ];
  }
  // addInvoicesDetailsGridCol() {
  //   return [
  //     {
  //       headerName: '', field: 'invoiceDetail', width: 85, checkboxSelection: true,
  //       suppressMenu: true, suppressSorting: true,
  //       headerCheckboxSelection: true,
  //     },
  //     { headerName: 'Sr No', field: 'sequenceNumber', width: 80 },
  //     { headerName: 'UPC Code', field: 'posCode', width: 150 },
  //     { headerName: 'Vendor Code', field: 'vendorItemCode', width: 100 },
  //     { headerName: 'Description', field: 'description', width: 120 },
  //     { headerName: 'Deparatment', field: 'departmentDescription', width: 130 },
  //     { headerName: 'Unit Case', field: 'unitsInCase', width: 100 },
  //     {
  //       headerName: 'Buying Cost', field: 'regularSellPrice', width: 100, cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     { headerName: 'Buying Case Qty', field: 'buyingCaseQuantity', width: 100 },
  //     { headerName: 'Buying Unit Qty', field: 'buyingUnitQuantity', width: 100 },
  //     {
  //       headerName: 'Case Cost', field: 'casePrice', width: 100, cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     {
  //       headerName: 'Total Cost', field: 'totalItemCost', width: 100, cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     { headerName: 'Selling', field: 'sellingUnits', width: 100 },
  //     { headerName: 'Margin', field: 'profitMargin', width: 100 },
  //     {
  //       headerName: '', field: 'action', colId: 'params',
  //       cellRenderer: 'CellRenderer', width: 60, pinned: 'right', cellRendererParams: { hideDeleteAction: false, hideEditAction: true },
  //     }
  //   ];
  // }
  invoicesDepartmentDetailsGridCol() {
    return [
      { headerName: 'Department', field: 'departmentDescription', headerClass: 'header-text-wrap', width: 300 },
      {
        headerName: 'Buying Price', field: 'totalItemCost', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Selling Price', field: 'totalSellPrice', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Profit Price', field: 'profitCost', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  fuelInvoiceDetailGridCol() {
    return [
      { headerName: 'Description', field: 'storeFuelGradeName', cellRenderer: 'agGroupCellRenderer' },
      {
        headerName: 'Quantity', field: 'quantityReceived'
      },
      {
        headerName: 'Basis', field: 'quantityReceived',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Price', field: 'unitCostPrice',
        cellRenderer: (params) => {
          return this.utilityService.formatSevenDecimal(params.value);
        }
      },
      {
        headerName: 'Amount', field: 'totalAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', cellRendererParams: { hideDeleteAction: false, hideEditAction: false },
      }
    ];
  }
  fuelInvoiceTotalGridCol(): any {
    return [
      { headerName: 'Fuel Grade', field: 'storeFuelGradeName' },
      {
        headerName: 'Per Cost Gallon', field: 'perGallonCost', cellRenderer: (params) => {
          return this.utilityService.formatFourDecimal(params.value);
        }
      },
      {
        headerName: 'Total Amount', field: 'totalAmount', cellRenderer: (params) => {
          return this.utilityService.formatFourDecimalCurrency(params.value);
        }
      },
    ];
  }
  pjrSearchGridCol() {
    return [
      {
        headerName: 'Date', field: 'date ',
        cellRenderer: (params: any) => {
          return this.dateFormatBySplit(params.data.date);
        }
      },
      { headerName: 'Time', field: 'time' },
      { headerName: 'Event', field: 'event' },
      {
        headerName: 'Net Amount', field: 'netAmt', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  importGroupGridCol() {
    return [
      {
        headerName: '', field: 'group', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: false
      },
      { headerName: 'Group Name', field: 'masterGroupName' },
      { headerName: 'Manufacturer', field: 'manufacturerName' },
      { headerName: 'Brand', field: 'brandName' },
      { headerName: 'Package', field: 'uomDescription' },
      {
        headerName: '', field: 'action', colId: 'params', width: 100,
        cellRenderer: 'CellRenderer', cellRendererParams: { hideEditAction: true, hideDeleteAction: true, showDetails: true, },
      }
    ];
  }

  itemPriceGroupGridCol() {
    return [
      // { headerName: '', field: 'srNo', cellRenderer: 'agGroupCellRenderer', width: 50 },
      { headerName: 'Group Name', field: 'companyPriceGroupName', cellRenderer: 'agGroupCellRenderer', width: 50 },
      {
        headerName: 'Action', field: 'action', colId: 'params',
        cellRenderer: 'CellRenderer', width: 20, cellRendererParams: { hideEditAction: true, hideDeleteAction: false },
      }
    ];
  }
  comboMaintanenceGridCol() {
    return [
      { headerName: 'Store Location', field: 'storeName', width: 150 },
      {
        headerName: 'Combo Name', field: 'comboName', width: 150
        // , cellEditor: 'agSelectCellEditor',
        // cellEditorParams: { values: ['Porsche', 'CCC'] }
      },
      { headerName: 'Item List', field: 'itemListName', width: 150 },
      {
        headerName: 'Begin Date', field: 'beginDate', width: 150,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'End Date', field: 'endDate', width: 150,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Priority', field: 'comboPriorityTypeName', width: 100 },
      {
        headerName: 'Is Co-Funded', field: 'co_funded', width: 100, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.co_funded)
      },
      {
        headerName: 'Manufacturer Dis Amt', field: 'manufacturerFunded', cellEditor: 'numericCellEditor', width: 130, cellStyle: { 'text-align': 'right' },
        headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Retailer Dis Amt', field: 'retailerFunded', cellEditor: 'numericCellEditor', width: 120, cellStyle: { 'text-align': 'right' },
        headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Combo Amount', field: 'comboAmount', cellEditor: 'numericCellEditor', width: 100, headerClass: 'header-text-wrap', cellStyle: { 'text-align': 'right' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Combo Quantity', field: 'comboUnits', cellEditor: 'numericCellEditor', width: 100, headerClass: 'header-text-wrap', },
      { headerName: 'Status', field: 'posSyncStatusCode', width: 150 },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false }, pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  mixMatchMaintanenceGridCol(): any {
    return [
      { headerName: 'Store Location', field: 'storeName', width: 150 },
      {
        headerName: 'Mix Match Name', field: 'mixMatchName', width: 120
        // , cellEditor: 'agSelectCellEditor',
        // cellEditorParams: { values: ['Porsche', 'CCC'] }
      },
      { headerName: 'Item List', field: 'itemListName', width: 150 },
      {
        headerName: 'Begin Date', field: 'beginDate', width: 150,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'End Date', field: 'endDate', width: 150, cellRenderer: (params: any) => this.dateFormat(params.value) },
      { headerName: 'Unit Type', field: 'mixMatchPromotionUnitTypeName', width: 180 },
      {
        headerName: 'Is Co-Funded', field: 'co_funded', width: 100, headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.co_funded)
      },
      {
        headerName: 'Manufacturer Dis Amt', field: 'manufacturerFunded', cellEditor: 'numericCellEditor', width: 130,
        headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Retailer Dis Amt', field: 'retailerFunded', cellEditor: 'numericCellEditor', width: 120,
        headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Mix Match Amount', field: 'mixMatchAmount', cellEditor: 'numericCellEditor', width: 120, cellStyle: { 'text-align': 'right' },
        headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Mix Match Quantity', field: 'mixMatchUnits', cellEditor: 'numericCellEditor', width: 120, cellStyle: { 'text-align': 'center' },
        headerClass: 'header-text-wrap',
      },
      { headerName: 'Status', field: 'posSyncStatusCode', width: 150, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-wrap header-text-center' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  companyPriceGroupGridCol(): any {
    return [
      { headerName: 'Group', minWidth: 130, field: 'CompanyPriceGroupName', headerClass: 'header-text-center' },
      { headerName: 'No of Items', minWidth: 40, width: 80, field: 'NOOfItems', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Type', field: 'IsSuperGroup', minWidth: 80, headerClass: 'header-text-center',
        cellRenderer: (params: any) => params.value ? 'Super Group' : 'Group', width: 80
      },
      {
        headerName: 'Action', field: 'action', minWidth: 80, headerClass: 'header-text-center', cellRenderer: 'CellRenderer',
        pinned: 'right', colId: 'params', width: 80, suppressSorting: false,
        cellRendererParams: (params) => {
          if (params.data.FromAPI === 1) {
            return { hideEditAction: true, hideDeleteAction: true, showChild: false };
          } else {
            return { hideEditAction: false, hideDeleteAction: false, showChild: false };
          }
        }
      }
    ];
  }

  /*  cellStyling(params: any) {
     if (params.data.demoFlag === true) {
       return { background: 'red' };
     }
   } */
  competitorPricingGridCol() {
    return [
      { headerName: 'Fuel Grade Name', field: 'fuelGradeName' },
      { headerName: 'Service Level', field: 'fuelServiceLevelName' },
      {
        headerName: 'Fuel Grade Price', field: 'cashFuelPrice',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  networkSummaryGridCol() {
    return [
      {
        headerName: 'Business Date', field: 'businessDate', headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Store Location', field: 'storeName', headerClass: 'header-text-wrap', },
      { headerName: 'Batch Number', field: 'batchNumber', headerClass: 'header-text-wrap', },
      {
        headerName: 'Gross Amount', field: 'grossAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Processing Fee Amount', field: 'processingFeeAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Net Amount', field: 'netAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Is Batch Settled', field: 'isBatchSetteled', headerClass: 'header-text-wrap',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isBatchSetteled)
      },
      {
        headerName: 'Settled Date', field: 'settlementDate',
        cellRenderer: (params: any) => params.value === null ? '' : this.dateFormat(params.value)
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        colId: 'params', width: 150, suppressSorting: false
      }
    ];
  }
  fuelReconciliationGridCol() {
    return [
      {
        headerName: 'Date', field: 'settlementDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Store Location', field: 'storeName' },
      { headerName: 'Batch Number', field: 'batchNumber' },
      {
        headerName: 'Network Gross Amount', field: 'netGrossAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Fuel Invoice Amount', field: 'fuelInvoiceAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Others Amount', field: 'fuelOtherChargeAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Amount Due', field: 'amountDue', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        colId: 'params', width: 150, suppressSorting: false
      }
    ];
  }
  fuelReconciliationNetworkBatchGridCol() {
    return [
      {
        headerName: 'Date', field: 'settlementDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Store', field: 'storeName' },
      { headerName: 'Batch Number', field: 'batchNumber' },
      {
        headerName: 'Total Amount', field: 'grossAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      }, //
      {
        headerName: 'CC Amount', field: 'processingFeeAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      }, //
      {
        headerName: 'Neet Amount', field: 'netAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: true, hideDeleteAction: false },
        colId: 'params', width: 140, suppressSorting: false
      }
    ];
  }
  fuelReconciliationFuelInvoicechGridCol() {
    return [
      {
        headerName: 'Date', field: 'invoiceDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Invoice Number', field: 'invoiceNo', headerClass: 'header-text-wrap', },
      {
        headerName: 'Invoice Amount', field: 'invocieAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: true, hideDeleteAction: false },
        colId: 'params', width: 120, suppressSorting: false
      }
    ];
  }

  scanDataSetupGridCol() {
    return [
      { headerName: 'Store Location ID', field: 'storeLocationId' },
      { headerName: 'Manufacturer ID', field: 'manufacturerId' },
      {
        headerName: 'Is Chain Of Stores', field: 'isChainOfStores',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isChainOfStores)
      },
      { headerName: 'Account No.', field: 'accountNumber' },
      { headerName: 'Submission Day', field: 'submissiondDay' },
      { headerName: 'Notes', field: 'note' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  billofLadingGridCol() {
    return [
      { headerName: 'BOL Number', field: '' },
      { headerName: 'BOL Company Name', field: '' },
      { headerName: 'Business Date', field: '' },
      { headerName: 'Invoice Amount', field: '' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  taxStrategyGridCol() {
    return [
      { headerName: 'Tax Stragey', field: 'taxStrageyID' },
      { headerName: 'Tax Name', field: 'taxName' },
    ];
  }
  salesRestrictCodeGridCol() {
    return [
      { headerName: 'Sale Restriction', field: 'saleRestrictionID' },
      { headerName: 'Description', field: 'description' },
    ];
  }
  tenderCodeGridCol() {
    return [
      { headerName: 'Store MOP No', field: 'storeMOPNo' },
      { headerName: 'MOP Name', field: 'mopName' },
    ];
  }
  mdseCodeGridCol() {
    return [
      { headerName: 'Dept Code', field: 'deptCode' },
      { headerName: 'Department', field: 'department' },
    ];
  }
  passportItemGridCol() {
    return [
      { headerName: 'POS Code', field: 'posCode' },
      { headerName: 'Modifier', field: 'posCodeModifier' },
      { headerName: 'Merchandise Code', field: 'merchandiseCode' },
      { headerName: 'Regular Sell Price', field: 'regularSellPrice' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Food Stampable Flg', field: 'foodStampableFlg' },
      { headerName: 'Discountable Flg', field: 'discountableFlg' },
      { headerName: 'quantity', field: 'quantityAllowedFlg' },
      { headerName: 'Item Be Returned', field: 'canItemBeReturned' },
      { headerName: 'Active Flag', field: 'activeFlag' },
      { headerName: 'Tax Rate1', field: 'taxRate1' },
      { headerName: 'Tax Rate2', field: 'taxRate2' },
      { headerName: 'Tax Rate3', field: 'taxRate3' },
      { headerName: 'Tax Rate4', field: 'taxRate4' },
      { headerName: 'Prohibit Discount', field: 'prohibitDiscountFlag' },
      { headerName: 'Sales Restrict Code', field: 'salesRestrictCode2' },
      { headerName: 'Product Code', field: 'paymentSystemsProductCode' },
      { headerName: 'Fractional Qty', field: 'isFractionalQtyAllowed' },
      { headerName: 'Article Special Discount', field: 'flagArticleSpecialDiscount' },
      { headerName: 'Blue Law1', field: 'blueLaw1' },
      { headerName: 'Blue Law2', field: 'blueLaw2' },
      { headerName: 'Allow Commissions', field: 'shouldAllowCommissions' },
      { headerName: 'Loyalty Redeem Eligible', field: 'isLoyaltyRedeemEligible' },
      { headerName: 'Selling Units', field: 'sellingUnits' },
    ];
  }
  sapphireCustIDGridCol() {
    return [
      { headerName: 'ID', field: 'sysid' },
      { headerName: 'Age', field: 'minAge' },
      { headerName: 'Name', field: 'name' },
    ];
  }
  sapphireDepartmentGridCol() {
    return [
      { headerName: 'Dept Code', field: 'merchandiseCode' },
      { headerName: 'Description', field: 'merchandiseCodeDescription' },
      { headerName: 'Tax Rate1', field: 'taxRate1' },
      { headerName: 'Tax Rate2', field: 'taxRate2' },
      { headerName: 'Tax Rate3', field: 'taxRate3' },
      { headerName: 'Tax Rate4', field: 'taxRate4' },
      { headerName: 'Department ProductCode', field: 'departmentProductCode' },
      { headerName: 'Low Amount', field: 'lowAmount' },
      { headerName: 'High Amount', field: 'highAmount' },
      { headerName: 'Item1', field: 'customerIDItem1' },
      { headerName: 'Item2', field: 'customerIDItem2' },
      { headerName: 'Food Stamps', field: 'deptFoodStamp' },
      { headerName: 'Department Negative', field: 'negativeFlag' },
      { headerName: 'Fuel', field: 'fuel' },
      { headerName: 'Fractional Qty', field: 'allowFractionalQty' },
      { headerName: 'Disc Eligible', field: 'splDiscEligible' },
      { headerName: 'Blue Law1', field: 'blueLaw1' },
      { headerName: 'Blue Law2', field: 'blueLaw2' },
      { headerName: 'Loyalty Redeemable', field: 'loyaltyRedeemable' },
      { headerName: 'Money Order', field: 'moneyOrder' }
    ];
  }
  sapphireMOPGridCol() {
    return [
      { headerName: 'ID', field: 'sysid' },
      { headerName: 'Name', field: 'name' },
    ];
  }

  sapphireTaxGridCol() {
    return [
      { headerName: 'Tax Level', field: 'taxLevelID' },
      { headerName: 'Tax Description', field: 'taxDescription' },
      { headerName: 'Tax Rate', field: 'taxRate' },
    ];
  }
  passportHtmlGridCol() {
    return [
      // { headerName: 'Department', field: 'department' },
      { headerName: 'POS Code', field: 'upcid' },
      { headerName: 'Modifier', field: 'modifier' },
      { headerName: 'Merchandise Code', field: 'deptNo' },
      { headerName: 'Regular Sell Price', field: 'price' },
      { headerName: 'Description', field: 'itemDescription' },
      { headerName: 'Is ItemIn Promotion', field: 'isItemInPromotion' },
      { headerName: 'Can Item Be Sold', field: 'canItemBeSold' },
      { headerName: 'Can Item BeReturned', field: 'canItemBeReturned' },
      { headerName: 'Active Flag', field: 'isItemOpen' },
      { headerName: 'Tax Rate1', field: 'taxRate1' },
      { headerName: 'Tax Rate2', field: 'taxRate2' },
      { headerName: 'Tax Rate3', field: 'taxRate3' },
      { headerName: 'Tax Rate4', field: 'taxRate4' },
      { headerName: 'Prohibit Discount', field: 'custId1' },
      { headerName: 'Sales Restrict Code', field: 'custId2' },
      { headerName: 'Product Code', field: 'productCode' },
      { headerName: 'Fractional Qty', field: 'isFractionalQtyAllowed' },
      { headerName: 'Article Special Discount', field: 'isSpecialDiscountAllowed' },
      { headerName: 'Blue Law1', field: 'blueLaw1' },
      { headerName: 'Blue Law2', field: 'blueLaw2' },
      { headerName: 'Allow Commissions', field: 'shouldAllowCommissions' },
      { headerName: 'Loyalty Redeem Eligible', field: 'isLoyaltyRedeemEligible' },
      { headerName: 'Selling Units', field: 'sellUnit' },
    ];
  }
  sapphireItemGridCol() {
    return [
      { headerName: 'POS Code', field: 'posCode' },
      { headerName: 'Modifier', field: 'posCodeModifier' },
      { headerName: 'Merchandise Code', field: 'merchandiseCode' },
      { headerName: 'Regular Sell Price', field: 'regularSellPrice' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Food Stampable Flg', field: 'flagArticleFoodStamp' },
      { headerName: 'Discountable Flg', field: 'flagArticlePromo' },
      { headerName: 'quantity', field: 'canItemBeSold' },
      { headerName: 'Item Be Returned', field: 'flagArticleNoReturn' },
      { headerName: 'Active Flag', field: 'isItemOpen' },
      { headerName: 'Tax Rate1', field: 'taxRate1' },
      { headerName: 'Tax Rate2', field: 'taxRate2' },
      { headerName: 'Tax Rate3', field: 'taxRate3' },
      { headerName: 'Tax Rate4', field: 'taxRate4' },
      { headerName: 'Prohibit Discount', field: 'salesRestrictCode' },
      { headerName: 'Sales Restrict Code', field: 'salesRestrictCode2' },
      { headerName: 'Product Code', field: 'paymentSystemsProductCode' },
      { headerName: 'Fractional Qty', field: 'isFractionalQtyAllowed' },
      { headerName: 'Article Special Discount', field: 'flagArticleSpecialDiscount' },
      { headerName: 'Blue Law1', field: 'blueLaw1' },
      { headerName: 'Blue Law2', field: 'blueLaw2' },
      { headerName: 'Allow Commissions', field: 'shouldAllowCommissions' },
      { headerName: 'Loyalty Redeem Eligible', field: 'isLoyaltyRedeemEligible' },
      { headerName: 'Selling Units', field: 'sellingUnits' },
    ];
  }
  custIDGridCol() {
    return [
      { headerName: 'POS Cust ID', field: 'posCustID' },
      { headerName: 'Age', field: 'age' },
      { headerName: 'Description', field: 'description' },
    ];
  }
  rubyDepartmentGridCol() {
    return [
      { headerName: 'Dept Code', field: 'deptCode' },
      { headerName: 'Dept Name', field: 'deptName' },
      { headerName: 'Tax Rate1', field: 'taxRate1' },
      { headerName: 'Tax Rate2', field: 'taxRate2' },
      { headerName: 'Tax Rate3', field: 'taxRate3' },
      { headerName: 'Tax Rate4', field: 'taxRate4' },
      { headerName: 'Product Code', field: 'depProductCode' },
      { headerName: 'Min Sale Amt', field: 'minSalesAmount' },
      { headerName: 'Max Sale Amt', field: 'maxSalesAmount' },
      { headerName: 'Item1', field: 'customerIDItem1' },
      { headerName: 'Item2', field: 'customerIDItem2' },
      { headerName: 'Food Stamps', field: 'foodStampsAllowed' },
      { headerName: 'Department Negative', field: 'departmentNegative' },
      { headerName: 'Fuel Dept', field: 'fuelDept' },
      { headerName: 'Quantity', field: 'fractionalQuantity' },
      { headerName: 'Sp Discount', field: 'specialDiscount' },
      { headerName: 'Blue Law1', field: 'blueLaw1' },
      { headerName: 'Blue Law2', field: 'blueLaw2' },
      { headerName: 'edeemable', field: 'loyaltyRedeemable' },
      { headerName: 'Money Order Dept', field: 'moneyOrderDept' }
    ];
  }
  itemFromCSVGridCol() {
    return [
      { headerName: 'Vendor Item', field: 'vendorItem' },
      { headerName: 'Item Description', field: 'itemDescription' },
      { headerName: 'UOM', field: 'uom' },
      { headerName: 'Pack', field: 'pack' },
      { headerName: 'Unit Cost', field: 'unitCost' },
      { headerName: 'Case Cost', field: 'caseCost' },
      { headerName: 'Unit Selling Price', field: 'unitSellingPrice' },
      { headerName: 'Item UPC', field: 'itemUPC' },
      { headerName: 'Case UPC', field: 'caseUPC' },
      { headerName: 'Department', field: 'department' },
    ];
  }
  rubyMOPGridCol() {
    return [
      { headerName: 'MOP Code', field: 'mopCode' },
      { headerName: 'MOP Name', field: 'mopName' }
    ];
  }
  rubyRGISGridCol() {
    return [
      { headerName: 'POS Code', field: 'posCodeWithChkDigit' },
      { headerName: 'Selling Price', field: 'sellingPrice' },
      { headerName: 'Current Inventory', field: 'currentInventory' },
      {
        headerName: 'Inventory Date', field: 'inventoryAsOfDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      }
    ];
  }
  rubyTaxGridCol() {
    return [
      { headerName: 'Tax Number', field: 'taxNumber' },
      { headerName: 'Tax Name', field: 'taxName' },
      { headerName: 'Rate Percent', field: 'ratePercent' }
    ];
  }
  rubySubashGridCol() {
    return [
      { headerName: 'UPC No', field: 'upcid' },
      { headerName: 'Item Description', field: 'itemDescription' },
      { headerName: 'Dept No', field: 'deptNo' },
      { headerName: 'Selling Price', field: 'sellingPrice' }
    ];
  }
  ediInvoiceGridCol() {
    return [
      { headerName: 'Invoice No', field: 'invoiceNo', width: 150 },
      { headerName: 'Vendor Code', field: 'vendorCode', width: 150 },
      {
        headerName: 'Invoice Date', field: 'invoiceDate', width: 150,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDate(params.value) : '';
        }
      },
      { headerName: 'Amount', field: 'invoiceTotal' },
      {
        headerName: '', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: {
          showClone: true, hideEditAction: true,
          hideDeleteAction: true
        }, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }
  ediProcessGridCol() {
    return [
      {
        headerName: '', field: 'itemCheck', width: 60, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      { headerName: 'UPC Code', field: 'itemUPC', width: 150 },
      {
        headerName: 'Item Descrition', field: 'itemDescrition', width: 150,

      },
      {
        headerName: 'Unit Cost', field: 'unitCost', width: 150,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalCurrency(params.value) : '';
        }
      },
      {
        headerName: 'Suggested Price', field: 'suggestedRetailPrice', width: 150,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalCurrency(params.value) : '';
        }
      },
      { headerName: 'Unit In Case', field: 'unitInCase', width: 150 },
    ];
  }
  editfuelReconciliationFuelInvoicechGridCol() {
    return [
      {
        headerName: '', field: 'department', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true,
      },
      {
        headerName: 'Invoice Date', field: 'invoiceDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Store', field: 'storeName' },
      { headerName: 'Vendor', field: 'vendorName' },
      {
        headerName: 'Invoice Amount', field: 'invocieAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Total Gallon', field: 'totalAmount', },
      { headerName: 'Invoice Number', field: 'invoiceNo', headerClass: 'header-text-wrap', },

    ];
  }
  editFuelReconciliationNetworkBatchGridCol() {
    return [
      {
        headerName: '', field: 'department', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true,
      },
      {
        headerName: 'Date', field: 'settlementDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Store Location', field: 'storeName', headerClass: 'header-text-wrap', },
      { headerName: 'Batch Number', field: 'batchNumber', headerClass: 'header-text-wrap', },
      {
        headerName: 'Total Amount', field: 'grossAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'CC Amount', field: 'processingFeeAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Net Amount', field: 'netAmount', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  MasterPriceBookItemGridCol() {
    return [
      {
        headerName: '', field: 'masterItem', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true
      },
      { headerName: 'UPC Code', field: 'upcCode', width: 120 },
      { headerName: 'Descrition', field: 'description', width: 140 },
      { headerName: 'Department', field: 'masterDepartmentDescription', width: 120 },
      { headerName: 'Manufacturer Name', field: 'manufacturerName', width: 125, headerClass: 'header-text-wrap', },
      { headerName: 'Brand Name', field: 'brandName', width: 120, headerClass: 'header-text-wrap', },
      { headerName: 'UOM', field: 'uomDescription', width: 130 },
      { headerName: 'Group Name', field: 'masterGroupName', width: 150 },
      { headerName: 'Source Name', field: 'datasourcename', width: 130 },
      { headerName: 'Selling Units', field: 'sellingUnits', width: 80, headerClass: 'header-text-wrap', },
      { headerName: 'Unit In Case', field: 'unitsInCase', width: 90, headerClass: 'header-text-wrap', },
      { headerName: 'Base Unit In Case', field: 'baseUnitsInCase', width: 100, headerClass: 'header-text-wrap', },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', pinned: 'right', colId: 'params', width: 90,
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false }, suppressSorting: false,
      }
    ];
  }
  employeeSetupGridCol() {
    return [
      { headerName: 'Employee Id', field: 'employeeId', width: 110 },
      { headerName: 'First Name', field: 'firstName', width: 100 },
      { headerName: 'Last Name', field: 'lastName', width: 100 },
      { headerName: 'City', field: 'city', width: 100 },
      { headerName: 'State', field: 'state', width: 100 },
      { headerName: 'Phone No', field: 'phoneNo', width: 100 },
      { headerName: 'Email', field: 'e_Mail', width: 100 },
      { headerName: 'Age', field: 'age', width: 100 },
      {
        headerName: 'Pay Rate', field: 'payRate', width: 100, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Hire Date', field: 'hireDate', width: 100,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Start Date', field: 'startDate', width: 100,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Multiple Location', field: 'allLocations', width: 120,
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isDepartmentNegative)
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', pinned: 'right', colId: 'params', width: 100,
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false }, suppressSorting: false
      }
    ];
  }
  repCashCheckAmounGridCol() {
    return [
      {
        headerName: 'Cash', field: 'cashAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Check', field: 'checkAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Cash MOP', field: 'cashMopAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Cash Payout', field: 'cashPayoutAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Check Payout', field: 'checkPayoutAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Short / Over', field: 'shortOver', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  repDepartmentTypeSalesGridCol() {
    return [
      { headerName: 'Sales Description', field: 'departmentTypeName', headerClass: 'header-text-wrap' },
      {
        headerName: 'Amount', field: 'totalAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  repGasGradeDatasGridCol() {
    return [
      { headerName: 'Gas Grade', field: 'gasGradeName', headerClass: 'header-text-wrap' },
      { headerName: 'Gas Volume', field: 'fuelGradeSalesVolume', headerClass: 'header-text-wrap' },
      {
        headerName: 'Gas Amount', field: 'fuelGradeSalesAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  repMOPDetailsGridCol() {
    return [
      {
        headerName: 'MOP Name', field: 'mopName', headerClass: 'header-text-wrap',

      },
      { headerName: 'MOP Count', field: 'mopCount', headerClass: 'header-text-wrap', },
      {
        headerName: 'Amount', field: 'mopAmount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  zReportGridCol() {
    return [
      {
        headerName: 'Business Date', field: 'businessDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Column Name', field: 'columnName'
      },
      {
        headerName: 'Column Amount', field: 'coloumnAmount',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Amount', field: 'amount',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  storeHealthGridCol() {
    return [
      {
        headerName: 'Company', field: 'CompanyID', headerClass: 'header-text-wrap', hide: true, rowGroup: true,
        cellRenderer: (params) => {
          if (params.node && params.node.childrenAfterFilter && params.node.childrenAfterFilter.length > 0 && params.node.childrenAfterFilter[0].data.CompanyName)
            return params.node.childrenAfterFilter[0].data.CompanyName;
          else return params.value;
        },
      },
      { headerName: 'Store', field: 'StoreName', headerClass: 'header-text-wrap', },
      {
        headerName: 'Status', field: 'pos', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          if (params.node.rowGroupIndex === 0) {
            return null;
          }
          else {
            if (params.value)
              return 'Running';
            else
              return 'Stopped';
          }
        }
      },
      { headerName: 'Remark', field: 'Comments', headerClass: 'header-text-wrap', },
      { headerName: 'Last Date (UTC)', field: 'LastUTCDateTime', headerClass: 'header-text-wrap' },
    ];
  }
  serviceHealthGridCol() {
    return [
      {
        headerName: 'Company', field: 'CompanyID', headerClass: 'header-text-wrap', hide: true, rowGroup: true,
        cellRenderer: (params) => {
          if (params.node && params.node.childrenAfterFilter && params.node.childrenAfterFilter.length > 0 && params.node.childrenAfterFilter[0].data.CompanyName)
            return params.node.childrenAfterFilter[0].data.CompanyName;
          else return params.value;
        },
      },
      { headerName: 'Store', field: 'StoreName', headerClass: 'header-text-wrap', },
      {
        headerName: 'Status', field: 'Status', headerClass: 'header-text-wrap'
      },
      {
        headerName: 'IsForceStart', field: 'IsForceStart', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          if (params.node.rowGroupIndex === 0) {
            return null;
          }
          else {
            if (params.value)
              return 'Yes';
            else
              return 'No';
          }
        }
      },
      { headerName: 'Exception', field: 'Exception', headerClass: 'header-text-wrap', },
      { headerName: 'Last Date (UTC)', field: 'LastUTCDateTime', headerClass: 'header-text-wrap' },
    ];
  }
  pjrGridCol() {
    return [
      {
        headerName: 'Company', field: 'CompanyID', headerClass: 'header-text-wrap', hide: true, rowGroup: true,
        cellRenderer: (params) => {
          if (params.node && params.node.childrenAfterFilter && params.node.childrenAfterFilter.length > 0 && params.node.childrenAfterFilter[0].data.CompanyName)
            return params.node.childrenAfterFilter[0].data.CompanyName;
          else return params.value;
        },
      },
      { headerName: 'Store', field: 'StoreName', headerClass: 'header-text-wrap', },
      {
        headerName: 'Status', field: 'Status', headerClass: 'header-text-wrap'
      },
      { headerName: 'File Upload Status', field: 'FileUploadStatus', headerClass: 'header-text-wrap', },
      { headerName: 'Exception', field: 'Exception', headerClass: 'header-text-wrap', },
      { headerName: 'File Upload Exception', field: 'FileUploadException', headerClass: 'header-text-wrap', },
      { headerName: 'Last Date (UTC)', field: 'LastUTCDateTime', headerClass: 'header-text-wrap' },
    ];
  }
  dayReconGridCol() {
    return [
      { headerName: 'Sale of Type', field: 'typeOfSell', headerClass: 'header-text-center', hide: true, rowGroup: true, },
      {
        headerName: 'Department', field: 'DepartmentDescription', headerClass: 'header-text-center',
      },
      { headerName: 'No of Non UPC Sales', field: 'NONUPCSalesQty', headerClass: 'header-text-center', },
      {
        headerName: 'Non UPC Sales Amount', field: 'NONUPCSalesAmt', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalCurrencyWithDash(params.value) : '';
        },
        cellStyle: { 'text-align': 'right' }
      },
      { headerName: 'No of UPC Sales', field: 'SalesQuantity', headerClass: 'header-text-center' },
      {
        headerName: 'UPC Sales Amount', field: 'SalesAmount', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value) : '';
        },
        cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: 'Total Qty', field: 'totalQty', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          if (params.data) {
            return Number(params.data.NONUPCSalesQty) + Number(params.data.SalesQuantity);
          } else return '';
        }
      },
      {
        headerName: 'Total Sales Amount', field: 'totalAmount', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return params.data ? this.utilityService.formatDecimalCurrencyWithCommaSeparated(Number(params.data.SalesAmount) + Number(params.data.NONUPCSalesAmt)) : '';
        }, cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: 'Details',
        field: 'DepartmentID', width: 150,
        cellRendererFramework: DetailButtonComponent,
      }

    ];
  }
  dashboardGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode', headerClass: 'header-text-wrap', },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap', },
      { headerName: 'Qty', field: 'count', headerClass: 'header-text-wrap', width: 80 },

    ];
  }
  storeBillingSubPaymentHistoryGridCol() {
    return [
      { headerName: 'INVOICE DATE', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'RECEIPT NO', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'INVOICE TOTAL', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Action', field: '', headerClass: 'header-text-wrap', },
    ];
  }
  storeBillingSubSubscriptionHistoryGridCol() {
    return [
      { headerName: 'Plan', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Subscribed', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Added On', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Added By', field: '', headerClass: 'header-text-wrap', },
    ];
  }
  subscriptionDetailGridGridCol() {
    return [
      { headerName: 'Subscription Status', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Subscribed', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Store Users', field: '', headerClass: 'header-text-wrap', },
      { headerName: 'Date', field: '', headerClass: 'header-text-wrap', },
    ];
  }
  expensesGridCol() {
    return [
      {
        headerName: '', field: 'item', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true
      },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap', },
      {
        headerName: 'Date', field: 'date', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'Income/Expenses', field: 'isExpense', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return params.value === true ? 'Expenses' : 'Income';
        }
      },
      {
        headerName: 'Amount', field: 'amount', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithDash(params.value);
        }
      },
    ];
  }
  dayReconGasDetailGridCol() {
    return [
      { headerName: 'Gas Grade', field: 'gasGradeName', headerClass: 'header-text-center', minWidth: 80, width: 80, },
      {
        headerName: 'Average Sales Price/Gallon', minWidth: 120, width: 120, field: 'averageCostPerGallon',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'Gas Volume', field: 'fuelGradeSalesVolume', minWidth: 80, width: 80,
        cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center-2',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalDigit(params.value);
        }
      },
      {
        headerName: 'Gas Amount', field: 'fuelGradeSalesAmount', headerClass: 'header-text-center-2', minWidth: 80, width: 80,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }
      },
    ];
  }

  networkCardGridCol() {
    return [
      { headerName: 'Name', field: 'Name', headerClass: 'header-text-wrap', },
      { headerName: 'Count', field: 'Count', headerClass: 'header-text-wrap', },
      {
        headerName: 'Sales', field: 'Sales', headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }
  categoryCardGridCol() {
    return [
      { headerName: 'Category', field: 'POSCategoryDescription', headerClass: 'header-text-center', },
      { headerName: 'Item Count', field: 'ItemCount', headerClass: 'header-text-center', },
      {
        headerName: 'Amount', field: 'Amount', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }
      },

    ];
  }
  purchasesGridCol() {
    return [
      {
        headerName: "Account",
        field: "vendorName",
        cellRenderer: (params: any) => {
          return '<div><h6 class="mb-0 mt-1" style="text-overflow: ellipsis;white-space: nowrap;overflow: hidden;font-weight: 600;">' + params.data.vendorName + '</h6></div>' +
            '<div class="text-secondary" style="font-size: 10px;line-height: 20px;">' + params.data.bankNickName + '</div>';
        }, width: 250
      },
      {
        headerName: "Amount",
        field: "amount",
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }, width: 70,
        cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: "Category",
        field: "category",
        cellStyle: { 'text-align': 'center' },
        width: 100
      },
      // {
      //   headerName: "Type",
      //   field: "type",
      //   cellStyle: { 'text-align': 'center' },
      //   width: 100
      // }, 
      {
        headerName: "Memo",
        field: "memo",
        cellStyle: { 'text-align': 'center' }
      },
      {
        headerName: "",
        field: "",
        cellRenderer: 'viewFileButtonRenderer',
        width: 100,
        cellStyle: { 'text-align': 'center' }
      }
    ];
  }
  importPurchasesGridCol() {
    return [
      {
        headerName: '', field: 'rowID', width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      {
        headerName: "Vendor Name",
        field: "vendorName",
        width: 230,
        headerClass: 'justify-content-center'
      },
      {
        headerName: "Invoice Amount",
        field: "invoiceAmount",
        headerClass: 'justify-content-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: "Invoice No",
        field: "invoiceNo",
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right' }
      },
      // {
      //   headerName: "Payment Source",
      //   field: "firstInvoicePayment",
      //   width: 230,
      //   headerClass: 'justify-content-center'
      // }
    ];
  }
  importFuelPurchasesGridCol() {
    return [
      {
        headerName: '', field: 'rowID', width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      {
        headerName: "Vendor Name",
        field: "vendorName",
        width: 230,
        headerClass: 'justify-content-center'
      },
      {
        headerName: "Invoice Amount",
        field: "invocieAmount",
        headerClass: 'justify-content-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: "Invoice No",
        field: "invoiceNo",
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right' }
      },
      // {
      //   headerName: "Payment Source",
      //   field: "firstInvoicePayment",
      //   width: 230,
      //   headerClass: 'justify-content-center'
      // }
    ];
  }
  dayReconPromotionsDetailGridCol() {
    return [
      {
        headerName: '', field: 'departmentID', hide: true, rowGroup: true, width: 40, suppressSizeToFit: true,
      },
      { headerName: 'UPC Code', field: 'posCode', width: 100, suppressSizeToFit: true, headerClass: 'header-text-center', minWidth: 80 },
      { headerName: 'Item Description', field: 'itemDescription', headerClass: 'header-text-center', minWidth: 220, width: 350, },
      {
        headerName: 'Sales Amount', field: 'salesAmount', width: 80, suppressSizeToFit: true, headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        }, cellStyle: { 'text-align': 'right' }
      },
      {
        headerName: 'Discount Amount', field: 'discountAmount', width: 80, suppressSizeToFit: true, headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        }, cellStyle: { 'text-align': 'right' }
      },
      { headerName: 'Sales Qty', field: 'salesQty', headerClass: 'header-text-center', minWidth: 35, width: 80, suppressSizeToFit: true, },
    ];
  }

  expensesDetailGridCol() {
    return [
      { headerName: 'Store', field: 'storeName' },
      { headerName: 'Date', field: 'date' },
      { headerName: 'Account', field: 'account' },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Category', field: 'category' },
      { headerName: 'Amount', field: 'amount' },
      { headerName: 'Note', field: 'note' },
    ];
  }

  masterPriceGropDetailGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode', headerClass: 'header-text-wrap', cellRenderer: 'agGroupCellRenderer', },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap', },
      { headerName: 'Selling Units', field: 'sellingUnits', headerClass: 'header-text-wrap', cellStyle: { 'text-align': 'center' }, },
      { headerName: 'Units In Case', field: 'unitsInCase', headerClass: 'header-text-wrap', cellStyle: { 'text-align': 'center' }, },

    ];
  }
  getDataFromPOSGridCol() {
    return [
      { field: 'companyName', headerName: 'Company Name', hide: true, rowGroup: true },
      { field: 'storeName', headerName: 'Store Name', headerClass: 'header-text-wrap' },
      { field: 'totType', headerName: 'Total File Name', headerClass: 'header-text-wrap' },
      { field: 'day_1', headerName: moment().format('MM-DD-YYYY'), headerClass: 'header-text-wrap' },
      { field: 'day_2', headerName: moment().add(-1, 'days').format('MM-DD-YYYY'), headerClass: 'header-text-wrap' },
      { field: 'day_3', headerName: moment().add(-2, 'days').format('MM-DD-YYYY'), headerClass: 'header-text-wrap' },
      { field: 'day_4', headerName: moment().add(-3, 'days').format('MM-DD-YYYY'), width: 120, headerClass: 'header-text-wrap' },
    ];
  }
  getDataToPOSGridCol() {
    return [
      { field: 'company', headerName: 'Company Name', hide: true, rowGroup: true },
      { field: 'store', headerName: 'Store Name', headerClass: 'header-text-wrap' },
      // { field: 'totType', headerName: 'Total File Name', headerClass:'header-text-wrap'},
      { field: 'noOfItemInCurrent', headerName: 'Items In Current', headerClass: 'header-text-wrap' },
      { field: 'noOfItemInPushToPOS', headerName: 'Items In Push To POS', headerClass: 'header-text-wrap' },
      { field: 'noOfItemInProgress', headerName: 'Items In Progress', headerClass: 'header-text-wrap' },
      { field: 'noOfItemInError', headerName: 'Items In Error', width: 120, headerClass: 'header-text-wrap', filter: 'agNumberColumnFilter' },
    ];
  }
  dashboardSettingGridCol() {
    return [
      {
        headerName: 'Categories', field: 'categoryName', hide: true, rowGroup: true
      },
      { headerName: 'Widgets', field: 'widgetName', },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', pinned: 'right', colId: 'params', width: 80,
        cellRendererParams: { hideEditAction: true, hideDeleteAction: true, hideAddAction: true }, suppressSorting: false
      }
    ];
  }
  dashboardSettingNonFunGridCol() {
    return [
      { headerName: 'Categories', field: 'categoryName', hide: true, rowGroup: true },
      { headerName: 'Widgets', field: 'widgetName', },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', pinned: 'right', colId: 'params', width: 80,
        cellRendererParams: { hideEditAction: true, hideDeleteAction: false }, suppressSorting: false
      }
    ];
  }
  defaultRolePrivilegeGridCol() {
    return [
      { headerName: '', field: 'parentName', hide: true, rowGroup: true },
      { headerName: 'Privilege Name', field: 'normaliseName', },
    ];
  }
  userPrivilegeGridCol() {
    return [
      { headerName: '', field: 'parentName', hide: true, rowGroup: true, width: 80, },
      { headerName: 'Privilege Name', field: 'normaliseName' },
      {
        headerName: 'Permission', width: 100, field: 'isChecked', cellRenderer: 'CheckboxPrivilegeRenderer',
      }
    ];
  }
  itemListChildGrpGridCol(): any {
    return [
      { headerName: 'Company Price Grp Name', field: 'companyPriceGroupName', width: 80 },

      /*  {
         headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
         cellRendererParams: { showDetails: false, hideEditAction: false, hideDeleteAction: false, showChild: true },
         pinned: 'right', colId: 'params', width: 80, suppressSorting: false
       } */
    ];
  }
  salestotalMgmtCol() {
    let list = ['Day Close', 'Shift1', 'Shift2', 'Shift3'];
    return [
      { headerName: 'Store Name', field: 'storeName', editable: false, },
      { headerName: 'Business Date', field: 'businessDate', editable: false, },
      { headerName: 'Period', field: 'period', editable: false, },
      /*  {
         headerName: 'Period', field: 'period',
         cellRenderer: 'childRowRenderer',
         cellRendererParams: {
           cellfieldId: 'periodValue',
           textfield: 'period'
         }
       }, */
      { headerName: 'Begin Date', field: 'beginDate', editable: false },
      { headerName: 'End Date', field: 'endDate', editable: false },
      /*   {
         headerName: 'Action', field: 'value', filter: false, width: 100, suppressSorting: false,
         cellRendererFramework: SaveButtonParentComponent,
       },  */
      /*  {
         headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
         width: 100, suppressSorting: false
       }, */
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', colId: 'params',
        cellRendererParams: { showClone: true, showNote: false, showOpen: false, hideDeleteAction: true },
        width: 100, suppressSorting: false, pinned: 'right'
        // hide: true
      },

    ];

  }
  priceGrpItemDetailGridCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', width: 25, minWidth: 25, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      { headerName: 'UPC Code', field: 'posCodeWithCheckDigit', headerClass: 'header-text-wrap', width: 60, minWidth: 60 },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap', width: 85, minWidth: 85 },
      { headerName: 'Department', field: 'departmentDescription', headerClass: 'header-text-wrap', width: 85, minWidth: 85 },
      { headerName: 'Selling Units', field: 'sellingUnits', width: 50, headerClass: 'header-text-wrap', minWidth: 50, cellStyle: { 'text-align': 'center' }, },
      { headerName: 'Unit(s) In Case', field: 'unitsInCase', headerClass: 'header-text-wrap', width: 50, minWidth: 50, cellStyle: { 'text-align': 'center' }, },
      {
        headerName: 'Selling Price', field: 'regularSellPrice', headerClass: 'header-text-wrap', width: 80, minWidth: 80,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Location', field: 'storeName', headerClass: 'header-text-wrap', width: 80, minWidth: 80 }
    ];
  }
  companyPriceGroupGridChildCol(): any {
    return [
      { headerName: 'UPC Code', field: 'upcCode', width: 90 },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Department Description', field: 'departmentDescription', headerClass: 'header-text-center', cellStyle: { 'text-align': 'center' } },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', suppressSorting: false, maxWidth: 80,
        cellRendererParams: (params) => {
          if (params.data.hideDeleteButton) {
            return { showDetails: false, hideEditAction: true, hideDeleteAction: true, showChild: true };
          } else {
            return { showDetails: false, hideEditAction: true, hideDeleteAction: false, showChild: true };
          }
        }
      }
    ];
  }
  companyPriceGroupGridChildColWithSPCol(): any {
    return [
      { headerName: 'UPC Code', field: 'upcCode', width: 90 },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Department Description', field: 'departmentDescription' },
      {
        headerName: 'Selling Price', field: 'regularSellPrice',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        colId: 'params', suppressSorting: false, maxWidth: 80,
        cellRendererParams: (params) => {
          if (params.data.hideDeleteButton) {
            return { showDetails: false, hideEditAction: true, hideDeleteAction: true, showChild: true };
          } else {
            return { showDetails: false, hideEditAction: true, hideDeleteAction: false, showChild: true };
          }
        }
      }
    ];
  }

  storeGrpGridCol(): any {
    return [
      { headerName: 'Store Name', field: 'companyStoreGroupName', width: 80 },
      { headerName: 'Notes', field: 'notes', width: 150 },

      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
        cellRendererParams: { showDetails: false, hideEditAction: false, hideDeleteAction: false, showChild: true },
        pinned: 'right', colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }

  timeOffGetGrid(): any {
    return [
      { headerName: 'Reason', field: 'reason' },
      {
        headerName: 'Start Date', field: 'startDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'End Date', field: 'endDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Total Hours', field: 'totalHours' },
      { headerName: 'Status', field: 'status', cellRenderer: (params: any) => params.value === 0 ? 'Pending' : params.value === 1 ? 'Approve' : 'Reject', width: 80 },
      { headerName: 'Paid Hours', field: 'paidHours' },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer',
        colId: 'params', width: 105, suppressSorting: false,
        cellRendererParams: {
          hideEditAction: false,
          hideDeleteAction: false
        },
      }
    ];
  }

  timeOffGetGridByRole(): any {
    return [
      { headerName: 'Reason', field: 'reason' },
      { headerName: 'Employee Name', field: 'employeeName' },
      {
        headerName: 'Start Date', field: 'startDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'End Date', field: 'endDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'Total Hours', field: 'totalHours' },
      { headerName: 'Status', field: 'status', cellRenderer: (params: any) => params.value === 0 ? 'Pending' : params.value === 1 ? 'Approve' : 'Reject', width: 80 },
      { headerName: 'Paid Hours', field: 'paidHours' },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer',
        colId: 'params', width: 105, suppressSorting: false,
        cellRendererParams: {
          hideEditAction: true,
          hideDeleteAction: true,
          approveAction: true,
          rejectAction: true
        },
      }
    ];
  }

  gridemployeeTimesheetDetail(): any {
    return [
      { headerName: 'Full Name', field: 'employeeName' },
      { headerName: 'Schedule Hours', field: 'scheduleHours' },
      { headerName: 'Schedule Hours vs Paid Hours', field: 'paidHours' },
      { headerName: 'Overtime Hours', field: 'overTimeHours' },
      { headerName: 'Total Paid Hours', field: 'totalPaid' },
      { headerName: 'Estimate Wadges (₹)', field: 'estimatedWadges' },
    ];
  }

  adjustemployeeTimesheetDetail(): any {
    return [
      { headerName: 'Full Name', field: 'employeeName' },
      { headerName: 'Punch In', field: 'punchInTimeSpan' },
      { headerName: 'Punch Out', field: 'punchOutTimeSpan' },
      { headerName: 'Date', field: 'date' },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellRenderer',
        colId: 'params', width: 105, suppressSorting: false,
        cellRendererParams: {
          hideEditAction: true,
          hideDeleteAction: true,
          approveAction: false,
          rejectEmployeeAction: true,
          rejectAction: false
        },
      }
    ];
  }
}
