import { Component, OnInit, Input } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';
import { TestService } from '@shared/services/test/test.service';
@Component({
  selector: 'app-add-linked-item',
  templateUrl: './add-linked-item.component.html',
  styleUrls: ['./add-linked-item.component.scss']
})
export class AddLinkedItemComponent implements OnInit {
  @Input() itemId: any;
  @Input() masterData: any;
  @Input() itemInfo: any;
  linkedIGridOptions: GridOptions;
  linkedIGridApi: any;
  linkedIRowData: any;
  isAddRowLinked = false;
  addlinkedRow: number;
  userInfo: any;
  addlinkedId: any;
  isHideButtons = false;
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService, private testService: TestService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.userInfo = this.constantService.getUserInfo();
    this.linkedIGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.linkedItemGrid);
    this.commonService.LinkedTypeList = null;
  }

  ngOnInit() {
    this.GetLinkedType();
    this.GetLocalLinkedItem();
  }
  onLinkedGridReady(params) {
    this.linkedIGridApi = params.api;
    this.linkedIGridApi.sizeColumnsToFit();
  }
  // Linked Grid Add New Row
  addRowLinked() {
    if (this.isAddRowLinked) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowLinked = true;

    this.addlinkedId = this.linkedIGridApi.getDisplayedRowCount();
    this.linkedIGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        localLinkedItemID: 0,
        localLinkMasterItemID: 0,
        linkItemID: 0,
        discountAmount: 0,
        createdBy: '',
        createdDateTime: new Date(),
        lastModifiedDateTime: new Date(),
        linkedItemTypeID: 0,
        linkedTypeDescription: '',
        isDefault: true,
        posCode: '',
        description: '',
        masterPriceBookIemID: 0,
        departmentID: 0,
        companyID: 0
      }],
      addIndex: 0
    });
    this.addlinkedRow = this.addlinkedRow + 1;
    this.getStartlinkedEditingCell('posCode', 0);
  }
  // set edit cell
  getStartlinkedEditingCell(_colKey, _rowIndex) {
    this.linkedIGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  onLinkedCellValueChanged(params) {
    if (params && params.column && params.column.colId === 'posCode') {
      if (params.rowIndex === 0) {
        this.setLinkedRowValue(this.linkedIGridApi.getRowNode(this.addlinkedRow === 0 ? params.rowIndex : this.addlinkedId), params);
      } else {
        this.setLinkedRowValue(this.linkedIGridApi.getRowNode(params.rowIndex - this.addlinkedRow), params);
      }
    }
  }
  setLinkedRowValue(rowNode, params) {
    if (!rowNode) {
      rowNode = this.linkedIGridApi.getDisplayedRowAtIndex(0);
    }
    if (rowNode && rowNode.data && rowNode.data.posCode) {
      this.spinner.show();
      this.dataSerice.getData('Item/checkPOSCode/' + rowNode.data.posCode + '/' + this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.itemID === this.itemId) {
            this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
            this.getStartlinkedEditingCell('posCode', params.rowIndex);
            return;
          }
          if (response && response.itemID) {
            rowNode.setDataValue('description', response.description);
            rowNode.setDataValue('linkItemID', response.itemID);
            // rowNode.setDataValue('itemID', response.itemID);
          } else {
            rowNode.setDataValue('posCode', params.oldValue);
            this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    }
  }

  saveLocalLinkedItem(params) {
    // if (this.itemInfo.isDefault === true) {
    //   return;
    // }
    if (params.data.posCode.trim() === '') {
      this.toastr.error('Please Enter UPC Code...', 'Error');
      this.getStartlinkedEditingCell('posCode', params.rowIndex);
      return;
    }
    const linkTypeObj = _.find(this.commonService.LinkedTypeList, ['description', params.data.linkedTypeDescription]);

    if (params.data.linkedTypeDescription === '' || !linkTypeObj) {
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
      localLinkMasterItemID: this.itemId,
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
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          // this.GetLocalLinkedItem();
          this.isAddRowLinked = false;
          // this.addlinkedRow = 0;
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
      const linkExists = this.linkedIRowData.length > 0 ? _.find(this.linkedIRowData, ['posCode', params.data.posCode]) : null;
      // _.find(this.linkedIRowData, function (o) { return o.posCode = params.data.posCode; }) : null;
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
          // this.linkedIRowData = res;
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
      this.linkedIGridApi.updateRowData({ remove: [params.data] });
      this.getLinkedAction();
      this.isAddRowLinked = false;
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('LocalLinkedItem?id=' + params.data.localLinkedItemID).subscribe((response) => {
        this.spinner.hide();
        if (response && Number(response) === 1) {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.linkedIGridApi.updateRowData({ remove: [params.data] });
          this.getLinkedAction();
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);

        }

      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
      );
    }
  }
  getLinkedAction() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.linkedIGridApi && this.linkedIGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.linkedIRowData = arr;
  }
  GetLinkedType() {
    this.dataSerice.getData('LinkedType/getAll').subscribe((response) => {
      this.commonService.LinkedTypeList = response;
    }, (error) => {
      console.log(error);
    });
  }
  GetLocalLinkedItem() {
    this.spinner.show();
    this.dataSerice.getData('LocalLinkedItem/GetByItemID?itemID=' + this.itemId).subscribe((response) => {
      this.spinner.hide();
      this.isAddRowLinked = false;
      if (response && response['statusCode']) {
        this.linkedIRowData = [];
        return;
      }
      this.linkedIRowData = response;
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    });
  }
}
