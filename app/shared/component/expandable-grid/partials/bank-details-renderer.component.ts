import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { GridOptions } from 'ag-grid-community';
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '@shared/services/store/store.service';
import * as _ from 'lodash';
import { NgxSpinnerService } from 'ngx-spinner';
import { ChildSaveButtonComponent } from './childSaveButton.component';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SelectRenderer } from './select.component';
import { ChildCheckBoxRenderer } from './childcheckbox.component';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '@shared/services/commmon/common.service';

@Component({
  selector: 'app-bank-detail-cell-renderer',
  template: `
    <div class="col-sm-12">
    <small (click)="addRows()" class="subGroupAdd"><i class="fa fa-plus"></i> Add</small>
    <img [src]="imgURL" height="10" *ngIf="imgURL">
</div>
    <div class="row">
        <div class="master-details col-sm-12" *ngIf="showGrid">
        <ag-grid-angular
        #agGrid
        style="width: 100%;height:250px !important;"
        id="detailGrid"
        class="full-width-grid"
        [columnDefs]="colDefs"
        [rowData]="detailsRowData"
        [suppressContextMenu]="true"
        [editType]="editType"
        (gridReady)="onGridReady($event)"
        [gridOptions]="gridInfo"
        [frameworkComponents]="frameworkComponents"
        [enableColResize]="true"
    >
   </ag-grid-angular>
            </div></div>`,
  styles: [`.master-details .full-width-grid {
               // padding: 0;
            }`]
})

// tslint:disable-next-line:component-class-suffix
export class BankDetailCellRenderer implements ICellRendererAngularComp, OnDestroy {
  // called on init
  params: any;
  masterGridApi: any;
  masterRowIndex: any;
  colDefs: any;
  detailsRowData: any;
  selectedStores = [];
  showGrid = false;
  editType: any;
  gridInfo: any;
  gridApi: any;
  newRowAdded = false;
  @ViewChild('agGrid') agGrid: any;
  userInfo: any;
  storeList: any = [];
  accountTypes: any = [];
  selectedStoreIds: any[];
  public isEdit: Boolean | false;
  frameworkComponents: any;
  fileUpload: any;
  percentDone: number;
  chooseFileName: string;
  imgURL: any;
  companyID: any;
  public isCancel: true;
  constructor(private dataService: SetupService,
    private constants: ConstantService, private storeService: StoreService, private route: ActivatedRoute, private commonService: CommonService,
    private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.userInfo = this.constants.getUserInfo();
    this.colDefs = this.getColDefs();
    this.getStoresList();
    this.getAccountTypes();

  }

