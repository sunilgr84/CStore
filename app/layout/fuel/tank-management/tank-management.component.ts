import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from '@shared/services/commmon/message-Service';

@Component({
  selector: 'app-tank-management',
  templateUrl: './tank-management.component.html',
  styleUrls: ['./tank-management.component.scss'],
})
export class TankManagementComponent implements OnInit {

  _tankId: number;
  tanks: any = [];
  selectedDateRange: any;
  beginDate = moment().format('MM-DD-YYYY');
  endDate = moment().format('MM-DD-YYYY');
  isFilter = false;
  storeLocationList: any;
  tankHistoryGridOptions: any;
  tankVolumeGridOptions: any;
  tankHistoryRowData: any = [];
  tankVolumeRowData: any = [];
  _storeLocationId: any;
  _readingAsOfDateTime: any;
  isShowTankVolumeDetail = false;
  isAvailableTankDetails = false;
  currentDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  isShowAvailableTank = false;
  isHistoryLoaded = false;
  isShowTank = false;
  tankDetails: any;
  columnApi: any;
  isLoading = true;
  editType: any;
  tankHistoryGridApi: any;
  newTankDetailsAdded: number = 0;
  loading = false;

  constructor(private constantsService: ConstantService, private editableGrid: EditableGridService,
    private storeService: StoreService, private setupService: SetupService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private messageService: MessageService, private constants: ConstantService) {
    this.tankHistoryGridOptions = this.editableGrid.getGridOption(this.constantsService.gridTypes.tankVolumeHistoryGrid);
  }

  ngOnInit() {
    setTimeout(() => {
      this.messageService.sendMessage("expanded_collaps");
    });
    this.getStoreLocation();
  }

  onTankHistoryGridReady(params) {
    this.columnApi = params.columnApi;
    this.tankHistoryGridApi = params.api;
    this.editType = "fullRow";
    params.api.sizeColumnsToFit();
  }

