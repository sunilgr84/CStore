import { Component, OnInit, Input, EventEmitter, Output, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { ConstantService } from "@shared/services/constant/constant.service";
import { GridService } from "@shared/services/grid/grid.service";
import { EditableGridService } from "@shared/services/editableGrid/editable-grid.service";
import { ToastrService } from "ngx-toastr";
import { SetupService } from "@shared/services/setupService/setup-service";
import { NgxSpinnerService } from "ngx-spinner";
import { CommonService } from "@shared/services/commmon/common.service";
import * as _ from "lodash";
import * as moment from "moment";
import { PDFGenrateService } from "@shared/services/pdf-genrate/pdf-genrate.service";
import { MessageService } from "@shared/services/commmon/message-Service";
import { FormBuilder, Validators } from "@angular/forms";
import { NgbModal, NgbPanelChangeEvent } from "@ng-bootstrap/ng-bootstrap";
import { forkJoin } from "rxjs";
import { ConfirmationDialogService } from "@shared/component/confirmation-dialog/confirmation-dialog.service";
import { UtilityService } from "@shared/services/utility/utility.service";
import { saveAs } from 'file-saver';

@Component({
  selector: "app-day-details",
  templateUrl: "./day-details.component.html",
  styleUrls: ["./day-details.component.scss"],
})
export class DayDetailsComponent implements OnInit {
  @Input() storeLocationID: any;
  @Input() shiftWiseValue: any;
  @Input() movementHeaderID: any;
  @Input() movementHeaderDetails: any;
  @Input() dayReconData: any;
  @Output() backToDayReconList: EventEmitter<any> = new EventEmitter();

  searchPurchases = "";
  searchFuelPurchases = "";
  lotteryAmount = 0;
  lottoAmount = 0;
  lottoPayoutAmount = 0;
  lotteryDepositAmount = 0;
  lotteryBankDeposit = 0;
  isLotteryBankAvailable = false;
  cashAtHand = 0;
  isMOPFuelLoaded = false;
  isPurchasesLoaded = false;
  selectedItems: any;
  selectedFuelItems: any;
  gridOptions: any;
  rowData: any;
  networkCardsRowData;
  networkGridOptions: any;
  totalNetworkSales: any = 0;
  totalNetworkCount: any = 0;
  categoryCardsRowData;
  categoryGridOptions: any;
  totalCategorySales: any = 0;
  totalCategoryCount: any = 0;
  gridApi: any;
  newRowAdded: boolean;
  tempId: any;
  editableGridOptions: any;
  editableRowData: any;

  atmGridOptions: any;
  atmRowData: any;
  atmGridApi: any;
  newATMAdded: any = false;

  bankGridOptions: any;
  bankGridApi: any;
  bankGridColumnApi: any;

  totalMopAmount = 0;
  totalMopAmountForShortOver = 0;
  deptDetailgridOptions: any;
  deptDetailrowData: any;
  totalFuelGradeSalesVolume: any = 0;
  totalFuelGradeSalesAmount: any = 0;
  deptGridApi: any;
  shortOver = 0;
  bankDepositEditableGridOptions: any;
  atmSubmitted = false;
  atmInitialData = [];
  updateATMFiles: any[] = [];
  bankDepositGridCols = [];
  bankDepositGridData = [];
  deprttotalAmount = 0;
  // add new code
  saleTaxObj: any;
  totalPosSales = 0;
  totalBankDeposit = 0;
  totalBankDepositFDispaly = 0;
  depositGridApi: any;
  mopDepositArr: any[];
  checkPos: any[];
  // initialBankDeposits: any = [];
  availableBanks: any = [];
  promotionsRowData: any[] = [];
  promotionsGridOptions: any;
  totalDiscount: any = 0.0;
  totalSalesAmount: any = 0.0;
  totalSalesQty: any = 0.0;
  transcationCount: any = 0;

  gasDetailGridAPI: any;
  mopGridAPI: any;
  bankDepositGridAPI: any;

  purchasesRowData: any = [];
  purchasesGridOptions: any;
  purchasesGridAPI: any;
  totalTransactions = 0.0;
  totalIncome = 0.0;

  payOutFromPOS: any = 0.0;
  refundsAmount: any = 0.0;
  reconciledPayOut: any = 0.0;
  unreconciledPay: any = 0.0;
  payInFromPOS: any = 0.0;
  reconciledPayIn: any = 0.0;
  payOutCheck: any = 0.0;
  payInCheck: any = 0.0;
  totalPurchaseAmount: any = 0.0;

  //overlay grid
  addContainer: any = "side-container-close";

  chartOfAccountCategories: any = [];
  vendorList: any = [];
  userInfo = this.constantsService.getUserInfo();
  paymentSourceList: any = [];
  filteredMOPList: any = [];
  showAddPurchases: any = false;
  showAddIncExp: any = false;
  addPurchasesSubmitted = false;
  storeBankID: any;
  purchaseInvDate: any;
  invoiceImageFile: any;
  invoiceImageURL: any;
  storeBankIDSrcIncome: any;
  showSaveIncomeCheckNum: any = false;
  selectedChartOfCatc: any = "";

  purchaseType: any;//addPurchase||importPurchase
  showAddPurchase: any;
  showImportPurchase: any;
  selectedDateRange: any;
  importPurchasesRowData: any;
  importPurchasesGridOptions: any;
  importPurchasesGridAPI: any;

  importFuelPurchasesRowData: any;
  importFuelPurchasesGridOptions: any;
  importFuelPurchasesGridAPI: any;

  @ViewChild('viewfilemodal') viewFileModal: TemplateRef<any>;

  addPurchasesForm = this.fb.group({
    vendorid: [null, Validators.required],
    invoiceno: [null, Validators.required],
    invoiceAmount: [
      null,
      [Validators.required, Validators.pattern(/^\d{1,6}(\.\d{1,2})?$/)],
    ],
    invoicedate: [null, Validators.required],
    paymentSourceID: [null, Validators.required],
    methodOfPaymentId: [null, Validators.required],
    invoicePaymentAmount: [
      null,
      [Validators.required, Validators.pattern(/^\d{1,6}(\.\d{1,2})?$/)],
    ],
    memo: [null],
    sameAsInv: [true],
  });

  transactionForm = this.fb.group({
    ATMTransactionID: [0],
    BeginAmount: [null, Validators.required],
    NoOfTransactions: [null, Validators.required],
    InputAmount: [null, Validators.required],
    DispensedAmount: [0.0, Validators.required],
    EndAmount: [null, Validators.required],
  });

  importPurchasesForm = this.fb.group({
    vendorid: [null, Validators.required],
    fromDate: moment().format('MM-DD-YYYY'),
    toDate: moment().format('MM-DD-YYYY')
  });
  fileName: any;
  // convenience getter for easy access to form fields
  get purchasesForm() {
    return this.addPurchasesForm.controls;
  }

  get transactionF() {
    return this.transactionForm.controls;
  }
  addIncomeFormSubmitted: any = false;
  incomeDocumentFiles: any;
  incomeDocumentName: any = "";
  incomeDocumentType: any = "";
  isExpense: boolean = false;

  addIncomeForm = this.fb.group({
    ChartOfAccountCategoryID: [null],
    Amount: [null, Validators.required],
    Notes: [null],
    VendorID: [null, Validators.required],
    paymentSourceID: [null, Validators.required],
    methodOfPaymentId: [null, Validators.required],
    CheckNumber: [null]
  });
  get incomeForm() {
    return this.addIncomeForm.controls;
  }

  constructor(
    private gridService: GridService,
    private constantsService: ConstantService,
    private setupService: SetupService,
    private editableGrid: EditableGridService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService,
    private pdfGenrateService: PDFGenrateService,
    private messageService: MessageService,
    private fb: FormBuilder,
    private modal: NgbModal,
    private confirmationDialogService: ConfirmationDialogService,
    private utilityService: UtilityService
  ) {
    this.gridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.dayReconGasDetailGrid
    );
    this.promotionsGridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.dayReconPromotionsDetailGrid
    );
    this.promotionsGridOptions.headerHeight = 40;
    this.editableGridOptions = this.editableGrid.getGridOption(
      this.constantsService.editableGridConfig.gridTypes.dayReconMOPGrid
    );
    this.atmGridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.atmGrid);
    this.bankGridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.bankGrid);
    this.deptDetailgridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.dayReconGrid
    );
    this.bankDepositEditableGridOptions = this.editableGrid.getGridOption(
      this.constantsService.editableGridConfig.gridTypes.bankDepositGrid
    );
    this.purchasesGridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.purchasesGrid
    );
    this.networkGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.networkCardGrid);
    this.categoryGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.categoryCardGrid);
    this.purchasesGridOptions.rowHeight = 45;
    this.importPurchasesGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.importPurchasesGrid);
    this.importFuelPurchasesGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.importFuelPurchasesGrid);
  }

  ngOnInit() {
    const dateRange = { fDate: moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'), tDate: moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
    setTimeout(() => {
      this.messageService.sendMessage("expanded_collaps");
    });
    this.getPurchases();
    this.getMOPList();
    this.saleTaxObj = this.dayReconData.saleTaxObj;
    this.getPromotionsList();
    // this.getATMTransactions();
    this.purchaseType = "addPurchase";
    this.showAddPurchase = false;
    this.showImportPurchase = true;
    this.getNetworkCardDetails();
    this.getCategoryCardDetails();
    this.getShiftAtmTransactions();
  }

  onGridReady(params) {
    this.gasDetailGridAPI = params.api;
    params.api.sizeColumnsToFit();
  }

  onNetworkGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  onCategoryGridReady(params) {
    params.api.sizeColumnsToFit();
  }

  onPromotionsGridReady(params) {
    this.bankDepositGridAPI = params.api;
    this.bankDepositGridAPI.gridOptionsWrapper.gridOptions.groupRowInnerRenderer = function (
      params
    ) {
      return params.node.allLeafChildren[0].data.departmentDescription;
    };
    this.bankDepositGridAPI.redrawRows();
    setTimeout(() => {
      this.bankDepositGridAPI.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
    }, 1);
    // this.bankDepositGridAPI.gridOptionsWrapper.gridOptions.groupDefaultExpanded=-1;
    params.api.sizeColumnsToFit();
    this.bankDepositGridAPI.expandAll();
  }

  deptOnGridReady(params) {
    this.deptGridApi = params.api;
    if (this.deptDetailrowData && this.deptDetailrowData.length > 0) {
      this.deptGridApi.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
      this.deptGridApi.sizeColumnsToFit();
      this.deptGridApi.expandAll();
    }
  }
  editableOnGridReady(params: any) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  atmOnGridReady(params: any) {
    this.atmGridApi = params.api;
    params.api.sizeColumnsToFit();
    if (this.atmRowData && this.atmRowData.length > 0) {
      this.atmGridApi.hideOverlay();
    } else {
      this.atmGridApi.showNoRowsOverlay();
    }
  }

  bankOnGridReady(params: any) {
    this.bankGridApi = params.api;
    this.bankGridColumnApi = params.columnApi;
    this.generateBankGridCol(this.availableBanks);
    params.api.sizeColumnsToFit();
  }

  onPurchasesGridReady(params) {
    this.purchasesGridAPI = params.api;
    params.api.sizeColumnsToFit();
  }

  onImportPurchasesGridReady(params) {
    this.importPurchasesGridAPI = params.api;
  }

  onImportFuelPurchasesGridReady(params) {
    this.importFuelPurchasesGridAPI = params.api;
  }

  getMOPFuelDetails(response) {
    this.isMOPFuelLoaded = false;
    // this.spinner.show();
    // .subscribe(
    //   (response) => {
    // this.spinner.hide();
    this.rowData = response[0];
    if (this.gasDetailGridAPI)
      this.gasDetailGridAPI.sizeColumnsToFit();
    this.editableRowData = response[1];
    if (this.gridApi)
      this.gridApi.sizeColumnsToFit();
    if (this.rowData && this.rowData.length > 0) {
      this.totalFuelGradeSalesAmount = this.rowData.reduce(
        (acc, i) => acc + i.fuelGradeSalesAmount,
        0
      );
      this.totalFuelGradeSalesVolume = this.rowData.reduce(
        (acc, i) => acc + i.fuelGradeSalesVolume,
        0
      );
      this.setSumSalePOS();
    }
    if (this.editableRowData.length > 0) {
      this.totalMopAmount = this.editableRowData.reduce(
        (acc, i) => acc + i.mopAmount,
        0
      );
      let filteredMops = _.filter(this.editableRowData, data => !(data.mopName.toLowerCase() === "payins" || data.mopName.toLowerCase() === "discounts" || data.mopName.toLowerCase() === "refunds"));
      this.totalMopAmountForShortOver = filteredMops.reduce((acc, i) => acc + i.mopAmount, 0);
      // this.shortOver = Number(this.totalMopAmount) - Number(this.dayReconData.totalPosSales);
      this.setSumSalePOS();
      this.mopDepositArr = _.filter(this.editableRowData, function (x) {
        return (
          x.mopName.trim() === "CASH" || x.mopName.trim() === "CHECK"
        );
      });
      this.checkPos = _.filter(this.editableRowData, function (o) {
        return o.mopName.trim() === "CHECK";
      });
      this.isMOPFuelLoaded = true;
    }
    this.deptDetailrowData = [];
    this.deptDetailrowData = response[2].map((x) => {
      if (x.departmentTypeID && x.departmentTypeID === 5)
        this.lotteryAmount += x.totalAmount;
      if (x.departmentTypeID && x.departmentTypeID === 7)
        this.lottoAmount += x.totalAmount;
      if (x.departmentTypeID && x.departmentTypeID === 26)
        this.lottoPayoutAmount += x.totalAmount;
      return {
        ...x,
        typeOfSell: "Type of Sale: " + x.departmentTypeName,
      };
    });
    if (this.lottoPayoutAmount < 0) this.lottoPayoutAmount = this.lottoPayoutAmount * -1;
    this.lotteryDepositAmount = this.lotteryAmount + this.lottoAmount - this.lottoPayoutAmount;
    const sumDe = this.deptDetailrowData.reduce(
      (acc, i) => acc + i.totalAmount,
      0
    );
    this.deprttotalAmount = Number(sumDe.toFixed(2));
    this.setSumSalePOS();
    //   },
    //   (error) => {
    //     this.spinner.hide();
    //     console.log(error);
    //   }
    // );
  }

  getMOPList() {
    this.setupService.getData("StoreLocationMOP/getMopDetail/" + this.storeLocationID + "/" + this.movementHeaderID)
      .subscribe((response) => {
        this.commonService.mopDetailList = response;
      }, (error) => {
        console.log(error);
      });
  }

  getPromotionsList() {
    this.setupService
      .getData(
        "PromotionReport/PromotionsByMovementHeader?MovementHeaderId=" +
        this.movementHeaderID
      )
      .subscribe(
        (response) => {
          if (response.data) {
            this.totalDiscount = response.data.totalDiscount;
            this.totalSalesAmount = response.data.totalSalesAmount;
            this.totalSalesQty = response.data.totalSalesQty;
            this.transcationCount = response.data.transcationCount;
            this.promotionsRowData = response.data.details;
            // this.bankDepositGridAPI.sizeColumnsToFit();
          }
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getMOPDetails() {
    this.spinner.show();
    this.setupService.getData("MovementHeader/GetMopDetailDayrecon?storeLocationID=" + this.storeLocationID +
      "&movementHeaderID=" + this.movementHeaderID + "&shiftwiseValue=" + this.shiftWiseValue.value).subscribe((response) => {
        this.spinner.hide();
        this.editableRowData = response;
        if (this.editableRowData.length > 0) {
          this.totalMopAmount = this.editableRowData.reduce((acc, i) => acc + i.mopAmount, 0);
          let filteredMops = _.filter(this.editableRowData, data => !(data.mopName.toLowerCase() === "payins" || data.mopName.toLowerCase() === "discounts" || data.mopName.toLowerCase() === "refunds"));
          this.totalMopAmountForShortOver = filteredMops.reduce((acc, i) => acc + i.mopAmount, 0);
          const saleTax = (this.shortOver =
            Number(this.totalMopAmountForShortOver) -
            Number(
              this.saleTaxObj.totalAmount +
              this.totalFuelGradeSalesAmount +
              this.deprttotalAmount
            ) - Number(this.refundsAmount));

          this.mopDepositArr = _.filter(this.editableRowData, function (x) {
            return (
              x.mopName.trim() === "CASH" || x.mopName.trim() === "CHECK"
            );
          });
        }
        this.gridApi.sizeColumnsToFit();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  createNewRowData() {
    this.tempId = this.gridApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      isSaveRequired: true,
      mopName: "",
      mopCount: null,
      mopAmount: null,
      mopDetailID: 0,
      movementHeaderID: 0,
      storeLocationMOPID: 0,
      isUserAdded: true,
      storeLocationID: 0,
      storeMOPNo: 0,
    };
    return newData;
  }
  addNew() {
    this.gridApi.stopEditing();
    if (this.newRowAdded) {
      this.toastr.error(
        "Please save existing data first before adding another!"
      );
      this.getStartEditingCell("mopName", 0);
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridApi.updateRowData({
      add: [newItem],
      addIndex: 0,
    });
    let newRowId = this.gridApi.getDisplayedRowCount() - 1;
    let newNodeIndex = 0;
    this.gridApi.forEachNode(function (rowNode) {
      if (rowNode.data.id === newRowId) {
        newNodeIndex = rowNode.rowIndex;
      }
    });
    this.getStartEditingCell("mopName", newNodeIndex);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey,
    });
  }
  getRowData(gridApi) {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    gridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    return arr;
  }

  editOrSaveATM() {
    this.atmSubmitted = true;
    if (!this.transactionForm.valid)
      return true;
    const postData = {
      "ATMTransactionID": this.transactionF.ATMTransactionID.value,
      "StoreLocationID": this.storeLocationID,
      "BeginAmount": this.transactionF.BeginAmount.value,
      "NoOfTransactions": this.transactionF.NoOfTransactions.value,
      "InputAmount": this.transactionF.InputAmount.value,
      "DispensedAmount": this.transactionF.DispensedAmount.value,
      "EndAmount": this.transactionF.EndAmount.value,
      "transactionDate": moment(this.dayReconData.selectedDate).format("MM-DD-YYYY"),
      "createdBy": this.userInfo.userName,
      "createdDateTime": moment().format('YYYY-MM-DD'),
      "lastModifiedBy": this.userInfo.userName,
      "lastModifiedDateTime": moment().format('YYYY-MM-DD')
    }
    if (!this.transactionF.ATMTransactionID.value) {
      this.spinner.show();
      this.setupService.postData("ATMTransaction", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.atmTransactionID > 0) {
            this.toastr.success(
              this.constantsService.infoMessages.addedRecord,
              this.constantsService.infoMessages.success
            );
            this.getATMTransactions();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.addRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    } else {
      this.spinner.show();
      this.setupService.updateData("ATMTransaction", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getATMTransactions();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    }
  }

  editOrSave(params, isEdit) {
    if (params.data.mopName === "" || params.data.mopName === null) {
      this.toastr.warning("MOP Name is required");
      this.getStartEditingCell("mopName", params.rowIndex);
      return;
    }
    if (params.data.mopCount === "" || params.data.mopCount === null) {
      this.toastr.warning("MOP Count is required");
      this.getStartEditingCell("mopCount", params.rowIndex);
      return;
    }
    if (params.data.mopAmount === "" || params.data.mopAmount === null) {
      this.toastr.warning("MOP Amount is required");
      this.getStartEditingCell("mopAmount", params.rowIndex);
      return;
    }
    let selectedMOPName: any;
    this.commonService.mopDetailList.map((i) => {
      if (i.mopName === params.data.mopName) {
        selectedMOPName = i;
      }
    });
    const postData = {
      mopDetailID: params.data.mopDetailID,
      movementHeaderID: this.movementHeaderID,
      storeLocationMOPID: selectedMOPName
        ? selectedMOPName.storeLocationMOPID
        : params.data.storeLocationMOPID,
      mopCount: params.data.mopCount,
      mopAmount: params.data.mopAmount,
      isUserAdded: isEdit ? params.data.isUserAdded : 1,
      //  params.data.isUserAdded,
      storeLocationID: this.storeLocationID,
      storeMOPNo: selectedMOPName
        ? selectedMOPName.storeMOPNo
        : params.data.storeMOPNo,
      mopName: selectedMOPName ? selectedMOPName.mopName : params.data.mopName,
    };
    if (params.data.mopDetailID === 0) {
      this.spinner.show();
      this.setupService.postData("MOPDetail", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.mopDetailID > 0) {
            this.toastr.success(
              this.constantsService.infoMessages.addedRecord,
              this.constantsService.infoMessages.success
            );
            this.newRowAdded = false;
            this.getMOPDetails();
            this.getMOPList();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.addRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    } else {
      this.spinner.show();
      this.setupService.updateData("MOPDetail", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.newRowAdded = false;
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getMOPDetails();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    }
  }

  deleteAction(params) {
    if (params.data.mopDetailID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
      this.editableRowData = this.getRowData(this.gridApi);
      return;
    }
    this.spinner.show();
    this.setupService
      .deleteData("MOPDetail/" + params.data.mopDetailID)
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) >= 0) {
            this.toastr.success(
              this.constantsService.infoMessages.deletedRecord,
              this.constantsService.infoMessages.success
            );
            this.getMOPDetails();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.deleteRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.deleteRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
  }
  backToCalendar() {
    this.backToDayReconList.emit(true);
  }
  deptDetails() {
    const postData = {
      MovementHeaderID: this.movementHeaderID,
      StoreLocationID: this.storeLocationID,
      Shiftwisevalue: this.shiftWiseValue.value,
    };

    this.spinner.show();
    this.setupService
      .getData(
        "MovementHeader/GetDepartmenTypesales/" +
        postData.MovementHeaderID +
        "/" +
        postData.StoreLocationID +
        "/" +
        postData.Shiftwisevalue
      )
      .subscribe(
        (response) => {
          this.spinner.hide();
          this.deptDetailrowData = [];
          this.deptDetailrowData = response.map((x) => {
            if (x.departmentTypeID && x.departmentTypeID === 5)
              this.lotteryAmount += x.totalAmount;
            if (x.departmentTypeID && x.departmentTypeID === 7)
              this.lottoAmount += x.totalAmount;
            if (x.departmentTypeID && x.departmentTypeID === 26)
              this.lottoPayoutAmount += x.totalAmount;
            return {
              ...x,
              typeOfSell: "Type of Sale: " + x.departmentTypeName,
            };
          });
          if (this.lottoPayoutAmount < 0) this.lottoPayoutAmount = this.lottoPayoutAmount * -1;
          this.lotteryDepositAmount = this.lotteryAmount + this.lottoAmount - this.lottoPayoutAmount;
          if (this.deptDetailrowData.length > 0) {
            setTimeout(() => {
              this.deptGridApi.forEachNode(function (rowNode) {
                if (rowNode.group) {
                  rowNode.setExpanded(true);
                }
              });
              const sumDe = this.deptDetailrowData.reduce(
                (acc, i) => acc + i.totalAmount,
                0
              );
              this.deprttotalAmount = Number(sumDe.toFixed(2));
              this.setSumSalePOS();
            }, 2000);
          }
          this.deptGridApi.sizeColumnsToFit();
        },
        (error) => {
          this.spinner.hide();
        }
      );
  }
  setSumSalePOS() {
    const saleTax =
      this.saleTaxObj && this.saleTaxObj.totalAmount
        ? this.saleTaxObj.totalAmount
        : 0;
    this.totalPosSales = Number(
      saleTax + this.totalFuelGradeSalesAmount + this.deprttotalAmount
    );
    this.shortOver =
      Number(this.totalMopAmountForShortOver) -
      Number(saleTax + this.totalFuelGradeSalesAmount + this.deprttotalAmount) - Number(Math.abs(this.refundsAmount));
  }
  // add new Api call
  onCellValueChanged(params) {
    if (
      params.data.totalQty === null ||
      params.data.totalAmount === null ||
      !params.data.departmentSalesMovementDetailID
    ) {
      return;
    }
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService
      .updateData(
        `ISMDetail/UpdateSalesForISMDetail/${params.data.departmentSalesMovementDetailID}/${params.data.totalAmount}/${params.data.totalQty}`,
        ""
      )
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res && Number(res) > 0) {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              "success"
            );
            this.deptDetails();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              "error"
            );
          }
        },
        (err) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            "error"
          );
        }
      );
  }
  bankDepositOnGridReady(params) {
    this.depositGridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  printDayRecon() {
    const block1 = {
      totalAmount: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.saleTaxObj.totalAmount),
      totalPosSales: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.totalPosSales),
      totalMopAmount: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.totalMopAmount),
      shortOver: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.shortOver < 0 ? -this.shortOver : this.shortOver),
      totalTransactions: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.totalTransactions),
      unreconciledPay: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.unreconciledPay),
      reconciledPayOut: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.reconciledPayOut),
      totalBankDeposit: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.totalBankDepositFDispaly),
      lotteryBankDeposit: this.utilityService.formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(this.lotteryBankDeposit)
    };
    const block3 = [];
    const block4 = [];
    const block2 = [];
    const block5 = [];
    const block6 = [];
    const block7 = [];
    const block8 = [];
    const block9 = [];
    const block10 = [];
    const block11 = [];
    const block12 = [];
    block3.push([
      { text: "Grade" },
      { text: "Avg Cost/Gal" },
      { text: "Volume" },
      { text: "Amount", alignment: 'right' },
    ]);

    for (const key in this.rowData) {
      if (this.rowData.hasOwnProperty(key)) {
        const data = this.rowData[key];
        const fila = new Array();
        fila.push({
          text: data.gasGradeName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.averageCostPerGallon.toFixed(2).toString(),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: data.fuelGradeSalesVolume.toFixed(2).toString(),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.fuelGradeSalesAmount),
          border: [false, false, false, false],
          alignment: 'right'
        });
        block3.push(fila);
      }
    }
    const filas = new Array();
    filas.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    filas.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    filas.push({
      text: this.totalFuelGradeSalesVolume.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
      alignment: 'right'
    });
    filas.push({
      text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(this.totalFuelGradeSalesAmount),
      border: [false, false, false, false],
      fontSize: 10,
      alignment: 'right'
    });
    block3.push(filas);

    block4.push([
      { text: "MOP Name" },
      { text: "MOP Count" },
      { text: "MOP Amount", alignment: 'right' },
    ]);

    for (const key in this.editableRowData) {
      if (this.editableRowData.hasOwnProperty(key)) {
        const data = this.editableRowData[key];
        const fila = new Array();
        fila.push({
          text: data.mopName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.mopCount.toString(),
          border: [false, false, false, false],
          alignment: 'center'
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.mopAmount),
          border: [false, false, false, false],
          alignment: 'right'
        });
        block4.push(fila);
      }
    }
    const mopFile = new Array();
    mopFile.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    mopFile.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    mopFile.push({
      text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(this.totalMopAmount),
      border: [false, false, false, false],
      fontSize: 10,
      alignment: 'right'
    });
    block4.push(mopFile);

    block2.push([{ text: "Name" }, { text: "Value", alignment: 'right' }, { text: "Count" }]);

    for (const key in this.dayReconData.criticalStats) {
      if (this.dayReconData.criticalStats.hasOwnProperty(key)) {
        const data = this.dayReconData.criticalStats[key];
        const fila = new Array();
        fila.push({
          text: data.statName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.amount.toString(),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: data.countValue.toString(),
          border: [false, false, false, false],
          alignment: 'center'
        });
        block2.push(fila);
      }
    }

    block5.push([
      { text: "Description" },
      { text: "Open Count" },
      { text: "Open Amount" },
      { text: "Sales Qty" },
      { text: "Total Qty" },
      { text: "Sales Amount" },
      { text: "Total Amount" },
    ]);

    for (const key in this.deptDetailrowData) {
      if (this.deptDetailrowData.hasOwnProperty(key)) {
        const data = this.deptDetailrowData[key];
        const fila = new Array();
        fila.push({
          text: data.departmentDescription.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.openCount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.openAmount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.upcSalesQty.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.totalQty.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.upcSalesAmount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.totalAmount.toString(),
          border: [false, false, false, false],
        });
        block5.push(fila);
      }
    }
    const _block5 = new Array();
    _block5.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "".toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block5.push({
      text: "$" + this.deprttotalAmount.toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block5.push(_block5);

    block7.push([{ text: "Sales Description" }, { text: "Amount", alignment: 'right' }]);
    const departmentSalesTypeobject = _.filter(
      this.dayReconData.departmentSalesTypeobject,
      function (x) {
        return (
          x.departmentTypeName.trim() !== "Sales Tax" &&
          x.departmentTypeName.trim() !== "Fuel"
        );
      }
    );
    for (const key in departmentSalesTypeobject) {
      if (departmentSalesTypeobject.hasOwnProperty(key)) {
        const data = departmentSalesTypeobject[key];
        const fila = new Array();
        fila.push({
          text: data.departmentTypeName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.totalAmount),
          border: [false, false, false, false],
          alignment: 'right'
        });
        block7.push(fila);
      }
    }
    const salesTotal = departmentSalesTypeobject.reduce(
      (acc, i) => acc + i.totalAmount,
      0
    );
    const _block7 = new Array();
    _block7.push({
      text: "Total:".toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    _block7.push({
      text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(salesTotal).toString(),
      border: [false, false, false, false],
      fontSize: 10,
      alignment: 'right'
    });
    block7.push(_block7);

    //Network Report
    block8.push([
      { text: "Network Name" },
      { text: "Network Count" },
      { text: "Network Sales" },
    ]);

    for (const key in this.networkCardsRowData) {
      if (this.networkCardsRowData.hasOwnProperty(key)) {
        const data = this.networkCardsRowData[key];
        const fila = new Array();
        fila.push({
          text: data.Name.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.Count.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.Sales.toString(),
          border: [false, false, false, false],
        });
        block8.push(fila);
      }
    }
    const networkFile = new Array();
    networkFile.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    networkFile.push({
      text: this.totalNetworkCount.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    networkFile.push({
      text: "$" + this.totalNetworkSales.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block8.push(networkFile);

    //Purchase Report
    block6.push([
      { text: "Vendor Name" },
      { text: "Bank Nick Name" },
      { text: "Amount" },
      { text: "Category" },
      { text: "Memo" }
    ]);

    for (const key in this.purchasesRowData) {
      if (this.purchasesRowData.hasOwnProperty(key)) {
        const data = this.purchasesRowData[key];
        const fila = new Array();
        fila.push({
          text: data.vendorName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.bankNickName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.amount.toFixed(2).toString(),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: data.category.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.memo.toString(),
          border: [false, false, false, false],
        });
        block6.push(fila);
      }
    }

    //Promotions Report
    block9.push([
      { text: "UPC Code" },
      { text: "Item Description" },
      { text: "Sales Amount" },
      { text: "Discount Amount" },
      { text: "Sales Qty" }
    ]);

    for (const key in this.promotionsRowData) {
      if (this.promotionsRowData.hasOwnProperty(key)) {
        const data = this.promotionsRowData[key];
        const fila = new Array();
        fila.push({
          text: data.posCode.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.itemDescription.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.salesAmount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.discountAmount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.salesQty.toString(),
          border: [false, false, false, false],
        });
        block9.push(fila);
      }
    }

    const promotionsFile = new Array();
    promotionsFile.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    promotionsFile.push({
      text: "",
      border: [false, false, false, false],
      fontSize: 10,
    });
    promotionsFile.push({
      text: "$" + this.totalSalesAmount.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    promotionsFile.push({
      text: "$" + this.totalDiscount.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    promotionsFile.push({
      text: this.totalSalesQty.toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block9.push(promotionsFile);

    //Category Report
    block10.push([
      { text: "Category" },
      { text: "Item Count" },
      { text: "Amount" }
    ]);

    for (const key in this.categoryCardsRowData) {
      if (this.categoryCardsRowData.hasOwnProperty(key)) {
        const data = this.categoryCardsRowData[key];
        const fila = new Array();
        fila.push({
          text: data.POSCategoryDescription.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.ItemCount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.Amount.toString(),
          border: [false, false, false, false],
        });
        block10.push(fila);
      }
    }

    const categoriesFile = new Array();
    categoriesFile.push({
      text: "Total",
      border: [false, false, false, false],
      fontSize: 10,
    });
    categoriesFile.push({
      text: this.totalCategoryCount.toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    categoriesFile.push({
      text: "$" + this.totalCategorySales.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block10.push(categoriesFile);

    //ATM Report
    block11.push([
      { text: "Begin Amount", alignment: 'right' },
      { text: "Loaded Amount", alignment: 'right' },
      { text: "End Amount", alignment: 'right' },
      { text: "Dispensed Amount", alignment: 'right' },
      { text: "#Tranx" }
    ]);

    for (const key in this.atmRowData) {
      if (this.atmRowData.hasOwnProperty(key)) {
        const data = this.atmRowData[key];
        const fila = new Array();
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.BeginAmount ? parseFloat(data.BeginAmount.toString().replace(/,/g, '')) : 0),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.InputAmount ? parseFloat(data.InputAmount.toString().replace(/,/g, '')) : 0),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.EndAmount ? parseFloat(data.EndAmount.toString().replace(/,/g, '')) : 0),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: this.utilityService.formatDecimalCurrencyWithCommaSeparated(data.DispensedAmount ? parseFloat(data.DispensedAmount.toString().replace(/,/g, '')) : 0),
          border: [false, false, false, false],
          alignment: 'right'
        });
        fila.push({
          text: data.NoOfTransactions ? data.NoOfTransactions.toString() : '',
          border: [false, false, false, false],
          alignment: 'center'
        });
        block11.push(fila);
      }
    }

    //Bank Deposit
    let block12Cols = [];
    let block12Fields = [];
    let block12ColWidths = [];
    for (let bankDepositGridCol in this.bankDepositGridCols) {
      const data = this.bankDepositGridCols[bankDepositGridCol];
      if (data.headerName !== "Actions") {
        block12Cols.push({ text: data.headerName });
      }
      block12Fields.push({ text: data.headerName, field: data.field });
    }
    let splitCount: any = 350 / block12Cols.length;
    for (let bankDepositGridCol in block12Cols) {
      block12ColWidths.push(parseInt(splitCount));
    }
    block12.push(block12Cols);

    for (const key in this.bankDepositGridData) {
      if (this.bankDepositGridData.hasOwnProperty(key)) {
        const data = this.bankDepositGridData[key];
        const fila = new Array();
        for (const key in block12Fields) {
          const headerName = block12Fields[key];
          if (headerName.field === "SrNO") {
            fila.push({
              text: data[headerName.field] ? data[headerName.field].toString() : '',
              border: [false, false, false, false],
              alignment: 'right'
            });
          } else if (headerName.field === "action") {
            //do not create row
          } else {
            fila.push({
              text: this.utilityService.formatDecimalCurrency(data[headerName.field] ? parseFloat(data[headerName.field].toString().replace(/,/g, '')) : 0).toString(),
              border: [false, false, false, false],
              alignment: 'right'
            });
          }
        }
        block12.push(fila);
      }
    }


    this.pdfGenrateService.PDFDayRecon(
      block1,
      block2,
      block4,
      block3,
      block5,
      block6,
      block7,
      block8,
      block9,
      block10,
      block11,
      block12,
      block12ColWidths,
      this.movementHeaderDetails,
      this.shiftWiseValue.name,
      this.dayReconData.storeName,
      this.dayReconData.stroeAddress
    );
  }

  openAddIncome($event) {
    this.getVendorByCompanyId(true);
    this.isExpense = false;
    this.showAddPurchases = false;
    this.showAddIncExp = true;
    this.showSaveIncomeCheckNum = false;
    this.addIncomeForm.get('methodOfPaymentId').setValue(null);
    this.addIncomeForm.get('CheckNumber').setValue(null);
    document.getElementById("overlay").style.display = "block";
    this.addContainer = "side-container-open";
  }

  openAddExpenses($event) {
    this.getVendorByCompanyId(false);
    this.isExpense = true;
    this.showAddPurchases = false;
    this.showAddIncExp = true;
    this.showSaveIncomeCheckNum = false;
    this.addIncomeForm.get('methodOfPaymentId').setValue(null);
    this.addIncomeForm.get('CheckNumber').setValue(null);
    document.getElementById("overlay").style.display = "block";
    this.addContainer = "side-container-open";
  }

  openAddPurchases(event) {
    this.showAddPurchases = true;
    this.showAddIncExp = false;
    document.getElementById("overlay").style.display = "block";
    this.addContainer = "side-container-open";
    this.importPurchase();
  }
  @ViewChild('fileInput')
  myInputVariable: ElementRef;
  closeSideContainer() {
    this.incomeDocumentFiles = [];
    this.myInputVariable.nativeElement.value = "";
    this.addIncomeForm.reset();
    document.getElementById("overlay").style.display = "none";
    this.addContainer = "side-container-close";
  }

  closePurchaseSideContainer() {
    this.invoiceImageFile = null;
    this.invoiceImageURL = null;
    this.purchaseInvDate = null;
    this.addPurchasesForm.reset();
    document.getElementById("overlay").style.display = "none";
    this.addContainer = "side-container-close";
  }

  getAcntCategories() {
    this.setupService
      .getData("ChartOfAccountCategories/GetChartOfAccountCategories", "")
      .subscribe(
        (response) => {
          this.chartOfAccountCategories = response;
        },
        (error) => {
          console.log(error);
        }
      );
  }

  getVendorByCompanyId(incomeFlag) {
    this.setupService.getData('Vendor/GetVendorsByCOAType?CompanyID=' + this.userInfo.companyId + "&IsIncome=" + incomeFlag).subscribe(
      (response) => {
        this.vendorList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPaymentSource(event) {
    this.addIncomeForm.get('paymentSourceID').setValue(null);
    this.addIncomeForm.get('methodOfPaymentId').setValue(null);
    this.addIncomeForm.get('CheckNumber').setValue(null);
    if (event.chartOfAccountCategoryName !== null)
      this.selectedChartOfCatc = "Category : " + event.chartOfAccountCategoryName;
    else
      this.selectedChartOfCatc = "";
    this.spinner.show();
    this.setupService.getData("PaymentSource/GetPaymetSourceByVendor/" + this.userInfo.companyId + "/" + this.storeLocationID + "/" + event.vendorID)
      .subscribe((res) => {
        this.spinner.hide();
        if (res && res["statusCode"]) {
          this.paymentSourceList = [];
        } else {
          this.paymentSourceList = res;
        }
      }, (err) => {
        console.log(err);
      });
  }

  getMethodOfpaymentByPaymentSrc(event) {
    this.storeBankID = event.storeBankID;
    this.setupService
      .getData(
        `PaymentSource/GetAvailableMops/${event.storeBankID}/${this.addPurchasesForm.get("vendorid").value
        }/${this.storeLocationID}`
      )
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res["statusCode"]) {
            this.filteredMOPList = [];
          } else {
            this.filteredMOPList = res;
          }
        },
        (err) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.contactAdmin);
          console.log(err);
        }
      );
  }

  getMethodOfpaymentByPaymentSrcIncome(event) {
    if (!event || (event.methodOfPaymentID === 6 || event.sourceName.toLowerCase() === "cash from register")) {
      this.addIncomeForm.get('methodOfPaymentId').setValue(null);
      this.addIncomeForm.get('CheckNumber').setValue(null);
      this.addIncomeForm.get('methodOfPaymentId').clearValidators();
      this.addIncomeForm.get('methodOfPaymentId').updateValueAndValidity();
      this.addIncomeForm.get('methodOfPaymentId').disable();
      this.showSaveIncomeCheckNum = false;
      return;
    } else {
      this.addIncomeForm.get('methodOfPaymentId').setValidators([Validators.required]);
      this.addIncomeForm.get('methodOfPaymentId').updateValueAndValidity();
      this.showSaveIncomeCheckNum = false;
      this.addIncomeForm.get('methodOfPaymentId').enable();
    }
    this.storeBankIDSrcIncome = event.storeBankID;
    this.setupService
      .getData(
        `PaymentSource/GetAvailableMops/${event.storeBankID}/${this.addIncomeForm.get("VendorID").value
        }/${this.storeLocationID}`
      )
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res["statusCode"]) {
            this.filteredMOPList = [];
          } else {
            this.filteredMOPList = res;
            if (this.isExpense && this.addIncomeForm.get("Amount").value !== null && this.filteredMOPList.length === 1) {
              this.addIncomeForm.get('methodOfPaymentId').setValue(this.filteredMOPList[0].methodOfPaymentID);
              this.paymentMethodChange(this.filteredMOPList[0]);
            }
          }
        },
        (err) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.contactAdmin);
          console.log(err);
        }
      );
  }

  savePurchases() {
    this.addPurchasesSubmitted = true;
    if (this.addPurchasesForm.valid) {
      this.spinner.show();
      const formData = new FormData();
      if (this.invoiceImageFile) {
        formData.append("files", this.invoiceImageFile);
      }
      this.setupService
        .postData(
          "Invoice/InvoiceUpload?CompanyID=" +
          this.userInfo.companyId +
          "&StoreLocationID=" +
          this.storeLocationID +
          "&vendorid=" +
          this.addPurchasesForm.get("vendorid").value +
          "&invoiceno=" +
          this.addPurchasesForm.get("invoiceno").value +
          "&invoiceAmount=" +
          this.addPurchasesForm.get("invoiceAmount").value +
          "&paymentSourceID=" +
          this.addPurchasesForm.get("paymentSourceID").value +
          "&methodOfPaymentId=" +
          this.addPurchasesForm.get("methodOfPaymentId").value +
          "&userName=" +
          this.userInfo.userName +
          "&storeBankID=" +
          this.storeBankID +
          "&invoicePaymentAmount=" +
          this.addPurchasesForm.get("invoicePaymentAmount").value +
          "&invoicedate=" +
          this.addPurchasesForm.get("invoicedate").value +
          "&memo=" +
          this.addPurchasesForm.get("memo").value +
          "&MovementHeaderID=" +
          this.movementHeaderID,
          formData
        )
        .subscribe(
          (response) => {
            this.addPurchasesSubmitted = false;
            this.spinner.hide();
            if (response) {
              this.showAddPurchases = false;
              this.closePurchaseSideContainer();
              this.toastr.success(
                this.constantsService.infoMessages.addedRecord,
                this.constantsService.infoMessages.success
              );
            } else {
              this.toastr.error(
                this.constantsService.infoMessages.addRecordFailed,
                this.constantsService.infoMessages.error
              );
            }
          },
          (error) => {
            this.addPurchasesSubmitted = false;
            this.spinner.hide();
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
            console.log(error);
          }
        );
    }
  }

  dateChange(event, controls) {
    this.addPurchasesForm.get("invoicedate").setValue(event.formatedDate);
    this.purchaseInvDate = event.formatedDate;
  }

  invoiceAmountChanges(event) {
    if (this.addPurchasesForm.get("sameAsInv").value) {
      this.addPurchasesForm
        .get("invoicePaymentAmount")
        .setValue(this.addPurchasesForm.get("invoiceAmount").value);
    }
  }

  uploadInvoiceImage(files) {
    this.invoiceImageFile = files;
    if (files[0]) {
      let reader = new FileReader();
      var ext = ["image/jpeg", "image/png", "image/jpg"];
      if (ext.indexOf(files[0].type) == -1) {
        this.toastr.error("Upload only images", "Error");
        return;
      } else {
        reader.onload = this._handleReaderLoaded.bind(this);
        reader.readAsDataURL(files[0]);
      }
    }
  }

  deleteInvoiceImage() {
    this.invoiceImageFile = null;
    this.invoiceImageURL = null;
  }

  _handleReaderLoaded(readerEvt) {
    this.invoiceImageURL = readerEvt.target.result;
  }
  uploadIncomeDocuments1(evt) {
    this.incomeDocumentFiles = evt;
  }
  uploadIncomeDocuments(evt) {
    var files = evt.target.files;
    this.incomeDocumentFiles = [];
    if (files) {
      for (let i = 0; i < files.length; i++) {
        this.incomeDocumentName = files[i].name;
        this.incomeDocumentType = files[i].type;
        var reader2 = new FileReader();
        reader2.onload = this._handleLogoReaderLoaded.bind(this);
        reader2.readAsDataURL(files[i]);
      }
    }
  }

  _handleLogoReaderLoaded(readerEvt) {
    var binaryString1 = readerEvt.target.result;
    this.incomeDocumentFiles.push(binaryString1);
  }
  deleteImage() {
    this.incomeDocumentFiles = [];
  }
  saveIncome() {
    this.addIncomeFormSubmitted = true;
    if (this.addIncomeForm.valid) {
      this.spinner.show();
      /*  let formData = new FormData();
       if (this.incomeDocumentFiles) {
         formData.append('files', this.incomeDocumentFiles[0], this.incomeDocumentFiles[0].name);
       } */
      let postData = {
        "incomeExpenseID": 0,
        "docuPath": "",
        "movementHeaderID": this.movementHeaderID,
        "storeLocationID": this.storeLocationID,
        "businessDate": moment().format("MM-DD-YYYY"),
        "notes": this.addIncomeForm.get("Notes").value ? this.addIncomeForm.get("Notes").value.toString() : '',
        "isExpense": this.isExpense,
        "vendorID": this.addIncomeForm.get("VendorID").value,
        "paymentID": 0,
        "companyID": this.userInfo.companyId,
        "paymentSourceID": this.addIncomeForm.get("paymentSourceID").value,
        "incomeExpensPaymentID": 0,
        "storeBankID": this.storeBankIDSrcIncome ? this.storeBankIDSrcIncome : '',
        "amountPaid": this.addIncomeForm.get("Amount").value,
        "methodOfPaymentId": this.addIncomeForm.get("methodOfPaymentId").value ? this.addIncomeForm.get("methodOfPaymentId").value : '',
        "checkNumber": this.addIncomeForm.get('CheckNumber').value ? this.addIncomeForm.get('CheckNumber').value : '',
        "lastModifiedBy": this.userInfo.userName,
        "expenseTypeID": 0,
        "chartOfAccountCategoryID": null,
        "sourceName": "",
        "isSystem": false,
        "lastCheckNumber": null,
        "files": []
      }

      if (this.incomeDocumentFiles && this.incomeDocumentFiles.length > 0) {
        postData.files.push({
          "file": this.incomeDocumentFiles[0],
          "fileName": this.incomeDocumentName,
          "fileType": this.incomeDocumentType
        });
      }

      this.setupService.postData(`IncomeExpense/SaveIncomeExpensAndPaymentNew`, postData).subscribe(
        (response) => {
          this.addIncomeFormSubmitted = false;
          this.spinner.hide();
          if (response) {
            this.closeSideContainer();
            this.getPurchases();
            this.toastr.success(
              this.constantsService.infoMessages.addedRecord,
              this.constantsService.infoMessages.success
            );
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.addIncomeFormSubmitted = false;
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.addRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    }
  }

  getPurchases() {
    this.spinner.show();
    this.reconciledPayOut = 0.0;
    this.unreconciledPay = 0.0;
    let posPayInPayouts = this.dayReconData.posPayInPayouts;
    if (posPayInPayouts && posPayInPayouts.length > 0) {
      for (let posData of posPayInPayouts) {
        if (posData.miscellaneousSummaryCode.toLowerCase() === "payouts") {
          this.payOutFromPOS = posData.amount.toFixed(2);
        } else if (posData.miscellaneousSummaryCode.toLowerCase() === "payin") {
          this.payInFromPOS = posData.amount.toFixed(2);
        }
      }
    }
    let criticalStats = this.dayReconData.criticalStats;
    if (criticalStats && criticalStats.length > 0) {
      for (let criticalStat of criticalStats) {
        if (criticalStat.statName === "Refunds") {
          this.refundsAmount = Number(criticalStat.amount);
        }
      }
    }

    this.purchasesRowData = [];
    let businessDate = moment(this.dayReconData.selectedDate).format("MM-DD-YYYY");
    this.isPurchasesLoaded = false;

    forkJoin(
      this.setupService.getDayReconDetail(this.storeLocationID, this.movementHeaderID, this.shiftWiseValue.value),
      this.setupService.getData("IncomeExpense/GetPayInAndPayOutData?MovementHeaderID=" + this.movementHeaderID +
        "&shiftWisevalue=" + this.shiftWiseValue.value + "&BusinessDate=" + businessDate +
        "&storelocationID=" + this.storeLocationID),
      this.setupService.getData("BankDeposits/GetBankDeposits/" + this.storeLocationID + "/" + this.movementHeaderID)
    ).subscribe((response) => {
      this.getMOPFuelDetails(response[0]);
      let purchases = response[1].purchases;
      let expenses = response[1].expense;
      let income = response[1].income;
      let fuel = response[1].fuelData;
      this.availableBanks = response[2];
      this.generateBankGridCol(response[2]);
      this.purchasesRowData = [];
      this.totalTransactions = 0;
      this.totalPurchaseAmount = 0.0;
      this.totalIncome = 0.0;

      //purchases
      if (purchases && purchases.length > 0) {
        purchases.forEach((purchase) => {
          let bankNickName = "";
          if (purchase.methodOfPaymentID == 5 || purchase.methodOfPaymentID == 6) {//Cash From Register
            this.reconciledPayOut += purchase.amountPaid;
            bankNickName = "";
          } else {
            bankNickName = purchase.bankNickName;
          }
          this.totalTransactions = this.totalTransactions - Number(purchase.amountPaid);
          this.totalPurchaseAmount += purchase.amountPaid;
          this.payOutCheck += Number(purchase.amountPaid);
          let purchaseData = {
            vendorName: purchase.vendorName,
            amount: purchase.amountPaid,
            bankNickName: bankNickName,
            category: purchase.chartofAccountCategoryName,
            type: "Purchases",
            memo: purchase.memo,
            docuPath: purchase.docuPath,
            incomeExpenseID: purchase.invoiceID,
            invoiceType: "Vendor"
          };
          this.purchasesRowData.push(purchaseData);
        });
      }

      //expenses
      if (expenses && expenses.length > 0) {
        expenses.forEach((expense) => {
          let bankNickName = "";
          if (expense.methodOfPaymentID == 5 || expense.methodOfPaymentID == 6) {
            bankNickName = expense.sourceName;
            this.reconciledPayOut += expense.amountPaid;
          } else {
            bankNickName = "From " + expense.bankNickName + " as " + expense.paymentMethodofPaymentDescription + (expense.checkNumber ? '# ' + expense.checkNumber : "");
          }
          this.totalTransactions = this.totalTransactions - Number(expense.amountPaid);
          this.payOutCheck += Number(expense.amountPaid);
          let purchaseData = {
            vendorName: expense.vendorName,
            amount: expense.amountPaid,
            bankNickName: bankNickName,
            category: expense.chartofAccountCategoryName,
            type: "Expense",
            memo: expense.memo,
            docuPath: expense.docuPath,
            incomeExpenseID: expense.incomeExpenseID
          };
          this.purchasesRowData.push(purchaseData);
        });
      }
      //income
      if (income && income.length > 0) {
        income.forEach((income) => {
          let bankNickName = "";
          if (income.methodOfPaymentID == 5 || income.methodOfPaymentID == 6 || income.storeBankID === null) {
            bankNickName = "Received as Cash";
            this.reconciledPayIn += income.amountPaid;
          } else {
            bankNickName = "Received From " + income.bankNickName + " as " + income.paymentMethodofPaymentDescription + (income.checkNumber ? '# ' + income.checkNumber : "");
          }
          this.totalIncome += Number(income.amountPaid);
          this.totalTransactions = this.totalTransactions + Number(income.amountPaid);
          this.payInCheck += Number(income.amountPaid)
          let purchaseData = {
            vendorName: income.vendorName,
            amount: income.amountPaid,
            bankNickName: bankNickName,
            category: income.chartofAccountCategoryName,
            type: "Income",
            memo: income.memo,
            docuPath: income.docuPath,
            incomeExpenseID: income.incomeExpenseID
          };
          this.purchasesRowData.push(purchaseData);
        });
      }

      //fuel
      if (fuel && fuel.length > 0) {
        fuel.forEach((fuel) => {
          let purchaseData = {
            vendorName: fuel.vendorName,
            amount: fuel.invocieAmount,
            bankNickName: "",
            category: "",
            type: "Purchases",
            memo: "",
            // docuPath: fuel.docuPath,
            incomeExpenseID: fuel.fuelInvoiceID,
            invoiceType: "Fuel"
          };
          this.purchasesRowData.push(purchaseData);
        });
      }
      this.isPurchasesLoaded = true;
      this.unreconciledPay = this.payOutFromPOS - this.reconciledPayOut;
      this.calculateBankDeposit();
    },
      (error) => {
        console.log(error);
      }
    );
  }

  getATMTransactions() {
    this.atmSubmitted = false;
    this.setupService
      .getData("ATMTransaction/getAtmTransactions?storeID=" + this.storeLocationID + "&TransactionDate=" + moment(this.dayReconData.selectedDate).format("MM-DD-YYYY")
      )
      .subscribe((response) => {
        this.atmInitialData = response;
        if (this.atmInitialData && this.atmInitialData.length > 0)
          this.setData(response);
      }
      );
  }

  atmCancel() {
    if (this.atmInitialData && this.atmInitialData.length > 0)
      this.setData(this.atmInitialData);
  }

  setData(response) {
    this.transactionForm.controls.ATMTransactionID.setValue(response[0].ATMTransactionID);
    this.transactionForm.controls.BeginAmount.setValue(this.commonService.setMoneyFormat(response[0].BeginAmount));
    this.transactionForm.controls.NoOfTransactions.setValue(response[0].NoOfTransactions);
    this.transactionForm.controls.InputAmount.setValue(this.commonService.setMoneyFormat(response[0].InputAmount));
    this.transactionForm.controls.DispensedAmount.setValue(this.commonService.setMoneyFormat(response[0].DispensedAmount));
    this.transactionForm.controls.EndAmount.setValue(this.commonService.setMoneyFormat(response[0].EndAmount));
  }

  OnChange() {
    const beginAmount = this.transactionForm.controls.BeginAmount.value ? this.transactionForm.controls.BeginAmount.value : 0;
    const inputAmount = this.transactionForm.controls.InputAmount.value ? this.transactionForm.controls.InputAmount.value : 0;
    const dispensedAmount = this.transactionForm.controls.DispensedAmount.value ? this.transactionForm.controls.DispensedAmount.value : 0;
    this.transactionForm.controls.EndAmount.setValue(this.commonService.setMoneyFormat(parseFloat(beginAmount) + parseFloat(inputAmount) - parseFloat(dispensedAmount)));
  }
  //import Purchases
  purchaseTypeChange(event) {
    if (this.purchaseType === "addPurchase") {
      this.showAddPurchase = true;
      this.showImportPurchase = false;
    } else {
      this.showAddPurchase = false;
      this.showImportPurchase = true;
    }
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.importPurchasesForm.get('fromDate').setValue(this.selectedDateRange.fDate);
    this.importPurchasesForm.get('toDate').setValue(this.selectedDateRange.tDate);
  }

  importPurchase() {
    this.spinner.show();
    let postData = {
      "locationCriteria": this.storeLocationID,
      "vendorCriteria": "",
      "statusCriteria": "",
      "paymentSourceIDs": "",
      "dtFromCriteria": moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'),
      "dtToCriteria": moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'),
      "invoiceNo": "",
      "upcCode": "",
      "companyID": this.userInfo.companyId,
      "username": this.userInfo.userName
    }
    this.setupService.postData("Invoice/GetInvoiceWithPayment?PageNumber=1&noOfRecords=1000&searchValue=", postData)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response.objInvoiceWithPaymentDTO) {
          response.objInvoiceWithPaymentDTO.forEach(k => {
            if (k.lstInvoicePayments && k.lstInvoicePayments.length > 0)
              k.firstInvoicePayment = k.lstInvoicePayments[0].bankNickName;
          });
          this.importPurchasesRowData = response.objInvoiceWithPaymentDTO;
          if (this.importPurchasesGridAPI)
            this.importPurchasesGridAPI.sizeColumnsToFit();
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });

    this.setupService.getData('FuelInvoice/list/' + this.userInfo.companyId + '/' + this.userInfo.userName + '?PageNumber=1&noOfRecords=1000&searchValue=&dtFrom=' + postData.dtFromCriteria
      + '&dtTo=' + postData.dtToCriteria + '&storeLocationID=' + this.storeLocationID)
      .subscribe((response) => {
        this.spinner.hide();
        if (response.totalRecordCount > 0) {
          this.importFuelPurchasesRowData = response.objFuelInvoice;
        } else {
          this.importFuelPurchasesRowData = [];
        }
        if (this.importFuelPurchasesGridAPI)
          this.importFuelPurchasesGridAPI.sizeColumnsToFit();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });

  }

  paymentMethodChange(event) {
    if (event && event.methodOfPaymentDescription.toLowerCase() == "check" && this.isExpense) {
      if (!this.addIncomeForm.valid) {
        this.toastr.error("Amount Is Required");
        this.addIncomeForm.get('methodOfPaymentId').setValue(null);
        return;
      }
      this.spinner.show();
      this.setupService.getData(`CheckPrint/GetcheckNumber/${this.storeBankIDSrcIncome}/${this.addIncomeForm.get('Amount').value}/${this.addIncomeForm.get('VendorID').value}/${this.addIncomeForm.get('paymentSourceID').value}/${this.storeLocationID}`)
        .subscribe((res) => {
          this.spinner.hide();
          this.showSaveIncomeCheckNum = true;
          this.addIncomeForm.get('CheckNumber').setValue(res);
        }, (err) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.contactAdmin);
          console.log(err);
        });
    } else {
      this.showSaveIncomeCheckNum = false;
    }
  }

  onRowSelected(params) {
    this.selectedItems = params ? params.map(x => x.data.invoiceID).join(',') : '';
  }

  onFuelRowSelected(params) {
    this.selectedFuelItems = params ? params.map(x => x.data.fuelInvoiceID).join(',') : '';
  }

  updatePayment() {
    if (this.selectedItems) {
      this.spinner.show();
      let url = "IncomeExpense/UpdatePayment?InvoiceID=" + this.selectedItems + "&MovemenHeaderID=" + this.movementHeaderID;
      this.setupService.postData(url, "").subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response === "1") {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getPurchases();
          } else {
            this.toastr.error('Import Failed', this.constantsService.infoMessages.error);
          }
          this.closePurchaseSideContainer();
        });
    } else {
      this.toastr.error(
        'Please select record',
        this.constantsService.infoMessages.error
      );
    }
  }

  updateFuelPayment() {
    if (this.selectedFuelItems) {
      this.spinner.show();
      let url = "FuelInvoice/UpdateMovementHeader?FuelInvoiceIDs=" + this.selectedFuelItems + "&MovementHeaderID=" + this.movementHeaderID;
      this.setupService.postData(url, "").subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response === "1") {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getPurchases();
          } else {
            this.toastr.error('Import Failed', this.constantsService.infoMessages.error);
          }
          this.closePurchaseSideContainer();
        });
    } else {
      this.toastr.error(
        'Please select record',
        this.constantsService.infoMessages.error
      );
    }
  }

  fileType: any = "application/pdf";
  fileData: any;

  viewFileAction(event) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: this.storeLocationID,
      storeName: '',
      bucketName: '',
      filePath: event.data.docuPath,
      fileName: event.data.docuPath,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this.setupService.postData(`InvoiceBin/DownloadInvocie`, postData).subscribe(response => {
      this.spinner.hide();
      if (response && response.length > 0) {
        this.fileType = response[0].fileContentType;
        this.fileName = response[0].fileName;
        this.fileData = 'data:' + response[0].fileContentType + ';base64,' + response[0].fileData,
          this.modal.open(this.viewFileModal, { backdrop: 'static' });
      } else {
        this.toastr.warning('Invocie Image Not Found', 'warning');
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error('Invoice Failed', this.constantsService.infoMessages.error);
      console.log(error);
    });
  }

  viewFileDeleteAction(event) {
    if (event.data.type === "Purchases" && event.data.invoiceType === "Vendor") {
      this.spinner.show();
      let url = "IncomeExpense/UpdatePayment?InvoiceID=" + event.data.incomeExpenseID;
      this.setupService.postData(url, "").subscribe((response) => {
        this.spinner.hide();
        if (response && response === "1") {
          this.toastr.success(
            this.constantsService.infoMessages.deletedRecord,
            this.constantsService.infoMessages.success
          );
          this.getPurchases();
        } else {
          this.toastr.error('Delete Record Failed', this.constantsService.infoMessages.error);
        }
        this.closePurchaseSideContainer();
      });
    } else if (event.data.type === "Purchases" && event.data.invoiceType === "Fuel") {
      this.spinner.show();
      let url = "FuelInvoice/UpdateMovementHeader?FuelInvoiceIDs=" + event.data.incomeExpenseID;
      this.setupService.postData(url, "").subscribe((response) => {
        this.spinner.hide();
        if (response && response === "1") {
          this.toastr.success(
            this.constantsService.infoMessages.deletedRecord,
            this.constantsService.infoMessages.success
          );
          this.getPurchases();
        } else {
          this.toastr.error('Delete Record Failed', this.constantsService.infoMessages.error);
        }
        this.closePurchaseSideContainer();
      });
    } else {
      this.spinner.show();
      this.setupService.deleteData('IncomeExpense?id=' + event.data.incomeExpenseID).subscribe(result => {
        this.spinner.hide();
        if (result === '1') {
          this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.delete);
        } else if (result === '0') {
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
        }
        this.getPurchases();
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.contactAdmin);
      });
    }
  }

  getBanks() {
    this.spinner.show();
    this.setupService.getData("BankDeposits/GetBankDeposits/" + this.storeLocationID + "/" + this.movementHeaderID)
      .subscribe((response) => {
        this.spinner.hide();
        this.availableBanks = response;
        this.calculateBankDeposit();
        this.generateBankGridCol(response);
      }, (error) => {
        console.log(error);
      });
  }
  // depositCancel() {
  //   if (this.availableBanks && this.availableBanks.length > 0) {
  //     this.availableBanks.forEach(k => {
  //       this.initialBankDeposits.forEach(i => {
  //         if (k.BankAccountTypeName == i.accountType)
  //           k.Amount = this.commonService.setMoneyFormat(i.amount);
  //       })
  //     })
  //   }
  // }

  // depositKeyDown(bankTypeId) {
  //   this.availableBanks.forEach(k => {
  //     if (k.BankAccountTypeID == bankTypeId)
  //       k.previousAmount = k.Amount;
  //   });
  // }

  onAmountFocusOut(event) {
    let amount = Number(this.addIncomeForm.get('Amount').value);
    this.addIncomeForm.get('Amount').setValue(amount.toFixed(2));
  }

  // saveSplitDeposit() {
  //   let postData = [];
  //   this.availableBanks.forEach(k => {
  //     postData.push({
  //       "bankDepositID": k.BankDepositID ? k.BankDepositID : 0,
  //       "movementHeaderID": this.movementHeaderID,
  //       "storeBankID": k.StoreBankID,
  //       "amount": (k.Amount ? parseFloat(k.Amount.replace('$', '').replace(/,/g, '')) : 0),
  //       "lastModifiedBy": this.userInfo.userName,
  //       "lastModifiedDateTime": new Date,
  //       "createdDateTime": new Date,
  //       "bankNickName": k.BankNickName,
  //       "bankAccountTypeID": k.BankAccountTypeID,
  //       "bankAccountTypeName": k.BankAccountTypeName,
  //       "IsCheck": k.IsCheck ? k.IsCheck : false
  //     })
  //   });
  //   this.spinner.show();
  //   this.setupService.postData("BankDeposits/AddBulkDeposit", postData).subscribe(response => {
  //     this.spinner.hide();
  //     if (this.availableBanks && this.availableBanks.length > 0) {
  //       this.getBanks();
  //       // this.availableBanks.forEach(k => {
  //       //   this.initialBankDeposits.forEach(i => {
  //       //     if (k.BankAccountTypeID == i.accountTypeID)
  //       //       i.amount = this.commonService.setMoneyFormat(k.Amount);
  //       //     if (k.BankAccountTypeID === 3) {//"lottery account"
  //       //       this.lotteryBankDeposit = k.Amount;
  //       //     }
  //       //   });
  //       // });
  //     }
  //     this.toastr.success(
  //       this.constantsService.infoMessages.updatedRecord,
  //       this.constantsService.infoMessages.success
  //     );
  //   });
  // }

  public toggleAccordian(props: NgbPanelChangeEvent): void {
    // if (props.nextState && props.panelId === 'salespanel-4') {
    //   this.getBanks();
    // }
  }

  getNetworkCardDetails() {
    this.spinner.show();
    this.setupService.getData("MovementHeader/GeNetworkCardDetails/" + this.movementHeaderID).subscribe((response) => {
      this.spinner.hide();
      if (response && response.length > 0) {
        this.networkCardsRowData = response;
        this.totalNetworkSales = this.networkCardsRowData.reduce(
          (acc, i) => acc + i.Sales, 0);
        this.totalNetworkCount = this.networkCardsRowData.reduce(
          (acc, i) => acc + i.Count, 0);
      } else {
        this.networkCardsRowData = [];
        this.totalNetworkSales = 0;
        this.totalNetworkCount = 0;
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    })
  }

  getCategoryCardDetails() {
    this.spinner.show();
    this.setupService.getData("MovementHeader/GetCategoryDetails/" + this.movementHeaderID).subscribe((response) => {
      this.spinner.hide();
      if (response && response.length > 0) {
        this.categoryCardsRowData = response;
        this.totalCategorySales = this.categoryCardsRowData.reduce(
          (acc, i) => acc + i.Amount, 0);
        this.totalCategoryCount = this.categoryCardsRowData.reduce(
          (acc, i) => acc + i.ItemCount, 0);
      } else {
        this.categoryCardsRowData = [];
        this.totalCategorySales = 0;
        this.totalCategoryCount = 0;
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    })
  }

  getShiftAtmTransactions() {
    this.spinner.show();
    this.setupService.getData("ShiftATMTransaction/GetShiftAtmTransactions?MovementHeaderID=" + this.movementHeaderID + "&ShiftValue=" + this.shiftWiseValue.value + "&StoreID=" + this.storeLocationID).subscribe((response) => {
      this.spinner.hide();
      if (response && response.length > 0) {
        this.atmRowData = response;
      } else {
        this.atmRowData = [];
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }
  addNewATM() {
    if (this.newATMAdded) {
      this.toastr.warning('Please Save Existing Data', 'Warning');
      return;
    }
    this.newATMAdded = true;
    this.spinner.show();
    this.setupService.getData("ShiftATMTransaction/GetAtmBeginAmount?MovementHeaderID=" + this.movementHeaderID + "&TransactionDate=" + moment(this.dayReconData.selectedDate).format('YYYY-MM-DD') + "&StoreID=" + this.storeLocationID).subscribe((response) => {
      this.spinner.hide();
      let newATMData = {
        "ATMTransactionID": 0,
        "MovementHeaderID": this.movementHeaderID,
        "StoreLocationID": this.storeLocationID,
        "BeginAmount": 0,
        "NoOfTransactions": 0,
        "InputAmount": 0,
        "DispensedAmount": 0,
        "EndAmount": 0,
        "TransactionDate": moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'),
        "DocuPath": "",
        "CreatedBy": this.userInfo.userName,
        "CreatedDateTime": new Date(),
        "LastModifiedBy": this.userInfo.userName,
        "LastModifiedDateTime": new Date(),
        "RowNumber": this.atmRowData.length + 1,
        "Files": []
      }
      if (response && response.length > 0) {
        newATMData.NoOfTransactions = response[0].NoOfTransactions;
        if (response[0].BeginAmount) {
          newATMData.BeginAmount = response[0].BeginAmount;
        } else if (response[0].InputAmount) {
          newATMData.BeginAmount = response[0].InputAmount;
        } else if (response[0].DispensedAmount) {
          newATMData.BeginAmount = response[0].DispensedAmount;
        } else if (response[0].EndAmount) {
          newATMData.BeginAmount = response[0].EndAmount;
        }
        this.atmRowData.push(newATMData);
      } else {
        this.atmRowData.push(newATMData);
      }
      this.atmGridApi.setRowData(this.atmRowData);
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }

  onCellValueChangedATM(params) {
    if (params.colDef.field === "BeginAmount") {
      if (Number(params.value) < 100) {
        this.toastr.warning('Begin Amount should be greater than or equal 100', 'Warning');
      } else if (Number(params.value) > 100000) {
        this.toastr.warning('Begin Amount should be less than or equal 100000', 'Warning');
      }
    }
    if (params.colDef.field === "BeginAmount" || params.colDef.field === "InputAmount" || params.colDef.field === "DispensedAmount") {
      let endAmount = parseFloat((params.data.BeginAmount === "" || params.data.BeginAmount === undefined) ? 0.0 : params.data.BeginAmount)
        + parseFloat((params.data.InputAmount === "" || params.data.InputAmount === undefined) ? 0.0 : params.data.InputAmount)
        - parseFloat((params.data.DispensedAmount === "" || params.data.DispensedAmount === undefined) ? 0.0 : params.data.DispensedAmount);
      let rowNode = this.atmGridApi.getRowNode(params.node.id);
      rowNode.setDataValue('EndAmount', endAmount);
      // this.commonService.setCellChange(params);
    }
  }

  uploadATMFile(event) {
    this.updateATMFiles = [];
    this.spinner.show();
    for (var i = 0; i < event.target.files.length; i++) {
      let file = event.target.files[i];
      if (file.type === 'application/pdf' || file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpeg') {
        let newATMFile = {
          file: "",
          fileName: file.name,
          fileType: file.type
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          newATMFile.file = reader.result as string;
          this.updateATMFiles.push(newATMFile);
        };
      } else {
        this.toastr.warning('Invalid File Format.', 'Warning');
      }
    }
    this.spinner.hide();
  }

  downloadATMFile(event) {
    const postData = {
      companyId: this.userInfo.companyId,
      companyName: '',
      storeLocationId: event.data.StoreLocationID,
      storeName: '',
      bucketName: '',
      filePath: event.data.DocuPath,
      fileName: event.data.DocuPath,
      fileType: '',
      fileData: '',
      contentType: ''
    };
    this.spinner.show();
    this.setupService.postData(`ShiftATMTransaction/DownloadAttachement`, postData)
      .subscribe(response => {
        this.spinner.hide();
        if (response && response.length > 0) {
          for (let i = 0; i < response.length; i++) {
            let file = response[i];
            const byteString = window.atob(file.fileData);
            const arrayBuffer = new ArrayBuffer(byteString.length);
            const int8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; i++) {
              int8Array[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([int8Array], { type: file.fileContentType });
            // const blob = new Blob([file.fileData], { type: file.fileContentType });
            saveAs(blob, file.fileName);
          }
        } else {
          this.toastr.warning('File Not Found', 'warning');
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error('File Download Failed', this.constantsService.infoMessages.error);
        console.log(error);
      });
  }

  saveOrUpdateATM(params, isEdit) {
    if (parseFloat(params.data.BeginAmount) < 100) {
      this.toastr.warning('Begin Amount should be greater than or equal 100', 'Warning');
      return;
    } else if (parseFloat(params.data.BeginAmount) > 100000) {
      this.toastr.warning('Begin Amount should be less than or equal 100000', 'Warning');
      return;
    }
    let endAmount = parseFloat(params.data.BeginAmount) + parseFloat(params.data.InputAmount) - parseFloat(params.data.DispensedAmount);
    if (endAmount < 0) {
      this.toastr.warning("Please enter the amount less than the total of the " + this.utilityService.formatDecimalCurrencyWithCommaSeparated(parseFloat(params.data.BeginAmount) + parseFloat(params.data.InputAmount)));
      return;
    }
    let requestATMData = {
      "atmTransactionID": params.data.ATMTransactionID,
      "movementHeaderID": params.data.MovementHeaderID,
      "storeLocationID": params.data.StoreLocationID,
      "beginAmount": Number(params.data.BeginAmount ? params.data.BeginAmount : 0),
      "noOfTransactions": Number(params.data.NoOfTransactions),
      "inputAmount": Number(params.data.InputAmount ? params.data.InputAmount : 0),
      "dispensedAmount": Number(params.data.DispensedAmount ? params.data.DispensedAmount : 0),
      "endAmount": endAmount,
      "transactionDate": moment(params.data.TransactionDate).format('YYYY-MM-DD'),
      "docuPath": params.data.DocuPath,
      "createdBy": params.data.CreatedBy,
      "createdDateTime": moment(params.data.CreatedDateTime).format('YYYY-MM-DD'),
      "lastModifiedBy": params.data.LastModifiedBy,
      "lastModifiedDateTime": moment(params.data.LastModifiedDateTime).format('YYYY-MM-DD'),
      "files": this.updateATMFiles,
      "isOverRide": false
    }

    this.spinner.show();
    this.setupService.postData("ShiftATMTransaction/SaveShiftATMTransactions", requestATMData).subscribe(
      (response) => {
        this.spinner.hide();
        console.log(response);
        if (response) {
          if (response.statusCode && response.statusCode === 204) {
            this.toastr.error('Please Enter Valid Data', this.constantsService.infoMessages.error);
          } else if (response.result && response.result.validationErrors.length > 0) {
            this.confirmationDialogService.confirm('',
              response.result.validationErrors[0].errorMessage)
              .then(() => {
                this.confirmAddNew(requestATMData);
              }).catch(() => console.log('User dismissed the dialog'));
          } else {
            this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
            this.newATMAdded = false;
            this.getShiftAtmTransactions();
          }
        } else {
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(
          this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        console.log(error);
      }
    );
    this.updateATMFiles = [];
  }

  confirmAddNew(requestATMData) {
    this.spinner.show();
    requestATMData.isOverRide = true;
    this.setupService.postData(`ShiftATMTransaction/SaveShiftATMTransactions`, requestATMData).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
          this.newATMAdded = false;
          this.getShiftAtmTransactions();
        } else {
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        }
      },
      (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        console.log(error);
      }
    );
  }

  deleteATM(params) {
    this.spinner.show();
    this.setupService.deleteData("ShiftATMTransaction/" + params.data.ATMTransactionID)
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) >= 0) {
            this.toastr.success(
              this.constantsService.infoMessages.deletedRecord,
              this.constantsService.infoMessages.success
            );
            this.getShiftAtmTransactions();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.deleteRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.deleteRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
  }

  calculateBankDeposit() {
    let posCash = _.filter(this.editableRowData, function (o) {
      return o.mopName.trim() === "CASH";
    });
    this.totalBankDeposit = posCash[0] ? posCash[0].mopAmount : 0;
    if (this.payOutFromPOS < this.reconciledPayOut) {
      this.totalBankDeposit = this.totalBankDeposit - this.reconciledPayOut;
    } else {
      this.totalBankDeposit = this.totalBankDeposit - this.payOutFromPOS;
    }
    this.totalBankDeposit = this.totalBankDeposit - this.refundsAmount;
    this.splitAmountChange();
    let totalSum = _.sumBy(this.availableBanks.filter((bank) => bank.BankAccountTypeID === 1), function (o: any) { return o.Amount !== "" ? parseFloat(o.Amount.toString().replace(/,/g, '')) : 0; });
    if (totalSum > 0) {
      this.totalBankDepositFDispaly = totalSum;
    } else {
      this.totalBankDepositFDispaly = this.totalBankDeposit;
    }
    this.spinner.hide();
  }

  splitAmountChange() {
    if (this.availableBanks && this.availableBanks.length > 0) {
      this.lotteryBankDeposit = 0;
      let otherAmount = 0;
      this.availableBanks.forEach(k => {
        if (k.BankAccountTypeID) {
          if (k.BankAccountTypeID === 3) {//"lottery account"
            this.isLotteryBankAvailable = true;
            if (!k.Amount || k.Amount === 0) {
              k.Amount = this.lotteryDepositAmount;
              this.lotteryBankDeposit += this.lotteryDepositAmount;
            } else {
              this.lotteryBankDeposit += k.Amount;
            }
            this.totalBankDeposit = this.totalBankDeposit - this.lotteryDepositAmount;
          }
          if (k.BankAccountTypeID === 5 && k.Amount === 0) {//atm account
            k.Amount = this.transactionForm.controls.InputAmount.value;
          }
          if (k.BankAccountTypeID !== 1 && k.BankAccountTypeID !== 3 && k.BankAccountTypeID !== 5) {
            otherAmount += (k.Amount ? parseFloat(k.Amount.toString().replace(/,/g, '')) : 0);
          }
          if (k.BankAccountTypeID === 5 && !k.IsCheck) {
            otherAmount += (k.Amount ? parseFloat(k.Amount.toString().replace(/,/g, '')) : 0);
          }
        }
      });
      if (this.totalBankDeposit < otherAmount) {
        this.toastr.warning(
          this.constantsService.infoMessages.splitDepositValidation,
          this.constantsService.infoMessages.warning
        );
        return;
      }
      let groupByBankName = _.groupBy(this.availableBanks.filter((bank) => bank.BankAccountTypeID === 1), record => record.BankNickName);
      let operativeAmount = this.totalBankDeposit - otherAmount + this.totalIncome;
      this.availableBanks.forEach(k => {
        if (k.BankAccountTypeID) {
          if (k.BankAccountTypeID === 1 && k.Amount === 0 && k.BankDepositID === 0) {//"operative account", population initial amount only for new data
            k.Amount = operativeAmount / Object.keys(groupByBankName).length;
          }
        }
      });
    }
  }


  addNewBank() {
    let totalSum = _.sumBy(this.availableBanks, function (o: any) { return o.Amount !== "" ? parseFloat(o.Amount.toString().replace(/,/g, '')) : 0; });
    // if (this.totalBankDeposit < totalSum) {
    //   this.toastr.error("No more amount left to add");
    //   return;
    // }

    let bankGridRowData = [];
    this.bankGridApi.forEachNode(function (node) {
      bankGridRowData.push(node.data);
    });
    let newBankData = {
      "BankDepositID": Array.from({ length: bankGridRowData[0].BankDepositID.length }, (v) => 0),
      "BankAccountTypeID": bankGridRowData[0].BankAccountTypeID,
      "BankAccountTypeName": bankGridRowData[0].BankAccountTypeName,
      "BankNickName": bankGridRowData[0].BankNickName,
      "MovementHeaderID": bankGridRowData[0].MovementHeaderID,
      "SrNO": bankGridRowData.length + 1,
      "StoreBankID": bankGridRowData[0].StoreBankID,
      "StoreLocationID": bankGridRowData[0].StoreLocationID
    }
    newBankData.BankNickName.forEach(element => {
      newBankData[element + '_Amount'] = 0;
    });
    let groupByBankName = newBankData.BankAccountTypeID.filter((BankAccountTypeID) => BankAccountTypeID === 1);
    let operativeAmount = this.totalBankDeposit + this.totalIncome - totalSum;
    newBankData.BankAccountTypeID.forEach((k, i) => {
      let amount = newBankData[newBankData.BankNickName[i] + '_Amount'];
      if (k === 1) {//"operative account", population initial amount only for new data
        amount = operativeAmount / groupByBankName.length;
      }
      newBankData[newBankData.BankNickName[i] + '_Amount'] = this.commonService.setMoneyFormat(amount);
    });
    bankGridRowData.push(newBankData);
    this.bankGridApi.setRowData(bankGridRowData);
  }

  generateBankGridCol(banksList) {
    if (this.bankGridApi) {
      this.bankGridApi.setColumnDefs([]);
    }
    //Creating Columns
    this.bankDepositGridCols = [];
    let groupByBank: any = _.groupBy(banksList, record => record.BankNickName);
    for (let bankNickName of Object.keys(groupByBank)) {
      this.bankDepositGridCols.push({
        headerName: bankNickName, field: bankNickName + '_Amount', width: 110, minWidth: 110, headerClass: 'header-text-center', cellStyle: { 'text-align': 'right' }, editable: true, cellEditor: 'numericEditor', cellRenderer: (params) => {
          return this.utilityService.formatDecimalCurrencyWithCommaSeparated(params.value ? parseFloat(params.value.toString().replace(/,/g, '')) : 0);
        }
      });
    }
    this.bankDepositGridCols.unshift({
      headerName: 'Sr No', field: 'SrNO', width: 90, minWidth: 90, cellStyle: { 'text-align': 'center' }
    });
    this.bankDepositGridCols.push({
      headerName: 'Actions', field: 'action', colId: 'params', cellRenderer: 'CellActionRenderer', width: 60, minWidth: 60,
      cellRendererParams: {
        hideEditAction: false, isSaveRequired: false, hideDeleteAction: true, isBankGrid: true
      }
    });

    //Creating rows
    let groupBySrNO: any = _.groupBy(banksList, record => record.SrNO);
    this.bankDepositGridData = [];
    for (let banksBySNO of Object.keys(groupBySrNO)) {
      let bankData = {
        "BankAccountTypeID": _.map(groupBySrNO[banksBySNO], 'BankAccountTypeID'),
        "BankAccountTypeName": _.map(groupBySrNO[banksBySNO], 'BankAccountTypeName'),
        "BankDepositID": _.map(groupBySrNO[banksBySNO], 'BankDepositID'),
        "BankNickName": _.map(groupBySrNO[banksBySNO], 'BankNickName'),
        "MovementHeaderID": groupBySrNO[banksBySNO][0].MovementHeaderID,
        "SrNO": Number(banksBySNO) === 0 ? Object.keys(groupBySrNO).length : banksBySNO,
        "StoreBankID": _.map(groupBySrNO[banksBySNO], 'StoreBankID'),
        "StoreLocationID": groupBySrNO[banksBySNO][0].StoreLocationID
      }
      groupBySrNO[banksBySNO].forEach(element => {
        bankData[element.BankNickName + '_Amount'] = element.Amount;
      });
      this.bankDepositGridData.push(bankData);
    }
    if (this.bankGridApi) {
      this.bankGridApi.setColumnDefs(this.bankDepositGridCols);
      this.bankGridApi.setRowData(this.bankDepositGridData);
      this.bankGridApi.sizeColumnsToFit();
    }
  }

  saveOrUpdateBank(params, isEdit) {
    this.spinner.show();
    let bankDepositData = params.data;
    let validData = false;
    let updateData = [];
    _.forEach(bankDepositData.BankDepositID, (value, index) => {
      let postData = {
        "bankDepositID": bankDepositData.BankDepositID[index],
        "movementHeaderID": bankDepositData.MovementHeaderID,
        "storeBankID": bankDepositData.StoreBankID[index],
        "amount": bankDepositData[bankDepositData.BankNickName[index] + '_Amount'],
        "lastModifiedBy": this.userInfo.userName,
        // "lastModifiedDateTime": moment().format('YYYY-MM-DD'),
        "srNO": bankDepositData.SrNO,
        "bankNickName": bankDepositData.BankNickName[index],
        "bankAccountTypeID": bankDepositData.BankAccountTypeID[index],
        "bankAccountTypeName": bankDepositData.BankAccountTypeName[index],
        "isCheck": true
      }
      if (Number(postData.amount) > 0) {
        validData = true;
      }
      updateData.push(postData);
    });
    if (!validData) {
      this.spinner.hide();
      this.toastr.error(
        "Please Enter Details",
        this.constantsService.infoMessages.error
      );
      return;
    }
    //other rows
    // let rowCalc = 0.0;
    // let allRowsData = this.getRowData(this.bankGridApi);
    // let filteredMops = _.filter(allRowsData, data => data.SrNO !== bankDepositData.SrNO);
    // filteredMops.forEach(element => {
    //   element.BankNickName.forEach(element2 => {
    //     rowCalc += element[element2 + '_Amount'].toString() !== "" ? parseFloat(element[element2 + '_Amount'].toString().replace(/,/g, '')) : 0;
    //   });
    // });
    // //current row
    // rowCalc += _.sumBy(updateData, function (o: any) { return o.amount !== "" ? parseFloat(o.amount.toString().replace(/,/g, '')) : 0; });
    // if (this.totalBankDeposit < rowCalc) {
    //   this.spinner.hide();
    //   this.toastr.error("Amount entered is more than bank deposit.");
    //   return;
    // }
    if (updateData[0].bankDepositID === 0) {
      this.setupService.postData("BankDeposits/AddBulkDeposit", updateData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getBanks();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    } else {
      this.setupService.updateData("BankDeposits", updateData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.toastr.success(
              this.constantsService.infoMessages.updatedRecord,
              this.constantsService.infoMessages.success
            );
            this.getBanks();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.updateRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.updateRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
    }
  }

  deleteBank(params) {
    this.spinner.show();
    this.setupService
      .deleteData("BankDeposits/DeleteSelected?BankDepositIDs=" + params.data.BankDepositID.toString())
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response && Number(response[0].data) >= 0) {
            this.toastr.success(
              this.constantsService.infoMessages.deletedRecord,
              this.constantsService.infoMessages.success
            );
            this.getBanks();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.deleteRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
        },
        (error) => {
          this.spinner.hide();
          this.toastr.error(
            this.constantsService.infoMessages.deleteRecordFailed,
            this.constantsService.infoMessages.error
          );
          console.log(error);
        }
      );
  }

  onCellValueChangedBank(params) {
    let allRowsData = this.getRowData(this.bankGridApi);
    let filteredMops = _.filter(allRowsData, data => data.SrNO !== params.data.SrNO);
    let rowCalc = 0.0;
    //other rows
    filteredMops.forEach(element => {
      element.BankNickName.forEach(element2 => {
        rowCalc += element[element2 + '_Amount'].toString() !== "" ? parseFloat(element[element2 + '_Amount'].toString().replace(/,/g, '')) : 0;
      });
    });
    //current row
    params.data.BankNickName.forEach(element => {
      rowCalc += params.data[element + '_Amount'].toString() !== "" ? parseFloat(params.data[element + '_Amount'].toString().replace(/,/g, '')) : 0;
    });
    // if (this.totalBankDeposit < rowCalc) {
    //   this.toastr.error("Amount entered is more than bank deposit.");
    // }
  }
}
