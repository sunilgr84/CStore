import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

@Component({
  selector: 'app-linked-items',
  templateUrl: './linked-items.component.html',
  styleUrls: ['./linked-items.component.scss'],
})
export class LinkedItemsComponent {
  @Output() rowCount: EventEmitter<any> = new EventEmitter();
  @Input('show')
  set show(val) {
    this.isShow = val;
    this.isAddRowLinked = false;
  }
  isShow;
  @Input() itemID: number;
  @Input() masterUPCCode: any;
  userInfo = this.constantService.getUserInfo();
  linkedItemsGridOptions: any;
  linkedItemsGridApi: any;
  linkedItemsRowData: any = [];
  isAddRowLinked = false;
  addlinkedRow: number;
  addlinkedId: any;

  constructor(private dataSerice: SetupService, private constantService: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService, private paginationGridService: PaginationGridService,
    private commonService: CommonService) {
    this.linkedItemsGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.linkedItemsGrid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.itemID && changes.itemID.currentValue) {
      this.GetLinkedType();
      this.GetLocalLinkedItem();
    }
  }

  onLinkedGridReady(params) {
    this.linkedItemsGridApi = params.api;
    this.linkedItemsGridApi.sizeColumnsToFit();
  }

  addRowLinked(event) {
    event.stopPropagation();
    if (this.isAddRowLinked) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowLinked = true;
    this.linkedItemsGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        localLinkedItemID: 0,
        localLinkMasterItemID: 0,
        linkItemID: 0,
        discountAmount: 0,
        createdBy: '',
        createdDateTime: new Date(),
        lastModifiedDateTime: new Date(),
        linkedItemTypeID: null,
        linkedTypeDescription: '',
        isDefault: true,
        posCode: '',
        description: '',
        masterPriceBookIemID: 0,
        departmentID: 0,
        companyID: 0,
        isNewRecord: true,
        masterUPCCode : this.masterUPCCode,
        itemID : this.itemID
      }],
      addIndex: 0
    });
    this.addlinkedRow = this.addlinkedRow + 1;
    this.getStartlinkedEditingCell('posCode', 0);
  }

  getStartlinkedEditingCell(_colKey, _rowIndex) {
    this.linkedItemsGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  onEdit(params) {
    this.getStartlinkedEditingCell('posCode', params.rowIndex);
  }

  onCancel(params) {
    if (params.data.localLinkedItemID === 0) {
      this.linkedItemsGridApi.updateRowData({ remove: [params.data] });
      this.getLinkedAction();
      this.linkedItemsGridApi.setRowData(this.linkedItemsRowData);
      this.rowCount.emit({ key: 'linkedItems', value: this.linkedItemsRowData.length });
      this.isAddRowLinked = false;
      return;
    } else {
      this.linkedItemsGridApi.stopEditing();
    }
  }

  saveLocalLinkedItem(params) {
    if (params.data.posCode.trim() === '') {
      this.toastr.error('Please Enter UPC Code...', 'Error');
      this.getStartlinkedEditingCell('posCode', params.rowIndex);
      return;
    }
    const linkTypeObj = this.commonService.LinkedTypeList.filter(k => k.linkedItemTypeID == params.data.linkedItemTypeID)[0];
    if (!linkTypeObj) {
      this.toastr.error('Please select link type...', 'Error');
      this.getStartlinkedEditingCell('linkedTypeDescription', params.rowIndex);
      return;
    }
    if (params.data.discountAmount === '') {
      this.toastr.error('Please Enter Discount...', 'Error');
      this.getStartlinkedEditingCell('discountAmount', params.rowIndex);
      return;
    }
    const postData = {
      ...params.data,
      localLinkedItemID: params.data.localLinkedItemID ? Number(params.data.localLinkedItemID) : 0,
      localLinkMasterItemID: this.itemID,
      linkItemID: params.data.linkItemID,
      discountAmount: params.data.discountAmount,
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
      isDefault: true,
      linkedItemTypeID: linkTypeObj.linkedItemTypeID,
      linkedTypeDescription: params.data.linkedTypeDescription
    };
    if (postData.localLinkedItemID > 0) {
      this.spinner.show();
      this.dataSerice.updateData('LocalLinkedItem', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res && Number(res) > 0) {
          params.data.isNewRecord = false;
          this.linkedItemsGridApi.stopEditing();
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          this.isAddRowLinked = false;
        } else {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        }
      },
        (err) => {
          this.spinner.hide();
        }
      );
    } else {
      // tslint:disable-next-line:max-line-length
      const linkExists = this.linkedItemsRowData.length > 0 ? _.find(this.linkedItemsRowData, ['posCode', params.data.posCode]) : null;
      if (linkExists) {
        this.toastr.warning('This UPC code already exists', 'warning');
        this.getStartlinkedEditingCell('posCode', params.rowIndex);
        return;
      }
      this.spinner.show();
      this.dataSerice.postData('LocalLinkedItem', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res) {
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.GetLocalLinkedItem();
          this.isAddRowLinked = false;
          this.addlinkedRow = 0;
        } else {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
        }
      },
        (err) => {
          this.spinner.hide();
        }
      );
    }

  }
  // Linked Grid Delete Row
  deleteLinkedAction(params) {
    if (params.data.localLinkedItemID === 0) {
      this.linkedItemsGridApi.updateRowData({ remove: [params.data] });
      this.getLinkedAction();
      this.linkedItemsGridApi.setRowData(this.linkedItemsRowData);
      this.rowCount.emit({ key: 'linkedItems', value: this.linkedItemsRowData.length });
      this.isAddRowLinked = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('LocalLinkedItem?id=' + params.data.localLinkedItemID).subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.linkedItemsGridApi.updateRowData({ remove: [params.data] });
          this.getLinkedAction();
          this.linkedItemsGridApi.setRowData(this.linkedItemsRowData);
          this.rowCount.emit({ key: 'linkedItems', value: this.linkedItemsRowData.length });
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
    }
  }

  getLinkedAction() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.linkedItemsGridApi && this.linkedItemsGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.linkedItemsRowData = arr;
  }

  GetLinkedType() {
    // this.spinner.show();
    this.dataSerice.getData('LinkedType/getAll').subscribe((response) => {
      // this.spinner.hide();
      this.commonService.LinkedTypeList = response;
    }, (error) => {
      console.log(error);
    });
  }

  GetLocalLinkedItem() {
    // this.spinner.show();
    this.dataSerice.getData('LocalLinkedItem/GetByItemID?itemID=' + this.itemID).subscribe((response) => {
      // this.spinner.hide();
      this.isAddRowLinked = false;
      if (response && response['statusCode']) {
        this.linkedItemsRowData = [];
        return;
      }
      this.linkedItemsRowData = response.map((linkedItem) => {
        linkedItem.masterUPCCode = this.masterUPCCode;
        linkedItem.itemID = this.itemID;
        return linkedItem;
      });
      if (this.linkedItemsGridApi)
        this.linkedItemsGridApi.setRowData(this.linkedItemsRowData);
      this.rowCount.emit({ key: 'linkedItems', value: this.linkedItemsRowData.length });
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }

}
