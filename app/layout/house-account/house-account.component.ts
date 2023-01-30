import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import * as _ from 'lodash';
import { FormBuilder, Validators } from '@angular/forms';
import { elementStyleProp } from '@angular/core/src/render3';

@Component({
  selector: 'app-house-account',
  templateUrl: './house-account.component.html',
  styleUrls: ['./house-account.component.scss']
})
export class HouseAccountComponent implements OnInit {

  title = 'House Account';
  showForm: boolean;
  addUpdateDetails = false;
  houseAccountForm = this._fb.group({
    houseAccountID: [0],
    accountCode: ['', Validators.required],
    accountName: ['', Validators.required],
    companyID: [0],
    paymentTerms: ['', Validators.required],
    creditLimit: [0, Validators.required],
    fedID: ['', Validators.required],
    name: ['', Validators.required],
    phoneNo: ['', Validators.compose([Validators.required,Validators.pattern(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/)])],
    email: ['', Validators.compose([Validators.required,Validators.email])],
    address: [''],
    city: [''],
    countyCode: [''],
    stateCode: [''],
    zipCode: ['',Validators.maxLength(5)],
    fax: [''],
    webSite: [''],
    createdDateTime: [''],
    createdBy: [''],
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    remainingCreditLimit: [''],
    companyName: [''],
    countyName: [''],
    stateName: ['', Validators.required]
  });
  initialFormValues: any;
  isEdit = false;
  submitted = false;
  paymentTermsArray: Array<any> = ["One Week", "Two Week", "Three Week", "One Month"];
  countyFilterList: any[];
  stateList: any = [];
  countyList: any = [];
  isLoading = true;
  checkAccountCodeFlag:any=false;
  checkAccountNameFlag:any=false;
  //
  rowData: any;
  gridApi: any;
  gridColumnApi: any;
  gridOptions: GridOptions;
  filterText: string;
  userInfo = this.constantService.getUserInfo();
  constructor(private constantService: ConstantService,
    private dataService: SetupService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private gridService: GridService,
    private commonService: CommonService, private _fb: FormBuilder) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.houseAccountGrid);
    this.initialFormValues = this.houseAccountForm.value;
  }

  ngOnInit() {
    this.feachHouseAccountList();
    this.getCountyState();
    this.showForm = false;
  }

  onAddHouseAccount() {
    this.showForm = true;
  }

  reset() {
    this.houseAccountForm.patchValue(this.initialFormValues);
    this.isEdit = false;
    this.submitted = false;
    this.showForm = false;
    this.gridApi.refreshCells({ force: true });
  }

  get house() { return this.houseAccountForm.controls; }


  handleAddressChange(address: Address) {
    this.houseAccountForm.get('address').setValue(this.filterAddressByType(address, "street_number", "long_name") + " " + this.filterAddressByType(address, "route", "short_name"));
    this.houseAccountForm.get('zipCode').setValue(this.filterAddressByType(address, "postal_code", "long_name"));
    this.houseAccountForm.get('city').setValue(this.filterAddressByType(address, "locality", "long_name"));
    this.houseAccountForm.get('stateName').setValue(this.filterAddressByType(address, "administrative_area_level_1", "long_name"));
    this.houseAccountForm.get('stateCode').setValue(this.filterAddressByType(address, "administrative_area_level_1", "short_name"));
    let county = this.filterAddressByType(address, "administrative_area_level_2", "long_name");
    let countyName = county.substring(0, county.lastIndexOf("County")).trim();
    this.countyFilterList = this.countyList.filter(e=> e.stateCode==this.filterAddressByType(address, "administrative_area_level_1", "short_name"));
    let selectedCounty = _.filter(this.countyFilterList, ['countyName', countyName]);
    if (selectedCounty && selectedCounty.length > 0) {
      this.houseAccountForm.get('countyCode').setValue(selectedCounty[0].countyCode);
      this.houseAccountForm.get('countyName').setValue(selectedCounty[0].countyName);
    }
  }

  filterAddressByType(address, addressType, nameType) {
    return address.address_components.filter(address => address.types[0] === addressType)[0][nameType];
  }

  onStaeChange(isTrue) {
    this.houseAccountForm.get('countyName').setValue('');
    if (!this.houseAccountForm.value.stateName) {
      this.countyFilterList = [];
      return;
    }
    const state = this.houseAccountForm.value.stateName;
    let stateObj = this.stateList.find(e=>e.stateName==state);
    this.countyFilterList = _.filter(this.countyList, ['stateCode', stateObj.stateCode]);
    if (isTrue) {
      this.houseAccountForm.get('countyName').setValue(this.initialFormValues.countyCode);
    }

  }

  getCountyState() {
    this.dataService.getCountyState()
      .subscribe((response) => {
        this.isLoading = false;
        this.countyList = response[0];
        this.commonService.stateList = this.stateList = response[1];
        this.onStaeChange(true);
      });
  }

  updateOrSave(_event, callBack = () => { }) {
    
    this.submitted = true;
    if (this.houseAccountForm.valid) {
      if (!this.isEdit) {
        
        if(this.checkAccountCodeFlag){
          this.toastr.error("Account code already exists", this.constantService.infoMessages.error);
          return;
        }else if(this.checkAccountNameFlag){
          this.toastr.error("Account name already exists", this.constantService.infoMessages.error);
          return;
        }
        this.houseAccountForm.get("companyID").setValue(this.userInfo.companyId);
        this.houseAccountForm.get("companyName").setValue(this.userInfo.companyName);
        this.houseAccountForm.get("createdBy").setValue(this.userInfo.userName);
        this.houseAccountForm.get("createdDateTime").setValue(new Date());
        this.houseAccountForm.get("lastModifiedBy").setValue(this.userInfo.userName);
        this.houseAccountForm.get("lastModifiedDateTime").setValue(new Date());
        this.spinner.show();
        this.dataService.postData('HouseAccount', this.houseAccountForm.value).subscribe((response) => {
          this.spinner.hide();
          if (response && response.houseAccountID) {
            this.feachHouseAccountList();
            this.reset();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        },
          (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          });

      } else {

        this.houseAccountForm.get("companyID").setValue(this.userInfo.companyId);
        this.houseAccountForm.get("companyName").setValue(this.userInfo.companyName);
        this.houseAccountForm.get("lastModifiedBy").setValue(this.userInfo.userName);
        this.houseAccountForm.get("lastModifiedDateTime").setValue(new Date());
        this.spinner.show();
        this.dataService.updateData('HouseAccount', this.houseAccountForm.value).subscribe(result => {
          this.spinner.hide();
          if (result.statusCode == 400) {
            this.toastr.error(result.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
          } else {
            this.feachHouseAccountList();
            this.reset();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        });
      }
    }
  }

  feachHouseAccountList() {
    this.spinner.show();
    this.dataService.getData('HouseAccount/GetAll?CompanyID=' + this.userInfo.companyId).subscribe((response) => {
      this.spinner.hide();
      if (response && response['statusCode']) {
        this.rowData = [];
        return;
      }
      this.rowData = response;
      this.gridApi.setRowData(response);
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin, 'error');
    });
  }

  onGridReady(params) {
    this.gridColumnApi = this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  editAction(params) {
    this.countyFilterList = this.countyList.filter(e=> e.stateCode==params.data.stateCode);
    this.gridApi.refreshCells({ force: true });
    params.hideDeleteAction = true;
    this.isEdit = true;
    this.houseAccountForm.patchValue(params.data);
    if(!params.data.countyName){
      this.houseAccountForm.get("countyName").setValue("");
    }
    if(!params.data.stateName){
      this.houseAccountForm.get("stateName").setValue("");
    }
    this.showForm = true;
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }


  deleteAction(params) {
    if (params.data.houseAccountID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      return;
    }
    this.spinner.show();
    this.dataService.deleteData(`HouseAccount?id=${params.data.houseAccountID}`).subscribe(
      (response: any) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (response === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.feachHouseAccountList();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.contactAdmin);
      });
  }

  checkAccountCode(){
    if(!this.isEdit){
      this.dataService.getData('HouseAccount/CheckAccountCode/'+this.houseAccountForm.get("accountCode").value+'/' + this.userInfo.companyId).subscribe((response) => {
        if(JSON.parse(response)){
          this.toastr.error("Account code already exists", this.constantService.infoMessages.error);
          this.checkAccountCodeFlag = true;
        }else{
          this.checkAccountCodeFlag = false;
        }
      }, (error) => { console.log(error); });
    }
  }
  checkAccountName(){
    if(!this.isEdit){
      this.dataService.getData('HouseAccount/CheckAccountName/'+this.houseAccountForm.get("accountName").value+'/' + this.userInfo.companyId).subscribe((response) => {
        if(JSON.parse(response)){
          this.toastr.error("Account name already exists", this.constantService.infoMessages.error);
          this.checkAccountNameFlag = true;
        }else{
          this.checkAccountNameFlag = false;
        }
      }, (error) => { console.log(error); });
    }
  }
}

