import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { LoggerService } from 'src/app/shared/services/logger/logger.service';
import { ToastrService } from 'ngx-toastr';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { UtilityService } from '@shared/services/utility/utility.service';
import { Company } from '@models/company.model';
import { Router } from '@angular/router';
import { WeatherService } from '@shared/services/weather/weather.service';
import { MessageService } from '@shared/services/commmon/message-Service';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
import { Address } from 'ngx-google-places-autocomplete/objects/address';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.scss']
})
export class CompanyDetailsComponent implements OnInit {
  submitted = false;
  company: Company;
  countyList: any;
  stateList: any;
  title = 'Add a New Company';
  @Input() companyData?: any;
  @Input() paramId: any;
  isUpdateCompany: boolean;
  isLoading = true;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  @Output() enableTabs: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  isCompanyNameExit: boolean;
  isCompanyEditMode: boolean;
  userInfo: any;
  isStateCountyMissMatch: boolean;
  activeList = [{ value: true, name: 'Active' }, { value: false, name: 'In Active' }];
  roleName: string;
  countyFilterList: any[];
  companyLogoURL: any | '';

  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  options: any = {
    types: [],
    componentRestrictions: { country: 'US' }
  };
  constructor(private constants: ConstantService, private toastr: ToastrService, private changeRef: ChangeDetectorRef,
    private dataService: SetupService, private logger: LoggerService, private spinner: NgxSpinnerService,
    private utilityService: UtilityService, private router: Router, private weatherApi: WeatherService,
    private messageService: MessageService) {
    this.roleName = this.constants.roleName;
  }

  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.company = new Company();
    this.company.countyCode = this.company.stateCode = '';
    this.isUpdateCompany = this.companyData ? true : false;
    if (this.companyData) {
      this.title = 'Edit Company';
      this.isCompanyEditMode = true;
      this.company = this.companyData;
      this.companyLogoURL = this.company.companyLogo;
    } else {
      this.company.isActive = true;
    }
    this.getCompanyCounty();
    this.formatPhoneNumber(this.company.phoneNo);
    if (this.paramId) {
      this.isUpdateCompany = true;
      this.title = 'Edit Company';
      this.isCompanyEditMode = true;
      this.getCompanyDetailsByID(this.paramId);
    }
    //  this.getAddress();
  }

  deleteImage() {
    this.companyLogoURL = '';
    this.company.companyLogo = null;
  }

  upload(evt) {
    var files = evt.target.files;
    var file = files[0];
    if (files && file) {
      let reader = new FileReader();
      var ext = ['image/jpeg', 'image/png', 'image/jpg'];
      if (ext.indexOf(file.type) == -1) {
        this.toastr.error('Upload only images', 'Error');
        return;
      }
      else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(file);
      }
    }
  }

  _handleReaderLoaded(readerEvt) {
    var binaryString = readerEvt.target.result;
    this.company.companyLogo = binaryString;
    this.companyLogoURL = binaryString;
  }

  onSubmit(form, isSaveAndClose?) {
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    /*   if (this.companyLogoURL == '' || this.companyLogoURL == null) {
        this.toastr.error('Please Upload Company Logo', 'Error');
        return false;
      } */
    this.submitted = true;
    const date = new Date();
    if (form.valid && !this.isCompanyNameExit) {
      this.company.syncPwd = 'cstore' + date.getMilliseconds();
      this.company.syncUser = 'cstore' + date.getMilliseconds();
      this.company.companyLoginCode = 'cstore' + date.getMilliseconds();
      this.company.zipCode = String(this.company.zipCode);
      if (!this.company.isActive) {
        this.company.isInPOSSyncStatus = false;
      }
      this.spinner.show();
      this.dataService.postData('Company', this.company).subscribe(
        (response) => {
          this.spinner.hide();
          this.logger.log(JSON.stringify(response));
          this.toastr.success(this.constants.infoMessages.addedRecord);
          this.isUpdateCompany = true;
          this.company = response;
          this.enableTabs.emit({ isDisabledTab: false, data: response });
          if (isSaveAndClose) {
            this.onNavigateBank();
            return;
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          this.logger.error(error);
        }
      );
    }
  }

  onCountyChange(countyCode) {
    this.isStateCountyMissMatch = false;
    this.countyList.map(
      x => {
        if (x.countyCode === countyCode) {
          this.company.stateCode = x.stateCode;
        }
      });
  }
  // onStaeChange(stateCode) {
  //   this.isStateCountyMissMatch = false;
  //   const county = _.find(this.countyList, (item) => {
  //     if (item.countyCode === this.company.countyCode) {
  //       return item;
  //     }
  //   });
  //   if (county.stateCode !== stateCode) {
  //     this.isStateCountyMissMatch = true;
  //     this.toastr.warning('Please change the county');
  //   }

  // }
  onStaeChange(isTrue?) {
    // tslint:disable-next-line:no-unused-expression
    isTrue ? '' : this.company.countyCode = '';
    if (!this.company.stateCode) {
      this.countyFilterList = [];
      return;
    }
    const state = this.company.stateCode;
    this.countyFilterList = _.filter(this.countyList, ['stateCode', state]);
    if (isTrue) {
      this.company.countyCode = this.company.countyCode;
    }
  }
  zipCodeChanged(zipCoe) {

  }
  updateCompDetails(form, isSaveAndClose?) {
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    /*  if (this.companyLogoURL == '' || this.companyLogoURL == null) {
       this.toastr.error('Please Upload Company Logo', 'Error');
       return false;
     } */
    if (!form.valid) {
      this.submitted = true;
      return;
    }
    const postData = {
      ...this.company,
      zipCode: String(this.company.zipCode),
    };
    this.spinner.show();

    this.dataService.updateData('Company', postData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toastr.success(this.constants.infoMessages.updatedRecord);
          if (this.userInfo && this.userInfo.roles.indexOf("SuperAdmin") == -1) {
            if (this.paramId == postData.companyID) {
              this.messageService.setLogo(postData.companyLogo);
            }
          }
          if (isSaveAndClose) {
            this.onNavigateBank();
            return;
          }
        }
        // return response;
      },
      (error) => {
        this.spinner.hide();
        this.logger.log(error);
      }
    );
  }
  // no consition found so i use forkJoin to send combine request
  getCompanyCounty() {
    this.dataService.getCountyState()
      .subscribe((response) => {
        this.isLoading = false;
        if (response && response['statusCode']) {
          this.countyList = this.stateList = [];
          return;
        }
        this.countyList = response[0];
        this.stateList = response[1];
        this.onStaeChange(true);
      });
  }

  backToList() {
    this.changeRef.detectChanges();
    if (this.paramId) { // TODO - need to check role erpmision to naviagte admin
      this.router.navigate(['admin/companies']);
    } else {
      this.backToCompanyList.emit(false);
    }
  }

  formatPhoneNumber(number) {
    this.company.phoneNo = this.utilityService.formatPhoneNumber(number);
  }

  getCompanyDetailsByID(id) {
    this.dataService.getData('Company/GetByID?companyid=' + id).subscribe(
      (response) => {
        this.company = response;
        this.companyLogoURL = this.company.companyLogo;
      });
  }

  checkCompanyNameExists(companyName) {
    this.dataService.getData('Company/CheckCompanyNameExists?companyName=' + companyName).subscribe(
      (response) => {
        if (!this.isCompanyEditMode) {
          this.isCompanyNameExit = response === 'true' ? true : false;
        }
      });
  }
  getAddress(companyAddressLine1) {
    // '1600+Amphitheatre+Parkway,+Mountain+View,+CA')
    this.weatherApi.getCityStateZip(companyAddressLine1)
      .subscribe((response) => {
        console.log('google api address', response);
      });
  }

  autCompleteAddress(inputText) {
    // inputText = '1600+Amphitheatre';
    this.weatherApi.autoCompletePlaces(inputText)
      .subscribe((response) => {
        console.log(response);
      }, (error) => {
        console.log(error);
      });
  }
  reset() {
    this.company = new Company();
    this.companyLogoURL = '';
    this.submitted = false;
  }
  onNavigateBank() {
    const data = { tabId: 'add-bank' };
    this.changeTabs.emit(data);
  }

  handleAddressChange(address: Address) {
    this.company.companyAddressLine1 = this.filterAddressByType(address, "street_number", "long_name") + " " + this.filterAddressByType(address, "route", "short_name");
    this.company.city = this.filterAddressByType(address, "locality", "long_name");
    this.company.stateCode = this.filterAddressByType(address, "administrative_area_level_1", "short_name");
    this.company.zipCode = this.filterAddressByType(address, "postal_code", "long_name");
    let county = this.filterAddressByType(address, "administrative_area_level_2", "long_name");
    let countyName = county.substring(0, county.lastIndexOf("County")).trim();
    this.countyFilterList = _.filter(this.countyList, ['stateCode', this.filterAddressByType(address, "administrative_area_level_1", "short_name")]);
    let selectedCounty = _.filter(this.countyFilterList, ['countyName', countyName]);
    if (selectedCounty && selectedCounty.length > 0) {
      this.company.countyCode = selectedCounty[0].countyCode;
    }
  }

  filterAddressByType(address, addressType, nameType) {
    return address.address_components.filter(address => address.types[0] === addressType)[0][nameType];
  }
}
