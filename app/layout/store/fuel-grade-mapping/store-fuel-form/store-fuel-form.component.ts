import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {SetupService} from '@shared/services/setupService/setup-service';
import {LoggerService} from '@shared/services/logger/logger.service';
import { getValueInRange } from '@ng-bootstrap/ng-bootstrap/util/util';
import { update } from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { formatCurrency } from '@angular/common';

@Component({
  selector: 'app-store-fuel-form',
  templateUrl: './store-fuel-form.component.html',
  styleUrls: ['./store-fuel-form.component.scss']
})
export class StoreFuelFormComponent implements OnInit {
  @Input() storeLocationId: number;

  isBrandLoading = true;
  brandList: any[];
  decodeImage = ``;
  tankMonitoringSystemList: any;
  storeTierList = [];
  isServiceLevelLoading = true;
  serviceLevelList: any;
  isLoading: true;
  isPriceTierLoading = true;
  priceTierList: any;
  fuelOptionList = [];
  storeFuelPriceTierConfID: number = 0;
  storeFuelServiceLvlConfId: number = 0;
  fuelBrandDefaultValue: number;      // fuel brand default value
  fuelBrandDefaultImg: string;      // fuel brand default img
  decodedDefaultImage: string;      // fuel brnad img decoded
  storeFuelPriceTierId: number;     // store tier default value
  storeFuelServiceLevelId: number;      // service lvl default value
  tankMonitorDef: number;     // tank monitor default value
  priceConfigDefaultValues: any;     // price config default values
  fuelOptionDefValuesDesc: string;      // fuel option default desc
  fuelOptionDefValuesSFOId: number;     // fuel option def storefueloptionID
  fuelOptionIDDefValue: number;     // fuel option id default value
  isChecked = false;
  readonlyvalue: number;      // split ratio readonly value
  enablePriceChangeDef: string;     // checkbox default value
  priceConfDefValue: any;
  storeFuelForm = this._fb.group({
    profitPerGallon: [0],
    profitSplitratio: [0],
    fuelOption: ['', Validators.required],
    paymentSystemsProductCode: ['', Validators.required],
    fuelVendor: ['', Validators.required],
    tankMonitoringSystemID: ['', Validators.required],
    fuelTerms: ['', Validators.required],
    storeTier: ['', Validators.required],
    serviceLevel: ['', Validators.required],
    priceConfig: ['', Validators.required],
    enableFuelPrice: [false],
    sendFuelInventory: [false]
  })

  constructor(
    private _fb: FormBuilder,
    private dataService: SetupService,
    private logger: LoggerService,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.getBrandList();
    this.getTankMonitorData();
    this.getTankMonitorDefault();
    this.getStoreTierList();
    this.getServiceLevel();
    this.getPriceConfigList();
    this.getpriceConfigDefaultValue();
    this.getStoreFuelPriceConfigID();
    this.getFuelOptions();
    
    
    this.getFuelBrandDef();
    this.getFuelOptionDef();
    this.getEnablePriceChangeDef();
    // this.getStoreFuelServiceLvlConf();
  }

  getBrandList() {
    this.dataService.getData('PaymentSystemProductCode/Get').subscribe((response) => {
      this.isBrandLoading = false;
      if (response && response['statusCode']) {
        this.brandList = [];
        return;
      }
      this.brandList = response;
      this.selectImage();
    });
  }

  selectImage() {
    let image = '';
    if (this.storeFuelForm.value.paymentSystemsProductCode && this.brandList) {
      image = this.storeFuelForm.value.paymentSystemsProductCode && this.brandList ?
        this.brandList.find((i: any) => i.paymentSystemProductCodeID ===
          Number(this.storeFuelForm.value.paymentSystemsProductCode)) : ``;
      console.log(image);
      if (image && image['image']) {
        this.decodeImage = this.storeFuelForm.value.paymentSystemsProductCode && this.brandList ?
          'data:image/png;base64,' + image['image'] : '';
      } else {
        this.decodeImage = ``;
      }
    } else {
      this.decodeImage = ``;
    }
  }

