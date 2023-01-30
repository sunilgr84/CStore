import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { ActivatedRoute } from '@angular/router';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-mgmt-grid',
  templateUrl: './user-mgmt-grid.component.html',
  styleUrls: ['./user-mgmt-grid.component.scss']
})
export class UserMgmtGridComponent implements OnInit, OnChanges {
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  gridOptions: any;
  rowData: any;
  showDetail = false;
  selectedUserName: string = null;
  userData: any;
  @Input() companyData: any;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  companyId: any;
  userInfo: any;
  gridApi: any;
  filterText: any;
  roleName: string;
  constructor(private gridService: GridService, private constants: ConstantService,
    private route: ActivatedRoute, private dataService: SetupService, private spinner: NgxSpinnerService,
    private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.companyUserMgmtGrid);
    this.roleName = this.constants.roleName;
  }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    if (this.companyData && this.companyData.companyID) {
      this.getCompanyUserList(this.companyData.companyID);
    } else {
      this.companyId = this.route.snapshot.paramMap.get('id');
      this.getCompanyUserList(this.companyId);
    }
  }

  ngOnChanges() {
    if (this.companyData) {
      this.getCompanyUserList(this.companyData.companyID);
    }
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  edit(param) {
    this.companyId = param.data.companyId;
    this.userData = param.data;
    this.showDetail = true;
    this.selectedUserName = this.rowData[param.rowIndex].userName;
  }
  delete(params) {
    this.spinner.show();
    this.dataService.deleteData(`Users/Delete?userId=${params.data.id}`).subscribe(result => {
      this.spinner.hide();
      if (result === '0') {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else if (result === '1') {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
        this.getCompanyUserList(this.companyData.companyID);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  addNewUser(show) {
    this.companyId = this.companyData && this.companyData.companyID ? this.companyData.companyID : this.companyId;
    this.showDetail = show;
  }
  showComapnyList() {
    this.backToCompanyList.emit(false);
  }
  getCompanyUserList(companyId) {
    this.spinner.show();
    this.dataService.getData('Users/GetUsersByCompanyId/CompanyId/' + companyId).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
        }
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  onNavigatePrivilege(param) {
    const data = { tabId: 'add-privilege' };
    this.changeTabs.emit(data);
  }
  backToUserList(isAdd) {
    this.userData = null;
    this.companyId = this.companyData && this.companyData.companyID ? this.companyData.companyID : this.companyId;
    this.getCompanyUserList(this.companyId);
    this.showDetail = isAdd;
  }
}
