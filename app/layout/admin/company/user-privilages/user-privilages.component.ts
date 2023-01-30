import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { GridApi, GridOptions } from 'ag-grid-community';
import { TestService } from '@shared/services/test/test.service';
import { GridService } from '@shared/services/grid/grid.service';
import { UtilityService } from '@shared/services/utility/utility.service';
@Component({
  selector: 'app-user-privilages',
  templateUrl: './user-privilages.component.html',
  styleUrls: ['./user-privilages.component.scss']
})
export class UserPrivilagesComponent implements OnInit, OnChanges {
  @Input() userId: any;
  @Input() RoleId: any;
  @Input() CompanyId: any;
  @Input() companyData: any;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  privilagesList: any;
  orginPrivilagesList: any;
  isEdit = false;
  roles: any;
  // roleId: any = null;
  _companyRoleId: any;
  submitted: boolean;
  //  CompanyId: any;
  isRoleLoading = true;
  userList: any;
  gridOption: GridOptions;
  gridApi: GridApi;
  // userObj: any;
  roleDefaultPrivilegeList: any;
  userBasedPrivilege: any;
  defaultGridOptions: GridOptions;
  constructor(private constants: ConstantService, private toastr: ToastrService, private gridServiceEdit: EditableGridService
    , private authService: SetupService, private route: ActivatedRoute, private spinner: NgxSpinnerService
    , private utilityService: UtilityService, private gridService: GridService) {
    this.gridOption = this.gridService.getGridOption(this.constants.gridTypes.userPrivilegeGrid);
    this.defaultGridOptions = this.gridService.getGridOption(this.constants.gridTypes.defaultRolePrivilegeGrid);

  }

  ngOnInit() {
    this.getPrivilages();
  }

  ngOnChanges() {
    // if (this.companyData) {
    //   this.CompanyId = this.companyData.companyID;
    //   this.getCompanyUserList(this.CompanyId);
    // }
  }
  onGridReady(params) {
    this.gridApi = params.api;
  }
  getCompanyUserList(companyId) {
    this.spinner.show();
    this.authService.getData('Users/GetUsersByCompanyId/CompanyId/' + companyId).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.userList = [];
        }
        this.userList = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  getPrivilages() {
    this.authService.getData('RoleBasedPrivileges/GetAll').subscribe(
      (response) => {
        if (response && response.length > 0) {
          response.forEach(function (x) {
            x.isChecked = false;
            x.normaliseName = x.normaliseName.toUpperCase();
          });
        }
        const data = _.filter(response, ['isParent', false]);
        this.orginPrivilagesList = _.sortBy(data, o => o.id);
        this.selectPrivilagesByUser();
      });
  }
  selectPrivilagesByUser() {
    this.privilagesList = [];
    this.userBasedPrivilege = [];
    this.roleDefaultPrivilegeList = null;
    if (this.userId && this.CompanyId) {
      const userId = this.userId;
      this.spinner.show();
      this.authService.getData(`RoleBasedPrivileges/GetRoleDefaultPrivilege/${this.RoleId}`).subscribe(
        (response) => {
          this.spinner.hide();
          response.forEach(function (x) {
            x.isChecked = true;
            x.normaliseName = x.normaliseName.toUpperCase();
          });
          this.roleDefaultPrivilegeList = response;

          this.getUserBasedPrivilege(userId, this.CompanyId);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }

  }
  getUserBasedPrivilege(userId, companyId) {
    this.spinner.show();
    this.authService.getData(`RoleBasedPrivileges/GetUserBasedPrivileges/${userId}/${companyId}`).subscribe(
      (response) => {
        this.spinner.hide();
        this.userBasedPrivilege = response;
        const arr = [...this.orginPrivilagesList];

        this.setPrivilegesUser(arr);
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  setPrivilegesUser(arr) {
    arr.forEach(x => {
      x['isDefault'] = false;
      x['isChecked'] = false;
    });
    const data = this.utilityService.setReadonlyPrivileage(arr, this.roleDefaultPrivilegeList, 'id', 'isChecked');
    const checkPrivilagesList = this.userBasedPrivilege;
    const prArr = data;
    this.isEdit = this._companyRoleId ? true : false;
    if (checkPrivilagesList.length > 0) {
      checkPrivilagesList.forEach(element => {
        prArr.forEach(x => {
          if (element.privilegeUrlId === x.id) {
            x['isChecked'] = true;
          }
        });
      });
      this.privilagesList = prArr;
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 500);

    } else {
      prArr.forEach(x => {
        if (!x['isDefault']) {
          x['isChecked'] = false;
        }
      });
      this.privilagesList = prArr;
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 500);
    }
    setTimeout(() => {
      if (this.privilagesList && this.privilagesList.length === 0) {
        this.gridApi.showNoRowsOverlay();
      } else {
        this.gridApi.hideOverlay();
      }
    }, 500);

  }
  addRoles() {
    const updatedList = [];
    this.privilagesList.forEach(x => {
      if (x.isDefault) {

      } else {
        if (x.isChecked) {
          updatedList.push(x);
        }
      }

    });
    if (updatedList.length <= 0) {
      this.toastr.error('Please check more then one privileges', 'Error');
      return;
    }
    const postData = {
      //  companyRoleId: this._companyRoleId ? this._companyRoleId : '',
      companyId: this.CompanyId,
      roleId: this.RoleId,
      userId: this.userId,
      privilegeList: updatedList
    };
    this.spinner.show();
    this.authService.postData('RoleBasedPrivileges/AddUserdPrivileges', postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constants.infoMessages.addedRecord, 'Save');
          this.getUserBasedPrivilege(this.userId, this.CompanyId);
        } else {
          this.toastr.error(this.constants.infoMessages.addRecordFailed, 'Error');
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.contactAdmin, 'Error');
      });
  }
  showComapnyList() {
    this.backToCompanyList.emit(false);
  }
}
