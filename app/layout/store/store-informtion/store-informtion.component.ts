import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output, Input, ViewChild } from '@angular/core';
import { FormBuilder, Validators, PatternValidator } from '@angular/forms';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { LoggerService } from 'src/app/shared/services/logger/logger.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { StoreInfo } from '../../models/store-informtion.model';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { Address } from 'ngx-google-places-autocomplete/objects/address';
import { GooglePlaceDirective } from 'ngx-google-places-autocomplete';
@Component({
  selector: 'app-store-informtion',
  templateUrl: './store-informtion.component.html',
  styleUrls: ['./store-informtion.component.scss']
})
export class StoreInformtionComponent implements OnInit {
  roleName: any;
  submitted = false;
  isEdit = false;
  isDisabled = false;
  isChecked = false;
  isMixMatch = false;
  private _storeInfo: StoreInfo;
  isMouseEnter: boolean;
  @Input() storeInfoData?: any;
  decodeImage = ``;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() enableTabs: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  storeInfoForm = this._fb.group({
    storeLocationID: [0],
    posSystemCD: [''],
    companyID: [0],
    paymentSystemsProductCode: [0, Validators.required],
    posStoreLocationID: [0],
    isAutoPushToPOS: [true],
    isUploadToPOSEnabled: [true],
    isMixMatchEnabled: [true],
    storeFullName: [''],
    storeName: ['', Validators.required],
    storeAddressLine1: ['', Validators.required],
    storeAddressLine2: [''],
    city: ['', Validators.required],
    countyCode: ['', Validators.required],
    stateCode: ['', Validators.required],
    phoneNo: ['', Validators.required],
    fax: [''],
    e_Mail: ['', [Validators.required]], //  [Validators.required, Validators.pattern('^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$')]
    macAddress: ['00'],
    downloadFilesLocation: ['D:/'],
    storeLocationIdentifier: [''],
    storeContactName: [''],
    notificationE_Mail: [''],
    notificationSMSPhoneNo: [''],
    lastPingFromClientDateTime: [''],
    softwareVersion: [''],
    isInvoiceEnabled: [false],
    isInPOSSyncStatus: [true],
    lotteryStateCode: [''],
    lotteryRetailerID: [0],
    lotteryRetailerUserName: [''],
    lotteryRetailerPassword: [''],
    otherAppMacAddress: [''],
    invoiceAppMacAddress: [''],
    invoiceAppUser: [''],
    invoiceAppPwd: [''],
    isLotteryStartingFromZero: [true],
    isFuelPriceUpdateEnabled: [false],
    noOfLotteryBins: [0],
    isDayCloseLocation: [false],
    isJobberOnly: [false],
    zipCode: [''],
    enableDayReconSubmission: [false],
    isCOGEnabled: [false],
    posSystemSubCD: [0],
    roleName: [''],
    stateName: [''],
    isSmsSent: [false],
    smsPayloadTypeID: [0],
    smsPayLoadTypeName: [''],
    ignoreTotalFileStatusForCompany: [true],
    ignoreTotalFileStatusForCompanyTillDate: new Date(),
    ignoreTotalFileStatusForAdmin: [true],
    ignoreTotalFileStatusForAdminTillDate: new Date(),
    ignoreTotalFileStatus: [true],
    ignoreTotalFileStatusTillDate: new Date(),
    countyName: [''],
    paymentSystemsProductName: [''],
    pOsSystemName: [''],
    tankMonitoringSystemName: [''],
    stateRetailerWebsite: [''],
    syncUser: [''],
    syncPwd: ['']
  });
  countyList: any;
  countyFilterList = [];
  stateList: any;
  smsPlayLoadTypeList: any;
  posSystemList: any;
  isLoading = true;
  isSmsPlayLoadTypeLoading = true;
  isServiceLevelLoading = true;
  isPriceTierLoading = true;
  isSamecontactDetails = false;
  userInfo: any;
  fuelPriceTierID: any = '';
  fuelServiceLevelID: any = '';
  storeTierId: any = '';
  storeTierList = [];
  storeTierIdDetails: any = ' ';
  serviceLevelById: any;
  priceTierById: any;
  isStateCountyMissMatch: boolean;

