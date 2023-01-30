import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '@shared/services/logger/logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreService } from '@shared/services/store/store.service';
import { MustMatch } from '@shared/validators/must-match.validator';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridService } from '@shared/services/grid/grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { TestService } from '@shared/services/test/test.service';

@Component({
  selector: 'app-employee-setup',
  templateUrl: './employee-setup.component.html',
  styleUrls: ['./employee-setup.component.scss']
})
export class EmployeeSetupComponent implements OnInit {
  // @ViewChild('companyGridList') companyGridList: AgGridNg2;
  public isCollapsed = true;
  isLoading: boolean;
  @ViewChild('userName') _user: any;
  @ViewChild('emailId') _emailId: any;
  @Input() username: string;
  @Input() companyData: any;
  @Input() companyId: any;
  gridApi: any;
  companyEditGridOptions: any;
  storeEditGridOptions: any;
  isCompany = false;
  isStore = false;
  companyList: any;
  storeList: any;
  selectedStoreIds = [];
  companyIds = [];
  inputHireDate: any;
  inputDOB: any;
  inputStartDate: any;
  roles: any;
  countyList: any;
  stateList: any;
  userInfo: any;
  submitted: boolean;
  isRoleLoading = true;
  isCompanyLoading = true;
  userForm = this.formBuilder.group({
    id: [''],
    // userName: ['', [Validators.required]],
    // password: ['', [Validators.required, Validators.minLength(8),
    // Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    // confirmPassword: ['', Validators.required],
    // email: ['', [Validators.required]],
    // role: ['', [Validators.required]],

    userName: [''],
    password: [''],
    confirmPassword: [''],
    email: ['', [Validators.required]],
    role: [''],

    companyId: [''],
    securityStamp: [''],
    employeeId: [0],
    firstName: [''],
    lastName: ['', [Validators.required]],
    address: ['', [Validators.required]],
    city: ['', [Validators.required]],
    country: ['', [Validators.required]],
    state: ['', [Validators.required]],
    zipCode: ['', [Validators.required]],
    phoneNo: [''],
    dateOfBirth: [''],
    ssn: [''],
    hourlyRate: [null],
    hireDate: [''],
    startDate: [''],
    isAdmin: false,
    isActive: true,
    stores: [],
    companies: this.formBuilder.array([]),
  }, {
      validator: MustMatch('password', 'confirmPassword')
    },
  );
  initialFormValues: any;
  isEdit: boolean;
  currentDate = moment('01-01-1990').format('MM-DD-YYYY');

