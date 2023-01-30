import { Component, ElementRef, Input, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, NgbPanelChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@shared/services/commmon/common.service';
import { MessageService } from '@shared/services/commmon/message-Service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { GridService } from '@shared/services/grid/grid.service';
import { PDFGenrateService } from '@shared/services/pdf-genrate/pdf-genrate.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-day-recon-details',
  templateUrl: './day-recon-details.component.html',
  styleUrls: ['./day-recon-details.component.scss']
})
export class DayReconDetailsComponent implements OnInit, OnDestroy {

  @Input() dayReconDetails: any;
  @Input() storeLocationID: any;
  @Input() shiftWiseValue: any;
  @Input() movementHeaderID: any;
  @Input() dayReconData: any;
  // @Output() backToDayReconList: EventEmitter<any> = new EventEmitter();

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
  networkCardsRowData: any[] = [];
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
  totalMopAmount = 0;
  totalMopAmountForShortOver = 0;
  deptDetailrowData: any;
  totalFuelGradeSalesVolume: any = 0;
  totalFuelGradeSalesAmount: any = 0;
  deptGridApi: any;
  shortOver = 0;
  bankDepositEditableGridOptions: any;

  deprttotalAmount = 0;
  // add new code
  saleTaxObj: any;
  totalPosSales = 0;
  totalBankDeposit = 0;
  depositGridApi: any;
  mopDepositArr: any[];
  checkPos: any[];
  initialBankDeposits: any = [];
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
  mopDetailList: any;


  purchaseType: any;//addPurchase||importPurchase
  showAddPurchase: any;
  showImportPurchase: any;
  selectedDateRange: any;

  @ViewChild('viewfilemodal') viewFileModal: TemplateRef<any>;


  importPurchasesForm = this.fb.group({
    vendorid: [null, Validators.required],
    fromDate: moment().format('MM-DD-YYYY'),
    toDate: moment().format('MM-DD-YYYY')
  });
  fileName: any;
  // convenience getter for easy access to form fields

  currentOpenDialog: DialogTypes;

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
    private modalService: NgbModal
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
    this.bankDepositEditableGridOptions = this.editableGrid.getGridOption(
      this.constantsService.editableGridConfig.gridTypes.bankDepositGrid
    );

