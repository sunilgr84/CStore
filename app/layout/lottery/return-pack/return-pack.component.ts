import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-return-pack',
  templateUrl: './return-pack.component.html',
  styleUrls: ['./return-pack.component.scss']
})
export class ReturnPackComponent implements OnInit {
  @Input() storeList: any;
  @Input() activeTab: any;
  roles: any;
  storeLocationList: any;
  lotteryPackList: any;
  submitted: boolean;
  isPackNumberLoading = false;
  isReturnReasonLoading = true;
  returnPack = {
    storeLocationID: '', packNo: null, user: '', returnReason: ''
  };
  userInfo = this.constantService.getUserInfo();
  packReturnReasonList: any;
  constructor(private lolleryService: SetupService, private constantService: ConstantService
    , private toastr: ToastrService, private spinner: NgxSpinnerService, private storeService: StoreService) {
    this.storeLocationList = [];
  }

  ngOnInit() {
    this.getStoreLocation();
    this.setStoreLocation();
    this.getPackReturnReason();
  }
  getStoreLocation() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(response => {
      this.storeLocationList = response;
      this.setStoreLocation();
    }, (error) => {
      console.log(error);
    });
  }
  // ngOnChanges() {
  //   if (this.activeTab && this.activeTab['nextId'] === 'tab-return') {
  //     this.storeLocationList = this.storeList;
  //     this.setStoreLocation();
  //     this.selectActivePack(this.returnPack.storeLocationID);
  //   }
  // }
  selectActivePack(storeLocationID) {
    if (storeLocationID === '') {
      this.returnPack.packNo = this.lotteryPackList = null;
      return;
    } this.isPackNumberLoading = true;
    this.lolleryService.getData('CompanyLotteryPack/getConfirmAndActivePack/' + storeLocationID).subscribe(
      (result) => {
        this.lotteryPackList = result;
        this.isPackNumberLoading = false;
      }, (error) => {
        console.log(error);
      }
    );
  }
  getPackReturnReason() {
    this.lolleryService.getData('CompanyLotteryPack/getPackReturnReason').subscribe(
      (result) => {
        this.packReturnReasonList = result;
        this.isReturnReasonLoading = false;
      }
    );
  }
  updateReturnPack(ngForm) {
    this.submitted = true;
    if (ngForm.valid) {
      this.returnPack.user = this.userInfo.userName;
      this.spinner.show();
      this.lolleryService.updateData('CompanyLotteryPack/returnPack?storeLocationID=' + this.returnPack.storeLocationID +
        '&packNo=' + this.returnPack.packNo + '&returnReason=' + this.returnPack.returnReason
        + '&user=' + this.returnPack.user, '').subscribe(
          (result) => {
            this.spinner.hide();
            if (result && result['statusCode']) {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Update');
              return;
            }
            if (result) {
              this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Update');
              this.reset();
            } else {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'Update');
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.contactAdmin, 'Error');
          });
    }
  }
  setStoreLocation() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.returnPack.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }
  reset() {
    this.submitted = false;
    this.returnPack = {
      storeLocationID: '', packNo: null, user: null, returnReason: ''
    };
    this.setStoreLocation();
  }
}
