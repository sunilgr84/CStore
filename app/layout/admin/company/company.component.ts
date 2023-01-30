import { Component, OnInit, ViewChild } from '@angular/core';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { LoggerService } from 'src/app/shared/services/logger/logger.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { DetailCellRenderer } from '@shared/component/expandable-grid/partials/detail-cell-renderer.component';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss'],
})
export class CompanyComponent implements OnInit {
  hederTitle = null;
  @ViewChild('companyInfoGrid') companyInfoGrid: any;
  @ViewChild('tabs') public tabs: NgbTabset;
  isAddCompany: boolean;
  gridOptions: any;
  rowData: any;
  columnDefs: any;
  editRowData: any;
  deletedRowData: any;
  // disable tabs
  isAddBankEnable = true;
  isCompanyRecEnable = true;
  isFuelGradeEnable = true;
  isUserMgmtEnable = true;
  isAddPrivilage = true;
  filterText: string;
  gridApi: any;
  gridColumnApi: any;
  paramId: any;
  userInfo: any;
  roleName: string;
  detailCellRenderer: any;
  activeIdString: any;
  roleNameSuperAdmin: string;

  isPriCompany = true;
  isPriAddBank = true;
  isPriUserBank = true;
  constructor(private gridService: GridService, private constants: ConstantService, private spinner: NgxSpinnerService,
    private dataService: SetupService, private logger: LoggerService, private route: ActivatedRoute, private router: Router,
    private toastr: ToastrService) {
    this.roleNameSuperAdmin = this.constants.roleName;
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.companyGrid);
    this.detailCellRenderer = DetailCellRenderer;

    this.route.fragment.subscribe(params => {
      this.activeIdString = this.route.fragment['_value'];
    });
  }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.roleName = this.userInfo.roleName;
    const id = this.route.snapshot.paramMap.get('id');
    this.paramId = id;
    if (!id) {
      this.columnDefs = this.gridOptions.columnDefs;
      this.getCompanyList();
    } else {
      this.isAddCompany = true;
      this.enableAllTabs({ isDisabledTab: false });
      // this.activeIdString = this.route.fragment['_value'];
    }
    this.privilegeCheck();
  }
  privilegeCheck() {
    const setup = _.find(this.userInfo.privileges, ['normaliseName', 'setup company']);
    if (setup && setup.submenu.length > 0) {
      setup.submenu.forEach(x => {
        if (x.normaliseName === 'company details') {
          this.isPriCompany = false;
        }
      });
      setup.submenu.forEach(x => {
        if (x.normaliseName === 'add bank') {
          this.isPriAddBank = false;
        }
      });
      setup.submenu.forEach(x => {
        if (x.normaliseName === 'user Management') {
          this.isPriUserBank = false;
        }
      });
    }
  }
  addCompany(isAdd) {
    this.hederTitle = 'Add a Company';
    this.enableAllTabs({ isDisabledTab: true });
    this.isAddCompany = isAdd;
  }
  backToCompanyList(isAdd) {
    this.hederTitle = null;
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.companyGrid);
    this.editRowData = null;
    this.filterText = null;
    this.getCompanyList();
    // this.enableAllTabs({ isDisabledTab: true });
    /// this.isAddBankEnable = this.isCompanyRecEnable = this.isFuelGradeEnable = this.isUserMgmtEnable = true;
    this.isAddCompany = isAdd;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    // this.totalPageCount = this.gridApi.rowModel.getRowCount();
  }
  /**
   * To get company list
   */
  getCompanyList() {
    this.spinner.show();
    this.dataService.getData('Company/list')
      .subscribe((response) => {
        this.rowData = response;
        this.spinner.hide();
      });
  }

  editAction(params) {
    this.hederTitle = 'Add a Company';
    this.enableAllTabs({ isDisabledTab: false });
    this.editRowData = params.data;
    this.logger.log(this.editRowData);
    this.isAddCompany = true;
  }
  enableAllTabs(event) {
    if (event.data) {
      this.editRowData = event.data;
    }
    this.isAddBankEnable = this.isCompanyRecEnable = this.isFuelGradeEnable =
      this.isUserMgmtEnable = this.isAddPrivilage = event.isDisabledTab;
  }
  deleteAction(params) {
    this.deletedRowData = params.data;
    this.spinner.show();
    this.dataService.deleteData('Company/' + params.data.companyID).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          this.getCompanyList();
          this.toastr.success(this.constants.infoMessages.deletedRecord);
        } else {
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }
  // Add  By Sanjay ===================== add new feature=================
  tabChange(params) {
    const activeTab = params && params.nextId;
    switch (activeTab) {
      case 'add-company':
        this.hederTitle = 'Add a Company';
        break;
      case 'add-bank':
        this.hederTitle = 'Add a Bank';
        break;
      case 'add-categories':
        this.hederTitle = 'Add a Company Categories';
        break;
      case 'user-management':
        this.hederTitle = 'Add a User Management';
        break;
      case 'add-privilege':
        this.hederTitle = 'Add a Privilege';
        break;
      default:
        this.hederTitle = null;
        break;
    }

  }
  selectTab(params) {
    this.tabs.select(params.tabId);
  }

  // end ===================== add new feature=================
}