  @ViewChild("placesRef") placesRef: GooglePlaceDirective;
  options: any = {
    types: [],
    componentRestrictions: { country: 'US' }
  };

  constructor(private _fb: FormBuilder, private constants: ConstantService, private toastr: ToastrService,
    private changeRef: ChangeDetectorRef, private dataService: SetupService, private logger: LoggerService,
    private spinner: NgxSpinnerService, private utilityService: UtilityService) {
    this._storeInfo = this.storeInfoForm.value;
    this.roleName = this.constants.roleName;
  }
  ngOnInit() {
    this.userInfo = this.constants.getUserInfo();
    this.resetForm();
    this.getStoreLocationDetails();
    // this.fuelPriceTierByStoreLocationID('');
  }
  // convenience getter for easy access to form fields
  get store() { return this.storeInfoForm.controls; }
  resetForm() {
    this.getCounty();
    // this.getSMSPayLoadType();
    this.getPOSSystem();
    this.isEdit = false;
    this.isSamecontactDetails = false;
    this.hideIsMixMatch();
    this.submitted = false;
    this.storeInfoForm.setValue(this._storeInfo);
    this.fuelPriceTierID = '';
    this.fuelServiceLevelID = '';
  }
  loadFormDetails() {
    if (this.storeInfoData) {
      this.storeInfoForm.get('stateCode').setValue(this.storeInfoData.stateCode);
      // this.storeInfoForm.setValue(this.storeInfoData, { onlySelf: true });
      if (this.storeInfoData.posSystemCD === 'RUBY' && this.storeInfoData.posSystemSubCD === 'SAPPHIRE') {
        this.storeInfoData.posSystemCD = 'RUBY-SAPPHIRE';
      }
      this.storeInfoForm.patchValue(this.storeInfoData);
      // tslint:disable-next-line:no-unused-expression
      this.storeInfoData ? this.checkSameContactDetailsForReportNotification() : null;
      // this.serviceLevelByStoreLocationID(this.storeInfoData.storeLocationID);
      // this.priceTierStoreLocationID(this.storeInfoData.storeLocationID);
      // this.fuelPriceTierByStoreLocationID(this.storeInfoData.storeLocationID);
      this.isEdit = true;
    }
  }

  serviceLevelByStoreLocationID(storeLocationId) {
    this.dataService.getData(`StoreFuelServiceLevelConfiguration/getByLocation/${storeLocationId}`).subscribe((response) => {
      this.isServiceLevelLoading = false;
      if (response && response['statusCode']) {
        this.serviceLevelById = this.fuelServiceLevelID = [];
        return;
      }
      this.serviceLevelById = response;
    });
  }

