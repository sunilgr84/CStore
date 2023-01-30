import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { GridService } from '@shared/services/grid/grid.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { routerTransition } from 'src/app/router.animations';

@Component({
  selector: 'app-time-off',
  templateUrl: './time-off.component.html',
  styleUrls: ['./time-off.component.scss'],
  animations: [routerTransition()]
})
export class TimeOffComponent implements OnInit {
  submitted = false;
  gridApi: any;
  gridApiByRole: any;
  gridOptions: any;
  gridOptionsByRole: any;
  rowData: any;
  rowDataMain: any;
  rowDataByRole: any;
  editRowData: any;
  isAddStores: boolean;
  columnDefs: any;
  columnDefsByRole: any;
  storeLocationID: any;
  commaSeperatedStoreLocationIds: any;
  // disable tabs
  isEnableTab = true;
  userInfo: any;
  filterText: string;
  filterTextByRole: string;
  gridColumnApi: any;
  hederTitle = 'Time off';
  roleName: string;
  timeOffId = 0;
  isLoading = false;
  isEdit = false;
  title = '';
  roleId: any;
  @ViewChild('tabs') public tabs: NgbTabset;
  initialTimeOffFormvalue: any;
  startDate = new Date();
  storeLocationList: any[];
  endDate = new Date(this.startDate.getDate() + 1);
  lotteryStateCode: any;
  timeOffDetailForm = this._fb.group({
    reason: ['', Validators.required],
    startDate: [this.startDate],
    endDate: [this.endDate],
    totalHours: ['', Validators.required],
    status: ['0']
  });
  constructor(private gridService: GridService, private constantsService: ConstantService, private dataService: SetupService
    , private logger: LoggerService, private toastr: ToastrService, private _fb: FormBuilder,
    private spinner: NgxSpinnerService) {
    this.gridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.timeOffGetGrid);
    this.gridOptionsByRole = this.gridService.getGridOption(this.constantsService.gridTypes.timeOffGetGridByRole);
    this.initialTimeOffFormvalue = this.timeOffDetailForm.value;
  }


  ngOnInit() {
    this.columnDefs = this.gridOptions.columnDefs;
    this.columnDefsByRole = this.gridOptions.columnDefs;
    this.userInfo = this.constantsService.getUserInfo();
    this.getStoreLocationList();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  onGridReadyByGrid(params) {
    this.gridApiByRole = params.api;
    params.api.sizeColumnsToFit();
  }

  getTimeOff(userName) {
    this.spinner.show();
    this.dataService.getData('TimeOff/GetTimeOffByUserName/' + userName, null, true).subscribe(
      (response) => {
        this.spinner.hide();
        if (response.length > 0) {
          this.rowData = response;
        } else {
          this.rowData = [];
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getTimeOffByRole(storeLocationID, roleId) {
    this.spinner.show();
    this.dataService.getData('TimeOff/GetTimeOff/' + storeLocationID + '/' + roleId, null, true).subscribe(
      (response) => {
        this.spinner.hide();
        if (response.length > 0) {
          this.rowDataByRole = response;
          console.log(this.rowDataByRole);

        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  approveAction(params) {
    this.editRowData = params.data;
    this.timeOffId = this.editRowData.timeOffId;
    if (params.data.status === 2) {
      this.toastr.error('You can not approve the timeoff', 'Error');
      return;
    }
    const postData = {
      ApprovedBy: this.userInfo.userName,
      TimeOffId: this.timeOffId
    }
    this.dataService.postData('TimeOff/ApproveTimeOff', postData, false, false).subscribe((response) => {
      console.log(response);
      this.spinner.hide();

      if (response && response === "1") {
        this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
        if (this.userInfo.roleName === this.constantsService.roleName) {
          this.roleId = 3;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        this.getTimeOff(this.userInfo.userName);
      } else {
        if (response && response.statusCode === 500) {
          this.toastr.error(response.message, 'Error');
        } else {
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
          if (this.userInfo.roleName === this.constantsService.roleName) {
            this.roleId = 3;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
            this.roleId = 2;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
            this.roleId = 1;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          this.getTimeOff(this.userInfo.userName);
        }
      }
    }, (error) => {
      console.log(error);
      this.spinner.hide();
      this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
    });
  }

  rejectAction(params) {
    this.editRowData = params.data;
    this.timeOffId = this.editRowData.timeOffId;
    if (params.data.status === 1) {
      this.toastr.error('You can not reject the timeoff', 'Error');
      return;
    }
    const postData = {
      ApprovedBy: this.userInfo.userName,
      TimeOffId: this.timeOffId
    }
    this.dataService.postData('TimeOff/CancelTimeOff', postData, false, true).subscribe((response) => {
      console.log(response);
      this.spinner.hide();

      if (response && response === "1") {
        this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'Success');
        if (this.userInfo.roleName === this.constantsService.roleName) {
          this.roleId = 3;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        this.getTimeOff(this.userInfo.userName);
      } else {
        this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
        if (this.userInfo.roleName === this.constantsService.roleName) {
          this.roleId = 3;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        this.getTimeOff(this.userInfo.userName);
      }
    }, (error) => {
      console.log(error);
      this.spinner.hide();
      this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'Error');
    });
  }

  addTimeOff() {
    this.isEdit = true;
    this.title = 'Add Time Off';
    this.resetTimeOffDetails();
    var date = new Date();
    var endDate = new Date();
    date.setDate(date.getDate() + 1);
    endDate.setDate(date.getDate() + 1);
    this.startDate = new Date(date);
    this.endDate = new Date(endDate);
    this.timeOffDetailForm.controls.startDate.setValue(new Date(date));
    this.timeOffDetailForm.controls.endDate.setValue(new Date(endDate));
  }

  resetTimeOffDetails() {
    this.submitted = false;
    this.timeOffDetailForm.patchValue(this.initialTimeOffFormvalue);
    this.startDate = this.endDate = null;
  }

  saveTimeOff() {

    const postData = {
      ...this.timeOffDetailForm.value,
      storeLocationID: this.storeLocationID,
      userName: this.userInfo.userName,
      createdBy: this.userInfo.userName,
      CreatedDateTime: new Date(),
      startDate: this.getDateFormate(new Date(this.timeOffDetailForm.value.startDate)),
      endDate: this.getDateFormate(new Date(this.timeOffDetailForm.value.endDate)),
      LastModifiedDateTime: this.timeOffId > 0 ? new Date() : null,
      LastModifiedBy: this.timeOffId > 0 ? this.userInfo.userName : null,
      timeOffId: this.timeOffId,
    };
    if (this.timeOffDetailForm.valid) {
      this.submitted = true;
      const startDateNew: Date = new Date(this.timeOffDetailForm.controls.startDate.value);
      const endDateNew: Date = new Date(this.timeOffDetailForm.controls.endDate.value);
      if (startDateNew >= endDateNew) {
        this.toastr.error('End Date must be greater than start date', 'Error');
        return;
      }
      this.spinner.show();
      this.dataService.postData('TimeOff', postData, false, false).subscribe(response => {
        this.spinner.hide();
        if (response && response.statusCode === 500) {
          let errorMessage = response.message;
          this.toastr.error(errorMessage, this.constantsService.infoMessages.addRecordFailed);
          this.spinner.hide();
          if (this.userInfo.roleName === this.constantsService.roleName) {
            this.roleId = 3;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
            this.roleId = 2;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
            this.roleId = 1;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          this.getTimeOff(this.userInfo.userName);
          return;
        } else {
          this.toastr.success(this.constantsService.infoMessages.success, 'Success');
          this.spinner.hide();
          this.isEdit = false;
          if (this.userInfo.roleName === this.constantsService.roleName) {
            this.roleId = 3;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
            this.roleId = 2;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
            this.roleId = 1;
            this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
          }
          this.getTimeOff(this.userInfo.userName);
          return;
        }
      });
    }
  }

  editAction(params) {
    this.isEdit = true;
    this.title = 'Edit Time Off'
    this.timeOffId = params.data.timeOffId;
    this.timeOffDetailForm.patchValue(params.data);
    this.startDate = params.data.startDate;
    this.endDate = params.data.endDate;
  }

  dateChangeStartDate(event) {
    this.timeOffDetailForm.get('startDate').setValue(event.formatedDate);
    this.startDate = event.formatedDate;
  }

  dateChangeEndDate(event) {
    this.timeOffDetailForm.get('endDate').setValue(event.formatedDate);
    this.endDate = event.formatedDate;
  }

  getStoreListByCompanyId(companyId, roleId) {
    this.spinner.show();
    this.commaSeperatedStoreLocationIds = undefined;
    if (roleId === 2 || roleId === 3) {
      this.dataService.getData('StoreLocation/GetStoresDetailsByCompanyId/' + companyId).subscribe(
        (response) => {
          this.spinner.hide();
          if (response) {
            this.rowDataMain = response;
            response.forEach(element => {
              if (this.commaSeperatedStoreLocationIds === undefined) {
                this.commaSeperatedStoreLocationIds = element['storeLocationID'];
              } else {
                this.commaSeperatedStoreLocationIds = this.commaSeperatedStoreLocationIds + ',' + element['storeLocationID'];
              }
            });
          } else {
            this.rowDataMain = [];
          }
          this.getTimeOffByRole(this.commaSeperatedStoreLocationIds, roleId);
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    } else {
      this.commaSeperatedStoreLocationIds = this.storeLocationID;
      this.getTimeOffByRole(this.commaSeperatedStoreLocationIds, roleId);
    }
  }

  delete(param) {
    if (param.data.timeOffId > 0) {
      this.spinner.show();
      this.dataService.deleteData(`Timeoff/${param.data.timeOffId}`).subscribe(result => {
        this.spinner.hide();
        if (result === '0') {
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
        } else if (result === '1') {
          this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.delete);
        }
        this.getTimeOff(this.userInfo.userName);
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.contactAdmin);
      });
    } else {
      this.gridApi.updateRowData({
        remove: [param.data]
      });
    }
  }

  getDateFormate(d) {
    let date = d;
    if (d !== undefined || d != null) {
      date = d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear();
    }
    return date;
  }

  getStoreLocationList() {
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`StoreLocation/getByCompanyId/${Number(this.userInfo.companyId)}/${this.userInfo.userName}`)
      .subscribe((response) => {
        this.storeLocationList = response;
        this.storeLocationID = this.storeLocationList[0].storeLocationID;
        if (this.userInfo.roleName === this.constantsService.roleName) {
          this.roleId = 3;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
          this.roleId = 2;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
          this.roleId = 1;
          this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
        }
        this.getTimeOff(this.userInfo.userName);
      }, (error) => {
        console.log(error);
      });
  }

  bindStoreLocationId() {
    if (this.userInfo.roleName === this.constantsService.roleName) {
      this.roleId = 3;
      this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
    }
    if (this.userInfo.roleName.toLowerCase() === 'companyadmin') {
      this.roleId = 2;
      this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
    }
    if (this.userInfo.roleName.toLowerCase() === 'storemanager') {
      this.roleId = 1;
      this.getStoreListByCompanyId(this.userInfo.companyId, this.roleId);
    }
    this.getTimeOff(this.userInfo.userName);
  }
}
