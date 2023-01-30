import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { PositiveNumericEditor } from '@shared/component/editable-grid/partials/numeric-editor.component';
import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';
import { UtilityService } from '@shared/services/utility/utility.service';
import { StoreService } from '@shared/services/store/store.service';
import { EditButtonRendererComponent } from '@shared/component/pagination-grid/partials/edit-button-renderer.component';

@Component({
  selector: 'app-price-group1',
  templateUrl: './price-group1.component.html',
  styleUrls: ['./price-group1.component.scss']
})
export class PriceGroup1Component implements OnInit {

  constructor(private constantService: ConstantService, private toastr: ToastrService,
    private spinner: NgxSpinnerService, private setupService: SetupService, private utilityService: UtilityService, private storeService: StoreService) {
    // this.editableGridOptions = this.editableGrid.getGridOption(this.constantService.editableGridConfig.gridTypes.priceGroup1);
    this.gridOptions = <GridOptions>{
      context: {
        componentParent: this
      },
      overlayLoadingTemplate: ''
    };
    this.rowSelection = "multiple";
    this.getRowHeight = function (params) {
      return 30;
    };
    this.headerHeight = 40;
    this.paginationPageSize = 15;
    this.editType = "fullRow";
    this.frameworkComponents = {
      numericEditor: PositiveNumericEditor,
      editButtonRendererComponent: EditButtonRendererComponent
    };
    this.columnDefs = [
      {
        headerName: '', field: 'groupIDD', suppressSizeToFit: true, width: 45, checkboxSelection: true,
        suppressMenu: true, suppressSorting: true, headerCheckboxSelection: true,
      },
      { field: "groupDescription", headerName: "Group Name", width: 300, },
      // { headerName: "Store Name", field: "storeName", width: 90, editable: true },
      {
        headerName: 'Buying Cost', field: 'buyingCost', suppressSizeToFit: true,cellStyle: { 'text-align': 'right' },  headerClass: 'header-text-center',  cellEditor: 'numericEditor', minWidth: 250, width: 250, editable: function (params) {
          return params.data.isEdit;
        }, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      {
        headerName: 'Selling Price', field: 'sellingPrice',cellStyle: { 'text-align': 'right' }, headerClass: 'header-text-right', suppressSizeToFit: true, cellEditor: 'numericEditor', minWidth: 250, width: 250, editable: function (params) {
          return params.data.isEdit;
        }, cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(params.value);
        },
      },
      {
        headerName: 'Item Count', field: 'itemCount', minWidth: 80, suppressSizeToFit: true, cellStyle: { 'text-align': 'center' }, headerClass: 'header-text-center',width: 150, cellRenderer: (params) => {
          return '<a class="item-count-link">' + params.value + '</a>';
        }
      },
      {
        headerName: 'Actions', field: 'value', colId: 'params', minWidth: 90, suppressSizeToFit: true, width: 150, cellRenderer: 'editButtonRendererComponent',
      }
    ];
    this.subContColumnDefs = [
      { field: "posCode", headerName: "UPC Code", width: 140, },
      { field: "itemDescription", headerName: "Description", },
      {
        field: "inventoryValuePrice", headerName: "Cost", width: 100,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
        }
      },
      {
        field: "regularSellPrice", headerName: "Selling Price", width: 140,
        cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrency(this.utilityService.formatDecimalDigit(params.value));
        }
      },
    ];
    this.userInfo = this.constantService.getUserInfo();
  }

  ngOnInit() {
    this.storeLocationIdBulkUpdate.push(Number(sessionStorage.getItem('selectedStoreLocationId')));
    this.storeLocationId = Number(sessionStorage.getItem('selectedStoreLocationId'));
    this.getStoreLocationList();
    this.getPriceGroupData();
    this.bulkUpdate = false;
  }

  gridApi: any;
  filterText: string;
  getRowHeight: any;
  headerHeight: any;
  gridOptions: any;
  gridColumnApi: any;
  columnDefs: any;
  groupDefaultExpanded: any;
  autoGroupColumnDef: any;
  defaultColDef: any;
  rowData: any
  frameworkComponents: any;
  paginationPageSize: any;
  rowSelection: any;
  editType: any;
  //overlay
  showOverlayPanel: any = false;

  subContColumnDefs: any;
  subContRowData: any;
  storeLocationId: any;
  storeLocationIdBulkUpdate: any = [];
  storeLocationList: any = [];
  userInfo: any;
  bulkUpdate: any;
  buyingPrice: any;
  sellingPrice: any;

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = [...this.storeService.storeLocation];
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.storeLocationList = [...this.storeService.storeLocation];
      }, (error) => {
        console.log(error);
      });
    }
  }

  getPriceGroupData() {
    // let selectedStoreLocationId = sessionStorage.getItem('selectedStoreLocationId');
    if (this.storeLocationId) {
      this.spinner.show();
      this.setupService.getData('StorePriceGroup/GetStorePriceGroupsByStoreLocation/' + this.storeLocationId)
        .subscribe((response) => {
          this.rowData = response;
          if (response && response.length > 0) {
            let orderedArray = _.sortBy(response, o => o.groupDescription);
            this.rowData = orderedArray;
          }
          _.each(response, (rowData) => {
            rowData.isEdit = false;
          });
          this.spinner.hide();
        }, (error) => {
          console.log(error);
        });
    }
    else {
      this.rowData = [];
    }
  }
  onRowEditingStopped(event) {
    event.node.data.isEdit = false;
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }


  onModelUpdated($event) {
    if (this.gridApi && this.gridApi.rowModel.rowsToDisplay.length == 0) {
      this.gridApi.showNoRowsOverlay();
    }
    if (this.gridApi && this.gridApi.rowModel.rowsToDisplay.length > 0) {
      this.gridApi.hideOverlay();
    }
  }


  onPageSizeChanged(newPageSize?) {
    let pageSize: any = document.getElementById("page-size");
    var value: any = pageSize.value;
    this.gridApi.paginationSetPageSize(Number(value));
  }

  onCellClicked(params) {
    if (params.colDef && params.colDef.field === "itemCount") {
      this.showOverlayPanel = true;
      this.openSideContainer(params);
    }
  }

  Edit(event) {
    let rowNode = this.gridApi.getRowNode(event.node.id);
    rowNode.data.isEdit = true;
    this.gridApi.redrawRows()
    setTimeout(() => {
      this.gridApi.setFocusedCell(event.rowIndex, 'buyingCost');
      this.gridApi.startEditingCell({
        rowIndex: event.rowIndex,
        colKey: 'buyingCost',
      });
    }, 100);
  }

  Cancel(event) {
    event.node.data.isEdit = false;
    this.gridApi.redrawRows();
  }

  sideContainer: any = "side-container-close";
  openSideContainer(params) {
    this.spinner.show();
    this.setupService.getData('StoreLocationItem/getStoreLocationItemByStoreLocationAndGroupID/' + params.data.storeLocationID + '/' + params.data.groupID).subscribe((response) => {
      if (response) {
        this.subContRowData = [];
        this.subContRowData = response;
        document.getElementById("overlay").style.display = "block";
        this.sideContainer = 'side-container-open';
        this.spinner.hide();
        return;
      }
    }, (error) => {
      console.log(error);
    });
  }

  closeSideContainer() {
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
  }

  onChange($event) {
    if ($event.target.attributes) {
      let i = $event.target.parentElement.parentElement.parentElement.attributes["row-index"].value;
      let valuefield = $event.target.parentElement.parentElement.attributes["col-id"].value;
      let value = $event.target.value;
      this.gridApi.getRowNode(i).data[valuefield] = value;
    }
  }

  onBtStopEditing(params) {
    if (params.data.sellingPrice === null || params.data.sellingPrice === 0) {
      this.toastr.error("Selling Price Should Be Greater Than Zero", this.constantService.infoMessages.error);
      return;
    }
    this.spinner.show();
    if (params.data.buyingCost === null) params.data.buyingCost = 0;
    this.setupService.updateData('StorePriceGroup/update/' + params.data.storeLocationID + '/' + params.data.groupID + '/' + params.data.sellingPrice + '/' + params.data.buyingCost, {}).subscribe(
      (res) => {
        this.spinner.hide();
        if (res === '1') {
          params.data.isEdit = false;
          this.gridApi.redrawRows();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide()
        console.log(error);
      }
    );
  }

  onRowSelected(event) {
    let selectedNodes = this.gridApi.getSelectedNodes();
    let selectedData = selectedNodes.map(node => node.data);
    if (selectedData.length > 0) {
      this.bulkUpdate = true;
    } else {
      this.bulkUpdate = false;
    }
  }

  updateMulti() {
    // if (!this.buyingPrice) {
    //   this.toastr.error("Buying Cost Required", this.constantService.infoMessages.error);
    //   return;
    // }
    if (!this.sellingPrice) {
      this.toastr.error("Selling Price Required", this.constantService.infoMessages.error);
      return;
    }
    this.spinner.show();
    let groupIDS = this.gridApi.getSelectedNodes().map(node => node.data.groupID).toString();
    let request = {
      "storeLocationID": this.storeLocationIdBulkUpdate.toString(),
      "itemPricegroupID": groupIDS,
      "sellingPrice": this.sellingPrice,
      "buyingCost": this.buyingPrice
    }
    this.setupService.postData('StorePriceGroup/BulkupdateStorePriceGroup', request).
      subscribe((response) => {
        this.spinner.hide();
        if (response && response === "1") {
          this.toastr.success("Update Success", this.constantService.infoMessages.success);
          this.getPriceGroupData();
          this.bulkUpdate = false;
          this.buyingPrice = null;
          this.sellingPrice = null;
        } else {
          this.toastr.error("Update Failed", this.constantService.infoMessages.error);
        }
      },
        (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.contactAdmin);
        });
  }
}