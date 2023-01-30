import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';
import { FormBuilder, Validators } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
  selector: 'app-stock-transactions',
  templateUrl: './stock-transactions.component.html',
  styleUrls: ['./stock-transactions.component.scss']
})
export class StockTransactionsComponent implements OnInit {

  title = 'Stock Transactions Details';
  title2 = 'Add Stock Transactions';
  addStockTransactionFlag = false;
  isHideShow = false;
  isEdit: false;
  gridOptions: GridOptions;
  rowData: any;
  gridApi: any;
  store: any;
  formStoreLocations: any[];
  stockTransactions: any[];
  initialFormValues: any;
  userInfo = this.constants.getUserInfo();
  currentDate = this.pipe.transform(new Date(), 'MM-dd-yyyy hh:mm');
  isStockTransactionLoading = true;
  isStoreLocationLoading = true;
  checkIsEdit = false;
  modifiedDate = moment().format('MM-DD-YYYY');
  itemStockTransactionSearch = this._fb.group({
    startDate: this.currentDate,
    endDate: this.currentDate,
    uPCCode: '',
    stockTypeID: null,
    fromStoreLocationID: '',
    toStoreLocationID: '',
    companyID: 0,
    userName: '',
  });

  addStockTransactionForm = this._fb.group({
    itemStockTransactionID: 0,
    companyID: this.userInfo.companyId,
    storeLocationID: 0,
    posCode: ['', Validators.required],
    stockTransactionTypeID: [null, Validators.required],
    transactionQuantity: [''],
    createdDateTime: new Date(),
    lastModifiedBy: '',
    lastModifiedDateTime: [this.modifiedDate, Validators.required],
    notes: '',
    weightedCostOfGoods: 0,
    stockTransactionTypeDescription: '',
    storeName: '',
    tostoreID: 0,
    toStoreName: '',
    description: '',
    regularSellPrice: 0,
    toStorelocation: [null],
    fromStoreLocation: [null, Validators.required]
  });
  startDate = this.currentDate;
  endDate = this.currentDate;
  selectedDateRange:any;
  isToStores = false;
  isAddToStore = false;
  toStoreLocations = [];
  formAddStoreLocations = [];
  toAddStoreLocations = [];
  allStores = [];
  _currentDate = moment().format('MM-DD-YYYY');
  allStockTransactions: any;
  filterText: string;
  constructor(private gridService: GridService, private constants: ConstantService, private _fb: FormBuilder
    , private storeDetails: StoreService, private itemService: SetupService, private pipe: DatePipe
    , private spinner: NgxSpinnerService, private toastr: ToastrService, private utility: UtilityService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.stockTransactionsGrid);
    this.initialFormValues = this.addStockTransactionForm.value;
  }

  ngOnInit() {
    this.getStockTransactionTypes();
    this.getStoreLocations();
    // this.searchStockTransaction();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  Save() {
    if (this.addStockTransactionForm.invalid) {
      return;
    }
    let stockTransactionTypeDescriptionObj = '';
    if (this.stockTransactions) {
      this.stockTransactions.map(x => {
        if (x.stockTransactionTypeID === this.addStockTransactionForm.value.stockTransactionTypeID) {
          stockTransactionTypeDescriptionObj = x.stockTransactionTypeDescription;
        }
      });
    }
    if (this.formAddStoreLocations && this.formAddStoreLocations.length === 1) {
      this.itemStockTransactionSearch.value.fromStoreLocation = this.formAddStoreLocations[0].storeLocationID;
    }
    const postData = {
      ...this.addStockTransactionForm.value,
      companyID: this.userInfo['companyId'],
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: this._currentDate,
      createdDateTime: this.currentDate,
      weightedCostOfGoods: 0,
      itemStockTransactionID: this.addStockTransactionForm.value.itemStockTransactionID ?
        this.addStockTransactionForm.value.itemStockTransactionID : 0,
      toStorelocation: this.addStockTransactionForm.value.toStorelocation ? this.addStockTransactionForm.value.toStorelocation : 0,
      storeLocationID: 0,
      storeName: null,
      tostoreID: 0,
      toStoreName: null,
      regularSellPrice: null,
      description: null,
      stockTransactionTypeDescription: stockTransactionTypeDescriptionObj,

    };
    if (this.addStockTransactionForm.value.itemStockTransactionID > 0) {
      this.spinner.show();
      this.itemService.updateData('ItemStockTransaction/update', postData).
        subscribe((response) => {
          this.spinner.hide();
          if (response === '1') {
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            this.reset();
          } else {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          }
        },
          (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });

    } else {
      this.spinner.show();
      this.itemService.postData('ItemStockTransaction/addNew', postData).
        subscribe((response) => {
          this.spinner.hide();
          if (response === '1') {
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            this.addStockTransactionForm.patchValue(this.initialFormValues);
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        },
          (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          });
    }
  }
  getStoreLocations() {
    //
    this.storeDetails.getByCompanyId(this.userInfo['companyId'], this.userInfo.userName).subscribe(response => {
      this.formStoreLocations = response;
      this.toStoreLocations = response;
      this.formAddStoreLocations = response;
      this.toAddStoreLocations = response;
      this.allStores = response;
      this.isStoreLocationLoading = false;
      if (response && response.length === 1) {
        this.addStockTransactionForm.get('fromStoreLocation').setValue(response[0].storeLocationID);
        this.itemStockTransactionSearch.get('fromStoreLocationID').setValue(response[0].storeLocationID);

      }
    });
  }
  getStockTransactionTypes() {
    this.itemService.getData('StockTransactionType/getAll').subscribe(response => {
      if (response && response['statusCode']) {
        this.stockTransactions = [];
        return;
      }
      this.allStockTransactions = response;
      this.stockTransactions = response.filter(x => x.stockTransactionTypeID > 0);
      this.isStockTransactionLoading = false;
    });
  }
  addStockTransaction() {
    this.isHideShow = !this.isHideShow;
    this.addStockTransactionForm.patchValue(this.initialFormValues);
    this.modifiedDate = this._currentDate;
    this.title2 = 'Add Stock Transaction';
    this.isEdit = false;
  }
  reset() {
    this.checkIsEdit = false;
    this.title2 = 'Add Stock Transaction';
    this.addStockTransactionForm.patchValue(this.initialFormValues);
    this.modifiedDate = '';
  }

  close() {
    this.checkIsEdit = false;
    this.addStockTransactionForm.patchValue(this.initialFormValues);
    this.isHideShow = !this.isHideShow;
  }
  search() {
    if (this.allStores.length === this.itemStockTransactionSearch.value.fromStoreLocationID.length) {
      this.toastr.warning('Unselect at least one store from store', 'Warning!');
      return;
    }
    if (this.formStoreLocations && this.formStoreLocations.length === 1) {
      const arr = []; arr.push(this.formStoreLocations[0]);
      this.itemStockTransactionSearch.value.fromStoreLocationID = arr;
    }
    const fromStoreLocationIdObj = this.itemStockTransactionSearch.value.fromStoreLocationID ?
      this.itemStockTransactionSearch.value.fromStoreLocationID.map(x => x.storeLocationID).join(',') : '';
    const toStoreLocationIdObj = this.itemStockTransactionSearch.value.toStoreLocationID ?
      this.itemStockTransactionSearch.value.toStoreLocationID.map(x => x.storeLocationID).join(',') : '';
    const postData = {
      uPCCode: this.itemStockTransactionSearch.value.uPCCode ? this.itemStockTransactionSearch.value.uPCCode : '',
      startDate: this.itemStockTransactionSearch.value.startDate,
      endDate: this.itemStockTransactionSearch.value.endDate,
      fromStoreLocationID: fromStoreLocationIdObj ? fromStoreLocationIdObj : '',
      toStoreLocationID: toStoreLocationIdObj,
      stockTypeID: this.itemStockTransactionSearch.value.stockTypeID ?
        this.itemStockTransactionSearch.value.stockTypeID : 0,
      companyID: this.userInfo.companyId,
      userName: this.userInfo.userName
    };
    console.log(postData);
    this.spinner.show();
    this.itemService.postData(`ItemStockTransaction/get`, postData)
      .subscribe(response => {
        this.rowData = response;
        this.spinner.hide();
      });
  }

  dateChange(event) {
      this.addStockTransactionForm.get('lastModifiedDateTime').setValue(event.formatedDate);
      this.modifiedDate = event.formatedDate;
  }
  getDescriptionByUPCCode(params) {
    if (params) {
      this.itemService.getDataString(`ItemStockTransaction/getByUPCCode/${params}/`+this.userInfo.companyId).subscribe(res => {

        let errorMessage = '';
        if (res.statusCode === 400 && res.result.validationErrors) {
          res.result.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this.addStockTransactionForm.get('description').setValue(null);
          this.toastr.error(errorMessage);
          return;
        }
        if (res) {
          this.addStockTransactionForm.get('description').setValue(res);
        }
      });
    }
  }
  // edit(params) {
  //   this.addStockTransactionFlag = true;
  //   this.checkIsEdit = true;
  //   this.title2 = 'Update Stock Transaction';
  //   this.addStockTransactionForm.patchValue(params.data);
  //   console.log(params.data);
  // }
  selectStockType() {
    this.isToStores = false;
    if (this.itemStockTransactionSearch.value.stockTypeID === 3) {
      this.isToStores = true;
      if (this.formStoreLocations && this.formStoreLocations.length === 1) {
        this.itemStockTransactionSearch.get('stockTypeID').setValue(null);
        this.toastr.error('Only one store available', 'error');
        return;
      }
    }

  }
  selectAddStockTransactionType() {
    this.isAddToStore = false;
    if (this.addStockTransactionForm.value.stockTransactionTypeID === 3) {
      if (this.formAddStoreLocations && this.formAddStoreLocations.length === 1) {
        this.toastr.error('Only one store available', 'error');
        return;
      }
      this.isAddToStore = true;
    }

  }
  selectFormStore() {
    const orignalArray = _.assign([], this.allStores);
    this.toStoreLocations = [];
    this.itemStockTransactionSearch.get('toStoreLocationID').setValue(null);
    if (!this.itemStockTransactionSearch.value.fromStoreLocationID) {
      this.toStoreLocations = this.allStores;
      return;
    }
    const data = this.utility.remove_duplicates(orignalArray, this.itemStockTransactionSearch.value.fromStoreLocationID
      , 'storeLocationID');
    setTimeout(() => {
      this.toStoreLocations = data;
    }, 1000);
  }

  selectAddFormStore() {
    const orignalArray = _.assign([], this.allStores);
    this.toAddStoreLocations = [];
    this.addStockTransactionForm.get('toStorelocation').setValue(null);

    if (!this.addStockTransactionForm.value.fromStoreLocation) {
      this.toAddStoreLocations = this.allStores;
      return;
    }
    const arr = this.allStores.filter(
      book => book.storeLocationID === Number(this.addStockTransactionForm.value.fromStoreLocation));
    const data = this.utility.remove_duplicates(orignalArray, arr
      , 'storeLocationID');
    setTimeout(() => {
      this.toAddStoreLocations = data;
    }, 1000);
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.startDate = this.selectedDateRange.fDate;
    this.endDate = this.selectedDateRange.tDate;
    this.itemStockTransactionSearch.get('startDate').setValue(this.selectedDateRange.fDate);
    this.itemStockTransactionSearch.get('endDate').setValue(this.selectedDateRange.tDate);
  }
}