  getStoreLocation() {
    if (this.storeService.storeLocation) {
      this.isLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      this.bindStoreLocationID();
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        this.bindStoreLocationID();
      }, (error) => {
        console.log(error);
      });
    }
  }
  bindStoreLocationID() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this._storeLocationId = this.storeLocationList[0].storeLocationID;
      this.getTankDetails();
    }
  }
  ChangeFilter() {
    this.isFilter = !this.isFilter;
    if (this.isFilter)
      this.getTanks();
  }
  searchTanks() {
    this.newTankDetailsAdded = 0;
    if (this._storeLocationId) {
      this.getTankDetails();
    }
    else {
      this.isFilter = false;
      this.toastr.error('Please select store location', this.constantsService.infoMessages.error);
    }
  }
  getTankDetails() {
    this.newTankDetailsAdded = 0;
    this.isFilter = false;
    if (this._storeLocationId) {
      setTimeout(() => {
        this.spinner.show();
      }, 1);
      this.isShowAvailableTank = false;
      this.setupService.getData(`StoreTank/getByStoreLocationId/${this.userInfo.companyId}/${this.userInfo.userName}/${this._storeLocationId}`)
        .subscribe((response) => {
          this.isShowTank = true;
          this.spinner.hide();
          if (response.length !== 0) {
            this.tankDetails = response;
            this._readingAsOfDateTime = response[0].readingAsOfDateTime;
            this.isAvailableTankDetails = true;
            this.viewTankHistoryList(this._readingAsOfDateTime);
          } else {
            this.isAvailableTankDetails = false;
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }
  }
  tankDetailGridReady(params) {
    // params.api.sizeColumnsToFit();
  }

  viewTankHistoryList(readingASOfDate) {
    this.isHistoryLoaded = false;
    //storeLocationId=75&isTankVolumnHistory=true&readingAsOfDate=2020-10-22&StartDate=2020-09-04&StoreTankID=34
    let url = `StoreTankVolumeHistory/get?storeLocationId=${this._storeLocationId}&isTankVolumnHistory=true`;
    if (this.beginDate)
      url += '&readingAsOfDate=' + this.endDate; //+'&StartDate='+this.beginDate;
    if (this._tankId)
      url += '&StoreTankID=' + this._tankId;
    setTimeout(() => {
      this.spinner.show();
    }, 1);
    this.setupService.getData(url)
      .subscribe((response) => {
        this.isHistoryLoaded = true;
        this.spinner.hide();
        this.tankHistoryRowData = response;
      }, error => {
        console.log(error);
      });
  }

  save(params) {
    this.tankHistoryGridApi.stopEditing();
    if (params.data.currentTankVolume) {
      const postData = {
        storeTankVolumeHistoryID: params.data.storeTankVolumeHistoryID,
        storeTankID: params.data.storeTankID,
        readingAsOfDateTime: params.data.readingAsOfDateTime,
        movementHeaderID: params.data.movementHeaderID,
        tankVolume: Number(params.data.currentTankVolume) ? Number(params.data.currentTankVolume) : 0,
        tankLevel: Number(params.data.height) ? Number(params.data.height) : 0,
        tankWaterLevel: params.data.waterLevel ? Number(params.data.waterLevel) : 0,
        tankWaterVolume: params.data.waterVolume ? Number(params.data.waterVolume) : 0,
        tankTemparature: params.data.temparature ? Number(params.data.temparature) : 0,
        deliveredBy: params.data.deliveredBy ? params.data.deliveredBy : '',
        createdBy: this.userInfo.userName,
        createdDateTime: this.currentDate,
        lastModifiedDateTime: this.currentDate,
        lastModifiedBy: this.userInfo.userName,
        rowNumber: Number(params.data.rowNumber) ? Number(params.data.rowNumber) : '',
        storeTankNo: params.data.storeTankNo ? params.data.storeTankNo : '',
        tankName: params.data.tankName ? params.data.tankName : '',
        currentTankVolume: Number(params.data.currentTankVolume),
        height: Number(params.data.height) ? Number(params.data.height) : 0,
        isTankHisNew: params.data.isTankHisNew,
        waterLevel: Number(params.data.waterLevel) ? Number(params.data.waterLevel) : 0,
        waterVolume: Number(params.data.waterVolume) ? Number(params.data.waterVolume) : 0,
        temparature: Number(params.data.temparature) ? Number(params.data.temparature) : 0,
        TCVolume: Number(params.data.tcVolume) ? Number(params.data.tcVolume) : 0
      };
      this.spinner.show();
      if (params.data.storeTankVolumeHistoryID && params.data.storeTankVolumeHistoryID != 0) {
        this.setupService.updateData('StoreTankVolumeHistory/Update', postData).subscribe(res => {
          this.spinner.hide();
          if (res == 1) {
            params.data.isSaveRequired = false;
            params.data.storeTankVolumeHistoryID = res.storeTankVolumeHistoryID;
            this.tankHistoryGridApi.updateRowData({
              update: [params.data]
            });
            this.newTankDetailsAdded = this.newTankDetailsAdded - 1;
            this.spinner.show();
            this.setupService.getData(`StoreTank/getByStoreLocationId/${this.userInfo.companyId}/${this.userInfo.userName}/${this._storeLocationId}`)
              .subscribe((response) => {
                this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
                this.spinner.hide();
                if (response.length !== 0) {
                  this.newTankDetailsAdded = 0;
                  this.tankDetails = response;
                  this._readingAsOfDateTime = response[0].readingAsOfDateTime;
                  this.viewTankHistoryList(this._readingAsOfDateTime);
                }
              });
          } else {
            this.getStartEditingCell('storeTankNo', params.rowIndex);
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          console.log(error);
          // this.updateTankVolumeList(this._readingAsOfDateTime);
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        });
      } else {
        this.setupService.postData('StoreTankVolumeHistory/addNew', postData).subscribe(res => {
          this.spinner.hide();
          if (res.storeTankVolumeHistoryID) {
            params.data.isSaveRequired = false;
            params.data.storeTankVolumeHistoryID = res.storeTankVolumeHistoryID;
            this.tankHistoryGridApi.updateRowData({
              update: [params.data]
            });
            this.newTankDetailsAdded = this.newTankDetailsAdded - 1;
            this.spinner.show();
            this.setupService.getData(`StoreTank/getByStoreLocationId/${this.userInfo.companyId}/${this.userInfo.userName}/${this._storeLocationId}`)
              .subscribe((response) => {
                this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
                this.spinner.hide();
                if (response.length !== 0) {
                  this.newTankDetailsAdded = 0;
                  this.tankDetails = response;
                  this._readingAsOfDateTime = response[0].readingAsOfDateTime;
                  this.viewTankHistoryList(this._readingAsOfDateTime);
                }
              });

          } else {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          console.log(error);
          // this.updateTankVolumeList(this._readingAsOfDateTime);
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        });
      }
    } else {
      this.getStartEditingCell('storeTankNo', params.rowIndex);
      this.toastr.error("Please Add Current Tank Volume", this.constantsService.infoMessages.error);
    }
  }

  delete(params) {
    // this.newTankDetailsAdded = this.newTankDetailsAdded - 1;
    // this.tankHistoryGridApi.updateRowData({ remove: [params.data] });
    this.spinner.show();
    this.setupService.deleteData('StoreTankVolumeHistory?id=' + params.data.storeTankVolumeHistoryID).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          this.getTankDetails();
        } else {
          this.toastr.error(this.constants.infoMessages.contactAdmin);
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
  }

  getTanks() {
    let today = new Date().toUTCString();
    this.setupService.getData(`StoreTankVolumeHistory/get?storeLocationId=${this._storeLocationId}&isTankVolumnHistory=false&readingAsOfDate=${today}`)
      .subscribe((response) => {
        if (response && response.length > 0) {
          let items = [];
          response = _.sortBy(response, [function (o) { return o.storeTankNo; }]);
          _.forEach(response, (value, index) => {
            items.push({ tankId: value.storeTankID, tankName: value.storeTankNo + '-' + value.tankName });
          });
          this.tanks = items;
        }
      }, error => {
        console.log(error);
      });
  }

  addTankDetail() {
    if (this.newTankDetailsAdded === 0 && !this.loading) {
      this.loading = true;
      let today = new Date().toUTCString();
      this.setupService.getData(`StoreTankVolumeHistory/get?storeLocationId=${this._storeLocationId}&isTankVolumnHistory=false&readingAsOfDate=${today}`)
        .subscribe((response) => {
          this.loading = false;
          if (response && response.length > 0) {
            this.newTankDetailsAdded = response.length;
            // let timeNow = moment().format('YYYY-MM-DDThh:mm:ss');
            _.forEach(response, (value, index) => {
              let tankVolumeData = value;
              this.tankHistoryGridApi.updateRowData({
                add: [{
                  "storeTankNo": tankVolumeData.storeTankNo,
                  "tankName": tankVolumeData.tankName,
                  "currentTankVolume": '',
                  "height": '',
                  "waterLevel": '',
                  "waterVolume": '',
                  "deliveredBy": this.userInfo.userName,
                  "readingAsOfDateTime": null,
                  "storeTankID": tankVolumeData.storeTankID,
                  "storeTankVolumeHistoryID": 0,
                  "movementHeaderID": null,
                  "rowNumber": '',
                  "isTankHisNew": '',
                  isSaveRequired: true,
                  hideEditAction: false,
                  showDeleteAction: false,
                  hideDeleteAction: true,
                  "tankVolume": tankVolumeData.tankVolume
                }],
                addIndex: parseInt(index)
              });
              // if (index === "0") {
              //   this.getStartEditingCell('storeTankNo', 1);
              // }
            });
          }
          else
            this.toastr.error('No tanks to show please complete fuel configuration', this.constantsService.infoMessages.warning);
        }, error => {
          this.loading = false;
          this.newTankDetailsAdded = 0;
          console.log(error);
        });
    } else {
      this.toastr.error(this.constantsService.infoMessages.saveAlreadyAddedRecord, this.constantsService.infoMessages.error);
    }
  }

  getStartEditingCell(_colKey, _rowIndex) {
    this.tankHistoryGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.beginDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
  }

  onRowEditingStarted(params) {
    params.data.isSaveRequired = true;
    params.api.refreshCells({
      columns: ['value'],
      rowNodes: [params.node],
      force: true,
    });
  }

  onRowEditingStopped(params) {
    params.data.isSaveRequired = false;
    params.api.refreshCells({
      columns: ['value'],
      rowNodes: [params.node],
      force: true,
    });
  }
}
