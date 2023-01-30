import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { PaymentMethod } from '../../models/payment-method.model';
import { FormControlName, } from '@angular/forms';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.scss'],
})
export class PaymentMethodComponent implements OnInit {
  @ViewChild('storeMOPNo') storeMOPNo: any;
  rowData: PaymentMethod[];
  gridOptions: GridOptions;
  gridApi: any;
  // isHideGrid = false;
  isEdit = false;
  // title = '';

  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @Input() storeLocationID: number;

  initialFormValues: PaymentMethod;
  selectedRow: any;
  filterText: any;
  tempId: any;
  newRowAdded: any;
  checkDuplicateRowData: PaymentMethod[];
  constructor(private spinner: NgxSpinnerService,
    private constantService: ConstantService,
    private dataService: SetupService, private toastr: ToastrService, private editableGrid: EditableGridService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constantService.editableGridConfig.gridTypes.paymentMethodGrid);
  }

  ngOnInit() {
    this.getPaymentMethod();
  }
  getPaymentMethod() {
    this.newRowAdded = false;
    this.dataService.getData(`StoreLocationMOP/getByLocationId/${this.storeLocationID}`).
      subscribe((response: PaymentMethod[]) => {
        if (response && response['statusCode']) {
          this.checkDuplicateRowData = this.rowData = [];
          return;
        }
        this.checkDuplicateRowData = this.rowData = response;
      });
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }
  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      isSaveRequired: true, storeLocationMOPID: 0,
      storeLocationID: 0, storeMOPNo: '', isSystemMOP: false,
      mopName: '', mopDefaultID: 0, posSystemCD: 0, mopNo: 0
    };
    return newData;
  }
  addNew() {
    // this.title = 'Add a New Store Location MOP';
    // this.isHideGrid = true;
    // this.isEdit = false;
    // this.paymentMethodForm.patchValue(this.initialFormValues);

    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('storeMOPNo', 0);
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.getRowData();
    // this.addrow = this.addrow + 1;
    this.getStartEditingCell('storeMOPNo', 0);

  }
  getRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.gridApi && this.gridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.rowData = arr;
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
  editAction(params: { data: PaymentMethod; }, isEdit: boolean) {
    this.isEdit = true;
    this.selectedRow = params;

  }

  // editOrSaveClose(event) {
  //   this.editOrSave(event, () => { this.isHideGrid = false; });
  // }
  // formValidtion() {
  //   if (this.paymentMethodForm.get('storeMOPNo').value < 0) {
  //     this.toastr.error('Store MOPNo Negative value Not allowed', 'error');
  //     this.storeMOPNo.nativeElement.focus();
  //     this.paymentMethodForm.patchValue({
  //       storeMOPNo: null
  //     });
  //     return;
  //   }
  // }
  editOrSave(params, isEdit: boolean) {
    this.isEdit = isEdit;
    if (params.data.storeMOPNo <= 0) {
      this.toastr.error('Store MOPNo Zero value Not allowed');
      params.data.storeMOPNo = null;
      this.getStartEditingCell('storeMOPNo', params.rowIndex);
      // });
      return;
    }
    if (params.data.storeMOPNo === '' || params.data.storeMOPNo === null) {
      this.toastr.error('MOP Name No is required');
      this.getStartEditingCell('storeMOPNo', params.rowIndex);
      return;
    }

    if (params.data.mopName === '' || params.data.mopName === null) {
      this.toastr.error('MOP Name is required');
      this.getStartEditingCell('mopName', params.rowIndex);
      return;
    }
    const isCheck = isNaN(params.data.storeMOPNo);
    if (isCheck) {
      this.toastr.error('Please Enter Valid Store MOPNo ', 'error');
      this.getStartEditingCell('storeMOPNo', params.rowIndex);
      return;
    }
    if (this.isEdit) {
      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID,
        // mopName: this.paymentMethodForm.value.mopName.trim()

      };

      this.spinner.show();
      this.dataService.updateData('StoreLocationMOP/Update', postData).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
            return;
          }
          if (response === '1') {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
            this.newRowAdded = false; this.getPaymentMethod();
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        });
    } else {
      const _duplicate = _.find(this.checkDuplicateRowData, ['storeMOPNo', Number(params.data.storeMOPNo)]);
      if (_duplicate) {
        this.toastr.error('Store MOPNo Already Exists..', 'Error');
        this.getStartEditingCell('storeMOPNo', params.rowIndex);
        return;
      }
      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID,
        // mopName: this.paymentMethodForm.value.mopName.trim()
      };
      this.spinner.show();
      this.dataService.postData('StoreLocationMOP/AddNew', postData).
        subscribe((response: PaymentMethod) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            return;
          }
          if (response && response.storeLocationMOPID) {
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.getPaymentMethod();
            this.isEdit = true;
            this.newRowAdded = false;
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        });
    }
  }
  deleteAction(params) {
    if (params.data.storeLocationMOPID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getRowData();
      return;
    } else {
      this.spinner.show();
      this.dataService.deleteData(`StoreLocationMOP/${params.data.storeLocationMOPID}`).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response) {
            this.newRowAdded = false;
            this.getPaymentMethod();
            this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(error && error.error.errorMessage, this.constantService.infoMessages.error);
        });
    }
  }
  public noWhitespaceValidator(control: FormControlName) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
  // backToList() {
  //   this.getPaymentMethod();
  //   // this.isHideGrid = false;
  // }
  backToMainList() {
    this.backToStoreList.emit(false);
  }
  editOrSaveAndContinue() {

  }
  onNavigateStoreService() {
    const data = { tabId: 'tab-store-services' };
    this.changeTabs.emit(data);
  }
}
