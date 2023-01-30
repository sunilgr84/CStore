import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { StoreService } from '@shared/services/store/store.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-ismupdate',
  templateUrl: './ismupdate.component.html',
  styleUrls: ['./ismupdate.component.scss']
})
export class ISMUpdateComponent implements OnInit {

  constructor(private gridService: PaginationGridService, private constants: ConstantService, private spinner: NgxSpinnerService, private toaster: ToastrService,
    private storeService: StoreService, private setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.ismUpdate);
  }

  gridOptions: any;
  gridApi: any;
  stores: any;
  allStores: any;
  departmentIdList: Array<any> = [];
  departments: any;
  storeId: any;
  departmentId: any;
  dateRange: any;
  selectedDateRange: any;
  filterText: string;
  showFilter: any = false;
  dayClose: any = true;
  ismSelectedItems: any = [];
  buyingCost: any = 0.0;
  userInfo: any;
  companyList: any = [];
  selectedCompanyId: any;
  selectedCompany: any;
  companyID: any;

  ngOnInit() {
    const dateRange = { fDate: moment().format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange", start: moment().format('YYYY-MM-DD'), end: moment().format('YYYY-MM-DD'), };
    this.selectedDateRange = dateRange;

    this.departmentIdList = [];
    this.userInfo = this.constants.getUserInfo();
    this.getDepartmentByFuelUserNameAndCompanyId();
    this.getCompany();
    this.getStores();

  }

  getCompany() {
    this.spinner.show();
    if (this.userInfo.roleName === this.constants.roleName) { // only superadmin
      this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.userInfo.companyId);
    } else {
      if (this.userInfo.roleName.toLowerCase() === 'cashiers' || this.userInfo.roleName.toLowerCase() === 'storemanager' || this.userInfo.roleName.toLowerCase() === 'companyadmin') {
        this.spinner.hide();
        this.companyList = [];
        let formattedCompanyId = this.pad(this.userInfo.companyId.toString(), 4);
        let companyDetailName = this.userInfo.companyName + " (" + formattedCompanyId + ")";
        this.companyList.push({
          companyID: this.userInfo.companyId,
          companyName: this.userInfo.companyName,
          companyDetailName: companyDetailName
        });
      } else {
        this.getCompaniesByUserId(this.userInfo.userId);
      }

    }
    this.selectedCompanyId = this.userInfo.companyId;
  }
  getCompaniesByUserId(userId) {
    this.setupService.getData('Users/GetCompanyByUserId/UserId/' + userId).subscribe(
      (response) => {
        this.companyList = response;
        this.companyList.map((company) => {
          let formattedCompanyId = this.pad(company.companyID.toString(), 4);
          company.companyDetailName = company.companyName + " (" + formattedCompanyId + ")";
          return company;
        })
        this.spinner.hide();
      });
  }

  getCompaniesById(roleName, userName, companyId) {
    this.spinner.show();
    this.setupService.getData('Company/GetCompanysList/' + roleName + '/' + userName + '/' + companyId).subscribe(
      (response) => {
        this.companyList = response;
        this.companyList.map((company) => {
          let formattedCompanyId = this.pad(company.companyID.toString(), 4);
          company.companyDetailName = company.companyName + " (" + formattedCompanyId + ")";
          return company;
        });
        this.spinner.hide();
      });
  }
  pad(input, size) {
    while (input.length < (size || 2)) {
      input = "0" + input;
    }
    return input;
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  onDateRangeChange(event) {
    this.selectedDateRange = event;
  }

  dateTimeRangeChange(event) {
    this.selectedDateRange = event;
    this.selectedDateRange.start = moment(event.fDate).format("MM-DD-YYYY");
    this.selectedDateRange.end = moment(event.tDate).format("MM-DD-YYYY")
    this.selectedDateRange.range = moment(event.fDate).format("MM-DD-YYYY") + " To " + moment(event.tDate).format("MM-DD-YYYY")
  }

  getStoreLocationList(companyId) {
    this.storeId = undefined;
    this.departmentId = [];
    this.departmentIdList = [];
    this.departments = [];
    if (this.allStores)
      this.stores = this.allStores.filter(k => k.companyID === companyId);
  }

  getStores() {
    this.spinner.show();
    this.storeService.getStoreLocationList().subscribe((response) => {
      this.allStores = response;
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }
  getDepartmentByFuelUserNameAndCompanyId() {
    // this.setupService.getData('Department/GetAllDepartmentByStoreAndCompany/' + this.userInfo.companyId + "/" + storeId)
    this.setupService.getData('Department/GetByfuel/'+ this.userInfo.userName + "/" + this.userInfo.companyId + "/" + false)
      .subscribe((response) => {
        this.departments = response;
        this.departmentIdList = [];
      }, (error) => {
        console.log(error);
      });
    }
  getDepartmentByCompanyIdAndStoreId(companyId, storeId) {
    this.departmentId = [];
    if (storeId) {
      this.spinner.show();
      this.setupService.getData('Department/GetAllDepartmentByStoreAndCompany/' + companyId + "/" + storeId)
        .subscribe((response) => {
          this.spinner.hide();
          this.departments = response;
          this.departmentIdList = [];
        }, (error) => {
          console.log(error);
          this.spinner.hide();
        });
    }
  }
  getSelectedStoreId(storeId) {
   this.storeId;
  }
  searchISMData() {
    this.showFilter = false;
    if (this.storeId === undefined || this.storeId === null || this.storeId === "") {
      this.toaster.error('Store Selection Required', 'Error');
    } else if (this.selectedDateRange === undefined || this.selectedDateRange === null || this.selectedDateRange === "") {
      this.toaster.error('Date Range Selection Required', 'Error');
    } else {
      this.spinner.show();
      this.setupService.getData(`ISMDetail/GetIsmDetails?StoreLocationID=` + this.storeId + `&StartDate=` + this.selectedDateRange.start + `&EndDate=` + this.selectedDateRange.end + `&IsDayclose=` + this.dayClose + `&Departments=` + this.departmentIdList.toString()).subscribe(result => {
        this.spinner.hide();
        this.showFilter = true;
        this.gridApi.setRowData(result);
        this.gridApi.sizeColumnsToFit();
      }, error => {
        this.spinner.hide();
        this.toaster.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
      });
    }
  }

  ismUpdateRowSelected(event) {
    let nodes = event;
    this.ismSelectedItems = nodes ? nodes.map(x => { return x.data.ISMDetailID }).join(',') : '';
  }

  updateBuyingCost() {
    if (this.buyingCost === 0) {
      this.toaster.error('Buying cost should be greater than zero', 'Error');
      return;
    }
    this.spinner.show();
    this.setupService.updateData('ISMDetail/UpdateCost?IsmDetailIDs=' + this.ismSelectedItems + '&BuyingCost=' + this.buyingCost, '').subscribe(
      (response) => {
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toaster.success(this.constants.infoMessages.updatedRecord);
          this.buyingCost = 0.0;
          this.ismSelectedItems = [];
          this.searchISMData();
        }
        // return response;
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }

  getDepartmentById(departmentId) {
    this.departmentIdList = [];
    departmentId.forEach(element => {
      this.departmentIdList.push(element.departmentID);
    });
  }

}
