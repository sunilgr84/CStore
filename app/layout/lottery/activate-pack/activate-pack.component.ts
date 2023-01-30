import { Component, OnInit, ViewChild, Output, EventEmitter, Input, OnChanges, TemplateRef } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { Router } from '@angular/router';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
import { NgbModalOptions, NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { TestService } from '@shared/services/test/test.service';
import { UtilityService } from '@shared/services/utility/utility.service';
@Component({
  selector: 'app-activate-pack',
  templateUrl: './activate-pack.component.html',
  styleUrls: ['./activate-pack.component.scss']
})
export class ActivatePackComponent implements OnInit {
  filterText: any;
  @ViewChild('barcodeScan') barcodeScan: any;
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();
  @Input() storeList: any;
  @Input() activeTab: any;
  gridOptions: GridOptions;
  gridApi: any;
  rowData: any[];
  isChecked: boolean;
  isActivateScan = false;
  submitted = false;
  userInfo: any;
  storeLocationList: any = [];
  // = [{ storeLocationID: 94, storeLocation: 'QuickBuys 116' }, { storeLocationID: 94, storeLocation: 'QuickBuys 117' }];
  lotteryGameList: any[];
  _lotteryGameID = 0;
  inventoryDetail = {
    // confirmation: null,
    // booksActive: null,
    // booksSettled: null
    activatedLotteryPacksForyear: 0,
    activatedForyearLotteryPackValue: 0,
    activatedLotteryPacksForMonth: 0,
    activatedForMonthLotteryPackValue: 0,
    activatedLotteryPacksForWeek: 0,
    activatedForWeekLotteryPackValue: 0,
    activatedLotteryPacksForDay: 0,
    activatedForDayLotteryPackValue: 0,
    currentlyActivatedLotteryPacks: 0,
    currentlyActivatedLotteryPackValue: 0,
    soldOutLotteryPacksForYear: 0,
    soldOutForYearLotteryPackValue: 0,
    soldOutLotteryPacksForMonth: 0,
    soldOutForMonthLotteryPackValue: 0,
    soldOutLotteryPacksForWeek: 0,
    soldOutForWeekLotteryPackValue: 0,
    soldOutLotteryPacksForDay: 0,
    soldOutForDayLotteryPackValue: 0
  };
  inputActivateDate: any;
  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy');
  isStoreLocation = false;
  isGameNumberLoading = false;
  packNoLength = 2;
  packNoMaxLength = 9;
  activatePackForm = this.fb.group({
    lotteryStateCode: [''],
    lotteryPackID: [0],
    lotteryGameID: [0],
    storeLocationID: [''],
    AOrCdate: this.currentDate,
    binNo: [''],
    scanBarcode: [''],
    isActivation: [true],
    isActivateScan: [false],
    packNo: [null, [Validators.required, Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength)]],
    lotteryGameNo: [null],
    barcodeScanBatch: [''],
  });
  initialFormValues: any;
  confirmRowData: any = [];
  confirmGridApi: any;
  confirmGridOptions: GridOptions;
  // local hold data
  _activateGameObj: any;
  lotteryStateCode = '';
  @ViewChild('activeLotterys') activeLotterys: TemplateRef<any>;
  @ViewChild('content') content: TemplateRef<any>;
  closeResult: string;
  gameNumber: any;
  packNumber: any;
  binNumber: any;
  batchRowData: any[] = [];
  batchGridOptions: any;
  initialInventoryDetailValue: any;
  showGrid = false;
  batchScanFlag: boolean;
  barcodeScanBatch: any;
  divSpinner = 'sp1';
  constructor(private gridService: GridService, private constantService: ConstantService,
    private _lotteryService: SetupService, private pipe: DatePipe, private fb: FormBuilder
    , private spinner: NgxSpinnerService, private toastr: ToastrService, private commonService: CommonService,
    private confirmationDialogService: ConfirmationDialogService, private storeService: StoreService, private utilityService: UtilityService,
    private router: Router, private modalService: NgbModal) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.activatePackGrid);
    this.confirmGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.activateConfirmGrid);
    this.batchGridOptions = this.gridService.getGridOption(this.constantService.gridTypes.activatePackBatchGrid);
    this.initialFormValues = this.activatePackForm.value;
    this.initialFormValues = {
      lotteryStateCode: '', lotteryPackID: 0, lotteryGameID: 0,
      AOrCdate: this.currentDate, binNo: '', scanBarcode: '', isActivation: true,
      isActivateScan: false, packNo: null, lotteryGameNo: null, barcodeScanBatch: ''
    }
    this.inputActivateDate = this.currentDate;
    this.userInfo = this.constantService.getUserInfo();
    this.initialInventoryDetailValue = this.inventoryDetail;
  }
  showSpinner(name: string) {
    this.spinner.show(name);
  }

  hideSpinner(name: string) {
    this.spinner.hide(name);
  }
  ngOnInit() {
 
    this.activatePackForm.patchValue(this.initialFormValues);
    if (this.commonService.confirmActivateObj) {
      this._activateGameObj = this.commonService.confirmActivateObj;
      this.activatePackForm.patchValue({
        storeLocationID: this._activateGameObj.storeLocationID,
        AOrCdate: this.currentDate
      });
    }
    if (this.commonService.confirmGameList) {
      this.confirmRowData = this.commonService.confirmGameList;
    }
    this.commonService.confirmActivateObj = this.commonService.confirmGameList = null;
    this.getStoreLocation();
    // this.getInventoryDetail();
    this.batchScanFlag = false;
  
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
      this.activatePackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      this.lotteryStateCode = this.storeLocationList[0].stateCode;
    }
  }
  // ngOnChanges() {
  //   if (this.activeTab && this.activeTab['nextId'] === 'tab-activate') {
  //     this.storeLocationList = this.storeList;
  //     if (this.storeLocationList && this.storeLocationList.length === 1) {
  //       this.isStoreLocation = true;
  //       this.activatePackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
  //     }
  //     this.getLotteryGameByDrop();
  //   }
  // }
  // convenience getter for easy access to form fields
  get activate() { return this.activatePackForm.controls; }
  // confirm Game No grid
  onGridReady(params) {
    this.confirmGridApi = params.api;
    this.confirmGridApi.sizeColumnsToFit();
  }
  onReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  onBatchReady(params) {
    params.api.sizeColumnsToFit();
  }
  getActiveatePackGrid() {
    this.showGrid = true;
    this._lotteryService.getData(`CompanyLotteryPack/GetActivatedPacks?storeLocationID=${this.activatePackForm.value.storeLocationID}`).subscribe((response) => {
      const arr = _.sortBy(response, [function (o) { return o.confirmationDateTime.toLowerCase(); }]).reverse();
      this.rowData = arr;
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  getActivateInventoryDetail() {
    if (this.activatePackForm.value.storeLocationID) {
      // tslint:disable-next-line:max-line-length
      this.showSpinner(this.divSpinner);
      this._lotteryService.getData(`CompanyLotteryPack/GetActivationInventoryDetails?storeLocationID=${this.activatePackForm.value.storeLocationID}&datetime=${this.currentDate}`)
        .subscribe((response) => {
          if (response && response.length > 0) {
            this.inventoryDetail = response[0];
            this.hideSpinner(this.divSpinner);
          }
        }, (error) => {
          console.log(error);
        });
    }
  }
  getLotteryGameByDrop() {
    if (!this.activatePackForm.value.storeLocationID || this.activatePackForm.value.storeLocationID === '') {
      this.lotteryGameList = [];
      this.lotteryStateCode = '';
      this.inventoryDetail = this.initialInventoryDetailValue;
      return;
    }
    this.getActivateInventoryDetail();
    if (this._activateGameObj) {
      this.spinner.show();
    }
    const locationObj = _.find(this.storeLocationList, ['storeLocationID', Number(this.activatePackForm.value.storeLocationID)]);
    if (locationObj) {
      this.lotteryStateCode = locationObj.stateCode;
    }
    this.activatePackForm.get('lotteryGameNo').setValue(null);
    this.activatePackForm.get('packNo').setValue(null);
    this.activatePackForm.get('scanBarcode').setValue(null);
    this.isGameNumberLoading = true;
    this._lotteryService.getData(`CompanyLotteryGame/GetByCompanyIDAndStateCode/${this.userInfo.companyId}/${this.lotteryStateCode}`).subscribe((response) => {
      this.spinner.hide();
      response.forEach(x => {
        x.gameLabel = x.gameNo + ' - ' + x.gameName;
      })
      this.lotteryGameList = response;
      this.isGameNumberLoading = false;
      this.getActiveatePackGrid();
      if (this._activateGameObj) {
        this.activatePackForm.patchValue(this._activateGameObj);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  onFilterChange(eve: any) {
    this.isActivateScan = eve.target.checked;
    if (this.isActivateScan) {
      this.activatePackForm.controls['lotteryGameNo'].disable();
      this.activatePackForm.controls['packNo'].disable();
    } else {
      this.activatePackForm.controls['lotteryGameNo'].enable();
      this.activatePackForm.controls['packNo'].enable();
    }
    this.barcodeScan.nativeElement.focus();
  }

  onScanTypeChange(event) {
    if (event.checked) {
      if (this.activatePackForm.value.storeLocationID) {
        this.batchScanFlag = event.checked;
        setTimeout(() => {
          this.barcodeScan.nativeElement.focus();
        });
      } else {
        this.activatePackForm.patchValue({
          isActivateScan: false
        });
        this.toastr.error("Please select store location before proceeding to batch scan mode", this.constantService.infoMessages.error);
      }
    } else {
      if (this.batchRowData.length === 0) {
        this.batchScanFlag = false;
      } else {
        this.activatePackForm.patchValue({
          isActivateScan: true
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

  getInventoryDetail() {
    this._lotteryService.getData(`CompanyLotteryPack/getActivationPackInventory`).subscribe((response) => {
      if (response) {
        this.inventoryDetail = response;
      }
    }, (error) => {
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  getPackGameNo() {
    this.packNoLength = 2;

    if (this.activatePackForm.get('scanBarcode').value && this.lotteryGameList.length > 0) {
      if (this.lotteryStateCode && this.lotteryStateCode.toLowerCase() === 'tn') {
        this.packNoLength = 2;

        this.activatePackForm.controls['packNo'].setValidators([Validators.required,
        Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength),
        ]);

        this.activatePackForm.patchValue({
          lotteryGameNo: this.activatePackForm.value.scanBarcode.toString().substring(0, 3),
          packNo: this.activatePackForm.value.scanBarcode.toString().substring(3, 9)
        });
      } else {
        this.packNoLength = 2;
        this.activatePackForm.controls['packNo'].setValidators([Validators.required,
        Validators.minLength(this.packNoLength), Validators.maxLength(this.packNoMaxLength),
        ]);

        this.activatePackForm.patchValue({
          lotteryGameNo: this.activatePackForm.value.scanBarcode.toString().substring(0, 4),
          packNo: this.activatePackForm.value.scanBarcode.toString().substring(4, 11)
        });
      }
      // if (this.activatePackForm.value.packNo.length >= this.packNoLength) {
      //   this.confirmLottery(this.activeLotterys);
      // }
    } else {
      this.activatePackForm.patchValue({
        lotteryGameNo: null,
        packNo: 0
      });
    }
  }

  //newly implemented as per gowtham instructions
  getGamePackNoByScanBarcode() {
    let scannedBarcode = this.activatePackForm.get('scanBarcode').value;
    if (scannedBarcode && this.lotteryGameList.length > 0) {
      let splittedBarcode = this.utilityService.splitLotteryBarcodeByLength(scannedBarcode.toString());
      this.activatePackForm.controls['packNo'].setValidators([Validators.required,
      Validators.minLength(splittedBarcode.minPackNoLength), Validators.maxLength(splittedBarcode.maxPackNoLength),]);
      this.activatePackForm.patchValue({
        lotteryGameNo: splittedBarcode.lotteryGameNo,
        packNo: splittedBarcode.packNo
      });
      this.packNoLength = splittedBarcode.minPackNoLength;
    } else {
      this.packNoLength = 2;
      this.activatePackForm.patchValue({
        lotteryGameNo: null,
        packNo: 0
      });
    }
  }
  // add Row Data & checkConfirm by Game No ,packNo
  addGameNoToList() {
    this.submitted = true;
    const gameno = this.activatePackForm.get('lotteryGameNo').value;
    if (this.confirmRowData && this.confirmRowData.filter(function (e) {
      return e.lotteryGameNo === gameno;
    }).length > 0) {
      this.toastr.error('This game number already exists..', this.constantService.infoMessages.error);
      return;
    }
    if (this.activatePackForm.valid) {
      if (this.activatePackForm.value.lotteryGameNo) {
        const lotteryGame = this.lotteryGameList.filter(
          book => book.gameNo === Number(this.activatePackForm.value.lotteryGameNo));
        if (lotteryGame[0]) {
          this._lotteryGameID = lotteryGame[0].lotteryGameID;
          this.activatePackForm.get('lotteryGameID').setValue(this._lotteryGameID);
        }
      }
      if (this._lotteryGameID === 0 || this._lotteryGameID === undefined) {
        this.toastr.error('This game number not exists..', this.constantService.infoMessages.error);
        return;
      }
      this.spinner.show();
      this._lotteryService.getData('CompanyLotteryPack/check?lotteryGameID=' + this._lotteryGameID + '&storeLocationID='
        + this.activatePackForm.value.storeLocationID + '&packNo=' + this.activatePackForm.value.packNo, '').subscribe(
          (response) => {
            this.spinner.hide();
            if (response === 'false') {
              this.redirectToConfirmPack(this.activatePackForm.value);
              return;
            } else {
              this.addRowConfirmGrid();
            }
          }
        );
    }
  }
  addRowConfirmGrid() {
    const _AOrDate = this.activatePackForm.value.AOrCdate ?
      this.activatePackForm.value.AOrCdate : this.currentDate;
    this.confirmGridApi.updateRowData({
      add: [
        {
          lotteryPackID: 0, lotteryGameID: this._lotteryGameID, activationDateTime: _AOrDate
          , binNo: this.activatePackForm.value.binNo,
          isActivation: true, packNumber: this.activatePackForm.value.packNo
          , lotteryGameNo: this.activatePackForm.value.lotteryGameNo,
          storeLocationID: this.activatePackForm.value.storeLocationID,
          currentTicketNo: 0, invoiceReferenecNo: '0', activatedBy: this.userInfo.userName
        }
      ]
    });
    this.getRowDataUpdate();
    this._activateGameObj = null;
    this.activatePackForm.patchValue(this.initialFormValues);
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isStoreLocation = true;
      this.activatePackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
    }
    this.submitted = false;
  }
  getRowDataUpdate(): any {
    const data = [];
    this.confirmGridApi.forEachNode(function (node) {
      data.push(node.data);
    });
    this.confirmRowData = data;
    this.submitted = false;
  }
  redirectToConfirmPack(data) {
    this.confirmationDialogService.confirm('',
      'This Game is not comfirm? do you want to confirm?')
      .then(() => {
        // const params = { tabId: 'tab-confirm', data: data };
        // this.changeTabs.emit(params);
        this.commonService.confirmActivateObj = this.activatePackForm.value;
        this.commonService.confirmGameList = this.confirmRowData ? this.confirmRowData : [];
        this.router.navigate(['lottery/confirm-pack']);
      })
      .catch(() => console.log('User dismissed the dialog'));
  }
  deleteAction(params) {
    this.confirmGridApi.updateRowData({ remove: [params.data] });
    this.getRowDataUpdate();
  }
  dateChange(event) {
    if (event) {
      this.activatePackForm.get('AOrCdate').setValue(event.formatedDate);
      this.inputActivateDate = event.formatedDate;
    } else {
      this.activatePackForm.get('AOrCdate').setValue(this.currentDate);
      this.inputActivateDate = this.currentDate;
    }
  }
  onSubmit() {
    if (this.confirmRowData && this.confirmRowData.length > 0) {
      this.spinner.show();
      this._lotteryService.updateData('CompanyLotteryPack/activateLotteryPack', this.confirmRowData).subscribe(response => {
        this.spinner.hide();
        if (response) {
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.reset(true);
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
      });
    } else {
      this.submitted = true;
      if (this.activatePackForm.valid) {
        if (this.activatePackForm.value.lotteryGameNo) {
          const lotteryGame = this.lotteryGameList.filter(
            book => book.gameNo === Number(this.activatePackForm.value.lotteryGameNo));
          if (lotteryGame[0]) {
            this._lotteryGameID = lotteryGame[0].lotteryGameID;
            this.activatePackForm.get('lotteryGameID').setValue(this._lotteryGameID);
          }
        }
        if (this._lotteryGameID === 0 || this._lotteryGameID === undefined) {
          this.toastr.error('This game does not exists..', this.constantService.infoMessages.error);
          return;
        }
        this.spinner.show();
        this._lotteryService.getData('CompanyLotteryPack/check?lotteryGameID=' + this._lotteryGameID + '&storeLocationID='
          + this.activatePackForm.value.storeLocationID + '&packNo=' + this.activatePackForm.value.packNo, '').subscribe(
            (response) => {
              if (response === 'false') {
                this.spinner.hide();
                this.redirectToConfirmPack(this.activatePackForm.value);
                return;
              } else {
                const _AOrDate = this.activatePackForm.value.AOrCdate ?
                  this.activatePackForm.value.AOrCdate : this.currentDate;

                const postData = {
                  ...this.activatePackForm.value,
                  AOrCdate: _AOrDate
                };
                postData.binNo = (postData.binNo === '') ? '0' : postData.binNo
                this._lotteryService.updateData('CompanyLotteryPack/update?lotteryPackID=' + postData.lotteryPackID
                  + '&lotteryGameID=' + postData.lotteryGameID +
                  '&storeLocationID=' + postData.storeLocationID + '&AOrCdate=' + postData.AOrCdate
                  + '&isActivation=' + true + '&user=' + this.userInfo.userName + '&packNo=' + postData.packNo + '&currentTicketNo='
                  + 0 + '&invoiceReferenecNo=' + '' + '&binNo=' + postData.binNo, '').subscribe((result) => {
                    this.spinner.hide();
                    console.log(result);
                    if (result === "true") {
                      this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
                      this.getActiveatePackGrid();
                      this.reset(false);
                    } else {
                      this.toastr.error(result.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
                    }
                  }, (error) => {
                    this.spinner.hide();
                    this.toastr.error(this.constantService.infoMessages.contactAdmin, this.constantService.infoMessages.error);
                  });
              }
            }, (error) => { });
      }
    }
  }
  reset(gridEmpty) {
    this.submitted = false;
    if (gridEmpty) {
      this.rowData = [];
    }
    this.batchRowData = [];
    this.getActivateInventoryDetail();
    this._activateGameObj = null;
    this.activatePackForm.patchValue(this.initialFormValues);
    if (this.storeLocationList && this.storeLocationList.length === 1) {
      this.isStoreLocation = true;
      this.activatePackForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
    }
    this.inputActivateDate = this.currentDate;
    this.confirmRowData = [];
    this.batchScanFlag = false;
    this.activatePackForm.patchValue({
      isActivateScan: false
    });
  }
  confirmLottery(content) {
    this.gameNumber = this.activatePackForm.get('lotteryGameNo').value;
    this.packNumber = this.activatePackForm.get('packNo').value;
    this.binNumber = this.activatePackForm.get('binNo').value;
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
    this.batchRowData = this.rowData && this.rowData.filter((x) =>
      String(x.packNumber) === String(this.activatePackForm.value.packNo)
    );

    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      size: 'lg'
    };
    this.modalService.open(content).result.then((result) => {
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

  onScanBatch() {
    this.barcodeScanBatch = this.activatePackForm.get('barcodeScanBatch').value;
    if (this.barcodeScanBatch) {
      const data = {
        lotteryGameNo: '', packNo: '', batchBinNumber: ''
      };
      this.packNoLength = 2;
      if (this.barcodeScanBatch && this.lotteryGameList.length > 0) {
        let splittedBarcode = this.utilityService.splitLotteryBarcodeByLength(this.barcodeScanBatch.toString());
        data.lotteryGameNo = splittedBarcode.lotteryGameNo;
        data.packNo = splittedBarcode.packNo;
        data.batchBinNumber = '';
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
          storeLocationID: this.activatePackForm.value.storeLocationID,
          aOrCdate: this.inputActivateDate,
          isActivation: true,
          user: this.userInfo.userName,
          packNo: data.packNo,
          currentTicketNo: 0,
          invoiceReferenecNo: 0,
          binNo: data.batchBinNumber,
          barcodeNo: this.barcodeScanBatch
        };
        this.batchRowData = [pushData, ...this.batchRowData];
        this.barcodeScanBatch = null;
        this.activatePackForm.get('barcodeScanBatch').setValue('');
      }
    }
  }

  bulkUpdate() {
    if (!this.activatePackForm.value.lotteryGameNo && !this.activatePackForm.value.packNo) {
      this.toastr.error('Please Scan atleast 1 Pack');
      return;
    }
    if (this.activatePackForm.value.lotteryGameNo) {
      const lotteryGame = this.lotteryGameList.filter(
        book => book.gameNo === Number(this.activatePackForm.value.lotteryGameNo));
      if (lotteryGame[0]) {
        this._lotteryGameID = lotteryGame[0].lotteryGameID;
        this.activatePackForm.get('lotteryGameID').setValue(this._lotteryGameID);
      }
    }
    if (this._lotteryGameID === 0 || this._lotteryGameID === undefined) {
      this.toastr.error('This game no not exists..', this.constantService.infoMessages.error);
      return;
    }
    const _AOrDate = this.activatePackForm.value.AOrCdate ?
      this.activatePackForm.value.AOrCdate : this.currentDate;
    const storeLocationID = this.activatePackForm.value.storeLocationID;
    const userName = this.userInfo.userName;
    const packNo = this.activatePackForm.value.packNo;
    const invoiceReferenecNo = this.activatePackForm.value.invoiceReferenecNo;
    const binNo = this.activatePackForm.value.binNo;
    const postArray = [];
    if (this.batchRowData && this.batchRowData.length > 0) {
      this.batchRowData.forEach(function (x) {
        x['lotteryPackID'] = 0;
        x['storeLocationID'] = storeLocationID;
        x['aOrCdate'] = _AOrDate;
        x['user'] = userName;
        x['packNo'] = packNo;
        x['currentTicketNo'] = 0;
        x['invoiceReferenecNo'] = invoiceReferenecNo;
        x['binNo'] = binNo;
        postArray.push(x);
      });
    } else {
      const postData = {
        lotteryPackID: 0,
        lotteryGameID: this._lotteryGameID,
        storeLocationID: this.activatePackForm.get('storeLocationID').value,
        aOrCdate: _AOrDate,
        isActivation: true,
        user: this.userInfo.userName,
        packNo: this.activatePackForm.get('packNo').value,
        currentTicketNo: 0,
        invoiceReferenecNo: 0,
        binNo: this.activatePackForm.get('binNo').value,
      };
      postArray.push(postData);
    }
    this.spinner.show();
    this._lotteryService.updateData('CompanyLotteryPack/UpdateBulk', postArray)
      .subscribe((response) => {
        console.log(response);
        this.spinner.hide();
        if (response && Number(response) > 0) {
          this.reset(true);
          document.getElementById('bulkUpdateClose').click();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  onBulkUpdate() {
    if (this.batchRowData && this.batchRowData.length <= 0) {
      this.toastr.error('Please Scan atleast 1 Pack', this.constantService.infoMessages.error);
      return;
    }
    // if (!this.activatePackForm.value.binNo) {
    //   this.toastr.error('Please Enter Bin Number');
    //   return;
    // }
    this.spinner.show();
    this._lotteryService.updateData('CompanyLotteryPack/UpdateBulk', this.batchRowData)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) > 0) {
          this.getActiveatePackGrid();
          // this.getInventoryDetail();
          this.reset(true);
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  confirmScanMode() {
    document.getElementById('confirmBatchScanMode').click();
    this.activatePackForm.get('binNo').setValue(this.binNumber);
  }
}
