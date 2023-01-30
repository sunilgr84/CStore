import { Component, OnInit, ViewChild } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { StoreService } from '@shared/services/store/store.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { TestService } from '@shared/services/test/test.service';
import { ToastrService } from 'ngx-toastr';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { CommonService } from '@shared/services/commmon/common.service';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as printJS from 'print-js';
@Component({
  selector: 'app-lottery-inventory',
  templateUrl: './lottery-inventory.component.html',
  styleUrls: ['./lottery-inventory.component.scss']
})
export class LotteryInventoryComponent implements OnInit {
  editRowData?: any; // input paramter
  rowData: any = [];
  gridOptions: any;
  isPopup = false;
  lotteryPackInventoryList: any[];
  storeLocationList: any[];
  currentDate = moment(new Date()).format('MM-DD-YYYY');
  advanSearch = {
    storeLocationID: null,
    invDate: this.currentDate,
    lotteryPackInventoryTypeID: null,
    lotteryScratchSaleAmount: null,
    lotteryOnlineSaleAmount: 0,
    lotteryPayOutAmount: 0,
    lotteryOnlinePayout: 0,
    lotteryScartchOffPayout: 0
  };
  userInfo: any;
  gridApi: any;
  totalSoldQty: any;
  totalAmount: any;
  closeDayMsg: any;
  isLotteryClosed: boolean;
  isSubmmitedValue: any = false;
  isLoading = true;
  NetLotteryAmt: number;
  // Testing
  UPCBarCode: any = '';
  isScanMode = false;
  isShowScanMode: boolean;
  body: any = [];
  colWidths: any = [];
  closeButtonName = 'Day';
  editableGridOptions: any;
  filterText: any = '';
  @ViewChild('barcodeInput') barcodeInput: any;
  showForceOpenBtn: boolean;
  lotterySalesID: any;

