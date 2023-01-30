import { Component, OnInit, ViewChild } from '@angular/core';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { UtilityService } from '@shared/services/utility/utility.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { Router } from '@angular/router';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.scss'],
})
export class AddGameComponent implements OnInit {
  @ViewChild('gameNo') gameNo: any;
  @ViewChild('gameName') gameName: any;
  filterText = '';
  rowData: any;
  gridApi: any;
  gridColumnApi: any;
  gridOptions: any;
  isStateLocation = true;
  _stateCode: any;
  // addGame: AddGame;
  userInfo = this.constants.getUserInfo();
  lotteryStateList: any = [];
  isLoading = true;
  gameByNoOrName = false;
  submitted = false;
  initialFormValues: any;
  maxGameNolength = 4;
  isShowHide = false;
  addGameForm = this._fb.group({
    lotteryGameID: 0,
    lotteryStateCode: '',
    isActive: true,
    gameNo: ['', [Validators.required]],
    gameName: '',
    noOfTickets: null,
    ticketSellingPrice: null,
    lotteryPackValue: null,
    lotteryPOSCode: [''],
    lastModifiedDateTime: new Date(),
    lastModifiedBy: this.userInfo.userName,
    stateName: ''
  });
  // [Validators.pattern('^[0-9]{13,13}$')]
  isGameApiCall = false;
  constructor(private editableGrid: EditableGridService, private constants: ConstantService, private _fb: FormBuilder,
    private _lotteryService: SetupService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    private utility: UtilityService, private commonService: CommonService, private router: Router, private storeService: StoreService) {
    this.gridOptions = this.editableGrid.getGridOption(this.constants.gridTypes.lotteryGameGrid);
    this.initialFormValues = this.addGameForm.value;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.defaultValue();
    this.lotteryGameState();
    if (this.commonService.confirmGameData) {
      this.addGameForm.get('gameNo').setValue(this.commonService.confirmGameData);
    }
    this.commonService.confirmGameData = null;
  }
  // convenience getter for easy access to form fields
  get addgame() { return this.addGameForm.controls; }
  get getValue() { return this.addGameForm.value; }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  addGame() {
    this.reset();
    this.isShowHide = !this.isShowHide;
    // this.isEdit = false;
  }
  changeGameNo($event) {
    this.addGameForm.get('gameName').setValue('');
    this.addGameForm.get('noOfTickets').setValue(null);
    this.addGameForm.get('ticketSellingPrice').setValue(null);
    this.addGameForm.get('lotteryPackValue').setValue(null);
    this.addGameForm.get('lotteryPOSCode').setValue(null);
    this.addGameForm.get('gameName').enable();
    this.addGameForm.get('noOfTickets').enable();
    this.addGameForm.get('ticketSellingPrice').enable();
    this.addGameForm.get('lotteryPackValue').enable();
    this.addGameForm.get('lotteryPOSCode').enable();
  }
  defaultValue() {
    this.addGameForm.patchValue(this.initialFormValues);
    this.addGameForm.get('gameName').enable();
    this.addGameForm.get('noOfTickets').enable();
    this.addGameForm.get('ticketSellingPrice').enable();
    this.addGameForm.get('lotteryPackValue').enable();
    this.addGameForm.get('lotteryPOSCode').enable();
    if (this.lotteryStateList && this.lotteryStateList.length === 1) {
      this.isStateLocation = false;
      this._stateCode = this.lotteryStateList[0].stateCode;
      this.addGameForm.get('lotteryStateCode').setValue(this._stateCode);
      // this.bindGameNoLength();
    }
  }
  getGameList(list) {
    this.spinner.show();
    if (list && list.length > 0) {
      const data = list.map(i => i.stateCode).join(',');
      this._lotteryService.getData(`CompanyLotteryGame/GetByCompanyIDAndStateCode/${this.userInfo.companyId}/${data}`).subscribe((response) => {
        // this._lotteryService.getData(`CompanyLotteryGame/listByStates/${data}`).subscribe((response) => {
        this.spinner.hide();
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        this.rowData = [];
        console.log(error);
      });
    }
  }
  reset() {
    this.defaultValue();
    this.submitted = false;
  }
  lotteryGameState() {
    let storeLocationList;
    // this.spinner.show();
    if (this.storeService.storeLocation) {
      this.isLoading = false;
      storeLocationList = this.storeService.storeLocation;
      if (storeLocationList && storeLocationList.length === 1) {
        this.lotteryStateList.push(storeLocationList[0]);
        this._stateCode = storeLocationList[0].stateCode;
      } else {
        let mapValues = new Map(storeLocationList.map(store => [store['stateCode'], store]));
        mapValues.forEach((value: any, key: string) => {
          this.lotteryStateList.push(value);
        });
      }
      this.getGameList(this.lotteryStateList);
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        storeLocationList = this.storeService.storeLocation;
        if (storeLocationList && storeLocationList.length === 1) {
          this.lotteryStateList.push(storeLocationList[0]);
          this._stateCode = storeLocationList[0].stateCode;
        } else {
          let mapValues = new Map(storeLocationList.map(store => [store['stateCode'], store]));
          mapValues.forEach((value: any, key: string) => {
            this.lotteryStateList.push(value);
          });
        }
        this.getGameList(this.lotteryStateList);
      }, (error) => {
        console.log(error);
      });
    }

    // const userName = this.userInfo['userName'];
    // this._lotteryService.getData(`CompanyLotteryGame/lotteryStateList/${this.userInfo['companyId']}/${userName}`).subscribe((response) => {
    //   this.spinner.hide();
    //   this.lotteryStateList = response;
    //   this.isLoading = false;
    //   if (this.lotteryStateList && this.lotteryStateList.length === 1) {
    //     this.isStateLocation = false;
    //     this._stateCode = this.lotteryStateList[0].stateCode;
    //     this.addGameForm.get('lotteryStateCode').setValue(this._stateCode);
    //     this.bindGameNoLength();
    //   }
    //   if (response && this.lotteryStateList && this.lotteryStateList.length > 0) {
    //     this.getGameList(response);
    //   }
    // }, (error) => {
    //   this.spinner.hide();
    //   console.log(error);
    // });
  }

  validateGameNo(data) {
    // this.submitted = true;
    // if (this.addGameForm.invalid) { return; }
    if (this.addGameForm.value.lotteryStateCode) {
      const gameNo = this.addGameForm.value.gameNo ? this.addGameForm.value.gameNo : '';
      const gameName = '';
      if (!gameNo) {
        return;
      }
      this.isGameApiCall = true;
      // this.spinner.show();
      this._lotteryService.getData(`CompanyLotteryGame/find/${this.userInfo.companyId}/${gameNo}/${this.addGameForm.value.lotteryStateCode}`
      ).subscribe(result => {
        // this.spinner.hide();
        this.isGameApiCall = false;
        if (result && result['gameNo'] > 0) {
          this.addGameForm.get('gameNo').setValue(result['gameNo']);
          this.addGameForm.get('gameName').setValue(result['gameName']);
          this.addGameForm.get('gameName').disable();
          this.addGameForm.get('noOfTickets').setValue(result['noOfTickets']);
          this.addGameForm.get('noOfTickets').disable();
          this.addGameForm.get('ticketSellingPrice').setValue(result['ticketSellingPrice']);
          this.addGameForm.get('ticketSellingPrice').disable();
          this.addGameForm.get('lotteryPackValue').setValue(result['lotteryPackValue']);
          this.addGameForm.get('lotteryPackValue').disable();
          this.addGameForm.get('lotteryPOSCode').setValue(result['lotteryPOSCode']);
          this.addGameForm.get('lotteryPOSCode').disable();
          return;
        }
        else {
          this.gameName.nativeElement.focus();
          this.addGameForm.get('gameName').setValue(null);
          this.addGameForm.get('noOfTickets').setValue(null);
          this.addGameForm.get('ticketSellingPrice').setValue(null);
          this.addGameForm.get('lotteryPackValue').setValue(null);
          this.addGameForm.get('lotteryPOSCode').setValue(null);
          this.addGameForm.get('gameName').enable();
          this.addGameForm.get('noOfTickets').enable();
          this.addGameForm.get('ticketSellingPrice').enable();
          this.addGameForm.get('lotteryPackValue').enable();
          this.addGameForm.get('lotteryPOSCode').enable();
        }

      }, (error) => {
        this.isGameApiCall = false;
        // this.spinner.hide();
        console.log(error);
      });
    } else {
      this.toastr.error('Lottery State is required', this.constants.infoMessages.error);
    }

  }
  onSubmit(form) {
    if (this.isGameApiCall) {
      return;
    }
    this.submitted = true;
    if (form.valid) {
      const lotteryState = this.lotteryStateList.filter(
        item => item.stateCode === this.addGameForm.value.lotteryStateCode ? this.addGameForm.value.lotteryStateCode : this._stateCode);
      if (lotteryState[0]) {
        this.addGameForm.get('stateName').setValue(lotteryState[0].stateName);
      }
      const postData = {
        ...this.addGameForm.getRawValue(),
        lastModifiedBy: this.userInfo['userName'],
        companyID: this.userInfo['companyId'],
        createdDateTime: new Date(),
        createdBy: this.userInfo['userName'],
      };
      this.spinner.show();
      this._lotteryService.postData('CompanyLotteryGame/insert', postData).subscribe(response => {
        this.spinner.hide();
        if (response && response.lotteryGameID && response.statusCode != 400) {
          this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          this.isStateLocation = true;
          this.getGameList(this.lotteryStateList);
          this.isShowHide = false;
          this.reset();
        } else {
          this.toastr.error(response.result.validationErrors[0].errorMessage, this.constants.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.isShowHide = false;
        console.log(error);
        this.toastr.error(this.constants.infoMessages.contactAdmin, this.constants.infoMessages.error);
      });
    }
  }

  findNoOfTickets() {
    if (this.addGameForm.value.noOfTickets && this.addGameForm.value.ticketSellingPrice) {
      const bookV = this.addGameForm.get('noOfTickets').value *
        this.addGameForm.get('ticketSellingPrice').value;
      this.addGameForm.get('lotteryPackValue').setValue(this.utility.formatDecimalDigit(bookV));
    } else {
      this.addGameForm.get('lotteryPackValue').setValue(null);
    }
  }
  SelectState() {
    this.isStateLocation = true;
    if (this.addGameForm.get('lotteryStateCode').value) {
      this.isStateLocation = false;
    }
    // this.bindGameNoLength();
  }

  bindGameNoLength() {
    this.maxGameNolength = 4;
    if (this.addGameForm.get('lotteryStateCode').value.toLowerCase() === 'tn') {
      this.maxGameNolength = 3;
      this.addGameForm.get('gameNo').value ?
        // tslint:disable-next-line:no-unused-expression
        this.addGameForm.get('gameNo').setValue(Number((this.addGameForm.get('gameNo').value).slice(0, 3))) : '';
      this.addGameForm.controls['gameNo'].setValidators([Validators.required]);
    } else {
      this.addGameForm.controls['gameNo'].setValidators([Validators.required]);
    }
  }
  updateAction(params) {
    this.gridApi.stopEditing();
    let postData = {
      "lotteryGameID": params.data.lotteryGameID,
      "companyID": params.data.companyID,
      "lotteryStateCode": params.data.lotteryStateCode,
      "isActive": params.data.isActive,
      "gameNo": params.data.gameNo,
      "gameName": params.data.gameName,
      "noOfTickets": params.data.noOfTickets,
      "ticketSellingPrice": params.data.ticketSellingPrice,
      "lotteryPackValue": params.data.lotteryPackValue,
      "lotteryPOSCode": params.data.lotteryPOSCode,
      "lastModifiedDateTime": params.data.lastModifiedDateTime,
      "lastModifiedBy": this.userInfo['userName'],
      "stateName": params.data.stateName
    }
    this.spinner.show();
    this._lotteryService.updateData('CompanyLotteryGame/update', postData).subscribe(response => {
      this.spinner.hide();
      if (response === "1") {
        this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
        this.getGameList(this.lotteryStateList);
      } else {
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
    });
  }

  deleteAction(params) {
    this.spinner.show();
    this._lotteryService.deleteData('CompanyLotteryGame/' + params.data.lotteryGameID).subscribe(response => {
      this.spinner.hide();
      if (response === "1") {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
        this.getGameList(this.lotteryStateList);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }

  onCellValueChanged(event) {
    if (event.colDef.field === "ticketSellingPrice" || event.colDef.field === "noOfTickets") {
      let rowData = event.data;
      rowData.lotteryPackValue = parseInt(rowData.ticketSellingPrice) * parseInt(rowData.noOfTickets);
      this.gridApi.updateRowData({
        update: [rowData],
      });
    }
  }

  rowDoubleClick(event){
    console.log(event);
  }

  // deleteSelected(){
  //   console.log(this.gridApi.getSelectedRows());
  // }

  // deActivateSelected(){
  //   console.log(this.gridApi.getSelectedRows());
  // }
}