  getTankMonitorData() {
    this.dataService.getData('TankMonitoringSystem/list').subscribe((response) => {
      if (response && response['statusCode']) {
        this.tankMonitoringSystemList = [];
        return;
      }
      if (response) {
        this.tankMonitoringSystemList = response;
      }
    }, (error) => {
      this.logger.error(error);
    });
  }

  getStoreTierList() {
    this.dataService.getData(`FuelPriceTier/list`).subscribe((response) => {
      if (response) {
        this.storeTierList = response;
      }
    });
  }

  getServiceLevel() {
    this.dataService.getData(`FuelServiceLevel/GetAll`).subscribe((response) => {
      this.isServiceLevelLoading = false;
      if (response && response['statusCode']) {
        this.serviceLevelList = [];
        return;
      }
      this.getStoreFuelServiceLvlConf();
      this.serviceLevelList = response;
    });
  }

  getpriceConfigDefaultValue() {
    this.dataService.getData(`StoreFuelMOPConfiguration/getByLocation/${this.storeLocationId}`)
      .subscribe((response) => {
        this.priceConfigDefaultValues = response;
        this.priceConfDefValue = this.priceConfigDefaultValues.isSamePrice;
        if (this.priceConfDefValue == true) {
          this.priceConfDefValue = 1;
        }
        if(this.priceConfDefValue == false) {
          this.priceConfDefValue = 2;
        }
        this.storeFuelForm.get('priceConfig').setValue(this.priceConfDefValue);
      });
  }

  getPriceConfigList() {
    this.dataService.getData(`FuelPrice/GetFuelMopTypes`).subscribe((response) => {
      this.isPriceTierLoading = false;
      if (response && response['statusCode']) {
        this.priceTierList = [];
        return;
      }
      this.priceTierList = response;
    });
  }

  priceConfigChange(event: any) {
    const priceConfValue = this.storeFuelForm.value.priceConfig;
    const value = priceConfValue==1 ? true : false;

// priceConfDefValue
    const addPayload = {
      storeFuelMOPConfigurationID: 0,
      storeLocationID: this.storeLocationId,
      fuelPriceMOPID: 0,
      isPercentagePrice: false,
      price: 0,
      isSamePrice: value
    }

    const updatePayload = {
      storeFuelMOPConfigurationID: this.priceConfigDefaultValues.storeFuelMOPConfigurationID,
      storeLocationID: this.storeLocationId,
      fuelPriceMOPID: this.priceConfigDefaultValues.fuelPriceMOPID,
      isPercentagePrice: this.priceConfigDefaultValues.isPercentagePrice,
      price: this.priceConfigDefaultValues.price,
      isSamePrice: value
    }

    if(this.priceConfigDefaultValues.storeFuelMOPConfigurationID) {
      this.dataService
        .updateData(`StoreFuelMOPConfiguration/Update`, updatePayload)
        .subscribe((response) => {
          console.log('price config PUT res: ', response);
        })
    }
    if (!this.priceConfigDefaultValues.storeFuelMOPConfigurationID) {
      this.dataService
        .postData(`StoreFuelMOPConfiguration/AddNew`, addPayload)
        .subscribe((response) => {
          console.log('price config POST res: ', response);
        })
    }
  }

  getFuelOptionDef() {
    this.dataService.getData(`StoreFuelOptions/GetByStoreLocationID/${this.storeLocationId}`)
      .subscribe((response) => {
        this.fuelOptionDefValuesDesc = response[0].description;
        this.fuelOptionIDDefValue = response[0].fuelOptionID;
        this.storeFuelForm.get('fuelOption').setValue(this.fuelOptionIDDefValue);
        this.storeFuelForm.get('profitPerGallon').setValue(response[0].profitPerGallon);
        this.storeFuelForm.get('profitSplitratio').setValue(response[0].profitPerGallon);
        this.fuelOptionDefValuesSFOId = response[0].storeFuelOptionId;
        console.log('fuel option def values: ', response[0], this.storeFuelForm.get('profitPerGallon').value);
      })
  }

  getFuelOptions() {
    this.dataService.getData(`FuelOptions/GetAll`).subscribe((response) => {
      if (response) {
        this.fuelOptionList = response;
      }
    });
  }

