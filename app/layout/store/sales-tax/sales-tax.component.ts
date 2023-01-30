import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SalesTax } from '../../models/sales-tax.model';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
import { isNullOrUndefined } from 'util';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';

@Component({
  selector: 'app-sales-tax',
  templateUrl: './sales-tax.component.html',
  styleUrls: ['./sales-tax.component.scss'],
  animations: [routerTransition()]
})
export class SalesTaxComponent implements OnInit {
  @ViewChild('posTaxStrategyID') _posTaxStrategyID: any;
  rowData: SalesTax[];
  fuelTaxRowData: any[];
  gridOptions: GridOptions;
  FuelTaxGridOptions: any;
  fuelTaxGridApi: any;

  isEdit = false;
  isFuelTaxEdit = false;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();

  salesTax = new SalesTax();
  private gridApi;
  selectedRow: any;
  initialFormValues: SalesTax;
  fuelTaxInitialFormValues: any;
  tempId: any;
  newRowAdded: any;
  addrow: any;
  tempIdFuelTax: any;
  newRowAddedFuelTax: any;
  addrowFuelTax: any;
  fuelTaxList = [
    { text: "Fixed Amount", value: false },
    { text: "Is Percentage", value: true }
  ];
  constructor(private constants: ConstantService,
    private dataService: SetupService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private editableGrid: EditableGridService,
    private commonService: CommonService, private gridService: PaginationGridService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constants.editableGridConfig.gridTypes.salesTaxGrid);
    this.FuelTaxGridOptions = this.gridService.getGridOption(this.constants.gridTypes.fuelTaxGrid);
    this.commonService.fuelTaxList = this.fuelTaxList;
  }

  ngOnInit() {
    this.fetchSalesTaxData();
    this.GetFuelTaxByStoreLocationID();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  onFuelTaxGridReady(params) {
    this.fuelTaxGridApi = params.api;
    this.fuelTaxGridApi.sizeColumnsToFit();
  }
  fetchSalesTaxData() {
    this.dataService.getData(`StoreLocationTax/getByLocationId/${this.storeLocationID}`).
      subscribe((response: SalesTax[]) => {
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      });
  }
  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId, isSaveRequired: true, cityTax: 0, countyTax: 0,
      posTaxStrategyID: '', stateTax: 0, storeLocationID: 0, storeLocationTaxID: 0,
      taxStrategyDescription: ''
    };
    return newData;
  }
  addNew() {
    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('taxStrategyDescription', 0);
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    // this.addrow = this.addrow + 1;
    this.getRowData();
    this.getStartEditingCell('taxStrategyDescription', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  reset() {
    this.addNew();
  }

  editOrSave(params, isEdit: boolean) {
    this.isEdit = isEdit;
    if (params.data.posTaxStrategyID === '' || params.data.posTaxStrategyID === null) {
      this.toastr.error(' POS Tax ID is required');
      this.getStartEditingCell('posTaxStrategyID', params.rowIndex);
      return;
    }
    if (params.data.taxStrategyDescription === '' || params.data.taxStrategyDescription === null) {
      this.toastr.error('Tax Name is required');
      this.getStartEditingCell('taxStrategyDescription', params.rowIndex);
      return;
    }
    const salesTax = this.rowData && this.rowData.filter(title => {
      if (this.isEdit) {
        return title.posTaxStrategyID === Number(params.data.posTaxStrategyID)
          && title.storeLocationTaxID !== Number(params.data.storeLocationTaxID);
      } else {
        return title.posTaxStrategyID === Number(params.data.posTaxStrategyID);
      }
    });
    if (salesTax[0]) {
      this.toastr.error('POS Tax ID aleady exists..!');
      this.getStartEditingCell('posTaxStrategyID', params.rowIndex);
      return;
    }
    if (this.isEdit) {
      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID,
        cityTax: params.data.cityTax,
        countyTax: params.data.countyTax,
        posTaxStrategyID: params.data.posTaxStrategyID,
        salesTax: params.data.salesTax,
        stateTax: params.data.stateTax,
      };
      this.spinner.show();
      this.dataService.updateData('StoreLocationTax/Update', postData).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            return;
          }
          if (response === '1') {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.newRowAdded = false;
            this.fetchSalesTaxData();
          } else {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        });
    } else {
      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID,
        cityTax: params.data.cityTax,
        countyTax: params.data.countyTax,
        posTaxStrategyID: params.data.posTaxStrategyID,
        salesTax: params.data.salesTax,
        stateTax: params.data.stateTax,
      };
      this.spinner.show();
      this.dataService.postData('StoreLocationTax/AddNew', postData).
        subscribe((response) => {
          this.spinner.hide();
          let errorMessage = '';
          if (response && response['statusCode']) {
            if (response.statusCode === 400) {
              response.result.validationErrors.forEach(vError => {
                errorMessage += vError.errorMessage;
              });
              this.toastr.warning(errorMessage, 'warning');
              return;
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
              return;
            }

          }
          if (response && response.storeLocationTaxID) {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.newRowAdded = false;
            this.fetchSalesTaxData();

          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        });
    }

  }
  getRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.gridApi && this.gridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.rowData = arr;
  }
  deleteAction(params: { data: SalesTax; }) {
    if (params.data.storeLocationTaxID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getRowData();
      return;
    } else {
      this.spinner.show();
      this.dataService.deleteData(`StoreLocationTax/${params.data.storeLocationTaxID}`).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response === '1') {
            this.newRowAdded = false;
            this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
            this.fetchSalesTaxData();
          } else {
            this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        });
    }
  }
  // setNumericValue(formControl) {
  //   if (formControl === 'posTaxStrategyID') {
  //     this.salesTaxForm.get('posTaxStrategyID').setValue(Number(this.salesTaxForm.value.posTaxStrategyID));
  //   }
  //   if (formControl === 'stateTax') {
  //     this.salesTaxForm.get('stateTax').setValue(Number(this.salesTaxForm.value.stateTax));
  //   }
  //   if (formControl === 'countyTax') {
  //     this.salesTaxForm.get('countyTax').setValue(Number(this.salesTaxForm.value.countyTax));
  //   }
  //   if (formControl === 'cityTax') {
  //     this.salesTaxForm.get('cityTax').setValue(Number(this.salesTaxForm.value.cityTax));
  //   }
  // }
  backToMainList() {
    this.backToStoreList.emit(false);
  }
  GetFuelTaxByStoreLocationID() {
    this.dataService.getData(`FuelTax/GetFuelTaxByStoreLocationID/${this.storeLocationID}`).
      subscribe((response) => {
        if (response && response['statusCode']) {
          this.fuelTaxRowData = [];
          return;
        }
        response.forEach(element => {
          let isPercentObj = this.fuelTaxList.find(ele => ele.value == element.isPercent);
          element.isPercent = isPercentObj.text;
        });
        this.commonService.fuelSalesTaxesList = response;
        this.fuelTaxGridApi.setRowData(response);
        this.fuelTaxRowData = response;
      });
  }

  getRowDataFuelTax() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.fuelTaxGridApi && this.fuelTaxGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.fuelTaxRowData = arr;
  }
  deleteFuelTaxAction(rowIndex) {
    let rowNode = this.fuelTaxGridApi.getRowNode(rowIndex);
    if (rowNode.data.storeFuelGradeTaxID === 0) {
      this.fuelTaxGridApi.updateRowData({ remove: [rowNode.data] });
      this.newRowAddedFuelTax = false;
      this.getRowDataFuelTax();
      return;
    } else {

      this.spinner.show();
      this.dataService.deleteData(`FuelTax/` + rowNode.data.fuelTaxId).
        subscribe((response) => {
          this.spinner.hide();
          if (response === '1') {
            this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
            this.newRowAddedFuelTax = false;
            this.GetFuelTaxByStoreLocationID();
          } else {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        });
    }
  }

  createNewRowDataFuelTax() {
    this.tempIdFuelTax = this.fuelTaxGridApi.getDisplayedRowCount();
    const newData = {
      fuelTaxId: null,
      isSaveRequired: true,
      description: '',
      fuelTaxRate: null,
      isPercent: undefined,
      storeLocation: 0,
      isEdit: true,
      isNewRow: true
    };
    return newData;
  }

  addNewFuelTax(isAdd) {
    this.fuelTaxGridApi.stopEditing();
    if (this.newRowAddedFuelTax) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCellFuelTax('description', 0);
      return;
    }
    this.newRowAddedFuelTax = true;
    const newItem = this.createNewRowDataFuelTax();
    this.fuelTaxGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    // this.addrowFuelTax = this.addrowFuelTax + 1;
    this.getRowDataFuelTax();
    this.getStartEditingCellFuelTax('description', 0);
  }
  getStartEditingCellFuelTax(_colKey, _rowIndex) {
    this.fuelTaxGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  editFuelTax(rowIndex) {
    if (this.newRowAddedFuelTax) { 
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCellFuelTax('description', 0);
      return;
    } else {
      let rowNode = this.fuelTaxGridApi.getRowNode(rowIndex);
      rowNode.data.isEdit = true;
      this.fuelTaxGridApi.startEditingCell({
        rowIndex: rowIndex,
        colKey: 'description',
      });
    }
  }

  cancelAction(event) {
    this.fuelTaxGridApi.stopEditing();
    let rowNode = this.fuelTaxGridApi.getRowNode(event);
    rowNode.data.isEdit = false;
  }

  editOrSaveFuelTax(params, isEdit: boolean) {
    this.fuelTaxGridApi.stopEditing();
    let rowNode = this.fuelTaxGridApi.getRowNode(params.node.id);
    rowNode.data.isEdit = false;
    this.isFuelTaxEdit = isEdit;
    if (rowNode.data.description === '' || rowNode.data.description === null) {
      this.toastr.error(' Fuel Tax Description is required');
      this.getStartEditingCellFuelTax('description', params.rowIndex);
      return;
    }
    if (rowNode.data.isPercent === '' || rowNode.data.isPercent === null) {
      this.toastr.error('Fuel Tax is required');
      this.getStartEditingCellFuelTax('isPercent', params.rowIndex);
      return;
    }
    const isCheck = isNaN(rowNode.data.fuelTaxRate);
    if (isCheck) {
      this.toastr.error('Please Enter Valid Fuel Tax Rate');
      this.getStartEditingCellFuelTax('fuelTaxRate', params.rowIndex);
      return;
    }
    if (rowNode.data.fuelTaxRate === '' || rowNode.data.fuelTaxRate === null) {
      this.toastr.error('Fuel Tax Rate is required');
      this.getStartEditingCellFuelTax('fuelTaxRate', params.rowIndex);
      return;
    }
    const postData = this.getFuelTaxObjFromRow(rowNode.data);
    if (rowNode.data.fuelTaxId) {
      this.spinner.show();
      this.dataService.updateData(`FuelTax`, postData).subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          return;
        }
        if (response === '1') {
          this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
          this.newRowAddedFuelTax = false;
          this.GetFuelTaxByStoreLocationID();
        } else {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      });
    } else {
      this.spinner.show();
      this.dataService.postData(`FuelTax`, postData).subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          return;
        }
        if (response && response.fuelTaxId) {
          this.newRowAddedFuelTax = false;
          this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          this.GetFuelTaxByStoreLocationID();
        } else {
          this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
      });
    }
  }

  onNavigateSalesRestriction() {
    const data = { tabId: 'tab-sales-restriction' };
    this.changeTabs.emit(data);
  }

  getFuelTaxObjFromRow(rowData) {
    let isPercentObj = _.find(this.commonService.fuelTaxList, ['text', rowData.isPercent]);
    let data = {
      fuelTaxId: !isNullOrUndefined(rowData.fuelTaxId) ? rowData.fuelTaxId : 0,
      description: rowData.description,
      fuelTaxRate: rowData.fuelTaxRate,
      isPercent: !isNullOrUndefined(isPercentObj) ? isPercentObj.value : null,
      linkFuelTaxID: rowData.linkFuelTaxID,
      storeLocation: this.storeLocationID
    };
    return data;
  }
  // setMaxSaleAmount(event, formControl) {

  // if (formControl === 'stateTax') {
  //   event.target.value = parseFloat(event.target.value).toFixed(2);
  //   this.salesTaxForm.get('stateTax').setValue(Number(parseFloat(event.target.value).toFixed(2)));
  // }
  // if (formControl === 'countyTax') {
  //   event.target.value = parseFloat(event.target.value).toFixed(2);
  //   this.salesTaxForm.get('countyTax').setValue(Number(parseFloat(event.target.value).toFixed(2)));
  // }
  // if (formControl === 'cityTax') {
  //   event.target.value = parseFloat(event.target.value).toFixed(2);
  //   this.salesTaxForm.get('cityTax').setValue(Number(parseFloat(event.target.value).toFixed(2)));
  // }
  // if (formControl === 'fuelTaxRate') {
  //   event.target.value = parseFloat(event.target.value).toFixed(6);
  //   this.fuelTaxForm.get('fuelTaxRate').setValue(Number(parseFloat(event.target.value).toFixed(6)));
  // }
  // // event.target.value = parseFloat(event.target.value).toFixed(2);
  // // this.deptDetailForm.get('maximumOpenSaleAmount').setValue(parseFloat(event.target.value).toFixed(2));
  // }
}
