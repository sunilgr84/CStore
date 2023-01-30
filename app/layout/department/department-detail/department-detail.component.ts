import { Component, OnInit, Input, EventEmitter, OnChanges, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Department } from '@models/department.model';
import { FormMode } from '@models/form-mode.enum';
import { ToastrService } from 'ngx-toastr';
import { DepartmentType } from '@models/department-type.model';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-department-detail',
  templateUrl: './department-detail.component.html',
  styleUrls: ['./department-detail.component.scss']
})
export class DepartmentDetailComponent implements OnInit, OnChanges {

  @Input() formMode: FormMode;
  @Input() selectedDepartment: Department;
  @Input() showAllDepartment: EventEmitter<boolean>;
  @Output() enableTabs: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @ViewChild('maximunNumber') _maximunNumber: any;
  @ViewChild('minmunNumber') _minmunNumber: any;

  userInfo = this.constantService.getUserInfo();
  departmentType: DepartmentType[];
  // displayPromptMethodList: DisplayPromptMethod[];
  defaultForm: any;
  submited = false;
  isDepartmentTypeLoading = true;
  deptDetailForm = this._fb.group({
    departmentTypeID: [null],
    displayPromptMethodID: [0],
    departmentDescription: [''],
    departmentProfitMargin: ['', [Validators.max(100)]],
    profitPercent: ['', [Validators.max(100)]],
    minimumOpenSaleAmount: [null],
    maximumOpenSaleAmount: [null],
    activeFlag: [true],
    isDepartmentOpen: [false],
    isFractionalQtyAllowedFlag: [false],
    isLoyaltyRedeemEligibleFlag: [false],
    isItemReturnableFlag: [false],
    allowFoodStampsFlag: [false],
    areSpecialDiscountsAllowedFlag: [false],
    priceRequiredFlag: [false],
    isDepartmentNegative: [false],
    companyID: [0],
    lastModifiedBy: [''],
  });

  constructor(private _fb: FormBuilder, private _itemsService: SetupService,
    private _tstr: ToastrService, private _spinner: NgxSpinnerService, private constantService: ConstantService) {
    this.defaultForm = this.deptDetailForm.value;
  }

  ngOnInit() {
    // this.departmentType = [];
    this.getDepartmentTypes();
    if (this.selectedDepartment) {
      this.deptDetailForm.reset();
      this.enableDisableFlag(this.selectedDepartment);
      this.deptDetailForm.patchValue(this.selectedDepartment);

    }
  }

  ngOnChanges() {
    if (this.selectedDepartment) {
      this.deptDetailForm.reset();
      this.deptDetailForm.patchValue(this.selectedDepartment);
    }
  }
  departmentTypeChange(params) {
    this.enableDisableFlag(params);
    const selectedDepartmentTypeId = this.deptDetailForm.get('departmentTypeID').value;
    const selectedDepartmentType = this.departmentType.filter((type) => {
      return type.departmentTypeID === selectedDepartmentTypeId;
    });
    this.deptDetailForm.patchValue(selectedDepartmentType[0]);
    console.log(params);
    // tslint:disable-next-line:no-unused-expression
    console.log(this.departmentType.filter((x) => { x.departmentTypeID === selectedDepartmentTypeId; }));
  }
  enableDisableFlag(params) {
    this.deptDetailForm.controls['areSpecialDiscountsAllowedFlag'].setValue(false);
    this.deptDetailForm.controls['isFractionalQtyAllowedFlag'].setValue(false);
    this.deptDetailForm.controls['isLoyaltyRedeemEligibleFlag'].setValue(false);
    this.deptDetailForm.controls['isDepartmentOpen'].setValue(false);
    this.deptDetailForm.controls['areSpecialDiscountsAllowedFlag'].setValue(false);
    this.deptDetailForm.controls['isFractionalQtyAllowedFlag'].setValue(false);
    this.deptDetailForm.controls['isLoyaltyRedeemEligibleFlag'].setValue(false);
    this.deptDetailForm.controls['isDepartmentOpen'].setValue(false);
    if (params && params.departmentTypeName === 'Fuel') {
      this.deptDetailForm.controls['areSpecialDiscountsAllowedFlag'].disable();
      this.deptDetailForm.controls['isFractionalQtyAllowedFlag'].disable();
      this.deptDetailForm.controls['isLoyaltyRedeemEligibleFlag'].disable();
      this.deptDetailForm.controls['isDepartmentOpen'].disable();
    } else {
      this.deptDetailForm.controls['areSpecialDiscountsAllowedFlag'].enable();
      this.deptDetailForm.controls['isFractionalQtyAllowedFlag'].enable();
      this.deptDetailForm.controls['isLoyaltyRedeemEligibleFlag'].enable();
      this.deptDetailForm.controls['isDepartmentOpen'].enable();
    }
  }
  backToList() {
    this.showAllDepartment.emit(true);
    window.scrollTo(0, 0);
  }
  get deptDetailFormValid() { return this.deptDetailForm.controls; }