  constructor(private editableGridSerivce: EditableGridService, private constantService: ConstantService, private store: StoreService,
    private setupService: SetupService, private spinner: NgxSpinnerService, private testService: TestService,
    private toastr: ToastrService, private commonService: CommonService, private pdfGenrateService: PDFGenrateService,
    private utilityService: UtilityService, private gridService: GridService) {
    this.editableGridOptions = this.editableGridSerivce.getGridOption(
      this.constantService.editableGridConfig.gridTypes.lotteryInventoryGrid);
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.lotteryInventoryGrid);
    this.userInfo = this.constantService.getUserInfo();
    this.advanSearch.invDate = this.currentDate;
    this.showForceOpenBtn = false;
  }

  ngOnInit() {
    var ext = ['CompanyAdmin', 'SuperAdmin', 'StoreManager'];
    if (this.userInfo.roles.some(role => ext.includes(role))) {
      this.showForceOpenBtn = true;
    }
    this.GetStoreList();
    this.GetLotteryPackInventoryType();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onScanBarcode(params) {
    if (this.isScanMode) {
      setTimeout(() => {
        this.barcodeInput.nativeElement.focus();
      });
    }
  }

  GetStoreList() {
    if (this.store.storeLocation) {
      this.storeLocationList = this.store.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.advanSearch.storeLocationID = this.storeLocationList[0].storeLocationID;
      }
      this.isLoading = false;
    } else {
      this.store.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
        (response) => {
          this.storeLocationList = response;
          this.isLoading = false;
          if (this.storeLocationList && this.storeLocationList.length === 1) {
            this.advanSearch.storeLocationID = this.storeLocationList[0].storeLocationID;
          }
        }, (error) => {
          console.log(error);
        }
      );
    }
  }

  GetLotteryPackInventoryType() {
    this.setupService.getData('LotteryPackInventoryType/list').subscribe(
      (response) => {
        this.lotteryPackInventoryList = response;
      }, (error) => {
        console.log(error);
      }
    );
  }

  dateChange(event) {
    if (event) {
      this.advanSearch.invDate = event.formatedDate;
    }
  }

  onAdvanSearch() {
    if (this.advanSearch.storeLocationID == null) {
      this.toastr.warning('Store Selection Required');
      return;
    }
    if (this.advanSearch.lotteryPackInventoryTypeID == null) {
      this.toastr.warning('Inventory Type Selection Required');
      return;
    }
    this.closeButtonName = this.advanSearch.lotteryPackInventoryTypeID === 1 ? 'Day' : 'Shift';
    this.spinner.show();
    this.isShowScanMode = false;
    this.setupService.getDataString('CompanyLotteryPack/CheckLotteryInventoryClose?storeLocationID=' +
      this.advanSearch.storeLocationID + '&invDate=' + this.advanSearch.invDate + '&inventoryTypeID=' +
      this.advanSearch.lotteryPackInventoryTypeID + '&shiftValue=' + this.advanSearch.lotteryPackInventoryTypeID).subscribe((response) => {
        this.spinner.hide();
        if (response === 'sucess') {
          this.isLotteryClosed = true;
          this.getRowData();
          this.getLotterySalesDetails();
          this.closeDayMsg = null;
          this.isShowScanMode = true;
        } else {
          this.isLotteryClosed = false;
          this.rowData = [];
          this.closeDayMsg = response;
        }
      }, (error) => {
        this.spinner.hide();
        if (error && error.error && error.error.text === 'sucess') {
          this.getRowData();
          this.getLotterySalesDetails();
          this.isLotteryClosed = true;
          this.closeDayMsg = null;
        } else {
          this.rowData = [];
          this.isLotteryClosed = false;
          this.closeDayMsg = error.error.text;
        }
      });
  }

  getRowData() {
    this.isScanMode = false;
    this.spinner.show();
    this.setupService.getData('CompanyLotteryPack/geLotteryPackInventory?storeLocationID=' + this.advanSearch.storeLocationID
      + '&invDate=' + this.advanSearch.invDate
      + '&inventoryTypeID=' + this.advanSearch.lotteryPackInventoryTypeID + '&shiftValue=' + this.advanSearch.lotteryPackInventoryTypeID
      + '&UserRole=' + this.userInfo.roleName).subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
        this.rowData.map((x) => {
          x.aging = (new Date(this.currentDate).getTime() - new Date(x.activationDateTime).getTime()) / (1000 * 3600 * 24);
        });
        this.totalSoldQty = this.rowData.reduce((accumulator, i) => accumulator + i.totalQtySold, 0);
        this.totalAmount = this.rowData.reduce((accumulator, i) => accumulator + i.amount, 0);
        this.NetLotteryAmt = this.totalAmount;
        if (!this.advanSearch.storeLocationID) {
          this.advanSearch.storeLocationID = null;
        }
        if (!this.advanSearch.lotteryPackInventoryTypeID) {
          this.advanSearch.lotteryPackInventoryTypeID = null;
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  forceOpen() {
    this.setupService.updateData(`CompanyLotteryPack/ForceOpenLottery?lotterySalesID=` + this.lotterySalesID, {}).subscribe(result => {
      this.spinner.hide();
      if (result && result.statusCode === 400) {
        if (result && result.result && result.result.validationErrors[0]) {
          this.toastr.error(result.result.validationErrors[0].errorMessage);
        }
        return 0;
      }
      if (result === '1') {
        this.onAdvanSearch();
        this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
      } else {
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
    });
  }
  getLotterySalesDetails() {
    this.commonService.isSubmmitedValue = false;
    this.setupService.getData('CompanyLotteryPack/GetLotterySales?storeLocationID=' + this.advanSearch.storeLocationID
      + '&invDate=' + this.advanSearch.invDate + '&inventoryTypeID=' + this.advanSearch.lotteryPackInventoryTypeID
      + '&CompanyID=' + this.userInfo.companyId).subscribe((response) => {

        if (response && response.length > 0) {
          this.lotterySalesID = response[0].lotterySalesID;
          this.isSubmmitedValue = response[0].isSubmitted;
          if (!this.isSubmmitedValue) {
            this.commonService.isSubmmitedValue = true;
          }
        }
      }, (error) => {
        console.log(error);
      });
  }

  closeAllShift() {
    this.spinner.show();
    const postData = {
      storeLocationID: this.advanSearch.storeLocationID,
      invDate: this.advanSearch.invDate,
      roleName: this.userInfo.roleName,
      userName: this.userInfo.userName,
      inventoryTypeID: this.advanSearch.lotteryPackInventoryTypeID,
      lotteryScratchSaleAmount: this.totalAmount,
      lotteryOnlineSaleAmount: this.advanSearch.lotteryOnlineSaleAmount,
      lotteryPayOutAmount: this.advanSearch.lotteryPayOutAmount,
      lotteryScartchOffPayout: this.advanSearch.lotteryScartchOffPayout,
      lotteryOnlinePayout: this.advanSearch.lotteryOnlinePayout
    };

    this.setupService.postDataString('CompanyLotteryPack/CloseAllShift?storeLocationID=' + postData.storeLocationID +
      '&invDate=' + postData.invDate + '&roleName=' + postData.roleName + '&inventoryTypeID=' +
      postData.inventoryTypeID + '&username=' + postData.userName + '&lotteryScratchSaleAmount=' +
      postData.lotteryScratchSaleAmount + '&lotteryOnlineSaleAmount=' + postData.lotteryOnlineSaleAmount +
      '&lotteryPayOutAmount=' + postData.lotteryPayOutAmount + '&lotteryScartchOffPayout=' + postData.lotteryScartchOffPayout
      + '&lotteryOnlinePayout=' + postData.lotteryOnlinePayout, '').subscribe((response) => {
        this.spinner.hide();
        if (response === 'success') {
          this.isLotteryClosed = true;
          this.closeDayMsg = null;
          this.toastr.success('Record added successfully', 'Success');
          this.getLotterySalesDetails();
          this.getRowData();
        } else {
          this.toastr.error('Failed to add record', 'Error');
        }
      }, (error) => {
        this.spinner.hide();
        if (error && error.error && error.error.text === 'success') {
          this.isLotteryClosed = true;
          this.closeDayMsg = null;
          this.toastr.success('Record added successfully', 'Success');
        } else {
          this.toastr.error('Failed to add record', 'Error');
        }
      });
  }

  calculateNetLotteryAmt() {
    this.NetLotteryAmt = Number(this.advanSearch.lotteryPayOutAmount) +
      Number(this.advanSearch.lotteryOnlineSaleAmount) + Number(this.totalAmount);
    this.NetLotteryAmt = Number(this.NetLotteryAmt.toFixed(2));
  }

  onPayoutChange() {
    let oldlotteryPayout = this.advanSearch.lotteryPayOutAmount;
    this.advanSearch.lotteryPayOutAmount = Number(this.advanSearch.lotteryOnlinePayout) + Number(this.advanSearch.lotteryScartchOffPayout);
    this.NetLotteryAmt = this.NetLotteryAmt - oldlotteryPayout + this.advanSearch.lotteryPayOutAmount;
    this.NetLotteryAmt = Number(this.NetLotteryAmt.toFixed(2));
  }

  cellValueChanged(params) {
    if (params.data.ticketNo === undefined) {
      return;
    }
    if (!this.isScanMode) {
      this.SaveLotteryHistoryandSale(params);
    } else if (this.isScanMode) {
      this.scanBarcodeMode();
    }
  }

  SaveLotteryHistoryandSale(params) {
    var rowNode;
    if (params.node) {
      rowNode = this.gridApi.getRowNode(params.node.id);
    } else {
      rowNode = this.gridApi.getRowNode(params.id);
    }
    if (params.data.isLotteryStartingFromZero === null || params.data.isReverse === null || params.data.isLotteryStartingFromZero === undefined || params.data.isReverse === undefined) {
      this.toastr.warning('Please set lottery settings in store settings');
      return;
    }
    if (params.colDef && (params.colDef.field).toString() === 'isSold'.toString()) {
      if (params.data.isSold) {
        const ent = (params.data.packValue / params.data.ticketValue);
        if (!params.data.isLotteryStartingFromZero) {
          params.data.ticketNo = ent;
        } else {
          params.data.ticketNo = ent - 1;
        }
      } else {
        params.data.ticketNo = 0;
      }

    } else {
      if (!(params.data.ticketNo >= params.data.openingTicketNo)) {
        params.data.ticketNo = 0;
        rowNode.setData(params.data);
        this.toastr.warning('End ticket number must be greater than opening ticket number');
        return;
      }
      if (!params.data.isLotteryStartingFromZero) {
        if (!(params.data.ticketNo <= (params.data.packValue / params.data.ticketValue))) {
          params.data.ticketNo = 0;
          // this.getRowDataNode();
          rowNode.setData(params.data);
          this.toastr.warning('Ending ticket number should not greater than ' +
            Number(params.data.packValue / params.data.ticketValue));
          return;
        }
      } else {
        if (!(params.data.ticketNo < (params.data.packValue / params.data.ticketValue))) {
          params.data.ticketNo = 0;
          rowNode.setData(params.data);
          this.toastr.warning('Ending ticket number should not greater than ' +
            Number(params.data.packValue / params.data.ticketValue));
          return;
        }
      }
    }
    let calculatedData: any = this.calculateEndTicketNoAndSoldQty(Number(params.data.noOfTickets), Number(params.data.openingTicketNo), Number(params.data.ticketNo), params.data.isLotteryStartingFromZero, params.data.isReverse, params.data.isSold);
    params.data.totalQtySold = Number(calculatedData.soldQty);
    params.data.ticketNo = Number(calculatedData.endTicketNo);
    params.data.amount = Number(params.data.totalQtySold) * Number(params.data.ticketValue);
    // if (params.data.isLotteryStartingFromZero && params.data.isSold) {
    //   params.data.totalQtySold = Number(params.data.ticketNo - params.data.openingTicketNo) + 1;
    //   // params.data.totalQtySold = Number(params.data.ticketNo - params.data.openingTicketNo);
    //   params.data.amount = Number(params.data.totalQtySold) * Number(params.data.ticketValue);
    // } else {
    //   Number(params.data.ticketNo) === 0 ? params.data.totalQtySold = 0 :
    //     params.data.totalQtySold = Number(params.data.ticketNo - params.data.openingTicketNo);
    //   params.data.amount = Number(params.data.totalQtySold) * Number(params.data.ticketValue);
    // }
    const postData = {
      storeLocationID: this.advanSearch.storeLocationID,
      invtoryTypeID: this.advanSearch.lotteryPackInventoryTypeID,
      lotteryPackID: params.data.lotteryPackID,
      lotteryScratchSaleAmount: this.totalAmount,
      lotteryOnlineSaleAmount: this.advanSearch.lotteryOnlineSaleAmount,
      lotteryPayOutAmount: this.advanSearch.lotteryOnlineSaleAmount,
      businessDate: this.advanSearch.invDate,
      IsSubmitted: this.isSubmmitedValue,
      TicketNo: params.data.ticketNo,
      OpenTicketNo: params.data.openingTicketNo,
      EndTicketNo: params.data.ticketNo,
      IsSold: params.data.isSold,
      IsLotteryStartingFromZero: params.data.isLotteryStartingFromZero,
      companyID: this.userInfo.companyId,
      username: this.userInfo.userName,
    };

    this.spinner.show();
    this.setupService.postDataString('CompanyLotteryPack/SaveLotteryHistoryandSale?storeLocationID=' +
      postData.storeLocationID + '&invtoryTypeID=' + postData.invtoryTypeID + '&lotteryPackID=' + postData.lotteryPackID +
      '&lotteryScratchSaleAmount=' + postData.lotteryScratchSaleAmount + '&lotteryOnlineSaleAmount=' + postData.lotteryOnlineSaleAmount +
      '&lotteryPayOutAmount=' + postData.lotteryPayOutAmount + '&businessDate=' +
      postData.businessDate + '&IsSubmitted=' + postData.IsSubmitted +
      '&TicketNo=' + postData.TicketNo + '&OpenTicketNo=' + postData.OpenTicketNo + '&EndTicketNo=' +
      postData.EndTicketNo + '&IsSold=' + postData.IsSold + '&IsLotteryStartingFromZero=' +
      postData.IsLotteryStartingFromZero + '&companyID=' + postData.companyID + '&username=' +
      postData.username, '').subscribe((response) => {
        this.spinner.hide();
        if (response === 'success') {
          this.toastr.success('Record updated successfully', 'Success');
          rowNode.setData(params.data);
          this.totalSoldQty = this.rowData.reduce((accumulator, i) => accumulator + i.totalQtySold, 0);
          this.totalAmount = this.rowData.reduce((accumulator, i) => accumulator + i.amount, 0);
          this.NetLotteryAmt = this.totalAmount;
          setTimeout(() => {
            this.barcodeInput.nativeElement.focus();
          });
          this.gridApi.stopEditing(true);
        } else {
          params.data.isSold = !params.data.isSold;
          rowNode.setData(params.data);
          this.toastr.error('Failed to update record', 'Error');
        }
      }, (error) => {
        params.data.isSold = !params.data.isSold;
        rowNode.setData(params.data);
        this.toastr.error('Failed to update record', 'Error');
        this.spinner.hide();
        console.log(error);
      });
  }

  getRowDataNode() {
    const arr = [];
    this.gridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.rowData = arr;
  }

  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  scanBarcodeMode() {
    console.log("Barcode Scanned " + this.UPCBarCode);
    if (this.UPCBarCode === null) return;
    let splittedBarcode = this.utilityService.splitLotteryBarcodeByLength(this.UPCBarCode.toString());
    const lotteryGameNo = splittedBarcode.lotteryGameNo;
    const packNo = splittedBarcode.packNo;
    let selectedNode: any = "";
    this.gridApi.forEachNode((node, index) => {
      if (node.data.gameNo === Number(lotteryGameNo) && node.data.packNumber === packNo) selectedNode = node;
    });
    // const objIndex = this.rowData.findIndex((obj => {
    //   return obj.gameNo === Number(lotteryGameNo) && obj.packNumber === packNo
    // }));
    this.UPCBarCode = null;
    if (selectedNode !== "") {
      // Update object's name property.
      // this.rowData[selectedNode.rowIndex].ticketNo = splittedBarcode.ticketDigits;
      selectedNode.data.ticketNo = splittedBarcode.ticketDigits;
      this.getStartEditingCell('ticketNo', selectedNode.rowIndex);
      // const params = {};
      // params['data'] = this.rowData[objIndex];
      this.SaveLotteryHistoryandSale(selectedNode);
    } else {
      this.toastr.error('Invalid Barcode', 'Error');
    }
  }

  exportToPrint() {
    this.colWidths = [35, 30, 55, 30, 30, 35, 50, 40, 40, 25, 35, 35];
    this.body.push([{ text: 'Bin/Slot' }, { text: 'Game No' }, { text: 'Game' },
    { text: 'Pack Value' }, { text: 'Ticket Value' }, { text: 'Pack No' },
    { text: 'Activation Date' }, { text: 'Opening Ticket No' }, { text: 'End Ticket No' },
    { text: 'All Sold' }, { text: 'Total Qty Sold' }, { text: 'Amount' },
    ]);

    for (const key in this.rowData) {
      if (this.rowData.hasOwnProperty(key)) {
        const data = this.rowData[key];
        const fila = new Array();
        fila.push({ text: data.binNo ? data.binNo.toString() : '', border: [false, false, false, false] });
        fila.push({ text: data.gameNo.toString(), border: [false, false, false, false] });
        fila.push({ text: data.gameName.toString(), border: [false, false, false, false] });
        fila.push({ text: data.packNumber.toString(), border: [false, false, false, false] });
        fila.push({ text: data.packValue.toString(), border: [false, false, false, false] });
        fila.push({ text: data.ticketValue.toString(), border: [false, false, false, false] });
        fila.push({ text: this.utilityService.formatDate(data.activationDateTime).toString(), border: [false, false, false, false] });
        fila.push({ text: data.openingTicketNo.toString(), border: [false, false, false, false] });
        fila.push({ text: data.currentTicketNo.toString(), border: [false, false, false, false] });
        fila.push({ text: data.isSold.toString(), border: [false, false, false, false] });
        fila.push({
          text: data.totalQtySold,
          border: [false, false, false, false], alignment: 'right'
        });
        fila.push({
          text: this.utilityService.formatCurrency(data.amount),
          border: [false, false, false, false], alignment: 'right'
        });
        this.body.push(fila);
      }
    }
    // tslint:disable-next-line:max-line-length
    const storeLocation = this.storeLocationList.filter((i) => { if (i.storeLocationID === this.advanSearch.storeLocationID) { return i; } });
    // tslint:disable-next-line:max-line-length
    const invType = this.lotteryPackInventoryList.filter((i) => { if (i.lotteryPackInventoryTypeID === this.advanSearch.lotteryPackInventoryTypeID) { return i; } });
    let pdfGenerator = this.pdfGenrateService.PDFGenrateByLotteryInventory('Lottery Inventory', this.colWidths,
      this.body, this.advanSearch.invDate, storeLocation[0].storeName, invType[0].lotteryPackInventoryTypeName);
    pdfGenerator.getBase64((data) => {
      printJS({ printable: data, type: 'pdf', base64: true })
    });
    this.body = this.colWidths = [];
  }

  GoToCloseShift() {
    const data = this.closeDayMsg.split(',');
    if (data) {
      this.advanSearch.invDate = data[1];
      this.onAdvanSearch();
    }
  }

  calculateEndTicketNoAndSoldQty(totalQty: any, startTicketNo: any, endTicketNo: any, startWithZero: any, isReverseOrder: boolean, isAllSold: any) {
    if (!isAllSold && endTicketNo === "") {
      return "";
    }
    let soldQty: any;
    if (isAllSold) {
      if (!startWithZero && !isReverseOrder) {
        endTicketNo = totalQty;
      } else if (startWithZero && !isReverseOrder) {
        endTicketNo = totalQty - 1;
      } else if (!startWithZero && isReverseOrder) {
        endTicketNo = 1;
      } else if (startWithZero && isReverseOrder) {
        endTicketNo = 0;
      }
    }
    if (!startWithZero && !isReverseOrder) {
      soldQty = endTicketNo - startTicketNo;
    } else if (startWithZero && !isReverseOrder) {
      soldQty = endTicketNo - startTicketNo;
    } else if (!startWithZero && isReverseOrder) {
      soldQty = startTicketNo - endTicketNo;
    } else if (startWithZero && isReverseOrder) {
      soldQty = startTicketNo - endTicketNo;
    }
    if (isAllSold) {
      ++soldQty;
    }
    let response = {
      soldQty: soldQty,
      endTicketNo: endTicketNo
    }
    return response;
  }
}
