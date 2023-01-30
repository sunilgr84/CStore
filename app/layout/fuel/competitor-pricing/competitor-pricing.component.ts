import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import * as moment from 'moment';
import { StoreService } from '@shared/services/store/store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-competitor-pricing',
  templateUrl: './competitor-pricing.component.html',
  styleUrls: ['./competitor-pricing.component.scss']
})
export class CompetitorPricingComponent implements OnInit {
  editGridOptions: any;
  competitorGridOptions: any;
  editRowData: any = [];
  competitorFuelRowData: any;
  storeLocationList: any;
  _storeLocationId: any;
  _date = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  editGridApi: any;
  gridApi: any;
  isLoading = true;
  filterText: string;
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private editableGrid: EditableGridService, private storeService: StoreService, private setupService: SetupService
    , private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.competitorGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.competitorPricingGrid);
    this.editGridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.editCompetitorPricingGrid);
  }
  ngOnInit() {
    this.getStoreLocation();
  }
  getStoreLocation() {
    // this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
    //   (response) => {
    //     this.isLoading = false;
    //     if (response && response['statusCode']) {
    //       this.storeLocationList = [];
    //       return;
    //     }
    //     this.storeLocationList = response;
    //     if (response && response.length === 1) {
    //       this._storeLocationId = response[0].storeLocationID;
    //       this.selectStoreLocation();
    //     }
    //   }, (error) => {
    //     console.log(error);
    //   }
    // );

    if (this.storeService.storeLocation) {
      this.isLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this._storeLocationId = this.storeLocationList[0].storeLocationID;
        this.selectStoreLocation();
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this._storeLocationId = this.storeLocationList[0].storeLocationID;
          this.selectStoreLocation();
        }
      }, (error) => {
        console.log(error);
      });
    }
  }
  editGridReady(params) {
    this.editGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  gridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  dateChange(value) {
    this._date = value.formatedDate;
    this.selectStoreLocation();
  }
  selectStoreLocation() {
    if (this._storeLocationId && this._date) {
      this.spinner.show();
      this.setupService.getStoreCompetitorPrice(this._storeLocationId, this._date, 0, this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          this.editRowData = response && response[0] ? response[0] : [];
          this.competitorFuelRowData = response && response[1] ? response[1] : [];
        }, (error) => {
          this.spinner.hide();
        }
      );
    } else {
      this.editRowData = [];
    }
  }
  editAction(params) {
    const data = params.data;
    const postData = {
      storeCompetitorPriceID: data.storeCompetitorPriceID,
      storeLocationID: data.storeLocationID,
      storeCompetitorName: data.storeCompetitorName,
      priceDate: this._date,
      regularFuelPrice: data.regularFuelPrice,
      midGradeFuelPrice: data.midGradeFuelPrice,
      diselFuelPrice: data.diselFuelPrice,
      premiumFuelPrice: data.premiumFuelPrice,
      keroseneFuelPrice: data.keroseneFuelPrice,
      storeCompetitorID: data.storeCompetitorID,
      storeName: data.storeName
    };
    if (data.storeCompetitorPriceID > 0) {
      this.spinner.show();
      this.setupService.updateData('StoreCompetitorPrice', postData).subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constantsService.infoMessages.updatedRecord, 'success');
        } else {
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'error');
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, 'error');
      });
    } else {
      this.spinner.show();
      this.setupService.postData('StoreCompetitorPrice', postData).subscribe((response) => {
        this.spinner.hide();
        if (response && response.storeCompetitorPriceID) {
          this.selectStoreLocation();
          this.toastr.success(this.constantsService.infoMessages.addedRecord, 'success');
        } else {
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'error');
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.addRecordFailed, 'error');
      });
    }
  }
  deleteAction(params) {
    if (params.data.storeCompetitorPriceID > 0) {
      this.spinner.show();
      this.setupService.deleteData('StoreCompetitorPrice/' + params.data.storeCompetitorPriceID).subscribe(
        (response) => {
          this.spinner.hide();
          if (response === '1') {
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, 'success');
            this.editGridApi.updateRowData({ remove: [params.data] });
          } else {
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'error');
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, 'error');
        }
      );
    }
  }
}
