import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';
import { UtilityService } from '../utility/utility.service';
import { SaveButtonComponent } from '@shared/component/expandable-grid/partials/save-button.component';
import { SaveButtonParentComponent } from '@shared/component/expandable-grid/partials/save-button-parent.component';
import * as moment from 'moment';
import { CommonService } from '../commmon/common.service';
import { isNullOrUndefined } from 'util';
import { NumericEditor } from '@shared/component/editable-grid/partials/numeric-editor.component';

@Injectable()
export class PaginationGridService {

  constructor(private constantService: ConstantService, private utilityService: UtilityService, private commonService: CommonService) { }

  /**
  * To fecth grid configuration
  * @param gridType - grid type required
  */
  getGridOption(gridType) {
    const gridOptions = {
      columnDefs: null,
      RowSelection: 'single',
      pagination: false,
      paginationPageSize: 10,
      headerHeight: 41,
      isSuppressMenu: false,
      isSideBarRequired: false,
      suppressRowClickSelection: true,
      overlayLoadingTemplate: true,
      suppressCellSelection: false,
      rowDeselection: false,
      gridType: gridType,
      fullRowEditabeRequired: true,
      SingleClickEdit: false,
      rowModelType: 'clientSide',
      editType: 'fullRow',
      childGridType: '',
      detailRowHeight: null,
      enableSorting: false,
      rowHeight: 30,
      rowMultiSelectWithClick: false,
      groupSelectsChildren: false,
      groupUseEntireRow: false,
      groupDefaultExpanded: null,
      masterDetail: true,
      groupRowRendererParams: '',
      suppressClickEdit: true
    };
    let defaultSetting = this.constantService.defaultSetting[gridType];
    // defaultSetting = defaultSetting ? defaultSetting : this.constantService.defaultSetting['DEFAULT'];
    gridOptions.columnDefs = this.getColumnDef(gridType);
    gridOptions.RowSelection = defaultSetting.rowSelection ? defaultSetting.rowSelection : gridOptions.RowSelection;
    gridOptions.pagination = defaultSetting.pagination ? defaultSetting.pagination : gridOptions.pagination;
    gridOptions.paginationPageSize = defaultSetting.paginationPageSize ? defaultSetting.paginationPageSize : gridOptions.paginationPageSize;
    gridOptions.headerHeight = defaultSetting.headerHeight ? defaultSetting.headerHeight : gridOptions.headerHeight;
    gridOptions.isSuppressMenu = defaultSetting.isSuppressMenu ? defaultSetting.isSuppressMenu : false;
    gridOptions.suppressRowClickSelection = (defaultSetting.suppressRowClickSelection === true || defaultSetting.suppressRowClickSelection === false) ? defaultSetting.suppressRowClickSelection : gridOptions.suppressRowClickSelection;
    gridOptions.overlayLoadingTemplate = defaultSetting.overlayLoadingTemplate ? false : true;
    gridOptions.suppressCellSelection = defaultSetting.suppressCellSelection ? defaultSetting.suppressCellSelection : false;
    gridOptions.rowDeselection = defaultSetting.rowDeselection ? defaultSetting.rowDeselection : gridOptions.rowDeselection;
    gridOptions.fullRowEditabeRequired = defaultSetting.fullRowEditabeRequired;
    gridOptions.SingleClickEdit = defaultSetting.singleClickEdit;
    gridOptions.rowModelType = defaultSetting.rowModelType ? defaultSetting.rowModelType : gridOptions.rowModelType;
    gridOptions.editType = "fullRow";
    gridOptions.childGridType = defaultSetting.childGridType ? defaultSetting.childGridType : '';
    gridOptions.detailRowHeight = defaultSetting.detailRowHeight ? defaultSetting.detailRowHeight : null;
    gridOptions.rowHeight = defaultSetting.rowHeight ? defaultSetting.rowHeight : 30;
    gridOptions.enableSorting = defaultSetting.enableSorting ? defaultSetting.enableSorting : false;
    gridOptions.rowMultiSelectWithClick = defaultSetting.rowMultiSelectWithClick ? defaultSetting.rowMultiSelectWithClick : false;
    gridOptions.groupUseEntireRow = defaultSetting.groupUseEntireRow
      ? defaultSetting.groupUseEntireRow
      : false;
    gridOptions.groupSelectsChildren = defaultSetting.groupSelectsChildren
      ? defaultSetting.groupSelectsChildren
      : gridOptions.groupSelectsChildren;
    (gridOptions.masterDetail = defaultSetting.hasOwnProperty('masterDetail')
      ? defaultSetting.masterDetail
      : gridOptions.masterDetail),
      (gridOptions.groupDefaultExpanded = defaultSetting.groupDefaultExpanded
        ? defaultSetting.groupDefaultExpanded
        : gridOptions.groupDefaultExpanded);
    gridOptions.groupRowRendererParams = defaultSetting.groupRowRendererParams
      ? defaultSetting.groupRowRendererParams
      : '';
    gridOptions.suppressClickEdit = defaultSetting.hasOwnProperty('suppressClickEdit')
      ? defaultSetting.suppressClickEdit
      : gridOptions.suppressClickEdit
    return gridOptions;
  }

  /**
   * To get column definations
   * @param gridType - grid name required to fetch specific column defintions
   */
  getColumnDef(gridType) {
    switch (gridType) {
      case this.constantService.gridTypes.pjrSearchGrid:
        return this.pjrSearchGridCol();
      case this.constantService.gridTypes.itemUPCDetailGrid:
        return this.itemUPCDetailGridCol();
      case this.constantService.gridTypes.companyPriceGroupNewGrid:
        return this.companyPriceGroupNewGridCol();
      case this.constantService.gridTypes.priceGrpNewItemDetailGrid:
        return this.priceGrpItemDetailGridCol();
      case this.constantService.gridTypes.priceGrpNewItemDetailGrid1:
        return this.priceGrpItemDetailGridCol1();
      case this.constantService.gridTypes.priceGrpNewItemDetailGrid2:
        return this.priceGrpItemDetailGridCol2();
      case this.constantService.gridTypes.itemListChildGrpGrid:
        return this.itemListChildGrpGridCol();
      case this.constantService.gridTypes.itemCatalogGrid:
        return this.itemCatalogGridCol();
      case this.constantService.gridTypes.itemCatalogStoreGrid:
        return this.itemCatalogStoreGridCol();
      case this.constantService.gridTypes.itemListOverlayGrpGrid:
        return this.itemListOverlayGrpGridCol();
      case this.constantService.gridTypes.storeMixMatchDetailGrid:
        return this.storeMixMatchDetailGridCol();
      case this.constantService.gridTypes.storeComboDealDetailGrid:
        return this.storeComboDealDetailGridCol();
      case this.constantService.gridTypes.itemDetailGrid:
        return this.itemDetailGridCol();
      case this.constantService.gridTypes.manageItemsGrid:
        return this.manageItemsGridCol();
      case this.constantService.gridTypes.manageItemsPricingGrid:
        return this.manageItemsPricingGridCol();
      case this.constantService.gridTypes.manageItemsPricingGridWithoutStore:
        return this.manageItemsPricingGridWithoutStoreCol();
      case this.constantService.gridTypes.manageItemsByPriceGrpGrid:
        return this.manageItemsByPriceGrpGridCol();
      case this.constantService.gridTypes.manageItemsByPriceGrpGridSingleStore:
        return this.manageItemsByPriceGrpGridSingleStoreCol();
      case this.constantService.gridTypes.itemByPriceGroupGrid:
        return this.itemByPriceGroupGridCol();
      case this.constantService.gridTypes.advmultipacksIGrid:
        return this.advmultipacksIGridCol();
      case this.constantService.gridTypes.linkedItemsGrid:
        return this.linkedItemsGridCol();
      case this.constantService.gridTypes.multiplierItemGrid:
        return this.multiplierItemGridCol();
      case this.constantService.gridTypes.priceGroupItemGrid:
        return this.priceGroupItemGridCol();
      case this.constantService.gridTypes.storeItemsGrid:
        return this.storeItemsGridCol();
      case this.constantService.gridTypes.editItemVendorGrid:
        return this.editItemVendorGridCol();
      case this.constantService.gridTypes.storeItemsGridCase:
        return this.storeItemsGridCaseCol();
      case this.constantService.gridTypes.scanDataConfig:
        return this.scanDataConfigCol();
      case this.constantService.gridTypes.scanDataAcknowledgment:
        return this.scanDataAcknowledgmentCol();
      case this.constantService.gridTypes.ismUpdate:
        return this.ismUpdateCol();
      case this.constantService.gridTypes.invoicesDetailsGrid:
        return this.invoicesDetailsGridCol();
      case this.constantService.gridTypes.buyDownGrid:
        return this.buyDownGridCol();
      case this.constantService.gridTypes.fuelInvoiceGrid:
        return this.fuelInvoiceGridCol();
      case this.constantService.gridTypes.fuelInvoiceGridWithoutStore:
        return this.fuelInvoiceGridCol(true);
      case this.constantService.gridTypes.buyDownStoreDetailsGrid:
        return this.buyDownStoreDetailsGrid();
      case this.constantService.gridTypes.priceGroupBuyDownGrid:
        return this.priceGroupBuyDownGrid();
      case this.constantService.gridTypes.editBillofLadingGrid:
        return this.editBillofLadingGridCol();
      case this.constantService.gridTypes.fuelTaxGrid:
        return this.fuelTaxGridCol();
      case this.constantService.gridTypes.masterPriceBookWizardGrid:
        return this.masterPriceBookWizardGrid();
      case this.constantService.gridTypes.priceGroupMasterAllItemGrid:
        return this.priceGroupMasterAllItemGrid();
      case this.constantService.gridTypes.invoiceDashboardGrid:
        return this.invoiceDashboardGridCol();
      case this.constantService.gridTypes.invoiceByStoreGrid:
        return this.invoiceByStoreGridCol();
      case this.constantService.gridTypes.invoiceByUserGrid:
        return this.invoiceByUserGridCol();
      case this.constantService.gridTypes.masterManufacturerGrid:
        return this.masterManufacturerGridCol();
      case this.constantService.gridTypes.masterBrandGrid:
        return this.masterBrandGridCol();
      case this.constantService.gridTypes.itemHistoryReportGrid:
        return this.itemHistoryReportGridCol();
      case this.constantService.gridTypes.itemHistoryByStoreGrid:
        return this.itemHistoryByStoreGridCol();
      case this.constantService.gridTypes.purchaseHistoryGrid:
        return this.purchaseHistoryGridCol();
      case this.constantService.gridTypes.purchaseHistoryCartonGrid:
        return this.purchaseHistoryCartonGridCol();
    }
  }