  isStateCountyMissMatch: boolean;
  isNewEmployee: boolean;
  gridOptions: any;
  rowData: any;
  empNameList: any;
  selectedEmpList: any;
  constructor(private formBuilder: FormBuilder, private toastr: ToastrService, private commonService: CommonService,
    private constants: ConstantService, private dataService: SetupService, private testService: TestService,
    private storeService: StoreService, private logger: LoggerService, private spinner: NgxSpinnerService,
    private gridService: GridService, private utilityService: UtilityService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.employeeSetupGrid);
    this.initialFormValues = this.userForm.value;
  }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.companyId = this.companyData && this.companyData.companyID ? this.companyData.companyID : this.companyId;
    this.commonService.companyNames = this.companyData && this.companyData.companyNames ? this.companyData.companyNames.split(',') : null;
    this.isEdit = this.companyData && this.companyData.id ? true : false;
    this.getCompanyUserRoles();
    this.getCounty();
    this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.companyId);
    // this.updateProfile();
    this.getEmployeeNameList();
    this.getEmployeeList();
    this.getStoreLocations();
  }

  get f() { return this.userForm.controls; }
  get advanced() { return this.userForm.controls; }

  onGridReady(params) {
    this.gridApi = params.gridApi;
    // params.api.sizeColumnsToFit();
  }
  addNewEmployee() {
    this.isNewEmployee = true;
    this.cancel();
  }
  backToList() {
    this.isNewEmployee = false;
    this.getEmployeeList();
  }
  editAction(params) {
    this.isNewEmployee = true;
    this.isEdit = true;
    this.userForm.patchValue(params.data);
    this.inputDOB = params.data.startDate;
    this.inputHireDate = params.data.hireDate;
    this.inputStartDate = params.data.dateOfBirth;
    this.userForm.get('email').setValue(params.data.e_Mail);
    this.userForm.get('hourlyRate').setValue(params.data.payRate);
  }
  disableValidation() {
    this.userForm.get('ssn').clearValidators();
    this.userForm.get('userName').clearValidators();
    this.userForm.get('password').clearValidators();
    this.userForm.get('confirmPassword').clearValidators();
    this.userForm.get('role').clearValidators();

    // phoneControl.clearValidators();
  }
  getEmployeeList(empName?: string) {
    this.spinner.show();
    const empObj = empName ? empName : '';
    this.dataService.getData('EmployeeSetup/GetEmployee/GetEmployee?EmployeeName=' + empObj + '&CompanyID='
      + this.userInfo.companyId).subscribe((response) => {
        this.spinner.hide();
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
      });
  }
  getEmployeeNameList() {
    this.spinner.show();
    this.dataService.getData('EmployeeSetup/GetEmployeeNames/GetEmployeeNames?CompanyID=' +
      this.userInfo.companyId).subscribe((response) => {
        this.spinner.hide();
        this.empNameList = response;
      }, (error) => {
        this.spinner.hide();
      });
  }

  showGrid() {
    this.isCompany = this.isStore = false;
    if (this.userForm.value.role === ('Cashier').toUpperCase() || this.userForm.value.role === ('StoreManager').toUpperCase()) {

      this.isStore = true;
    } else if (this.userForm.value.role === ('CompanyAdmin').toUpperCase()) {
      this.isCompany = true;
    }
  }
  getCounty() {
    this.dataService.getCountyState()
      .subscribe((response) => {
        this.countyList = response[0];
        this.stateList = response[1];
      });
  }
  cancel() {
    this.companyData = null;
    this.isEdit = this.submitted = this.isCompany = this.isStore = false;
    this.userForm.patchValue(this.initialFormValues);
    this.userForm.get('companyId').setValue(this.companyId);
  }
  getCompanyUserRoles() {
    this.dataService.getData('Roles/GetAllRoles').subscribe(
      (response) => {
        this.isRoleLoading = false;
        response.forEach(element => {
          const roleName = element.name.match(/[A-Z][a-z]+/g);
          let rName = '';
          roleName.forEach(name => {
            rName += name + ' ';
          });
          element.name = rName.trim();
        });
        if (this.userInfo.roleName === this.constants.roleName) {
          this.roles = response;
        } else {
          this.roles = _.remove(response, (item) => {
            return item['normalizedName'].toLowerCase() !== this.constants.roleName;
          });
        }

      });
  }
  getStoreLocations() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.storeList = response;
        if (this.isEdit) {
          this.onUpdateStoreSelect();
        }
        this.selectedStoreIds = [];
        if (this.storeList && this.storeList.length === 1) {
          this.selectedStoreIds.push(this.storeList[0].storeLocationID);
        }
      });
  }

  getCompaniesById(roleName, userName, companyId) {
    this.dataService.getData('Company/list/' + roleName + '/' + userName + '/' + companyId).subscribe(
      (response) => {
        this.companyList = response;
        this.isCompanyLoading = false;
      });
  }
  validateMultiStore() {
    if (this.selectedStoreIds.length <= 0) {
      this.toastr.error('Please select stores...!');
      return true;
    }
    return false;
  }
  createCompany() {
    this.submitted = true;
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    if (this.userForm.invalid) {
      return;
    }
    // if (this.isCompany) {
    //   this.validateCompanyGrid();
    // }
    if (this.isStore) {
      const invalid = this.validateMultiStore();
      if (invalid) {
        return;
      }
    }
    // const userCreateData = this.getFormGroupData();
    const dob = this.advanced.dateOfBirth.value && this.advanced.dateOfBirth.value !== '0001-01-01T00:00:00' ?
      this.advanced.dateOfBirth.value : new Date();
    const hireDate = this.advanced.hireDate.value && this.advanced.hireDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.hireDate.value : new Date();
    const startDate = this.advanced.startDate.value && this.advanced.startDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.startDate.value : new Date();
    const storeLocationIdObj = this.advanced.stores.value ?
      this.userForm.value.stores.map(x => x.storeLocationID) : '';

    const postData = {
      id: this.isEdit ? this.userForm.controls.id.value : 0,
      securityStamp: this.isEdit ? this.userForm.controls.securityStamp.value : null,
      employeeId: this.advanced.employeeId.value ? this.advanced.employeeId.value : 0,
      password: this.userForm.controls.password.value,
      companyId: this.userInfo.companyId,
      userName: this.userForm.controls.userName.value,
      role: this.userForm.controls.role.value,
      companyIds: [],
      storeIds: storeLocationIdObj && this.isStore ? storeLocationIdObj : [],
      email: this.userForm.controls.email.value,
      phoneNumber: this.advanced.phoneNo.value ? this.advanced.phoneNo.value : '',
      firstName: this.advanced.firstName.value ? this.advanced.firstName.value : '',
      lastName: this.advanced.lastName.value ? this.advanced.lastName.value : '',
      address: this.advanced.address.value ? this.advanced.address.value : '',
      city: this.advanced.city.value ? this.advanced.city.value : '',
      country: this.advanced.country.value ? this.advanced.country.value : '',
      state: this.advanced.state.value ? this.advanced.state.value : '',
      zipCode: this.advanced.zipCode.value ? this.advanced.zipCode.value : '',
      dateOfBirth: dob.toString() !== 'Invalid Date' && dob ? dob : this.advanced.dateOfBirth.value,
      ssn: [], // this.advanced.ssn.value,
      hourlyRate: this.advanced.hourlyRate.value ? this.advanced.hourlyRate.value : 0,
      hireDate: hireDate.toString() !== 'Invalid Date' && hireDate ? hireDate : this.advanced.hireDate.value,
      startDate: startDate.toString() !== 'Invalid Date' && startDate ? startDate : this.advanced.startDate.value,
      normalizedUserName: '',
      normalizedEmail: '',
      payRoleTypeID: null,
      payTypeID: null,
    };
    this.spinner.show();
    this.dataService.postData('Users/CreateNewUser', postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response['statusCode'] === 400 && response['statusCode'] === 500) {
          this.toastr.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
          return;
        }
        if (response) {
          this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          this.cancel();
        } else {
          this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.logger.error(error);
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }
  // validateCompanyGrid(): any {
  //   const selectedNodes = this.companyGridList['gridApi'].getSelectedNodes();
  //   const companysList = [];
  //   selectedNodes.forEach(x => {
  //     companysList.push(x.data.companyID);
  //   });
  //   this.companyIds = companysList;
  // }
  updateComoany() {
    this.submitted = true;
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    // if (this.isCompany) {
    //   this.validateCompanyGrid();
    // }
    const userCreateData = this.getFormGroupData();
    // if (this.userForm.invalid) {
    //   return;
    // }
    this.spinner.show();
    this.dataService.postData('Users/UpdateCreatedUser', userCreateData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response['statusCode'] === 400 && response['statusCode'] === 500) {
          this.toastr.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
          return;
        }
        if (response) {
          this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
        } else {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.logger.error(error);
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }
  // insert & updated body
  getFormGroupData() {

    const dob = this.advanced.dateOfBirth.value && this.advanced.dateOfBirth.value !== '0001-01-01T00:00:00' ?
      this.advanced.dateOfBirth.value : new Date();
    const hireDate = this.advanced.hireDate.value && this.advanced.hireDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.hireDate.value : new Date();
    const startDate = this.advanced.startDate.value && this.advanced.startDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.startDate.value : new Date();
    const postData = {
      id: this.isEdit ? this.userForm.controls.id.value : 0,
      securityStamp: this.isEdit ? this.userForm.controls.securityStamp.value : null,
      employeeId: this.advanced.employeeId.value ? this.advanced.employeeId.value : 0,
      password: this.userForm.controls.password.value,
      companyId: this.userInfo.companyId,
      userName: this.userForm.controls.userName.value,
      role: this.userForm.controls.role.value,
      companyIds: [],
      storeIds: this.selectedStoreIds && this.isStore ? this.selectedStoreIds : [],
      email: this.userForm.controls.email.value,
      phoneNumber: this.advanced.phoneNo.value ? this.advanced.phoneNo.value : '',
      firstName: this.advanced.firstName.value ? this.advanced.firstName.value : '',
      lastName: this.advanced.lastName.value ? this.advanced.lastName.value : '',
      address: this.advanced.address.value ? this.advanced.address.value : '',
      city: this.advanced.city.value ? this.advanced.city.value : '',
      country: this.advanced.country.value ? this.advanced.country.value : '',
      state: this.advanced.state.value ? this.advanced.state.value : '',
      zipCode: this.advanced.zipCode.value ? this.advanced.zipCode.value : '',
      dateOfBirth: dob.toString() !== 'Invalid Date' && dob ? dob : this.advanced.dateOfBirth.value,
      ssn: [],
      hourlyRate: this.advanced.hourlyRate.value ? this.advanced.hourlyRate.value : 0,
      hireDate: hireDate.toString() !== 'Invalid Date' && hireDate ? hireDate : this.advanced.hireDate.value,
      startDate: startDate.toString() !== 'Invalid Date' && startDate ? startDate : this.advanced.startDate.value,
      normalizedUserName: '',
      normalizedEmail: '',
      payRoleTypeID: null,
      payTypeID: null,
    };
    return postData;
  }
  onStoreSelect(event) {
    this.selectedStoreIds = [];
    event.forEach(element => {
      this.selectedStoreIds.push(element.storeLocationID);
    });
  }
  onUpdateStoreSelect() {
    const event = this.storeList.filter((store) => this.userForm.value.stores.includes(store.storeName.trim()));
    event.forEach(element => {
      this.selectedStoreIds.push(element.storeLocationID);
    });
  }
  ValidateUserName(username) {
    if (username && username.trim() && !this.isEdit) {
      this.dataService.getData('Users/ValidateUserName/UserName/' + username).subscribe(
        (response) => {
          if (response === 'true') {
            this.toastr.error('User Name Already Exists', 'Error');
            this.userForm.get('userName').setValue(null);
            this._user.nativeElement.focus();
            return;
          }
        });
    }
  }
  ValidateEmail(email) {
    if (email && !this.isEdit) {
      this.dataService.getData('Users/ValidateEmailId/EmailId/' + email).subscribe(
        (response) => {
          if (response === 'true') {
            this.toastr.error('Email Already Exists', 'Error');
            this.userForm.get('email').setValue(null);
            this._emailId.nativeElement.focus();
            return;
          }
        });
    }
  }
  formatPhoneNumber(phoneNo) {
    this.userForm.get('phoneNo').setValue(this.utilityService.formatPhoneNumber(phoneNo));
  }
  onCountyChange(countyCode) {
    this.isStateCountyMissMatch = false;
    this.countyList.map(
      x => {
        if (x.countyCode === countyCode) {
          this.userForm.get('state').setValue(x.stateCode);
        }
      });
  }
  onStateChange(stateCode) {
    this.isStateCountyMissMatch = false;
    const county = _.find(this.countyList, (item) => {
      if (item.countyCode === this.advanced.country.value) {
        return item;
      }
    });
    if (county.stateCode !== stateCode) {
      this.isStateCountyMissMatch = true;
      this.toastr.warning('Please change the county');
    }
  }
  dateChange(event, controls) {
    if (controls === 'dob' && event) {
      this.userForm.get('dateOfBirth').setValue(event.formatedDate);
      this.inputDOB = event.formatedDate;
    }
    if (controls === 'hireDate' && event) {
      this.userForm.get('hireDate').setValue(event.formatedDate);
      this.inputHireDate = event.formatedDate;
    }
    if (controls === 'startDate' && event) {
      this.userForm.get('startDate').setValue(event.formatedDate);
      this.inputStartDate = event.formatedDate;
    }
  }
  searchEmp() {
    if (this.selectedEmpList) { this.getEmployeeList(this.selectedEmpList); }
  }
}