  fuelPriceTierByStoreLocationID(storeLocationId) {
    this.dataService.getData(`FuelPriceTier/list`).subscribe((response) => {
      if (response) {
        this.storeTierList = response;
        if (storeLocationId) {
          this.dataService.getData(`StoreFuelPriceTierConfiguration/getByLocation/${storeLocationId}`).subscribe((response) => {
            if (response) {
              this.storeTierId = response.fuelPriceTierID;
              this.storeTierIdDetails = response;
            }
          });
        }
      }
    });
  }
  priceTierStoreLocationID(storeLocationId) {
    this.dataService.getData(`StoreFuelMOPTypeConfiguration/getByLocation/${storeLocationId}`).subscribe((response) => {
      this.isPriceTierLoading = false;
      if (response && response['statusCode']) {
        this.fuelPriceTierID = this.priceTierById = [];
        return;
      }
      this.priceTierById = response;
    });
  }
  getCounty() {
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
  getSMSPayLoadType() {
    this.dataService.getData('SMSPayLoadType/Getlist').subscribe((response) => {
      this.isSmsPlayLoadTypeLoading = false;
      if (response && response['statusCode']) {
        this.smsPlayLoadTypeList = [];
        return;
      }
      this.smsPlayLoadTypeList = response;
    }, (error) => {
      this.logger.error(error);
    });
  }
  getPOSSystem() {
    this.dataService.getData('POSSystem/getAll').subscribe((response) => {
      if (response && response['statusCode']) {
        this.posSystemList = [];
        return;
      }
      this.posSystemList = response;
    });
  }
  changed = (evt) => {
    this.isChecked = evt;
    if (this.isChecked) {
      if (this.storeInfoForm.get('e_Mail').value !== '' && this.storeInfoForm.get('phoneNo').value !== '') {
        this.storeInfoForm.patchValue({
          notificationE_Mail: this.storeInfoForm.get('e_Mail').value,
          notificationSMSPhoneNo: this.storeInfoForm.get('phoneNo').value
        });
        this.isSamecontactDetails = true;
        // this.storeInfoForm.controls.notificationE_Mail.disable();
        // this.storeInfoForm.controls.notificationSMSPhoneNo.disable();
      } else {

      }
    } else {
      this.storeInfoForm.patchValue({
        notificationE_Mail: [''],
        notificationSMSPhoneNo: ['']
      });
      this.isSamecontactDetails = false;
    }
  }
  hideIsMixMatch() {
    if (this.storeInfoForm.value.posSystemCD === 'PASSPORT' || this.storeInfoForm.value.posSystemCD === 'RUBY-SAPPHIRE') {
      this.isMixMatch = true;
    } else {
      this.isMixMatch = false;
    }
  }
  editOrSaveClose(event) {
    this.editOrSave(event, false, () => { this.backToList(); });
  }
  editOrSave(_event, isContinue?: boolean, callBack = () => { }) {
    if (this.isStateCountyMissMatch) {
      this.toastr.error('Please change the county');
      return false;
    }
    this.submitted = true;
    if (this.storeInfoForm.invalid) {
      return;
    }
    console.log("HELLO", this.storeInfoForm);
    
    this.storeInfoForm.patchValue({
      // tslint:disable-next-line:max-line-length
      countyName: this.storeInfoForm.get('countyCode').value ? this.countyList.find((i: any) => i.countyCode === this.storeInfoForm.get('countyCode').value).countyName : '',
      // tslint:disable-next-line:max-line-length
      stateName: this.storeInfoForm.get('stateCode').value ? this.stateList.find((i: any) => i.stateCode === this.storeInfoForm.get('stateCode').value).stateName : '',
      // tslint:disable-next-line:max-line-length
      pOsSystemName: this.storeInfoForm.get('posSystemCD').value ? this.posSystemList.find((i: any) => i.storeLocationPosID == this.storeInfoForm.get('posSystemCD').value).posSystemName : '',
      // pOsSystemName: this.storeInfoForm.get('posSystemCD').value ? this.posSystemList.find((i: any) => i.storeLocationPosID === this.storeInfoForm.get('posSystemCD').value).pOsSystemName : '',
      // tslint:disable-next-line:max-line-length
      smsPayLoadTypeName: Number(this.storeInfoForm.get('smsPayloadTypeID').value) !== 0 ? this.smsPlayLoadTypeList.find((i: any) => i.smsPayloadTypeID === Number(this.storeInfoForm.get('smsPayloadTypeID').value)).smsPayLoadTypeName : '',
    });
    let posSystemCD, posSystemSubCD;
    const posSystemCDValue = this.storeInfoForm.get('posSystemCD').value;
    if (posSystemCDValue === 'PASSPORT') {
      posSystemCD = 'PASSPORT';
      posSystemSubCD = '';
    } else if (posSystemCDValue === 'RUBY') {
      posSystemCD = 'RUBY';
      posSystemSubCD = '';
    } else {
      posSystemCD = 'RUBY';
      posSystemSubCD = 'SAPPHIRE';
    }

    if (this.isEdit) {

      const postDataFuelServiceLevel = {
        storeFuelServiceLevelConfigurationID: this.serviceLevelById && this.serviceLevelById.storeFuelServiceLevelConfigurationID ?
          this.serviceLevelById.storeFuelServiceLevelConfigurationID : null,
        storeLocationID: this.storeInfoData.storeLocationID,
        fuelServiceLevelID: Number(this.fuelServiceLevelID)
      };

      const postDataPriceTier = {
        mopConfigurationID: this.priceTierById && this.priceTierById.storeFuelPriceTierConfigurationID ?
          this.priceTierById.storeFuelPriceTierConfigurationID : null,
        storeLocationID: this.storeInfoData.storeLocationID,
        //  fuelPriceTierID: Number(this.fuelPriceTierID),
        mopTypeID: Number(this.fuelPriceTierID)

      };

      const postData = {
        ...this.storeInfoForm.value,
        // paymentSystemsProductCode: 7,
        storeFullName: this.storeInfoForm.value.storeFullName,
        macAddress: '00',
        downloadFilesLocation: 'D:',
        smsPayloadTypeID: Number(this.storeInfoForm.value.smsPayloadTypeID),
        isSmsSent: this.storeInfoForm.value.isSmsSent ? this.storeInfoForm.value.isSmsSent : false,
        posSystemCD: posSystemCD,
        posSystemSubCD: posSystemSubCD,
      };
      if (postDataFuelServiceLevel.fuelServiceLevelID > 0) {
        if (postDataFuelServiceLevel.storeFuelServiceLevelConfigurationID) {
          this.dataService.updateData(`StoreFuelServiceLevelConfiguration/Update`, postDataFuelServiceLevel)
            .subscribe((response) => {
              console.log(response);
            });
        } else {
          postDataFuelServiceLevel.storeFuelServiceLevelConfigurationID = 0;
          this.dataService.postData(`StoreFuelServiceLevelConfiguration/AddNew`, postDataFuelServiceLevel)
            .subscribe((response) => {
              console.log(response);
            });
        }
      }
      if (postDataPriceTier.mopTypeID > 0) {
        if (postDataPriceTier.mopConfigurationID) {
          this.dataService.updateData(`StoreFuelMOPTypeConfiguration/Update`, postDataPriceTier)
            .subscribe((response) => {
              console.log(response);
            });
        } else {
          postDataPriceTier.mopConfigurationID = 0;
          this.dataService.postData(`StoreFuelMOPTypeConfiguration/AddNew`, postDataPriceTier)
            .subscribe((response) => {
              console.log(response);
            });
        }
      }
      this.spinner.show();
      this.dataService.updateData('StoreLocation/updates', postData).
        subscribe((response: any) => {
          if (response.statusCode) {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          } else if (response) {
            this.spinner.hide();
            this.logger.log(JSON.stringify(response));
            if (this.storeInfoForm.value.smsPayloadTypeID && this.storeInfoForm.value.storeLocationID) {
              this.SmsConfiguration(this.storeInfoForm.value.storeLocationID, this.storeInfoForm.value.smsPayloadTypeID, true);
            }
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            if (isContinue) {
              this.onNavigateSalesTaxSetup();
            }
            callBack();
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          this.logger.error(error);
        });
    } else {
      const postData = {
        ...this.storeInfoForm.value,
        storeFullName: this.storeInfoForm.value.storeFullName,
        smsPayloadTypeID: Number(this.storeInfoForm.value.smsPayloadTypeID),
        isSmsSent: this.storeInfoForm.value.isSmsSent ? this.storeInfoForm.value.isSmsSent : false,
        posSystemCD: posSystemCD,
        posSystemSubCD: posSystemSubCD,
        TankMonitoringSystemID: 2,      // change values here
        PaymentSystemsProductCode: 2      // change values here
      };
      postData.companyID = this.userInfo.companyId;
      this.spinner.show();

      this.dataService.postData('StoreLocation/AddNewStoreLocation', postData).
        subscribe((response) => {
          console.log('in post method of add store', response);
          this.spinner.hide();
          if (response && response.storeLocationID) {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.AddFuelPriceTier(response.storeLocationID);
            this.isEdit = true;
            if (this.storeInfoForm.value.smsPayloadTypeID) {
              this.SmsConfiguration(response.storeLocationID, this.storeInfoForm.value.smsPayloadTypeID, false);
            }
            this.enableTabs.emit({ isDisabledTab: false, data: response });
            this.storeInfoForm.setValue(response);
            // this.resetForm();
            if (isContinue) {
              this.onNavigateSalesTaxSetup();
            }
            callBack();
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          this.logger.error(error);
        });
    }
  }
  AddFuelPriceTier(storeLocationID) {
    const postDataFuelServiceLevel = {
      storeFuelServiceLevelConfigurationID: this.serviceLevelById && this.serviceLevelById.storeFuelServiceLevelConfigurationID ?
        this.serviceLevelById.storeFuelServiceLevelConfigurationID : null,
      storeLocationID: storeLocationID,
      fuelServiceLevelID: Number(this.fuelServiceLevelID)
    };

    const postDataPriceTier = {
      storeFuelPriceTierConfigurationID: this.priceTierById && this.priceTierById.storeFuelPriceTierConfigurationID ?
        this.priceTierById.storeFuelPriceTierConfigurationID : null,
      storeLocationID: storeLocationID,
      fuelPriceTierID: Number(this.fuelPriceTierID),
      storeFuelMOPConfigurationID: 0,
      fuelPriceMOPID: Number(this.fuelPriceTierID)
    };
    if (postDataFuelServiceLevel.fuelServiceLevelID > 0) {
      if (postDataFuelServiceLevel.storeFuelServiceLevelConfigurationID) {
        this.dataService.updateData(`StoreFuelServiceLevelConfiguration/Update`, postDataFuelServiceLevel)
          .subscribe((response) => {
            console.log(response);
          }, (error) => {

          });
      } else {
        postDataFuelServiceLevel.storeFuelServiceLevelConfigurationID = 0;
        this.dataService.postData(`StoreFuelServiceLevelConfiguration/AddNew`, postDataFuelServiceLevel)
          .subscribe((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });
      }
    }
    if (postDataPriceTier.fuelPriceMOPID > 0) {
      if (postDataPriceTier.storeFuelPriceTierConfigurationID) {
        console.log(postDataPriceTier)
        this.dataService.updateData(`StoreFuelMOPConfiguration/AddNew`, postDataPriceTier)
          .subscribe((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });
      } else {
        postDataPriceTier.storeFuelPriceTierConfigurationID = 0;
        this.dataService.postData(`StoreFuelPriceTierConfiguration/AddNew`, postDataPriceTier)
          .subscribe((response) => {
            console.log(response);
          }, (error) => {
            console.log(error);
          });
      }
    }
  }

  SmsConfiguration(storeLocationID, smsPayloadTypeID, isUpdate) {
    const postData = {
      storeLocationID: storeLocationID,
      smsPayloadTypeID: smsPayloadTypeID
    };
    if (isUpdate) {
      this.dataService.updateData('SmsConfiguration/Update', postData).
        subscribe((response) => {
          if (response) {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
          } else {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          this.logger.error(error);
        });
    } else {
      this.dataService.postData('SmsConfiguration/AddNew', postData).
        subscribe((response) => {
          if (response) {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.contactAdmin);
          this.logger.error(error);
        });
    }
  }
  formatPhoneNumber(value, msg) {
    if (msg === 'phoneNo') {
      this.storeInfoForm.patchValue({
        phoneNo: this.utilityService.formatPhoneNumber(value)
      });
    } else if (msg === 'notificationSmsPhoneNo') {
      this.storeInfoForm.patchValue({
        notificationSMSPhoneNo: this.utilityService.formatPhoneNumber(value)
      });
    }
  }

  backToList() {
    this.resetForm();
    this.backToStoreList.emit(false);
    this.changeRef.detectChanges();
  }
  checkSameContactDetailsForReportNotification() {
    if (this.storeInfoData.phoneNo === this.storeInfoData.notificationSMSPhoneNo &&
      this.storeInfoData.e_Mail === this.storeInfoData.notificationE_Mail) {
      this.changed(true);
    }
  }
  onCountyChange() {
    // this.isStateCountyMissMatch = false;
    // this.countyList.map(
    //   x => {
    //     if (x.countyCode === this.storeInfoForm.value.countyCode) {
    //       // this.company.stateCode = x.stateCode;
    //       this.storeInfoForm.get('stateCode').setValue(x.stateCode);
    //     }
    //   });
  }
  onStaeChange(isTrue?) {
    this.storeInfoForm.get('countyCode').setValue('');
    if (!this.storeInfoForm.value.stateCode) {
      this.countyFilterList = [];
      return;
    }
    const state = this.storeInfoForm.value.stateCode;
    this.countyFilterList = _.filter(this.countyList, ['stateCode', state]);
    if (isTrue) {
      this.storeInfoForm.get('countyCode').setValue(this.storeInfoData.countyCode);
    }
    // this.isStateCountyMissMatch = false;
    // const county = _.find(this.countyList, (item) => {
    //   if (item.countyCode === this.storeInfoForm.value.countyCode) {
    //     return item;
    //   }
    // });
    // if (county.stateCode !== this.storeInfoForm.value.stateCode) {
    //   this.isStateCountyMissMatch = true;
    //   this.toastr.warning('Please change the county');
    // }

  }
  generateAuthKey() {
    this.spinner.show();
    this.dataService.updateDataString(`StoreLocation/UpdateStoreLocationIdentifier/${this.storeInfoData.storeLocationID}`, '')
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response !== '') {
          this.storeInfoForm.get('storeLocationIdentifier').setValue(response);
          this.storeInfoData['storeLocationIdentifier'] = this.storeInfoForm.get('storeLocationIdentifier').value;
          this.toastr.success('Auth key updated successfully...', this.constants.infoMessages.success);
        } else {
          this.toastr.error('Failed to update Auth key', this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error('Failed to update Auth key', this.constants.infoMessages.error);
      });
  }
  onNavigateSalesTaxSetup() {
    const data = { tabId: 'tab-sales-tax-setup' };
    this.changeTabs.emit(data);
  }

  copyTextValue() {
    this.utilityService.copyText(this.storeInfoForm.get('storeLocationIdentifier').value);
    this.toastr.success('Copied to clipboard');
  }

  getStoreLocationDetails() {
    if (this.storeInfoData) {
      this.spinner.show();
      this.dataService.getData(`StoreLocation/GetStoreDetailsByStoreId/${this.storeInfoData.storeLocationID}`).subscribe((response) => {
        this.spinner.hide();
        this.storeInfoData = response;
        this.loadFormDetails();
      });
    }
  }

  handleAddressChange(address: Address) {
    this.storeInfoForm.get('storeAddressLine1').setValue(this.filterAddressByType(address, "street_number", "long_name") + " " + this.filterAddressByType(address, "route", "short_name"));
    this.storeInfoForm.get('zipCode').setValue(this.filterAddressByType(address, "postal_code", "long_name"));
    this.storeInfoForm.get('city').setValue(this.filterAddressByType(address, "locality", "long_name"));
    this.storeInfoForm.get('stateCode').setValue(this.filterAddressByType(address, "administrative_area_level_1", "short_name"));
    let county = this.filterAddressByType(address, "administrative_area_level_2", "long_name");
    let countyName = county.substring(0, county.lastIndexOf("County")).trim();
    this.countyFilterList = _.filter(this.countyList, ['stateCode', this.filterAddressByType(address, "administrative_area_level_1", "short_name")]);
    let selectedCounty = _.filter(this.countyFilterList, ['countyName', countyName]);
    if (selectedCounty && selectedCounty.length > 0) {
      this.storeInfoForm.get('countyCode').setValue(selectedCounty[0].countyCode);
    }
  }

  filterAddressByType(address, addressType, nameType) {
    return address.address_components.filter(address => address.types[0] === addressType)[0][nameType];
  }
}
