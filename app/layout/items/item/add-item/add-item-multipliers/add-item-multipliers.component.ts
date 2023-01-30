import { Component, OnInit, Input } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { EditableGridService } from '@shared/services/editableGrid/editable-grid.service';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '@shared/services/commmon/common.service';
import { GridOptions } from 'ag-grid-community';
import * as _ from 'lodash';
@Component({
  selector: 'app-add-item-multipliers',
  templateUrl: './add-item-multipliers.component.html',
  styleUrls: ['./add-item-multipliers.component.scss']
})
export class AddItemMultipliersComponent implements OnInit {
  @Input() isDefault: any;
  @Input() itemId: any;
  @Input() masterData: any;
  @Input() itemInfo: any;
  isAddRowMultip: any;
  tempId: number;
  multiplierGridOptions: GridOptions;
  multiplierGridApi: any;
  multiplierRowData: any;
  addrow: any;
  multiplierGridColumnApi: any;
  userInfo: any;
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService) {
    this.multiplierGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.multiplierItemGrid);
    this.userInfo = this.constantService.getUserInfo();
    this.commonService.LinkedTypeList = null;
  }

  ngOnInit() {
    this.isDefault = this.itemInfo.isDefault;
    this.GetMultiplierInventoryType();
    this.GetMultipliersByItemID();
    this.GetLinkedType();
  }

  GetLinkedType() {
    this.dataSerice.getData('LinkedType/getAll').subscribe((response) => {
      this.commonService.LinkedTypeList = response;
    }, (error) => {
      console.log(error);
    });
  }
  GetMultiplierInventoryType() {
    this.dataSerice.getData('MultiplierInventoryType/get')
      .subscribe((response) => {
        this.commonService._multiplierInventoryType = response;
      }, (error) => {
        console.log(error);
      });
  }
  onMultiplierGridReady(params) {
    this.multiplierGridApi = params.api;
    this.multiplierGridColumnApi = params.columnApi;
    this.setColumnHideShow(this.itemInfo.isDefault);
    this.multiplierGridApi.sizeColumnsToFit();
  }
  setColumnHideShow(isDefault) {
    if (isDefault === true && this.multiplierGridColumnApi) {
      this.multiplierGridColumnApi.setColumnsVisible(['params'], false);
    } else {
      if (this.multiplierGridColumnApi) {
        this.multiplierGridColumnApi.setColumnsVisible(['params'], true);
      }
    }
  }
  addRowMultiplier() {
    if (this.isAddRowMultip) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowMultip = true;
    this.tempId = 0;
    this.tempId = this.multiplierGridApi.getDisplayedRowCount();
    this.multiplierGridApi.updateRowData({
      add: [{
        isSaveRequired: true,
        multiplierID: 0,
        quantity: 0,
        itemID: 0,
        containedItemID: 0,
        upcCode: '',
        multiplierInventoryTypeID: 0,
        multiplierDescription: null,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null
      }],
      addIndex: 0
    });
    this.addrow = this.addrow + 1;
    this.getStartMultipliersEditingCell('mulType', 0);
  }
  // set edit cell
  getStartMultipliersEditingCell(_colKey, _rowIndex) {
    this.multiplierGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  onCellValueChanged(params) {
    if (params.column.colId === "mulType") {
      this.multiplierGridApi.redrawRows({ rowNodes: [params.node] });
    }
    if (params.column.colId === 'upcCode') {
      if (params.rowIndex === 0) {
        this.setRowValue(this.multiplierGridApi.getRowNode(this.addrow === 0 ? params.rowIndex : this.tempId), params);
      } else {
        this.setRowValue(this.multiplierGridApi.getRowNode(params.rowIndex - this.addrow), params);
      }
    }
  }
  setRowValue(rowNode, params) {
    if (!rowNode) {
      rowNode = this.multiplierGridApi.getDisplayedRowAtIndex(0);
    }
    if (rowNode && rowNode.data && rowNode.data.upcCode) {
      this.spinner.show();
      this.dataSerice.getData('Item/checkPOSCode/' + rowNode.data.upcCode + '/' + this.userInfo.companyId).subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response.itemID === this.itemId) {
            this.toastr.error('You can not make relation with same item', this.constantService.infoMessages.warning);
            this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
            return;
          }
          if (response) {
            rowNode.setDataValue('itemDescription', response.description);
            rowNode.setDataValue('containedItemID', response.itemID);
            // rowNode.setDataValue('itemID', response.itemID);
          } else {
            rowNode.setDataValue('upcCode', params.oldValue);
            this.toastr.warning('Item pos code not found', this.constantService.infoMessages.warning);
          }
        }, (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
    }
  }
  saveMultiplier(params) {
    if (params.data.quantity == 0 || params.data.quantity === "") {
      this.toastr.warning('Quantity should be greater than zero!', 'warning');
      return;
    }
    if (this.isDefault === true) {
      return;
    }
    if (!this.itemId) {
      this.toastr.warning('Please first added item!', 'warning');
      return;
    }
    if (params.data.linkedTypeDescription) {
      this.commonService.LinkedTypeList.forEach(element => {
        if (element.description == params.data.linkedTypeDescription) {
          params.data["linkedItemTypeID"] = element["linkedItemTypeID"];
        }
      });
    }
    let postData = {};
    if (this.masterData && this.masterData.masterPriceBookDetails && this.masterData.masterPriceBookDetails.masterPriceBookItemID > 0) {
      postData = {
        multiplierID: params.data.multiplierID ? params.data.multiplierID : 0,
        quantity: params.data.unitsInCase ? params.data.unitsInCase : 0,
        itemID: this.itemId,
        containedItemID: null,
        multiplierInventoryTypeID: params.data.isPack ? 3 : 2,
        multiplierDescription: params.data.description,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null,
        masterPriceBookItemID: this.masterData.masterPriceBookDetails.masterPriceBookItemID,
        departmentID: this.itemInfo.departmentID ? this.itemInfo.departmentID : 0,
        companyID: this.userInfo.companyId,
        isPackDiscounted: params.data.isPackDiscounted,
        linkedTypeDescription: params.data.linkedTypeDescription,
        discountAmount: params.data.discountAmount,
        linkeditemtypeid: params.data.linkedItemTypeID
      };
    } else {
      const finalObj = this.commonService._multiplierInventoryType.filter(
        x => x.multiplierType === params.data.mulType);
      if (finalObj && finalObj.length === 0) {
        this.toastr.error('Please Select Type...!', this.constantService.infoMessages.error);
        return;
      }
      if (params.data.upcCode.trim() === '') {
        this.toastr.error('Please Enter UPC Code', this.constantService.infoMessages.error);
        this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
        return;
      }
      if (params.data.quantity === '') {
        this.toastr.error('Please Enter Quantity', this.constantService.infoMessages.error);
        return;
      }
      if (params.data.isPackDiscounted) {
        if (params.data.discountAmount === undefined || Number(params.data.discountAmount) === 0) {
          this.toastr.error('Please Enter Valid Discount Amount', this.constantService.infoMessages.error);
          return;
        }
        if (params.data.linkedTypeDescription === undefined || params.data.linkedTypeDescription.trim() === '') {
          this.toastr.error('Please Select Link Type', this.constantService.infoMessages.error);
          return;
        }
      }
      if (params.data.linkedTypeDescription) {
        this.commonService.LinkedTypeList.forEach(element => {
          if (element.description == params.data.linkedTypeDescription) {
            params.data["linkedItemTypeID"] = element["linkedItemTypeID"];
          }
        });
      }
      postData = {
        multiplierID: params.data.multiplierID,
        quantity: params.data.quantity,
        itemID: params.data.itemID ? params.data.itemID : this.itemId,
        containedItemID: params.data.containedItemID ? params.data.containedItemID : params.data.upcCode,
        multiplierInventoryTypeID: finalObj[0].multiplierInventoryTypeID,
        multiplierDescription: null,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null,
        masterPriceBookItemID: 0,
        departmentID: this.itemInfo.departmentID ? this.itemInfo.departmentID : 0,
        companyID: this.userInfo.companyId,
        isPackDiscounted: params.data.isPackDiscounted,
        linkedTypeDescription: params.data.linkedTypeDescription,
        discountAmount: params.data.discountAmount,
        linkeditemtypeid: params.data.linkedItemTypeID
      };
    }
    if (params.data.multiplierID > 0) {
      this.spinner.show();
      this.dataSerice.updateData('Multiplier/update?isSingleView=false', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res === '1') {
            this.GetMultipliersByItemID();
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        },
        (err) => {
          this.spinner.hide();
        });
    } else {
      // tslint:disable-next-line:max-line-length
      const linkExists = this.multiplierRowData.length > 0 ? _.find(this.multiplierRowData, ['upcCode', params.data.upcCode]) : null;
      if (linkExists) {
        this.toastr.warning('This UPC code already exists', 'warning');
        this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
        return;
      }
      this.spinner.show();
      this.dataSerice.postData('Multiplier/addNew?isSingleView=false', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res.multiplierID) {
            this.isAddRowMultip = false;
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            this.GetMultipliersByItemID();
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
  // Multipliers Grid Delete Row
  deleteMultiplierAction(params) {
    if (params.data.multiplierID === 0) {
      this.multiplierGridApi.updateRowData({ remove: [params.data] });
      this.isAddRowMultip = false;
      this.getMultiplierRow();
      return;
    } else {
      this.spinner.show();
      this.dataSerice.deleteData('Multiplier?id=' + params.data.multiplierID).subscribe((response) => {
        this.spinner.hide();
        if (response === '1') {
          this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
          this.multiplierGridApi.updateRowData({ remove: [params.data] });
          this.getMultiplierRow();
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
  // Multipliers Grid Add New Row
  GetMultipliersByItemID() {
    this.spinner.show();
    this.dataSerice.getData('Multiplier/GetMultipliersByItemID/' + this.itemId)
      .subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.multiplierRowData = [];
          return;
        }
        this.multiplierRowData = response;

      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  getMultiplierRow() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.multiplierGridApi && this.multiplierGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.multiplierRowData = arr;
  }
}
