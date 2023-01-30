import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';

@Component({
  selector: 'app-store-fees',
  templateUrl: './store-fees.component.html',
  styleUrls: ['./store-fees.component.scss']
})
export class StoreFeesComponent implements OnInit {
  @ViewChild('feeDescription') _feeDescription: any;
  @ViewChild('posFeeID') _posFeeID: any;
  rowData: any[];
  gridOptions: GridOptions;
  gridApi: any;
  isEdit = false;
  isFeeDescLoading = false;
  isposFeeLoading = false;
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();

  filterText: any;
  newRowAdded: any;
  tempId: any;
  checkDuplicateRowData: any;
  constructor(private _setupService: SetupService,
    private constantService: ConstantService, private toastr: ToastrService,
    private spinner: NgxSpinnerService, private editableGrid: EditableGridService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constantService.editableGridConfig.gridTypes.storeFeesGrid);
  }

  ngOnInit() {
    this.getStoresFeesList();
  }
  getGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  resetGrid() {
    this.getStoresFeesList();
  }

  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId, isSaveRequired: true, feeDescription: '', isRefundable: false,
      posAmountRange: 0, posFee: 0, posFeeID: 0, storeLocationFeeID: 0, storeLocationID: 0
    };
    return newData;
  }
  addNew() {
    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('feeDescription', 0);
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
    this.getStartEditingCell('feeDescription', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  getStoresFeesList() {
    this._setupService.getData(`StoreLocationFee/getAllByLocationId/${this.storeLocationID}`)
      .subscribe(result => {
        if (result && result['statusCode']) {
          this.checkDuplicateRowData = this.rowData = [];
          return;
        }
        this.checkDuplicateRowData = this.rowData = result;
      });
  }

  checkDuplicationFeeDescription(event) {
    if (event.data.feeDescription) {
      const storeFees = this.checkDuplicateRowData && this.checkDuplicateRowData.filter(title => {
        if (this.isEdit) {
          return title.feeDescription === event.data.feeDescription &&
            title.storeLocationFeeID !== Number(event.data.storeLocationFeeID);
        } else {
          return title.feeDescription === event.data.feeDescription;
        }
      });
      if (storeFees[0]) {
        this.toastr.error('Fee Description aleady exists..!');
        this.getStartEditingCell('feeDescription', event.rowIndex);
        return;
      }
      return true;
    }
  }
  checkDuplicationPOSFeeID(event) {
    if (event.data.posFeeID) {
      const storeFees = this.checkDuplicateRowData && this.checkDuplicateRowData.filter(title => {
        if (this.isEdit) {
          return title.posFeeID === Number(event.data.posFeeID) &&
            title.storeLocationFeeID !== event.data.storeLocationFeeID;
        } else {
          return title.posFeeID === Number(event.data.posFeeID);
        }
      });
      if (storeFees[0]) {
        this.toastr.error('POS Fee ID aleady exists..!');
        this.getStartEditingCell('posFeeID', event.rowIndex);
        return false;
      }
      return true;
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
  deleteAction(params) {
    if (params.data.storeLocationFeeID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getRowData();
      return;
    } else {
      this.spinner.show();
      this._setupService.deleteData(`StoreLocationFee/${params.data.storeLocationFeeID}`).subscribe(result => {

        this.spinner.hide();
        if (result === '1') {
          this.getStoresFeesList();
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.contactAdmin);
      });
    }
  }

  editOrSave(params, isEdit: boolean) {
    this.isEdit = isEdit;

    if (params.data.feeDescription === '' || params.data.feeDescription === null) {
      this.toastr.error('Fee Name is required');
      this.getStartEditingCell('feeDescription', params.rowIndex);
      return;
    }
    if (params.data.posFeeID === '' || params.data.posFeeID === null || params.data.posFeeID === 0) {
      this.toastr.error('POS Fee ID is required');
      this.getStartEditingCell('posFeeID', params.rowIndex);
      return;
    }
    if (params.data.posFee === '' || params.data.posFee === null || params.data.posFee === 0) {
      this.toastr.error('POS Fee is required');
      this.getStartEditingCell('posFee', params.rowIndex);
      return;
    }
    // if (params.data.posAmountRange === '' || params.data.posAmountRange === null || params.data.posAmountRange === 0) {
    //   this.toastr.error(' POS amount range is required');
    //   this.getStartEditingCell('posAmountRange', params.rowIndex);
    //   return;
    // }

    const isfeeDesc = this.checkDuplicationFeeDescription(params);
    const isposFee = this.checkDuplicationPOSFeeID(params);
    if (isfeeDesc && isposFee) {
      const postData = {
        ...params.data,
        isRefundable: params.data.isRefundable,
        storeLocationID: this.storeLocationID
      };
      this.spinner.show();
      if (this.isEdit) {
        this._setupService.updateData(`StoreLocationFee/Update`, postData).subscribe(result => {
          this.spinner.hide();
          let errorMessage = '';
          if (result && result.statusCode === 400) {
            result.result.validationErrors.forEach(vError => {
              errorMessage += vError.errorMessage;
            });
            this.toastr.error(errorMessage, this.constantService.infoMessages.error);
            return;
          }
          if (result === '1') {
            this.getStoresFeesList();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.contactAdmin);
        });
      } else {
        this._setupService.postData(`StoreLocationFee/AddNew`, postData).subscribe(result => {
          this.spinner.hide();
          let errorMessage = '';
          if (result && result.statusCode === 400) {
            result.result.validationErrors.forEach(vError => {
              errorMessage += vError.errorMessage;
            });
            this.toastr.error(errorMessage, this.constantService.infoMessages.error);
            return;
          }
          if (result && result['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            return;
          }
          if (result.storeLocationFeeID) {
            this.newRowAdded = false;
            this.getStoresFeesList();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        });
      }
    }
  }

  backToMainList() {
    this.backToStoreList.emit(false);
  }
  onNavigateMOP() {
    const data = { tabId: 'tab-method-of-payment' };
    this.changeTabs.emit(data);
  }
}
