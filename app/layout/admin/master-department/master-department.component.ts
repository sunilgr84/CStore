import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from '@shared/services/utility/utility.service';
declare var $:any;
@Component({
  selector: 'app-master-department',
  templateUrl: './master-department.component.html',
  styleUrls: ['./master-department.component.scss'],
  animations: [routerTransition()]
})
export class MasterDepartmentComponent implements OnInit {
  @ViewChild('departmentType') _departmentType: any;
  title = 'Master Department';
  isEdit = false;
  isHideShow = false;
  submitted = false;
  rowData: any[];
  gridOptions: GridOptions;
  filterText: any;
  gridApi: any;
  gridColumnApi: any;
  departmentTypeList: any[];
  isLoading = true;
  departmentProductList: any[];
  isProductListLoading = true;
  departmentForm = this._fb.group({
    masterDepartmentID: [0],
    departmentTypeID: [''],
    masterDepartmentDescription: ['', Validators.pattern(/^[a-zA-Z0-9- /\\@]*$/)],
    naxProductCodeID: [''],
    isFuelProduct: [false],
    masterDepartmentProductCode: ['']   //TO DO : Remove this field temporarily kept as API thorwing error while POST and PUT 
  });
  initialFormValues: any;
  addUpdateDetails = false;
  masterDeptList: any;
  showForm: boolean;
  constructor(private gridService: GridService, private constantService: ConstantService, private toastr: ToastrService
    , private _fb: FormBuilder, private _setupService: SetupService, private _itemsService: SetupService,
    private spinner: NgxSpinnerService, private utilityService: UtilityService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.masterDepartmentGrid);
    this.initialFormValues = this.departmentForm.value;
  }

  ngOnInit() {
    this.showForm = false;
    //this.bindDepartmentType();
    this.getDepartmentType();
    this.getDepartmentProductList();
  }

  onAddDepartment() {
    this.showForm = true;
  }
  bindDepartmentType() {
    // tslint:disable-next-line:max-line-length
    // this.departmentTypeList = [{ departmentTypeID: 1, departmentTypeName: 'Generals', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: true }, { departmentTypeID: 2, departmentTypeName: 'Fuel', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: true }, { departmentTypeID: 3, departmentTypeName: 'Tobacco', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: true }, { departmentTypeID: 4, departmentTypeName: 'Alcohol', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 5, departmentTypeName: 'Lottery', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 6, departmentTypeName: 'Inside Sales', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: false }, { departmentTypeID: 7, departmentTypeName: 'Lotto', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 8, departmentTypeName: 'Money Order', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 10, departmentTypeName: 'Check Cashing', isDepartmentNegative: true, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 11, departmentTypeName: 'Car Wash', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 12, departmentTypeName: 'Games', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 13, departmentTypeName: 'Phone Cards', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 14, departmentTypeName: 'Western Union', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 15, departmentTypeName: 'UnKnown', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 16, departmentTypeName: 'Other', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 17, departmentTypeName: 'Rentals', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 18, departmentTypeName: 'Pay-Out', isDepartmentNegative: true, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 19, departmentTypeName: 'Inside Sales-High Tax', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 20, departmentTypeName: 'Inside Sales-LOW Tax', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: false }, { departmentTypeID: 21, departmentTypeName: 'Cigarette', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: true }, { departmentTypeID: 22, departmentTypeName: 'Phone Card Fees', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 23, departmentTypeName: 'Money Order Fees', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 24, departmentTypeName: 'EBT', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 25, departmentTypeName: 'LOTTO-OTHER', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: true }, { departmentTypeID: 26, departmentTypeName: 'LOTTO-PAY-OUT', isDepartmentNegative: true, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 27, departmentTypeName: 'Deli', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 28, departmentTypeName: 'Discounts', isDepartmentNegative: true, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 29, departmentTypeName: 'ATM', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 30, departmentTypeName: 'ATM fees', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 31, departmentTypeName: 'CASH CARD', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: true }, { departmentTypeID: 34, departmentTypeName: 'Qbics', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: true }, { departmentTypeID: 35, departmentTypeName: 'Depts', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': true, salesRestrictionRequiredFlag: true }, { departmentTypeID: 36, departmentTypeName: 'Deptwe', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 37, departmentTypeName: 'demodepa', isDepartmentNegative: true, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 38, departmentTypeName: 'ddepart', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 39, departmentTypeName: 'dept', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 40, departmentTypeName: 'demodepart', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 41, departmentTypeName: 'sdept', isDepartmentNegative: false, isItemReturnableFlag: true, isFractionalQtyAllowedFlag: true, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: false }, { departmentTypeID: 45, departmentTypeName: 'tobacco', isDepartmentNegative: false, isItemReturnableFlag: false, isFractionalQtyAllowedFlag: false, 'AllowFoodStampsFlag': false, salesRestrictionRequiredFlag: true }];
  }
  // convenience getter for easy access to form fields
  get depart() { return this.departmentForm.controls; }
  addMasterDepartment() {
    this.isHideShow = !this.isHideShow;
    this.departmentForm.patchValue(this.initialFormValues);
    // this.title = 'Add Master Department';
    this.isEdit = false;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    params.api.sizeColumnsToFit();
    this.getMasterDepartment();
  }
  getMasterDepartment() {
    this.spinner.show();
    this._setupService.getData(`MasterDepartment/list`).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.masterDeptList = this.rowData = [];
        return;
      }
      this.rowData = result;
      this.gridApi.setRowData(result);
      this.masterDeptList = result;
    }, (error) => { this.spinner.hide(); });
  }
  getDepartmentType() {
    this._itemsService.getData(`DepartmentType/getAll`).subscribe(result => {
      this.isLoading = false;
      if (result && result['statusCode']) {
        this.departmentTypeList = [];
        return;
      }
      this.departmentTypeList = result;
    });
  }
  getDepartmentProductList() {
    this._itemsService.getData(`StoreFuelGrade/GetAllFProducts`).subscribe(result => {
      this.isProductListLoading = false;
      if (result && result['statusCode']) {
        this.departmentProductList = [];
        return;
      }
      this.departmentProductList = result;
    });
  }
  editAction(params) {
    this.gridApi.refreshCells({ force: true });
    params.hideDeleteAction = true;
    this.title = 'Master Department';
    this.isEdit = true;
    this.departmentForm.patchValue(params.data);
    if (!params.data.naxProductCodeID) {
      this.departmentForm.get("naxProductCodeID").setValue("");
    }
    this.isHideShow = false;
    this.showForm = true;
    $("html,body").scrollTop({left:0,top:0,behavior: 'smooth'});
    setTimeout(() => {
      this._departmentType.nativeElement.focus();
    });
  }
  deleteAction(params) {
    this.spinner.show();
    this._setupService.deleteData(`MasterDepartment/${params.data.masterDepartmentID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.getMasterDepartment();
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.delete);
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }

    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  reset() {
    this.departmentForm.patchValue(this.initialFormValues);
    this.title = 'Master Department';
    this.isEdit = false;
    this.submitted = false;
    this.showForm = false;
    this.gridApi.refreshCells({ force: true });
  }
  /**
   *  New Record Add
   */
  editOrSaveClose(event) {
    this.editOrSave(event, () => { this.isHideShow = true; });
  }
  editOrSave(_event, callBack = () => { }) {
    // callBack();
    this.submitted = true;
    if (this.departmentForm.valid) {
      if (this.isEdit) {
        this.spinner.show();
        this._setupService.updateData('MasterDepartment', this.departmentForm.value).subscribe(result => {
          if (result === '1') {
            this.spinner.hide();
            this.getMasterDepartment();
            this.reset();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
        });
      } else {
        const masterDeptValue = this.masterDeptList.filter(data => {
          return (Number(data.masterDepartmentTypeID) === Number(this.departmentForm.value.departmentTypeID) &&
            // tslint:disable-next-line:max-line-length
            this.utilityService.lowerCase(data.masterDepartmentDescription) === this.utilityService.lowerCase(this.departmentForm.value.masterDepartmentDescription) &&
            // tslint:disable-next-line:max-line-length
            this.utilityService.lowerCase(String(data.masterDepartmentProductCode)) === this.utilityService.lowerCase(String(this.departmentForm.value.masterDepartmentProductCode)));
        });
        if (masterDeptValue[0]) {
          this.toastr.error(this.constantService.infoMessages.alreadyExists);
          return;
        }

        this.spinner.show();
        this._setupService.postData('MasterDepartment', this.departmentForm.value).subscribe(result => {
          this.spinner.hide();
          this.getMasterDepartment();
          this.reset();
          if (result.statusCode == 400) {
            this.toastr.error(result.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
          } else {
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        });
      }
    }
  }
}