  pjrSearchGridCol() {
    return [
      {
        headerName: 'Date & Time', field: 'date ',
        cellRenderer: (params: any) => {
          if (params.data) {
            return this.dateFormatBySplit(params.data ? params.data.date : undefined) + " " +
              params.data.time + " " +
              this.eventCellRenderer(params);
          } else return "";
        }
      },
      {
        headerName: 'Net Amount', field: 'netAmt', width: 45, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellClass: 'text-right'
      }
      // { headerName: 'Time', field: 'time' },
      // {
      //   headerName: 'Event', field: 'event',
      //   cellRenderer: (params: any) => this.eventCellRenderer(params.data ? params.data.event : undefined)
      // },
    ];
  }

  itemUPCDetailGridCol() {
    return [
      {
        headerName: '', field: 'CompanyPriceGroupIDD', suppressSizeToFit: true, width: 45, maxWidth: 45, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true,
      },
      { headerName: 'UPC', field: 'UPC' },
      { headerName: 'Description', field: 'Desc', cellStyle: { 'font-weight': 'bold' } },
      { headerName: 'UOM', field: 'UOM', cellClass: 'text-center' },
      { headerName: 'Units In Case', field: 'ConversionFactor', cellStyle: { 'text-align': 'center' } },
    ];
  }