  agInit(params: any): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.companyID = id;
    this.params = params;
    this.masterGridApi = params.api;
    this.masterRowIndex = params.rowIndex;
    this.getChildGridData(params.data);
    this.editType = "fullRow";
    this.isCancel = true;
    this.gridInfo = <GridOptions>{
      context: {
        componentParent: this
      },
      suppressClickEdit: true
    };
    this.gridInfo.api = params.api;
    this.gridInfo.columnApi = this.getColDefs();
    this.frameworkComponents = {
      SelectRenderer: SelectRenderer,
      childCheckBoxRenderer: ChildCheckBoxRenderer
    };
  }
  onBtStopEditing($event) {
    // this.gridApi.stopEditing();
    this.onRowValueChanged($event)
  }

  /*  onBtStartEditing() {
     this.gridApi.setFocusedCell(1, "bankNickName");
     this.gridApi.startEditingCell({
       rowIndex: 1,
       colKey: "bankNickName"
     });
   } */
  onGridReady(params) {
    const detailGridId = 'detail_' + this.masterRowIndex;
    this.gridInfo = {
      id: detailGridId,
      api: params.api,
      columnApi: this.getColDefs(),
      context: {
        componentParent: this
      },
    };
    this.gridApi = this.gridInfo.api;
    this.masterGridApi.addDetailGridInfo(detailGridId, this.gridInfo);
    // this.gridInfo.api.gridOptionsWrapper.gridOptions.detailRowHeight = (this.detailsRowData.length * 30) + 50;
    params.api.sizeColumnsToFit();
  }
  getChildGridData(data) {
    this.selectedStores = _.filter(data.storeBanks.map((ele) => {
      return ele["storelocationID"]
    })
    );
    data.storeBanks.forEach(item => {
      const filteredStores = this.storeList.filter(k => (k.value === item.storelocationID || !this.selectedStores.includes(k.value)));
      const stores = filteredStores.filter(k => k.value === item.storelocationID);
      if (stores && stores.length > 0)
        item.storeName = stores[0].text;
      item.storelocationIDList = filteredStores;
      item.isEdit = false;
    });
    this.detailsRowData = [...data.storeBanks];
    this.showGrid = true;
    this.params.api.sizeColumnsToFit();
  }

  getColDefs() {
    return [
      {
        headerName: 'Store Name', field: 'storelocationID', cellRenderer: 'SelectRenderer', width: 140,
        cellRendererParams: {
          //inputSource: this.storeList,
          cellfieldId: 'storelocationID',
          textfield: 'storeName'
        }
      },
      { headerName: 'Bank Nick Name', field: 'bankNickName', editable: true, width: 150 },
      { headerName: 'Account Number', field: 'accountNumber', editable: true, width: 150 },
      { headerName: 'Start Check No.', field: 'startCheckNo', editable: true, width: 100 },
      { headerName: 'Last Check No.', field: 'lastCheckNo', editable: true, width: 100 },
      { headerName: 'Notes', field: 'notes', width: 100, editable: true },
      {
        headerName: 'Active', field: 'isActive', width: 80, cellRenderer: 'childCheckBoxRenderer',
        cellRendererParams: {
          cellfieldId: 'isActive',
        }
      },
      {
        headerName: 'Account Type', field: 'bankAccountTypeID', cellRenderer: 'SelectRenderer',
        cellRendererParams: {
          inputSource: this.accountTypes,
          cellfieldId: 'bankAccountTypeID',
          textfield: 'bankAccountTypeName'
        }
      },
      {
        headerName: 'Action', field: 'value', filter: false, width: 100, suppressSorting: false,
        cellRendererFramework: ChildSaveButtonComponent,
      }
    ];
  }
  getStoresList() {
    let list: any;
    if (this.storeService.storeLocation) {
      list = this.storeService.storeLocation;
      list.forEach(element => {
        this.storeList.push({ text: element.storeName, value: element.storeLocationID });
      });
    } else {
      this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
        list = this.storeService.storeLocation;
        list.forEach(element => {
          this.storeList.push({ text: element.storeName, value: element.storeLocationID });
        });
      }, (error) => {
        console.log(error);
      });
    }
  }

  getAccountTypes() {
    this.commonService.accountTypes.forEach(ele => {
      this.accountTypes.push({ text: ele.bankAccountTypeName, value: ele.bankAccountTypeID });
    })
  }
  // called when the cell is refreshed
  refresh(params: any): boolean {
    return false;
  }
  deleteStoreBank($event) {
  }
  onRowValueChanged($event) {
    this.spinner.hide();
    this.gridApi.stopEditing();
    if ($event.data.bankNickName === '') {
      this.toastr.error('Please Enter bank nickname...', 'Error');
      this.getStartEditingCell('bankNickName', $event.rowIndex);
      return;
    }
    if ($event.data.startCheckNo <= 0) {
      this.toastr.error('Please Enter positive value for Start Check Number...', 'Error');
      this.getStartEditingCell('startCheckNo', $event.rowIndex);
      return;
    }
    if ($event.data.lastCheckNo <= 0) {
      this.toastr.error('Please Enter positive value for Last Check Number...', 'Error');
      this.getStartEditingCell('lastCheckNo', $event.rowIndex);
      return;
    }
    const isNumber = isNaN($event.data.accountNumber);
    if ($event.data.accountNumber === '' || isNumber) {
      this.toastr.error('Please Enter valid bank account number...', 'Error');
      this.getStartEditingCell('accountNumber', $event.rowIndex);
      return;
    }
    let selectedRowData = $event.data;
    let validationStatus = false;
    if (this.detailsRowData.length === 0) {
      validationStatus = true;
    } else {
      _.each(this.detailsRowData, (data, index) => {
        if (data.bankNickName === selectedRowData.bankNickName && data.storelocationID === selectedRowData.storelocationID && index !== $event.rowIndex) {
          this.toastr.error('Bank already exists with same Nick name and Store Location...', 'Error');
          this.getStartEditingCell('storelocationID', $event.rowIndex);
          validationStatus = false;
          return false;
        } else {
          validationStatus = true;
        }
      });
    }
    if (!validationStatus) {
      return;
    }
    const isNumber1 = isNaN($event.data.startCheckNo);
    if ($event.data.startCheckNo === '' || isNumber1) {
      this.toastr.error('Please Enter valid start check number...', 'Error');
      this.getStartEditingCell('startCheckNo', $event.rowIndex);
      return;
    }
    const isNumber2 = isNaN($event.data.lastCheckNo);
    if ($event.data.lastCheckNo === '' || isNumber2) {
      this.toastr.error('Please Enter valid last check number...', 'Error');
      this.getStartEditingCell('lastCheckNo', $event.rowIndex);
      return;
    }
    if ($event.data.lastCheckNo < $event.data.startCheckNo) {
      this.toastr.error('Start Check Number should be less than Last Check Number', 'Error');
      this.getStartEditingCell('startCheckNo', $event.rowIndex);
      return;
    }
    // if ($event.data.notes === '') {
    //   this.toastr.error('Please Enter notes...', 'Error');
    //   this.getStartEditingCell('notes', $event.rowIndex);
    //   return;
    // }
    this.spinner.show();
    if ($event.data.storeBankID === 0) {
      this.newRowAdded = false;
      $event.data["storeBankID"] = parseInt($event.data.storeBankID);
      $event.data["lastModifiedDateTime"] = new Date();

      $event.data["storelocationID"] = parseInt($event.data.storelocationID);
      $event.data["createDateTime"] = new Date();
      $event.data["paymentsourceID"] = parseInt(this.params.data.paymentSourceID);
      const postData = {
        storeBankID: $event.data["storeBankID"],
        paymentsourceID: $event.data["paymentsourceID"],
        storelocationID: $event.data["storelocationID"],
        storeName: $event.data["storeName"],
        bankNickName: $event.data["bankNickName"],
        accountNumber: $event.data["accountNumber"],
        startCheckNo: $event.data["startCheckNo"],
        lastCheckNo: $event.data["lastCheckNo"],
        notes: $event.data["notes"],
        createdBy: $event.data["createdBy"],
        createdDateTime: $event.data["createdDateTime"],
        lastModifiedBy: $event.data["lastModifiedBy"],
        lastModifiedDateTime: $event.data["lastModifiedDateTime"],
        isActive: $event.data["isActive"],
        createDateTime: $event.data["createDateTime"],
        companyID: this.companyID,
        bankAccountTypeID: $event.data["bankAccountTypeID"]
      };
      this.dataService.postData('StoreBank/AddNew', postData)
        .subscribe((response) => {
          //  this.isEdit=true;
          this.spinner.hide();
          if (response.statusCode && response.statusCode === 400) {
            if (response.result.validationErrors.length > 0) {
              this.toastr.error(response.result.validationErrors[0].errorMessage, this.constants.infoMessages.error);
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            }
          } else if (response.statusCode && response.statusCode === 500) {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          } else if (response) {
            $event.data["storeBankID"] = response.storeBankID;
            $event.data.isEdit = false;
            $event.data.isNewRow = false;
            $event.data.isCancel = true;
            this.gridApi.stopEditing();
            this.detailsRowData.push($event.data);
            this.params.data.storeBanks = [...this.detailsRowData];
            this.refreshData();
            this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          }
          else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          }
        },
          (error) => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          });
    } else {
      $event.data["storeBankID"] = parseInt($event.data.storeBankID);
      $event.data["lastModifiedDateTime"] = new Date();
      $event.data["createDateTime"] = new Date($event.data["createDateTime"]);
      $event.data["paymentsourceID"] = parseInt(this.params.data.paymentSourceID);
      $event.data["storelocationID"] = parseInt($event.data.storelocationID);
      const postData = {
        storeBankID: $event.data["storeBankID"],
        paymentsourceID: $event.data["paymentsourceID"],
        storelocationID: $event.data["storelocationID"],
        storeName: $event.data["storeName"],
        bankNickName: $event.data["bankNickName"],
        accountNumber: $event.data["accountNumber"],
        startCheckNo: $event.data["startCheckNo"],
        lastCheckNo: $event.data["lastCheckNo"],
        notes: $event.data["notes"],
        createdBy: $event.data["createdBy"],
        createdDateTime: $event.data["createdDateTime"],
        lastModifiedBy: $event.data["lastModifiedBy"],
        lastModifiedDateTime: $event.data["lastModifiedDateTime"],
        isActive: $event.data["isActive"],
        createDateTime: $event.data["createDateTime"],
        companyID: this.companyID,
        bankAccountTypeID: $event.data["bankAccountTypeID"]
      };
      this.dataService.updateData('StoreBank/Update', postData)
        .subscribe((response) => {
          // this.isEdit=true;
          this.spinner.hide();
          if (response.statusCode && response.statusCode === 400) {
            if (response.result.validationErrors.length > 0) {
              this.toastr.error(response.result.validationErrors[0].errorMessage, this.constants.infoMessages.error);
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            }
          } else if (response && Number(response) == 1) {
            $event.data.isEdit = false;
            this.gridApi.stopEditing();
            this.refreshData();
            this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
          } else {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          }
        },
          (error) => {
            // this.isEdit=true;
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
    }
  }
  refreshData() {
    let allNodesData = [];
    this.gridApi.forEachNode((node, i) => {
      allNodesData.push(node.data);
    });
    this.gridApi.setRowData(allNodesData);
  }
  addRows() {
    const filteredStores = this.storeList//.filter(k => !this.selectedStores.includes(k.value));
    if (this.newRowAdded || filteredStores.length === 0) {
      this.spinner.hide();
      if (this.newRowAdded)
        this.toastr.error('Please save existing data first before adding another!');
      else
        this.toastr.error('No stores available to add');
      return;
    }
    this.newRowAdded = true;
    this.gridInfo.api.updateRowData({
      add: [{
        "storeBankID": 0,
        "paymentsourceID": parseInt(this.params.data.paymentSourceID),
        "storelocationID": filteredStores[0].value,
        "storelocationIDList": filteredStores,
        "storeName": filteredStores[0].text,
        "bankNickName": "",
        "accountNumber": null,
        "startCheckNo": null,
        "lastCheckNo": null,
        "notes": "",
        createdBy: this.userInfo.userName,
        createdDateTime: new Date(),
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
        "isActive": true,
        "isEdit": true,
        "isNewRow": true,
        "isCancel": true
      }], addIndex: 0
    });
    this.selectedStores.push(filteredStores[0].value);
    this.filterstoreData(filteredStores[0].value, 0, 'storelocationID');
    this.gridApi.redrawRows();
    this.getStartEditingCell('bankNickName', 0);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  getRowData() {
    const storeBankRowData = [];
    this.gridInfo.api.forEachNode(function (node) {
      storeBankRowData.push(node.data);
    });
    this.detailsRowData = storeBankRowData;
    this.gridInfo.api.sizeColumnsToFit();
  }
  ngOnDestroy(): void {
    const detailGridId = 'detail_' + this.masterRowIndex;
    // ag-Grid is automatically destroyed
    console.log('removing detail grid info with id: ', detailGridId);
    this.masterGridApi.removeDetailGridInfo(detailGridId);
  }
  onChange(i, valuefield, value, textfield, text, params?) {
    // if (params) {
    //   if (params.data.isNewRow) {
    //     i = this.detailsRowData.length;
    //   }
    // }
    // this.gridApi.redrawRows();
    if (valuefield === 'storelocationID') {
      this.filterstoreData(value, i, valuefield);
    }
    this.gridApi.getRowNode(i).data[valuefield] = value;
    this.gridApi.getRowNode(i).data[textfield] = text;
    if (valuefield === 'storelocationID')
      this.gridApi.redrawRows();
    else
      this.gridApi.refreshCells();
  }
  filterstoreData(value, i, valuefield) {
    const storeListData = this.storeList;
    this.selectedStores = this.selectedStores//.filter(k => k != this.gridApi.getRowNode(i).data[valuefield]);
    this.selectedStores.push(parseInt(value));
    const filteredList = this.selectedStores;
    this.gridApi.forEachNode(function (rowNode, index) {
      if (rowNode.id !== i) {
        rowNode.data.storelocationIDList = storeListData//.filter(k => (parseInt(rowNode.data.storelocationID) === k.value || !filteredList.includes(k.value)));
      }
    });
  }
  // (cellClicked)="onCellClicked($event)" 
  // onCellClicked($event) {
  //   this.gridApi.forEachNode((rowNode, index) => {
  //     if (rowNode.id == parseInt($event.rowIndex))
  //       rowNode.data.isEdit = true;
  //     else
  //       rowNode.data.isEdit = false;
  //   });
  //   this.getStartEditingCell('bankNickName', $event.rowIndex);
  // }
  Edit(_rowIndex) {
    this.gridApi.forEachNode((rowNode, index) => {
      if (rowNode.id == parseInt(_rowIndex)) {
        rowNode.data.isEdit = true;
        rowNode.data.copy = null
        rowNode.data.copy = JSON.parse(JSON.stringify(rowNode.data));
      } else
        rowNode.data.isEdit = false;
    });
    this.getStartEditingCell('bankNickName', _rowIndex);
  }
  Delete(_rowIndex) {
    this.spinner.show();
    const storeBankID = this.gridApi.getRowNode(_rowIndex).data.storeBankID;
    if (parseInt(storeBankID) > 0) {
      this.dataService.deleteData(`StoreBank/Delete/${storeBankID}`).subscribe(result => {
        this.spinner.hide();
        if (result.statusCode && result.statusCode === 500) {
          this.toastr.error("Already in use", this.constants.infoMessages.error);
        } else if (result === '0') {
          this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        } else if (result === '1') {
          this.deleteRow(_rowIndex);
        }
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.contactAdmin);
      });
    }
    else {
      this.deleteRow(_rowIndex);
      this.newRowAdded = false;
    }
  }

  deleteRow(_rowIndex) {
    const allNodesData = Array<any>()
    const storeListData = this.storeList;
    this.selectedStores = this.selectedStores;//.filter(k => k != this.gridApi.getRowNode(_rowIndex).data['storelocationID']);
    const filteredList = this.selectedStores;
    this.gridApi.forEachNode((node, i) => {
      if (_rowIndex !== parseInt(node.id)) {
        node.data.storelocationIDList = storeListData;//.filter(k => (node.data.storelocationID === k.value || !filteredList.includes(k.value)));
        allNodesData.push(node.data);
      }
    });
    this.gridApi.setRowData(allNodesData);
    this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
    this.spinner.hide();
  }

  Cancel(_rowIndex) {
    this.gridApi.getRowNode(_rowIndex).data = this.gridApi.getRowNode(_rowIndex).data.copy;
    this.gridApi.getRowNode(_rowIndex).data.isEdit = false;
    this.gridApi.stopEditing(true);
    this.gridApi.refreshCells();
    this.gridApi.redrawRows();
  }
}
