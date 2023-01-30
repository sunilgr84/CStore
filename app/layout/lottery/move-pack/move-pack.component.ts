import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-move-pack',
  templateUrl: './move-pack.component.html',
  styleUrls: ['./move-pack.component.scss']
})
export class MovePackComponent implements OnInit {
  @Input() storeList: any;
  @Input() activeTab: any;
  roles: any;
  storeLocationList: any;
  lotteryPackList: any;
  submitted: boolean;
  isPackNumberLoading = false;
  userInfo = this.constantService.getUserInfo();
  movePack = {
    storeLocationID: '', lotteryPackID: '', packNo: null, binNo: '', user: '', currentBinNo: ''
  };
  isStoreLocation: boolean;
  constructor(private lolleryService: SetupService, private constantService: ConstantService
    , private toastr: ToastrService, private spinner: NgxSpinnerService, private storeService: StoreService) {

  }

  ngOnInit() {
    this.getStoreLocation();

  }
  getStoreLocation() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(response => {
      this.storeLocationList = response;
      this.setLocation();
    }, (error) => {
      console.log(error);
    });
  }
  setLocation() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.movePack.storeLocationID = this.storeLocationList[0].storeLocationID;
      this.selectActivePack(this.movePack.storeLocationID);
    }
  }
  // ngOnChanges() {
  //   if (this.activeTab && this.activeTab['nextId'] === 'tab-move') {
  //     this.storeLocationList = this.storeList;
  //     if (this.storeLocationList && this.storeLocationList.length === 1) {
  //       this.movePack.storeLocationID = this.storeLocationList[0].storeLocationID;
  //     }
  //     this.selectActivePack(this.movePack.storeLocationID);
  //   }
  // }
  selectActivePack(storeLocationID) {
    if (storeLocationID === '') {
      this.movePack.packNo = this.lotteryPackList = null;
      return;
    }
    this.isPackNumberLoading = true;
    this.lolleryService.getData('CompanyLotteryPack/getConfirmAndActivePack/' + storeLocationID).subscribe(
      (result) => {
        this.lotteryPackList = result;
        this.isPackNumberLoading = false;
      }
    );
  }
  getCurrentBinNo() {
    this.movePack.currentBinNo = '';
    if (this.movePack.packNo && this.movePack.storeLocationID) {
      this.lotteryPackList.map(x => {
        if (x.packNumber === this.movePack.packNo) {
          this.movePack.lotteryPackID = x.lotteryPackID;
        }
      });
      this.lolleryService.getData('CompanyLotteryPack/binNo/' + this.movePack.storeLocationID + '/' + this.movePack.packNo).subscribe(
        (result) => {
          if (result && result.message === "") this.movePack.currentBinNo = result.message;
          else this.movePack.currentBinNo = result;
        }, (error) => {
          console.log(error);
        }
      );
    }
  }

  updateMovePack(ngForm) {
    if (isNaN(Number(this.movePack.binNo))) {
      this.toastr.warning('Please Enter Bin Number', 'warning');
      return;
    }
    this.submitted = true;
    if (ngForm.valid) {
      this.movePack.user = this.userInfo.userName;
      this.spinner.show();
      this.lolleryService.updateData('CompanyLotteryPack/movePack?storeLocationID=' + this.movePack.storeLocationID + '&lotteryPackID='
        + this.movePack.lotteryPackID + '&packNo=' + this.movePack.packNo + '&binNo=' + this.movePack.binNo
        + '&user=' + this.movePack.user, '').subscribe(
          (result) => {
            this.spinner.hide();
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
  reset() {
    this.submitted = false;
    this.movePack = {
      storeLocationID: '', lotteryPackID: '', packNo: null, binNo: '', user: '', currentBinNo: ''
    };
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.movePack.storeLocationID = this.storeLocationList[0].storeLocationID;
    }
  }
}
