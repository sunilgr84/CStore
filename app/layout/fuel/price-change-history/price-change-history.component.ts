import { Component, OnInit } from "@angular/core";
import { ConstantService } from "@shared/services/constant/constant.service";
import { SetupService } from "@shared/services/setupService/setup-service";
import { StoreService } from "@shared/services/store/store.service";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "app-price-change-history",
  templateUrl: "./price-change-history.component.html",
  styleUrls: ["./price-change-history.component.scss"],
})
export class PriceChangeHistoryComponent implements OnInit {
  priceHistory: any[] = [];
  isLoading: boolean = false;
  userInfo: any;
  _storeLocationId;
  storeLocationList: any[] = [];
  selectedDateRange = {
    fDate: new Date().toISOString().split("T")[0],
    tDate: new Date().toISOString().split("T")[0],
  };
  storeFuelGradeList: any[] = []
  _storeFuelGradeId
  constructor(
    private _setupService: SetupService,
    private toastr: ToastrService,
    private storeService: StoreService,
    private constantsService: ConstantService
  ) {
    this.userInfo = this.constantsService.getUserInfo();
  }

  ngOnInit(): void {
    this.getStoreLocation();
  }

  getStoreLocation() {
    if (this.storeService.storeLocation) {
      this.storeLocationList = this.storeService.storeLocation;
    } else {
      this.storeService
        .getStoreLocation(this.userInfo.companyId, this.userInfo.userName)
        .subscribe(
          (response) => {
            this.storeLocationList = this.storeService.storeLocation;
          },
          (error) => {
            console.log(error);
          }
        );
    }
  }

  getStoreFuelGrades() {
    this.storeFuelGradeList = [];
    this._setupService.getData(`StoreFuelGrade/list/${this._storeLocationId}?isBlend=false`)
    .subscribe(
        (response) => {
        this.storeFuelGradeList = response;
        },
        (error) => {
        console.log(error);
        }
    );
  }

  onDateRangeChange(dateRange) {
    this.selectedDateRange = dateRange;
  }

  getFuelPriceChangeHistory() {
    this.isLoading = true;
    this.priceHistory = [];
    let endpoint = `StoreFuel/priceactivity/${this._storeLocationId}/${this.selectedDateRange.fDate}/${this.selectedDateRange.tDate}`;
    if(this._storeFuelGradeId) {
        endpoint = `${endpoint}?storeFuelGradeId=${this._storeFuelGradeId}`
    }
    this._setupService
      .postData(
        endpoint,
        {}
      )
      .subscribe(
        (response) => {
          this.isLoading = false;
          if (response.statusCode === 500) {
            this.toastr.error("Unable to load data");
          } else if (response.error) {
            this.toastr.error(response.error);
          } else {
            this.priceHistory = response;
            console.log(response);
          }
        },
        (error) => {
          this.isLoading = false;
          console.log(error);
        }
      );
  }
}