  saveOrUpdate(): string {
    switch (this.formMode) {
      case FormMode.ADD:
        return 'Save';
      case FormMode.EDIT:
        return 'Update';
    }
  }
  onNavigateLocation() {
    const data = { tabId: 'department-location' };
    this.changeTabs.emit(data);
  }
  save(andClose?: boolean) {
    if (this.deptDetailForm.value.minimumOpenSaleAmount < 0) {
      this._tstr.error('Minimum open sale amount must not be negative', 'error');
      this._minmunNumber.nativeElement.focus();
      return false;
    }
    if (this.deptDetailForm.value.maximumOpenSaleAmount < 0) {
      this._tstr.error('  Maximum open sale amount must not be negative', 'error');
      this._maximunNumber.nativeElement.focus();
      return false;
    }
    if (this.formMode === FormMode.ADD) {
      this.store(andClose);
    } else if (this.formMode === FormMode.EDIT) {
      this.update(andClose);
    }
  }

  store(andClose?: boolean) {
    this.submited = true;
    if (this.deptDetailForm.valid) {
      const payload: Department = {
        ...this.deptDetailForm.value,
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
      };
      this._spinner.show();
      this._itemsService.postData(`Department`, payload).subscribe((data) => {
        this._spinner.hide();
        let errorMessage = '';
        if (data.statusCode === 500) {
          this._tstr.error(this.constantService.infoMessages.contactAdmin);
          return;
        }
        if (data.statusCode === 400) {
          data.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to save department Detail');
          return;
        } else if (data) {
          this._tstr.success('Department added successfully!', this.constantService.infoMessages.success);
          this.deptDetailForm.reset();
          this.deptDetailForm.patchValue(data);
          this.selectedDepartment = data;
          this.submited = false;
          this.formMode = FormMode.EDIT;
          this.enableTabs.emit({ isDisabledTab: false, addedDepartmentDetail: data });
        }

        if (andClose) {
          this.showAllDepartment.emit(true);
        }
      }, err => {
        this._spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to save department');
        } else {
          this._spinner.hide();
          this._tstr.error('Unable to save department');
        }
      });
    }
  }

  update(andClose?: boolean) {
    this.submited = true;
    if (this.deptDetailForm.valid) {

      const payload: Department = {
        ...this.deptDetailForm.value,
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
        departmentID: this.selectedDepartment.departmentID,
        displayPromptMethodID: 0
      };
      this._spinner.show();
      this._itemsService.updateData(`Department`, payload).subscribe((data) => {
        this._spinner.hide();
        this.submited = false;
        this._tstr.success('Department updated successfully', 'Updated');
        if (andClose) {
          this.showAllDepartment.emit(true);
        }
      }, err => {
        this._spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to update department');
        } else {
          this._spinner.hide();
          this._tstr.error('Unable to update department');
        }
      });
    }
  }
  reset() {
    this.deptDetailForm.reset();
    this.submited = false;
    this.deptDetailForm.patchValue(this.defaultForm);
  }
  getDepartmentTypes() {
    this._itemsService.getData(`DepartmentType/getAll`).subscribe((data: DepartmentType[]) => {
      this.departmentType = data;
      this.isDepartmentTypeLoading = false;
    }, (err) => {
      this._tstr.error('unable to fetch department types');
    });
  }

  setMinSaleAmount(event) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
    this.deptDetailForm.get('minimumOpenSaleAmount').setValue(parseFloat(event.target.value).toFixed(2));
  }

  setMaxSaleAmount(event) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
    this.deptDetailForm.get('maximumOpenSaleAmount').setValue(parseFloat(event.target.value).toFixed(2));
  }
}
