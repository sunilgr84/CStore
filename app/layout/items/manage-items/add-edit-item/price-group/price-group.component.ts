import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { GridApi } from 'ag-grid-community';
import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

@Component({
  selector: 'app-price-group',
  templateUrl: './price-group.component.html',
  styleUrls: ['./price-group.component.scss']
})
export class PriceGroupComponent {
  @Output() rowCount: EventEmitter<any> = new EventEmitter();
  @Input('show')
  set show(val) {
    this.isShow = val;
    this.priceRowAdded = false;
  }
  isShow;
  @Input()
  itemID: number
  userInfo = this.constantService.getUserInfo();
  priceRowAdded: boolean;
  tempId: number;
  priceGroupGridOptions: any;
  priceGroupGridApi: GridApi;
  priceGroupRowData: any[] = [];
  masterData: any;
  addrow: any;

  constructor(private dataSerice: SetupService, private constantService: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService, private paginationGridService: PaginationGridService,
    private commonService: CommonService) {
    this.priceGroupGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.priceGroupItemGrid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.itemID && changes.itemID.currentValue) {
      this.getCompanyPriceGroup();
      this.getItemPriceGroup();
    }
  }

  onPriceGroupGridReady(params) {
    this.priceGroupGridApi = params.api;
    this.priceGroupGridApi.sizeColumnsToFit();
  }

  getCompanyPriceGroup() {
    // this.spinner.show();
    this.dataSerice.getData(`CompanyPriceGroup/getByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
      // this.spinner.hide();
      if (response && response['statusCode']) {
        this.commonService._companyPriceGroupRow = [];
        return;
      }
      this.commonService._companyPriceGroupRow = response;
    }, (error) => {
      console.log(error);
    });
  }
  // price group code start
  getItemPriceGroup() {
    // this.spinner.show();
    this.dataSerice.getData('ItemPriceGroup/getByItemId/' + this.itemID + '/' + this.userInfo.companyId)
      .subscribe((response) => {
        // this.spinner.hide();
        if (response && response['statusCode']) {
          this.priceGroupRowData = [];
          return;
        }
        this.priceGroupRowData = response ? response : [];
        if (this.priceGroupGridApi)
          this.priceGroupGridApi.setRowData(this.priceGroupRowData);
        this.rowCount.emit({ key: 'priceGroup', value: this.priceGroupRowData.length });
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  editPriceGroupItem(event) {
    event.stopPropagation();
    if (!this.itemID)
      return false;
    if (this.priceRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.priceRowAdded = true;
    const newItem = {
      itemGroupID: 0,
      itemID: this.itemID,
      priceGroupID: null,
      companyPriceGroupName: '',
      masterPriceGroupID: 0,
      groupIDs: '',
      isSuperGroup: false,
      companyID: this.userInfo.companyId,
      groupExists: null,
      isSaveRequired: true,
      isNewRecord: true
    };
    this.priceGroupGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.startPriceGroupEditingCell(0, 'priceGroupID');
  }

  startPriceGroupEditingCell(rowIndex?: any, colKey?: any) {
    this.priceGroupGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: colKey
    });
  }

  onEdit(params) {
    this.startPriceGroupEditingCell(params.rowIndex, 'priceGroupID');
  }

  onCancel(params) {
    if (params.data.itemGroupID === 0) {
      this.priceGroupGridApi.updateRowData({ remove: [params.data] });
      this.priceRowAdded = false;
      this.getPriceGroupRow();
      this.priceGroupGridApi.setRowData(this.priceGroupRowData);
      this.rowCount.emit({ key: 'priceGroup', value: this.priceGroupRowData.length });
      return;
    } else {
      this.priceGroupGridApi.stopEditing();
    }
  }

  editPriceGroupAction(params) {
    this.priceGroupGridApi.stopEditing();
    this.onEdit(params);
    const finalObj = _.find(this.commonService._companyPriceGroupRow, ['CompanyPriceGroupID', params.data.priceGroupID]);
    if (!finalObj) {
      this.toastr.error('Please Select Price Group', this.constantService.infoMessages.error);
      this.startPriceGroupEditingCell(params.rowIndex, 'priceGroupID');
      return;
    }
    const postData = {
      itemGroupID: params.data.itemGroupID,
      itemID: this.itemID,
      priceGroupID: finalObj.CompanyPriceGroupID,
      companyPriceGroupName: finalObj.CompanyPriceGroupName,
      masterPriceGroupID: finalObj['MasterPriceGroupID'],
      groupIDs: finalObj['GroupIDs'] ? finalObj['GroupIDs'] : '',
      isSuperGroup: finalObj['IsSuperGroup'],
      companyID: this.userInfo.companyId,
      groupExists: false,
      posCode: '',
      description: ''
    };
    if (params.data.itemGroupID > 0) {
      this.spinner.show();
      this.dataSerice.updateData('ItemPriceGroup/update', postData).subscribe(res => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.getPriceGroupRow();
          this.priceGroupGridApi.setRowData(this.priceGroupRowData);
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res) {
          this.priceRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          params.data.companyPriceGroupName = finalObj.CompanyPriceGroupName;
          this.getPriceGroupRow();
          this.priceGroupGridApi.setRowData(this.priceGroupRowData);
          this.rowCount.emit({ key: 'priceGroup', value: this.priceGroupRowData.length });
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    } else {
      const isDuplicate = _.find(this.priceGroupRowData, ['companyPriceGroupName', params.data.companyPriceGroupName]);
      if (isDuplicate) {
        this.toastr.warning('Price Group Already Exists..', this.constantService.infoMessages.error);
        return;
      }
      this.spinner.show();
      this.dataSerice.postData('ItemPriceGroup/addNew', postData).subscribe(res => {
        this.spinner.hide();
        if (res && res.itemGroupID) {
          this.priceRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.getItemPriceGroup();
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }

  getPriceGroupRow() {
    const arr = [];
    this.priceGroupGridApi && this.priceGroupGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.priceGroupRowData = arr;
  }

  deletepriceGroup(params) {
    if (params.data.itemGroupID === 0) {
      this.priceGroupGridApi.updateRowData({ remove: [params.data] });
      this.priceRowAdded = false;
      this.getPriceGroupRow();
      this.priceGroupGridApi.setRowData(this.priceGroupRowData);
      this.rowCount.emit({ key: 'priceGroup', value: this.priceGroupRowData.length });
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('ItemPriceGroup?id=' + params.data.itemGroupID).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.priceGroupGridApi.updateRowData({ remove: [params.data] });
          this.getPriceGroupRow();
          this.priceGroupGridApi.setRowData(this.priceGroupRowData);
          this.rowCount.emit({ key: 'priceGroup', value: this.priceGroupRowData.length });
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    }
  }

}
