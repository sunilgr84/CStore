import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { Vendor } from '../../../models/vendor-model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import { TestService } from '@shared/services/test/test.service';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';

@Component({
  selector: 'app-add-vendor',
  templateUrl: './add-vendor.component.html',
  styleUrls: ['./add-vendor.component.scss']
})
export class AddVendorComponent implements OnInit {
  editRowData: any;
  @Input() vendorData?: any;
  @Output() backToVendorList: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<any> = new EventEmitter();
  @Output() enableTabs: EventEmitter<any> = new EventEmitter();
  @ViewChild('vendorCode') _vendorCode: any;
  title = 'Account Details';
  userInfo = this.constantService.getUserInfo();
  vendorForm = this.fb.group({
    vendorID: [0],
    companyID: [0],
    vendorCode: ['', Validators.required],
    isActive: [true],
    isFuelVendor: [false],
    vendorName: ['', Validators.required],
    doesVendorSupportEDIInvoice: [false],
    vendorAddressLine1: [''],
    vendorAddressLine2: [''],
    city: [''],
    stateCode: ['', Validators.required],
    countyCode: ['', Validators.required],
    zipCode: [null],
    companyPhoneNo: [''],
    fax: [''],
    webSite: [''],
    // accountNO: [null],
    salesContactE_mail: [''],
    salesContactName: [''],
    salesContactPhoneNo: [''],
    lastModifiedBy: [''],
    lastModifiedDateTime: new Date(),
    createdBy: [''],
    createdDateTime: new Date(),
    countyName: [''],
    stateName: [''],
    paymentID: [0],
    // methodOfPaymentID: [null],
    // paymentTermsID: [null],
    // purchaseFrequencyID: [null],
    isPrintCheck: false,
    paymentSourceID: [0],
    //  methodOfPaymentDescription: [''],
    sourceName: [''],
    amountPaid: [0],
    storeName: [''],
    dateOfPayment: new Date(),
    dateOfIssue: new Date(),
    actualPaymentDate: new Date(),
    chartOfAccountCategoryID: ['']
  });
  isLoading = true;
  isVenderCode = false;
  countyList: any = [];
  stateList: any = [];
  submitted = false;
  selectedRow: any;
  initialFormValues: Vendor;
  isEdit = false;
  isHideGrid = false;
  // paymentMethodList: any;

