// module
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { get as _get } from 'lodash';

// types
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridService } from '@shared/services/grid/grid.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'day-recon-transaction',
  templateUrl: 'transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onUpdate: EventEmitter<any> = new EventEmitter();

  @Input() dayReconData: any;
  @Input() storeLocationID: any;
  @Input() totalTransactions: any;
  @Input() reconciledPayOut: any;
  @Input() unreconciledPay: any;
  @Input() movementHeaderID: any;
  @Input() purchasesRowData: any = [];
  vendorList: any = [];

  // navItems: NavItem[] = [
  //   {
  //     id: 'income',
  //     label: 'Income',
  //     onClick: () => {
  //       this.activeItemId = 'income';
  //     },
  //   },
  //   {
  //     id: 'expense',
  //     label: 'Expense',
  //     onClick: () => {
  //       this.activeItemId = 'expense';
  //     },
  //   },
  // ];
  activeItemId: 'income' | 'expense';

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private constantsService: ConstantService,
    private setupService: SetupService, private gridService: GridService, private toastr: ToastrService) { }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.importPurchasesGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.importPurchasesGrid);
    this.importFuelPurchasesGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.importFuelPurchasesGrid);
    this.purchasesGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.purchasesGrid);
    this.activeItemId = 'income';
    this.purchasesGridOptions.rowHeight = 45;
  }

  ngOnChanges(changes) {
    if (_get(changes, 'isOpen.currentValue', false)) {
      this.activeItemId = 'income';
    }
  }

  onDialogClose(e: any) {
    this.onClose.emit('transaction');
  }

  isExpense: boolean = false;
  showAddPurchases: any = false;
  showAddIncExp: any = false;
  showSaveIncomeCheckNum: any = false;
  showTransactions: any = true;

  addIncomeForm = this.fb.group({
    ChartOfAccountCategoryID: [null],
    Amount: [null, Validators.required],
    Notes: [null],
    VendorID: [null, Validators.required],
    paymentSourceID: [null, Validators.required],
    methodOfPaymentId: [null, Validators.required],
    CheckNumber: [null]
  });

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

  importPurchasesForm = this.fb.group({
    vendorid: [null, Validators.required],
    fromDate: moment().format('MM-DD-YYYY'),
    toDate: moment().format('MM-DD-YYYY')
  });

  userInfo: any;
  importPurchasesRowData: any;
  importPurchasesGridOptions: any;
  importPurchasesGridAPI: any;

  importFuelPurchasesRowData: any;
  importFuelPurchasesGridOptions: any;
  importFuelPurchasesGridAPI: any;

  purchasesGridOptions: any;
  purchasesGridAPI: any;

  purchaseInvDate: any;
  invoiceImageFile: any;
  invoiceImageURL: any;
  storeBankIDSrcIncome: any;
  storeBankID: any;

  filteredMOPList: any = [];
  paymentSourceList: any = [];
  addPurchasesSubmitted = false;
  selectedChartOfCatc: any = "";
  addIncomeFormSubmitted: any = false;

  incomeDocumentFiles: any;
  incomeDocumentName: any = "";
  incomeDocumentType: any = "";

  get incomeForm() {
    return this.addIncomeForm.controls;
  }

  get purchasesForm() {
    return this.addPurchasesForm.controls;
  }

  openAddIncome($event) {
    this.getVendorByCompanyId(true);
    this.showTransactions = false;
    this.isExpense = false;
    this.showAddPurchases = false;
    this.showAddIncExp = true;
    this.showSaveIncomeCheckNum = false;
    this.addIncomeForm.get('methodOfPaymentId').setValue(null);
    this.addIncomeForm.get('CheckNumber').setValue(null);
    document.getElementById("overlay").style.display = "block";
    // this.addContainer = "side-container-open";
  }

  openAddExpenses($event) {
    this.showTransactions = false;
    this.isExpense = true;
    this.showAddPurchases = false;
    this.showAddIncExp = true;
    this.showSaveIncomeCheckNum = false;
    this.addIncomeForm.get('methodOfPaymentId').setValue(null);
    this.addIncomeForm.get('CheckNumber').setValue(null);
    document.getElementById("overlay").style.display = "block";
    // this.addContainer = "side-container-open";
  }

  openAddPurchases(event) {
    this.showTransactions = false;
    this.showAddPurchases = true;
    this.showAddIncExp = false;
    document.getElementById("overlay").style.display = "block";
    // this.addContainer = "side-container-open";
    this.importPurchase();
  }


  closeUpdates() {
    this.showTransactions = true;
    this.isExpense = false;
    this.showAddPurchases = false;
    this.showAddIncExp = false;
    this.showSaveIncomeCheckNum = false;
  }

  onImportPurchasesGridReady(params) {
    this.importPurchasesGridAPI = params.api;
  }

  onImportFuelPurchasesGridReady(params) {
    this.importFuelPurchasesGridAPI = params.api;
  }


  onPurchasesGridReady(params) {
    this.purchasesGridAPI = params.api;
    params.api.sizeColumnsToFit();
    if (this.purchasesRowData.length > 0) {
      this.purchasesGridAPI.hideOverlay();
    } else {
      this.purchasesGridAPI.showNoRowsOverlay();
    }
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
              this.closeUpdates();
              // this.closePurchaseSideContainer();
              this.toastr.success(
                this.constantsService.infoMessages.addedRecord,
                this.constantsService.infoMessages.success
              );
              this.onUpdate.emit();
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
            // this.closeSideContainer();
            // this.getPurchases();
            this.closeUpdates();
            this.onUpdate.emit();
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

  onAmountFocusOut(event) {
    let amount = Number(this.addIncomeForm.get('Amount').value);
    this.addIncomeForm.get('Amount').setValue(amount.toFixed(2));
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

}
