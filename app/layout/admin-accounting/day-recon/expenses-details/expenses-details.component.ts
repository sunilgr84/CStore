import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { TestService } from '@shared/services/test/test.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-expenses-details',
  templateUrl: './expenses-details.component.html',
  styleUrls: ['./expenses-details.component.scss']
})
export class ExpensesDetailsComponent implements OnInit {

  @Input() storeLocationID: number;
  @Input() movementHeaderID: number;
  @Output() backToDayReconList: EventEmitter<any> = new EventEmitter();
  @Input() inputStatusString: any;
  @Input() currentDate: any;
  gridOptions: any;
  rowData: any;
  vendorList: any;
  inputDate = moment().format('MM-DD-YYYY');
  userInfo = this.constantsService.getUserInfo();
  expensesDetailForm = this.fb.group({

    movementHeaderID: [0],
    storeLocationID: [0],
    description: [''],
    chartOfAccountID: [''],
    amount: [''],
    isExpense: false,
    chartOfAccountCategoryName: [''],
    chartOfAccountName: [''],
    incomeExpenseID: [0],
    discription: [''],
    date: this.inputDate,
    categoryId: [null],
    accStatusId: [null],
    accountId: [null],
    notes: [''],
    // vendorId: [''],
    vendorName: [''],
    vendorID: [null],
    chartOfAccountCategoryID: [''],
    invoiceNo: [null],
  });
  isAddVendor = false;
  filterText: any;
  accountList: any;
  title: any;
  chartOfAccountCategoriesdata: any;
  accountStatusList = [
    { name: 'Deposit', value: 0 },
    { name: 'Withdrawal', value: 1 }
  ];
  initialFormValue: any;
  chartAccountViewDataList: any[];
  isVendorLoading = true;
  invoiceNumberList: any;
  isShowGridWithForm = true;
  isInvoiceNumberLoading: boolean;
  isInvoiceNoInput: boolean;
  paymentSourceList: any[];
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private fb: FormBuilder, private testService: TestService, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private setupService: SetupService, private storeService: StoreService) {
    this.gridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.expensesGrid);
    this.initialFormValue = this.expensesDetailForm.value;
  }

  ngOnInit() {
    this.GetIncomeExpensesbyStore();
    this.setDetails();
    // this.GetChartOfAccountTypeData();
    // this.GetChartAccountViewData();
    this.getVendorByCompanyId();
    this.getPaymentSourceList();
  }
  setDetails() {
    this.inputStatusString === 'Income' ? this.title = 'Add Pay In' : this.title = 'Add Pay Out';
    this.inputStatusString === 'Income' ? this.expensesDetailForm.get('isExpense').setValue(false) :
      this.expensesDetailForm.get('isExpense').setValue(true);
    this.inputStatusString === 'Income' ? this.expensesDetailForm.get('accStatusId').setValue(0) :
      this.expensesDetailForm.get('accStatusId').setValue(1);
    this.expensesDetailForm.get('date').setValue(moment(this.currentDate).format('MM-DD-YYYY'));
    this.inputDate = moment(this.currentDate).format('MM-DD-YYYY');

    // this.GetChartOfAccountTypeData();
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  GetIncomeExpensesbyStore() {
    this.spinner.show();
    // this.setupService.getData('IncomeExpense/GetIncomeExpensesbyStore?StoreLocationID=' + this.storeLocationID)
    this.setupService.getData('IncomeExpense/GetIncomeExpenses?MovementHeaderID=' + this.movementHeaderID)
      .subscribe((response) => {
        this.spinner.hide();
        this.rowData = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  getVendorByCompanyId() {
    if (this.storeService.vendorList) {
      this.isVendorLoading = false;
      this.vendorList = this.storeService.vendorList;
    } else {
      this.storeService.getVendorList(this.userInfo.companyId).subscribe((response) => {
        this.isVendorLoading = false;
        this.vendorList = this.storeService.vendorList;
      }, (error) => {
        console.log(error);
      });
    }
  }

  GetChartOfAccountTypeData(isSelectedRow?: Boolean, selectedRowData?) {
    let acctTypeId;
    this.spinner.show();
    this.expensesValue.isExpense === true ? acctTypeId = 4 : acctTypeId = 3;
    // this.inputStatusString === 'Income' ? acctTypeId = 3 : acctTypeId = 4;
    this.setupService.getData('ChartOfAccountCategories/GetChartOfAccountTypeData?StoreLocationID=' +
      this.storeLocationID + '&AccountTypeID=' + acctTypeId)
      .subscribe((response) => {
        const tempData = [];
        this.spinner.hide();
        response.chartOfAccountCategoriesdata.map((i) => {
          i.chartofaccountsdata.map((data) => {
            tempData.push({ ...data, child: { state: i.chartofAccountCategories.chartOfAccountCategoryName } });
          });
        });
        this.chartOfAccountCategoriesdata = tempData;
        if (isSelectedRow && selectedRowData) {
          this.bindAccountTypeData(selectedRowData);
        }

      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  groupByFn = (item) => item.child.state;

  groupValueFn = (_: string, children: any[]) => ({ chartOfAccountName: children[0].child.state });

  groupByFnAccView = (item) => item.child.state;

  groupValueFnAccView = (_: string, children: any[]) => ({ chartOfAccountName: children[0].child.state });

  GetChartAccountViewData() {
    this.setupService.getData('ChartOfAccountCategories/GetChartAccountViewData?StoreLocationID=' +
      this.storeLocationID).subscribe((response) => {
        const tempData = [];
        if (response) {
          response.chartAccountTypes.map((i) => {
            i.chartOfAccountCategorieslist.map((data) => {
              data.chartAccountDetails.map((item) => {
                tempData.push({ ...item, child: { state: data.chartOfAccountCategoryName } });
              });
            });
          });
          this.chartAccountViewDataList = tempData;
        }
      }, (error) => {
        console.log(error);
      });
  }
  dateChange(event, control) {
    if (control === 'date') {
      this.expensesDetailForm.get('date').setValue(event.formatedDate);
      this.inputDate = event.formatedDate;
    }
  }
  addVendor(params) {
    this.isAddVendor = params;
    if (params === false) {
      this.expensesDetailForm.get('vendorID').setValue(null);
      this.expensesDetailForm.get('invoiceNo').setValue(null);
    }
  }
  backToList() {
    this.backToDayReconList.emit(true);
  }
  get expensesValue() { return this.expensesDetailForm.value; }

  saveIncomeExpenses() {
    let constCartAccCatId = null, constCartAccCatName = '', constCartAccId = null, constCartAccName = '';
    // if (Number(this.expensesValue.incomeExpenseID) === 0 && this.expensesValue.accountId !== null) {
    //   constCartAccCatId = Number(this.expensesValue.incomeExpenseID) === 0 ?
    //     this.expensesValue.accountId.chartOfAccountCategoryID : this.expensesValue.chartOfAccountCategoryID;
    //   constCartAccCatName = Number(this.expensesValue.incomeExpenseID) === 0 ?
    //     this.expensesValue.accountId.chartOfAccountCategoryName : this.expensesValue.chartOfAccountCategoryName;

    //   constCartAccId = Number(this.expensesValue.incomeExpenseID) === 0 ?
    //     this.expensesValue.accountId.chartOfAccountID : this.expensesValue.chartOfAccountID;
    //   constCartAccName = Number(this.expensesValue.incomeExpenseID) === 0 ?
    //     this.expensesValue.accountId.chartOfAccountName : this.expensesValue.chartOfAccountName;
    // }

    const constIsExpense = Number(this.expensesValue.accStatusId) === 0 ? false : true;
    const postData = {
      incomeExpenseID: this.expensesValue.incomeExpenseID,
      movementHeaderID: this.movementHeaderID,
      storeLocationID: this.storeLocationID,
      description: this.expensesValue.description ? this.expensesValue.description : '',
      chartOfAccountCategoryID: 0,
      // chartOfAccountCategoryID: constCartAccCatId ? constCartAccCatId : 0,
      chartOfAccountID: this.expensesValue.accountId ? this.expensesValue.accountId : 0,
      date: this.expensesValue.date ? this.expensesValue.date : new Date(),
      amount: this.expensesValue.amount ? this.expensesValue.amount : 0,
      notes: this.expensesValue.notes ? this.expensesValue.notes : '',
      isExpense: constIsExpense ? constIsExpense : false,
      chartOfAccountCategoryName: '',
      // chartOfAccountCategoryName: constCartAccCatName ? constCartAccCatName : '',
      // chartOfAccountName: constCartAccName ? constCartAccName : '',
      chartOfAccountName: '',
      vendorID: this.expensesValue.vendorID,
      invoiceNo: this.expensesValue.invoiceNo,
    };
    if (Number(this.expensesValue.incomeExpenseID) === 0) {
      this.spinner.show();
      this.setupService.postData('IncomeExpense', postData).subscribe((response) => {
        console.log(response);
        this.spinner.hide();
        if (response && Number(response.incomeExpenseID) > 0) {
          this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
          this.reset();
          this.GetIncomeExpensesbyStore();
        } else {
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
        console.log(error);
      });
    } else {
      this.spinner.show();
      this.setupService.updateData('IncomeExpense/Update', postData).subscribe((response) => {
        console.log(response);
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
          this.reset();
          this.GetIncomeExpensesbyStore();
        } else {
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        console.log(error);
      });
    }
  }
  rowSelected(params) {
    if (params && params.length > 0) {
      this.isShowGridWithForm = true;
      const data = { ...params[0].data };
      this.expensesDetailForm.patchValue(data);
      data.isExpense === true ? this.expensesDetailForm.get('accStatusId').setValue(1) :
        this.expensesDetailForm.get('accStatusId').setValue(0);
      this.inputDate = moment(data.date).format('MM-DD-YYYY');
      data.isExpense === false ? this.title = 'Edit Income' : this.title = 'Edit Expenses';
      data.isExpense && data.vendorID !== null ? this.isAddVendor = true : this.isAddVendor = false;
      // this.expensesDetailForm.get('accountId').setValue(null);
      // this.GetChartOfAccountTypeData(true, data);
      this.expensesDetailForm.get('accountId').setValue(data.chartOfAccountID);
    }
  }
  bindAccountTypeData(params) {
    this.chartOfAccountCategoriesdata.map((i) => {
      if (Number(i.chartOfAccountCategoryID) === Number(params.chartOfAccountCategoryID) &&
        Number(i.chartOfAccountID) === Number(params.chartOfAccountID)) {
        console.log(i);
        this.expensesDetailForm.get('accountId').setValue(i);
      }
    });
  }
  reset() {
    this.isAddVendor = false;
    this.expensesDetailForm.patchValue(this.initialFormValue);
    this.setDetails();
    this.inputDate = moment(this.currentDate).format('MM-DD-YYYY');
  }
  changeDepositWith() {
    Number(this.expensesDetailForm.get('accStatusId').value) === 0 ?
      this.expensesDetailForm.get('isExpense').setValue(false) : this.expensesDetailForm.get('isExpense').setValue(true);
    Number(this.expensesDetailForm.get('accStatusId').value) === 0 ? this.title = 'Add Pay In' : this.title = 'Add Pay Out';
    Number(this.expensesDetailForm.get('accStatusId').value) === 0 ? this.isAddVendor = false : this.isAddVendor = true;

    // this.GetChartOfAccountTypeData();
  }
  getInvoiceNumber() {
    this.isInvoiceNumberLoading = true;
    this.expensesDetailForm.get('invoiceNo').setValue(null);
    if (this.expensesValue.vendorID) {
      this.setupService.getData('ChartOfAccountCategories/GetInvoiceHavingPaymentsByVendorID?vendorID=' +
        this.expensesValue.vendorID + '&storelocationid=' + this.storeLocationID).subscribe((response) => {
          this.isInvoiceNumberLoading = false;
          console.log(response);
          if (response && response.length === 0) {
            this.isInvoiceNoInput = true;
          } else {
            this.isInvoiceNoInput = false;
            this.invoiceNumberList = response;
          }
        }, (error) => {
          this.isInvoiceNumberLoading = false;
          console.log(error);
        });
    }
  }
  deleteIncomeExpenses() {

    if (this.expensesValue.incomeExpenseID === 0) {
      this.isAddVendor = false;
      this.expensesDetailForm.patchValue(this.initialFormValue);
      this.inputDate = moment(this.currentDate).format('MM-DD-YYYY');
      return;
    } else {
      this.spinner.show();
      this.setupService.deleteData(`IncomeExpense?id=${this.expensesValue.incomeExpenseID}`)
        .subscribe((response) => {
          console.log(response);
          this.spinner.hide();
          if (response && Number(response) === 1) {
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
            this.GetIncomeExpensesbyStore();
            this.reset();
          } else {
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        });
    }
  }
  getPaymentSourceList() {
    this.setupService.getData('PaymentSource/getCashFromRegister/' + this.storeLocationID).subscribe((response) => {
      if (response && response['statusCode']) {
        this.paymentSourceList = [];
        return;
      }
      this.paymentSourceList = response;
    }, (error) => {
      console.log(error);
    });
  }
  closeForm() {
    this.isShowGridWithForm = false;
    this.expensesDetailForm.patchValue(this.initialFormValue);
    this.inputDate = moment(this.currentDate).format('MM-DD-YYYY');
  }
  addNewRecord(params) {
    this.isAddVendor = false;
    this.isShowGridWithForm = true;
    this.inputStatusString = params;
    this.setDetails();
  }
}
