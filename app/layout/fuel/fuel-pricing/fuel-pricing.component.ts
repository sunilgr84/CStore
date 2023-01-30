import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '@shared/services/store/store.service';
import { FormGroup, FormBuilder, FormControl, Validators, FormArray } from '@angular/forms';

@Component({
  selector: 'app-fuel-pricing',
  templateUrl: './fuel-pricing.component.html',
  styleUrls: ['./fuel-pricing.component.scss']
})
export class FuelPricingComponent implements OnInit {
  storeFuelGradeID: any;
  FuelPriceForm: FormGroup;
  fuelpricing: any = [];
  fuelserviceleveldata: any = [];
  firstiterationdata: any = [];
  storeFuelPricedata: any = [];
  fuelPriceMOPID: any;
  storeFuelPriceID: any;
  fuelServiceLevelID: any;
  price: any;
  cost: any;
  margin: any;
  fuelPriceTierID: any = 1;
  storeLocationList: any;
  fuelPriceTierList: any;
  isStoreLoading = true;
  userInfo: any;
  isFormShow: boolean;
  _storeLocationId: any;
  data: any = [];
  inputValue: any;
  values: any = [];
  valueChangeddata: any = [];
  latestchangeddata: any = [];

  constructor(private _setupService: SetupService, private constants: ConstantService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private storeService: StoreService, private formBuilder: FormBuilder) {
    this.userInfo = this.constants.getUserInfo();
  }
  ngOnInit() {
    this.getStoreLocationList();
    this.initFuelPriceForm()
  }

  initFuelPriceForm() {
    this.FuelPriceForm = this.formBuilder.group({
      fuelPrice: this.formBuilder.array([])
    })
  }

  get fuelPrice() {
    return this.FuelPriceForm.controls["fuelPrice"] as FormArray;
  }

  parseFuelPrice(fuelPriceData: any[]) {
    fuelPriceData.forEach(f => {
      const form = this.formBuilder.group({
        cashPrice: [f.tierDetails[0].serviceLevelDetails[0].cashPrice],
        creditPrice: [f.tierDetails[0].serviceLevelDetails[0].creditPrice],
        price: [f.tierDetails[0].serviceLevelDetails[0].price],
        storeFuelGradeID: [f.storeFuelGradeID],
        fuelPriceTierID: [f.tierDetails[0].fuelPriceTierID],
        fuelServiceLevelID: [f.tierDetails[0].serviceLevelDetails[0].fuelServiceLevelID]
      });
      this.fuelPrice.push(form);
    })
    console.log("hello", fuelPriceData, this.fuelPrice);
  }

  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.isStoreLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this._storeLocationId = this.storeLocationList[0].storeLocationID;
        this.getFuelPriceTier({ storeLocationID: this._storeLocationId });
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isStoreLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this._storeLocationId = this.storeLocationList[0].storeLocationID;
          this.getFuelPriceTier({ storeLocationID: this._storeLocationId });
        }
      }, (error) => {
        console.log(error);
      });
    }
  }

  getFuelPriceTier(params) {
    if (!params) {
      this.isFormShow = false;
      return true;
    }
    this.spinner.show();
    this._setupService.getData(`StoreFuel/getFuelPricingByStore/${this._storeLocationId}`).subscribe((response) => {
      this.spinner.hide();
      if (response.statusCode === 500) {
        this.fuelPriceTierList = [];
        this.isFormShow = false;
        this.toastr.error('Unable to load data');
      } else if (response.error) {
        this.fuelPriceTierList = [];
        this.isFormShow = false;
        this.toastr.error(response.error);
      } else if (response.fuelGradeDetails && response.fuelGradeDetails.length === 0) {
        this.isFormShow = false;
        this.toastr.error('Unable to load data');
      } else {
        this.data = response;
        this.parseFuelPrice(this.data.fuelGradeDetails)
        this.isFormShow = true;
      }
    }, (error) => {
      this.isFormShow = false;
      this.spinner.hide();
      console.log(error);
    });
  }

  update() {
    console.log("Form Value", this.FuelPriceForm.value.fuelPrice);
    this.spinner.show();
    let reqData = {
      username: this.userInfo.userName,
      storeLocationId: this._storeLocationId,
      priceDetails: this.FuelPriceForm.value.fuelPrice
    };

    this._setupService.postData(`StoreFuel/fuelPrice`, reqData).subscribe((response) => {
      this.spinner.hide();
      if (response.status === 1) {
        this.initFuelPriceForm();
        this.getFuelPriceTier({ storeLocationID: this._storeLocationId });
        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }
}