  fuelOptionChange(event: any) {
    if ( ((this.storeFuelForm.value.fuelOption == 3 && this.storeFuelForm.value.profitPerGallon != 0) || (this.storeFuelForm.value.fuelOption == 1 && this.storeFuelForm.value.profitPerGallon != 0)) && event.type === 'change' ) {
      this.storeFuelForm.get('profitPerGallon').setValue(0);
      this.storeFuelForm.get('profitSplitratio').setValue(0);
    }

    const addPayload = {
      description: '',
      fuelOptionID: this.storeFuelForm.value.fuelOption,
      profitPerGallon: this.getValue(),
      storeFuelOptionId:0,
      storeLocationID: this.storeLocationId
    }

    const updatepayload = {
      description: this.fuelOptionDefValuesDesc,
      fuelOptionID: this.storeFuelForm.value.fuelOption || this.fuelOptionIDDefValue ,
      profitPerGallon: this.getValue(),
      storeFuelOptionId:this.fuelOptionDefValuesSFOId,
      storeLocationID: this.storeLocationId
    }

    if(updatepayload.profitPerGallon > 100) {
      this.toastr.error('Jobber value cannot be greater than 100', 'Failed to update Jobber value');
    } else {
      if(this.fuelOptionIDDefValue) {
        this.dataService
          .updateData(`StoreFuelOptions/Update`, updatepayload)
          .subscribe((response) => {
            console.log('fuel option UPDATE res:', response);
          })
      }
      
      if(!this.fuelOptionIDDefValue) {
        this.dataService
          .postData(`StoreFuelOptions/AddNew`, addPayload)
          .subscribe((response) => {
            console.log('fuel option ADD res:', response);
          })
      }
    }
  }

  getValue() {
    if (this.storeFuelForm.value.fuelOption == 1) {
      return this.storeFuelForm.value.profitPerGallon;
    }

    if (this.storeFuelForm.value.fuelOption == 3) {
      return this.storeFuelForm.value.profitSplitratio;
    }

    if((this.storeFuelForm.value.fuelOption == 1 || this.fuelOptionIDDefValue == 1) && this.storeFuelForm.value.profitPerGallon){
      return this.storeFuelForm.value.profitPerGallon;
    }

    if((this.storeFuelForm.value.fuelOption == 3 || this.fuelOptionIDDefValue == 3) && this.storeFuelForm.value.profitSplitratio) {
      return this.storeFuelForm.value.profitSplitratio;
    }
  }

  getFuelBrandDef() {
    this.dataService.getData(`PaymentSystemProductCode/GetStorePsPCode/${this.storeLocationId}`)
      .subscribe((response) => {
        this.fuelBrandDefaultValue = response[0].paymentSystemProductCodeID;
        this.storeFuelForm.get('paymentSystemsProductCode').setValue(this.fuelBrandDefaultValue);
        this.fuelBrandDefaultImg = response[0].image;
        this.decodedDefaultImage = 'data:image/png;base64,' + this.fuelBrandDefaultImg;
      });
  }

  fuelBrandChange(event: any) {
    console.log('brand changed', event.target.value);
    const payload = {};
    console.log('payload', payload)
    const paymentProductCode = this.storeFuelForm.value.paymentSystemsProductCode;
    this.dataService
      .updateData(`StoreLocation/UpdatepaymentSPCode/${paymentProductCode}/${this.storeLocationId}`, payload)
      .subscribe((response) => {
        console.log('fuel brand res: ', response);
    });
  }

  getTankMonitorDefault() {
    this.dataService.getData(`TankMonitoringSystem/GetStoreTMSID/${this.storeLocationId}`)
      .subscribe((response) => {
        this.tankMonitorDef = response[0].tankMonitoringSystemID;
        this.storeFuelForm.get('tankMonitoringSystemID').setValue(this.tankMonitorDef);
      })
  }

  tankMonitorChange(event: any) {
    console.log('tank monitor changed', event.target.value);
    const tankMonitorSysId = this.storeFuelForm.value.tankMonitoringSystemID;
    const payload = {};
    this.dataService
      .updateData(`StoreLocation/UpdateTankMSID/${tankMonitorSysId}/${this.storeLocationId}`, payload)
      .subscribe((response) => {
        console.log('tank monitor res: ', response);
    });
  }

