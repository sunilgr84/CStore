import { Component, OnInit, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { TestService } from '@shared/services/test/test.service';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@shared/services/commmon/common.service';
import { PriceGroupDetailsCellRenderer } from '@shared/component/expandable-grid/partials/price-group-details-renderer.component';

@Component({
  selector: 'app-import-group',
  templateUrl: './import-group.component.html',
  styleUrls: ['./import-group.component.scss']
})
export class ImportGroupComponent implements OnInit {
  gridApi: any;
  gridOption: GridOptions;
  @Output() _companyPriceGroup: EventEmitter<any> = new EventEmitter<any>();
  rowData = [];
  storeLocationList: any;
  departmentList: any;
  brandList: any;
  isPriceGroupLoading = true;
  isManufacturerLoading = true;
  isBrandLoading = false;
  isPackageLoading = true;
  isStoreLocationLoading = true;
  isDepartmentLoading = true;
  userInfo = this.constant.getUserInfo();
  masterPriceGroupList: any;
  manufacturerList: any;
  packageList: any;
  searchPriceGroup = {
    MasterPriceGroupName: '', BrandIDS: null, UOMIDS: null, UnitsIncase: null, ManufacturerIDS: null,
    DestStoreLocationID: null, DestDepartmentID: null,
  };
  submitted = false;
  selectedRowData: any;
  masterBrand: any;
  filterText: any;
  @ViewChild('content') content: TemplateRef<any>;
  priceGroupList: any;
  expandableGridOption: any;
  detailCellRenderer: any;
  constructor(private gridService: GridService, private constant: ConstantService, private storeService: StoreService,
    private setupService: SetupService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private testService: TestService, private modalService: NgbModal, private commonService: CommonService) {
    this.gridOption = this.gridService.getGridOption(this.constant.gridTypes.importGroupGrid);
    this.expandableGridOption = this.gridService.getGridOption(this.constant.gridTypes.masterPriceGropDetailGrid);
    this.detailCellRenderer = PriceGroupDetailsCellRenderer;
  }

  ngOnInit() {
    this.getBrand();
    this.getManufacturer();
    this.getMasterPriceGroup();
    this.getCompanyById();
    this.getDepartment();
    this.getPackage();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  getCompanyById() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.isStoreLocationLoading = false;
        if (response && response['statusCode']) {
          this.storeLocationList = [];
          return;
        }
        this.storeLocationList = response;
      }, (error) => {
        console.log(error);
      }
    );
  }
  getDepartment() {
    this.setupService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`).subscribe(
      (response) => {
        this.isDepartmentLoading = false;
        if (response && response['statusCode']) {
          this.departmentList = [];
          return;
        }
        this.departmentList = response;
      }, (error) => {
        console.log(error);
      }
    );
  }
  getBrand() {
    this.setupService.getData('MasterBrand/list').subscribe(
      (response) => {
        // this.isBrandLoading = false;
        if (response && response['statusCode']) {
          this.masterBrand = [];
          return;
        }
        response.forEach(function (element) {
          element.companyID = 0;
        });
        this.masterBrand = response;
      }, (error) => {
        console.log(error);
      }
    );
  }
  selectManufacture(params) {
    this.searchPriceGroup.BrandIDS = null;
    if (params && params.length === 0) {
      this.brandList = [];
      return;
    }

    this.isBrandLoading = true;
    this.spinner.show();
    this.brandList = [];
    params.map((x) =>
      this.masterBrand.filter((b) => {
        if (b.manufacturerID === x.manufacturerID) {
          this.brandList.push(b);
        }
      }));
    this.isBrandLoading = false;
    this.spinner.hide();
  }
  getPackage() {
    this.setupService.getData('UOM/getAll').subscribe(
      (response) => {
        this.isPackageLoading = false;
        if (response && response['statusCode']) {
          this.packageList = [];
          return;
        }
        response.forEach(function (element) {
          element.companyID = 0;
        });
        this.packageList = response;
      }, (error) => {
        console.log(error);
      });
  }
  getManufacturer() {
    this.setupService.getData('Manufacturer/getAll').subscribe(
      (response) => {
        this.isManufacturerLoading = false;
        if (response && response['statusCode']) {
          this.manufacturerList = [];
          return;
        }
        response.forEach(function (element) {
          element.companyID = 0;
        });
        this.manufacturerList = response;
      }, (error) => {
        console.log(error);
      }
    );
  }
  getMasterPriceGroup() {
    this.setupService.getData('MasterPriceGroup/list').subscribe(
      (response) => {
        this.isPriceGroupLoading = false;
        if (response && response['statusCode']) {
          this.masterPriceGroupList = [];
          return;
        }
        this.masterPriceGroupList = response;
      }, (error) => {
        console.log(error);
      }
    );
  }
  onSearch() {
    const pd = {
      MasterPriceGroupName: this.searchPriceGroup.MasterPriceGroupName ?
        this.searchPriceGroup.MasterPriceGroupName : '',
      // this.searchPriceGroup.MasterPriceGroupName['masterGroupName'] : '',
      BrandIDS: this.searchPriceGroup.BrandIDS ? this.searchPriceGroup.BrandIDS.map(x => x.brandID).join(',') : '',
      UOMIDS: this.searchPriceGroup.UOMIDS ? this.searchPriceGroup.UOMIDS.map(x => x.uomid).join(',') : '',
      UnitsIncase: '',
      ManufacturerIDS: this.searchPriceGroup.ManufacturerIDS ?
        this.searchPriceGroup.ManufacturerIDS.map(x => x.manufacturerID).join(',') : '',
    };
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService.getData('MasterPriceGroup/SearchmasterPriceGroup?MasterPriceGroupName=' + pd.MasterPriceGroupName + '&BrandIDS=' + pd.BrandIDS + '&UOMIDS=' + pd.UOMIDS + '&UnitsIncase=' + pd.UnitsIncase + '&ManufacturerIDS=' + pd.ManufacturerIDS)
      .subscribe((response) => {
        this.rowData = response;
        this.spinner.hide();
      }, (error) => {
        console.log(error);
      });
  }

  // Row selected event
  onRowSelected(selectedRow) {
    this.selectedRowData = null;
    this.selectedRowData = selectedRow;
  }
  onImport(ngForm) {
    this.submitted = true;
    if (ngForm.invalid || !this.selectedRowData) {
      this.toastr.error('Please select group to import');
      return;
    }
    const importData = {
      DestinationCompanyID: this.userInfo.companyId,
      DestStoreLocationID: this.searchPriceGroup.DestStoreLocationID,
      DestDepartmentID: this.searchPriceGroup.DestDepartmentID,
      MasterPriceGroupID: this.selectedRowData.length > 0 ?
        this.selectedRowData[0].data.masterPriceGroupID : 0,
    };
    this.spinner.show();
    this.setupService.updateData('MasterPriceGroup/ImportCompanyPriceGroupsFromMasterPriceGroup/' +
      importData.DestinationCompanyID + '/' + importData.DestDepartmentID
      + '/' + importData.MasterPriceGroupID + '?DestStoreLocationID=' + importData.DestStoreLocationID, '').subscribe(
        (response) => {
          this.spinner.hide();
          console.log(response);
          if (response === '1') {
            this.toastr.success(this.constant.infoMessages.importRecords, this.constant.infoMessages.success);
            this._companyPriceGroup.emit(false);
            this.onReset();
          } else {
            this.toastr.error(this.constant.infoMessages.contactAdmin, this.constant.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constant.infoMessages.contactAdmin, this.constant.infoMessages.error);

        }
      );
  }
  onReset() {
    this.rowData = [];
    this.submitted = false;
    this.searchPriceGroup = {
      MasterPriceGroupName: '', BrandIDS: null, UOMIDS: null, UnitsIncase: null, ManufacturerIDS: null,
      DestStoreLocationID: null, DestDepartmentID: null,
    };
  }
  getPriceGroupDetails(params) {
    if (params && params.data.masterPriceGroupID <= 0) {
      return;
    }
    this.spinner.show();
    this.setupService.getData('MasterPriceBookItem/GetMasterItemByMasterpriceGroupID/' + params.data.masterPriceGroupID)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.priceGroupList = [];
          return;
        }
        this.commonService.masterPriceGroupDetails = response;
        this.priceGroupList = response.map((x) => x['masterPriceBookDetails']);
        this.open(this.content);
      }, (error) => {
        this.spinner.hide();
      });
  }
  open(content: any) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      size: 'lg'
    };
    this.modalService.open(content, ngbModalOptions).result.then((result) => {
      // this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      // this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  rowDoubleClicked(params) {
    console.log(params);
  }
  cellDoubleClicked(params) {
    console.log(params);
  }
}
