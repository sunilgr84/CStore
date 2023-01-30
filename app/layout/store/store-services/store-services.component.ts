import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-store-services',
  templateUrl: './store-services.component.html',
  styleUrls: ['./store-services.component.scss']
})
export class StoreServicesComponent implements OnInit {

  isLinear = false;
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  storeATM = false;
  billPayService = false;
  storeAcceptMobileCoupons = false;
  storeAcceptFoodStamps = false;
  storeSellsFishGameLicence = false;
  storeHasKenoMachine = false;
  sellMoneyOrder = false;
  isCreditBankAccountLoading = true;
  isCompanyLoading = true;
  @Input() storeLocationID: number;
  @Output() backToStoreList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  isEdit = false;
  accountDetailsList: any;
  initialFormValues: any;
  userInfo = this.constantService.getUserInfo();
  storeServiceForm = this._fb.group({

    storeServicesID: 0,
    storelocationID: 0,
    isATMEnabled: true,
    atmTransactionFee: [''],
    atmCreditPaymentSourceID: 0,
    isBillPayEnabled: true,
    billPayPaymentSourceID: 0,
    isCheckCashingEnabled: true,
    isCouponsEnabled: true,
    isMobileCouponsEnabled: true,
    mobileCouponsPaymentSourceID: 0,
    isFoodStampsEBTEnabled: true,
    isFishingGameLincenseEnabled: true,
    fishingGameLicensefee: [''],
    fishingGameLincensePaymentSourceID: 0,
    isLotteryKenoEnabled: true,
    lotteryCommission: [''],
    lotteryKenoPaymentSourceID: 0,
    isMoneyOrderEnabled: true,
    moCompany: [''],
    moFees: [''],
    moBuying: [''],
    moPaymentSourceID: 0,
    isMoneyTransferEnabled: true,
    foodStampsEBTPaymentSourceID: 0
  });
  companyList: any;
  constructor(private _fb: FormBuilder, private _setupService: SetupService, private toastr: ToastrService,
    private constantService: ConstantService, private spinner: NgxSpinnerService) {
    this.initialFormValues = this.storeServiceForm.value;
  }

  ngOnInit() {
    this.getSourceNameByCompanyID();
    this.getCompaniesByUserId(this.userInfo.userId);
    this.getStoreServiceDDetails();

  }
  getSourceNameByCompanyID() {
    this._setupService.getData(`PaymentSource/getSourceNameByCompanyID/${this.userInfo.companyId}`).subscribe(result => {
      this.accountDetailsList = result;
      this.isCreditBankAccountLoading = false;
    });
  }
  getCompaniesByUserId(userId) {
    this._setupService.getData('Users/GetCompanyByUserId/UserId/' + userId).subscribe(
      (response) => {
        this.companyList = response;
        this.isCompanyLoading = false;
      });
  }
  get storeService() { return this.storeServiceForm.controls; }

