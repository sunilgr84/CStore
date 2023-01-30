import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
  selector: 'app-department-type',
  templateUrl: './department-type.component.html',
  styleUrls: ['./department-type.component.scss'],
  animations: [routerTransition()]
})
export class DepartmentTypeComponent implements OnInit {
  @ViewChild('departmentType') _departmentType: any;
  rowData: any;
  gridOptions: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  isEdit = false;
  showAddGrid = false;
  submitted = false;
  isDepartmentTypeCollapsed = true;
  naxmlDepartmentTypeList: any;
  initialFormValues: any;
  isLoading = true;
  departmentTypeForm = this.fb.group({
    departmentTypeName: ['',Validators.required],
    naxmlDepartmentTypeCodeID: [''],
    displayOrder: [''],
    departmentTypeID: [0],
    isFractionalQtyAllowedFlag: [false],
    isItemReturnableFlag: [false],
    isDepartmentNegative: [false],
    isInsideSalesDept: [false],
    allowFoodStampsFlag: [false],
    salesRestrictionRequiredFlag: [false],

  });
  deptTypeList: any;
  filterText: string;
  constructor(private constantService: ConstantService, private gridService: GridService,
    private fb: FormBuilder, private _itemsService: SetupService, private toaster: ToastrService,
    private spinner: NgxSpinnerService, private utilityService: UtilityService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.masterDepartmentTypeGrid);
    this.initialFormValues = this.departmentTypeForm.value;
  }

  ngOnInit() {
    this.getDepartmentTypeList();
    this.getNaxmlDepartmentType();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  addDeptType(){
    this.showAddGrid = true;
    this.isEdit = false;
  }
  edit(params) {
    this.gridApi.refreshCells({ force: true });
    params.hideDeleteAction = true;
    this.showAddGrid = true;
    this.isEdit = true;
    this.isDepartmentTypeCollapsed = false;
    this.departmentTypeForm.patchValue(params.data);
    this._departmentType.nativeElement.focus();
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  get deptTypeControl() { return this.departmentTypeForm.controls; }

  reset() {
    this.departmentTypeForm.patchValue(this.initialFormValues);
    this.isEdit = false;
    this.submitted = false;
    this.showAddGrid=false;
    this.gridApi.refreshCells({ force: true });
  }
  delete(params) {
    this.spinner.show();
    // this.reset();
    this.isDepartmentTypeCollapsed = true;
    this._itemsService.deleteData(`DepartmentType?id=${params.data.departmentTypeID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.toaster.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        this.getDepartmentTypeList();
      } else {
        this.toaster.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toaster.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  saveOrEdit() {
    this.submitted = true;
    if (this.departmentTypeForm.valid) {

      let firstAscii = this.departmentTypeForm.get("departmentTypeName").value.charCodeAt(0);
      let lastAscii = this.departmentTypeForm.get("departmentTypeName").value.charCodeAt(this.departmentTypeForm.get("departmentTypeName").value.length-1);
      
      if(!(firstAscii >= 48 || firstAscii <= 57 && firstAscii >= 65 || firstAscii <= 122)){
        this.toaster.error("Invalid department type name", this.constantService.infoMessages.error);
        return;
      }else if(!(lastAscii >= 48 && lastAscii <= 57 || lastAscii >= 65 && lastAscii <= 122)){
        this.toaster.error("Invalid department type name", this.constantService.infoMessages.error);
        return;
      }
      if (this.isEdit) {
        // this.isEdit = false;
        this.isDepartmentTypeCollapsed = true;
        this.spinner.show();
        this._itemsService.updateData(`DepartmentType/update`, this.departmentTypeForm.value).subscribe(result => {
          this.spinner.hide();
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toaster.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result === '1') {
            this.getDepartmentTypeList();
            this.reset();
            this.toaster.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else if (result === 0) {
            this.toaster.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toaster.error(this.constantService.infoMessages.contactAdmin);
        });
      } else {
        const priceGroupValue = this.deptTypeList.filter(data => {
          return (Number(data.naxmlDepartmentTypeCodeID) === Number(this.departmentTypeForm.value.naxmlDepartmentTypeCodeID) &&
            // tslint:disable-next-line:max-line-length
            this.utilityService.lowerCase(data.departmentTypeName) === this.utilityService.lowerCase(this.departmentTypeForm.value.departmentTypeName));
          // tslint:disable-next-line:max-line-length
          // this.utilityService.lowerCase(String(data.displayOrder)) === this.utilityService.lowerCase(String(this.departmentTypeForm.value.displayOrder)));
        });
        if (priceGroupValue[0]) {
          this.toaster.error(this.constantService.infoMessages.alreadyExists);
          return;
        }
        this.isDepartmentTypeCollapsed = true;
        this.spinner.show();
        this._itemsService.postData(`DepartmentType/addNew`, this.departmentTypeForm.value).subscribe(result => {
          this.spinner.hide();
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toaster.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result && result.departmentTypeID > 0) {
            this.reset();
            this.getDepartmentTypeList();
            this.toaster.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toaster.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toaster.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
        });
      }
    }
  }
  onSearchTextBoxChanged(event) {
    this.gridApi.setQuickFilter(event.srcElement.value);
  }
  getDepartmentTypeList() {
    this.spinner.show();
    this._itemsService.getData(`DepartmentType/getAllData`).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.deptTypeList = this.rowData = [];
        return;
      }
      this.rowData = result;
      this.gridApi.setRowData(result);
      this.deptTypeList = result;
    }, (error) => { this.spinner.hide(); });
  }
  getNaxmlDepartmentType() {
    this._itemsService.getData(`NaxmlDepartmentType/get`).subscribe(result => {
      this.isLoading = false;
      if (result && result['statusCode']) {
        this.naxmlDepartmentTypeList = [];
        return;
      }
      this.naxmlDepartmentTypeList = result;
    });
  }
}
