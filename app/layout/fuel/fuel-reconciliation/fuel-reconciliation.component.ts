import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import * as moment from 'moment';
import { FormBuilder } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '@shared/services/store/store.service';

@Component({
  selector: 'app-fuel-reconciliation',
  templateUrl: './fuel-reconciliation.component.html',
  styleUrls: ['./fuel-reconciliation.component.scss']
})
export class FuelReconciliationComponent implements OnInit {

  storeLocationList: any;
  _date = moment().format('MM-DD-YYYY');
  _settlementDate = moment().format('MM-DD-YYYY');
  gridOptions: any;
  rowData: any = [];
  networkBatchRowData: any;
  fuelInvoiceRowData: any;
  otherChargesRowData: any;
  editFuelInvoiceRowData: any;
  editNetworkBatchRowData: any;
  isShowAddFuelReconciliation = false;
  networkBatchGridOptions: any;
  fuelInvoicechGridOptions: any;
  otherChargesGridOptions: any;
  editFuelInvoicechGridOptions: any;
  editNetworkBatchGridOptions: any;
  newRowAdded = false;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridApiNetworkBatch: GridApi;
  tempId = 0;
  addrow = 0;
  gridOtherChargesApi: any;
  selectedFuelReconciliationData: any;
  userInfo = this.constantService.getUserInfo();
  selectedDateRange: any;
  searchFuelReconciliationForm = this._fb.group({
    storeLocationID: null,
    fromDate: this._date,
    toDate: this._date,
  });
  addFuelReconciliationForm = this._fb.group({
    fuelReconcilationID: 0,
    storeLocationID: null,
    settlementDate: new Date(),
    batchNumber: '',
    createdBy: '',
    createdDateTime: this._date,
    lastModifiedBy: '',
    lastModifiedDateTime: this._date,
    netGrossAmount: 0,
    fuelInvoiceAmount: 0,
    storeName: '',
    fuelOtherChargeAmount: 0,
    companyID: 0,
    amountDue: 0
  });
  fuelReconcilationID: any;
  initialFormValue: any;
  isEdit = false;
  selectedFuelInvoiceIds: any;
  selectedNetworkBatchIds: any;
  filterText: string;
  submited: boolean;
  isAddSubmited: boolean;
  isLoading = true;
  constructor(private gridService: GridService, private constantsService: ConstantService,
    private _fb: FormBuilder, private constantService: ConstantService, private _setupService: SetupService,
    private _spinner: NgxSpinnerService, private _toastr: ToastrService, private editableGrid: EditableGridService,
    private _modal: NgbModal, private storeService: StoreService) {
    this.gridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.fuelReconciliationGrid);
    this.networkBatchGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.fuelReconciliationNetworkBatchGrid);
    this.editNetworkBatchGridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.editFuelReconciliationNetworkBatchGrid);
    this.fuelInvoicechGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.fuelReconciliationFuelInvoicechGrid);
    this.editFuelInvoicechGridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.editfuelReconciliationFuelInvoicechGrid);
    this.otherChargesGridOptions = this.editableGrid.getGridOption(
      this.constantsService.editableGridConfig.gridTypes.fuelReconciliationOtherChargesGrid);
    this.initialFormValue = this.addFuelReconciliationForm.value;
  }

  ngOnInit() {
    this.getStoreLocationList();
  }
  gridReady(params) {
    params.api.sizeColumnsToFit();
  }
  networkBatchGridReady(params) {
    this.gridApiNetworkBatch = params.api;
    params.api.sizeColumnsToFit();
  }
  fuelInvoiceGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  otherChargesGridReady(params) {
    this.gridOtherChargesApi = params.api;
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }
  addNewFuelReconciliation() {
    this.isShowAddFuelReconciliation = true;
    this.isEdit = this.isAddSubmited = false;
    this.newRowAdded = false;
    this.networkBatchRowData = this.fuelInvoiceRowData = this.otherChargesRowData = 0;
    this.addFuelReconciliationForm.patchValue(this.initialFormValue);
  }
  resetAddFRForm() {
    this.networkBatchRowData = this.fuelInvoiceRowData = this.otherChargesRowData = 0;
    this.isEdit = false;
    this.fuelReconcilationID = 0;
    this.isAddSubmited = false;
    this._settlementDate = moment().format('MM-DD-YYYY');
    this.addFuelReconciliationForm.patchValue(this.initialFormValue);
  }
  backToList() {
    this.isShowAddFuelReconciliation = false;
    this.searchFuelReconciliation();
  }
  getStoreLocationList() {
    if (this.storeService.storeLocation) {
      this.isLoading = false;
      this.storeLocationList = this.storeService.storeLocation;
      if (this.storeLocationList && this.storeLocationList.length === 1) {
        this.addFuelReconciliationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
        this.searchFuelReconciliationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
      }
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        this.isLoading = false;
        this.storeLocationList = this.storeService.storeLocation;
        if (this.storeLocationList && this.storeLocationList.length === 1) {
          this.addFuelReconciliationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
          this.searchFuelReconciliationForm.get('storeLocationID').setValue(this.storeLocationList[0].storeLocationID);
        }
      }, (error) => {
        console.log(error);
      });
    }
  }
  dateChange(event) {
      this.addFuelReconciliationForm.get('settlementDate').setValue(event.formatedDate);
      this._settlementDate = event.formatedDate;
  }

  //  ====================  Fuel Reconciliation ==================

  searchFuelReconciliation() {
    this.submited = true;
    const postData = {
      ...this.searchFuelReconciliationForm.value
    };
    if (this.searchFuelReconciliationForm.valid) {
      this._spinner.show();
      // tslint:disable-next-line:max-line-length
      this._setupService.getData(`FuelReconcilation/list/${postData.storeLocationID}/${postData.fromDate}/${postData.toDate}/${this.userInfo.companyId}`)
        .subscribe((response) => {
          this._spinner.hide();
          this.rowData = response;
        }, (error) => {
          this._spinner.hide();
          console.log(error);
        });
    }
  }
  editFuelReconciliation(params) {
    this.fuelReconcilationID = params.data.fuelReconcilationID;
    this.isShowAddFuelReconciliation = true;
    this.isEdit = true;
    this.newRowAdded = false;
    this.selectedFuelReconciliationData = params.data;
    this.addFuelReconciliationForm.patchValue(params.data);
    this.networkBatchRowData = this.fuelInvoiceRowData = this.otherChargesRowData = 0;
    this.addFuelReconciliationForm.get('settlementDate').setValue(moment(params.data.settlementDate).format('MM-DD-YYYY'));
    this._settlementDate = moment(params.data.settlementDate).format('MM-DD-YYYY');
    this.getFuelInvoices();
    this.getOtherChargesList(params.data.fuelReconcilationID);
    this.getNetworkBatchList();
  }
  get getFRValue() { return this.addFuelReconciliationForm.value; }
  editOrSaveCloseFR() {
    this.addFuelReconciliation(() => { this.isShowAddFuelReconciliation = false; this.searchFuelReconciliation(); });
  }
  addFuelReconciliation(callBack = () => { }) {
    this.isAddSubmited = true;
    if (this.addFuelReconciliationForm.invalid) { return; }
    const postData = {
      fuelReconcilationID: this.getFRValue.fuelReconcilationID,
      storeLocationID: this.storeLocationList.length === 1 ?
        this.storeLocationList[0].storeLocationID : this.getFRValue.storeLocationID,
      settlementDate: this.getFRValue.settlementDate,
      batchNumber: this.getFRValue.batchNumber,
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      netGrossAmount: 0,
      fuelInvoiceAmount: 0,
      storeName: '',
      fuelOtherChargeAmount: 0,
      companyID: this.userInfo.companyId,
      amountDue: 0
    };

    if (this.getFRValue.fuelReconcilationID === 0) {
      this._spinner.show();
      this._setupService.postData(`FuelReconcilation`, postData).subscribe((response) => {
        this._spinner.hide();
        if (response.fuelReconcilationID > 0) {
          this.isEdit = true;
          this.fuelReconcilationID = response.fuelReconcilationID;
          this.selectedFuelReconciliationData = response;
          this.getFuelInvoices();
          this.getOtherChargesList(response.fuelReconcilationID);
          callBack();
          this._toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
        } else {
          this._toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this._spinner.hide();
        console.log(error);
        this._toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
      });
    } else {
      this._spinner.show();
      this._setupService.updateData(`FuelReconcilation`, postData).subscribe((response) => {
        this._spinner.hide();
        if (response === '1') {
          callBack();
          this._toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this._spinner.hide();
        console.log(error);
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      });
    }
  }

  deleteFR(params) {
    this._spinner.show();
    this._setupService.deleteData(`FuelReconcilation/${params.data.fuelReconcilationID}`).subscribe((response) => {
      this._spinner.hide();
      if (response === '1') {
        this._toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        this.searchFuelReconciliation();
      } else {
        this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this._spinner.hide();
      this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      console.log(error);
    });
  }

  //  ====================  Network Batch ==================

  getNetworkBatchList() {
    this._setupService.getData('BusinessDayNetworkSummary/GetNetworkSummary?storeLocationID=' +
      this.selectedFuelReconciliationData.storeLocationID + '&fromDate=' + this._date + '&toDate=' + this._date
      + '&Batches=0&FuelReconID=' + this.fuelReconcilationID + '&CompanyID=' + this.userInfo.companyId
      + '&ExtraId=0').subscribe((response) => {
        this.networkBatchRowData = response;
      }, (error) => {
        console.log(error);
      });
  }
  getEditNetworkBatchList() {
    this._setupService.getData('BusinessDayNetworkSummary/GetNetworkSummary?storeLocationID=' +
      this.selectedFuelReconciliationData.storeLocationID + '&fromDate=' + this._date + '&toDate=' + this._date +
      '&Batches=0&FuelReconID=0&CompanyID=' + this.userInfo.companyId + '&ExtraId=0').subscribe((response) => {
        this.editNetworkBatchRowData = response;
      }, (error) => {
        console.log(error);
      });
  }
  addNetworkBatch(content) {
    this.getEditNetworkBatchList();
    this._modal.open(content, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }
  deleteNetworkSummeryBatch(params) {
    this._spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.updateData(`BusinessDayNetworkSummary/DeleteFuelReconcilation?businessDayNetworkSummaryID=${params.data.businessDayNetworkSummaryID}`, '')
      .subscribe((response) => {
        this._spinner.hide();
        if (response === '1') {
          this._toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.getNetworkBatchList();
        } else {
          this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        console.log(error);
        this._spinner.hide();
        this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      });
  }
  onNetworkBatchRowSelected(params) {
    this.selectedNetworkBatchIds = params.map(x => x.data);
  }
  validateGrid() {
    const postData = [];
    console.log(this.selectedNetworkBatchIds);
    const frId = this.fuelReconcilationID;
    const userName = this.userInfo.userName;
    this.selectedNetworkBatchIds.forEach(function (x: AnimationPlayState) {
      x['createdDateTime'] = new Date();
      x['createdBy'] = userName;
      x['fuelReconcilationID'] = frId;
      x['lastModifiedBy'] = userName;
      x['lastModifiedDateTime'] = new Date();
      postData.push(x);
    });
    return postData;
  }
  saveNetworkBatch() {

    const postData = this.validateGrid();
    this._spinner.show();
    this._setupService.postData(`BusinessDayNetworkSummary`, postData).subscribe((response) => {
      console.log(response);
      this._spinner.hide();
      if (response === '1') {
        this.getNetworkBatchList();
        this._modal.dismissAll();
        this._toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
      } else {
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this._spinner.hide();
      console.log(error);
      this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
    });
  }

  //  ====================  Fuel Invoice ==================

  getFuelInvoices() {
    // tslint:disable-next-line:max-line-length
    this._setupService.getData(`FuelInvoice/list/${this.selectedFuelReconciliationData.storeLocationID}/${this.selectedFuelReconciliationData.fuelReconcilationID}/${this.selectedFuelReconciliationData.settlementDate}`)
      .subscribe((response) => {
        this.fuelInvoiceRowData = response;
      }, (error) => {
        console.log(error);
      });
  }
  onRowSelected(params) {
    this.selectedFuelInvoiceIds = params ? params.map(x => x.data.fuelInvoiceID).join(',') : '';
  }
  getEditFuelInvoiceList() {
    this._spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.getData(`FuelInvoice/list/${this.selectedFuelReconciliationData.storeLocationID}/0/${this.selectedFuelReconciliationData.settlementDate}`)
      .subscribe((response) => {
        this.editFuelInvoiceRowData = response;
        this._spinner.hide();
      }, (error) => {
        this._spinner.hide();
        console.log(error);
      });
  }
  addFuelInvoice(content) {
    this.getEditFuelInvoiceList();
    this._modal.open(content, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }
  saveFuelInvoice() {
    this._spinner.show();
    this._setupService.updateData(`FuelInvoice/update/${this.selectedFuelInvoiceIds}/${this.fuelReconcilationID}`, '')
      .subscribe((response) => {
        console.log(response);
        this._spinner.hide();
        if (response[0] === 1) {
          this.getFuelInvoices();
          this._modal.dismissAll();
          // this.getEditFuelInvoiceList();
          this._toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
        } else {
          this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this._spinner.hide();
        console.log(error);
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
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

  deleteFuelInvoice(params) {
    this._spinner.show();
    // tslint:disable-next-line:max-line-length
    this._setupService.updateData(`FuelInvoice/DeleteFuelReconcilation/${params.data.fuelInvoiceID}`, '').subscribe((response) => {
      this._spinner.hide();
      if (response === '1') {
        this._toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        this.getFuelInvoices();
      } else {
        this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      console.log(error);
      this._spinner.hide();
      this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
    });
  }
  // ==================  Other Charges ==================

  getOtherChargesList(fuelReconID) {
    this._setupService.getData(`FuelReconcilationOtherCharge/list/${fuelReconID}`).subscribe((response) => {
      this.otherChargesRowData = response;
    }, (error) => {
      console.log(error);
    });
  }
  createNewRowData() {
    this.tempId = this.gridOtherChargesApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      chargeDescription: '', fuelReconcilationOtherChargeID: 0, amount: 0, fuelReconcilationID: 0, isSaveRequired: true,
    };
    return newData;
  }
  onInsertRowAt() {
    if (this.newRowAdded) {
      this._toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridOtherChargesApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartEditingCell('chargeDescription', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridOtherChargesApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  otherChargesSave(params) {
    const postData = {
      fuelReconcilationOtherChargeID: params.data.fuelReconcilationOtherChargeID,
      fuelReconcilationID: this.fuelReconcilationID,
      chargeDescription: params.data.chargeDescription,
      amount: params.data.amount,
    };
    if (params.data.fuelReconcilationOtherChargeID === 0) {
      this._spinner.show();
      this._setupService.postData('FuelReconcilationOtherCharge', postData).subscribe((response) => {
        this._spinner.hide();
        if (response) {
          this.newRowAdded = false;
          this._toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.getOtherChargesList(this.fuelReconcilationID);
        } else {
          this._toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        console.log(error);
        this._spinner.hide();
        this._toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
      });
    } else {
      this._spinner.show();
      this._setupService.updateData('FuelReconcilationOtherCharge', postData).subscribe((response) => {
        this._spinner.hide();
        if (response === '1') {
          this.newRowAdded = false;
          this._toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          this.getOtherChargesList(this.fuelReconcilationID);
        } else {
          this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      }, (error) => {
        this._spinner.hide();
        console.log(error);
        this._toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
      });
    }
  }
  otherChargesDelete(params) {
    if (params.data.fuelReconcilationOtherChargeID === 0) {
      this.newRowAdded = false;
      this.gridOtherChargesApi.updateRowData({ remove: [params.data] });
      return;
    }
    this._spinner.show();
    this._setupService.deleteData(`FuelReconcilationOtherCharge/${params.data.fuelReconcilationOtherChargeID}`).subscribe((response) => {
      this._spinner.hide();
      if (response === '1') {
        this._toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        this.getOtherChargesList(this.fuelReconcilationID);
      } else {
        this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
      }
    }, (error) => {
      this._spinner.hide();
      this._toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
    });
  }
  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.searchFuelReconciliationForm.get('fromDate').setValue(this.selectedDateRange.fDate);
    this.searchFuelReconciliationForm.get('toDate').setValue(this.selectedDateRange.tDate);
  }
}