  getStoreServiceDDetails() {
    this.spinner.show();
    this._setupService.getData(`StoreServices/getAllByLocationId/${this.storeLocationID}`).subscribe(result => {
      this.spinner.hide();
      result ? this.isEdit = true : this.isEdit = false;
      // tslint:disable-next-line:no-unused-expression
      result ? this.storeServiceForm.patchValue(result) : this.initialFormValues;
    });
  }
  save() {
    const postData = {
      ...this.storeServiceForm.value,
      storelocationID: this.storeLocationID,
      isATMEnabled: this.storeServiceForm.value.isATMEnabled !== undefined ? this.storeServiceForm.value.isATMEnabled : true,
      atmTransactionFee: this.storeServiceForm.value.atmTransactionFee ? this.storeServiceForm.value.atmTransactionFee : 0,
      atmCreditPaymentSourceID: this.storeServiceForm.value.atmCreditPaymentSourceID ?
        this.storeServiceForm.value.atmCreditPaymentSourceID : 0,
      isBillPayEnabled: this.storeServiceForm.value.isBillPayEnabled !== undefined ? this.storeServiceForm.value.isBillPayEnabled : true,
      billPayPaymentSourceID: this.storeServiceForm.value.billPayPaymentSourceID ? this.storeServiceForm.value.billPayPaymentSourceID : 0,
      isCheckCashingEnabled: this.storeServiceForm.value.isCheckCashingEnabled !== undefined
        ? this.storeServiceForm.value.isCheckCashingEnabled : true,
      isCouponsEnabled: this.storeServiceForm.value.isCouponsEnabled !== undefined ? this.storeServiceForm.value.isCouponsEnabled : true,
      isMobileCouponsEnabled: this.storeServiceForm.value.isMobileCouponsEnabled !== undefined ?
        this.storeServiceForm.value.isMobileCouponsEnabled : true,
      mobileCouponsPaymentSourceID: this.storeServiceForm.value.mobileCouponsPaymentSourceID ?
        this.storeServiceForm.value.mobileCouponsPaymentSourceID : 0,
      isFoodStampsEBTEnabled: this.storeServiceForm.value.isFoodStampsEBTEnabled !== undefined ?
        this.storeServiceForm.value.isFoodStampsEBTEnabled : true,
      isFishingGameLincenseEnabled: this.storeServiceForm.value.isFishingGameLincenseEnabled !== undefined ?
        this.storeServiceForm.value.isFishingGameLincenseEnabled : true,
      fishingGameLicensefee: this.storeServiceForm.value.fishingGameLicensefee ? this.storeServiceForm.value.fishingGameLicensefee : 0,
      fishingGameLincensePaymentSourceID: this.storeServiceForm.value.fishingGameLincensePaymentSourceID
        ? this.storeServiceForm.value.fishingGameLincensePaymentSourceID : 0,
      isLotteryKenoEnabled: this.storeServiceForm.value.isLotteryKenoEnabled !== undefined ?
        this.storeServiceForm.value.isLotteryKenoEnabled : true,
      lotteryCommission: this.storeServiceForm.value.lotteryCommission ? this.storeServiceForm.value.lotteryCommission : 0,
      lotteryKenoPaymentSourceID: this.storeServiceForm.value.lotteryKenoPaymentSourceID ?
        this.storeServiceForm.value.lotteryKenoPaymentSourceID : 0,
      isMoneyOrderEnabled: this.storeServiceForm.value.isMoneyOrderEnabled !== undefined
        ? this.storeServiceForm.value.isMoneyOrderEnabled : true,
      moCompany: this.storeServiceForm.value.moCompany ? this.storeServiceForm.value.moCompany : 0,
      moFees: this.storeServiceForm.value.moFees ? this.storeServiceForm.value.moFees : 0,
      moBuying: this.storeServiceForm.value.moBuying ? this.storeServiceForm.value.moBuying : 0,
      moPaymentSourceID: this.storeServiceForm.value.moPaymentSourceID ? this.storeServiceForm.value.moPaymentSourceID : 0,
      isMoneyTransferEnabled: this.storeServiceForm.value.isMoneyTransferEnabled !== undefined ?
        this.storeServiceForm.value.isMoneyTransferEnabled : true,
      foodStampsEBTPaymentSourceID: this.storeServiceForm.value.foodStampsEBTPaymentSourceID
        ? this.storeServiceForm.value.foodStampsEBTPaymentSourceID : 0,
    };
    if (this.storeServiceForm.value.storeServicesID) {
      this.spinner.show();
      this._setupService.updateData(`StoreServices/Update`, postData).subscribe(result => {
        this.spinner.hide();
        if (result) {
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.contactAdmin);
      });
    } else {
      this.spinner.show();
      this._setupService.postData(`StoreServices/AddNew`, postData).subscribe(result => {
        this.spinner.hide();
        this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
        result ? this.isEdit = true : this.isEdit = false;
        // tslint:disable-next-line:no-unused-expression
        result ? this.storeServiceForm.patchValue(result) : this.initialFormValues;
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
      });
    }
  }
  backToMainList() {
    this.backToStoreList.emit(false);
  }
  setRoundOff(event, formControl) {

    if (formControl === 'atmTransactionFee') {
      event.target.value = parseFloat(event.target.value).toFixed(4);
      this.storeServiceForm.get('atmTransactionFee').setValue(Number(parseFloat(event.target.value).toFixed(4)));
    }
    if (formControl === 'fishingGameLicensefee') {
      event.target.value = parseFloat(event.target.value).toFixed(4);
      this.storeServiceForm.get('fishingGameLicensefee').setValue(Number(parseFloat(event.target.value).toFixed(4)));
    }
    if (formControl === 'lotteryCommission') {
      event.target.value = parseFloat(event.target.value).toFixed(4);
      this.storeServiceForm.get('lotteryCommission').setValue(Number(parseFloat(event.target.value).toFixed(4)));
    }
    if (formControl === 'moFees') {
      event.target.value = parseFloat(event.target.value).toFixed(4);
      this.storeServiceForm.get('moFees').setValue(Number(parseFloat(event.target.value).toFixed(4)));
    }
    if (formControl === 'moBuying') {
      event.target.value = parseFloat(event.target.value).toFixed(4);
      this.storeServiceForm.get('moBuying').setValue(Number(parseFloat(event.target.value).toFixed(4)));
    }
  }
  onNavigateAccounting() {
    const data = { tabId: 'tab-accounting' };
    this.changeTabs.emit(data);
  }
}
