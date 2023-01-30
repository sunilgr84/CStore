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
import { UtilityService } from '@shared/services/utility/utility.service';

@Component({
  selector: 'app-privileges',
  templateUrl: './privileges.component.html',
  styleUrls: ['./privileges.component.scss'],
  animations: [routerTransition()]
})
export class PrivilegesComponent implements OnInit {

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
  filterPrivilege = [];
  childPrivilegeList: any;
  privilegeForm = {
    parentPrivilege: null,
    childPrivilege: null,
    id: 0,
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
  isSinglePrivilege: boolean;
  constructor(private dataService: SetupService, private utilityService: UtilityService, private constants: ConstantService,
    private toastr: ToastrService, private spinner: NgxSpinnerService,
    private editableGrid: GridService, private route: RouteConfigService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.privilageGrid);
  }

  ngOnInit() {
    this.getAllPrivilages();
    this.parentPrivilegeList = this.route.getSuperAdminUrls(this.userInfo.companyId);
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

  onInsertRowAt() {
    this.privilegeForm = {
      parentPrivilege: null,
      childPrivilege: null,
      id: 0,
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
    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      this.getStartEditingCell('privilegeTitle', 0);
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.getStartEditingCell('privilegeTitle', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }


  deleteAction(event) {
    if (event.data.id === 0) {
      this.newRowAdded = false;
      this.gridApi.updateRowData({ remove: [event.data] });
      return;
    }
    if (event.data.id > 0) {
      this.spinner.show();
      this.dataService.deleteData(`Privilege/PrivilegeDelete/${event.data.id}`).subscribe(result => {
        this.spinner.hide();
        if (result && result['statusCode']) {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
          return;
        }
        if (result && Number(result) > 0) {
          this.getAllPrivilages();
          this.newRowAdded = false;
          this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
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
        this.privilagesList = [];
        return;
      }
      const data = _.filter(response, ['isParent', false]);
      this.privilagesList = data;
      this.filterPrivileges();
      setTimeout(() => {
        this.gridApi.sizeColumnsToFit();
      }, 500);
    }, (error) => { this.spinner.hide(); });
  }
  filterPrivileges() {
    const data = [...this.parentPrivilegeList];
    const arr = this.utilityService.remove_duplicates(data, this.privilagesList, 'normaliseName');
    this.filterPrivilege = arr;
    console.log(arr);
  }
  lowerCase(title: string) { return title.toLocaleLowerCase(); }
  reset() {
    this.isEdit = false;
    this.privilegeForm = {
      parentPrivilege: null,
      childPrivilege: null,
      id: 0,
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
  }
  updatePrivileges(params) {
    if (params.data.normaliseName === '' || params.data.normaliseName === null) {
      this.toastr.error('Privilege Title is required..', this.constants.infoMessages.error);
      this.getStartEditingCell('normaliseName', params.rowIndex);
      return;
    }
    this.spinner.show();
    const postData = {
      privilegeId: params.data.privilegeId,
      privilegeTitle: params.data.privilegeTitle
    };
    this.dataService.updateData(`Privilege/UpdatePrivilege/${params.data.privilegeId}`, postData)
      .subscribe(result => {
        this.spinner.hide();
        if (result && result['statusCode']) {
          this.toastr.error(this.constants.infoMessages.updateRecordsdFailed, this.constants.infoMessages.error);
          return;
        }
        this.newRowAdded = false;
        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
        this.getAllPrivilages();
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.updateRecordsdFailed, this.constants.infoMessages.error);
      });

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
    const parent = {
      ...this.privilegeForm.parentPrivilege,
      submenu: null,
    };
    const submenu = {
      ...this.privilegeForm.childPrivilege
    };
    postData = {
      parent: parent,
      subMenu: submenu ? submenu : null
    };
    this.spinner.show();
    this.dataService.postData(`Privilege/AddPrivilege`, postData).subscribe(result => {
      this.spinner.hide();
      if (result && Number(result) > 0) {
        this.newRowAdded = false;
        this.reset();
        this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
        this.getAllPrivilages();
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
    if (params && params.submenu && params.submenu.length > 0) {
      const data = [...params.submenu];
      const arr = this.utilityService.remove_duplicates(data, this.privilagesList, 'normaliseName');
      this.isSinglePrivilege = false;
      this.privilegeForm.normaliseName = null;
      this.childPrivilegeList = arr;
    } else {
      if (params && params.normaliseName) { this.privilegeForm.normaliseName = params.normaliseName; }
      this.isSinglePrivilege = true;
      this.childPrivilegeList = [];
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
    this.isSinglePrivilege = false;
    this.isAddNew = false;
  }
}
