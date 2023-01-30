import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SalesRestriction } from '../../models/sales-restriction.model';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';

@Component({
  selector: 'app-sales-restriction',
  templateUrl: './sales-restriction.component.html',
  styleUrls: ['./sales-restriction.component.scss'],
  animations: [routerTransition()]
})

export class SalesRestrictionComponent implements OnInit {
  @ViewChild('posSalesRestrictID') _posSalesRestrictID: any;
  rowData: SalesRestriction[];
  gridOptions: GridOptions;
  gridApi: any;
  isHideGrid = false;
  isEdit = false;
  textFilter = null;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Input() storeLocationID: number;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();

  selectedRow: any;
  newRowAdded: boolean;
  tempId: any;

  constructor(private spinner: NgxSpinnerService,
    private constantsService: ConstantService,
    private dataService: SetupService, private toastr: ToastrService, private editableGrid: EditableGridService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.salesRestrictionGrid);
  }
  ngOnInit() {
    this.fetchStoreLocationSalesRestrictions();
  }

  fetchStoreLocationSalesRestrictions() {
    this.dataService.getData(`StoreLocationSalesRestriction/getByLocationID/${this.storeLocationID}`).
      subscribe((response: SalesRestriction[]) => {
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      isSaveRequired: true, salesRestrictionDescription: '', storeLocationSalesRestrictionID: 0,
      storeLocationID: 0, salesRestrictFlag: false, prohibitDiscountFlag: false,
      minimumCustomerAge: 0, minimumClerkAge: 0, transactionLimit: 0,
      posSalesRestrictID: 0
    };
    return newData;
  }
  addNew() {
    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('posSalesRestrictID', 0);
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
    this.getStartEditingCell('posSalesRestrictID', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  getRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.gridApi && this.gridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.rowData = arr;
  }
  deleteAction(params: { data: SalesRestriction; }) {
    if (params.data.storeLocationSalesRestrictionID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.getRowData();
      return;
    } else {
      this.spinner.show();
      this.dataService.deleteData(`StoreLocationSalesRestriction/${params.data.storeLocationSalesRestrictionID}`).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
            return;
          }
          if (response) {
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
            this.rowData = this.rowData.filter(r => r.storeLocationSalesRestrictionID !== params.data.storeLocationSalesRestrictionID);
          } else {
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.contactAdmin);
        });
    }
  }

  editOrSave(params, isEdit: boolean) {
    this.isEdit = isEdit;
    if (params.data.posSalesRestrictID === '' || params.data.posSalesRestrictID === null || Number(params.data.posSalesRestrictID) === 0) {
      this.toastr.warning('Sales Restriction ID is required');
      this.getStartEditingCell('posSalesRestrictID', params.rowIndex);
      return;
    }
    if (params.data.salesRestrictionDescription === '' || params.data.salesRestrictionDescription === null) {
      this.toastr.warning('Sales Restriction Name is required');
      this.getStartEditingCell('salesRestrictionDescription', params.rowIndex);
      return;
    }
    // minimumCustomerAge: 0, minimumClerkAge:
    if (params.data.minimumCustomerAge && String(params.data.minimumCustomerAge).length > 2) {
      this.toastr.warning('Customer age should be in 2 digit');
      this.getStartEditingCell('minimumCustomerAge', params.rowIndex);
      return;
    }
    if (params.data.minimumClerkAge && String(params.data.minimumClerkAge).length > 2) {
      this.toastr.warning('Clerk age should be in 2 digit');
      this.getStartEditingCell('minimumClerkAge', params.rowIndex);
      return;
    }
    if (this.rowData) {
      const restrictID = this.rowData.filter(title => {
        if (this.isEdit) {
          return title.posSalesRestrictID === Number(params.data.posSalesRestrictID)
            && title.storeLocationSalesRestrictionID !== Number(params.data.storeLocationSalesRestrictionID);
        } else {
          return title.posSalesRestrictID === Number(params.data.posSalesRestrictID);
        }
      });
      if (restrictID && restrictID[0]) {
        this.toastr.error('POS Sales Restrict ID Already Exists.!', 'Error');
        this.getStartEditingCell('posSalesRestrictID', params.rowIndex);
        return;
      }
    }

    if (this.isEdit) {
      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID
      };
      this.spinner.show();
      this.dataService.updateData('StoreLocationSalesRestriction/update', postData).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
            return;
          }
          if (response === '1') {
            this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
            this.fetchStoreLocationSalesRestrictions();
          } else {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        });
    } else {


      if (this.rowData) {
        const restrictID = this.rowData.filter(title => {
          return title.posSalesRestrictID === Number(params.data.posSalesRestrictID);
        });

        if (restrictID && restrictID[0]) {
          this.toastr.error('POS Sales Restrict ID Already Exists.!', 'Error');
          this.getStartEditingCell('posSalesRestrictID', params.rowIndex);
          return;
        }
      }

      const postData = {
        ...params.data,
        storeLocationID: this.storeLocationID
      };
      this.spinner.show();
      this.dataService.postData('StoreLocationSalesRestriction/AddNew', postData).
        subscribe((response: SalesRestriction) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
            return;
          }
          if (response && response.storeLocationSalesRestrictionID) {
            this.newRowAdded = false;
            this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
            // this.rowData = [...this.rowData, response];
            this.fetchStoreLocationSalesRestrictions();
            // this.salesRestrictionForm.patchValue(this.initialFormValues);
          } else {
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        });
    }
  }
  // setNumericValue(formControl) {
  //   if (formControl === 'posSalesRestrictID') {
  //     this.salesRestrictionForm.get('posSalesRestrictID').setValue(Number(this.salesRestrictionForm.value.posSalesRestrictID));
  //   }
  //   if (formControl === 'minimumCustomerAge') {
  //     this.salesRestrictionForm.get('minimumCustomerAge').setValue(Number(this.salesRestrictionForm.value.minimumCustomerAge));
  //   }
  //   if (formControl === 'minimumClerkAge') {
  //     this.salesRestrictionForm.get('minimumClerkAge').setValue(Number(this.salesRestrictionForm.value.minimumClerkAge));
  //   }
  //   if (formControl === 'transactionLimit') {
  //     this.salesRestrictionForm.get('transactionLimit').setValue(Number(this.salesRestrictionForm.value.transactionLimit));
  //   }
  // }
  resetForm() {

  }

  backToMainList() {
    this.backToStoreList.emit(false);
  }

  onNavigateFuelSetup() {
    const data = { tabId: 'tab-fuel-setup' };
    this.changeTabs.emit(data);
  }
}
