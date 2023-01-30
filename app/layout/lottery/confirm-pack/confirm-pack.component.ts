import { Component, OnInit, ViewChild, Input, OnChanges, EventEmitter, Output, TemplateRef } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { Router } from '@angular/router';
import * as _ from 'lodash';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UtilityService } from '@shared/services/utility/utility.service';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';

@Component({
  selector: 'app-confirm-pack',
  templateUrl: './confirm-pack.component.html',
  styleUrls: ['./confirm-pack.component.scss']
})
export class ConfirmPackComponent implements OnInit {
  @ViewChild('barcodeScan') barcodeScan: any;
  @ViewChild('batchScan') batchScan: any;
  filterText = '';
  @Input() editData?: any;
  @Input() storeList: any;
  @Input() activeTab: any;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  gridOptions: GridOptions;
  gridApi: any;
  rowData: any[];
  userInfo: any;
  isConfirmScan = false;
  submitted = false;
  isStoreLocation: boolean;
  storeLocationList: any = [];
  inputConfirmationDate: any;
  //  = [{ storeLocationID: 94, storeLocation: 'QuickBuys 116' }, { storeLocationID: 94, storeLocation: 'QuickBuys 117' }];
  lotteryGameList: any[];
  // inventoryDetail = {
  //   totalConfirmation: null,
  //   totalActivation: null,
  //   todayConfirmation: null,
  //   todayActivation: null
  // };
  inventoryDetail = {
    confirmedLotteryPacksForYear: 0,
    confirmedPacksValueForYear: 0,
    confirmedLotteryPacksForMonth: 0,
    lotteryPackValueForMonth: 0,
    confirmedLotteryPacksForWeek: 0,
    lotteryPackValueForWeek: 0,
    confirmedLotteryPacksForDay: 0,
    confirmedPacksValueForDay: 0
  };

  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy');
  isLoading = false;
  batchScanFlag: boolean;
  _lotteryGameID = 0;
  isGameNumberLoading = false;
  packNoLength = 2;
  packNoMaxLength = 9;
  confirmPackForm = this.fb.group({
    lotteryStateCode: [''],
    lotteryPackID: [0],
    lotteryGameID: [0],
    storeLocationID: [''],
    AOrCdate: this.currentDate,
    invoiceReferenecNo: ['', Validators.pattern(/^[a-zA-Z0-9]*$/)],
    scanBarcode: [''],
    isActivation: [false],
    isConfirmScan: [false],
    packNo: [null, [Validators.required, Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength)]],
    lotteryGameNo: [null],
    currentTicketNo: [null],
    barcodeScanBatch: ['']
  });
  initialFormValues: any;

  // local hold data
  _activateGameObj: any;
  _confirmGamelist: any;
  lotteryStateCode = '';
  closeResult: any;
  @ViewChild('confirmLotterys') confirmLotterys: TemplateRef<any>;
  @ViewChild('content') content: TemplateRef<any>;
  packNumber: any;
  gameNumber: any;
  invoiceNumber: any;
  batchRowData = [];
  batchGridOptions: any;
  batchGridApi: any;
  barcodeScanBatch: any;
  initialInventoryDetailValue: any;
  showGrid = false;
  divSpinner = 'sp1';
  constructor(private gridService: GridService, private constantService: ConstantService, private commonService: CommonService
    , private _lotteryService: SetupService, private pipe: DatePipe, private fb: FormBuilder
    , private spinner: NgxSpinnerService, private toastr: ToastrService, private storeService: StoreService
    , private router: Router, private modalService: NgbModal, private utilityService: UtilityService, private confirmationDialogService: ConfirmationDialogService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.comfirmPackGrid);
    this.batchGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.comfirmPackBatchGrid);
    this.initialFormValues = this.confirmPackForm.value;
    this.initialFormValues = {
      lotteryStateCode: "", lotteryPackID: 0, lotteryGameID: 0,
      AOrCdate: "", invoiceReferenecNo: "", scanBarcode: "", isActivation: false,
      isConfirmScan: false, packNo: null, lotteryGameNo: null, currentTicketNo: null
    }
    this.userInfo = this.constantService.getUserInfo();
    this.inputConfirmationDate = this.currentDate;
    this.initialInventoryDetailValue = this.inventoryDetail;
  }

  ngOnInit() {
    this.confirmPackForm.patchValue(this.initialFormValues);
    if (this.commonService.confirmActivateObj) {
      this._activateGameObj = this.commonService.confirmActivateObj;
      this.confirmPackForm.patchValue({
        storeLocationID: this._activateGameObj.storeLocationID,
        AOrCdate: this.currentDate
      });
      this.inputConfirmationDate = this._activateGameObj.AOrCdate;
    }
    if (this.commonService.confirmGameList) {
      this._confirmGamelist = this.commonService.confirmGameList;
    }
    this.commonService.confirmActivateObj = this.commonService.confirmGameList = null;
    this.getStoreLocation();
    // this.getInventoryDetail();
    this.batchScanFlag = false;
  }
  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }
  getStoreLocation() {
    if (this._activateGameObj) {
      this.spinner.show();
    }
    if (this.storeService.storeLocation) {
      this.spinner.hide();
      this.storeLocationList = this.storeService.storeLocation;
      this.setLocation();
      this.getLotteryGameByDrop();

    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.spinner.hide();
        this.storeLocationList = this.storeService.storeLocation;
        this.setLocation();
        this.getLotteryGameByDrop();
      }, (error) => {
        console.log(error);
      });
    }
  }
  setLocation() {
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isStoreLocation = true;
      this.confirmPackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this.lotteryStateCode = this.storeLocationList[0].stateCode;
    }
  }
  // ngOnChanges() {
  //   if (this.activeTab && this.activeTab['nextId'] === 'tab-confirm') {
  //     this.storeLocationList = this.storeList;
  //     if (this.storeLocationList && this.storeLocationList.length === 1) {
  //       this.isStoreLocation = true;
  //       this.confirmPackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
  //     }
  //     this.getInventoryDetail();
  //     this.getLotteryGameByDrop();
  //     if (this.editData) {
  //       this.confirmPackForm.patchValue({
  //         storeLocationID: this.editData.storeLocationID,
  //         AOrCdate: this.currentDate
  //       });
  //       this.confirmPackForm.patchValue(this.editData);
  //     }
  //   }
  // }
  // convenience getter for easy access to form fields
  get confirm() { return this.confirmPackForm.controls; }
  onReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onBatchReady(params) {
    this.batchGridApi = params.api;
    setTimeout(() => {
      this.batchGridApi.sizeColumnsToFit();
    }, 300);
  }

  getComfirmPackGrid(storeLocationID) {
    this.showGrid = true;
    this._lotteryService.getData(`CompanyLotteryPack/GetConfirmedPacks?storeLocationID=${storeLocationID}`).subscribe((response) => {
      if (response && response['statusCode']) {
        this.rowData = [];
        return;
      }
      const arr = _.sortBy(response, [function (o) { return o.confirmationDateTime.toLowerCase(); }]).reverse();
      this.rowData = arr;
    }, (error) => {
      console.log(error);
    });
  }

  onScanTypeChange(event) {
    if (event.checked) {
      if (this.confirmPackForm.value.storeLocationID) {
        this.batchScanFlag = event.checked;
        setTimeout(() => {
          this.batchScan.nativeElement.focus();
        });
      } else {
        this.confirmPackForm.patchValue({
          isConfirmScan: false
        });
        this.toastr.error("Please select store location before proceeding to batch scan mode", this.constantService.infoMessages.error);
      }
    } else {
      if (this.batchRowData.length === 0) {
        this.batchScanFlag = false;
      } else {
        this.confirmPackForm.patchValue({
          isConfirmScan: true
        });
        this.confirmationDialogService.confirm(this.constantService.infoMessages.confirmTitle,
          'Do you want save the data before navigating to another one?')
          .then(() => {
            this.onBulkUpdate();
          }).catch(() => {
            this.batchScanFlag = false;
            this.reset(false);
          });
      }

    }
  }

  onFilterChange(eve: any) {
    this.isConfirmScan = eve.target.checked;
    if (this.isConfirmScan) {
      this.confirmPackForm.controls['lotteryGameNo'].disable();
      this.confirmPackForm.controls['packNo'].disable();
    } else {
      this.confirmPackForm.controls['lotteryGameNo'].enable();
      this.confirmPackForm.controls['packNo'].enable();
    }
    this.barcodeScan.nativeElement.focus();
  }

  onRefreshInventoryGrid() {
    this.getLotteryGameByDrop();
  }

  getLotteryGameByDrop() {
    // this.spinner.show('inventorySpinner');
    if (!this.confirmPackForm.value.storeLocationID || this.confirmPackForm.value.storeLocationID === '') {
      this.lotteryGameList = [];
      this.lotteryStateCode = '';
      this.inventoryDetail = this.initialInventoryDetailValue;
      return;
    }
    this.getConfInventoryDetail();
    if (this._activateGameObj) {
      this.spinner.show();
    }
    const locationObj = _.find(this.storeLocationList, ['storeLocationID', Number(this.confirmPackForm.value.storeLocationID)]);
    if (locationObj) {
      this.lotteryStateCode = locationObj.stateCode;
    }
    this.confirmPackForm.get('lotteryGameNo').setValue(null);
    this.confirmPackForm.get('packNo').setValue(null);
    this.confirmPackForm.get('scanBarcode').setValue(null);
    this.confirmPackForm.get('barcodeScanBatch').setValue(null);
    this.isGameNumberLoading = true;
    // this._lotteryService.getData(`LotteryGame/list/${this.confirmPackForm.value.storeLocationID}`).subscribe((response) => {
    this._lotteryService.getData(`CompanyLotteryGame/GetByCompanyIDAndStateCode/${this.userInfo.companyId}/${this.lotteryStateCode}`).subscribe((response) => {
      this.spinner.hide();
      response.forEach(x => {
        x.gameLabel = x.gameNo + ' - ' + x.gameName;
      })
      this.lotteryGameList = response;
      this.getComfirmPackGrid(this.confirmPackForm.value.storeLocationID);
      this.isGameNumberLoading = false;
      if (this._activateGameObj) {
        this.confirmPackForm.patchValue(this._activateGameObj);
      }
      // this.spinner.hide('inventorySpinner');
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }

  getInventoryDetail() { 
    this._lotteryService.getData(`CompanyLotteryPack/getConfirmationPackInventory`).subscribe((response) => {
      this.inventoryDetail = response;
    }, (error) => {
      console.log(error);
    });
  }

  getConfInventoryDetail() {
    // tslint:disable-next-line:max-line-length
    this.showSpinner(this.divSpinner);
    this._lotteryService.getData(`CompanyLotteryPack/GetConfirmationInventoryDetails?storeLocationID=${this.confirmPackForm.value.storeLocationID}&datetime=${this.currentDate}`)
      .subscribe((response) => {
        if (response && response.length > 0) {
          this.inventoryDetail = response[0];
          this.hideSpinner(this.divSpinner);
        }
      }, (error) => {
        console.log(error);
      });
  }

  dateChange(event) {
    if (event) {
      this.confirmPackForm.get('AOrCdate').setValue(event.formatedDate);
      this.inputConfirmationDate = event.formatedDate;
    } else {
      this.confirmPackForm.get('AOrCdate').setValue(this.currentDate);
      this.inputConfirmationDate = this.currentDate;
    }
  }

  getPackGameNo() {
    this.packNoLength = 2;
    if (this.confirmPackForm.get('scanBarcode').value && this.lotteryGameList.length > 0) {
      if (this.lotteryStateCode && this.lotteryStateCode.toLowerCase() === 'tn') {
        this.packNoLength = 2;
        this.confirmPackForm.controls['packNo'].setValidators([Validators.required,
        Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength),
        ]);
        this.confirmPackForm.patchValue({
          lotteryGameNo: this.confirmPackForm.value.scanBarcode.toString().substring(0, 3),
          packNo: this.confirmPackForm.value.scanBarcode.toString().substring(3, 9)
        });
      } else {
        this.packNoLength = 2;
        this.confirmPackForm.controls['packNo'].setValidators([Validators.required,
        Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength),
        ]);
        this.confirmPackForm.patchValue({
          lotteryGameNo: this.confirmPackForm.value.scanBarcode.toString().substring(0, 4),
          packNo: this.confirmPackForm.value.scanBarcode.toString().substring(4, 11)
        });
      }
      // this.confirmPackForm.value.packNo
      // if (this.confirmPackForm.get('packNo').value.length >= this.packNoLength) {
      //   this.confirmLottery(this.confirmLotterys);
      // }
    } else {
      this.confirmPackForm.patchValue({
        lotteryGameNo: null,
        packNo: 0
      });
    }
  }
  //newly implemented as per gowtham instructions
  getGamePackNoByScanBarcode() {
    let scannedBarcode = this.confirmPackForm.get('scanBarcode').value;
    if (scannedBarcode && this.lotteryGameList.length > 0) {
      let splittedBarcode = this.utilityService.splitLotteryBarcodeByLength(scannedBarcode.toString());
      this.confirmPackForm.controls['packNo'].setValidators([Validators.required,
      Validators.minLength(splittedBarcode.minPackNoLength), Validators.maxLength(splittedBarcode.maxPackNoLength),]);
      this.confirmPackForm.patchValue({
        lotteryGameNo: splittedBarcode.lotteryGameNo,
        packNo: splittedBarcode.packNo
      });
      this.packNoLength = splittedBarcode.minPackNoLength;
    } else {
      this.packNoLength = 2;
      this.confirmPackForm.patchValue({
        lotteryGameNo: null,
        packNo: 0
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.confirmPackForm.valid) {
      if (this.packNoLength > this.confirmPackForm.get('packNo').value.length) {
        this.toastr.warning('Pack Number is required, please enter valid details', 'warning');
        return;
      }
      if (this.confirmPackForm.get('lotteryGameNo').value) {
        const lotteryGame = this.lotteryGameList.filter(
          book => book.gameNo === Number(this.confirmPackForm.get('lotteryGameNo').value));
        if (lotteryGame[0]) {
          this._lotteryGameID = lotteryGame[0].lotteryGameID;
        }
      }
      if (this._lotteryGameID === 0 || this._lotteryGameID === undefined) {
        this.toastr.error('This game no not exists..', this.constantService.infoMessages.error);
        this.commonService.confirmGameData = Number(this.confirmPackForm.get('lotteryGameNo').value);
        this.router.navigate(['lottery/add-game']);
        return;
      }
      const _AOrCdate = this.confirmPackForm.value.AOrCdate ? this.confirmPackForm.value.AOrCdate : this.currentDate;
      const postData = {
        ...this.confirmPackForm.value,
        lotteryGameID: this._lotteryGameID,
        AOrCdate: _AOrCdate
      };
      if (postData.packNo === undefined) {
        let rawFormValues = this.confirmPackForm.getRawValue();
        postData.packNo = rawFormValues.packNo;
        postData.lotteryGameNo = rawFormValues.lotteryGameNo;
      }
      this.spinner.show();
      // tslint:disable-next-line:max-line-length
      this._lotteryService.postData('CompanyLotteryPack/insert?lotteryPackID=' + postData.lotteryPackID + '&lotteryGameID=' + postData.lotteryGameID +
        '&storeLocationID=' + postData.storeLocationID + '&AOrCdate=' + postData.AOrCdate
        + '&isActivation=' + false + '&user=' + this.userInfo.userName + '&packNo=' + postData.packNo + '&currentTicketNo='
        + 0 + '&invoiceReferenecNo=' + postData.invoiceReferenecNo, '').
        subscribe((response) => {
          this.spinner.hide();
          if (response === "true") {
            this.submitted = false;
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            if (this._activateGameObj) {
              this.commonService.confirmActivateObj = this.confirmPackForm.value;
              this.commonService.confirmGameList = this._confirmGamelist ? this._confirmGamelist : [];
              this.router.navigate(['lottery/activate-pack']);
            }
            this.spinner.show();
            this.getLotteryGameByDrop();
            this.reset(false);
          } else {
            this.toastr.error(response.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
          }
          this.submitted = false;
          // this.barcodeScan.nativeElement.focus();
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.contactAdmin);
          console.log(error);
        });
    }
  }

  reset(gridEmpty) {
    this.submitted = false;
    this._activateGameObj = null;
    this._confirmGamelist = [];
    this.batchRowData = [];
    if (gridEmpty) {
      this.rowData = [];
    }
    this.confirmPackForm.patchValue(this.initialFormValues);
    this.inputConfirmationDate = this.currentDate;
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isStoreLocation = true;
      this.confirmPackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
    }
    this.batchScanFlag = false;
    this.confirmPackForm.patchValue({
      isConfirmScan: false
    });
    // this.barcodeScan.nativeElement.focus();
  }

  confirmLottery(content) {
    this.gameNumber = this.confirmPackForm.get('lotteryGameNo').value;
    this.packNumber = this.confirmPackForm.get('packNo').value;
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      size: 'sm'
    };
    this.modalService.open(content).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  batchScanMode(content) {
    // this.batchRowData = this.rowData && this.rowData.filter((x) =>
    //   String(x.packNumber) === String(this.confirmPackForm.get('packNo').value)
    // );
    this.invoiceNumber = this.confirmPackForm.get('invoiceReferenecNo').value;
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      size: 'lg'
    };

    this.modalService.open(content, ngbModalOptions).result.then((result) => {
      if (this.batchScan.nativeElement) {
        this.batchScan.nativeElement.focus();
      }
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  bulkUpdateDateChange(params) {
    console.log(params);
  }

  bulkUpdate() {
    if (!this.confirmPackForm.get('lotteryGameNo').value && !this.confirmPackForm.get('packNo').value) {
      this.toastr.error('Please Scan atleast 1 Pack');
      return;
    }
    if (this.confirmPackForm.get('lotteryGameNo').value) {
      const lotteryGame = this.lotteryGameList.filter(
        book => book.gameNo === Number(this.confirmPackForm.get('lotteryGameNo').value));
      if (lotteryGame[0]) {
        this._lotteryGameID = lotteryGame[0].lotteryGameID;
      }
    }
    if (this._lotteryGameID === 0 || this._lotteryGameID === undefined) {
      this.toastr.error('This game no not exists..', this.constantService.infoMessages.error);
      this.commonService.confirmGameData = Number(this.confirmPackForm.get('lotteryGameNo').value);
      this.router.navigate(['lottery/add-game']);
      return;
    }
    this.confirmPackForm.get('invoiceReferenecNo').setValue(this.invoiceNumber);
    const _AOrCdate = this.confirmPackForm.value.AOrCdate ? this.confirmPackForm.value.AOrCdate : this.currentDate;
    const storeLocationID = this.confirmPackForm.value.storeLocationID;
    const userName = this.userInfo.userName;
    const packNo = this.confirmPackForm.get('packNo').value;
    const invoiceReferenecNo = this.confirmPackForm.value.invoiceReferenecNo;
    const postArray = [];
    if (this.batchRowData && this.batchRowData.length > 0) {
      this.batchRowData.forEach(function (x) {
        x['lotteryPackID'] = 0;
        x['storeLocationID'] = storeLocationID;
        x['aOrCdate'] = _AOrCdate;
        x['user'] = userName;
        x['packNo'] = packNo;
        x['currentTicketNo'] = 0;
        x['invoiceReferenecNo'] = invoiceReferenecNo;
        x['binNo'] = 0;
        postArray.push(x);
      });
    } else {
      const postData = {
        lotteryPackID: 0,
        lotteryGameID: this._lotteryGameID,
        storeLocationID: this.confirmPackForm.get('storeLocationID').value,
        aOrCdate: _AOrCdate,
        isActivation: true,
        user: this.userInfo.userName,
        packNo: this.confirmPackForm.get('packNo').value,
        currentTicketNo: 0,
        invoiceReferenecNo: this.confirmPackForm.get('invoiceReferenecNo').value,
        binNo: 0
      };
      postArray.push(postData);
    }
    this.spinner.show();
    this._lotteryService.postData('CompanyLotteryPack/AddNewBulk', postArray)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) > 0) {
          this.getComfirmPackGrid(storeLocationID);
          this.getInventoryDetail();
          this.reset(true);
          // document.getElementById('bulkUpdateClose').click();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  onScanBatch() {
    this.barcodeScanBatch = this.confirmPackForm.get('barcodeScanBatch').value;
    if (this.barcodeScanBatch) {
      const data = {
        lotteryGameNo: '', packNo: '',
      };
      this.packNoLength = 2;
      if (this.barcodeScanBatch && this.lotteryGameList.length > 0) {
        let splittedBarcode = this.utilityService.splitLotteryBarcodeByLength(this.barcodeScanBatch.toString());
        data.lotteryGameNo = splittedBarcode.lotteryGameNo;
        data.packNo = splittedBarcode.packNo;
        this.packNoLength = splittedBarcode.minPackNoLength;
        const isDuplicate = _.find(this.batchRowData, ['barcodeNo', this.barcodeScanBatch]);
        if (isDuplicate) {
          this.barcodeScanBatch = null;
          this.toastr.warning('Game no & Pack No already exists in list', this.constantService.infoMessages.warning);
          return;
        }
        const lotteryGame = _.find(this.lotteryGameList, ['gameNo', Number(data.lotteryGameNo)]);
        if (!lotteryGame) {
          this.barcodeScanBatch = null;
          this.toastr.warning("This game number doesn't exists..", this.constantService.infoMessages.warning);
          return;
        }
        const pushData = {
          lotteryPackID: 0,
          lotteryGameID: lotteryGame.lotteryGameID,
          lotteryGameNo: data.lotteryGameNo,
          storeLocationID: this.confirmPackForm.value.storeLocationID,
          aOrCdate: this.inputConfirmationDate,
          isActivation: false,
          user: this.userInfo.userName,
          packNo: data.packNo,
          currentTicketNo: 0,
          invoiceReferenecNo: this.invoiceNumber,
          binNo: 0,
          barcodeNo: this.barcodeScanBatch
        };
        this.batchRowData = [pushData, ...this.batchRowData];
        this.barcodeScanBatch = null;
        this.confirmPackForm.get('barcodeScanBatch').setValue('');
      }
    }
  }

  BatchModeClose() {
    this.barcodeScanBatch = null;
    this.modalService.dismissAll();
  }

  onBulkUpdate() {
    if (this.batchRowData && this.batchRowData.length <= 0) {
      this.toastr.error('Please Scan atleast 1 Pack', this.constantService.infoMessages.error);
      return;
    }
    this.spinner.show();
    this._lotteryService.postData('CompanyLotteryPack/AddNewBulk', this.batchRowData)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) > 0) {
          this.getComfirmPackGrid(this.confirmPackForm.get('storeLocationID').value);
          this.getInventoryDetail();
          this.reset(true);
          // document.getElementById('bulkUpdateClose').click();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
}
