import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ColumnApi, GridApi } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { FormBuilder, Validators } from '@angular/forms';
@Component({
  selector: 'app-manufacturer',
  templateUrl: './manufacturer.component.html',
  styleUrls: ['./manufacturer.component.scss'],
  animations: [routerTransition()]
})
export class ManufacturerComponent implements OnInit {

  manufacturerGridRowData: any[];
  manufacturerGridOptions: any;
  gridManufacturerApi: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  newRowAdded = false;
  tempId = 0;
  addrow = 0;
  manufacturerList: any;
  filterText: string;

  isEdit: any;
  showForm: boolean;
  submitted = false;
  manufacturerForm = this.fb.group({
    manufacturerID: [0],
    manufacturerName: [null, Validators.required],
    primaryWebsite: [null, Validators.required]
  });

  get manufacturerFormControls() { return this.manufacturerForm.controls; }

  constructor(private paginationGridService: PaginationGridService, private constant: ConstantService, private toastr: ToastrService,
    private _setupService: SetupService, private spinner: NgxSpinnerService, private utilityService: UtilityService, private fb: FormBuilder) {
    this.manufacturerGridOptions = this.paginationGridService.getGridOption(this.constant.gridTypes.masterManufacturerGrid);
  }

  ngOnInit() {
    this.showForm = false;
    this.getManufacturerList();
  }

  onAddManf() {
    this.showForm = true;
    this.isEdit = false;
    this.submitted = false;
  }

  onClearAddManf() {
    this.showForm = false;
    this.isEdit = false;
    this.submitted = false;
    this.manufacturerForm.reset({
      manufacturerID: 0,
      manufacturerName: null,
      primaryWebsite: null
    });
    this.gridManufacturerApi.refreshCells({ force: true });
  }

  onReady(params) {
    this.gridManufacturerApi = params.api;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  createNewRowData() {
    this.tempId = this.gridManufacturerApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      manufacturerName: '', manufacturerID: 0, primaryWebsite: '', isSaveRequired: true,
    };
    return newData;
  }

  onInsertRowAt() {
    this.gridManufacturerApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('manufacturerName', 0);
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridManufacturerApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartEditingCell('manufacturerName', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridManufacturerApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  onSearchTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    if (this.gridApi.getDisplayedRowCount() === 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }
  manufacturerDelete(event) {
    if (event.data.manufacturerID === 0) {
      this.newRowAdded = false;
      this.gridManufacturerApi.updateRowData({ remove: [event.data] });
      return;
    }
    this.spinner.show();
    this._setupService.deleteData(`Manufacturer/${event.data.manufacturerID}`).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.toastr.error(this.constant.infoMessages.deleteRecordFailed, this.constant.infoMessages.error);
        return;
      }
      if (result) {
        this.toastr.success(this.constant.infoMessages.deletedRecord, this.constant.infoMessages.delete);
        this.getManufacturerList();
      } else {
        this.toastr.error(this.constant.infoMessages.deleteRecordFailed, this.constant.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constant.infoMessages.contactAdmin);
    });
  }
  isURL(manufacturerName) {
    try {
      Boolean(new URL(manufacturerName));
      return true;
    } catch (e) {
      return false;
    }
  }

  isValidUrl(s: string) {
    // tslint:disable-next-line:prefer-const
    let regexp = /((ftp|http|https):\/\/)|^\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    // let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
    return regexp.test(s);
  }

  manufacturerEdit(params) {
    this.gridManufacturerApi.refreshCells({ force: true });
    params.hideDeleteAction = true;
    this.isEdit = true;
    this.showForm = true;
    this.manufacturerForm.patchValue({
      manufacturerID: params.data.manufacturerID,
      manufacturerName: params.data.manufacturerName,
      primaryWebsite: params.data.primaryWebsite
    });
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  saveOrUpdateManufacturer() {
    this.submitted = true;
    if (this.manufacturerForm.valid) {
      if (!this.manufacturerForm.value.manufacturerName || this.manufacturerForm.value.manufacturerName.trim() === '') {
        this.manufacturerForm.get('manufacturerName').setValue(null);
        this.toastr.error('Please enter manufacturer name first before save!');
        return;
      }
      //   ================  website validation ====================   //
      if (this.manufacturerForm.value && this.isValidUrl(this.manufacturerForm.value.primaryWebsite) === false) {
        this.toastr.error('Please enter valid website URL!');
        this.manufacturerForm.get('primaryWebsite').setValue(null);
        return;
      }
      const postData = {
        manufacturerID: this.manufacturerForm.value.manufacturerID,
        manufacturerName: this.manufacturerForm.value.manufacturerName.trim(),
        primaryWebsite: this.manufacturerForm.value.primaryWebsite.trim()
      };
      if (this.manufacturerForm.value.manufacturerID === 0) {
        //  ==============  check dublicate records =============    //
        let masterDeptValue = null;
        if (this.manufacturerList && this.manufacturerList.length > 0) {
          masterDeptValue = this.manufacturerList.filter(data => {
            return (this.utilityService.lowerCase(data.manufacturerName) === this.utilityService.lowerCase(postData.manufacturerName));
          });
        }
        if (masterDeptValue && masterDeptValue[0]) {
          this.toastr.error('Manufacturer Name Already Exists', 'error');
          // this.getStartEditingCell('manufacturerName', params.rowIndex);
          return;
        }

        this.spinner.show();
        this._setupService.postData(`Manufacturer`, postData).subscribe(result => {
          this.newRowAdded = false;
          this.spinner.hide();
          if (result.manufacturerID === 0) {
            this.toastr.error('Please enter manufacturer name first before save!');
            return;
          }
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toastr.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result) {
            this.toastr.success(this.constant.infoMessages.addedRecord, this.constant.infoMessages.success);
            this.manufacturerForm.patchValue({
              manufacturerID: 0,
              manufacturerName: null,
              primaryWebsite: null
            });
            this.showForm = false;
            this.isEdit = false;
            this.submitted = false;
            this.getManufacturerList();
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constant.infoMessages.contactAdmin);
        });
      } else {
        let masterDeptValue = null;
        if (this.manufacturerList && this.manufacturerList.length > 0) {
          masterDeptValue = this.manufacturerList.filter(data => {
            return (this.utilityService.lowerCase(data.manufacturerName) === this.utilityService.lowerCase(postData.manufacturerName)
              && Number(data.manufacturerID) !== Number(postData.manufacturerID));
          });
        }
        if (masterDeptValue && masterDeptValue[0]) {
          this.toastr.error('Manufacturer Name Already Exists', 'error');
          return;
        }
        this.spinner.show();
        this._setupService.updateData(`Manufacturer`, postData).subscribe(result => {
          this.spinner.hide();
          this.newRowAdded = false;
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toastr.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result) {
            this.toastr.success(this.constant.infoMessages.updatedRecord, this.constant.infoMessages.success);
            this.manufacturerForm.patchValue({
              manufacturerID: 0,
              manufacturerName: null,
              primaryWebsite: null
            });
            this.showForm = false;
            this.isEdit = false;
            this.submitted = false;
            this.getManufacturerList();
          } else {
            this.toastr.error(this.constant.infoMessages.alreadyExists, this.constant.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constant.infoMessages.contactAdmin);
        });
      }
    }
  }
  getManufacturerList() {
    this.spinner.show();
    this._setupService.getData(`Manufacturer/getAll`).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.gridApi.setRowData([]);
        this.manufacturerList = [];
        return;
      }
      this.gridApi.setRowData(result);
      this.manufacturerList = result;
    }, (error) => { this.spinner.hide(); });
  }
}
