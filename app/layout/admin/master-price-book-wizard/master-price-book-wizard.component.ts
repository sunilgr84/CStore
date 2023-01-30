import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-master-price-book-wizard',
  templateUrl: './master-price-book-wizard.component.html',
  styleUrls: ['./master-price-book-wizard.component.scss']
})
export class MasterPriceBookWizardComponent implements OnInit {

  constructor(private gridService: PaginationGridService, private constants: ConstantService, private spinner: NgxSpinnerService, private toaster: ToastrService,
    private setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.masterPriceBookWizardGrid);
  }

  manufacturerList: any;
  manufacturerID: any;

  departmentList:any;
  masterDepartmentID:any;

  brandList:any;
  brandID:any;

  priceGroupList:any;
  masterPriceGroupID:any

  uomList:any;
  uomTypeID:any;

  gridOptions: any;
  gridApi: any;

  departmentList1:any;
  departmentID1:any;

  companyList: any;
  companyID: any;
  
  filterText: string;
  dayClose: any = true;
  selectedItems: any = [];

  userInfo: any;
  
  copyToTargetFlag:any=false;

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.getCompany();
    this.getManufacturer();
    this.getDepartment();
    this.getUOM();

  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  getCompany() {
    this.spinner.show();
    this.setupService.getData("/Company/GetCompanysList"+"/"+this.userInfo.roleName+"/"+this.userInfo.userName+"/"+this.userInfo.companyId).subscribe((response) => {
      this.companyList = response;
      this.companyList.sort((a,b) => (a.companyName > b.companyName) ? 1 : ((b.companyName > a.companyName) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  getManufacturer() {
    this.spinner.show();
    this.setupService.getData("/Manufacturer/getAll").subscribe((response) => {
      this.manufacturerList = response;
      this.manufacturerList.sort((a,b) => (a.manufacturerName > b.manufacturerName) ? 1 : ((b.manufacturerName > a.manufacturerName) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  getDepartment(){
    this.spinner.show();
    this.setupService.getData("/MasterDepartment/list").subscribe((response) => {
      this.departmentList = response;
      this.departmentList.sort((a,b) => (a.masterDepartmentDescription > b.masterDepartmentDescription) ? 1 : ((b.masterDepartmentDescription > a.masterDepartmentDescription) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  getUOM(){
    this.spinner.show();
    this.setupService.getData("/UOM/getAll").subscribe((response) => {
      this.uomList = response;
      this.uomList.sort((a,b) => (a.uomDescription > b.uomDescription) ? 1 : ((b.uomDescription > a.uomDescription) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  getBrandByManufacturerID(manufacturerID){
    if(!manufacturerID){
      this.brandID=undefined;
      this.brandList=[];
      this.getPriceGroupByBrandID(null);
      return;
    }
    this.spinner.show();
    this.setupService.getData("/MasterBrand/findByManufacturerID/"+manufacturerID).subscribe((response) => {
      this.brandList = response;
      this.brandList.sort((a,b) => (a.brandName > b.brandName) ? 1 : ((b.brandName > a.brandName) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }
  
  getPriceGroupByBrandID(brandID){
    if(!brandID){
      this.masterPriceGroupID=undefined;
      this.priceGroupList=[];
      return;
    }
    this.spinner.show();
    this.setupService.getData("/MasterPriceGroup/GetByBrandID/"+brandID).subscribe((response) => {
      this.priceGroupList = response;
      this.priceGroupList.sort((a,b) => (a.masterGroupName > b.masterGroupName) ? 1 : ((b.masterGroupName > a.masterGroupName) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  getDeparmentByCompnayID(companyID){
    if(!companyID){
      this.departmentID1=undefined;
      this.departmentList1=[];
      return;
    }
    this.spinner.show();
    this.setupService.getData("Department/GetByfuel/"+this.userInfo.userName+"/"+companyID+"/false").subscribe((response) => {
      this.departmentList1 = response;
      this.departmentList1.sort((a,b) => (a.departmentDescription > b.departmentDescription) ? 1 : ((b.departmentDescription > a.departmentDescription) ? -1 : 0));
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

  searchData() {
    if (!this.manufacturerID && !this.masterDepartmentID && !this.brandID && !this.masterPriceGroupID && !this.uomTypeID) {
      this.toaster.error('Please select any of the filters', 'Error');
    } else {
      this.spinner.show();
      var searchMaster = {
        "department": this.masterDepartmentID==undefined ? "" : this.masterDepartmentID,
        "manufacturer": this.manufacturerID==undefined ? "" : this.manufacturerID,
        "groupID": this.masterPriceGroupID==undefined ? "" : this.masterPriceGroupID,
        "posCodeOrDesc": "",
        "uOMID": this.uomTypeID==undefined ? "" : this.uomTypeID,
        "unitsIncase": ""
      }
      this.setupService.postData("MasterPriceBookItem/SearchMasterItems",searchMaster).subscribe(result => {
        this.spinner.hide();
        this.gridApi.setRowData(result);
        this.gridApi.sizeColumnsToFit();
      }, error => {
        this.spinner.hide();
        this.toaster.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
      });
    }
  }

  copyToTarget() {
    if (!this.companyID || !this.departmentID1) {
      this.toaster.error('Please select Company & Department', 'Error');
    }else {
      var copyToTargetObj ={
        "masterPricebookItemID": this.selectedItems.toString(),
        "companyID": this.companyID,
        "departmentID": this.departmentID1,
      }

      this.spinner.show();
      this.setupService.postData("MasterPriceBookItem/ImportMasteritemsToTarget",copyToTargetObj).subscribe(result => {
        this.spinner.hide();
        this.clear();
        this.toaster.success("Data copied successfully..", "SUCCESS");
      }, error => {
        this.spinner.hide();
        this.toaster.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
      });
    }
  }

  ismUpdateRowSelected(event) {
    let nodes = event;
    this.selectedItems = nodes ? nodes.map(x => { return x.data.masterPriceBookItemID }).join(',') : '';
    this.copyToTargetFlag= this.selectedItems.length>0 ? true : false;
  }
  clear(){
    this.manufacturerList=[];
    this.manufacturerID=undefined;
    this.departmentList=[];
    this.masterDepartmentID=undefined;
    this.brandList=[];
    this.brandID=undefined;
    this.priceGroupList=[];
    this.masterPriceGroupID=undefined;
    this.uomList=[];
    this.uomTypeID=undefined;
    this.departmentList1=[];
    this.departmentID1=undefined;
    this.companyList=[];
    this.companyID=undefined;
    this.selectedItems=[];
    this.copyToTargetFlag=false;
    this.gridApi.setRowData(null);
    this.gridApi.sizeColumnsToFit();

    this.userInfo = this.constants.getUserInfo();
    this.getCompany();
    this.getManufacturer();
    this.getDepartment();
    this.getUOM();

  }

}