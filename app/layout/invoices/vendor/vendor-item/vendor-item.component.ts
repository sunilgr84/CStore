import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as _ from 'lodash';


@Component({
  selector: 'app-vendor-item',
  templateUrl: './vendor-item.component.html',
  styleUrls: ['./vendor-item.component.scss']
})
export class VendorItemComponent implements OnInit {
  itemRowData: any[];
  editGridOptions: GridOptions;
  gridItemApi: any;
  tempId = 0;
  addrow = 0;
  newRowAdded = false;
  @Input() vendorID?: any;
  @Output() backToVendorList: EventEmitter<any> = new EventEmitter();
  isUpcCodeFound: boolean;
  checkDuplicateItemList: any;
  constructor(private changeRef: ChangeDetectorRef, private constantService: ConstantService,
    private itemsService: SetupService, private fb: FormBuilder, private toastr: ToastrService,
    private editGridService: EditableGridService, private spinner: NgxSpinnerService) {
    this.editGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.vendorItemGrid);
  }

  ngOnInit() {
    if (this.vendorID) {
      this.getItemGrid(this.vendorID);
    }
  }
  onReady(params) {
    this.gridItemApi = params.api;
  }
  getItemGrid(vendorID) {
    this.spinner.show();
    this.itemsService.getData('VendorItem/getByVendorId/' + vendorID).subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.spinner.hide();
          this.checkDuplicateItemList = this.itemRowData = [];
          return;
        }
        this.itemRowData = response;
        this.checkDuplicateItemList = response;
        this.spinner.hide();
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  ///  vendor item empty schema
  createNewRowData() {
    this.tempId = this.gridItemApi.getDisplayedRowCount();
    const newData = {
      id: this.tempId,
      vendorItemID: 0, vendorID: '', itemID: 0, vendorItemCode: '', itemName: '',
      itemPosCode: '', vendorName: '', vendorCode: '', vendorExists: true, description: '', isSaveRequired: true
    };
    return newData;
  }
  // add row in grid
  onInsertRowAt() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    const newItem = this.createNewRowData();
    this.gridItemApi.updateRowData({
      add: [newItem],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartEditingCell('itemPosCode', 0);
  }
  // set edit cell
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridItemApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  // delete row api || locally
  deleteItemRow(params) {
    if (params.data.vendorItemID === 0) {
      this.gridItemApi.updateRowData({ remove: [params.data] });
      this.addrow = this.addrow - 1;
      this.newRowAdded = false;
    }
    if (params.data.vendorItemID > 0) {
      this.spinner.show();
      this.itemsService.deleteData(`VendorItem?id=${params.data.vendorItemID}`).
        subscribe((response: any) => {
          if (response) {
            this.spinner.hide();
            this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
            this.getItemGrid(this.vendorID);
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.error);
        });
    }
  }
  onCellValueChanged(params) {
    if (params.column.colId === 'itemPosCode') {
      if (params.rowIndex === 0) {
        this.setRowValue(this.gridItemApi.getRowNode(this.addrow === 0 ? params.rowIndex : this.tempId), params);
      } else {
        this.setRowValue(this.gridItemApi.getRowNode(params.rowIndex - this.addrow), params);
      }
    }
  }
  setRowValue(rowNode, params) {
    if (!rowNode) {
      rowNode = this.gridItemApi.getDisplayedRowAtIndex(0);
    }
    if (rowNode.data.itemPosCode) {
      this.itemsService.getData('VendorItem/getItemByItemPosCode/' + rowNode.data.itemPosCode).subscribe(
        (response) => {
          if (response && response.itemID > 0) {
            this.isUpcCodeFound = true;
            rowNode.setDataValue('description', response.description);
            rowNode.setDataValue('itemID', response.itemID);
          } else {
            this.isUpcCodeFound = false;
            rowNode.setDataValue('description', '');
            rowNode.setDataValue('itemID', '');
            this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
          }
        }, (error) => {
          console.log(error);
        }
      );
    }
  }
  // call api add & update
  addEdit(params) {
    if (params.data.itemPosCode === '') {
      this.toastr.warning('Please Enter Item UPC Code!');  // required validation
      this.getStartEditingCell('itemPosCode', params.rowIndex);
      return;
    }
    if (params.data.vendorItemCode === '') {
      this.toastr.warning('Please Enter Vendor Item Code!');  // required validation
      this.getStartEditingCell('vendorItemCode', params.rowIndex);
      return;
    }
    if (!this.isUpcCodeFound) {
      this.getStartEditingCell('itemPosCode', params.rowIndex);
      this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
      return 0;
    }

    if (params.data.vendorItemID > 0) {
      const postData = {
        ...params.data,
        vendorID: this.vendorID,
        itemName: '',
        vendorCode: '',
        vendorExists: ''
      };
      this.spinner.show();
      this.itemsService.updateData('VendorItem', postData).
        subscribe((response: any) => {
          this.spinner.hide();
          if (response === '1') {
            this.newRowAdded = false;
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
            const data = this.itemRowData;
            data[params.rowIndex] = postData;
            this.itemRowData = data;

          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
        });
    } else {
      if (this.itemRowData.length > 0) {
        const duplicate = _.find(this.checkDuplicateItemList, ['itemPosCode', params.data.itemPosCode]);
        if (duplicate) {
          this.toastr.warning('Item UPC Code Already Exists..!');  // required validation
          this.getStartEditingCell('itemPosCode', params.rowIndex);
          return;
        }
      }

      const postData = {
        ...params.data,
        vendorID: this.vendorID,
        vendorExists: true
      };
      this.spinner.show();
      this.itemsService.postData('VendorItem', postData).
        subscribe((response) => {
          if (response && response.vendorItemID) {
            this.newRowAdded = false;
            this.spinner.hide();
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.getItemGrid(this.vendorID);
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          }
        },
          (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          });
    }
  }
  // back to Vendor List
  backToList() {
    this.backToVendorList.emit(false);
    this.changeRef.detectChanges();
  }
}
