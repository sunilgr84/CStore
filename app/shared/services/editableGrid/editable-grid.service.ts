import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { UtilityService } from '../utility/utility.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { isNumber } from 'lodash';
import { DateTimeEditorRenderer } from '@shared/component/editable-grid/partials/date-time-picker.editor.component';
import { NumericEditor } from '@shared/component/editable-grid/partials/numeric-editor.component';
import { DecimalEditor } from '@shared/component/editable-grid/partials/decimal.editor.component';
import { isNullOrUndefined } from 'util';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class EditableGridService {
  gridOption: any;
  defaultConfigurations: any;
  userInfo = this.constants.getUserInfo();
  constructor(private constantService: ConstantService, private commonService: CommonService,
    private utilityService: UtilityService, private constants: ConstantService, private toastr: ToastrService) {
    this.defaultConfigurations = this.constantService.editableGridConfig;
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
      headerHeight: 40,
      suppressRowClickSelection: false,
      isSearchTextBoxRequired: true,
      gridType: gridType
    };
    let defaultSetting = this.defaultConfigurations.defaultSetting[gridType];
    defaultSetting = defaultSetting ? defaultSetting : this.defaultConfigurations.defaultSetting['DEFAULT'];
    gridOptions.RowSelection = defaultSetting.rowSelection;
    gridOptions.headerHeight = defaultSetting.headerHeight ? defaultSetting.headerHeight : gridOptions.headerHeight;
    gridOptions.suppressRowClickSelection = defaultSetting.suppressRowClickSelection ? true : false;
    gridOptions.SingleClickEdit = this.getSingleClickEdit(gridType, defaultSetting.singleClickEdit);

    gridOptions.isSearchTextBoxRequired =
      (defaultSetting.isSearchTextBoxRequired || defaultSetting.isSearchTextBoxRequired === undefined) ? true : false;

    gridOptions.columnDefs = this.getColumnDef(gridType);
    return gridOptions;
  }
  /**
   * To get column definations
   * @param gridType - grid name required to fetch specific column defintions
   */
  getColumnDef(gridType) {
    switch (gridType) {
      case this.constantService.gridTypes.demoGrid:
        return this.demoGridCol();
      case this.constantService.gridTypes.companyReconParameterGrid:
        return this.getCompanyReconParameterGrid();
      case this.constantService.editableGridConfig.gridTypes.fuelGradeGrid:
        return this.getFuelGradeGridCol();
      case this.constantService.gridTypes.sellingPriceGrid:
        return this.getsellingPriceGridCol();
      case this.constantService.editableGridConfig.gridTypes.fuelGradeTankDetailsGrid:
        return this.fuelGradeTankDetailsGridCol();
      case this.constantService.editableGridConfig.gridTypes.fuelGradeBlendGrid:
        return this.fuelGradeBlendGridCol();
      case this.constantService.editableGridConfig.gridTypes.fuelInventoryGrid:
        return this.fuelInventoryGridCol();
      case this.constantService.editableGridConfig.gridTypes.itemGroupGrid:
        return this.itemGroupGridCol();
      case this.constantService.editableGridConfig.gridTypes.vendorItemGrid:
        return this.vendorItemGridCol();
      case this.constantService.editableGridConfig.gridTypes.userRoleWiseStoreGrid:
        return this.userRoleWiseStoreGridCol();

      case this.constantService.editableGridConfig.gridTypes.storeItemsGrid:
        return this.storeItemsGridCol();
      case this.constantService.editableGridConfig.gridTypes.storeItemsGridEditable:
        return this.storeItemsGridEditableCol();
      case this.constantService.editableGridConfig.gridTypes.editItemVendorGrid:
        return this.editItemVendorGridCol();
      case this.constantService.editableGridConfig.gridTypes.editItemGroupGrid:
        return this.editItemGroupGrid();
      case this.constantService.editableGridConfig.gridTypes.multiplierItemGrid:
        return this.multiplierItemGridCol();
      case this.constantService.editableGridConfig.gridTypes.linkedItemGrid:
        return this.linkedItemGridCol();
      case this.constantService.editableGridConfig.gridTypes.customerPriceGroupGrid:
        return this.customerPriceGroupGridCol();
      case this.constantService.editableGridConfig.gridTypes.itemCustomPriceGroupGrid:
        return this.itemCustomPriceGroupGrid();
      case this.constantService.editableGridConfig.gridTypes.fuelGradeBlendDetailsGrid:
        return this.fuelGradeBlendDetailsGridCol();
      case this.constantService.editableGridConfig.gridTypes.invoiceChargesGrid:
        return this.invoiceChargesGridCol();
      case this.constantService.editableGridConfig.gridTypes.invoiceChargesGridNonEditable:
        return this.invoiceChargesGridColNonEditable();
      case this.constantService.editableGridConfig.gridTypes.invoicePaymentGrid:
        return this.invoicePaymentGridCol();
      case this.constantService.editableGridConfig.gridTypes.invoicePaymentGridNonEditable:
        return this.invoicePaymentGridColNonEditable();
      case this.constantService.editableGridConfig.gridTypes.fuelInvoiceOtherChargesGrid:
        return this.fuelInvoiceOtherChargesGridCol();
      case this.constantService.editableGridConfig.gridTypes.tankVolumeDetailGrid:
        return this.tankVolumeDetailGridCol();
      case this.constantService.editableGridConfig.gridTypes.editCompetitorPricingGrid:
        return this.editCompetitorPricingGridCol();
      case this.constantService.editableGridConfig.gridTypes.fuelPricingGrid:
        return this.fuelPricingGridCol();
      case this.constantService.editableGridConfig.gridTypes.priceGItemGrid:
        return this.priceGItemGridCol();
      case this.constantService.editableGridConfig.gridTypes.multipacksIGrid:
        return this.multipacksIGridCol();

      case this.constantService.editableGridConfig.gridTypes.edittableBOLGrid:
        return this.edittableBOLGridCol();
      case this.constantService.editableGridConfig.gridTypes.edittableBOLResponseGrid:
        return this.edittableBOLResponseGridCol();
      case this.constantService.editableGridConfig.gridTypes.departmentUpdateSellingPriceGrid:
        return this.departmentUpdateSellingPriceGridCol();
      case this.constantService.editableGridConfig.gridTypes.departmentProductNameForEDIGrid:
        return this.departmentProductNameForEDIGridCol();
      case this.constantService.editableGridConfig.gridTypes.fuelReconciliationOtherChargesGrid:
        return this.fuelReconciliationOtherChargesGridCol();
      case this.constantService.editableGridConfig.gridTypes.lotteryGameGrid:
        return this.lotteryGameGridCol();
      case this.constantService.editableGridConfig.gridTypes.addInvoicesDetailsGrid:
        return this.addInvoicesDetailsGridCol();
      case this.constantService.editableGridConfig.gridTypes.addInvoicesDetailsGridNonEditable:
        return this.addInvoicesDetailsGridColNonEditable();
      case this.constantService.editableGridConfig.gridTypes.salesTaxGrid:
        return this.salesTaxGridCol();
      // case this.constantService.gridTypes.fuelTaxGrid:
      //   return this.fuelTaxGridCol();
      case this.constantService.editableGridConfig.gridTypes.salesRestrictionGrid:
        return this.salesRestrictionGridCol();
      case this.constantService.editableGridConfig.gridTypes.storeFeesGrid:
        return this.storeFeesGridCol();
      case this.constantService.editableGridConfig.gridTypes.paymentMethodGrid:
        return this.paymentMethodGridCol();
      case this.constantService.editableGridConfig.gridTypes.privilageGrid:
        return this.privilageGridCol();
      // case this.constantService.editableGridConfig.gridTypes.houseAccountGrid:
      //   return this.houseAccountGridCol();
      case this.constantService.editableGridConfig.gridTypes.masterlinkedItemGrid:
        return this.masterLinkedItemGridCol();
      case this.constantService.editableGridConfig.gridTypes.lotteryInventoryGrid:
        return this.lotteryInventoryGridCol();
      case this.constantService.editableGridConfig.gridTypes.dayReconMOPGrid:
        return this.dayReconMOPGridCol();
      case this.constantService.editableGridConfig.gridTypes.atmGrid:
        return this.atmGridCol();
      case this.constantService.editableGridConfig.gridTypes.bankGrid:
        return this.bankGridCol();
      case this.constantService.editableGridConfig.gridTypes.bankDepositGrid:
        return this.bankDepositGridCol();
      case this.constantService.gridTypes.tankVolumeHistoryGrid:
        return this.tankVolumeHistoryGridCol();
      case this.constantService.editableGridConfig.gridTypes.userPrivilegeGrid:
        return this.userPrivilegeGridCol();
      case this.constantService.editableGridConfig.gridTypes.bolGrid:
        return this.billOfLandingsGridCol();
      case this.constantService.editableGridConfig.gridTypes.timeOffGetGrid:
        return this.getTimeOffGetGrid();
      case this.constantService.editableGridConfig.gridTypes.timeOffGetGridByRole:
        return this.getTimeOffGetGridByRole();
      case this.constantService.editableGridConfig.gridTypes.gridemployeeTimesheetDetail:
        return this.gridemployeeTimesheetDetail();
      case this.constantService.editableGridConfig.gridTypes.adjustemployeeTimesheetDetail:
        return this.adjustemployeeTimesheetDetail();
    }
  }

  /**
   *  Single Click Edit
   * @param gridType Type of grid
   * @param defaultValue default value of grid
   */
  getSingleClickEdit(gridType, defaultValue): boolean {
    switch (gridType) {
      case this.constantService.editableGridConfig.gridTypes.itemGroupGrid:
        return false;
      // case this.constantService.editableGridConfig.gridTypes.masterManufacturerGrid:
      //   return false;
      default:
        return defaultValue;
    }
  }
  dateFormat(value) {
    return moment(value).format('MM-DD-YYYY');
  }
  numericValue(value) {
    return value;
  }
  demoGridCol() {
    return [
      { headerName: 'UPC Code', field: 'upcCode', width: 120 },
      { headerName: 'Description', field: 'description', editable: true, width: 320 },
      { headerName: 'Active Department', field: 'activeDept', editable: true },
      { headerName: 'Selling Units', field: 'sellingUnits', editable: true },
      { headerName: 'Unit Per Case', field: 'unitCase', editable: true },
      { headerName: 'Action', field: 'value', cellRenderer: 'CellActionRenderer', colId: 'params', width: 150, suppressSorting: false }
    ];
  }

  getCompanyReconParameterGrid(): any {
    return [
      // { headerName: 'Id', field: 'companyReconParameterID', width: 80, type: 'numericColumn' },
      { headerName: 'Company Recon Parameter Name', field: 'companyReconParameterName', editable: true },
      {
        headerName: 'Is Expense', field: 'isExpense', cellRenderer: 'CheckboxCellRenderer',
      },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, isSaveRequired: true }, colId: 'params', suppressSorting: false, width: 100
      }
    ];
  }
  getFuelGradeGridCol(): any {
    return [
      { headerName: 'Fuel Grade', field: 'fuelGradeName', editable: true },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, isSaveRequired: true }, colId: 'params', suppressSorting: false, width: 95
      }
    ];
  }
  getsellingPriceGridCol(): any {
    return [
      { headerName: 'Sr. No.', field: 'srNo', width: 120, type: 'numericColumn' },
      { headerName: 'Selling Unit', field: 'SellingUnit', width: 120, type: 'numericColumn', editable: true },
      { headerName: 'Amount', field: 'Amount', width: 120, type: 'numericColumn', editable: true },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellActionRenderer', width: 80,
        cellRendererParams: { hideEditAction: true }, colId: 'params', suppressSorting: false
      }
    ];
  }
  getFuelGradeSetupCol() {
    return [
      { headerName: 'ID', field: 'FuelGradeId', width: 120, },
      { headerName: 'Fuel Grade Name', field: 'SellingUnit', width: 120, editable: true },
      { headerName: 'Fuel Department', field: 'Amount', width: 120, editable: true },
      { headerName: 'Store Fuel Grade Name', field: 'Amount', width: 120, editable: true },
      { headerName: 'Fuel Grade Color', field: 'Amount', width: 120 },
    ];
  }

  fuelGradeTankDetailsGridCol() {
    return [
      { headerName: 'Tank Number', field: 'storeTankNo', editable: true },
      { headerName: 'Description', field: 'tankName', editable: true },
      { headerName: 'Capacity', field: 'tankVolume', editable: true },
      { headerName: 'Reorder Level', field: 'tankReOrderVolume', editable: true },
      { headerName: 'Tank Ullage', field: 'tankUllage', editable: true },
      { headerName: 'Current Tank Volume', field: 'currentTankVolume', editable: true },
      { headerName: 'Tank Type', field: 'isTankUnderground', editable: true },
      {
        headerName: 'Action', field: 'value', cellRenderer: 'CellActionRenderer', width: 80,
        cellRendererParams: { hideEditAction: true }, colId: 'params', suppressSorting: false
      }
    ];
  }

  fuelGradeBlendGridCol() {
    return [
      { headerName: 'Primary Fuel Grade Blend', field: 'primaryFuelGradeBlendID' },
      { headerName: 'Primary Fuel Grade Percentage', field: 'primaryFuelBlendPercentage' },
      { headerName: 'Secondary Fuel Grade Blend', field: 'secondaryFuelGradeBlendID' },
      { headerName: 'Secondary Fuel Grade Percentage', field: 'secondaryFuelBlendPercentage' },
    ];
  }

  itemGroupGridCol() {
    return [
      // { headerName: '', field: 'primaryFuelGradeBlendID', width: 50 },
      {
        headerName: '', field: 'itemGroup', width: 55, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true,
      },
      { headerName: 'Group Code', field: 'groupCode', width: 150, editable: true },
      { headerName: 'Group Description', field: 'groupDescription', width: 200, editable: true },
      { headerName: 'Active', field: 'isActive', cellRenderer: 'CheckboxCellRenderer', width: 100 },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, isSaveRequired: true }, colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  vendorItemGridCol() {
    return [
      // { headerName: '', field: 'primaryFuelGradeBlendID', width: 50 },
      { headerName: 'Item UPC Code', field: 'itemPosCode', headerClass: 'header-text-wrap', editable: true },
      { headerName: 'Item Name', field: 'description', headerClass: 'header-text-wrap', width: 290 },
      { headerName: 'Vendor Code', field: 'vendorItemCode', headerClass: 'header-text-wrap', editable: true },
      {
        headerName: 'Action', field: 'action', headerClass: 'header-text-wrap', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false }, colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  userRoleWiseStoreGridCol() {
    return [
      { field: 'isAssigned', cellRenderer: 'CheckboxCellRenderer', width: 40 },
      { headerName: 'Store', field: 'storeName', width: 180 },
    ];
  }
  storeItemsGridCol() {
    return [
      { headerName: 'Store', field: 'storeName', width: 250, },
      { headerName: 'POS Code', field: 'posCode', hide: true },
      {
        headerName: 'Cost', field: 'inventoryValuePrice', editable: false,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Sell Price', field: 'regularSellPrice', editable: false,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Profit%', field: 'profitMargin', hide: true }, //
      { headerName: 'Min Inv.', field: 'minInventory', editable: false, },
      { headerName: 'Max Inv.', field: 'maxInventory', editable: false, },
      {
        headerName: 'Current Inv.', field: 'currentInventory', editable: false,
      },
      {
        headerName: 'Inv. Date', field: 'inventoryAsOfDate',
        cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true }, colId: 'params', suppressSorting: false
      }
    ];
  }
  storeItemsGridEditableCol() {
    return [
      { headerName: 'Store', field: 'storeName', minWidth: 80, headerClass: 'header-text-wrap', suppressMenu: true },
      { headerName: 'POS Code', field: 'posCode', hide: true, suppressMenu: true },
      {
        headerName: 'Cost Buy', field: 'buyingCost', editable: true, cellEditor: 'numericEditor', suppressMenu: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap header-text-right',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }, minWidth: 60,
      },
      {
        headerName: 'Cost Discount', field: 'buyingDiscount', editable: true, cellEditor: 'numericEditor', suppressMenu: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }, headerClass: 'header-text-wrap', minWidth: 80,
      },
      {
        headerName: 'Cost', field: 'inventoryValuePrice', minWidth: 50, editable: true, cellEditor: 'numericEditor', suppressMenu: true, cellStyle: { 'text-align': 'right' },
        cellRenderer: (params) => {
          return this.calculateCostPrice(params);
        }, headerClass: 'header-text-wrap'
      },
      {
        headerName: 'Sell Price', field: 'regularSellPrice', minWidth: 60, editable: true, cellEditor: 'numericEditor', suppressMenu: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap header-text-right',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'SRP Price', field: 'mrp', minWidth: 60, editable: false, cellEditor: 'numericEditor', suppressMenu: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap header-text-right',
        cellRenderer: (params) => {
          if (params.data.mrp != 0 || params.data.mrp != null) {
            return this.utilityService.formatDecimalCurrency(params.data.mrp);
          }
        }
      },
      {
        headerName: 'Margin', field: 'profitMargin', minWidth: 65, editable: false, cellEditor: 'numericEditor', suppressMenu: true, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.calculateMarginForStoreItems(params);
        }
      },
      { headerName: 'Profit%', field: 'profitMargin', minWidth: 60, hide: true, suppressMenu: true, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Buy down.', field: 'buyDownAmt', minWidth: 60, editable: true, cellEditor: 'numericEditor', suppressMenu: true,
        headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(params.value);
        },
      },
      {
        headerName: 'Rack Allowance', field: 'rackAllowance', minWidth: 80, editable: true, cellEditor: 'numericEditor', suppressMenu: true
        , headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          // params.value = params.value ? params.value : 0;
          return this.utilityService.formatDecimalCurrencyWithZero(params.value);
        },
      },
      { headerName: 'Min Inv.', field: 'minInventory', minWidth: 45, editable: true, cellEditor: 'numericEditor', headerClass: 'header-text-wrap', suppressMenu: true, cellStyle: { 'text-align': 'right' }, },
      { headerName: 'Max Inv.', field: 'maxInventory', minWidth: 48, editable: true, cellEditor: 'numericEditor', headerClass: 'header-text-wrap', suppressMenu: true, cellStyle: { 'text-align': 'right' }, },
      {
        headerName: 'Current Inv.', field: 'currentInventory', minWidth: 65, editable: false, cellEditor: 'numericEditor',
        headerClass: 'header-text-wrap', suppressMenu: true,
      },

      {
        headerName: 'Inv. Date', field: 'inventoryAsOfDate', minWidth: 80, suppressMenu: true,
        cellRenderer: (params) => {
          params.data.inventoryAsOfDate = this.utilityService.formatDate(params.value);
          return this.utilityService.formatDate(params.value);
        }, headerClass: 'header-text-wrap'
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', suppressMenu: true,
        cellRendererParams: (params) => {
          if (params.data.isDeleted) return { hideEditAction: true, showSave: true, showRecover: true };
          else return { hideEditAction: true, showSave: true, showSuspend: true };
        },
        colId: 'params', suppressSorting: false, headerClass: 'header-text-wrap', minWidth: 90,
      }
    ];
  }

  calculateCostPrice(params: any) {
    let inventoryValuePrice = params.data.inventoryValuePrice;
    if (params.data.buyingCost && params.data.buyingDiscount && (Number(params.data.buyingDiscount) < Number(params.data.buyingCost))) {
      inventoryValuePrice =
        ((params.data.buyingCost - params.data.buyingDiscount) / params.data.unitsInCase).toFixed(2);
    } else if (params.data.buyingCost && Number(params.data.buyingCost) >= 0) {
      inventoryValuePrice =
        (params.data.buyingCost / params.data.unitsInCase).toFixed(2);
    } else {
      inventoryValuePrice = params.value;
    }
    params.data.inventoryValuePrice = inventoryValuePrice;
    return this.utilityService.formatDecimalCurrency(inventoryValuePrice);
  }

  calculateMarginForStoreItems(params: any) {
    let inventoryValuePrice = params.data.inventoryValuePrice;
    if (params.data.buydown && Number(params.data.buydown) >= 0) inventoryValuePrice = inventoryValuePrice - Number(params.data.buydown);
    if (params.data.rackAllowance && Number(params.data.rackAllowance) >= 0) inventoryValuePrice = inventoryValuePrice - Number(params.data.rackAllowance);
    let profit = parseFloat(params.data.regularSellPrice) - parseFloat(inventoryValuePrice);
    let grossMargin = ((profit) * 100) / parseFloat(params.data.regularSellPrice);
    if (grossMargin > 0) return this.utilityService.formatpercentage(grossMargin.toFixed(2));
    else return 0.00;
  }

  editItemVendorGridCol() {
    return [
      {
        headerName: 'Vendor Name', field: 'vendorName', minWidth: 100, editable: true, width: 280, headerClass: 'header-text-wrap',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getVendorItemDrop(),
          };
        }
      },
      { headerName: 'Vendor Item Code', field: 'vendorItemCode', minWidth: 150, editable: true, width: 300, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Action', field: 'action', minWidth: 90, cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
        colId: 'params', width: 100, suppressSorting: false, headerClass: 'header-text-wrap'
      }
    ];
  }
  getVendorItemDrop() {
    const vendorItemList = this.commonService.vendorItemList;
    const finalArray = [''];
    if (vendorItemList) {
      vendorItemList.forEach((x) => {
        const contct = x.vendorName; // x.vendorID + ',' +
        finalArray.push(contct);
      });
      return finalArray;
    }
  }
  editItemGroupGrid() {
    return [
      {
        headerName: '', field: 'isAdded', width: 80, cellRenderer: 'CheckboxCellRenderer'
      },
      { headerName: 'Group Code', field: 'groupCode' },
      { headerName: 'Group Description', field: 'groupDescription' }
    ];
  }
  multiplierItemGridCol() {
    return [
      {
        headerName: 'Type', field: 'mulType', minWidth: 60, editable: !this.commonService.isItemDefault, width: 200, headerClass: 'header-text-wrap',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getMultiplierInventoryTypeDrop(),
          };
        }
      },
      {
        headerName: 'UPC Code', field: 'upcCode', minWidth: 75, editable: !this.commonService.isItemDefault,
        width: 150, headerClass: 'header-text-wrap'
      },
      { headerName: 'Description', minWidth: 80, field: 'itemDescription', width: 120, headerClass: 'header-text-wrap' },
      { headerName: 'containedItemID', minWidth: 80, field: 'containedItemID', hide: true, },
      { headerName: 'Qty', minWidth: 60, field: 'quantity', cellStyle: { 'text-align': 'center' }, editable: !this.commonService.isItemDefault, width: 140, headerClass: 'header-text-wrap' },
      {
        headerName: 'Is Pack Discounted', field: 'isPackDiscounted', cellEditor: 'checkboxCellEditor',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isPackDiscounted),
        headerClass: 'header-text-wrap',
        editable: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if (mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) {
            return false;
          } else {
            return true;
          }
        }, cellStyle: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if (mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) {
            return { 'background-color': '#e4e4e4' };
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Link Type', minWidth: 60, field: 'linkedTypeDescription',
        editable: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if ((mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) || !params.data.isPackDiscounted) {
            return false;
          } else {
            return true;
          }
        },
        headerClass: 'header-text-wrap',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getlinkedTypeDescriptionDrop(),
          };
        }, cellStyle: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if (mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) {
            return { 'background-color': '#e4e4e4' };
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Discount', minWidth: 70, field: 'discountAmount', headerClass: 'header-text-wrap',
        cellEditor: 'numericEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        editable: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if ((mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) || !params.data.isPackDiscounted) {
            return false;
          } else {
            return true;
          }
        },
        cellStyle: (params) => {
          const multiplierInventoryType = this.commonService._multiplierInventoryType;
          let mulType = multiplierInventoryType.filter(v => v.multiplierType === params.data.mulType);
          if (mulType.length > 0 && mulType[0].multiplierInventoryTypeID === 2) {
            return { 'background-color': '#e4e4e4' };
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Action', minWidth: 70, field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', headerClass: 'header-text-wrap',
        cellRendererParams: { hideEditAction: false }, width: 100
      }
    ];
  }

  checkLinkTypeEditable(params) {
    if (params.data.linkedItemtypeID === 2) {
      return false;
    } else {
      return true;
    }
  }
  getMultiplierInventoryTypeDrop() {
    const multiplierInventoryType = this.commonService._multiplierInventoryType;
    const finalArray = [];
    if (multiplierInventoryType) {
      multiplierInventoryType.forEach((x) => {
        const contct = x.multiplierType; // x.multiplierInventoryTypeID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }

  getlinkedTypeDescriptionDrop() {
    const _LinkedTypeList = this.commonService.LinkedTypeList;
    const finalArray = [];
    if (_LinkedTypeList) {
      _LinkedTypeList.forEach((x) => {
        const contct = x.description; // x.multiplierInventoryTypeID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  getBindLinkTypeById(id) {
    const _LinkedTypeList = this.commonService.LinkedTypeList;
    const finalArray = _.find(_LinkedTypeList, ['linkedItemTypeID', id]);
    return finalArray ? finalArray.description : '';
  }
  linkedItemGridCol() {
    // pinned: 'right',
    return [
      { headerName: 'UPC Code', minWidth: 60, field: 'posCode', editable: true, width: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Description', minWidth: 80, field: 'description', headerClass: 'header-text-wrap' },
      { headerName: 'linkItemID', minWidth: 80, field: 'linkItemID', hide: true },
      {
        headerName: 'Link Type', minWidth: 60, field: 'linkedTypeDescription', editable: true
        , headerClass: 'header-text-wrap',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getlinkedTypeDescriptionDrop(),
          };
        }
      },
      {
        headerName: 'Discount', minWidth: 70, field: 'discountAmount', editable: true, headerClass: 'header-text-wrap header-text-center', cellStyle: { 'text-align': 'right' },
        cellEditor: 'numericEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', minWidth: 70, field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 100, headerClass: 'header-text-wrap',
        cellRendererParams: { hideEditAction: false, isSaveRequired: false },
      }
    ];
  }
  masterLinkedItemGridCol() {
    // pinned: 'right',
    return [
      { headerName: 'UPC Code', field: 'posCode', width: 150, headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'description', headerClass: 'header-text-wrap' },
      { headerName: 'masterLinkPriceBookItemID', field: 'masterLinkPriceBookItemID', hide: true },
      {
        headerName: 'Link Type', field: 'linkedTypeDescription'
        , headerClass: 'header-text-wrap',
        // cellRenderer: (params) => {
        //   return this.getBindLinkTypeById(params.data.linkedItemTypeID);
        // },
        // cellEditor: 'agSelectCellEditor',
        // cellEditorParams: (params) => {
        //   return {
        //     values: this.getlinkedTypeDescriptionDrop(),
        //   };
        // }
      },
      {
        headerName: 'Discount', field: 'promoDiscountAmount', headerClass: 'header-text-wrap',
        // cellEditor: 'numericEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer',
        width: 100, headerClass: 'header-text-wrap',
        cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
      }
    ];
  }
  customerPriceGroupGridCol() {
    return [
      { headerName: 'Group Name', field: 'groupName' },
      { headerName: 'Update Price', field: 'updatePrice' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false }, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }
  itemCustomPriceGroupGrid() {
    return [
      { headerName: 'Group Name', field: 'groupDescription' },
      {
        headerName: 'Update Price', field: 'updatePrice', editable: true,
        cellEditor: 'agRichSelectCellEditor',
        cellEditorParams: {
          values: ['test', 'test1', 'test3'],
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: true }, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }
  fuelGradeBlendDetailsGridCol() {
    return [
      { headerName: 'Fuel Grade', field: 'primaryFuelGradeBlendID', editable: true },
      { headerName: 'Percentage', field: 'primaryFuelBlendPercentage', editable: true },
    ];
  }

  invoiceChargesGridCol() {
    return [
      {
        headerName: 'Invoice Charge Type', field: 'invoiceChargeTypeDescription', editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getInvoiceChargeDrop(),
          };
        }
      },
      { headerName: 'Invoice Charge', field: 'invoiceChargeDescription', editable: true },
      {
        headerName: 'Amount', field: 'invoiceChargeAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithNegativeValue(params.value);
        },
        width: 100
      },
      {
        headerName: '', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false, isSaveRequired: true, hideDeleteAction: false },
        colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }
  invoiceChargesGridColNonEditable() {
    return [
      {
        headerName: 'Invoice Charge Type', field: 'invoiceChargeTypeDescription', editable: false,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getInvoiceChargeDrop(),
          };
        }
      },
      { headerName: 'Invoice Charge', field: 'invoiceChargeDescription', editable: false },
      {
        headerName: 'Amount', field: 'invoiceChargeAmount', editable: false, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithNegativeValue(params.value);
        },
        width: 100
      },
      {
        headerName: '', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, isSaveRequired: false, hideDeleteAction: true },
        colId: 'params', width: 100, suppressSorting: false
      }
    ];
  }

  getInvoiceChargeDrop() {
    // x.invoiceChargeTypeID + ',' +
    const invoiceChargeList = this.commonService.invoiceChargeList;
    const finalArray = [''];
    if (invoiceChargeList) {
      invoiceChargeList.forEach((x) => {
        const contct = x.invoiceChargeTypeDescription;
        finalArray.push(contct);
      });
      return finalArray;
    }
  }

  getInvoicePaymentDropdown() {
    const invoicePaymentList = this.commonService.invoicePaymentList;
    const finalArray = [''];
    if (invoicePaymentList) {
      invoicePaymentList.forEach((x) => {
        const contct = (x.storeBankID == null ? x.sourceName : x.bankNickName);
        finalArray.push(contct);
      });
      return finalArray;
    }
  }

  lookupKey(mappings, name) {
    for (var key in mappings) {
      if (mappings.hasOwnProperty(key)) {
        if (name === mappings[key]) {
          return key;
        }
      }
    }
  }
  invoicePaymentGridCol() {
    return [
      {
        headerName: 'Source Name', field: 'sourceName', cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          // inputSource: this.commonService.invoicePaymentList,
          cellfieldId: 'sourceName',
          textfield: 'sourceNameLabel'
        }
      },
      {
        headerName: 'Method Of Payment', field: 'methodOfPaymentDescription', editable: function (params) {
          return params.node.data.isEdit === true && params.node.data.methodOfPaymentDescription != null;
        }, cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          cellfieldId: 'methodOfPaymentDescription',
          textfield: 'methodOfPaymentDescriptionLabel',
          disableProperty: "disablemethodOfPaymentDescription",
        }
      },
      {
        headerName: 'Memo', field: 'memo', editable: function (params) {
          return params.node.data.isEdit === true;
        }, width: 120,
      },
      {
        headerName: 'Amount Paid', field: 'amountPaid', editable: function (params) {
          return params.node.data.isEdit === true;
        }, width: 130, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Check', field: 'checkNumber', editable: function (params) {
          return params.node.data.isEdit === true;
        }, cellEditor: 'numericEditor', width: 85
      },
      {
        headerName: '', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: (params) => {
          if (parseInt(params.data.paymentMethodOfID) === 13) {
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: false, hidePrintAction: false };
          } else {
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: false, hidePrintAction: true };
          }
        },
        colId: 'params', width: 120, suppressSorting: false
      }
    ];
  }

  invoicePaymentGridColNonEditable() {
    return [
      {
        headerName: 'Source Name', field: 'sourceName', editable: false,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          return {
            values: this.getInvoicePaymentDropdown(),
          };
        }
      },

      { headerName: 'Memo', field: 'memo', editable: false },
      {
        headerName: 'Amount Paid', field: 'amountPaid', editable: false, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Check', field: 'checkNumber', editable: false, cellEditor: 'numericEditor' },
      {
        headerName: '', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: (params) => {
          if (params.data.methodOfPaymentID === 1) {
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: true, hidePrintAction: false };
          } else {
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: true, hidePrintAction: false };
          }
          // if (params.data.invoiceStatus === "Completed" || params.data.invoiceStatus === "Ready for Review") {
          // return { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false, hidePrintAction: false };
          // } else {
          //   return { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false, hidePrintAction: true };
          // }
        },
        colId: 'params', width: 120, suppressSorting: false
      }
    ];
  }

  fuelInvoiceOtherChargesGridCol(): any {
    return [
      {
        headerName: 'Fuel Grade', field: 'storeFuelGradeName', editable: true, cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowedTanks = this.GetFuelGradebyFuelDropDown();
          return { values: allowedTanks, };
        }
      },
      { headerName: 'Description', field: 'otherChargeDescription', editable: true },
      {
        headerName: 'Amount', field: 'amount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatFourDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, hideDeleteAction: false, isSaveRequired: true },
        colId: 'params', width: 120, suppressSorting: false
      }
    ];
  }
  GetFuelGradebyFuelDropDown() {
    const fuelOtherChargeList = this.utilityService.remove_duplicates(
      this.commonService.fuelOtherChargeList, this.commonService._fuelInvoiceOtherRow, 'fuelInvoiceDetailID');
    const finalArray = [];
    if (fuelOtherChargeList) {
      fuelOtherChargeList.forEach((x) => {
        const contct = x.storeFuelGradeName;
        finalArray.push(contct);
        // x.fuelInvoiceDetailID + ',' +
      });
      return finalArray;
    }
  }
  tankVolumeDetailGridCol() {
    return [
      { headerName: 'No', field: 'rowNumber', width: 80 },
      { headerName: 'Tank No', field: 'storeTankNo', width: 100 },
      { headerName: 'Tank Description', field: 'tankName', width: 150 },
      { headerName: 'Fuel Grade', field: 'fuelGradeName', width: 80 },
      { headerName: 'Current Volume', field: 'currentTankVolume', editable: true, width: 150 },
      { headerName: 'Height', field: 'height', editable: true, width: 100 },
      { headerName: 'Water Lavel', field: 'waterLevel', editable: true, width: 150 },
      { headerName: 'Water Volume', field: 'waterVolume', editable: true, width: 150 },
      { headerName: 'Temparature', field: 'temparature', editable: true, width: 150 },
      { headerName: 'Deliverd By', field: 'deliveredBy', editable: true, width: 150 },
      { headerName: 'Reading Data Time', field: 'readingAsOfDateTime', editable: true, width: 150 },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', pinned: 'right',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: true }, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }
  editCompetitorPricingGridCol() {
    return [
      { headerName: 'Competitor Name', field: 'storeCompetitorName', headerClass: 'header-text-wrap' },
      { headerName: 'Store Name', field: 'storeName', },
      {
        headerName: 'Regular', field: 'regularFuelPrice', editable: true,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      {
        headerName: 'Mid Grade', field: 'midGradeFuelPrice', editable: true,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      {
        headerName: 'Premium', field: 'premiumFuelPrice', editable: true,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      {
        headerName: 'Kerosene', field: 'keroseneFuelPrice', editable: true,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      {
        headerName: 'Disel', field: 'diselFuelPrice', editable: true,
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      // { headerName: 'TestCol', field: 'testCol', editable: true },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', width: 120, suppressSorting: false,
        cellRendererParams: { hideEditAction: false, hideDeleteAction: false }, colId: 'params',
      }
    ];
  }
  fuelPricingGridCol() {
    return [
      { headerName: 'Fuel Grade', field: 'fuelGrade' },
      { headerName: 'Last Sync To POS', field: 'lastSyncToPOS' },
      { headerName: 'Service Level', field: 'serviceLevel' },
      { headerName: 'Cost/Gallon', field: 'costGallon', editable: true },
      { headerName: 'Current Cash Price', field: 'currentCashPrice' },
      { headerName: 'Current Credit Price', field: 'currentCreditPrice' },
      { headerName: 'New Cash Price', field: 'newCashPrice', editable: true },
      { headerName: 'New Credit Price', field: 'newCreditPrice', editable: true },
      { headerName: 'Cash Margin', field: 'cashMargin', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      { headerName: 'Credit Margin', field: 'creditMargin', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: false, hideDeleteAction: true }, colId: 'params', width: 80, suppressSorting: false
      }
    ];
  }
  
  fuelInventoryGridCol() {
    return [
      { headerName: 'Fuel Grade', field: 'storeFuelGradeName' },
      { headerName: 'Current Inventory', field: 'currentInventory' },
      
      { headerName: 'Adjust Inventory', field: '', checkboxSelection: true, width:150,suppressMenu:false, suppressSorting:false },


      { headerName: 'Update Inventory',field:'updatedInventory',headerClass: 'header-text-wrap', cellEditor: 'numericEditor',width: 160, editable: true
      , cellRenderer: (params:any) => {
        params.data.isEdit = true;
        console.log("fuel params",params);
        return this.numericValue(params.value);
      }
    },
      { headerName: 'Updated Date & Time', field: 'updatedDateTime',
      cellRenderer: (params: any) => {
        params.data.updatedDateTime = this.utilityService.formatDate(params.value);
        return this.utilityService.formatDate(params.value);
      }
      },
      { headerName: 'Inventory Updated By', field: 'updatedBy' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 150, cellRendererParams: { hideEditAction: false, isSaveRequired: true, hideDeleteAction: true },
      }
      
    ];
  }


  priceGItemGridCol() {
    return [
      {
        headerName: 'Group', field: 'CompanyPriceGroupName', headerClass: 'header-text-wrap',
        editable: true, width: 550, minWidth: 90,
        // pinned: 'right',
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowed = this.getCompanyPriceGroup();
          return {
            values: allowed,
          };
        }
      },
      {
        headerName: 'Action', field: 'action', minWidth: 90, colId: 'params', cellRenderer: 'CellActionRenderer', width: 100,
        headerClass: 'header-text-wrap',
        cellRendererParams: { hideEditAction: false, isSaveRequired: true, },
      }

    ];
  }
  getCompanyPriceGroup() {
    const tankList = this.commonService._companyPriceGroupRow;
    const finalArray = [''];
    if (tankList) {
      tankList.forEach((x) => {
        const contct = x.CompanyPriceGroupName; //  x.companyPriceGroupID + ',' +
        finalArray.push(contct);

      });
      return finalArray;
    }
  }
  getStoreNameByItem() {
    const list = this.commonService.itemStoreList;
    const finalArray = [''];
    if (list) {
      list.forEach((x) => {
        const contct = x.storeName; //  x.companyPriceGroupID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  getMutipackModifierByItem() {
    const list = this.commonService.multipackModifierList;
    const finalArray = [''];
    if (list) {
      list.forEach((x) => {
        const contct = x.posCodeModifier; //  x.companyPriceGroupID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  multipacksIGridCol() {
    return [
      {
        headerName: 'Store Name', field: 'storeName', editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowed = this.getStoreNameByItem();
          return {
            values: allowed,
          };
        }
      },
      {
        headerName: 'POS Code Modifier', field: 'posCodeModifier', editable: true, cellStyle: { 'text-align': 'center' },
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowed = this.getMutipackModifierByItem();
          return {
            values: allowed,
          };
        }
      },
      {
        headerName: 'Cost Price', field: 'unitCostPrice', editable: true, cellStyle: { 'text-align': 'right' }, cellEditor: 'numericEditor', headerClass: 'header-text-right',
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatCurrency(this.utilityService.formatDecimalDigit(params.value)) : '';
        }
      },
      {
        headerName: 'Selling Price', field: 'regularPackageSellPrice', cellStyle: { 'text-align': 'right' }, editable: true, cellEditor: 'numericEditor', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatCurrency(this.utilityService.formatDecimalDigit(params.value)) : '';
        }
      },
      {
        headerName: 'Profit %', field: 'grossProfit', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return params.value ? this.utilityService.formatDecimalDigit(params.value) : '';
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellRenderer',
        cellRendererParams: (params) => {
          if (params.data.isDeleted) return { hideEditAction: true, showSave: true, showRecover: true };
          else return { hideEditAction: true, showSave: true, showSuspend: true };
        },
        // cellRendererParams: { hideEditAction: false, hideDeleteAction: false },
      }
    ];
  }

  edittableBOLGridCol() {
    return [
      { headerName: 'Fuel Grade Name', field: 'fuelGradeName', editable: false },
      { headerName: 'Gross Fuel Grade Volume', field: 'grossFuelGradeVolume', editable: true },
      { headerName: 'Net Fuel Grade Volume', field: 'netFuelGradeVolume', editable: true },
      { headerName: 'Ordered Fuel Grade Volume', field: 'orderedFuelVoulme', editable: true },
    ];
  }
  edittableBOLResponseGridCol() {
    return [
      { headerName: 'Fuel Grade Name', field: 'fuelGradeName', editable: false },
      { headerName: 'Gross Fuel Grade Volume', field: 'grossFuelGradeVolume', editable: true },
      { headerName: 'Net Fuel Grade Volume', field: 'netFuelGradeVolume', editable: true },
      { headerName: 'Ordered Fuel Grade Volume', field: 'orderedFuelVoulme', editable: true },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 80,
        pinned: 'right', cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
      }
    ];
  }
  departmentUpdateSellingPriceGridCol() {
    return [
      {
        headerName: 'Department', field: 'posDepartmentDescription', editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowed = this.GetDropDownEDI();
          return {
            values: allowed,
          };
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 50,
        pinned: 'right', cellRendererParams: {
          hideEditAction: true, isSaveRequired: true,
          hideDeleteAction: false
        },
      }
    ];
  }
  departmentProductNameForEDIGridCol() {
    return [
      {
        headerName: 'Department', field: 'posDepartmentDescription', editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: (params) => {
          const allowed = this.GetDropDownEDI();
          return {
            values: allowed,
          };
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 50,
        cellRendererParams: {
          hideEditAction: true, isSaveRequired: true,
          hideDeleteAction: false
        },
      }
    ];
  }
  GetDropDownEDI() {
    const array = this.commonService._departmenEDIList;
    const finalArray = [''];
    if (array) {
      array.forEach(x => {
        const contct = x.departmentDescription; //  x.companyPriceGroupID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  fuelReconciliationOtherChargesGridCol() {
    return [
      { headerName: 'Description', field: 'chargeDescription', editable: true },
      {
        headerName: 'Amount', field: 'amount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 120,
        cellRendererParams: { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false },
      }
    ];
  }
  addInvoicesDetailsGridCol() {
    return [
      // {
      //   headerName: '', field: 'checkBox', width: 50, checkboxSelection: true,
      //   suppressMenu: true, suppressSorting: true,
      //   headerCheckboxSelection: true,
      // },
      { headerName: 'Sr No', field: 'sequenceNumber', width: 70, editable: true },
      { headerName: 'UPC Code', field: 'posCodeWithCheckDigit', width: 100 },
      { headerName: 'Vendor Code', field: 'vendorItemCode', width: 60, editable: true, headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'description', width: 130, editable: true },
      {
        headerName: 'Department', field: 'departmentDescription', width: 90, editable: true,
        cellEditorSelector: function (params) {
          params.data.isEdit = true;
          params.inputSource = params.data.deptList;
          params.cellfieldId = 'departmentID';
          params.textfield = 'departmentDescription';
          return {
            component: 'childSelectRenderer',
            params: params
          };
        }
      },
      {
        headerName: 'Unit Case', field: 'unitsInCase', width: 60,
        cellEditor: 'fourDigitEditor', editable: true, headerClass: 'header-text-wrap'
        , cellRenderer: (params) => {
          const value = params.value ? params.value : 0;
          params.data.casePrice = Number(value) * Number(params.data.invoiceValuePrice);
          if ((Number(params.data.buyingCaseQuantity) > 0 || Number(params.data.buyingCaseQuantity) < 0)
            && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingCaseQuantity) * Number(params.data.casePrice)).toFixed(2);
          }
          if ((Number(params.data.buyingUnitQuantity) > 0 || Number(params.data.buyingUnitQuantity) < 0)
            && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingUnitQuantity) * Number(params.data.invoiceValuePrice)).toFixed(2);
          }
          return Number(params.value);
        }
      },
      {
        headerName: 'Buying Cost', field: 'invoiceValuePrice', width: 75, editable: true, headerClass: 'header-text-wrap',
        cellEditor: 'decimalEditor', cellRenderer: (params) => {
          let arrow = '';
          if (Number(params.data.previousCostPrice) < Number(params.value)) {
            arrow = '<i class="fa fa-arrow-up" style="color:red" aria-hidden="true"></i>';
          } else {
            arrow = '<i class="fa fa-arrow-down" style="color:green" aria-hidden="true"></i>';
          }
          const value = params.value ? params.value : 0;
          params.data.casePrice = Number(value) * Number(params.data.unitsInCase);
          if ((Number(params.data.buyingCaseQuantity) > 0 || Number(params.data.buyingCaseQuantity) < 0)
            && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingCaseQuantity) * Number(params.data.casePrice)).toFixed(2);
          }
          if ((Number(params.data.buyingUnitQuantity) > 0 || Number(params.data.buyingUnitQuantity) < 0)
            && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingUnitQuantity) * Number(value)).toFixed(2);
          }
          this.calculateMargin(params);
          return value === 0 ? 0.000 + '&nbsp;' + arrow : this.utilityService.formatDecimalCurrencyThreePrecision(value) + '&nbsp;' + arrow;
        }
      },
      { headerName: 'Buy Down', field: 'buyDown', width: 60, headerClass: 'header-text-wrap' },
      {
        headerName: 'Selling', field: 'regularSellPrice', width: 75, editable: true
        , cellEditor: 'decimalEditor', cellRenderer: (params) => {
          // storeLocItemPrice
          let arrow = '';
          if (Number(params.data.storeLocItemPrice) < Number(params.value)) {
            arrow = '<i class="fa fa-arrow-up" style="color:red" aria-hidden="true"></i>';
          } else {
            arrow = '<i class="fa fa-arrow-down" style="color:green" aria-hidden="true"></i>';
          }
          const value = params.value ? params.value : 0;
          this.calculateMargin(params);
          return value === 0 ? 0.00 + '&nbsp;' + arrow : this.utilityService.formatDecimalCurrency(value) + '&nbsp;' + arrow;
        },
      },
      {
        headerName: 'Profit %', field: 'regularSellPrice', width: 75,
        cellRenderer: (params) => {
          let buyingCost = params.data.invoiceValuePrice ? Number(params.data.invoiceValuePrice) : 0;
          let buyDown = params.data.buyDown ? Number(params.data.buyDown) : 0;
          let sellingPrice = params.data.regularSellPrice ? Number(params.data.regularSellPrice) : 0;
          let costPrice = buyingCost - buyDown;
          let profit = sellingPrice - costPrice;
          let profitPercentage = (profit / costPrice) * 100;
          return profitPercentage.toFixed(2);
        },
      },
      { headerName: 'Margin', field: 'profitMargin', minWidth: 85, width: 85, editable: false, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Markup', field: 'markup', width: 75, editable: false, cellRenderer: (params) => {
          const regularSellPrice = params.data.regularSellPrice;
          const inventoryValuePrice = params.data.invoiceValuePrice;
          let markup = (Number(regularSellPrice) - Number(inventoryValuePrice)) / Number(inventoryValuePrice);
          return params.data.markup = markup.toFixed(2);
        }
      },
      {
        headerName: 'Buying Case Qty', field: 'buyingCaseQuantity', width: 80, editable: true, headerClass: 'header-text-wrap'
        , cellEditor: 'fourDigitEditor', cellRenderer: (params) => {
          if ((Number(params.value) > 0 || Number(params.value) < 0) && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (params.value * params.data.casePrice).toFixed(2);
          }
          return params.value;
        }
      },
      {
        headerName: 'Buying Unit Qty', field: 'buyingUnitQuantity', width: 80, editable: true,
        cellEditor: 'fourDigitEditor', headerClass: 'header-text-wrap'
        , cellRenderer: (params) => {
          if ((Number(params.value) > 0 || Number(params.value) < 0) && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (params.value * params.data.invoiceValuePrice).toFixed(2);
          }
          return params.value;
        }
      },
      {
        headerName: 'Case Cost', field: 'casePrice', width: 75, editable: false,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Total Cost', field: 'itemCost', width: 75, editable: true,
        cellEditor: 'numericEditor', cellRenderer: (params) => {
          const totalCost = params.data.itemCost;
          const buyingCaseQuantity = params.data.buyingCaseQuantity;
          const buyingUnitQuantity = params.data.buyingUnitQuantity;
          if (Number(buyingCaseQuantity) === 0 &&
            (Number(buyingUnitQuantity) >= 0
              || Number(buyingUnitQuantity) < 0)) {
            let inventoryValuePrice = Number(totalCost) / Number(buyingUnitQuantity);
            if (!isNumber(inventoryValuePrice)) { inventoryValuePrice = 0; }
            params.data.invoiceValuePrice = inventoryValuePrice.toFixed(2);
            let dos = (Number(inventoryValuePrice) * Number(params.data.unitsInCase));
            if (!isNumber(dos)) { dos = 0; }
            params.data.casePrice = dos.toFixed(2);
          }
          if ((Number(buyingCaseQuantity) >= 0 ||
            Number(buyingCaseQuantity) < 0) &&
            Number(buyingUnitQuantity) === 0) {
            let caseCost = Number(totalCost) / Number(buyingCaseQuantity);
            if (!isNumber(caseCost)) { caseCost = 0; }
            params.data.casePrice = caseCost.toFixed(2);
            const unitsInCase = params.data.unitsInCase;
            if (Number(caseCost) > 0) {
              let invoiceValuePrice = caseCost / unitsInCase;
              if (!isNumber(invoiceValuePrice)) { invoiceValuePrice = 0; }
              params.data.invoiceValuePrice = Number(invoiceValuePrice.toFixed(2));
            }

          }
          this.calculateMargin(params);
          //  params.value = params.data.itemCost = params.value.toFixed(2);
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },

      {
        headerName: '', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 80,
        cellRendererParams: { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false, showExtraSave: true },
      }
    ];
  }

  lotteryGameGridCol() {
    return [
      // {
      //   headerName: '', field: 'department', width: 55, checkboxSelection: true,
      //   suppressMenu: true,
      //   suppressSorting: true,
      // },
      { headerName: 'State Code', field: 'lotteryStateCode', width: 80 },
      { headerName: 'Game Number', field: 'gameNo', width: 80 },
      { headerName: 'Game Name', field: 'gameName', width: 150, editable: true },
      { headerName: 'UPC', field: 'lotteryPOSCode', width: 80, editable: true },
      { headerName: 'Ticket Qty', field: 'noOfTickets', width: 70, editable: true },
      {
        headerName: 'Ticket Value$', field: 'ticketSellingPrice', width: 80, editable: true,
        cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Book Value$', field: 'lotteryPackValue', width: 80, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Status', field: 'isActive', width: 60, editable: true, cellEditor: 'checkboxCellEditor',
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.isActive)
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer',
        colId: 'params', width: 80, suppressSorting: false,
        cellRendererParams: { hideEditAction: true, isSaveRequired: true, hideDeleteAction: false },
      },
    ];
  }

  addInvoicesDetailsGridColNonEditable() {
    return [
      // {
      //   headerName: '', field: 'checkBox', width: 50, checkboxSelection: true,
      //   suppressMenu: true, suppressSorting: true,
      //   headerCheckboxSelection: true,
      // },
      { headerName: 'Sr No', field: 'sequenceNumber', width: 70, editable: false },
      { headerName: 'UPC Code', field: 'posCodeWithCheckDigit', width: 100 },
      { headerName: 'Vendor Code', field: 'vendorItemCode', width: 60, editable: false, headerClass: 'header-text-wrap' },
      { headerName: 'Description', field: 'description', width: 130, editable: false },
      { headerName: 'Department', field: 'departmentDescription', width: 90 },
      {
        headerName: 'Unit Case', field: 'unitsInCase', width: 60,
        cellEditor: 'fourDigitEditor', editable: false, headerClass: 'header-text-wrap'
        , cellRenderer: (params) => {
          const value = params.value ? params.value : 0;
          params.data.casePrice = Number(value) * Number(params.data.invoiceValuePrice);
          if ((Number(params.data.buyingCaseQuantity) > 0 || Number(params.data.buyingCaseQuantity) < 0)
            && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingCaseQuantity) * Number(params.data.casePrice)).toFixed(2);
          }
          if ((Number(params.data.buyingUnitQuantity) > 0 || Number(params.data.buyingUnitQuantity) < 0)
            && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingUnitQuantity) * Number(params.data.invoiceValuePrice)).toFixed(2);
          }
          return Number(params.value);
        }
      },
      {
        headerName: 'Buying Cost', field: 'invoiceValuePrice', width: 75, editable: false, headerClass: 'header-text-wrap',
        cellEditor: 'decimalEditor', cellRenderer: (params) => {
          let arrow = '';
          if (Number(params.data.previousCostPrice) < Number(params.value)) {
            arrow = '<i class="fa fa-arrow-up" style="color:red" aria-hidden="true"></i>';
          } else {
            arrow = '<i class="fa fa-arrow-down" style="color:green" aria-hidden="true"></i>';
          }
          const value = params.value ? params.value : 0;
          params.data.casePrice = Number(value) * Number(params.data.unitsInCase);
          if ((Number(params.data.buyingCaseQuantity) > 0 || Number(params.data.buyingCaseQuantity) < 0)
            && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingCaseQuantity) * Number(params.data.casePrice)).toFixed(2);
          }
          if ((Number(params.data.buyingUnitQuantity) > 0 || Number(params.data.buyingUnitQuantity) < 0)
            && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (Number(params.data.buyingUnitQuantity) * Number(value)).toFixed(2);
          }
          this.calculateMargin(params);
          return value === 0 ? 0.000 + '&nbsp;' + arrow : this.utilityService.formatDecimalCurrencyThreePrecision(value) + '&nbsp;' + arrow;
        }
      },
      { headerName: 'Buy Down', field: 'buyDown', width: 60, headerClass: 'header-text-wrap' },
      {
        headerName: 'Selling', field: 'regularSellPrice', width: 75, editable: false
        , cellEditor: 'decimalEditor', cellRenderer: (params) => {
          // storeLocItemPrice
          let arrow = '';
          if (Number(params.data.storeLocItemPrice) < Number(params.value)) {
            arrow = '<i class="fa fa-arrow-up" style="color:red" aria-hidden="true"></i>';
          } else {
            arrow = '<i class="fa fa-arrow-down" style="color:green" aria-hidden="true"></i>';
          }
          const value = params.value ? params.value : 0;
          this.calculateMargin(params);
          return value === 0 ? 0.00 + '&nbsp;' + arrow : this.utilityService.formatDecimalCurrency(value) + '&nbsp;' + arrow;
        },
      },
      {
        headerName: 'Profit %', field: 'regularSellPrice', minWidth: 85, width: 85,
        cellRenderer: (params) => {
          let buyingCost = params.data.invoiceValuePrice ? Number(params.data.invoiceValuePrice) : 0;
          let buyDown = params.data.buyDown ? Number(params.data.buyDown) : 0;
          let sellingPrice = params.data.regularSellPrice ? Number(params.data.regularSellPrice) : 0;
          let costPrice = buyingCost - buyDown;
          let profit = sellingPrice - costPrice;
          let profitPercentage = (profit / costPrice) * 100;
          return profitPercentage.toFixed(2);
        },
      },
      { headerName: 'Margin', field: 'profitMargin', width: 75, editable: false, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center' },
      {
        headerName: 'Markup', field: 'markup', width: 75, editable: false, cellRenderer: (params) => {
          const regularSellPrice = params.data.regularSellPrice;
          const inventoryValuePrice = params.data.invoiceValuePrice;
          let markup = (Number(regularSellPrice) - Number(inventoryValuePrice)) / Number(inventoryValuePrice);
          return params.data.markup = markup.toFixed(2);
        }
      },
      {
        headerName: 'Buying Case Qty', field: 'buyingCaseQuantity', width: 80, editable: false, headerClass: 'header-text-wrap'
        , cellEditor: 'fourDigitEditor', cellRenderer: (params) => {
          if ((Number(params.value) > 0 || Number(params.value) < 0) && Number(params.data.buyingUnitQuantity) === 0) {
            params.data.itemCost = (params.value * params.data.casePrice).toFixed(2);
          }
          return params.value;
        }
      },
      {
        headerName: 'Buying Unit Qty', field: 'buyingUnitQuantity', width: 80, editable: false,
        cellEditor: 'fourDigitEditor', headerClass: 'header-text-wrap'
        , cellRenderer: (params) => {
          if ((Number(params.value) > 0 || Number(params.value) < 0) && Number(params.data.buyingCaseQuantity) === 0) {
            params.data.itemCost = (params.value * params.data.invoiceValuePrice).toFixed(2);
          }
          return params.value;
        }
      },
      {
        headerName: 'Case Cost', field: 'casePrice', width: 75, editable: false,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Total Cost', field: 'itemCost', width: 75, editable: false,
        cellEditor: 'numericEditor', cellRenderer: (params) => {
          const totalCost = params.data.itemCost;
          const buyingCaseQuantity = params.data.buyingCaseQuantity;
          const buyingUnitQuantity = params.data.buyingUnitQuantity;
          if (Number(buyingCaseQuantity) === 0 &&
            (Number(buyingUnitQuantity) >= 0
              || Number(buyingUnitQuantity) < 0)) {
            let inventoryValuePrice = Number(totalCost) / Number(buyingUnitQuantity);
            if (!isNumber(inventoryValuePrice)) { inventoryValuePrice = 0; }
            params.data.invoiceValuePrice = inventoryValuePrice.toFixed(2);
            let dos = (Number(inventoryValuePrice) * Number(params.data.unitsInCase));
            if (!isNumber(dos)) { dos = 0; }
            params.data.casePrice = dos.toFixed(2);
          }
          if ((Number(buyingCaseQuantity) >= 0 ||
            Number(buyingCaseQuantity) < 0) &&
            Number(buyingUnitQuantity) === 0) {
            let caseCost = Number(totalCost) / Number(buyingCaseQuantity);
            if (!isNumber(caseCost)) { caseCost = 0; }
            params.data.casePrice = caseCost.toFixed(2);
            const unitsInCase = params.data.unitsInCase;
            if (Number(caseCost) > 0) {
              let invoiceValuePrice = caseCost / unitsInCase;
              if (!isNumber(invoiceValuePrice)) { invoiceValuePrice = 0; }
              params.data.invoiceValuePrice = Number(invoiceValuePrice.toFixed(2));
            }

          }
          this.calculateMargin(params);
          //  params.value = params.data.itemCost = params.value.toFixed(2);
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },

      {
        headerName: '', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 80,
        cellRendererParams: { hideEditAction: true, isSaveRequired: false, hideDeleteAction: true },
      }
    ];
  }
  calculateMargin(params) {
    if (this.commonService.isMarkup) {
      const regularSellPrice = params.data.regularSellPrice;
      const inventoryValuePrice = params.data.invoiceValuePrice;
      const buyDown = params.data.buyDown ? params.data.buyDown : 0;
      // (Selling - Buying)/Buying*100
      const finalBu = (Number(inventoryValuePrice) - Number(buyDown));
      // const x = Number(regularSellPrice) - (Number(inventoryValuePrice) - Number(buyDown));
      let z = (regularSellPrice - finalBu) / finalBu * 100;
      if (!isNumber(z)) { z = 0; }
      return params.data.profitMargin = z.toFixed(2);
    } else {
      const regularSellPrice = params.data.regularSellPrice;
      const inventoryValuePrice = params.data.invoiceValuePrice;
      const buyDown = params.data.buyDown ? params.data.buyDown : 0;
      const x = Number(regularSellPrice) - (Number(inventoryValuePrice) - Number(buyDown));
      // let z = (Number(regularSellPrice) - Number(inventoryValuePrice) / Number(inventoryValuePrice) * 100);
      let z = (x * 100) / regularSellPrice;
      if (!isNumber(z)) { z = 0; }
      return params.data.profitMargin = z.toFixed(3);
    }
    //   this.invoiceDetailsForm.get('profitMargin').setValue(Number(z.toFixed(2)));
  }
  salesTaxGridCol() {
    return [
      { headerName: 'Tax Name', field: 'taxStrategyDescription', editable: true, suppressSorting: false, },
      {
        headerName: 'POS Tax', field: 'posTaxStrategyID', editable: true, suppressSorting: false,
        cellEditor: 'numericEditor'
      },
      {
        headerName: 'City Tax', field: 'cityTax', editable: true, suppressSorting: false,
        cellEditor: 'numericEditor',
        cellRenderer: (params) => {
          params.value = params.value ? params.value : 0;
          return this.utilityService.formatpercentage(params.value);
        }
      },
      {
        headerName: 'County Tax', field: 'countyTax', editable: true, suppressSorting: false,
        cellEditor: 'numericEditor', cellRenderer: (params) => {
          params.value = params.value ? params.value : 0;
          return this.utilityService.formatpercentage(params.value);
        }
      },
      {
        headerName: 'State Tax', field: 'stateTax', editable: true, suppressSorting: false,
        cellEditor: 'numericEditor', cellRenderer: (params) => {
          params.value = params.value ? params.value : 0;
          return this.utilityService.formatpercentage(params.value);
        }
      },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', colId: 'params', suppressSorting: false,
        cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
      },

    ];
  }

  fuelTaxGridCol() {
    return [
      { headerName: 'Fuel Tax Description', field: 'fuelTaxDescription', editable: true },
      {
        headerName: 'Fuel Tax Rate', field: 'fuelTaxRate', editable: true, cellRenderer: (params) => {
          return this.utilityService.formatCurrency(params.value);
        },
        cellEditor: 'sixDecimalNumericEditor'
      },
      /*  {
         headerName: 'State Tax', field: 'stateTax', editable: true, cellRenderer: (params) => {
           return this.utilityService.formatDecimalCurrencyFuel(params.value);
         }
       }, */
      // { headerName: 'Tax Calculation Method', editable: true, field: '' },
      {
        headerName: 'Tax to all Fuel Grade', field: 'isApplyPrice', cellRenderer: 'CheckboxCellRenderer',
      },

      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 110, cellRendererParams: {
          hideEditAction: false, isSaveRequired: true, hideDeleteAction: false
        },
      }
    ];
  }
  salesRestrictionGridCol() {
    return [
      {
        headerName: 'POS Sales Restrict ID', field: 'posSalesRestrictID',
        cellEditor: 'numericEditor', width: 190, editable: true, headerClass: 'header-text-wrap'
      },
      { headerName: 'POS Sales Restrict Name', field: 'salesRestrictionDescription', editable: true, headerClass: 'header-text-wrap', },
      {
        headerName: 'Min Customer Age', field: 'minimumCustomerAge', editable: true, width: 200, headerClass: 'header-text-wrap'
        , cellEditor: 'numericEditor'
      },
      {
        headerName: 'Min Clerk Age', field: 'minimumClerkAge', editable: true, cellEditor: 'numericEditor'
        , headerClass: 'header-text-wrap'
      },
      {
        headerName: 'Transaction Limit $', field: 'transactionLimit', headerClass: 'header-text-wrap', cellEditor: 'numericEditor',
        width: 160, editable: true, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Sales Restrict', field: 'salesRestrictFlag', width: 190, cellRenderer: 'CheckboxCellRenderer',
      },
      {
        headerName: 'Prohibit Discount', field: 'prohibitDiscountFlag', width: 160, headerClass: 'header-text-wrap',
        cellRenderer: 'CheckboxCellRenderer',
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 150, cellRendererParams: { hideEditAction: false, isSaveRequired: true, hideDeleteAction: false },
      }
    ];
  }
  storeFeesGridCol() {
    return [
      { headerName: 'Fees Name', field: 'feeDescription', width: 150, editable: true },
      { headerName: 'POS Fee ID', field: 'posFeeID', width: 150, cellEditor: 'numericEditor', editable: true },
      {
        headerName: 'POS Fee', field: 'posFee', width: 150, editable: true
        , cellEditor: 'numericEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'POS Amount Range', field: 'posAmountRange'
        , cellEditor: 'numericEditor', editable: true, width: 200, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Is Refundable', field: 'isRefundable', width: 150, cellRenderer: 'CheckboxCellRenderer'
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 110, cellRendererParams: { hideEditAction: false, isSaveRequired: true, hideDeleteAction: false },
      }
    ];
  }
  paymentMethodGridCol() {
    return [
      { headerName: 'Store MOPNo', field: 'storeMOPNo', cellEditor: 'numericEditor', width: 300, editable: true },
      { headerName: 'MOP Name', field: 'mopName', width: 300, editable: true },
      { headerName: 'System MOP', field: 'isSystemMOP', cellRenderer: 'CheckboxCellRenderer' },
      {
        headerName: 'Action', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer',
        width: 110, cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
      }
    ];
  }
  // masterBrandGridCol() {
  //   return [
  //     // { headerName: 'Manufacturer', field: 'manufacturerName', editable: true, width: 230, },
  //     {
  //       headerName: 'Manufacturer', field: 'manufacturerName', editable: true, cellEditor: 'agSelectCellEditor',
  //       cellEditorParams: (params) => {
  //         const allowed = this.GetDropDownManufacturer();
  //         return { values: allowed, };
  //       }
  //     },
  //     { headerName: 'Brand Name', field: 'brandName', editable: true, width: 250 },
  //     {
  //       headerName: 'Action', field: 'action', colId: 'params', width: 80, cellRenderer: 'CellActionRenderer',
  //       cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
  //     }
  //   ];
  // }
  GetDropDownManufacturer() {
    const array = this.commonService.manufacturerList;
    const finalArray = [''];
    if (array) {
      array.forEach(x => {
        const contct = x.manufacturerName; //  x.companyPriceGroupID + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  privilageGridCol() {
    return [
      { headerName: 'Privilege Title', field: 'normaliseName', editable: false },
      {
        headerName: 'Action', field: 'action', colId: 'params', width: 80, cellRenderer: 'CellActionRenderer',
        cellRendererParams: { hideEditAction: true, isSaveRequired: false, hideDeleteAction: false },
      }
    ];
  }
  // houseAccountGridCol(): any {
  //   return [
  //     { headerName: 'Account Code', field: 'accountCode', width: 130, editable: true, },
  //     { headerName: 'Account Name', field: 'accountName', width: 135, editable: true, },
  //     {
  //       headerName: 'Payment Terms', field: 'paymentTerms', width: 130, editable: true, cellEditor: 'agSelectCellEditor',
  //       headerClass: 'header-text-wrap', cellEditorParams: (params) => {
  //         const allowed = this.getDropDownPaymentTerms();
  //         return { values: allowed, };
  //       }
  //     },
  //     {
  //       headerName: 'Credit Limit', field: 'creditLimit', width: 120, editable: true,
  //       cellEditor: 'numericEditor', cellRenderer: (params) => {
  //         return this.utilityService.formatDecimalCurrency(params.value);
  //       }
  //     },
  //     { headerName: 'Fed ID', field: 'fedID', width: 100, editable: true, },
  //     { headerName: 'Contact Name', field: 'name', width: 100, editable: true, headerClass: 'header-text-wrap', },
  //     {
  //       headerName: 'Phone No', field: 'phoneNo', width: 150, editable: true,
  //       cellRenderer: (params) => {
  //         return this.utilityService.formatPhoneNumber(params.value);
  //       }
  //     },
  //     { headerName: 'Email', field: 'email', width: 150, editable: true, },
  //     { headerName: 'Address', field: 'address', width: 100, editable: true, },
  //     { headerName: 'City', field: 'city', width: 100, editable: true, },
  //     {
  //       headerName: 'State', field: 'stateName', width: 100, editable: true, cellEditor: 'agSelectCellEditor',
  //       cellEditorParams: (params) => {
  //         const allowed = this.getDropDownStateList();
  //         return { values: allowed, };
  //       }
  //     },
  //     { headerName: 'Zip Code', field: 'zipCode', width: 100, editable: true, cellEditor: 'numericEditor' },
  //     {
  //       headerName: 'Action', field: 'action', colId: 'params', width: 80, cellRenderer: 'CellActionRenderer', pinned: 'right',
  //       cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: false },
  //     }
  //   ];
  // }


  getDropDownPaymentTerms() {
    const paymentTemsList = [
      { value: 'One Week', name: 'One Week' },
      { value: 'Two Week', name: 'Two Week' },
      { value: 'Tree Week', name: 'Tree Week' },
      { value: 'One Month', name: 'One Month' }
    ];
    const array = paymentTemsList;
    const finalArray = [''];
    if (array) {
      array.forEach(x => {
        const contct = x.value;
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  getDropDownStateList() {
    const array = this.commonService.stateList;
    const finalArray = [''];
    if (array) {
      array.forEach(x => {
        const contct = x.stateName; //  x.stateCode + ',' +
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  lotteryInventoryGridCol() {
    return [
      { headerName: 'Bin/Slot', field: 'binNo', width: 120, },
      { headerName: 'Game No', field: 'gameNo', width: 130, },
      { headerName: 'Game', field: 'gameName', width: 150, },
      { headerName: 'Pack No', field: 'packNumber', width: 100, headerClass: 'header-text-wrap' },
      {
        headerName: 'Pack Value', field: 'packValue', width: 100, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Ticket Value', field: 'ticketValue', width: 105, headerClass: 'header-text-wrap',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Activation Date', field: 'activationDateTime', headerClass: 'header-text-wrap'
        , width: 140, cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      { headerName: 'Opening Ticket No', field: 'openingTicketNo', width: 140, headerClass: 'header-text-wrap' },
      {
        headerName: 'End Ticket No', field: 'ticketNo', width: 110, headerClass: 'header-text-wrap'
        , editable: true,
      },
      // {
      //   headerName: 'End Ticket No', field: 'currentTicketNo', width: 110, headerClass: 'header-text-wrap'
      //   , editable: true,
      // },
      {
        headerName: 'All Sold', field: 'isSold', width: 90, cellRenderer: 'CheckboxCellRenderer', headerClass: 'header-text-wrap'
        // cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data.allSold),
      },
      { headerName: 'Aging', field: 'aging', width: 110, headerClass: 'header-text-wrap' },
      { headerName: 'Total Qty Sold', field: 'totalQtySold', width: 110, headerClass: 'header-text-wrap' },
      {
        headerName: 'Amount', field: 'amount', width: 130,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      // {
      //   headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer',
      //   colId: 'params', width: 100, suppressSorting: false, pinned: 'right'
      // },
    ];
  }
  nonEditableCheckBoxCellRenderer = (isChecked: boolean) => {
    if (isChecked) {
      return '<div class="text-center"><i style="font-size: 18px;color: green;" class="fa fa-check-circle" aria-hidden="true"></i></div>';
    } else {
      return '<div class="text-center"><i style="font-size: 18px;" class="fa fa-times-circle" aria-hidden="true"></i></div>';
    }
  }
  dayReconMOPGridCol() {
    return [
      {
        headerName: 'MOP Name', field: 'mopName', editable: true,
        cellEditor: 'agSelectCellEditor', minWidth: 75,
        cellEditorParams: (params) => {
          const allowed = this.getDropDownMOP();
          return { values: allowed, };
        },
      },
      {
        headerName: 'Count', field: 'mopCount', editable: true, cellEditor: 'onlyNumericEditor', maxWidth: 60,
        cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'Amount', field: 'mopAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: '', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', maxWidth: 60,
        cellRendererParams: {
          hideEditAction: false, isSaveRequired: false, hideDeleteAction: false, isDayReconMOPChecked: true
        },
      }
    ];
  }
  atmGridCol() {
    return [
      { headerName: 'S.No', field: 'RowNumber', width: 80, maxWidth: 80 },
      {
        headerName: 'Begin Amount', minWidth: 100, maxWidth: 180, field: 'BeginAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'Loaded Amount', minWidth: 130, maxWidth: 180, field: 'InputAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'Dispensed Amount', minWidth: 130, maxWidth: 180, field: 'DispensedAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          if (!params.data.InputAmount && params.data.DispensedAmount) {
            this.toastr.warning("Please fill first Load Amount");
            this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
          }
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'End Amount', minWidth: 100, maxWidth: 180, field: 'EndAmount', editable: false, cellEditor: 'numericEditor', cellRenderer: (params) => {
          let endAmount = parseFloat((params.data.BeginAmount === "" || params.data.BeginAmount === undefined) ? 0.0 : params.data.BeginAmount)
            + parseFloat((params.data.InputAmount === "" || params.data.InputAmount === undefined) ? 0.0 : params.data.InputAmount)
            - parseFloat((params.data.DispensedAmount === "" || params.data.DispensedAmount === undefined) ? 0.0 : params.data.DispensedAmount);
          if (endAmount < 0) {
            this.toastr.warning("Please enter the amount less than the total of the " + this.utilityService.formatDecimalCurrencyWithCommaSeparated(parseFloat(params.data.BeginAmount) + parseFloat(params.data.InputAmount)));
            return;
          }
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(endAmount);
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: '# Tranx', minWidth: 100, maxWidth: 180, field: 'NoOfTransactions', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return params.value;
        },
        cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-center'
      },
      {
        headerName: 'Actions', minWidth: 100, maxWidth: 190, field: 'action', colId: 'params', cellRenderer: 'ATMActionRenderer',
        cellRendererParams: {
          hideEditAction: false, isSaveRequired: false, hideDeleteAction: false, isAtmGrid: true, gridtype: 'atmGrid',
        },
      }
    ];
  }
  bankGridCol() {
    return [];
  }
  getDropDownMOP() {
    const array = this.commonService.mopDetailList;
    const finalArray = [''];
    if (array) {
      array.forEach(x => {
        const contct = x.mopName;
        finalArray.push(contct);
      });
    }
    return finalArray;
  }
  bankDepositGridCol() {
    return [
      { headerName: '', field: 'name', },
      {
        headerName: 'POS', field: 'posAtHandAmount', headerClass: 'header-text-wrap', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'At Hand', field: 'atHandAmount', headerClass: 'header-text-wrap',
        editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      // {
      //   headerName: '', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 90,
      //   cellRendererParams: { hideEditAction: false, isSaveRequired: false, hideDeleteAction: true, },
      // }
    ];
  }
  userPrivilegeGridCol() {
    return [
      { headerName: 'Privilege Name', field: 'normaliseName' },
      {
        headerName: 'Permission', field: 'isChecked', cellRenderer: 'CheckboxCellRenderer',
      }
    ];
  }

  billOfLandingsGridCol() {
    return [
      { headerName: 'Fuel Grade Name', field: 'storeFuelGradeName' },
      { headerName: 'Quantity', field: 'quantityReceived' },
      {
        headerName: 'Unit Cost Price', field: 'unitCostPrice', editable: true,
        cellRenderer: (params) => {
          return this.utilityService.formatSevenDecimalCurrency(params.value);
        }
      },
      {
        headerName: 'Amount',
        valueGetter: function (params) {
          let amount = 0
          if (!isNaN(params.data.unitCostPrice) && !isNullOrUndefined(params.data.unitCostPrice) && !isNaN(params.data.quantityReceived) && !isNullOrUndefined((params.data.quantityReceived))) {
            amount = params.data.unitCostPrice * params.data.quantityReceived;
          }
          params.data["totalAmount"] = amount;
          return amount;
        },
        editable: false,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
    ];
  }

  calculateAmount(unitCostPrice: number, quantities: number[]) {
    let amount = 0;
    const costPrice = unitCostPrice ? (Number(unitCostPrice)) : 0;
    quantities.forEach(qty => {
      if (qty !== 0) {
        amount = costPrice * qty;
      }
    });
    return amount;
  }
  getTimeOffGetGrid(): any {
    return [
      { headerName: 'Reason', field: 'reason' },
      {
        headerName: 'StartDate', field: 'startDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'EndDate', field: 'endDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'TotalHours', field: 'totalHours' },
      { headerName: 'Status', field: 'status', cellRenderer: (params: any) => params.value === 0 ? 'Pending' : params.value === 1 ? 'Approve' : 'Reject', width: 80 },
      { headerName: 'PaidHours', field: 'paidHours' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', headerClass: 'header-text-wrap',
        cellRendererParams: (params) => {
          return { hideDeleteAction: false, hidePrintAction: true };
        },
        pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ]
  }

  getTimeOffGetGridByRole(): any {
    return [
      { headerName: 'Reason', field: 'reason' },
      { headerName: 'Employee Name', field: 'employeeName' },
      {
        headerName: 'StartDate', field: 'startDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      {
        headerName: 'EndDate', field: 'endDate', cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      { headerName: 'TotalHours', field: 'totalHours' },
      { headerName: 'Status', field: 'status', cellRenderer: (params: any) => params.value === 0 ? 'Pending' : params.value === 1 ? 'Approve' : 'Reject', width: 80 },
      { headerName: 'PaidHours', field: 'paidHours' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', headerClass: 'header-text-wrap',
        cellRendererParams: (params) => {
          return { hideEditAction: true, hideDeleteAction: true, hidePrintAction: true };
        },
        pinned: 'right', colId: 'params', width: 100, suppressSorting: false
      }
    ]
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
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', headerClass: 'header-text-wrap',
        cellRendererParams: (params) => {
          return { hideEditAction: true, hideDeleteAction: true, hidePrintAction: true };
        },
      }
    ];
  }

  tankVolumeHistoryGridCol() {
    return [
      { headerName: 'Tank No', field: 'storeTankNo', editable: false, headerClass: 'header-text-wrap', width: 90, cellEditorFramework: NumericEditor },
      { headerName: 'Tank Description', field: 'tankName', width: 150, headerClass: 'header-text-wrap', editable: false },
      // { headerName: 'Fuel Grade', field: 'fuelGradeName' },
      {
        headerName: 'Current Volume (GALS)', field: 'currentTankVolume', width: 120, headerClass: 'header-text-wrap', editable: true, cellEditorFramework: DecimalEditor,
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.tankVolumeHistoryGrid
          }
        },
      },
      {
        headerName: 'ULLAGE (GALS)', field: 'tankUllage', width: 120, headerClass: 'header-text-wrap', editable: false, cellEditorFramework: DecimalEditor, cellRenderer: (params) => {
          if (params.data.currentTankVolume)
            return Number(params.data.tankVolume) - Number(params.data.currentTankVolume);
          else return 0;
        }
      },
      {
        headerName: '90% ULLAGE (GALS)', field: 'tankUllage90', width: 120, headerClass: 'header-text-wrap', editable: false, cellEditorFramework: DecimalEditor, cellRenderer: (params) => {
          if (params.data.currentTankVolume) {
            let ullage = (((Number(params.data.tankVolume) - Number(params.data.currentTankVolume)) / 100) * 90) - Number(params.data.currentTankVolume);
            return ullage < 0 ? -(ullage.toFixed(2)) : ullage.toFixed(2);
          } else return 0;
        }
      },
      { headerName: 'TC Volume (GALS)', field: 'tcVolume', width: 120, headerClass: 'header-text-wrap', editable: true, cellEditorFramework: DecimalEditor },
      { headerName: 'Height (inch)', field: 'height', width: 100, editable: true, headerClass: 'header-text-wrap', cellEditorFramework: NumericEditor },
      { headerName: 'Water Volume (GALS)', field: 'waterVolume', width: 140, headerClass: 'header-text-wrap', editable: true, cellEditorFramework: NumericEditor },
      { headerName: 'Water Level (inch)', field: 'waterLevel', width: 110, headerClass: 'header-text-wrap', editable: true, cellEditorFramework: NumericEditor },
      {
        headerComponentParams: {
          template:
            '<div style="padding-top: 4px;" ><span style="padding-top: 2px;">Temparature (&#8457;)</span></div>'
        }, field: 'temparature', width: 160, headerClass: 'header-text-wrap', editable: true, cellEditorFramework: DecimalEditor
      },
      { headerName: 'Deliverd By', field: 'deliveredBy', width: 120, headerClass: 'header-text-wrap' },
      { headerName: 'Reading Date Time', field: 'readingAsOfDateTime', width: 250, headerClass: 'header-text-wrap', editable: false, cellEditorFramework: DateTimeEditorRenderer },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellActionRenderer', headerClass: 'header-text-wrap',
        cellRendererParams: (params) => {
          if (params.data.storeTankVolumeHistoryID && params.data.storeTankVolumeHistoryID != 0) {
            return { hideEditAction: true, hideDeleteAction: false, hidePrintAction: true };
          } else {
            return { hideEditAction: true, hideDeleteAction: true, hidePrintAction: true };
          }
        },
        pinned: 'right', colId: 'params', width: 130, suppressSorting: false
      }
    ];
  }

  // getFuelTaxList() {
  //   const array = this.commonService.fuelTaxList;
  //   const finalArray = [];
  //   if (array) {
  //     array.forEach(x => {
  //       const contct = x.text; //  x.companyPriceGroupID + ',' +
  //       finalArray.push(contct);
  //     });
  //   }
  //   return finalArray;
  // }
}