  eventCellRenderer = (params: any) => {
    let event = params.data ? params.data.event : undefined
    // let itemLine = params.data.events.TransactionDetailGroup ? Object.keys(Array.isArray(params.data.events.TransactionDetailGroup.TransactionLine) ? params.data.events.TransactionDetailGroup.TransactionLine[0] : params.data.events.TransactionDetailGroup.TransactionLine) : '';
    let itemLines = [];
    let itemLineData = params.data.events.TransactionDetailGroup ? params.data.events.TransactionDetailGroup.TransactionLine : [];
    for (let lines in itemLineData) {
      itemLines = itemLines.concat(Object.keys(itemLineData[lines]));
    }
    let eventRender = "";
    //events
    if (event === "VoidEvent") eventRender = '<span class="badge badge-red event-badge">Void Event</span>';
    else if (event === "SaleEvent") eventRender = '<span class="badge badge-primary bg-lightblue event-badge">Sale Event</span>';
    else if (event === "FinancialEvent") eventRender = '<span class="badge badge-success event-badge">Financial Event</span>';
    else eventRender = '<span class="badge badge-secondary event-badge">' + event + '</span>';
    //itemlines
    if (itemLines.includes("FuelLine")) eventRender += '<img src="assets/images/fuel.svg" class="itemlines-avatar" />';
    if (itemLines.includes("MerchandiseCodeLine")) eventRender += '<span class="badge badge-yellow event-badge">No Scan</span>';
    if (itemLines.includes("ItemLine")) eventRender += '<img src="assets/images/supermarket.svg" class="itemlines-avatar" />';
    return eventRender;
  }
  // <img src="assets/images/promotion.svg" class="itemlines-avatar" />
  companyPriceGroupNewGridCol(): any {
    return [
      { headerName: 'Description', field: 'Description', headerClass: 'header-text-left', editable: true, width: 200, suppressSizeToFit: true, },
      {
        headerName: 'No. Of Items', field: 'NoOfItems', width: 140, minWidth: 140,
        cellClass: 'text-center',
        headerClass: 'header-text-center'
      },
      {
        headerName: 'Actions', field: 'value', filter: false, suppressSorting: false,
        suppressSizeToFit: true, width: 110,
        cellRendererFramework: SaveButtonParentComponent,
      }
    ];
  }
  itemListChildGrpGridCol(): any {
    return [
      { headerName: 'Company Price Grp Name', field: 'companyPriceGroupName', cellRenderer: 'agGroupCellRenderer' },
      {
        headerName: 'Actions', field: '', cellRenderer: 'CellActionRenderer',
        cellRendererParams: (params) => {
          if (params.data.companyPriceGroupID)
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: false }
          else
            return { hideEditAction: true, isSaveRequired: false, hideDeleteAction: true }
        },
      }
    ];
  }

  storeMixMatchDetailGridCol(): any {
    return [
      {
        headerName: 'Store Location', field: 'StoreName', suppressMenu: true, editable: false,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.storeLocationList,
            bindLabel: "storeName",
            bindValue: "storeLocationID",
            placeHolder: "Select Store",
            selectedId: params.data.StoreLocationID
          };
        },
        cellRenderer: (params) => {
          return params.data.StoreName;
        },
      },
      {
        headerName: 'Mix Match Type', field: 'MixMatchPromotionUnitTypeID', suppressMenu: true, editable: true, minWidth: 140,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          let updatedData = params.data.mixMatchPromotionTypes.map((data) => {
            return { ...data, mixMatchPromotionUnitTypeName: data.mixMatchPromotionUnitTypeName.replace("MixMatch", "") }
          });
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: updatedData,
            bindLabel: "mixMatchPromotionUnitTypeName",
            bindValue: "mixMatchPromotionUnitTypeID",
            placeHolder: "Select Type",
            selectedId: params.data.MixMatchPromotionUnitTypeID
          };
        },
        cellRenderer: (params) => {
          return params.data.MixMatchPromotionUnitTypeName ? params.data.MixMatchPromotionUnitTypeName.replace("MixMatch", "") : '';
        },
        cellClass: 'text-center',
        headerClass: 'justify-content-center'
      },
      {
        headerName: 'Start Date', field: 'BeginDate', suppressMenu: true, editable: true,
        cellEditor: 'inputDateCellRenderer',
        cellRenderer: (params) => {
          if (params.data.MixMatchStoreLocationID === null)
            return null;
          else
            return this.utilityService.formatDate(params.value);
        },
        cellEditorParams: {
          placeHolder: "Start Date",
          minDate: moment().subtract(1, "days")
        },
        cellClass: 'text-center',
        headerClass: 'justify-content-center'
      },
      {
        headerName: 'End Date', field: 'EndDate', suppressMenu: true, editable: true,
        cellEditor: 'inputDateCellRenderer',
        cellRenderer: (params) => {
          if (params.data.MixMatchStoreLocationID === null)
            return null;
          else
            return this.utilityService.formatDate(params.value); return null;
        },
        cellEditorParams: {
          placeHolder: "End Date",
          minDate: moment().subtract(1, "days")
        },
        cellClass: 'text-center',
        headerClass: 'justify-content-center'
      },
      {
        headerName: 'Qty', field: 'MixMatchUnits', cellEditor: 'onlyNumericEditor', suppressMenu: true, editable: true, width: 100,
        cellClass: 'text-center', headerClass: 'header-text-center',
      },
      {
        headerName: 'Co-Funded', field: 'Co_funded', suppressMenu: true, editable: true,
        cellEditor: 'toggleRenderer',
        headerClass: 'header-text-center',
        cellRenderer: (params) => {
          if (params.data.MixMatchStoreLocationID === null)
            return null;
          else
            return params.value;
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            cellfieldId: 'Co_funded',
            gridtype: this.constantService.gridTypes.storeMixMatchDetailGrid
          }
        },
        cellClass: 'text-center',

      },
      {
        headerName: 'Manufacturer Disc', field: 'ManufacturerFunded', headerClass: 'header-text-center', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeMixMatchDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Retailer Disc', field: 'RetailerFunded', headerClass: 'header-text-center', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeMixMatchDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Total Value', field: 'MixMatchAmount', headerClass: 'header-text-center', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeMixMatchDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Last POS Sync', field: 'LastModifiedDateTime', headerClass: 'header-text-center', suppressMenu: true, editable: false,
        cellEditor: 'inputDateTimeCellRenderer',
        cellRenderer: (params) => {
          if (params.data.MixMatchStoreLocationID === null)
            return null;
          else
            return this.utilityService.formatDateTime(params.value);
        },
        cellEditorParams: {
          placeHolder: "Date & Time"
        }
      },
      {
        headerName: 'Status', field: 'POSSyncStatusID', suppressMenu: true, editable: true,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.mixMatchStatusList,
            bindLabel: "posSyncStatusCode",
            bindValue: "posSyncStatusID",
            placeHolder: "Select Status",
            selectedId: params.data.POSSyncStatusID
          };
        },
        cellRenderer: (params) => {
          return params.data.POSSyncStatusCode;
        },
        cellClass: 'text-center',
        headerClass: 'header-text-center',
      },
      // { headerName: 'Last Modified By', field: 'possystemname', suppressMenu: true, editable: false },
      {
        headerName: 'Actions', field: '', suppressMenu: true, editable: false,
        cellRendererFramework: SaveButtonComponent,
        cellRendererParams: (params) => {
          params.context.componentParent.isCancel = false;
          if (params.data.MixMatchStoreLocationID === null) {
            params.data.isCancel = false;
          } else params.data.isCancel = true;
          return {
            data: params.data
          };
        }
      },
    ];
  }

  storeComboDealDetailGridCol(): any {
    return [
      {
        headerName: 'Store Location', field: 'StoreName', suppressMenu: true, editable: false,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.storeLocationList,
            bindLabel: "storeName",
            bindValue: "storeLocationID",
            placeHolder: "Select Store",
            selectedId: params.data.StoreLocationID
          };
        },
        cellRenderer: (params) => {
          return params.data.StoreName;
        },
      },
      {
        headerName: 'Start Date', field: 'BeginDate', suppressMenu: true, editable: true,
        cellEditor: 'inputDateCellRenderer',
        cellRenderer: (params) => {
          if (params.value === null) return "";
          else return this.utilityService.formatDate(params.value);
        },
        cellEditorParams: {
          placeHolder: "Start Date",
          minDate: moment().subtract(1, "days")
        },
        cellClass: 'text-center',
        headerClass: 'justify-content-center'
      },
      {
        headerName: 'End Date', field: 'EndDate', suppressMenu: true, editable: true,
        cellEditor: 'inputDateCellRenderer',
        cellRenderer: (params) => {
          if (params.value === null) return "";
          else return this.utilityService.formatDate(params.value);
        },
        cellEditorParams: {
          placeHolder: "End Date",
          minDate: moment().subtract(1, "days")
        },
        cellClass: 'text-center',
        headerClass: 'justify-content-center'
      },
      {
        headerName: 'Qty', field: 'ComboUnits', cellEditor: 'onlyNumericEditor', suppressMenu: true, editable: true, width: 100,
        cellClass: 'text-center',
        headerClass: 'header-text-center',
      },
      {
        headerName: 'Co-Funded', field: 'Co_funded', suppressMenu: true, editable: true,
        cellEditor: 'toggleRenderer',
        cellRenderer: (params) => {
          if (params.value !== null && params.value !== "" && params.value !== undefined)
            return params.value.toString().charAt(0).toUpperCase() + params.value.toString().slice(1);
          else
            return params.value;
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            cellfieldId: 'Co_funded',
            gridtype: this.constantService.gridTypes.storeComboDealDetailGrid
          }
        },
        cellClass: 'text-center',
        headerClass: 'header-text-center',
      },
      {
        headerName: 'Manufacturer Disc', field: 'ManufacturerFunded', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeComboDealDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Retailer Disc', field: 'RetailerFunded', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeComboDealDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Combo Amount', field: 'ComboAmount', headerClass: 'header-text-center', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.storeComboDealDetailGrid
          }
        },
        cellClass: 'text-right'
      },
      {
        headerName: 'Priority Type', field: 'ComboPriorityTypeID', suppressMenu: true, editable: true,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.comboPriorityTypes,
            bindLabel: "comboPriorityTypeName",
            bindValue: "comboPriorityTypeID",
            placeHolder: "Priority Type",
            selectedId: params.data.ComboPriorityTypeID
          };
        },
        cellRenderer: (params) => {
          return params.data.ComboPriorityTypeName;
        },
        cellClass: 'text-center',
        headerClass: 'header-text-center',
      },
      {
        headerName: 'Status', field: 'POSSyncStatusID', suppressMenu: true, editable: true, headerClass: 'header-text-center',
        cellEditor: 'selectMenuCellRenderer',
        cellClass: 'text-center',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.comboDealStatusList,
            bindLabel: "posSyncStatusCode",
            bindValue: "posSyncStatusID",
            placeHolder: "Select Status",
            selectedId: params.data.POSSyncStatusID
          };
        },
        cellRenderer: (params) => {
          return params.data.POSSyncStatusCode;
        }
      },
      // { headerName: 'Last Modified By', field: 'possystemname', suppressMenu: true, editable: false },
      {
        headerName: 'Actions', field: '', suppressMenu: true, editable: false,
        cellRendererFramework: SaveButtonComponent,
        cellRendererParams: (params) => {
          params.context.componentParent.isCancel = false;
          if (params.data.ComboDealStoreLocationID === null) {
            params.data.isCancel = false;
          } else params.data.isCancel = true;
          return {
            data: params.data
          };
        }
      },
    ];
  }

  priceGrpItemDetailGridCol(): any {
    return [
      {
        headerName: 'Active', field: 'isActive', cellRenderer: 'toggleRenderer',
        cellRendererParams: {
          cellfieldId: 'isActive',
        }
      },
      { headerName: 'Description', field: 'description' },
      { headerName: 'Selling Units', field: 'sellingUnits', cellStyle: { 'text-align': 'center' } },
      { headerName: 'Unit(s) In Case', field: 'unitsInCase', cellStyle: { 'text-align': 'center' } },
    ];
  }
  priceGrpItemDetailGridCol1(): any {
    return [
      /*  {
         field: 'name',
         width: 100,
         cellEditor: 'agRichSelectCellEditor',
         cellEditorParams: {
             cellHeight: 50,
             values: ['Ireland', 'USA','abc']
         }
     }, */
      /*  {
         headerName: "Name",
         field: "name",
         width: 300,
         cellEditor: 'agRichSelectCellEditor',
         cellEditorParams: {
           cellHeight: 50,
           values: ['Ireland', 'USA','abc'],
         },
       
       }, */
      /*   { headerName: 'Active', field: 'isActive' , cellRenderer: 'toggleRenderer',
        cellRendererParams: {
          cellfieldId: 'isActive',
        }
        }, */
      { headerName: 'UPC Code', field: 'posCode' },
      { headerName: 'Description', field: 'description' }
    ];
  }

  priceGrpItemDetailGridCol2(): any {
    return [

      { headerName: 'UPC Code', field: 'posCode', width: 60 },
      { headerName: 'Description', field: 'description' }
    ];
  }
  itemCatalogGridCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', width: 25, minWidth: 25, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      { headerName: 'UPC Code', field: 'POSCodeWithCheckDigit', headerClass: 'header-text-left', width: 90, minWidth: 90 },
      { headerName: 'Description', field: 'Description' }
    ];
  }
  itemCatalogStoreGridCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', width: 25, minWidth: 25, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
        headerCheckboxSelection: true
      },
      { headerName: 'UPC Code', field: 'POSCodeWithCheckDigit', headerClass: 'header-text-left', width: 90, minwidth: 90 },
      { headerName: 'Description', field: 'Description' },
      {
        headerName: 'Price', field: 'RegularSellPrice', width: 80, minwidth: 80,
        cellRenderer: (params) => {
          if (params.value == 0)
            return '$' + params.value;
          else
            return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
        },
        cellClass: 'text-right',
        headerClass: 'header-text-center'
      }
    ];
  }
  /*  itemDetailGridCol() {
     return [
       {
         headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 30, checkboxSelection: true,
         suppressMenu: true, suppressSorting: true,
       },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">UPC Code</span></div>'
       }, field: 'POSCodeWithCheckDigit', headerClass: 'header-text-wrap', suppressSizeToFit: true, width: 95, minWidth: 95, },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Description</span></div>'
       }, field: 'Description', headerClass: 'header-text-wrap', width: 80, minWidth:80},
 
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Department</span></div>'
       }, field: 'DepartmentDescription', headerClass: 'header-text-wrap', width: 80, minWidth:80 },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Selling <br/>Units</span></div>'
       }, field: 'SellingUnits', suppressSizeToFit: true, width: 55,minWidth:55, headerClass: 'header-text-wrap' },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Unit(s) <br/> In Case</span></div>'
       }, field: 'UnitsInCase', headerClass: 'header-text-wrap', width: 55,minWidth:55, suppressSizeToFit: true, },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Location</span></div>'
       }, field: 'StoreName', headerClass: 'header-text-wrap', width: 140, minWidth:100 },
       {
         headerComponentParams: {
           template:
             '<div class="div-header" ><span class="span-header">Buying <br/> Cost</span></div>'
         },
         field: 'InventoryValuePrice', width: 55,minWidth:55, suppressSizeToFit: true, headerClass: 'header-text-wrap',
         cellRenderer: (params) => {
           return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
         }
       },
       // {
       //   headerName: 'Buy Down', field: 'BuyDown', width: 50, suppressSizeToFit: true,minWidth:50, headerClass: 'header-text-wrap', cellRenderer: (params) => {
       //     return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
       //   }
       // },
       {
         headerComponentParams: {
           template:
             '<div class="div-header" ><span class="span-header">Selling <br/> Price</span></div>'
         },
        field: 'RegularSellPrice', width: 55,minWidth:55, suppressSizeToFit: true, headerClass: 'header-text-wrap', cellRenderer: (params) => {
           return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
         }
       },
       {
         headerComponentParams: {
           template:
             '<div class="div-header" ><span class="span-header">Gross <br/> Profit</span></div>'
         }, field: 'GrossProfit', width: 55,minWidth:55, suppressSizeToFit: true, headerClass: 'header-text-wrap', cellRenderer: (params) => {
           return this.utilityService.formatProfitPercentage(params.value);
         }
       },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Current <br/> Inventory</span></div>'
       }, field: 'CurrentInventory',minWidth:70, suppressSizeToFit: true, headerClass: 'header-text-wrap', width: 70 },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">POSCode <br/> Modifier</span></div>'
       }, field: 'POSCodeModifier', headerClass: 'header-text-wrap', width: 80,minWidth:75 },
       {headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Package <br/> Sell Price</span></div>'
       },
         field: 'RegularPackageSellPrice',minWidth:75, headerClass: 'header-text-wrap', width: 75, suppressSizeToFit: true,
         cellRenderer: (params) => {
           return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
         }
       },
       { headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Last <br/> <br/> Modified By</span></div>'
       },  field: 'LastModifiedBy', headerClass: 'header-text-wrap', width: 80 },
       {headerComponentParams: {
         template:
           '<div class="div-header" ><span class="span-header">Last <br/> Modified<br/>  Date Time</span></div>'
       }, 
         field: 'LastModifiedDateTime', headerClass: 'header-text-wrap', width: 100,
         cellRenderer: (params: any) => this.dateFormat(params.value)
       },
       {
         headerComponentParams: {
           template:
             '<div class="div-header" ><span class="span-header">Status</span></div>'
         },
         field: 'ActiveFlag', suppressSizeToFit: true, width: 55,minWidth:55, headerClass: 'header-text-wrap',
         cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data ? params.data.ActiveFlag : false)
        
       },
       {
         headerName: '', field: 'mulType', suppressSizeToFit: true, width: 40, headerClass: 'header-text-wrap',
         cellRenderer: (params: any) => {
             this.mulTypeCellRenderer(params.data ? params.data.mulType : false)
         }
       },
       {
         headerComponentParams: {
           template:
             '<div class="div-header" ><span class="span-header">Action</span></div>'
         },
         field: 'action', colId: 'params', headerClass: 'header-text-wrap',
         cellRenderer: 'CellRenderer', width: 90,suppressSizeToFit: true, maxWidth: 200, pinned: 'right',
         cellRendererParams: (params: any) => {
           if (params.data && params.data.ActiveFlag) return { showSuspend: true }
           else return { showRecover: true }
         }
       }
     ];
   } */
  itemDetailGridCol() {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true,
      },
      // { headerName: 'UPC Code', field: 'POSCodeWithCheckDigit', suppressMenu: true, suppressSizeToFit: true, width: 95, minWidth: 95, headerClass: 'p-0'  },
      // { headerName: 'Description', field: 'Description', suppressMenu: true, width: 80, minWidth: 80, headerClass: 'p-0'  },
      {
        headerName: 'Item', field: 'POSCodeWithCheckDigit', suppressMenu: true, width: 100, minWidth: 100, headerClass: 'p-0',
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'itemUPCDetailsCellRenderer'
            };
          } else return null;
        }
      },
      { headerName: 'Department', field: 'DepartmentDescription', suppressMenu: true, width: 55, minWidth: 55, cellStyle: { 'text-align': 'center' } },
      { headerName: 'Unit(s) In Case', suppressMenu: true, field: 'UnitsInCase', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-wrap-1', width: 55, minWidth: 55, },//suppressSizeToFit: true,
      {
        headerName: 'Selling Units', field: 'SellingUnits', suppressMenu: true, cellStyle: { 'text-align': 'center' }, width: 40, minWidth: 40,
        headerClass: 'header-text-wrap-1'
        // headerClass: (params: any) => {
        //   setTimeout(() => {
        //     console.log(params.column.columnApi.getAllDisplayedVirtualColumns());
        //     return 'header-text-wrap-1';
        //   });
        // }
      },

      { headerName: 'Location', field: 'StoreName', suppressMenu: true, width: 140, minWidth: 100, headerClass: 'p-0' },
      {
        headerName: 'Buying Cost', field: 'InventoryValuePrice', suppressMenu: true, width: 55, minWidth: 55, suppressSizeToFit: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
        }
      },
      {
        headerName: 'Buy Down', field: 'BuyDownAmt', width: 50, suppressMenu: true, suppressSizeToFit: true, minWidth: 50, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
        }
      },
      {
        headerName: 'SRP', field: 'SRP', width: 50, suppressMenu: true, suppressSizeToFit: true, minWidth: 50, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
        }
      },
      {
        headerName: 'Selling Price', field: 'RegularSellPrice', suppressMenu: true, width: 55, minWidth: 55, suppressSizeToFit: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
        }
      },

      {
        headerName: 'Gross Profit', field: 'GrossProfit', suppressMenu: true, width: 55, minWidth: 55, suppressSizeToFit: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', cellRenderer: (params) => {
          return this.utilityService.formatProfitPercentage(params.value);
        }
      },
      { headerName: 'Current Inventory', field: 'CurrentInventory', suppressMenu: true, minWidth: 70, suppressSizeToFit: true, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', width: 70 },
      { headerName: 'Modifier', field: 'POSCodeModifier', cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-wrap', suppressMenu: true, width: 80, minWidth: 75 },
      {
        headerName: 'Package Sell Price', field: 'RegularPackageSellPrice', suppressMenu: true, minWidth: 75, cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-wrap-1', width: 75, suppressSizeToFit: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
        }
      },
      { headerName: 'Last Modified By', field: 'LastModifiedBy', headerClass: 'header-text-wrap-1', suppressMenu: true, width: 80 },
      {
        headerName: 'Last Modified Date Time', field: 'LastModifiedDateTime', headerClass: 'header-text-wrap-1', suppressMenu: true, width: 100,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Status', field: 'ActiveFlag', suppressSizeToFit: true, cellStyle: { 'text-align': 'center' }, width: 55, minWidth: 55, headerClass: 'header-text-wrap',
        suppressMenu: true, cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data ? params.data.ActiveFlag : false)

      },
      {
        headerName: '', field: 'mulType', suppressSizeToFit: true, width: 40, headerClass: 'header-text-wrap', suppressMenu: true,
        cellRenderer: (params: any) => {
          this.mulTypeCellRenderer(params.data ? params.data.mulType : false)
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', headerClass: 'header-text-wrap', suppressMenu: true,
        cellRenderer: 'CellRenderer', width: 140, suppressSizeToFit: true, maxWidth: 200, pinned: 'right',
        cellRendererParams: (params: any) => {
          if (params.data && params.data.ActiveFlag) return { showSuspend: true, itemHistory: true, salesActivity: true }
          else return { showRecover: true, itemHistory: true, salesActivity: true }
        }
      }
    ];
  }

  manageItemsGridCol() {
    return [
      // {
      //   headerName: 'UPC Code',
      //   field: 'POSCodeWithCheckDigit',
      //   editable: true,
      //   cellStyle: { color: '#000' },
      //   width: 130,
      //   checkboxSelection: true,
      // },
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      {
        headerName: 'Item', field: 'POSCodeWithCheckDigit', suppressMenu: true, headerClass: 'text-center',
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'itemUPCDetailsCellRenderer'
            };
          } else return null;
        }, minWidth: 60,
        width: 70,

      },
      // { headerName: 'Description', field: 'Description', editable: true },
      {
        headerName: 'Department', field: 'DepartmentDescription', headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid' },
        width: 30, minWidth: 60, maxWidth: 250
      },
      {
        headerName: 'Sell Units',
        field: 'SellingUnits', headerClass: 'justify-content-center',
        editable: true, cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px' },
        width: 25, minWidth: 60, maxWidth: 120
      },
      {
        headerName: 'Unit(s) In Case',
        field: 'UnitsInCase', headerClass: 'justify-content-center',
        editable: true, cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px' },
        width: 30, minWidth: 60, maxWidth: 130
      },
      {
        headerName: 'is Active', headerClass: 'justify-content-center',
        field: 'ActiveFlag', width: 50, minWidth: 50, maxWidth: 100,
        cellClass: 'justify-content-center',
        // cellRenderer: (params: any) => {
        //   if (params.data.ActiveFlag) return '<i class="flaticon-check"></i>';
        //   else return '<i class="flaticon-cancel"></i>';
        // },
        cellRenderer: (params: any) => this.nonEditableCheckBoxCellRenderer(params.data ? params.data.ActiveFlag : false)
      },
      {
        headerName: 'Actions', field: '', cellRenderer: 'advActionRenderer', pinned: 'right', width: 170, suppressSizeToFit: true, maxWidth: 200,
        cellRendererParams: (params) => {
          if (params.data && params.data.ActiveFlag) {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: false,
              hideRecover: true,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          } else {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: true,
              hideRecover: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          }
        },
      }
    ];
  }

  manageItemsPricingGridCol() {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      {
        headerName: 'Store', field: 'StoreName', headerClass: 'justify-content-center',
        width: 50, minWidth: 50, maxWidth: 250
      },
      {
        headerName: 'Item', field: 'POSCodeWithCheckDigit', suppressMenu: true, headerClass: 'text-center',
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'itemUPCDetailsCellRenderer'
            };
          } else return null;
        }, minWidth: 100,
        width: 100
      },
      {
        headerName: 'Department', field: 'DepartmentDescription', headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid' },
        width: 60, minWidth: 60, maxWidth: 250
      },
      {
        headerName: 'Buying Cost', field: 'InventoryValuePrice', suppressMenu: true, minWidth: 80, width: 110, maxWidth: 250,
        suppressSizeToFit: true,
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        headerClass: 'header-text-wrap-1',
        cellRenderer: (params) => {
          if (params.value) {
            return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Selling Price',
        field: 'RegularSellPrice',
        cellEditor: 'decimalWithDollarEditor',
        editable: true,
        cellRenderer: (params) => {
          if (params.value) {
            return this.utilityService.formatDecimalCurrency(params.value);
          } else {
            return '';
          }
        },
        cellEditorParams: {
          step: 0.01,
        },
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        width: 50, minWidth: 50,
        maxWidth: 250
      },
      {
        headerName: 'Margin',
        field: 'profitMargin',
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        minWidth: 60, width: 60, maxWidth: 250,
        cellRenderer: (params) => {
          if (params.data && params.data.RegularSellPrice != 0 && params.data.RegularSellPrice != null) {
            const profit =
              parseFloat(params.data.RegularSellPrice) -
              parseFloat(params.data.InventoryValuePrice);
            let grossMargin =
              (profit * 100) / parseFloat(params.data.RegularSellPrice);
            return grossMargin.toFixed(2) + "%";
          } else {
            return '';
          }
        },
      },
      {
        headerName: 'Current Inventory',
        field: 'CurrentInventory',
        editable: false,
        cellRenderer: (params) => {
          return params.value;
        },
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid', 'font-weight': 'bold' },
        minWidth: 60, width: 60, maxWidth: 250
      },
      {
        headerName: 'Actions', field: 'value', cellRenderer: 'advActionRenderer', pinned: 'right', width: 170, suppressSizeToFit: true, maxWidth: 200,
        cellRendererParams: (params) => {
          if (params.data && params.data.ActiveFlag) {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: false,
              hideRecover: true,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          } else {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: true,
              hideRecover: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          }
        },
      }
    ];
  }

  manageItemsPricingGridWithoutStoreCol() {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      {
        headerName: 'Item', field: 'POSCodeWithCheckDigit', suppressMenu: true, headerClass: 'text-center',
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'itemUPCDetailsCellRenderer'
            };
          } else return null;
        }, minWidth: 100,
        width: 100
      },
      {
        headerName: 'Department', field: 'DepartmentDescription', headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid' },
        minWidth: 60, width: 60, maxWidth: 250
      },
      {
        headerName: 'Buying Cost', field: 'InventoryValuePrice', suppressMenu: true,
        minWidth: 80, width: 110, maxWidth: 250, suppressSizeToFit: true,
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        headerClass: 'header-text-wrap-1',
        cellRenderer: (params) => {
          if (params.value) {
            return this.utilityService.formatDecimalCurrencyWithZero(this.utilityService.formatDecimalDigit(params.value));
          } else {
            return '';
          }
        }
      },
      {
        headerName: 'Selling Price',
        field: 'RegularSellPrice',
        cellEditor: 'decimalWithDollarEditor',
        editable: true,
        cellRenderer: (params) => {
          if (params.value) {
            return this.utilityService.formatDecimalCurrency(params.value);
          } else {
            return '';
          }
        },
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        minWidth: 50, width: 60, maxWidth: 250
      },
      {
        headerName: 'Margin',
        field: 'profitMargin',
        suppressSizeToFit: true,
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'right', 'display': 'inline', 'padding-top': '8px', 'font-weight': 'bold' },
        minWidth: 70, width: 110, maxWidth: 250,
        cellRenderer: (params) => {
          if (params.data && params.data.RegularSellPrice != 0 && params.data.RegularSellPrice != null) {
            const profit =
              parseFloat(params.data.RegularSellPrice) -
              parseFloat(params.data.InventoryValuePrice);
            let grossMargin =
              (profit * 100) / parseFloat(params.data.RegularSellPrice);
            return grossMargin.toFixed(2) + "%";
          } else {
            return '';
          }
        },
      },
      {
        headerName: 'Current Inventory',
        field: 'CurrentInventory',
        editable: false,
        cellRenderer: (params) => {
          return params.value;
        },
        headerClass: 'justify-content-center',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid', 'font-weight': 'bold' },
        minWidth: 60, width: 60, maxWidth: 250
      },
      {
        headerName: 'Actions', field: 'value', cellRenderer: 'advActionRenderer', pinned: 'right', width: 180, suppressSizeToFit: true, maxWidth: 200,
        cellRendererParams: (params) => {
          if (params.data && params.data.ActiveFlag) {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: false,
              hideRecover: true,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          } else {
            return {
              hideDelete: false,
              hideEdit: false,
              hideSuspend: true,
              hideRecover: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              noSave: true,
              hideDownload: true
            };
          }
        },
      }
    ];
  }

  manageItemsByPriceGrpGridCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      { field: 'groupDescription', headerName: 'Group Name', minWidth: 60 },
      { headerName: 'Store Name', field: 'storeName', minWidth: 60 },
      {
        headerName: 'Buying Cost',
        field: 'buyingCost',
        cellEditor: 'decimalWithDollarEditor',
        editable: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Buying Cost',
          };
        },
        minWidth: 60
      },
      {
        headerName: 'Selling Price',
        field: 'sellingPrice',
        cellEditor: 'decimalWithDollarEditor',
        editable: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Selling Price',
          };
        },
        minWidth: 60
      },
      {
        headerName: 'Item Count',
        field: 'itemCount',
        cellStyle: { color: '#007bff', cursor: 'pointer' },
        minWidth: 60
      },
      {
        headerName: 'Actions',
        field: 'value',
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: true,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true,
        },
        minWidth: 60
      },
    ];
  }

  manageItemsByPriceGrpGridSingleStoreCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      { field: 'groupDescription', headerName: 'Group Name', minWidth: 60 },
      {
        headerName: 'Buying Cost',
        field: 'buyingCost',
        cellEditor: 'inputNumberCellEditor',
        editable: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: {
          step: 0.01,
        },
        minWidth: 60
      },
      {
        headerName: 'Selling Price',
        field: 'sellingPrice',
        cellEditor: 'inputNumberCellEditor',
        editable: true,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: {
          step: 0.01,
        },
        minWidth: 60
      },
      {
        headerName: 'Item Count',
        field: 'itemCount',
        cellStyle: { color: '#007bff', cursor: 'pointer' },
        minWidth: 60
      },
      {
        headerName: 'Actions',
        field: 'value',
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: true,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true,
        },
        minWidth: 60
      },
    ];
  }

  itemByPriceGroupGridCol() {
    return [
      { field: 'posCode', headerName: 'UPC Code', maxWidth: 130 },
      { field: 'itemDescription', headerName: 'Description' },
      {
        field: 'departmentDescription',
        headerName: 'Department',
        cellStyle: { 'text-align': 'center', 'color': 'black', 'display': 'inline-grid' },
        maxWidth: 130,
      },
      { field: 'inventoryValuePrice', headerName: 'Cost', maxWidth: 70 },
      { field: 'regularSellPrice', headerName: 'Selling Price', maxWidth: 110 },
    ];
  }

  advmultipacksIGridCol() {
    return [
      /*  {
        headerName: 'Store Name', field: 'storeName', editable: true,
        suppressMenu: true,
        maxWidth: 200,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService.itemStoreList,
            bindLabel: 'storeName',
            bindValue: 'storeName',
            placeHolder: 'Select Store',
            selectedId: params.data.storeName,
            gridtype: 'multipacksIGrid',
          };
        },
        cellRenderer: (params) => {
          return params.data.storeName;
        },
      },  */
      {
        headerName: 'POS Code Modifier',
        field: 'posCodeModifier',
        editable: true,
        suppressMenu: true,
        maxWidth: 200,
        cellEditor: 'advSelectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService.multipackModifierList,
            bindLabel: 'posCodeModifier',
            bindValue: 'posCodeModifier',
            placeHolder: 'Select POS Code',
          };
        },
        cellRenderer: (params) => {
          return params.data.posCodeModifier;
        },
      },
      {
        headerName: 'Cost Price',
        field: 'unitCostPrice',
        suppressMenu: true,
        editable: true,
        width: 130,
        cellEditor: 'decimalWithDollarEditor',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'multipacksIGrid',
            placeHolder: 'Cost Price'
          };
        },
        cellRenderer: (params) => {
          return params.data.unitCostPrice;
        },
      },
      {
        headerName: 'Selling Price',
        field: 'regularPackageSellPrice',
        suppressMenu: true,
        editable: true,
        width: 130,
        cellEditor: 'decimalWithDollarEditor',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'multipacksIGrid',
            placeHolder: 'Selling Price'
          };
        },
        cellRenderer: (params) => {
          return params.data.regularPackageSellPrice;
        },
      },

      {
        headerName: 'Profit %',
        field: 'grossProfit',
        cellRenderer: (params) => {
          return params.value
            ? this.utilityService.formatDecimalDigit(params.value)
            : '';
        },
      },
      {
        headerName: 'Action',
        pinned: 'right',
        width: 100,
        maxWidth: 100,
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: (params) => {
          if (params.data.isDeleted) {
            return {
              hideDelete: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              hideEdit: false,
              hideSuspend: false,
              hideRecover: true,
            };
          } else {
            return {
              hideDelete: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              hideEdit: false,
              hideSuspend: true,
              hideRecover: false,
            };
          }
        },
      },
    ];
  }
  linkedItemsGridCol() {
    // pinned: 'right',
    return [
      {
        headerName: 'UPC Code',
        width: 150,
        field: 'posCode',
        suppressMenu: true,
        editable: true,
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'UPC Code',
          };
        },
        cellRenderer: (params) => {
          return params.data.posCode;
        },
      },
      {
        headerName: 'Description',
        field: 'description',
        // headerClass: 'header-text-wrap',
        width: 210,
      },
      { headerName: 'linkItemID', field: 'linkItemID', hide: true },
      {
        headerName: 'Link Type',
        field: 'linkedItemTypeID',
        suppressMenu: true,
        editable: true,
        width: 180,
        cellEditor: 'advSelectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService.LinkedTypeList,
            bindLabel: 'description',
            bindValue: 'linkedItemTypeID',
            placeHolder: 'Select Type',
            selectedId: params.data.linkedItemTypeID,
          };
        },
        cellRenderer: (params) => {
          return params.data.description;
        },
      },
      {
        headerName: 'Discount',
        field: 'discountAmount',
        suppressMenu: true,
        editable: true,
        width: 140,
        cellEditor: 'decimalWithDollarEditor',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Discount',
          };
        },
        cellRenderer: (params: any) => {
          if (params.data.discountAmount) {
            return '$' + params.data.discountAmount;
          }
          return `<div>-</div>`
        }
      },
      {
        headerName: 'Action',
        pinned: 'right',
        maxWidth: 80,
        field: 'actions',
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: false,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true
        },
      },
    ];
  }
  multiplierItemGridCol() {
    return [
      {
        headerName: 'Type',
        field: 'type',
        suppressMenu: true,
        editable: true,
        minWidth: 160,
        maxWidth: 240,
        cellEditor: 'advSelectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService._multiplierInventoryType,
            bindLabel: 'multiplierInventoryDescription',
            bindValue: 'multiplierInventoryTypeID',
            placeHolder: 'Select Type',
            selectedId: params.data.type,
            searchable: false
          };
        },
        cellRenderer: (params) => {
          return params.data.mulType;
        },
      },
      {
        headerName: 'UPC Code',
        field: 'upcCode',
        suppressMenu: true,
        editable: true,
        minWidth: 120,
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'UPC Code',
          };
        },
        cellRenderer: (params) => {
          return params.data.upcCode;
        },
      },
      { headerName: 'Description', field: 'itemDescription', minWidth: 180, suppressMenu: true },
      { headerName: 'containedItemID', field: 'containedItemID', hide: true },
      {
        headerName: 'Qty',
        field: 'quantity',
        suppressMenu: true,
        editable: true,
        maxWidth: 80,
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Quantity',
          };
        },
        cellRenderer: (params) => {
          return params.data.quantity;
        },
      },
      {
        headerName: 'Action',
        pinned: 'right',
        field: 'actions',
        maxWidth: 80,
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: false,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true
        },
      },
    ];
  }
  priceGroupItemGridCol() {
    return [
      {
        headerName: 'Group',
        field: 'priceGroupID',
        suppressMenu: true,
        editable: true,
        maxWidth: 550,
        cellEditor: 'advSelectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService._companyPriceGroupRow,
            bindLabel: 'CompanyPriceGroupName',
            bindValue: 'CompanyPriceGroupID',
            placeHolder: 'Select Price Group',
            selectedId: params.data.priceGroupID,
          };
        },
        cellRenderer: (params) => {
          return params.data.companyPriceGroupName;
        },
      },
      {
        headerName: 'Action',
        pinned: 'right',
        field: 'actions',
        maxWidth: 80,
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: false,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true
        },
      },
    ];
  }

  storeItemsGridCol() {
    return [
      // { field: 'storeGroup.name', rowGroup: true, hide: true },
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerName: 'Store',
        field: 'storeName',
        width: 250,
        minWidth: 75,
        cellStyle: { color: '#000' }
      },
      { headerName: 'POS Code', field: 'posCode', hide: true, cellStyle: { color: '#000' } },

      {
        headerName: 'Cost Buy',
        field: 'buyingCost',
        suppressMenu: true,
        editable: true,
        hide: true,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Buy Cost',
            gridtype: 'storeitemgrid',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.buyingCost
          );
        },
      },
      {
        headerName: 'Cost Discount',
        field: 'buyingDiscount',
        editable: true,
        hide: true,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Cost Discount',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.buyingDiscount
          );
        },
      },
      {
        headerName: 'Cost',
        minWidth: 75,
        field: 'inventoryValuePrice',
        editable: true,
        cellStyle: { color: '#000' },
        cellEditor: 'decimalWithDollarEditor',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Cost',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.node.data ? params.node.data.inventoryValuePrice : null
          );
        },
      },
      {
        headerName: 'Sell Price',
        minWidth: 75,
        field: 'regularSellPrice',
        editable: true,
        cellStyle: { color: '#000' },
        cellEditor: 'decimalWithDollarEditor',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Sell Price',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.node.data ? params.node.data.regularSellPrice : null
          );
        },
      },
      {
        headerName: 'Margin',
        minWidth: 75,
        field: 'profitMargin',
        editable: false,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Margin',
          };
        },
        cellRenderer: (params) => {
          if (params.data && params.data.regularSellPrice != 0 && params.data.regularSellPrice != null) {
            const profit =
              parseFloat(params.data.regularSellPrice) -
              parseFloat(params.data.inventoryValuePrice);
            let grossMargin =
              (profit * 100) / parseFloat(params.data.regularSellPrice);
            return grossMargin.toFixed(2) + "%";
          } else {
            return '';
          }
        }
      },
      { headerName: 'Profit%', field: 'profitMargin', hide: true, cellStyle: { color: '#000' } },
      {
        headerName: 'Buy down.',
        minWidth: 75,
        field: 'buydown',
        editable: true,
        cellEditor: 'inputNumberCellEditor',
        cellStyle: { color: '#000' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      {
        headerName: 'Current Inv.',
        // headerClass: 'header-text-wrap',
        field: 'currentInventory',
        cellStyle: { color: '#000' },
        editable: true,
        cellEditor: 'inputNumberCellEditor',
        minWidth: 75
      },
      {
        headerName: 'Inv. Date',
        // headerClass: 'header-text-wrap',
        field: 'inventoryAsOfDate',
        cellStyle: { color: '#000' },
        width: 140,
        minWidth: 75,
        cellRenderer: (params) => {
          // params.data.InventoryAsOfDate = this.utilityService.formatDate(params.value);
          if (params.value) {
            return this.utilityService.formatDate(params.value);
          } else {
            return '';
          }
        },
      },
      {
        cellId: 'multipack',
        headerName: '',
        minWidth: 75,
        cellStyle: { color: '#000' },
        cellRenderer: 'btnCellRenderer',
        cellRendererParams: {
          btnText: 'Modifier',
          btnClasses: 'v-btn-primary',
          onClick: (e: Event, params) => {
            console.log({ e, params });
          },
        },
      },
      {
        headerName: 'Action',
        pinned: 'right',
        maxWidth: 150,
        field: 'actions',
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: (params) => {
          if (params.data.isDeleted) {
            return {
              hideDelete: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              hideEdit: false,
              hideSuspend: false,
              hideRecover: true,
              hideDownload: true,
            };
          } else {
            return {
              hideDelete: false,
              hideSave: true,
              hidePrint: true,
              hideCancel: true,
              hideEdit: false,
              hideSuspend: true,
              hideRecover: false,
              hideDownload: true,
            };
          }
        },
      },
    ];
  }

  editItemVendorGridCol() {
    return [
      {
        headerName: 'Vendor Name',
        field: 'vendorName',
        editable: true,
        minWidth: 200,
        cellEditor: 'advSelectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data, //adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: this.commonService.vendorItemList,
            bindLabel: 'vendorName',
            bindValue: 'vendorName',
            placeHolder: 'Select Vendor',
            selectedId: params.data.vendorName,
          };
        },
        cellRenderer: (params) => {
          return params.data.vendorName;
        },
      },
      {
        headerName: 'Vendor Item Code',
        field: 'vendorItemCode',
        editable: true,
        width: 100,
        // headerClass: 'header-text-wrap',
      },
      {
        headerName: 'Action',
        pinned: 'right',
        field: 'actions',
        maxWidth: 80,
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: false,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true
        },
      },
    ];
  }

  storeItemsGridCaseCol() {
    return [
      // { field: 'storeGroup.name', rowGroup: true, hide: true },
      {
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerName: 'Store',
        field: 'storeName',
        cellStyle: { color: '#000' },
        width: 250,
        minWidth: 60
      },
      { headerName: 'POS Code', minWidth: 60, field: 'posCode', hide: true, cellStyle: { color: '#000' } },
      {
        headerName: 'Cost Buy',
        minWidth: 60,
        field: 'buyingCost',
        suppressMenu: true,
        editable: true,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            placeHolder: 'Buy Cost',
            gridtype: 'storeitemgrid',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.buyingCost
          );
        },
      },
      {
        headerName: 'Cost Discount',
        field: 'buyingDiscount',
        minWidth: 60,
        editable: true,
        headerClass: 'header-text-wrap',
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Cost Discount',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.buyingDiscount
          );
        },
      },
      {
        headerName: 'Cost',
        field: 'InventoryValuePrice',
        minWidth: 60,
        editable: true,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Cost',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.InventoryValuePrice
          );
        },
      },
      {
        headerName: 'Sell Price',
        field: 'regularSellPrice',
        minWidth: 60,
        editable: true,
        headerClass: 'header-text-wrap',
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Sell Price',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(
            params.data.regularSellPrice
          );
        },
      },
      {
        headerName: 'Margin',
        field: 'profitMargin',
        minWidth: 60,
        editable: true,
        cellStyle: { color: '#000' },
        cellEditor: 'inputCellRendererComponent',
        cellEditorParams: (params) => {
          return {
            cellHeight: 50,
            gridtype: 'storeitemgrid',
            placeHolder: 'Margin',
          };
        },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      { headerName: 'Profit%', minWidth: 60, field: 'profitMargin', hide: true, cellStyle: { color: '#000' }, },
      {
        headerName: 'Buy down.',
        field: 'buyDown',
        minWidth: 60,
        editable: true,
        headerClass: 'header-text-wrap',
        cellStyle: { color: '#000' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      // {
      //   headerName: 'Rack Allowance',
      //   field: 'rackAllowance',
      //   editable: true,
      //   minWidth: 80,
      //   headerClass: 'header-text-wrap',
      //   cellStyle: { color: '#000' },
      //   cellRenderer: (params) => {
      //     // params.value = params.value ? params.value : 0;
      //     return this.utilityService.formatDecimalCurrency(params.value);
      //   },
      // },
      // { headerName: 'Min Inv.', minWidth: 60, field: 'minInventory', editable: true, cellStyle: { color: '#000' }, },
      // { headerName: 'Max Inv.', minWidth: 60, field: 'maxInventory', editable: true, cellStyle: { color: '#000' }, },
      {
        headerName: 'Current Inv.',
        field: 'currentInventory',
        // headerClass: 'header-text-wrap',
        cellStyle: { color: '#000' },
        editable: true,
        minWidth: 60
      },

      {
        headerName: 'Inv. Date',
        field: 'inventoryAsOfDate',
        cellStyle: { color: '#000' },
        cellRenderer: (params) => {
          // params.data.InventoryAsOfDate = this.utilityService.formatDate(params.value);
          if (params.value) {
            return this.utilityService.formatDate(params.value);
          } else {
            return '';
          }
        },
        minWidth: 60
      },
      {
        headerName: 'Action',
        pinned: 'right',
        maxWidth: 150,
        field: 'actions',
        cellRenderer: 'advCellActionRenderer',
        cellRendererParams: {
          hideDelete: false,
          hideSave: true,
          hidePrint: true,
          hideCancel: true,
          hideEdit: false,
          hideDownload: true,
          hideSuspend: true
        },
      },
    ];
  }

  dateFormat(value) {
    return moment(value).format('MM-DD-YYYY');
  }
  nonEditableCheckBoxCellRenderer = (isChecked: boolean) => {
    if (isChecked) {
      return '<div class="text-center"><i style="font-size: 12px;color: green;" class="fa fa-check-circle"></i></div>';
    } else {
      return '<div class="text-center"><i style="font-size: 18px;" class="fa fa-times-circle"></i></div>';
    }
  }
  mulTypeCellRenderer = (mulType: string) => {
    if (mulType && mulType === 'Pack') {
      return '<div data-toggle="tooltip" title="' + mulType + '" class="fa-p"></div>';
    } else if (mulType && mulType === 'Crtn') {
      return '<div data-toggle="tooltip" title="Carton" class="fa-c"></div>';
    } else {
      return '';
    }
  }
  itemListOverlayGrpGridCol(): any {
    return [
      { headerName: 'Company Price Grp Name', field: 'companyPriceGroupName', cellRenderer: 'agGroupCellRenderer' },
      { headerName: 'UPC Code', field: 'posCodeWithCheckDigit', width: 180 },
      { headerName: 'Description', field: 'description' },
    ];
  }

  dateFormatBySplit(value) {
    if (value !== undefined) {
      let date = value.split("-");
      return date[1] + "-" + date[2] + "-" + date[0];
    } else {
      return "";
    }
  }

  scanDataConfigCol(): any {
    return [
      {
        headerName: 'Store', field: 'storeName', minWidth: 150, suppressMenu: true,
        cellRenderer: 'scanDataStoreNameCellRenderer'
      },
      { headerName: 'Week End Date', field: 'weekendDate', minWidth: 150, suppressMenu: true },
      {
        headerName: 'Sync Status', field: 'syncStatus', minWidth: 150, suppressMenu: true,
        cellStyle: { 'text-align': 'center' },
        cellRenderer: (params: any) => {
          // console.log(params);
          if (params.value) {
            return '<i class="fa fa-check-square-o" aria-hidden="true"></i>';
          } else {
            return '<i class="fa fa-window-close" aria-hidden="true"></i>';
          }
        }
      },
      { headerName: 'Submission Mode', field: 'submitStatus', minWidth: 170, suppressMenu: true },
      {
        headerName: 'Submission Status', field: 'submissionStatus', minWidth: 170, suppressMenu: true,
        // cellStyle: { 'text-align': 'center' },
        cellRenderer: (params: any) => {
          if (params.value === "Failed") {
            return `<div title="${params.data.submissionRemark}">${params.value}</div>`;
          } else {
            return `<div>${params.value}</div>`;
          }
        }
      },
      {
        headerName: 'Submitted By', field: 'userName', minWidth: 140, suppressMenu: true,
        cellStyle: { 'text-align': 'center' }
      },
      {
        headerName: 'Ack Status', field: 'ackStatus', minWidth: 130, suppressMenu: true,
        cellRenderer: 'scanDataAckStatusCellRenderer'
      },
      {
        headerName: 'No of Attempts', field: 'noOfAttempts', minWidth: 150, suppressMenu: true,
        cellStyle: { 'text-align': 'center' },
        cellRenderer: 'scanDataNoOfAtteptsCellRenderer'
      },
      {
        headerName: 'Received On', field: 'receivedOn', minWidth: 150, suppressMenu: true,
        cellRenderer: (params: any) => {
          if (params.value) {
            return `<div>${params.value}</div>`
          }
          return `<div>-</div>`
        }
      },
      // {
      //   headerName: 'Error Count', field: 'errorCount', minWidth: 50, suppressMenu: true,
      //   cellStyle: { 'text-align': 'center' }
      // },
      {
        headerName: 'Actions', field: 'RegularSellPrice', minWidth: 250, suppressMenu: true,
        cellRenderer: 'scanDataActionsCellRenderer'
      }
    ];
  }
  scanDataAcknowledgmentCol(): any {
    return [
      { headerName: 'Store', field: 'storeFullName', minWidth: 150, suppressMenu: true, },
      { headerName: 'Week End Date', field: 'weekendDate', suppressMenu: true },
      { headerName: 'Manufacturer', field: 'manufacturerName', minWidth: 100, suppressMenu: true },
      { headerName: 'Status', field: 'status', suppressMenu: true },
      { headerName: 'No Of Attempts', field: 'noOfAttempt', suppressMenu: true },
      {
        headerName: 'Received Date', field: 'receivedDate', suppressMenu: true,
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      {
        headerName: 'Actions', field: 'scanDataAckowlegmentID', suppressMenu: true,
        cellRenderer: 'CellRenderer',
        cellRendererParams: (params: any) => {
          return {
            showDownload: true,
            hideDeleteAction: true,
            hideEditAction: true
          }
        }
      }
    ];
  }
  ismUpdateCol(): any {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, width: 30, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true, headerClass: 'p-0',
        headerCheckboxSelectionFilteredOnly: true
      },
      { headerName: 'Id', field: 'ISMDetailID', width: 120, suppressMenu: true, headerClass: 'p-0', hide: true },
      { headerName: 'POS Code', field: 'POSCode', width: 100, suppressMenu: true, },
      { headerName: 'Description', field: 'Description', suppressMenu: true, headerClass: 'p-0' },
      { headerName: 'Department', field: 'DepartmentName', suppressMenu: true, headerClass: 'p-0' },
      { headerName: 'Selling Units', field: 'SellingUnits', width: 80, suppressMenu: true, headerClass: 'p-0 header-text-center width_80', cellStyle: { 'text-align': 'center' } },
      {
        headerName: 'Buying Cost', field: 'ActualBuyingCost', width: 80, suppressMenu: true, headerClass: 'p-0 header-text-center width_80', cellStyle: { 'text-align': 'right' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      {
        headerName: 'Sales Price', field: 'ActualSalesPrice', width: 80, suppressMenu: true, headerClass: 'p-0 header-text-center width_80', cellStyle: { 'text-align': 'right' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Sales Quantity', field: 'SalesQuantity', width: 80, suppressMenu: true, headerClass: 'p-0 header-text-center width_80', cellStyle: { 'text-align': 'center' } },
      {
        headerName: 'Sales Amount', field: 'SalesAmount', width: 80, suppressMenu: true, cellStyle: { 'text-align': 'right' },
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }, headerClass: 'p-0 header-text-center width_80'
      }
    ];
  }
  fuelInvoiceGridCol(isHideStore?: boolean) {
    return [
      {
        headerName: '', field: 'itemCheck', width: 25, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      {
        headerName: 'Invoice Date', field: 'invoiceDate', width: 50,
        cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        }
      },
      ... !isHideStore ? [{ headerName: 'Store', field: 'storeName', width: 60 }] : [],
      { headerName: 'Vendor', field: 'vendorName', width: 60 },
      {
        headerName: 'Invoice Amount', field: 'invocieAmount', width: 60, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        }
      },
      { headerName: 'Total Gallon', field: 'totalQuantityReceived', width: 50 },
      { headerName: 'Invoice No.', field: 'invoiceNo', width: 50 },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'fuelInvoiceActionsCellRenderer', colId: 'params',
        width: 60, suppressSorting: false
      }
    ];
  }
  invoicesDetailsGridCol() {
    return [
      {
        headerName: '', field: 'itemCheck', width: 20, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true
      },
      {
        headerName: 'Store', field: 'storeName', width: 60
      },
      {
        headerName: 'Invoice No.', field: 'invoiceNo', width: 80
      },
      {
        headerName: 'Details', field: 'invoiceID', minWidth: 110,
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'vendorInvoiceCellRenderer'
            };
          } else return null;
        }
      },
      {
        headerName: 'Date', field: 'invoiceDate', width: 60,
        cellRenderer: (params) => {
          return this.utilityService.formatDate(params.value);
        },
      },
      {
        headerName: 'Status', field: 'invoiceStatusDescription', width: 65,
        cellRenderer: (params: any) => {
          if (params.data && params.data.invoiceStatusID === 5) return '<div class="badge badge-success fs-12">' + params.value + '</div>';
          else return params.value;
        }
      },
      {
        headerName: 'Action', field: 'action', colId: 'params', width: 60, suppressSorting: false,
        cellRendererSelector: params => {
          if (params.data) {
            return {
              component: 'vendorInvoiceActionsCellRenderer'
            };
          } else return null;
        }
      },
    ];
  }
  buyDownGridCol() {
    return [
      {
        headerName: 'Store Location', field: 'storeLocationID', cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          cellfieldId: 'storeLocationID',
          textfield: 'storeName'
        }
      },
      {
        headerName: 'Manufacturer', field: 'manufacturerID', cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          cellfieldId: 'manufacturerID',
          textfield: 'manufacturerName'
        }
      },
      {
        headerName: 'Schedule', field: 'manufacturerBuydownScheduleID', cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          cellfieldId: 'manufacturerBuydownScheduleID',
          textfield: 'manufacturerBuydownScheduleName'
        }
      },
      {
        headerName: 'Item List', field: 'itemListId', cellRenderer: 'childSelectRenderer',
        cellRendererParams: {
          cellfieldId: 'itemListId',
          textfield: 'description'
        }
      },

      {
        headerName: 'Buy Down', field: 'buyDownAmt', cellRenderer: 'childInputRenderer',
        cellRendererParams: {
          cellfieldId: 'buyDownAmt',
          textfield: 'buyDownAmt',
          maxLength: '5',
        }
      },
      {
        headerName: 'Actions', field: 'value', filter: false, suppressSorting: false,
        suppressSizeToFit: true, width: 110,
        cellRendererFramework: SaveButtonParentComponent,
      }
    ];
  }

  buyDownStoreDetailsGrid() {
    return [
      {
        headerName: 'Store Location',
        field: 'storeName', suppressMenu: true
      },
      {
        headerName: 'Schedule', field: 'manufacturerBuydownScheduleID', suppressMenu: true, editable: true, headerClass: 'header-text-center',
        cellEditor: 'dateTimeSelectMenuCellRenderer',
        cellClass: 'text-center',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 50,
            selectionList: params.data.manufacturerBuydownScheduleList,
            bindLabel: "manufacturerBuydownScheduleName",
            bindValue: "manufacturerBuydownScheduleID",
            placeHolder: "Select Range",
            selectedId: params.data.manufacturerBuydownScheduleID,
            showRangePicker: true
          };
        },
        cellRenderer: (params) => {
          if (params.data.startDate && params.data.endDate) {
            return moment(params.data.startDate).format('MM/DD/YYYY') + " - " + moment(params.data.endDate).format('MM/DD/YYYY');
          } else return "";
        }
      },
      // {
      //   headerName: 'Start Date', field: 'startDate', suppressMenu: true, editable: true,
      //   cellEditor: 'inputDateCellRenderer',
      //   cellRenderer: (params) => {
      //     if (params.data.MixMatchStoreLocationID === null)
      //       return null;
      //     else
      //       return this.utilityService.formatDate(params.value);
      //   },
      //   cellEditorParams: {
      //     placeHolder: "Start Date",
      //     minDate: new Date()
      //   },
      //   cellClass: 'text-center',
      //   headerClass: 'justify-content-center'
      // },
      // {
      //   headerName: 'End Date', field: 'endDate', suppressMenu: true, editable: true,
      //   cellEditor: 'inputDateCellRenderer',
      //   cellRenderer: (params) => {
      //     if (params.data.MixMatchStoreLocationID === null)
      //       return null;
      //     else
      //       return this.utilityService.formatDate(params.value);
      //   },
      //   cellEditorParams: {
      //     placeHolder: "End Date",
      //     minDate: new Date()
      //   },
      //   cellClass: 'text-center',
      //   headerClass: 'justify-content-center'
      // },
      {
        headerName: 'Buy Down Amount', field: 'buyDownAmt', suppressMenu: true, editable: true, cellEditor: 'decimalWithDollarEditor', headerClass: 'header-text-center',
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
        cellEditorParams: (params) => {
          return {
            data: params.data,
            gridtype: this.constantService.gridTypes.buyDownStoreDetailsGrid
          }
        },
        cellClass: 'text-center'
      },
      {
        headerName: 'Actions', field: 'value', filter: false, suppressSorting: false,
        suppressSizeToFit: true,
        cellRendererFramework: SaveButtonParentComponent,
      }
    ];
  }

  priceGroupBuyDownGrid() {
    return [
      { headerName: 'UPC Code', field: 'upcCode', minWidth: 200, width: 200, headerClass: 'header-text-center' },
      { headerName: 'Description', field: 'description', minWidth: 350, width: 350, headerClass: 'header-text-center' },
      { headerName: 'Department Description', field: 'departmentDescription', minWidth: 200, width: 200, headerClass: 'header-text-center' }
    ];
  }

  editBillofLadingGridCol() {
    return [
      { headerName: 'Store', field: 'StoreName' },
      { headerName: 'Vendor', field: 'VendorName' },
      { headerName: 'BOL Number', field: 'BOLNumber' },
      {
        headerName: 'Business Date', field: 'BusinessDate',
        cellRenderer: (params: any) => this.dateFormat(params.value)
      },
      // {
      //   headerName: 'Invoice Amount', field: 'invoiceAmount', editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
      //     return this.utilityService.formatDecimalCurrency(params.value);
      //   }
      // },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'billOfLadingActionsCellRenderer', colId: 'params',
        width: 150, suppressSorting: false
      }
    ];
  }

  itemHistoryReportGridCol() {
    return [
      {
        headerName: 'Date Time', field: 'date', editable: false, width: 200, minWidth: 200, cellClass: 'text-center', cellRenderer: (params) => {
          return moment(params.data.date).format('MM-DD-YYYY HH:mm');
        }
      },
      { headerName: 'Change In', field: 'changeIn', width: 200, minWidth: 200, editable: false, cellClass: 'text-center' },
      { headerName: 'OLD Value', field: 'from', width: 200, minWidth: 200, editable: false, cellClass: 'text-center' },
      { headerName: 'NEW Value', field: 'to', width: 200, minWidth: 200, editable: false, cellClass: 'text-center' },
      { headerName: 'Change By', field: 'modifiedBy', width: 200, minWidth: 200, editable: false, cellClass: 'text-center' }
    ];
  }

  itemHistoryByStoreGridCol() {
    return [
      {
        headerName: 'Date', field: 'transactionDate', width: 200, minWidth: 200, editable: false, suppressMenu: true, cellClass: 'text-center', cellRenderer: (params) => {
          return moment(params.data.transactionDate).format('MM-DD-YYYY');
        }
      },
      {
        headerName: 'Sales', field: 'sales', width: 200, minWidth: 200, editable: false, suppressMenu: true, cellClass: 'text-center', cellRenderer: (params) => {
          return params.data.sales ? params.data.sales.toString().replaceAll('-', '') : '';
        }
      },
      {
        headerName: 'Purchase', field: 'purchases', width: 200, minWidth: 200, editable: false, suppressMenu: true, cellClass: 'text-center', cellRenderer: (params) => {
          return params.data.purchases === 0 ? '-' : params.data.purchases;
        }
      },
      {
        headerName: 'Adjustments', field: 'stockAdjustment', width: 200, minWidth: 200, editable: false, suppressMenu: true, cellClass: 'text-center', cellRenderer: (params) => {
          if (params.data && params.data.adjustments) {
            return params.data.adjustments + "(" + params.data.stocktransactionTypeName + ")";
          } else
            return params.data.stockAdjustment ? params.data.stockAdjustment : '-';
        }
      },
      { headerName: 'Current Inventory', field: 'currentInventory', width: 200, minWidth: 200, editable: false, suppressMenu: true, cellClass: 'text-center' }
    ];
  }

  purchaseHistoryGridCol() {
    return [
      {
        headerName: 'Date', field: 'InvoiceDate', editable: false, cellClass: 'text-center', width: 200, cellRenderer: (params) => {
          return moment(params.data.InvoiceDate).format('MM-DD-YYYY');
        }
      },
      {
        headerName: 'Vendor', field: 'VendorName', editable: false, cellClass: 'text-center', maxWidth: 250,
      },
      { headerName: 'Qty', field: 'Qty', editable: false, cellClass: 'text-center', minWidth: 170 },
      {
        headerName: 'Case Cost', field: 'CasePrice', editable: false, cellClass: 'text-center', maxWidth: 140, cellRenderer: (params) => {
          if (params.data.CasePrice) {
            let casePrice = params.data.CasePrice;
            return '$' + casePrice.toFixed(2);
          } else return '$' + 0;
        }
      },
      { headerName: 'Units In Case', field: 'UnitsInCase', editable: false, cellClass: 'text-center', width: 240 },
      {
        headerName: 'Unit Cost', field: 'UnitCost', editable: false, cellClass: 'text-center', cellRenderer: (params) => {
          if (params.data.CasePrice && params.data.UnitsInCase) {
            let unitCost = params.data.CasePrice / params.data.UnitsInCase;
            return '$' + unitCost.toFixed(2);
          } else return '$' + 0;
        }
      },
      {
        headerName: 'Actions', field: 'params', editable: false, cellRenderer: 'CellRenderer',
        cellRendererParams: {
          hideEditAction: true, isSaveRequired: false, hideDeleteAction: true, showDetails: true
        }
      }
    ];
  }

  purchaseHistoryCartonGridCol() {
    return [
      {
        headerName: 'Date', field: 'InvoiceDate', editable: false, cellClass: 'text-center', suppressMenu: true, width: 200, cellRenderer: (params) => {
          return moment(params.data.TransactionDate).format('MM-DD-YYYY');
        }
      },
      {
        headerName: 'Vendor', field: 'VendorName', editable: false, cellClass: 'text-center', suppressMenu: true, minWidth: 170
      },
      {
        headerName: 'Description', field: 'PurchasedDesc', editable: false, cellClass: 'text-center', suppressMenu: true, minWidth: 170
      },
      { headerName: 'Qty', field: 'CartonQty', editable: false, cellClass: 'text-center', suppressMenu: true, width: 140 },
      {
        headerName: 'Case Cost', field: 'CasePrice', editable: false, cellClass: 'text-center', suppressMenu: true, cellRenderer: (params) => {
          if (params.data.CasePrice) {
            let casePrice = params.data.CasePrice;
            return '$' + casePrice.toFixed(2);
          } else return '$' + 0;
        }
      },
      { headerName: 'Units In Case', field: 'UnitsInCase', editable: false, cellClass: 'text-center', suppressMenu: true, width: 240 },
      {
        headerName: 'Unit Cost', field: 'UnitCost', editable: false, cellClass: 'text-center', suppressMenu: true, cellRenderer: (params) => {
          if (params.data.CasePrice && params.data.UnitsInCase) {
            let unitCost = params.data.CasePrice / params.data.UnitsInCase;
            return '$' + unitCost.toFixed(2);
          } else return '$' + 0;
        }
      },
      {
        headerName: 'Actions', field: 'params', editable: false, suppressMenu: true, cellRenderer: 'CellRenderer',
        cellRendererParams: {
          hideEditAction: true, isSaveRequired: false, hideDeleteAction: true, showDetails: true
        }
      }
    ];
  }

  fuelTaxGridCol() {
    return [
      { headerName: 'Fuel Tax Description', field: 'description', editable: true },
      {
        headerName: 'Fuel Tax', field: 'isPercent', editable: true,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 30,
            selectionList: this.commonService.fuelTaxList,
            bindLabel: "text",
            bindValue: "text",
            placeHolder: "Select Fuel Tax",
            selectedId: params.data.isPercent
          };
        },
        cellRenderer: (params) => {
          return params.data.isPercent;
        }
      },
      {
        headerName: 'Tax On Tax', field: 'linkFuelTaxID', editable: true,
        cellEditor: 'selectMenuCellRenderer',
        cellEditorParams: (params) => {
          let filteredFuelSales = this.commonService.fuelSalesTaxesList.filter(item => item.fuelTaxId !== params.data.fuelTaxId);
          return {
            data: params.data,//adding this as if we use arrow function data is missing in the cell renderer
            cellHeight: 30,
            selectionList: filteredFuelSales,
            bindLabel: "description",
            bindValue: "fuelTaxId",
            placeHolder: "Select Fuel Tax",
            selectedId: params.data.linkFuelTaxID
          };
        },
        cellRenderer: (params) => {
          let filteredFuelSales = this.commonService.fuelSalesTaxesList.filter(item => item.fuelTaxId === params.data.linkFuelTaxID);
          if (filteredFuelSales.length > 0) return filteredFuelSales[0].description;
          else return "";
        },
      },
      {
        headerName: 'Fuel Tax Rate', field: 'fuelTaxRate', editable: true, cellRenderer: (params) => {
          return this.getFuelTaxRateFormatter(params.data);
        },
        cellEditor: 'sixDecimalNumericEditor'
      },
      /*  {
         headerName: 'State Tax', field: 'stateTax', editable: true, cellRenderer: (params) => {
           return this.utilityService.formatDecimalCurrencyFuel(params.value);
         }
       }, */
      // { headerName: 'Tax Calculation Method', editable: true, field: '' },
      // {
      //   headerName: 'Tax to all Fuel Grade', field: 'isApplyPrice', cellRenderer: 'CheckboxCellRenderer',
      // },

      {
        headerName: 'Actions', field: 'action', colId: 'params', suppressMenu: true, editable: false,
        cellRendererFramework: SaveButtonComponent,
        width: 110, cellRendererParams: (params) => {
          params.context.componentParent.isCancel = false;
          if (params.data.fuelTaxId === null) {
            params.data.isCancel = false;
          } else params.data.isCancel = true;
          return {
            data: params.data
          };
        }
      }
    ];
  }

  getFuelTaxRateFormatter(rowData) {
    if (!isNullOrUndefined(rowData.fuelTaxRate)) {
      rowData.fuelTaxRate = Number(rowData.fuelTaxRate).toFixed(6);
    }
    if (!isNullOrUndefined(rowData.isPercent)) {
      let isPercent = this.commonService.fuelTaxList.find(row => row.text == rowData.isPercent);
      let formattedData = isPercent.value ? this.utilityService.formatpercentage(rowData.fuelTaxRate) : this.utilityService.formatCurrency(rowData.fuelTaxRate);
      return formattedData;
    }
  }

  masterPriceBookWizardGrid() {
    return [
      {
        headerName: '', field: 'itemCheck', suppressSizeToFit: true, minWidth: 40, width: 40, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true, headerClass: 'p-0',
        headerCheckboxSelectionFilteredOnly: true
      },
      { headerName: 'UPC', field: 'upcCode', minWidth: 250, width: 250, editable: false },
      { headerName: 'Description', field: 'description', minWidth: 350, width: 350, editable: false },
      { headerName: 'UOM', field: 'uomDescription', minWidth: 200, width: 200, editable: false },
      { headerName: 'Units In Case', field: 'unitsInCase', minWidth: 200, width: 200, editable: false }
    ];
  }

  priceGroupMasterAllItemGrid() {
    return [
      { headerName: 'UPC', field: 'upcCode', minWidth: 250, width: 250, editable: false },
      { headerName: 'Description', field: 'description', minWidth: 350, width: 350, editable: false },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', minWidth: 140, width: 140, colId: 'params',
        cellRendererParams: { hideEditAction: true, isSaveRequired: false, hideDeleteAction: false },
      }
    ];
  }

  invoiceDashboardGridCol(): any {
    return [
      { headerName: 'Store', field: 'StoreName', suppressMenu: true, },
      { headerName: 'Archived', field: 'ArchivedCount', suppressMenu: true, cellClass: 'text-center', minWidth: 120 },
      { headerName: 'InProgress', field: 'InProgressCount', suppressMenu: true, cellClass: 'text-center', minWidth: 140 },
      { headerName: 'Completed', field: 'CompletedCount', suppressMenu: true, cellClass: 'text-center', minWidth: 140 },
      { headerName: 'New', field: 'NewCount', suppressMenu: true, cellClass: 'text-center', width: 120 },
      { headerName: 'Ready For Review', field: 'ReadyForReviewCount', suppressMenu: true, minWidth: 170, cellClass: 'text-center' },
      { headerName: 'Uploaded To POS', field: 'UploadedToPOSCount', suppressMenu: true, minWidth: 180, cellClass: 'text-center' }
    ];
  }

  invoiceByStoreGridCol(): any {
    return [
      { headerName: 'Store', field: 'StoreName', suppressMenu: true },
      { headerName: 'New', field: 'New', suppressMenu: true },
      { headerName: 'In Progress', field: 'InProgress', suppressMenu: true },
      { headerName: 'Ready For Review', field: 'ReadyForReview', suppressMenu: true },
      { headerName: 'Completed', field: 'Completed', suppressMenu: true }
    ];
  }

  invoiceByUserGridCol(): any {
    return [
      { headerName: 'Name', field: 'fullName', suppressMenu: true },
      { headerName: 'User Name', field: 'UserName', suppressMenu: true },
      { headerName: 'Assigned', field: 'Assigned', suppressMenu: true },
      { headerName: 'In Progress', field: 'InProgress', suppressMenu: true },
      { headerName: 'Ready For Review', field: 'ReadyForReview', suppressMenu: true },
      { headerName: 'Completed', field: 'Completed', suppressMenu: true },
      { headerName: 'On Hold', field: 'OnHold', suppressMenu: true }
    ];
  }

  masterManufacturerGridCol() {
    return [
      {
        headerName: 'Manufacturer', field: 'manufacturerName', minWidth: 100, width: 250, headerClass: 'header-text-center'
      },
      {
        headerName: 'Primary Website', field: 'primaryWebsite', minWidth: 100, width: 230, headerClass: 'header-text-center'
      },
      {
        headerName: 'Action', field: 'action',
        colId: 'params', minWidth: 50, width: 50, suppressSorting: true,
        cellRenderer: 'CellRenderer',
        cellRendererParams: (params: any) => {
          return {
            showDownload: false,
            hideDeleteAction: false,
            hideEditAction: false,
            gridType: this.constantService.gridTypes.masterManufacturerGrid
          }
        }
      }
    ];
  }

  masterBrandGridCol() {
    return [
      { headerName: 'Manufacturer', field: 'manufacturerName', minWidth: 150, width: 230, rowGroup: true, hide: true, headerClass: 'header-text-center' },
      { headerName: 'Brand Name', field: 'brandName', minWidth: 100, width: 250, headerClass: 'header-text-center' },
      {
        headerName: 'Action', field: 'action', cellRenderer: 'CellRenderer', width: 107, colId: 'params',
        cellRendererParams: {
          hideEditAction: true, isSaveRequired: false, hideDeleteAction: false, showEditActionForGrouping: true,
          gridType: this.constantService.gridTypes.masterBrandGrid
        }, suppressSorting: true
      }
    ];
  }
}