  // paymentMethodList: any;
  // paymentTermsList: any;
  // purchaseFrequencyList: any;
  isPaymentMLoading = true;
  isPrintCheck = true;
  isMisMatchStateCounty: boolean;
  _checkValueMOP: any;
  countyFilterList: any[];
  isCategories: boolean;
  categoriesList: any;

  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  options: any = {
    types: [],
    componentRestrictions: { country: 'US' }
  };
  constructor(private changeRef: ChangeDetectorRef, private constantService: ConstantService,
    private dataService: SetupService, private itemsService: SetupService, private fb: FormBuilder,
    private toastr: ToastrService, private utilityService: UtilityService,
    private spinner: NgxSpinnerService, private testService: TestService) {
    this.initialFormValues = this.vendorForm.value;
  }
  // convenience getter for easy access to form fields
  get vendor() { return this.vendorForm.controls; }
  get val() { return this.vendorForm.value; }
  ngOnInit() {
    this.getCountyState();
    this.getCategories();
    //this.GetVendorPaymentDrop();


  }
  resetEdit() {
    this.isEdit = this.editRowData ? true : false;
    if (this.editRowData) {
      this.selectedRow = this.editRowData;
      this.title = 'Edit Account Details : ' + this.editRowData.vendorCode;
      this.vendorForm.patchValue(this.editRowData);
    }
    else {
      this.title = "Account Details";
      this.reset();
    }
  }
  getCountyState() {
    this.dataService.getCountyState()
      .subscribe((response) => {
        this.isLoading = false;
        this.countyList = response[0];
        this.stateList = response[1];
        this.onStaeChange(true);
      });
  }
  getCategories() {
    this.isCategories = true;
    this.dataService.getData(`ChartOfAccountCategories/GetChartOfAccountCategories`).
      subscribe((response: any) => {
        this.isCategories = false;
        this.categoriesList = response;
      }, (error) => {
        this.isCategories = false;
        console.log(error);
      }
      );
  }
  // GetVendorPaymentDrop() {
  //   this.dataService.GetVendorPaymentDrop()
  //     .subscribe((response) => {
  //       this.paymentTermsList = response[0];
  //       this.purchaseFrequencyList = response[1];
  //       this.paymentMethodList = response[2];
  //       this.selectMethodOfPayment(this.val.methodOfPaymentID);
  //       this.isPaymentMLoading = false;
  //     }, err => {
  //       this.isPaymentMLoading = false;
  //     });
  // }
  ngOnChanges(changes: SimpleChanges) {
    this.editRowData = changes.vendorData.currentValue;
    this.resetEdit();
  }
  reset() {
    this.vendorForm.patchValue(this.initialFormValues);
    this.submitted = false;
  }
  formatPhoneNumber(field) {
    if (field === 'companyPhoneNo') {
      this.vendorForm.patchValue({
        companyPhoneNo: this.utilityService.formatPhoneNumber(this.vendorForm.get('companyPhoneNo').value)
      });
    }
    if (field === 'salesContactPhoneNo') {
      this.vendorForm.patchValue({
        salesContactPhoneNo: this.utilityService.formatPhoneNumber(this.vendorForm.get('salesContactPhoneNo').value)
      });
    }
  }
  checkExistsVendorCode() {
    if (this.vendorForm.get('vendorCode').value !== '') {
      this.isVenderCode = true;
      // tslint:disable-next-line:max-line-length
      this.dataService.getData(`Vendor/checkVendorCodeExist/${this.vendorForm.value.vendorCode}/${this.vendorForm.get('vendorID').value}/${this.userInfo.companyId}`).
        subscribe((response: any) => {
          this.isVenderCode = false;
          if (response && Number(response) === 1) {
            this.vendorForm.get('vendorCode').setValue('');
            this._vendorCode.nativeElement.focus();
            this.toastr.error('Account Code already exists', this.constantService.infoMessages.error);
            return;
          }
        }, (error) => {
          this.isVenderCode = false;
          console.log(error);
        }
        );
    }
  }
  // save & close call api
  editOrSaveClose(event) {
    this.editOrSave(event, (rowData) => { this.backToList(rowData); });
  }
  editOrSave(_event, callBack) {
    if (this.isMisMatchStateCounty) {
      this.toastr.error('Please change the county');
      return false;
    }
    this.submitted = true;
    if (this.vendorForm.valid) {
      if (this.isEdit) {
        const postData = {
          ...this.selectedRow.data,
          ...this.vendorForm.value,
          isPrintCheck: this._checkValueMOP === 'Check' ? this.vendorForm.value.isPrintCheck : false
        };
        if (!postData.actualPaymentDate) {
          postData.actualPaymentDate = new Date();
        }
        this.spinner.show();
        this.itemsService.updateData('Vendor', postData).
          subscribe((response: any) => {
            this.spinner.hide();
            if (response === '1') {
              this.submitted = false;
              this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
              callBack(postData);
            } else {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          });
      } else {
        const postData = {
          ...this.vendorForm.value,
          companyID: this.userInfo.companyId,
          isPrintCheck: this._checkValueMOP === 'Check' ? this.vendorForm.value.isPrintCheck : false
        };
        this.spinner.show();
        this.itemsService.postData('Vendor', postData).
          subscribe((response) => {
            this.spinner.hide();
            if (response && response.vendorID) {
              this.submitted = false;
              this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
              this.isEdit = true;
              this.selectedRow = [];
              this.selectedRow['data'] = response;
              this.enableTabs.emit({ isDisabledTab: true, data: response });
              this.vendorForm.patchValue(response);
              postData.vendorID = response.vendorID;
              postData.addNew = true;
              callBack(postData);
            } else {
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            }
          },
            (error) => {
              this.spinner.hide();
              console.log(error);
              this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
            });
      }
    }
  }
  // selectMethodOfPayment(id) {
  //   // 'Check'
  //   this.isPrintCheck = true;
  //   if (!this.isEdit) { this.vendorForm.get('isPrintCheck').setValue(false); }
  //   const data = _.find(this.paymentMethodList, ['methodOfPaymentID', id]);
  //   this._checkValueMOP = data && data.methodOfPaymentDescription ? data.methodOfPaymentDescription : '';
  //   if (data && data.methodOfPaymentDescription === 'Check') {
  //     this.isPrintCheck = false;
  //   }
  // }
  onCountyChange(countyCode) {
    this.isMisMatchStateCounty = false;
    this.countyList.map(
      x => {
        if (x.countyCode === this.vendorForm.get('countyCode').value) {
          this.vendorForm.get('stateCode').setValue(x.stateCode);
        }
      });
  }
  onStaeChange(isTrue) {
    // tslint:disable-next-line:no-unused-expression
    // isTrue ? '' : this.vendorForm.get('countyCode').setValue('');
    this.vendorForm.get('countyCode').setValue('');
    if (!this.vendorForm.value.stateCode) {
      this.countyFilterList = [];
      return;
    }
    const state = this.vendorForm.value.stateCode;
    this.countyFilterList = _.filter(this.countyList, ['stateCode', state]);
    if (isTrue) {
      this.vendorForm.get('countyCode').setValue(this.editRowData.countyCode);
    }
    // this.isMisMatchStateCounty = false;
    // const county = _.find(this.countyList, (item) => {
    //   if (item.countyCode === this.vendorForm.get('countyCode').value) {
    //     return item;
    //   }
    // });
    // if (county.stateCode !== this.vendorForm.get('stateCode').value) {
    //   this.isMisMatchStateCounty = true;
    //   this.toastr.warning('Please change the county');
    // }

  }
  backToList(rowData) {
    rowData.stateName = this.stateList.filter(k => k.stateCode === rowData.stateCode)[0].stateName;
    rowData.countyName = this.countyList.filter(p => p.countyCode === rowData.countyCode)[0].countyName;
    this.backToVendorList.emit(rowData);
    this.changeRef.detectChanges();
  }
  cancelEvent() {
    this.cancel.emit();
  }

  handleAddressChange(address: Address) {
    this.vendorForm.get('vendorAddressLine1').setValue(this.filterAddressByType(address, "street_number", "long_name") + " " + this.filterAddressByType(address, "route", "short_name"));
    this.vendorForm.get('zipCode').setValue(this.filterAddressByType(address, "postal_code", "long_name"));
    this.vendorForm.get('city').setValue(this.filterAddressByType(address, "locality", "long_name"));
    this.vendorForm.get('stateCode').setValue(this.filterAddressByType(address, "administrative_area_level_1", "short_name"));
    let county = this.filterAddressByType(address, "administrative_area_level_2", "long_name");
    let countyName = county.substring(0, county.lastIndexOf("County")).trim();
    this.countyFilterList = _.filter(this.countyList, ['stateCode', this.filterAddressByType(address, "administrative_area_level_1", "short_name")]);
    let selectedCounty = _.filter(this.countyFilterList, ['countyName', countyName]);
    if (selectedCounty && selectedCounty.length > 0) {
      this.vendorForm.get('countyCode').setValue(selectedCounty[0].countyCode);
    }
  }

  filterAddressByType(address, addressType, nameType) {
    return address.address_components.filter(address => address.types[0] === addressType)[0][nameType];
  }
}