  getStoreFuelPriceConfigID() {
    this.dataService
      .getData(`StoreFuelPriceTierConfiguration/getByLocation/${this.storeLocationId}`)
      .subscribe((response) => {
        this.storeFuelPriceTierConfID = response.storeFuelPriceTierConfigurationID;
        this.storeFuelPriceTierId = response.fuelPriceTierID;
        this.storeFuelForm.get('storeTier').setValue(this.storeFuelPriceTierId);
      })
  }
  
  storeTierChange(event: any) {
    const payload = {
      storeFuelPriceTierConfigurationID: this.storeFuelPriceTierConfID,
      storeLocationID: this.storeLocationId,
      fuelPriceTierID: parseInt(this.storeFuelForm.value.storeTier)
    }

    if (!this.storeFuelPriceTierId) {
      this.dataService
        .postData(`StoreFuelPriceTierConfiguration/AddNew`, payload)
        .subscribe((response) => {
          console.log('store tier ADD res: ', response);
        });
    } else if(this.storeFuelPriceTierId) {
      this.dataService
        .updateData(`StoreFuelPriceTierConfiguration/Update`, payload)
        .subscribe((response) => {
          console.log('store tier PUT res: ', response);
      });
    }
  }

  getStoreFuelServiceLvlConf() {
    this.dataService
      .getData(`StoreFuelServiceLevelConfiguration/getByLocation/${this.storeLocationId}`)
      .subscribe((response) => {
        this.storeFuelServiceLevelId = response.fuelServiceLevelID;
        this.storeFuelServiceLvlConfId = response.storeFuelServiceLevelConfigurationID;
        this.storeFuelForm.get('serviceLevel').setValue(this.storeFuelServiceLevelId);
      });
  }

  serviceLevelChange(event: any) {
    const payload = {
      storeFuelServiceLevelConfigurationID: this.storeFuelServiceLvlConfId,
      storeLocationID: this.storeLocationId,
      fuelServiceLevelID: parseInt(this.storeFuelForm.value.serviceLevel)
    }

    if(!this.storeFuelServiceLevelId) {
      this.dataService
      .postData(`StoreFuelServiceLevelConfiguration/AddNew`, payload)
      .subscribe((response) => {
        console.log('store fuel srvc lvl conf ADD res: ', response);
      })
    } else if (this.storeFuelServiceLevelId) {
      this.dataService
        .updateData(`StoreFuelServiceLevelConfiguration/Update`, payload)
        .subscribe((response) => {
          console.log('store fuel srvc lvl conf PUT res: ', response);
        })
    }
  }

  // get default value of checkbox
  getEnablePriceChangeDef() {
    this.dataService
      .getData(`StoreLocation/GetFuelPricePOS/${this.storeLocationId}`)
      .subscribe((response) => {
        this.enablePriceChangeDef = response;
      });
  }

  // Enable fuel price change to POS checkbox event handled
  checkChanged = (event) => {
    this.isChecked = event;
    const payload = {};

    if(this.isChecked) {
      this.dataService
        .updateData(`StoreLocation/UpdateFulPriceToPOS/true/${this.storeLocationId}`, payload)
        .subscribe((response) => {
          console.log('checkbox success: ', response);
        });
    } else {
      this.dataService
        .updateData(`StoreLocation/UpdateFulPriceToPOS/false/${this.storeLocationId}`, payload)
        .subscribe((response) => {
          console.log('checkbox error: ', response);
        });
    }
  }

  showPricePerGallon() {
    if ( this.fuelOptionIDDefValue == 1 && this.storeFuelForm.value.fuelOption == '' ) {
      return true
    }
    
    if ( this.storeFuelForm.value.fuelOption != 1 ) {
      return false
    }
    
    if ( this.storeFuelForm.value.fuelOption == 1 ) 
      { return true }
    
    if ( this.fuelOptionIDDefValue == 1 ){
      return true
    }
  }

  showProfitSplitRatio() {
    if ( this.fuelOptionIDDefValue == 3 && this.storeFuelForm.value.fuelOption == '' ) {
      return true
    }

    if ( this.storeFuelForm.value.fuelOption != 3 ) {
      return false
    }

    if ( this.storeFuelForm.value.fuelOption == 3 ) {
      return true
    }

    if ( this.fuelOptionIDDefValue == 3 ){
      return true
    }
  }
}
