import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FormMode } from '@models/form-mode.enum';
import { ToastrService } from 'ngx-toastr';
import { DepartmentLocation } from '@models/department-location.model';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreLocation } from '@models/store-location.model';
import { ConstantService } from '@shared/services/constant/constant.service';
import { Department } from '@models/department.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import * as moment from 'moment';

@Component({
  selector: 'app-new-department-location',
  templateUrl: './new-department-location.component.html',
  styleUrls: ['./new-department-location.component.scss']
})
export class NewDepartmentLocationComponent implements OnInit {

  @Input() formMode: FormMode;
  @Input() selectedDepartmentLocation: DepartmentLocation;
  @Input() selectedDepartment: Department;
  @Output() showAllDepartmentLocations = new EventEmitter<boolean>();

  userInfo = this.constants.getUserInfo();
  storeLocationList: StoreLocation[];
  storeLocationSalesRestriction: any;
  storeLocationTaxList: any;
  initialFormValues: any;
  isStoreLocationLoading = true;
  isLocationTaxLoading: any;
  isStoreLocationSalesRestLoading: any;
  currentDate = moment().format('MM-DD-YYYY');
  newDeptLocationForm = this._fb.group({
    storeLocationID: [''],
    storeLocationTaxID: [''],
    storeLocationSalesRestrictionID: [''],
    posDepartmentCode: ['', [Validators.max(9999)]],
    profitPercent: ['', [Validators.max(100), Validators.maxLength(3)]],
    deptProductCode: ['', [Validators.max(9999), Validators.maxLength(4)]],
    posDepartmentDescription: [''],
    updateSellingPriceInEDIInvoiceFlag: [false],
    updateDescInEDIInvoiceFlag: [false],
    isBlueLaw1Enabled: [false],
    isBlueLaw2Enabled: [false],
    userName: [''],
    departmentID: [0],
  });
  isStatusShow: boolean;
  submited = false;
  constructor(
    private _fb: FormBuilder, private constants: ConstantService,
    private _tstr: ToastrService,
    private _setupService: SetupService,
    private spinner: NgxSpinnerService
    , private storeService: StoreService,
  ) {
    this.initialFormValues = this.newDeptLocationForm.value;
  }


  ngOnInit() {
    // this.storeLocationList = [];
    this.getStoreLocationDetails();
    console.log(this.selectedDepartment);
    if (this.selectedDepartmentLocation) {
      this.newDeptLocationForm.reset();
      this.newDeptLocationForm.patchValue(this.selectedDepartmentLocation);
      this.getStoreLocationSalesRestriction(this.newDeptLocationForm.get('storeLocationID').value);
      this.getStoreLocationTax(this.newDeptLocationForm.get('storeLocationID').value);
    } else {
      this.disableFields();
    }
  }
  get deptLocationFormValid() { return this.newDeptLocationForm.controls; }

  saveOrUpdate(): string {
    switch (this.formMode) {
      case FormMode.ADD:
        return 'Save';
      case FormMode.EDIT:
        return 'Update';
    }
  }
  reset() {
    this.newDeptLocationForm.patchValue(this.initialFormValues);
  }
  disableFields() {
    this.newDeptLocationForm.controls['storeLocationSalesRestrictionID'].disable();
    this.newDeptLocationForm.controls['storeLocationTaxID'].disable();
    this.newDeptLocationForm.controls['posDepartmentCode'].disable();
    this.newDeptLocationForm.controls['profitPercent'].disable();
    this.newDeptLocationForm.controls['deptProductCode'].disable();
    this.newDeptLocationForm.controls['posDepartmentDescription'].disable();

  }
  enabledFields() {
    this.newDeptLocationForm.controls['storeLocationSalesRestrictionID'].enable();
    this.newDeptLocationForm.controls['storeLocationTaxID'].enable();
    this.newDeptLocationForm.controls['posDepartmentCode'].enable();
    this.newDeptLocationForm.controls['profitPercent'].enable();
    this.newDeptLocationForm.controls['deptProductCode'].enable();
    this.newDeptLocationForm.controls['posDepartmentDescription'].enable();
  }

