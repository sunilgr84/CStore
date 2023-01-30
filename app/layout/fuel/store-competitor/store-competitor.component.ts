import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';

import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { StoreService } from '@shared/services/store/store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-store-competitor',
  templateUrl: './store-competitor.component.html',
  styleUrls: ['./store-competitor.component.scss']
})
export class StoreCompetitorComponent implements OnInit {
  rowData: any;
  gridOptions: GridOptions;
  gridApi: any;
  isAddUpdate = false;
  isEdit = false;
  storeLocationList: any;
  storeCompetitor = {
    storeCompetitorID: 0,
    storeLocationID: null,
    storeCompetitorName: '',
    storeName: ''
  };
  _storeLocationId: any;
  userInfo = this.constantService.getUserInfo();
  initialFormValue: any;
  isLoading = true;
  stateList: any;
  isStateLoading = true;
  brandList: any[];
  constructor(private gridService: GridService, private constantService: ConstantService, private _setupService: SetupService
    , private storeService: StoreService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.storeCompetitorGrid);
    this.initialFormValue = this.storeCompetitor;
  }

  ngOnInit() {
    this.getStoreLocation();
    this.getAllState();
    this.getBrandList();
  }

  addMore() {
    this.storeCompetitor = {
      storeCompetitorID: 0,
      storeLocationID: null,
      storeCompetitorName: '',
      storeName: ''
    };
    this.isEdit = false;
    this.isAddUpdate = true;
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }
  backToList() {
    this.selectStoreLocation(this._storeLocationId);
    this.isAddUpdate = false;
  }
  getStoreLocation() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.isLoading = false;
        if (response && response['statusCode']) {
          this.storeLocationList = [];
          return;
        }
        this.storeLocationList = response;
        if (response && response.length === 1) {
          this._storeLocationId = response[0].storeLocationID;
          this.storeCompetitor.storeLocationID = response[0].storeLocationID;
          const tempArray = [];
          tempArray.push(this._storeLocationId);
          this._storeLocationId = tempArray;
          this.selectStoreLocation(tempArray);
        }
      }, (error) => {
        console.log(error);
      }
    );
  }
  getAllState() {
    this._setupService.getData('State/GetAll').subscribe((response) => {
      this.isStateLoading = false;
      if (response && response['statusCode']) {
        this.stateList = [];
        return;
      }
      this.stateList = response;
    }, (error) => {
      console.log(error);
    });
  }
  getBrandList() {
    this._setupService.getData(`MasterBrand/list`).subscribe(result => {
      if (result && result['statusCode']) {
        this.brandList = [];
        return;
      }
      this.brandList = result;
    }, (error) => { console.log(error); });
  }
  selectStoreLocation(arr) {
    const id = arr ?
      arr.map(x => x).join(',') : '';
    if (id) {
      this.spinner.show();
      this._setupService.getData('StoreCompetitor/list/' + id + '/' + this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          this.rowData = response;
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    } else {
      this.rowData = [];
    }
  }
  editAction(params) {
    this.storeCompetitor = params.data;
    this.isEdit = true;
    this.isAddUpdate = true;
  }
  onSubmit(form) {
    const postData = {
      ...this.storeCompetitor,
      storeLocationID: this.storeLocationList.length === 1 ?
        this.storeLocationList[0].storeLocationID : this.storeCompetitor.storeLocationID,
    };
    if (this.isEdit) {
      this.spinner.show();
      this._setupService.updateData('StoreCompetitor', postData).subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constantService.infoMessages.updatedRecord, 'success');
          this.backToList();
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'error');
        }
      },
        (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, 'error');
        },
      );
    } else {
      this.spinner.show();
      this._setupService.postData('StoreCompetitor', postData).subscribe((response) => {
        this.spinner.hide();
        if (response && response.storeCompetitorID) {
          this.toastr.success(this.constantService.infoMessages.addedRecord, 'success');
          this.backToList();
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'error');
        }
      },
        (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, 'error');
        },
      );
    }
  }
  deleteAction(params) {
    this.spinner.show();
    this._setupService.deleteData('StoreCompetitor/' + params.data.storeCompetitorID)
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response >= 0) {
            this.toastr.success(this.constantService.infoMessages.deletedRecord, 'success');
            const deleted = this.gridApi ? this.gridApi.updateRowData({ remove: [params.data] }) : '';
            this.getRowNode();
          } else {
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'error');
          }
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'error');
        },
      );
  }
  getRowNode() {
    if (this.gridApi) {
      const arr = [];
      // tslint:disable-next-line:no-unused-expression
      this.gridApi.forEachNode(function (node) {
        arr.push(node.data);
      });
      this.rowData = arr;
    }
  }
}