    this.networkGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.networkCardGrid);
    this.categoryGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.categoryCardGrid);
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('movementHeaderID');
    sessionStorage.removeItem('detailTableData');
    sessionStorage.removeItem('showDetailsTable');
  }

  ngOnInit() {
    sessionStorage.setItem('movementHeaderID', this.movementHeaderID);
    const dateRange = { fDate: moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'), tDate: moment(this.dayReconData.selectedDate).format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
    setTimeout(() => {
      this.messageService.sendMessage("expanded_collaps");
    });
    this.getPurchases();
    this.saleTaxObj = this.dayReconData.saleTaxObj;
    this.getPromotionsList();
    this.getVendorByCompanyId();
    this.purchaseType = "addPurchase";
    this.showAddPurchase = false;
    this.showImportPurchase = true;
    this.getNetworkCardDetails();
    // this.getCategoryCardDetails();
  }

  onDialogOpen(e: Event, type: DialogTypes) {
    e.preventDefault();
    this.currentOpenDialog = type;
  }

  onDialogClose(type: DialogTypes) {
    this.currentOpenDialog = null;
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

  getMOPFuelDetails(response) {
    this.isMOPFuelLoaded = false;
    this.rowData = response[0];
    if (this.gasDetailGridAPI)
      this.gasDetailGridAPI.sizeColumnsToFit();
    this.editableRowData = response[1];
    if (this.gridApi)
      this.gridApi.sizeColumnsToFit();
    if (this.rowData && this.rowData.length > 0) {
      this.totalFuelGradeSalesAmount = this.rowData.reduce(
        (acc, i) => acc + i.FuelGradeSalesAmount,
        0
      );
      this.totalFuelGradeSalesVolume = this.rowData.reduce(
        (acc, i) => acc + i.FuelGradeSalesVolume,
        0
      );
      this.setSumSalePOS();
    }
    if (this.editableRowData.length > 0) {
      this.totalMopAmount = this.editableRowData.reduce(
        (acc, i) => acc + i.MOPAmount,
        0
      );
      let filteredMops = _.filter(this.editableRowData, data => !(data.MOPName.toLowerCase() === "payins" || data.MOPName.toLowerCase() === "discounts" || data.MOPName.toLowerCase() === "refunds"));
      this.totalMopAmountForShortOver = filteredMops.reduce((acc, i) => acc + i.MOPAmount, 0);
      // this.shortOver = Number(this.totalMopAmount) - Number(this.dayReconData.totalPosSales);
      this.setSumSalePOS();
      this.mopDepositArr = _.filter(this.editableRowData, function (x) {
        return (
          x.MOPName.trim() === "CASH" || x.MOPName.trim() === "CHECK"
        );
      });
      this.checkPos = _.filter(this.editableRowData, function (o) {
        return o.MOPName.trim() === "CHECK";
      });
      this.isMOPFuelLoaded = true;
    }
    this.deptDetailrowData = [];
    this.deptDetailrowData = response[2].map((x) => {
      if (x.DepartmentTypeID && x.DepartmentTypeID === 5)
        this.lotteryAmount += (x.NONUPCSalesAmt + x.SalesAmount);
      if (x.DepartmentTypeID && x.DepartmentTypeID === 7)
        this.lottoAmount += (x.NONUPCSalesAmt + x.SalesAmount);
      if (x.DepartmentTypeID && x.DepartmentTypeID === 26)
        this.lottoPayoutAmount += (x.NONUPCSalesAmt + x.SalesAmount);
      return {
        ...x,
        typeOfSell: "Type of Sale: " + x.DepartmentTypeName,
      };
    });
    if (this.lottoPayoutAmount < 0) this.lottoPayoutAmount = this.lottoPayoutAmount * -1;
    this.lotteryDepositAmount = this.lotteryAmount + this.lottoAmount - this.lottoPayoutAmount;
    const sumDe = this.deptDetailrowData.reduce(
      (acc, i) => acc + (i.NONUPCSalesAmt + i.SalesAmount),
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
        this.mopDetailList = response;
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
    this.setupService.getData("MovementHeader/GetMOPsalesByMHID/" + this.movementHeaderID).subscribe((response) => {
      this.spinner.hide();
      this.editableRowData = response;
      if (this.editableRowData.length > 0) {
        this.totalMopAmount = this.editableRowData.reduce((acc, i) => acc + i.MOPAmount, 0);
        let filteredMops = _.filter(this.editableRowData, data => !(data.MOPName.toLowerCase() === "payins" || data.MOPName.toLowerCase() === "discounts" || data.MOPName.toLowerCase() === "refunds"));
        this.totalMopAmountForShortOver = filteredMops.reduce((acc, i) => acc + i.MOPAmount, 0);
        const saleTax = (this.shortOver =
          Number(this.totalMopAmountForShortOver) -
          Number(
            this.saleTaxObj.totalAmount +
            this.totalFuelGradeSalesAmount +
            this.deprttotalAmount
          ) - Number(this.refundsAmount));

        this.mopDepositArr = _.filter(this.editableRowData, function (x) {
          return (
            x.MOPName.trim() === "CASH" || x.MOPName.trim() === "CHECK"
          );
        });
      }
      // this.gridApi.sizeColumnsToFit();
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
    // this.addrow = this.addrow + 1;
    // this.getRowData();
    this.getStartEditingCell("mopName", 0);
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
            // this.getMOPList();
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

  deptDetails() {
    const postData = {
      MovementHeaderID: this.movementHeaderID,
      StoreLocationID: this.storeLocationID,
      Shiftwisevalue: this.shiftWiseValue.value,
    };

    this.spinner.show();
    this.setupService
      .getData(
        "StoreFuelGrade/GetMCMbyMHID/" +
        postData.MovementHeaderID
      )
      .subscribe(
        (response) => {
          this.spinner.hide();
          this.deptDetailrowData = [];
          this.deptDetailrowData = response.map((x) => {
            if (x.DepartmentTypeID && x.DepartmentTypeID === 5)
              this.lotteryAmount += (x.NONUPCSalesAmt + x.SalesAmount);
            if (x.DepartmentTypeID && x.DepartmentTypeID === 7)
              this.lottoAmount += (x.NONUPCSalesAmt + x.SalesAmount);
            if (x.DepartmentTypeID && x.DepartmentTypeID === 26)
              this.lottoPayoutAmount += (x.NONUPCSalesAmt + x.SalesAmount);
            return {
              ...x,
              typeOfSell: "Type of Sale: " + x.DepartmentTypeName,
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
                (acc, i) => acc + (i.NONUPCSalesAmt + i.SalesAmount),
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
      console.log(this.deptDetailrowData);
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
  // onCellValueChanged(params) {
  //   if (
  //     params.data.totalQty === null ||
  //     params.data.totalAmount === null ||
  //     !params.data.departmentSalesMovementDetailID
  //   ) {
  //     return;
  //   }
  //   this.spinner.show();
  //   // tslint:disable-next-line:max-line-length
  //   this.setupService
  //     .updateData(
  //       `ISMDetail/UpdateSalesForISMDetail/${params.data.departmentSalesMovementDetailID}/${params.data.totalAmount}/${params.data.totalQty}`,
  //       ""
  //     )
  //     .subscribe(
  //       (res) => {
  //         this.spinner.hide();
  //         if (res && Number(res) > 0) {
  //           this.toastr.success(
  //             this.constantsService.infoMessages.updatedRecord,
  //             "success"
  //           );
  //           this.deptDetails();
  //         } else {
  //           this.toastr.error(
  //             this.constantsService.infoMessages.updateRecordFailed,
  //             "error"
  //           );
  //         }
  //       },
  //       (err) => {
  //         this.spinner.hide();
  //         this.toastr.error(
  //           this.constantsService.infoMessages.updateRecordFailed,
  //           "error"
  //         );
  //       }
  //     );
  // }
  bankDepositOnGridReady(params) {
    this.depositGridApi = params.api;
    params.api.sizeColumnsToFit();
  }

  printDayRecon() {
    const block1 = {
      totalAmount: this.saleTaxObj.totalAmount.toFixed(2),
      totalPosSales: this.totalPosSales.toFixed(2),
      totalMopAmount: this.totalMopAmount.toFixed(2),
      shortOver: this.shortOver.toFixed(2),
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
    block3.push([
      { text: "Grade" },
      { text: "Avg Cost/Gal" },
      { text: "Volume" },
      { text: "Amount" },
    ]);

    for (const key in this.rowData) {
      if (this.rowData.hasOwnProperty(key)) {
        const data = this.rowData[key];
        const fila = new Array();
        fila.push({
          text: data.StoreFuelGradeName.toString(),
          border: [false, false, false, false],
        });
        let avgCost = data.FuelGradeSalesAmount / data.FuelGradeSalesVolume;
        fila.push({
          text: "$" + avgCost.toFixed(2).toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.FuelGradeSalesVolume.toFixed(2).toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.FuelGradeSalesAmount.toFixed(2).toString(),
          border: [false, false, false, false],
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
    });
    filas.push({
      text: "$" + this.totalFuelGradeSalesAmount.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block3.push(filas);

    block4.push([
      { text: "MOP Name" },
      { text: "MOP Count" },
      { text: "MOP Amount" },
    ]);

    for (const key in this.editableRowData) {
      if (this.editableRowData.hasOwnProperty(key)) {
        const data = this.editableRowData[key];
        const fila = new Array();
        fila.push({
          text: data.MOPName.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: data.MOPCount.toString(),
          border: [false, false, false, false],
        });
        fila.push({
          text: "$" + data.MOPAmount.toString(),
          border: [false, false, false, false],
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
      text: "$" + this.totalMopAmount.toFixed(2).toString(),
      border: [false, false, false, false],
      fontSize: 10,
    });
    block4.push(mopFile);

    block2.push([{ text: "Name" }, { text: "Value" }, { text: "Count" }]);

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
        });
        fila.push({
          text: data.countValue.toString(),
          border: [false, false, false, false],
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

    block7.push([{ text: "Sales Discription" }, { text: "Amount" }]);
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
          text: "$" + data.totalAmount.toFixed(3).toString(),
          border: [false, false, false, false],
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
      text: "$" + Number(salesTotal).toFixed(3).toString(),
      border: [false, false, false, false],
      fontSize: 10,
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
      [], [], [],
      this.dayReconData.selectedDate,
      this.shiftWiseValue.name,
      this.dayReconData.storeName,
      this.dayReconData.stroeAddress
    );
  }




  @ViewChild('fileInput')
  myInputVariable: ElementRef;
  closeSideContainer() {
    // this.incomeDocumentFiles = [];
    this.myInputVariable.nativeElement.value = "";
    // this.addIncomeForm.reset();
    document.getElementById("overlay").style.display = "none";
    this.addContainer = "side-container-close";
  }

  closePurchaseSideContainer() {
    // this.invoiceImageFile = null;
    // this.invoiceImageURL = null;
    // this.purchaseInvDate = null;
    // this.addPurchasesForm.reset();
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

  getVendorByCompanyId() {
    this.setupService.getData('Vendor/getAll/' + this.userInfo.companyId).subscribe(
      (response) => {
        this.vendorList = response;
      },
      (error) => {
        console.log(error);
      }
    );
  }

  getPurchases() {
    this.spinner.show();
    this.reconciledPayOut = 0.0;
    this.unreconciledPay = 0.0;
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
      this.setupService.getData("BankDeposits/GetBankDeposits/" + this.storeLocationID + "/" + this.movementHeaderID),
      this.setupService.getData('IncomeExpense/GetPayInpayoutsFromPOS?MovementHeaderID=' + this.movementHeaderID +
        '&shiftWiseValue=' + this.shiftWiseValue.value)
    ).subscribe((response) => {
      this.getMOPFuelDetails(response[0]);
      let purchases = response[1].purchases;
      let expenses = response[1].expense;
      let income = response[1].income;
      let fuel = response[1].fuelData;
      this.availableBanks = response[2];
      let posPayInPayouts = response[3];

      this.purchasesRowData = [];
      this.totalTransactions = 0;
      this.totalPurchaseAmount = 0.0;
      this.totalIncome = 0.0;

      if (posPayInPayouts && posPayInPayouts.length > 0) {
        for (let posData of posPayInPayouts) {
          if (posData.miscellaneousSummaryCode.toLowerCase() === "payouts") {
            this.payOutFromPOS = posData.amount.toFixed(2);
          } else if (posData.miscellaneousSummaryCode.toLowerCase() === "payin") {
            this.payInFromPOS = posData.amount.toFixed(2);
          }
        }
      }

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
      this.spinner.hide();
    },
      (error) => {
        console.log(error);
      }
    );
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
      }, (error) => {
        console.log(error);
      });
  }
  depositCancel() {
    if (this.availableBanks && this.availableBanks.length > 0) {
      this.availableBanks.forEach(k => {
        this.initialBankDeposits.forEach(i => {
          if (k.BankAccountTypeName == i.accountType)
            k.Amount = this.commonService.setMoneyFormat(i.amount);
        })
      })
    }
  }

  splitAmountChange(event, bankTypeID, isInitial) {
    if (this.availableBanks && this.availableBanks.length > 0) {
      let otherAmount = 0;
      this.availableBanks.forEach(k => {
        if (k.BankAccountTypeID) {
          if (k.BankAccountTypeID === 3) {//"lottery account"
            this.isLotteryBankAvailable = true;
            if (!k.Amount || k.Amount === 0) {
              k.Amount = this.lotteryDepositAmount;
              this.lotteryBankDeposit = this.lotteryDepositAmount;
            } else
              this.lotteryBankDeposit = k.Amount;
            if (isInitial) {
              this.totalBankDeposit = this.totalBankDeposit - this.lotteryDepositAmount;
            }
          }
          if (isInitial && k.BankAccountTypeID === 5 && k.Amount === 0) {//atm account
            // k.Amount = this.transactionForm.controls.InputAmount.value;
          }
          if (k.BankAccountTypeID !== 1 && k.BankAccountTypeID !== 3 && k.BankAccountTypeID !== 5) {
            otherAmount += (k.Amount ? parseFloat(k.Amount.toString().replace(/,/g, '')) : 0);
          }
          if (k.BankAccountTypeID === 5 && !k.IsCheck) {
            otherAmount += (k.Amount ? parseFloat(k.Amount.toString().replace(/,/g, '')) : 0);
          }
        }
      });
      if (this.totalBankDeposit < otherAmount && event) {
        this.toastr.warning(
          this.constantsService.infoMessages.splitDepositValidation,
          this.constantsService.infoMessages.warning
        );
        this.availableBanks.forEach(k => {
          if (k.BankAccountTypeID == bankTypeID)
            k.Amount = k.previousAmount;
        });
        event.preventDefault();
        return;
      }
      this.availableBanks.forEach(k => {
        if (k.BankAccountTypeID) {
          if (isInitial) {
            if (k.BankAccountTypeID === 1 && k.Amount === 0) {//"operative account"
              k.Amount = this.totalBankDeposit - otherAmount + this.totalIncome;
              k.originalAmount = k.Amount;
              k.Amount = this.commonService.setMoneyFormat(k.Amount);
            } else if (k.BankAccountTypeID === 1) {
              this.totalBankDeposit = k.Amount;
              k.originalAmount = k.Amount;
            }
            this.initialBankDeposits.push({ accountTypeID: k.BankAccountTypeID, accountType: k.BankAccountTypeName, amount: (k.Amount ? parseFloat(k.Amount.toString().replace(/,/g, '')) : 0) });
            k.Amount = this.commonService.setMoneyFormat(k.Amount);
            k.previousAmount = this.commonService.setMoneyFormat(k.Amount);
          } else {
            if (k.BankAccountTypeID === 1 && bankTypeID !== 1) {//"operative account"
              k.Amount = k.originalAmount - otherAmount + this.totalIncome;
              k.Amount = this.commonService.setMoneyFormat(k.Amount);
            } else if (k.BankAccountTypeID === 1 && bankTypeID === 1) {
              if (typeof k.Amount === 'string') k.Amount = k.Amount.replace(/,/g, '');
              k.originalAmount = k.Amount;
              // k.Amount = this.commonService.setMoneyFormat(k.Amount);
            }
          }
        }
      });
    }
  }

  depositKeyDown(bankTypeId) {
    this.availableBanks.forEach(k => {
      if (k.BankAccountTypeID == bankTypeId)
        k.previousAmount = k.Amount;
    });
  }

  saveSplitDeposit() {
    let postData = [];
    this.availableBanks.forEach(k => {
      postData.push({
        "bankDepositID": k.BankDepositID ? k.BankDepositID : 0,
        "movementHeaderID": this.movementHeaderID,
        "storeBankID": k.StoreBankID,
        "amount": (k.Amount ? parseFloat(k.Amount.replace('$', '').replace(/,/g, '')) : 0),
        "lastModifiedBy": this.userInfo.userName,
        "lastModifiedDateTime": new Date,
        "createdDateTime": new Date,
        "bankNickName": k.BankNickName,
        "bankAccountTypeID": k.BankAccountTypeID,
        "bankAccountTypeName": k.BankAccountTypeName,
        "IsCheck": k.IsCheck ? k.IsCheck : false
      })
    });
    this.spinner.show();
    this.setupService.postData("BankDeposits/AddBulkDeposit", postData).subscribe(response => {
      this.spinner.hide();
      if (this.availableBanks && this.availableBanks.length > 0) {
        this.getBanks();
        // this.availableBanks.forEach(k => {
        //   this.initialBankDeposits.forEach(i => {
        //     if (k.BankAccountTypeID == i.accountTypeID)
        //       i.amount = this.commonService.setMoneyFormat(k.Amount);
        //     if (k.BankAccountTypeID === 3) {//"lottery account"
        //       this.lotteryBankDeposit = k.Amount;
        //     }
        //   });
        // });
      }
      this.toastr.success(
        this.constantsService.infoMessages.updatedRecord,
        this.constantsService.infoMessages.success
      );
    });
  }

  public toggleAccordian(props: NgbPanelChangeEvent): void {
    // if (props.nextState && props.panelId === 'salespanel-4') {
    //   this.getBanks();
    // }
  }

  calculateBankDeposit() {
    let posCash = _.filter(this.editableRowData, function (o) {
      return o.MOPName.trim() === "CASH";
    });
    this.totalBankDeposit = posCash[0] ? posCash[0].MOPAmount : 0;
    if (this.payOutFromPOS < this.reconciledPayOut) {
      this.totalBankDeposit = this.totalBankDeposit - this.reconciledPayOut;
    } else {
      this.totalBankDeposit = this.totalBankDeposit - this.payOutFromPOS;
    }
    this.totalBankDeposit = this.totalBankDeposit - this.refundsAmount;
    this.splitAmountChange('', '', true);
    this.spinner.hide();
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

  mopForm = new FormGroup({
    mopName: new FormControl(null, Validators.required),
    mopCount: new FormControl(0, Validators.required),
    mopAmount: new FormControl(0, Validators.required),
    mopDetailID: new FormControl(0)
  });

  get mopName() { return this.mopForm.get('mopName'); }
  get mopCount() { return this.mopForm.get('mopCount'); }
  get mopAmount() { return this.mopForm.get('mopAmount'); }
  get mopDetailID() { return this.mopForm.get('mopDetailID'); }

  addMOP(mopModel) {
    this.getMOPList();
    this.mopForm.reset();
    this.mopForm.get("mopDetailID").setValue(0);
    this.modalService.open(mopModel, { centered: true });
  }

  editMOP(params, mopModel) {
    this.getMOPList();
    this.mopForm.patchValue({
      mopName: params.MOPName,
      mopCount: params.MOPCount,
      mopAmount: params.MOPAmount,
      mopDetailID: params.MOPDetailID
    });
    this.modalService.open(mopModel, { centered: true });
  }

  saveMOP(params) {
    let selectedMOPName: any;
    this.commonService.mopDetailList.map((i) => {
      if (i.mopName === params.value.mopName) {
        selectedMOPName = i;
      }
    });
    if (selectedMOPName === null) {
      this.toastr.error(
        this.constantsService.infoMessages.contactAdmin,
        this.constantsService.infoMessages.error
      );
      this.modalService.dismissAll();
      return;
    }
    const postData = {
      mopDetailID: params.value.mopDetailID,
      movementHeaderID: this.movementHeaderID,
      storeLocationMOPID: selectedMOPName.storeLocationMOPID,
      mopCount: params.value.mopCount,
      mopAmount: params.value.mopAmount,
      isUserAdded: params.value.mopDetailID !== 0 ? 0 : 1,
      storeLocationID: this.storeLocationID,
      storeMOPNo: selectedMOPName
        ? selectedMOPName.storeMOPNo
        : params.value.storeMOPNo,
      mopName: selectedMOPName ? selectedMOPName.mopName : params.value.mopName,
    };
    if (params.value.mopDetailID === 0) {
      this.spinner.show();
      this.setupService.postData("MOPDetail", postData).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.mopDetailID > 0) {
            this.toastr.success(
              this.constantsService.infoMessages.addedRecord,
              this.constantsService.infoMessages.success
            );
            this.getMOPDetails();
            // this.getMOPList();
          } else {
            this.toastr.error(
              this.constantsService.infoMessages.addRecordFailed,
              this.constantsService.infoMessages.error
            );
          }
          this.modalService.dismissAll();
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
          this.modalService.dismissAll();
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
}


type DialogTypes =
  | 'transaction'
  | 'atm-deposit'
  | 'bank-deposit'
  | 'department-sales'
  | 'category'
  | 'promotions'
  | 'network'
  | 'salesByDepartment';