  storeLocationTypeChange() {
    this.enabledFields();
    this.isStoreLocationSalesRestLoading = true;
    this.isLocationTaxLoading = true;
    const selectedStoreLocationId = this.newDeptLocationForm.get('storeLocationID').value;
    this.getStoreLocationSalesRestriction(selectedStoreLocationId);
    this.getStoreLocationTax(selectedStoreLocationId);
    this.isLocationTaxLoading = true;
    this.isStoreLocationSalesRestLoading = true;
  }
  save(andClose?: boolean) {
    if (this.formMode === FormMode.ADD) {
      this.store(andClose);
    } else if (this.formMode === FormMode.EDIT) {
      this.update(andClose);
    }
  }
  backToList() {
    this.showAllDepartmentLocations.emit(true);
    window.scrollTo(0, 0);
  }
  getStoreLocationDetails() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.storeLocationList = response;
        this.isStoreLocationLoading = false;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.newDeptLocationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
          this.enabledFields();
          this.getStoreLocationSalesRestriction(this.newDeptLocationForm.value.storeLocationID);
          this.getStoreLocationTax(this.newDeptLocationForm.value.storeLocationID);
        }
      });
  }
  get newDeptLocationFormValue() { return this.newDeptLocationForm.value; }
  store(andClose?: boolean) {

    this.submited = true;
    if (this.newDeptLocationForm.valid) {
      const payload: DepartmentLocation = {
        ... this.newDeptLocationForm.value,
        departmentLocationID: 0,
        storeLocationID: this.newDeptLocationFormValue.storeLocationID,
        departmentID: this.selectedDepartment.departmentID,
        storeLocationTaxID: this.newDeptLocationFormValue.storeLocationTaxID ? this.newDeptLocationFormValue.storeLocationTaxID : 0,
        storeLocationSalesRestrictionID: this.newDeptLocationFormValue.storeLocationSalesRestrictionID ?
          this.newDeptLocationFormValue.storeLocationSalesRestrictionID : 0,
        posDepartmentCode: this.newDeptLocationFormValue.posDepartmentCode,
        profitPercent: this.newDeptLocationFormValue.profitPercent ? this.newDeptLocationFormValue.profitPercent : 0,
        deptProductCode: this.newDeptLocationFormValue.deptProductCode ? this.newDeptLocationFormValue.deptProductCode : 0,
        posDepartmentDescription: this.newDeptLocationFormValue.posDepartmentDescription ?
          this.newDeptLocationFormValue.posDepartmentDescription : '',
        updateSellingPriceInEDIInvoiceFlag: this.newDeptLocationFormValue.updateSellingPriceInEDIInvoiceFlag ?
          this.newDeptLocationFormValue.updateSellingPriceInEDIInvoiceFlag : false,
        updateDescInEDIInvoiceFlag: this.newDeptLocationFormValue.updateDescInEDIInvoiceFlag ?
          this.newDeptLocationFormValue.updateDescInEDIInvoiceFlag : false,
        isBlueLaw1Enabled: this.newDeptLocationFormValue.isBlueLaw1Enabled ? this.newDeptLocationFormValue.isBlueLaw1Enabled : false,
        isBlueLaw2Enabled: this.newDeptLocationFormValue.isBlueLaw2Enabled ? this.newDeptLocationFormValue.isBlueLaw2Enabled : false,
        userName: this.userInfo.userName,
        posSyncStatusID: 0,
        currentAsOfDateTime: this.currentDate,
        updateDescInEDIInv: true,
        isUpdateTaxandRestrication: true,
        salesRestrictionDescription: '',
        salesRestrictFlag: true,
        prohibitDiscountFlag: true,
        taxStrategyDescription: '',
        countyTax: 0,
        stateTax: 0,
        cityTax: 0,
        storeName: '',
        posSystemCD: '',
        posSyncStatusCode: '',
      };
      this.spinner.show();
      this._setupService.postData(`DepartmentLocation`, payload).subscribe((data) => {
        this.spinner.hide();
        console.log(data);

        let errorMessage = '';
        if (data.statusCode === 500) {
          this._tstr.error(this.constants.infoMessages.contactAdmin);
          return;
        }
        if (data.statusCode === 400) {
          data.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to save department location');
          return;
        } else if (data && data.departmentLocationID) {
          this.newDeptLocationForm.reset();
          this.newDeptLocationForm.patchValue(data);
          this.selectedDepartmentLocation = data;
          this.formMode = FormMode.EDIT;
        }
        this.isStatusShow = true;
        this.submited = false;
        this._tstr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
        // this.reset();
        if (andClose) {
          this.backToList();
        }
      }, err => {
        this.spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to save department');
        } else {
          this.spinner.hide();
          this._tstr.error('Unable to save department');
        }
      });
    }
  }

  update(andClose?: boolean) {
    this.submited = true;
    if (this.newDeptLocationForm.valid) {
      const payload: DepartmentLocation = {
        ... this.newDeptLocationForm.value,
        userName: this.userInfo.userName,
        departmentLocationID: this.selectedDepartmentLocation.departmentLocationID,
        POSSyncStatusID: 1,
        posSystemCD: '',
        posSyncStatusCode: '',
      };
      this.spinner.show();
      this._setupService.updateData(`DepartmentLocation`, payload).subscribe((data) => {
        this.spinner.hide();
        this.submited = false;
        let errorMessage = '';
        if (data.statusCode === 500) {
          this._tstr.error(this.constants.infoMessages.contactAdmin);
          return;
        }
        if (data.statusCode === 400) {
          data.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to update department location');
          return;
        }
        if (data === '1') {
          this._tstr.success('Department location updated successfully', 'Updated');
        }
        if (andClose) {
          this.backToList();
        }
      }, err => {
        this.spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._tstr.error(errorMessage, 'Unable to save department');
        } else {
          this.spinner.hide();
          this._tstr.error('Unable to save department');
        }
      });
    }
  }

  displayFormTitle() {
    if (this.formMode === FormMode.ADD) {
      return 'Add a New Department Location';
    } else if (this.formMode === FormMode.EDIT) {
      return `Editing Department Location - ${this.selectedDepartmentLocation.departmentLocationID}`;
    }
  }
  getStoreLocationSalesRestriction(storeLocationID) {
    this.newDeptLocationForm.get('storeLocationSalesRestrictionID').setValue('');
    this.storeLocationSalesRestriction = [];
    this._setupService.getData(`StoreLocationSalesRestriction/getByLocationID/${storeLocationID}`).
      subscribe(result => {
        this.storeLocationSalesRestriction = result;
        this.isStoreLocationSalesRestLoading = false;
        if (this.selectedDepartmentLocation) {
          this.newDeptLocationForm.get('storeLocationSalesRestrictionID').
            setValue(this.selectedDepartmentLocation.storeLocationSalesRestrictionID);
        }
      }, error => {
        console.log(error);
      });
  }
  getStoreLocationTax(storeLocationID) {
    this.newDeptLocationForm.get('storeLocationTaxID').setValue('');
    this.storeLocationTaxList = [];
    this._setupService.getData(`StoreLocationTax/getByLocationId/${storeLocationID}`).
      subscribe(result => {
        this.isLocationTaxLoading = false;
        this.storeLocationTaxList = result;
        if (this.selectedDepartmentLocation) {
          this.newDeptLocationForm.get('storeLocationTaxID').setValue(this.selectedDepartmentLocation.storeLocationTaxID);
        }
      }, error => {
        console.log(error);
      });

  }
  resetForm() {
    this.newDeptLocationForm.patchValue(this.initialFormValues);
    this.submited = false;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.newDeptLocationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this.enabledFields();
      this.getStoreLocationSalesRestriction(this.newDeptLocationForm.value.storeLocationID);
      this.getStoreLocationTax(this.newDeptLocationForm.value.storeLocationID);
    }
  }
}
