import { Component, OnInit, ViewChild } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { routerTransition } from 'src/app/router.animations';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridApi } from 'ag-grid-community';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { RouteConfigService } from '@shared/services/routeConfig/route-config.service';
import * as _ from 'lodash';
import { TestService } from '@shared/services/test/test.service';


@Component({
  selector: 'app-roles-privileges',
  templateUrl: './roles-privileges.component.html',
  styleUrls: ['./roles-privileges.component.scss']
})
export class RolesPrivilegesComponent implements OnInit {

  privilagesList: any;
  rowData: any;
  gridOptions: any;
  initialFormValues: any;
  isEdit = false;
  gridApi: GridApi;
  @ViewChild('privilegeTitile') privilegeTitile: any;
  tempId: number;
  newRowAdded: any;
  filterText: string;
  userInfo = this.constants.getUserInfo();
  parentPrivilegeList: any[];
  childPrivilegeList: any;
  privilegeForm = {
    parentPrivilege: null,
    childPrivilege: null,
    id: 0,
    roleName: '',
    parentId: 0,
    parentName: '',
    name: '',
    urlPath: '',
    iconClass: '',
    iconName: '',
    customClass: '',
    normaliseName: '',
    isCompanyIdRequired: false,
    fragment: '',
    isParent: false
  };
  isAddNew: boolean;
  isSinglePrivilege = false;
  roles: any;
  allPrivileges: any;
  constructor(private dataService: SetupService, private gridService: GridService, private constants: ConstantService,
    private toastr: ToastrService, private spinner: NgxSpinnerService,
    private editableGrid: GridService, private testService: TestService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.privilageGrid);
  }

  ngOnInit() {
    this.getCompanyUserRoles();
    this.getAllPrivilages();
    //   this.parentPrivilegeList = this.route.getSuperAdminUrls(this.userInfo.companyId);
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }

  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId, privilegeId: 0, privilegeTitle: '', isSaveRequired: true,
    };
    return newData;
  }
  getCompanyUserRoles() {
    this.dataService.getData('Roles/GetAllRoles').subscribe(
      (response) => {
        if (this.userInfo.roleName.toLowerCase() === this.constants.roleName) {
          this.roles = _.remove(response, (item) => {
            return item['name'].toLowerCase() !== this.constants.roleName;
          });
        } else {
          this.roles = _.remove(response, (item) => {
            return item['name'].toLowerCase() !== this.constants.roleName;
          });
        }

      });
  }
  onInsertRowAt() {
    this.privilegeForm = {
      parentPrivilege: null,
      childPrivilege: null,
      id: 0, roleName: '',
      parentId: 0,
      parentName: '',
      name: '',
      urlPath: '',
      iconClass: '',
      iconName: '',
      customClass: '',
      normaliseName: '',
      isCompanyIdRequired: false,
      fragment: '',
      isParent: false
    };
    this.isAddNew = true;
    this.childPrivilegeList = [];
    return;
  }

  deleteAction(event) {
    if (event.data.id > 0) {
      const role = _.find(this.roles, ['name', this.privilegeForm.roleName]);
      this.spinner.show();
      this.dataService.deleteData(`RoleBasedPrivileges/DeleteRoleBase/${event.data.id}/${role.id}`)
        .subscribe(result => {
          this.spinner.hide();
          if (result && result['statusCode']) {
            this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
            return;
          }
          if (result && Number(result) > 0) {
            this.newRowAdded = false;
            this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
            this.selectPrivilagesByUser();
          } else {
            this.toastr.warning(this.constants.infoMessages.deleteRecordFailed, 'warning');
          }

        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        });
    }
  }

  getAllPrivilages() {
    this.spinner.show();
    this.dataService.getData('Privilege/GetPrivilegeUrl').subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.parentPrivilegeList = [];
        return;
      }
      this.allPrivileges = response;
      const data = _.filter(response, ['parentId', null]);
      //  data;
      this.parentPrivilegeList = data;//this.filterPrivileges(data);
    }, (error) => { this.spinner.hide(); });
  }
  filterPrivileges(privilege) {
    const data = [];
    privilege.forEach(x => {
      let temp = [];
      this.allPrivileges.forEach(y => {
        if (x.id === y.parentId) {
          temp.push(y);
        }
      });
      x['submenu'] = temp;
      data.push(x);
    });
    return data;
  }
  lowerCase(title: string) { return title.toLocaleLowerCase(); }
  reset() {
    this.isEdit = false;
    this.privilegeForm = {
      parentPrivilege: null,
      childPrivilege: null,
      id: 0, roleName: '',
      parentId: 0,
      parentName: '',
      name: '',
      urlPath: '',
      iconClass: '',
      iconName: '',
      customClass: '',
      normaliseName: '',
      isCompanyIdRequired: false,
      fragment: '',
      isParent: false
    };
    this.childPrivilegeList = [];
    this.privilagesList = [];
  }
  savePrivileges(params?) {
    if (this.privilegeForm.parentPrivilege === '' || this.privilegeForm.parentPrivilege === null
      || !this.privilegeForm.parentPrivilege) {
      this.toastr.error('Please select privilege title ', this.constants.infoMessages.error);
      return;
    }
    if (!this.isSinglePrivilege && this.childPrivilegeList.length > 0 &&
      (this.privilegeForm.childPrivilege === null || !this.privilegeForm.childPrivilege)) {
      this.toastr.error('Please select privilege sub title', this.constants.infoMessages.error);
      return;
    }
    let postData = {};
    const role = _.find(this.roles, ['name', this.privilegeForm.roleName]);
    postData = {
      id: 0,
      parentId: this.privilegeForm.parentPrivilege.id,
      privilegeUrlId: this.isSinglePrivilege ? this.privilegeForm.parentPrivilege.id : this.privilegeForm.childPrivilege.id,
      roleId: role.id,
      isDefault: true,
      isUpdate: false,
      isDeleted: false
    };
    this.spinner.show();
    this.dataService.postData(`RoleBasedPrivileges/AddRolePrivilegesUrl`, postData).subscribe(result => {
      this.spinner.hide();
      if (result && Number(result) > 0) {
        this.newRowAdded = false;
        this.reset();
        this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);

      } else {
        this.toastr.error('Privilege Title Already Exists..', this.constants.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
    });

  }
  getChildPrivileges(params) {
    this.privilegeForm.childPrivilege = null;
    this.privilegeForm.normaliseName = null;
    this.childPrivilegeList = [];
    this.isSinglePrivilege = false;
    if (this.privilegeForm.parentPrivilege && this.privilegeForm.parentPrivilege.id) {
      const data = _.filter(this.allPrivileges, ['parentId', this.privilegeForm.parentPrivilege.id]);
      if (data && data.length > 0) {
        this.childPrivilegeList = data;
      } else {
        if (this.privilegeForm.parentPrivilege && this.privilegeForm.parentPrivilege.normaliseName) { this.privilegeForm.normaliseName = this.privilegeForm.parentPrivilege.normaliseName; }
        this.isSinglePrivilege = true;
        this.childPrivilegeList = [];
      }
    }
  }
  selectPrivilagesByUser() {
    this.privilegeForm.parentPrivilege = null;
    this.privilegeForm.childPrivilege = null;
    this.childPrivilegeList = [];
    this.privilegeForm.normaliseName = '';
    if (this.privilegeForm.roleName) {

      this.spinner.show();
      this.dataService.getData(`RoleBasedPrivileges/GetRoleDefaultPrivilege/${this.privilegeForm.roleName}`).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.length > 0) {
            response.forEach(function (x) {
              x.isChecked = true;
              x.normaliseName = x.normaliseName.toUpperCase();
            });
            const data = _.filter(response, ['isParent', false]);
            this.privilagesList = data;
          } else {
            this.privilagesList = [];
          }
          setTimeout(() => { this.gridApi.sizeColumnsToFit(); }, 200);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    } else {
      this.privilagesList = [];
    }

  }
  showNormaliseName(privilageSubTitle) {
    if (privilageSubTitle && privilageSubTitle.normaliseName) {
      this.privilegeForm.normaliseName = privilageSubTitle.normaliseName;
    } else {
      this.privilegeForm.normaliseName = null;
    }
  }
  closeForm() {
    this.reset();
    this.isSinglePrivilege = false;
    this.isAddNew = false;
  }
}
