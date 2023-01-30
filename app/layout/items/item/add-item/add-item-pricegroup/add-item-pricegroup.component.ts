import { Component, OnInit, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-item-pricegroup',
  templateUrl: './add-item-pricegroup.component.html',
  styleUrls: ['./add-item-pricegroup.component.scss']
})
export class AddItemPricegroupComponent implements OnInit {
  @Input() itemId: any;
  priceGGridOptions: GridOptions;
  priceGGridApi: any;
  priceGRowData: any;
  priceRowAdded: boolean;
  userInfo = this.constantService.getUserInfo();
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.priceGGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.priceGItemGrid);

  }

  ngOnInit() {
    this.getCompanyPriceGroup();
    this.getItemPriceGroup();
  }
  onPriceGGridReady(params) {
    this.priceGGridApi = params.api;
    this.priceGGridApi.sizeColumnsToFit();
  }
  getCompanyPriceGroup() {
    this.dataSerice.getData(`CompanyPriceGroup/getByCompanyID/${this.userInfo.companyId}`).subscribe((response) => {
      if (response && response['statusCode']) {
        this.commonService._companyPriceGroupRow = [];
        return;
      }
      this.commonService._companyPriceGroupRow = response;
    }, (error) => {
      console.log(error);
    }
    );
  }
  // price group code start
  getItemPriceGroup() {
    this.spinner.show();
    this.dataSerice.getData('ItemPriceGroup/getByItemId/' + this.itemId + '/' + this.userInfo.companyId)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.priceGRowData = [];
          return;
        }
        if (response) {
          response.forEach(x => {
            x.CompanyPriceGroupName = x.companyPriceGroupName;
          });
        }

        this.priceGRowData = response ? response : [];
      }, (error) => {
        this.spinner.hide();
        console.log(error);

      });
  }
  editPriceGItem() {
    if (this.priceRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.priceRowAdded = true;
    const newItem = {
      itemGroupID: 0,
      itemID: this.itemId,
      priceGroupID: 0,
      CompanyPriceGroupName: '',
      masterPriceGroupID: 0,
      groupIDs: '',
      isSuperGroup: false,
      companyID: this.userInfo.companyId,
      groupExists: null,
      isSaveRequired: true
    };
    this.priceGGridApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.startPriceGroupEditingCell(0, 'CompanyPriceGroupName');
  }
  startPriceGroupEditingCell(rowIndex?: any, colKey?: any) {
    this.priceGGridApi.startEditingCell({
      rowIndex: rowIndex,
      colKey: colKey
    });
  }
  editPriceGAction(params) {
    const finalObj = _.find(this.commonService._companyPriceGroupRow, ['CompanyPriceGroupName', params.data.CompanyPriceGroupName]);
    // const finalObj = this.commonService._companyPriceGroupRow.filter(
    //   x => x.CompanyPriceGroupName === params.data.CompanyPriceGroupName);
    if (!finalObj) {
      this.toastr.error('Please Select Price Group', this.constantService.infoMessages.error);
      this.startPriceGroupEditingCell(params.rowIndex, 'CompanyPriceGroupName');
      return;
    }
    const postData = {
      itemGroupID: params.data.itemGroupID,
      itemID: this.itemId,
      priceGroupID: finalObj.CompanyPriceGroupID,
      CompanyPriceGroupName: finalObj.CompanyPriceGroupName,
      masterPriceGroupID: finalObj['masterPriceGroupID'],
      groupIDs: finalObj['groupIDs'] ? finalObj['groupIDs'] : '',
      isSuperGroup: finalObj['isSuperGroup'],
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
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res) {
          this.priceRowAdded = false;
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          // this.getItemPriceGroup();
        } else {
          this.toastr.error(this.constantService.infoMessages.alreadyExists, this.constantService.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        console.log(err);
      });
    } else {
      const isDuplicate = _.find(this.priceGRowData, ['CcompanyPriceGroupName', params.data.CompanyPriceGroupName]);
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
  deletepriceGroup(params) {
    if (params.data.itemGroupID === 0) {
      this.priceGGridApi.updateRowData({ remove: [params.data] });
      this.priceRowAdded = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('ItemPriceGroup?id=' + params.data.itemGroupID).subscribe(res => {
        this.spinner.hide();
        if (res === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.priceGGridApi.updateRowData({ remove: [params.data] });
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
