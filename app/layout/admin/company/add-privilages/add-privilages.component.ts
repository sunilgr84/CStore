import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-add-privilages',
  templateUrl: './add-privilages.component.html',
  styleUrls: ['./add-privilages.component.scss']
})
export class AddPrivilagesComponent implements OnInit, OnChanges {
  @Input() companyData: any;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  privilagesList: any;
  isEdit = false;
  roles: any;
  roleId: any = '';
  _companyRoleId: any;
  submitted: boolean;
  CompanyId: any;
  isRoleLoading = true;
  constructor(private constants: ConstantService, private toastr: ToastrService
    , private authService: SetupService, private route: ActivatedRoute, private spinner: NgxSpinnerService) {
  }

  ngOnInit() {
    this.getCompanyUserRoles();
    this.getPrivilages();
    const id = this.route.snapshot.paramMap.get('id');
    if (id || this.companyData) {
      this.CompanyId = id ? id : this.companyData.companyID;
    }
    // id ? this.CompanyId = id : this.CompanyId = this.companyData.companyID;
  }

  ngOnChanges() {
    if (this.companyData) {
      this.CompanyId = this.companyData.companyID;
    }
  }
  getCompanyUserRoles() {
    this.authService.getData('Roles/GetAllRoles').subscribe(
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
        this.roles = _.remove(response, (item) => {
          return item['normalizedName'].toLowerCase() !== this.constants.roleName;
        });
      });
  }
  getPrivilages() {
    this.authService.getData('Privilege/GetAll').subscribe(
      (response) => {
        this.privilagesList = response;
      });
  }
  selectPrivilagesByRole(role) {
    this.privilagesList.forEach(x => {
      x['isChecked'] = false;
    });
    this.isEdit = false;
    if (role && this.CompanyId) {
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this.authService.getData('CompanyRolesPrivileges/GetSelectedCompanyPrivilege/CompanyId/' + this.CompanyId + '/RoleId/' + role).subscribe(
        (response) => {
          const checkPrivilagesList = response.newUser;
          this._companyRoleId = response.companyRoleId;
          this.isEdit = this._companyRoleId ? true : false;
          this.spinner.hide();
          if (checkPrivilagesList.length > 0) {
            checkPrivilagesList.forEach(element => {
              this.privilagesList.forEach(x => {
                if (element === x.privilegeTitle) {
                  x['isChecked'] = true;
                }
              });
            });
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        });
    }
  }
  addRoles() {
    const updatedList = [];
    this.privilagesList.forEach(x => {
      if (x.isChecked) {
        updatedList.push(x);
      }
    });
    if (updatedList.length <= 0) {
      this.toastr.error('Please check more then one privileges', 'Error');
      return;
    }
    const postData = {
      companyRoleId: this._companyRoleId ? this._companyRoleId : '',
      companyId: this.CompanyId,
      roleId: this.roleId,
      privilegeList: updatedList
    };
    this.spinner.show();
    this.authService.postData('CompanyRolesPrivileges/AddUpdateCompanyPrivilege', postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          this.toastr.success(this.constants.infoMessages.addedRecord, 'Save');
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
