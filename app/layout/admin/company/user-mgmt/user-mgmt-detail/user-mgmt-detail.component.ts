import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { LoggerService } from '@shared/services/logger/logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '@shared/services/store/store.service';
import { MustMatch } from '@shared/validators/must-match.validator';
import { AgGridNg2 } from 'ag-grid-angular';
import { GridService } from '@shared/services/grid/grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-user-mgmt-detail',
  templateUrl: './user-mgmt-detail.component.html',
  styleUrls: ['./user-mgmt-detail.component.scss']
})
export class UserMgmtDetailComponent implements OnInit {
  @ViewChild('companyGridList') companyGridList: AgGridNg2;
  public isCollapsed = true;
  public isCollapsedNotification = true;
  public isCollapsedPrivilege = true;
  isLoading: boolean;
  @ViewChild('userName') _user: any;
  @ViewChild('emailId') _emailId: any;
  @Input() username: string;
  @Output() close = new EventEmitter<boolean>();
  @Output() backToUserList = new EventEmitter<any>();
  @Input() companyData: any;
  @Input() companyId: any;
  gridApi: any;
  companyEditGridOptions: any;
  storeEditGridOptions: any;
  isCompany = false;
  isStore = false;
  companyList: any;
  masterReportList: any;
  storeList: any;
  userPreferenceList: any;
  selectedStoreIds = [];
  companyIds = [];
  inputHireDate: any;
  inputDOB: any;
  inputStartDate: any;
  userEventList: Array<any> = [];
  allStoreList: Array<any> = [];
  userEventObj: any;
  userEventObjFinal: any;
  // tslint:disable-next-line:max-line-length
  roles: any;
  countyList: any;
  stateList: any;
  userInfo: any;
  submitted: boolean;
  isRoleLoading = true;
  isCompanyLoading = true;
  // userForm: FormGroup;
  userForm = this.formBuilder.group({
    id: [''],
    userName: ['', [Validators.required]],
    // password: ['', [Validators.required]],
    // confirmPassword: ['', [Validators.required]],
    password: ['', [Validators.minLength(8),
    Validators.pattern(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)]],
    confirmPassword: [''],
    email: ['', [Validators.required]],
    role: ['', [Validators.required]],
    companyId: ['', [Validators.required]],
    securityStamp: [''],
    companies: [],
    advancedDetails: this.formBuilder.group({
      employeeId: [0],
      firstName: [''],
      lastName: [''],
      address: [''],
      city: [''],
      country: [''],
      state: [''],
      zipCode: [''],
      phoneNo: [''],
      dateOfBirth: [''],
      ssn: [''],
      hourlyRate: 0,
      totalTimeOffHours: 0,
      hireDate: [''],
      startDate: [''],
      isAdmin: false,
      isActive: true,
      employeeType: ['']
    }),
    stores: [],
  }, {
    validator: MustMatch('password', 'confirmPassword')
  },
  );
  initialFormValues: any;
  isEdit: boolean;
  currentDate = moment().format('YYYY-MM-DD');
  isStateCountyMissMatch: boolean;
  roleName: string;
  isPasswordShow: boolean;
  isStoreLoading: boolean;
  isShowCompany = false;
  countyFilterList: any[];
  isEditEmail: any;
  roleNameSuperAdmin: string;
  newIndex: number = -1;
  newIndex2: number = -1;
  newIndex3: number = -1;
  tempEmail: any;
  tempPhone: any;
  constructor(private modalService: NgbModal, private formBuilder: FormBuilder, private toastr: ToastrService, private commonService: CommonService,
    private constants: ConstantService, private dataService: SetupService,
    private storeService: StoreService, private logger: LoggerService, private spinner: NgxSpinnerService,
    private editableGrid: GridService, private utilityService: UtilityService) {
    this.roleName = this.constants.roleName;
    this.companyEditGridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.userRoleWiseCompanyGrid);
    this.initialFormValues = this.userForm.value;
  }

  ngOnInit() {
    this.isEditEmail = false;
    this.userInfo = this.constants.getUserInfo();
    this.commonService.companyNames = this.companyData && this.companyData.companyNames ? this.companyData.companyNames.split(',') : null;
    this.isEdit = this.companyData && this.companyData.id ? true : false;
    this.getCompanyUserRoles();
    this.getCounty();
    this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.companyId);
    this.getReportTypeById(this.userInfo.userName);
    this.getAllStoreList();
    this.updateProfile();
    this.companyId = this.companyData && this.companyData.companyID ? this.companyData.companyID : this.companyId;
    this.companyIds.push(this.companyId);
  }

  get f() { return this.userForm.controls; }
  get advanced(): any { return this.userForm.get('advancedDetails'); }
  getGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridApi = params.api;
  }
  updateProfile() {
    this.userForm.patchValue({
      id: this.companyData ? this.companyData.id : '',
      userName: this.companyData ? this.companyData.userName : '',
      email: this.companyData && this.companyData.email ? this.companyData.email : '',
      companyId: this.companyId,
      role: this.companyData && this.companyData.role ? this.companyData.role : '',
      securityStamp: this.companyData && this.companyData.securityStamp ? this.companyData.securityStamp : '',
      stores: this.companyData && this.companyData.storeNames ? this.companyData.storeNames.split(', ') : null,
      companies: this.companyData && this.companyData.companyNames ? this.companyData.companyNames.split(', ') : null,
      advancedDetails: ({
        phoneNo: this.companyData && this.companyData.phoneNumber ? this.companyData.phoneNumber : '',
        employeeId: this.companyData && this.companyData.employeeId ? this.companyData.employeeId : 0,
        firstName: this.companyData && this.companyData.firstName ? this.companyData.firstName : '',
        lastName: this.companyData && this.companyData.lastName ? this.companyData.lastName : '',
        address: this.companyData && this.companyData.address ? this.companyData.address : '',
        city: this.companyData && this.companyData.city ? this.companyData.city : '',
        country: this.companyData && this.companyData.country ? this.companyData.country : '',
        state: this.companyData && this.companyData.state ? this.companyData.state : '',
        zipCode: this.companyData && this.companyData.zipCode ? this.companyData.zipCode : '',
        ssn: [],
        hourlyRate: this.companyData && this.companyData.hourlyRate ? Number(this.companyData.hourlyRate) : '',
        totalTimeOffHours: this.companyData && this.companyData.totalTimeOffHours ? Number(this.companyData.totalTimeOffHours) : '',
        dateOfBirth: this.companyData && this.companyData.dateOfBirth !== '0001-01-01T00:00:00' ?
          this.companyData.dateOfBirth : this.currentDate,
        hireDate: this.companyData && this.companyData.hireDate !== '0001-01-01T00:00:00' ?
          this.companyData.hireDate : this.currentDate,
        startDate: this.companyData && this.companyData.startDate !== '0001-01-01T00:00:00' ?
          this.companyData.startDate : this.currentDate,
      }),
    });
    this.inputDOB = this.advanced.value.dateOfBirth ? this.advanced.value.dateOfBirth : this.currentDate;
    this.inputHireDate = this.advanced.value.hireDate ? this.advanced.value.hireDate : this.currentDate;
    this.inputStartDate = this.advanced.value.startDate ? this.advanced.value.startDate : this.currentDate;
    this.isEditEmail = this.userForm.get('email').value ? true : false;
    this.tempEmail = this.userForm.value.email;
    this.tempPhone = this.userForm.value.phoneNo;
    this.isEdit ? this.userForm.controls['userName'].disable() : this.userForm.controls['userName'].enable();
    this.isEdit && this.isEditEmail ? this.userForm.controls['email'].disable() : this.userForm.controls['email'].enable();
    this.isEdit ? this.userForm.controls['password'].disable() : this.userForm.controls['password'].enable();
    this.isEdit ? this.userForm.controls['confirmPassword'].disable() : this.userForm.controls['confirmPassword'].enable();
    // this.isEdit ? this.userForm.controls['email'].disable() : this.userForm.controls['email'].enable();
    this.isPasswordShow = this.isEdit && this.userInfo.roleName.toLowerCase() !== this.constants.roleName ? false : true;
    this._user.nativeElement.focus();
    this.showGrid();
  }
  showGrid() {
    this.isCompany = this.isStore = false;
    this.isShowCompany = true;
    if (this.userForm.value.role.toLowerCase() === ('cashiers').toLowerCase() ||
      this.userForm.value.role.toLowerCase() === ('StoreManager').toLowerCase()) {
      this.userForm.get('companies').setValue([])
      this.getStoreLocations(this.companyId);
      this.isStore = true;
      this.isShowCompany = false;
    } else if (this.userForm.value.role.toLowerCase() === ('CompanyAdmin').toLowerCase()) {
      this.isCompany = true;
    }
  }
  getCounty() {
    this.dataService.getCountyState()
      .subscribe((response) => {
        if (response && response['statusCode']) {
          this.countyList = this.stateList = [];
          return;
        }
        this.countyList = response[0];
        this.stateList = response[1];
        this.onStateChange(true);
      });
  }
  cancel() {
    this.companyData = null;
    this.isEdit = this.submitted = this.isCompany = this.isStore = false;
    this.userForm.patchValue(this.initialFormValues);
    this.userForm.get('companyId').setValue(Number(this.companyId));
    const obj = _.find(this.companyList, ['companyID', this.userForm.get('companyId').value]);
    if (obj) {
      this.userForm.get('companies').setValue([obj.companyName]);
    }
    this.userForm.controls['userName'].enable();
    this.userForm.controls['email'].enable();
    this.inputHireDate = this.inputStartDate = this.inputDOB = '';
  }
  getCompanyUserRoles() {
    this.dataService.getData('Roles/GetAllRoles').subscribe(
      (response) => {
        this.isRoleLoading = false;
        // response.forEach(element => {
        //   // const roleName = element.name.match(/[A-Z][a-z]+/g);
        //     const roleName = element.name;
        //   // let rName = '';
        //   // roleName.forEach(name => {
        //   //   rName += name + ' ';
        //   // });
        //   element.name = roleName.trim();
        // });
        if (this.userInfo.roleName.toLowerCase() === this.constants.roleName) {
          this.roles = response;
        } else {
          this.roles = _.remove(response, (item) => {
            return item['name'].toLowerCase() !== this.constants.roleName;
          });
        }

      });
  }
  getStoreLocations(companyId) {
    this.isStoreLoading = true;
    this.storeService.getStoresByCompanyId(companyId).subscribe(
      (response) => {
        this.isStoreLoading = false;
        this.storeList = response;
        if (this.isEdit) {
          this.onUpdateStoreSelect();
        }
        if (this.storeList && this.storeList.length === 1) {
          this.selectedStoreIds = [];
          this.selectedStoreIds.push(this.storeList[0].storeLocationID);
        }
      });
  }

  getCompaniesById(roleName, userName, companyId) {
    this.dataService.getData('Company/list/' + roleName + '/' + userName + '/' + companyId).subscribe(
      (response) => {
        this.companyList = response;
        this.userForm.get('companyId').setValue(Number(this.companyId));

        const obj = _.find(this.companyList, ['companyID', this.userForm.get('companyId').value]);
        if (obj && !this.userForm.get('companies').value) {
          this.userForm.get('companies').setValue([obj]);
        }
        this.isCompanyLoading = false;
      });
  }
  getReportTypeById(userName) {
    this.dataService.getData('EntitlementConfig/Get?username=' + userName).subscribe(
      (response: any) => {
        this.masterReportList = response.result;
        this.getUserPreferences(this.userInfo.userName);
      });
  }
  validateMultiStore() {
    if (this.selectedStoreIds.length <= 0) {
      this.toastr.error('Please select stores...!');
      return true;
    }
    return false;
  }
  createCompanyUser(isNext?) {
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    this.submitted = true;
    if (this.isCompany) {
      this.validateCompanyGrid();
    }
    if (this.isStore) {
      const invalid = this.validateMultiStore();
      if (invalid) {
        return;
      }
    }
    const userCreateData = this.getFormGroupData();
    if (this.userForm.invalid) {
      return;
    }
    this.spinner.show();
    userCreateData.role = userCreateData.role && userCreateData.role.toUpperCase();
    this.dataService.postData('Users/CreateNewUser', userCreateData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          return;
        }
        if (response) {
          this.toastr.success('Company user added successfuly..', 'Save');
          if (isNext) {
            this.backToList();
            return;
          }
          this.cancel();
        } else {
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        }
      }, (error) => {
        this.spinner.hide();
        this.logger.error(error);
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }
  validateCompanyGrid(): any {
    // const selectedNodes = this.companyGridList['gridApi'].getSelectedNodes();
    // const companysList = [];
    // selectedNodes.forEach(x => {
    //   companysList.push(x.data.companyID);
    // });
    // this.companyIds = this.userForm.get('companies').value ? this.userForm.get('companies').value : [];
  }
  updateCompanyUser(isNext?) {
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    this.submitted = true;
    if (this.isCompany) {
      this.validateCompanyGrid();
    }
    if (this.isStore) {
      const invalid = this.validateMultiStore();
      if (invalid) {
        return;
      }
    }
    const userCreateData = this.getFormGroupData();
    if (this.userForm.invalid) {
      return;
    }
    this.spinner.show();
    this.dataService.postData('Users/UpdateCreatedUser', userCreateData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          return;
        }
        if (response) {
          this.toastr.success('Company user updated successfuly..', 'Save');
          if (isNext) {
            this.backToList();
            return;
          }
        } else {
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        }
      }, (error) => {
        this.spinner.hide();
        this.logger.error(error);
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }
  // insert & updated body
  getFormGroupData() {
    const dob = this.advanced.controls.dateOfBirth.value && this.advanced.controls.dateOfBirth.value !== '0001-01-01T00:00:00' ?
      this.advanced.controls.dateOfBirth.value : new Date();
    const hireDate = this.advanced.controls.hireDate.value && this.advanced.controls.hireDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.controls.hireDate.value : new Date();
    const startDate = this.advanced.controls.startDate.value && this.advanced.controls.startDate.value !== '0001-01-01T00:00:00' ?
      this.advanced.controls.startDate.value : new Date();
    return {
      id: this.isEdit ? this.userForm.controls.id.value : 0,
      securityStamp: this.isEdit ? this.userForm.controls.securityStamp.value : null,
      employeeId: this.advanced.controls.employeeId.value ? this.advanced.controls.employeeId.value : 0,
      password: this.userForm.controls.password.value ? this.userForm.controls.password.value : '',
      companyId: this.userForm.controls.companyId.value,
      userName: this.userForm.get('userName').value,
      role: this.userForm.controls.role.value,
      companyIds: this.userForm.value.role.toLowerCase() === ('cashiers').toLowerCase() ||
        this.userForm.value.role.toLowerCase() === ('StoreManager').toLowerCase() ? [] : this.userForm.get('companies').value.map(x => x.companyID),
      storeIds: this.selectedStoreIds && this.isStore ? this.selectedStoreIds : [],
      email: this.userForm.get('email').value,
      phoneNumber: this.advanced.controls.phoneNo.value ? this.advanced.controls.phoneNo.value : '',
      firstName: this.advanced.controls.firstName.value ? this.advanced.controls.firstName.value : '',
      lastName: this.advanced.controls.lastName.value ? this.advanced.controls.lastName.value : '',
      address: this.advanced.controls.address.value ? this.advanced.controls.address.value : '',
      city: this.advanced.controls.city.value ? this.advanced.controls.city.value : '',
      country: this.advanced.controls.country.value ? this.advanced.controls.country.value : '',
      state: this.advanced.controls.state.value ? this.advanced.controls.state.value : '',
      zipCode: this.advanced.controls.zipCode.value ? this.advanced.controls.zipCode.value : '',
      dateOfBirth: dob.toString() !== 'Invalid Date' && dob ? dob : this.advanced.controls.dateOfBirth.value,
      ssn: [], // this.advanced.controls.ssn.value,
      hourlyRate: this.advanced.controls.hourlyRate.value ? Number(this.advanced.controls.hourlyRate.value) : 0,
      totalTimeOffHours: this.advanced.controls.totalTimeOffHours.value ? Number(this.advanced.controls.totalTimeOffHours.value) : 0,
      hireDate: hireDate.toString() !== 'Invalid Date' && hireDate ? hireDate : this.advanced.controls.hireDate.value,
      startDate: startDate.toString() !== 'Invalid Date' && startDate ? startDate : this.advanced.controls.startDate.value,
    };
  }
  onStoreSelect(event) {
    this.selectedStoreIds = [];
    event.forEach(element => {
      this.selectedStoreIds.push(element.storeLocationID);
    });
  }
  onCompanySelect(event) {
    this.companyIds = [];
    event.forEach(element => {
      this.companyIds.push(element.companyID);
    });
  }
  onUpdateStoreSelect() {
    this.selectedStoreIds = [];
    if (!this.userForm.value.stores) {
      return;
    }
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
    // tslint:disable-next-line:prefer-const
    let prevEmailId: any;
    if (this.companyData && this.companyData.email) {
      prevEmailId = this.companyData.email;
    }
    if (email && prevEmailId !== email) {
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
    this.userForm.get('advancedDetails.phoneNo').setValue(this.utilityService.formatPhoneNumber(phoneNo));
  }
  onCountyChange(countyCode) {
    this.isStateCountyMissMatch = false;
    this.countyList.map(
      x => {
        if (x.countyCode === countyCode) {
          this.userForm.get('advancedDetails.state').setValue(x.stateCode);
        }
      });
  }
  // onStateChange(stateCode) {
  //   this.isStateCountyMissMatch = false;
  //   const county = _.find(this.countyList, (item) => {
  //     if (item.countyCode === this.advanced.controls.country.value) {
  //       return item;
  //     }
  //   });
  //   if (county && county.stateCode !== stateCode) {
  //     this.isStateCountyMissMatch = true;
  //     this.toastr.warning('Please change the county');
  //   }
  // }
  onStateChange(isTrue?) {
    // tslint:disable-next-line:no-unused-expression
    isTrue ? '' : this.advanced.get('country').setValue('');
    if (!this.advanced.get('state').value) {
      this.countyFilterList = [];
      return;
    }
    const state = this.advanced.get('state').value;
    this.countyFilterList = _.filter(this.countyList, ['stateCode', state]);
    if (isTrue) {
      this.userForm.get('advancedDetails.country').setValue(this.advanced.get('country').value);
    }
  }
  dateChange(event, controls) {
    if (controls === 'dob' && event) {
      this.userForm.get('advancedDetails.dateOfBirth').setValue(event.formatedDate);
      this.inputDOB = event.formatedDate;
    }
    if (controls === 'hireDate' && event) {
      this.userForm.get('advancedDetails.hireDate').setValue(event.formatedDate);
      this.inputHireDate = event.formatedDate;
    }
    if (controls === 'startDate' && event) {
      this.userForm.get('advancedDetails.startDate').setValue(event.formatedDate);
      this.inputStartDate = event.formatedDate;
    }
  }
  // onNavigatePrivilege() {
  //   const data = { tabId: 'tab-add-privilege' };
  //   this.changeTabs.emit(data);
  // }
  backToList() {
    this.backToUserList.emit(false);
  }

  // openData(j, l, i, reportTypeID) {
  //   if (this.newIndex3 == l && this.newIndex2 == j && this.newIndex == i) {
  //     this.newIndex3 = -1;
  //     this.newIndex2 = -1;
  //     this.newIndex = -1;

  //   } else {    
  //     this.newIndex3 = l;
  //     this.newIndex2 = j;
  //     this.newIndex = i;
  //   }
  // }

  addUserPreferences(l, m, n) {
    this.userEventList = [];

    this.userEventObj = {};
    this.userEventObjFinal = {};

    this.userEventObj.title = this.masterReportList[l].masterReports[m].reports[n].reportTypeName + " notification";
    this.userEventObj.description = "No description";
    this.userEventObj.reportType = this.masterReportList[l].masterReports[m].reports[n].reportTypeName;
    this.userEventObj.isSMS = this.masterReportList[l].masterReports[m].reports[n].isSMS;
    this.userEventObj.isWhatsApp = this.masterReportList[l].masterReports[m].reports[n].isWhatsApp;
    this.userEventObj.isEmail = this.masterReportList[l].masterReports[m].reports[n].isEmail;
    this.userEventObj.seperationCount = 0;
    this.userEventObj.isRecurring = true;
    this.userEventObj.recurringTypeId = this.masterReportList[l].masterReports[m].reports[n].recurringTypeId;
    this.userEventObj.storelocations = this.masterReportList[l].masterReports[m].reports[n].storeList;

    this.userEventList.push(this.userEventObj);

    this.userEventObjFinal.reportDetails = this.userEventList;
    this.userEventObjFinal.refData = {
      phone_no: this.tempPhone,
      email: this.tempEmail
    },
      this.userEventObjFinal.username = this.userInfo.userName;
    // api call
    if (this.userEventList[0].storelocations.length != 0) {
      this.dataService.postData('/Notification/AddUpdate', this.userEventObjFinal).subscribe(
        (response: any) => {
          console.log("response" + response);
          this.toastr.success("Sucessfully Added");
        })
    } else {
      this.toastr.error("Please select at least one store");
    }
  }


  updateCheckBox(k, l, i, data) {

    if (data.substring(0, 3) == "SMS") {
      if (this.masterReportList[k].masterReports[l].reports[i].isSMS) {
        this.masterReportList[k].masterReports[l].reports[i].isSMS = false;
      } else {
        this.masterReportList[k].masterReports[l].reports[i].isSMS = true;
      }
    } else if (data.substring(0, 8) == "WhatsApp") {
      if (this.masterReportList[k].masterReports[l].reports[i].isWhatsApp) {
        this.masterReportList[k].masterReports[l].reports[i].isWhatsApp = false;
      } else {
        this.masterReportList[k].masterReports[l].reports[i].isWhatsApp = true;
      }
    } else if (data.substring(0, 5) == "Email") {
      if (this.masterReportList[k].masterReports[l].reports[i].isEmail) {
        this.masterReportList[k].masterReports[l].reports[i].isEmail = false;
      } else {
        this.masterReportList[k].masterReports[l].reports[i].isEmail = true;
      }
    }


  }

  updateDefaultCheckBox(k, l, i, event) {
    if (this.masterReportList[k].masterReports[l].reports[i].isDefault) {
      this.masterReportList[k].masterReports[l].reports[i].isDefault = false;
    } else {
      this.masterReportList[k].masterReports[l].reports[i].isDefault = true;
    }
  }

  getUserPreferences(userName) {
    this.dataService.getData('EventScheduler/getuserpreferences/' + userName).subscribe(
      (responce: any) => {
        this.userPreferenceList = responce;

        this.masterReportList.forEach((element, l) => {
          element.masterReports.forEach((masterReport, m) => {
            masterReport.reports.forEach((report, n) => {
              report.storeListSize = 0;
              report.storeList = [];
            });
          });
        });

        if (this.userPreferenceList.length > 0) {
          this.userPreferenceList.forEach(element1 => {
            this.masterReportList.forEach((element, l) => {
              element.masterReports.forEach((masterReport, m) => {
                masterReport.reports.forEach((report, n) => {
                  if (element1.reportType == report.reportTypeName) {
                    report.isWhatsApp = element1.WhatsApp;
                    report.isSMS = element1.SMS;
                    report.isEmail = element1.Email;
                    report.storeListSize = element1.Stores.length;
                    report.storeList = element1.Stores;
                  }
                });
              });
            });
          });
        }

        this.masterReportList.forEach((element, l) => {
          element.masterReports.forEach((masterReport, m) => {
            masterReport.reports.forEach((report, n) => {
              report.storeListCount = report.storeListSize;
              report.sms = "SMS" + l + "" + m + "" + n;
              report.default = "default" + l + "" + m + "" + n;
              report.whatsApp = "WhatsApp" + l + "" + m + "" + n;
              report.email = "Email" + l + "" + m + "" + n;
              this.userForm.addControl(report.default, new FormControl(report.isDefault));
              this.userForm.addControl(report.sms, new FormControl(report.isSMS));
              this.userForm.addControl(report.whatsApp, new FormControl(report.isWhatsApp));
              this.userForm.addControl(report.email, new FormControl(report.isEmail));
            });
          });
        });
      })
  }

  getAllStoreList() {
    this.dataService.getData('/EntitlementConfig/GetStores?username=' + this.userInfo.userName + '&companyId=' + this.companyId).subscribe(
      (response: any) => {
        this.allStoreList = response.result;
        this.allStoreList.forEach(element => {
          element.flag = false;
        });
      })

  }
  tempK: any = 0;
  tempL: any = 0;
  tempI: any = 0;

  addNotification(k, l, i, notificationModel) {
    this.tempK = k;
    this.tempL = l;
    this.tempI = i;
    let tempStoreList = this.masterReportList[k].masterReports[l].reports[i].storeList;

    this.allStoreList.forEach(element => {
      element.flag = false;
    });

    if (tempStoreList.length != 0) {
      tempStoreList.forEach(element1 => {
        this.allStoreList.forEach(element => {
          if (element.StoreLocationID == element1) {
            element.flag = true;
          }
        });
      });
    }
    // this.buyDownForm.reset();
    // this.buyDownForm.get("buydownId").setValue(0);
    // this.buyDownInitialForm = this.buyDownForm.value;
    this.modalService.open(notificationModel, { centered: true });
  }

  changeStore(StoreLocationID) {

    var flag = this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeList.find(element => element == StoreLocationID);
    if (flag == undefined) {
      this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeList.push(StoreLocationID);
      this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListCount = 1 + this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListCount
      this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListSize = 1 + this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListSize;
    } else {
      var index = this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeList.indexOf(StoreLocationID);
      if (index > -1) {
        this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeList.splice(index, 1);
      }
      this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListCount = 1 - this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListCount
      this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListSize = 1 - this.masterReportList[this.tempK].masterReports[this.tempL].reports[this.tempI].storeListSize;
    }
  }


}
