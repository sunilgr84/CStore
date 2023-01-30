import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';

import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as _ from 'lodash';

@Component({
  selector: 'app-multipliers',
  templateUrl: './multipliers.component.html',
  styleUrls: ['./multipliers.component.scss']
})
export class MultipliersComponent {

  @Output() rowCount: EventEmitter<any> = new EventEmitter();
  @Input('show')
  set show(val) {
    this.isShow = val;
    this.isAddRowMultip = false;
  }
  isShow;
  @Input() itemID: number;
  @Input() masterUPCCode: number;
  userInfo = this.constantService.getUserInfo();
  isAddRowMultip: any;
  tempId: number;
  multiplierGridOptions: any;
  multiplierGridApi: GridApi;
  multiplierGridColumnApi: any;
  multiplierGridColumnDef: ColDef[];
  multiplierGridRowData: any[] = [];
  masterData: any;
  addrow: any;

  constructor(private dataSerice: SetupService, private constantService: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService, private paginationGridService: PaginationGridService,
    private commonService: CommonService) {
    this.multiplierGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.multiplierItemGrid);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.itemID && changes.itemID.currentValue) {
      this.GetMultiplierInventoryType();
      this.GetMultipliersByItemID();
    }
  }

  onMultiplierGridReady(params) {
    this.multiplierGridApi = params.api;
    this.multiplierGridColumnApi = params.columnApi;
    this.multiplierGridApi.sizeColumnsToFit();
  }

  GetMultiplierInventoryType() {
    // this.spinner.show();
    this.dataSerice.getData('MultiplierInventoryType/get')
      .subscribe((response) => {
        // this.spinner.hide();
        this.commonService._multiplierInventoryType = response;
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  GetMultipliersByItemID() {
    // this.spinner.show();
    this.dataSerice.getData('Multiplier/GetMultipliersByItemID/' + this.itemID)
      .subscribe((response) => {
        // this.spinner.hide();
        if (response && response['statusCode']) {
          this.multiplierGridRowData = [];
          return;
        }
        this.multiplierGridRowData = response.map((multiplier) => {
          multiplier.masterUPCCode = this.masterUPCCode;
          multiplier.itemID = this.itemID;
          return multiplier;
        });
        if (this.multiplierGridApi)
          this.multiplierGridApi.setRowData(this.multiplierGridRowData);
        this.rowCount.emit({ key: 'multiplier', value: this.multiplierGridRowData.length });
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }

  AddMultiplier(e: any) {
    if (!this.itemID)
      return false;
    if (this.isAddRowMultip) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.isAddRowMultip = true;
    const gridApiId = `multiplierGridApi`;
    setTimeout(() => {
      this[gridApiId].updateRowData({
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
          type: null,
          isNewRecord: true,
          masterUPCCode: this.masterUPCCode
        }],
        addIndex: 0
      });
      this.addrow = this.addrow + 1;
      this[gridApiId].setFocusedCell(0, 'upcCode');
      this.getStartMultipliersEditingCell('upcCode', 0);
    }, 300);
  }

  onEdit(params) {
    this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
  }

  onCancel(params) {
    if (params.data.multiplierID === 0) {
      this.multiplierGridApi.updateRowData({ remove: [params.data] });
      this.isAddRowMultip = false;
      this.getMultiplierRow();
      return;
    } else {
      this.multiplierGridApi.stopEditing()
    }
  }

  stopEditing(params) {
    let rowNode = params.node;
    rowNode.data.isNewRecord = true;//for save button showing
    // this.multiplierGridApi.stopEditing();
    params.api.refreshCells({
      columns: ['actions'],
      rowNodes: [params.node],
      force: true,
    });
  }

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
          this.multiplierGridApi.setRowData(this.multiplierGridRowData);
          this.multiplierGridApi.sizeColumnsToFit();
          this.rowCount.emit({ key: 'multiplier', value: this.multiplierGridRowData.length });
        } else {
          this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);
        }
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
    }
  }

  getMultiplierRow() {
    const arr = [];
    this.multiplierGridApi && this.multiplierGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.multiplierGridRowData = arr;
  }

  saveMultiplier(params) {
    if (!this.itemID) {
      this.toastr.warning('Please first added item!', 'warning');
      return;
    }
    let postData = {};
    if (this.masterData && this.masterData.masterPriceBookDetails && this.masterData.masterPriceBookDetails.masterPriceBookItemID > 0) {
      postData = {
        multiplierID: params.data.multiplierID ? params.data.multiplierID : 0,
        quantity: params.data.unitsInCase ? params.data.unitsInCase : 0,
        itemID: this.itemID,
        containedItemID: null,
        multiplierInventoryTypeID: params.data.isPack ? 3 : 2,
        multiplierDescription: params.data.description,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null,
        masterPriceBookItemID: this.masterData.masterPriceBookDetails.masterPriceBookItemID,
        //departmentID: this.itemInfo.departmentID ? this.itemInfo.departmentID : 0,
        companyID: this.userInfo.companyId
      };
    } else {
      const finalObj = this.commonService._multiplierInventoryType.filter(
        x => x.multiplierInventoryTypeID === params.data.type);
      if (finalObj && finalObj.length === 0) {
        this.stopEditing(params);
        this.toastr.error('Please Select Type...!', this.constantService.infoMessages.error);
        return;
      }
      if (params.data.upcCode.trim() === '') {
        this.stopEditing(params);
        this.toastr.error('Please Enter UPC Code', this.constantService.infoMessages.error);
        this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
        return;
      }
      if (Number(params.data.quantity) === 0) {
        this.stopEditing(params);
        this.toastr.error('Please Enter Quantity', this.constantService.infoMessages.error);
        return;
      }
      postData = {
        multiplierID: params.data.multiplierID,
        quantity: params.data.quantity,
        itemID: this.itemID,
        containedItemID: params.data.containedItemID ? params.data.containedItemID : params.data.upcCode,
        multiplierInventoryTypeID: finalObj[0].multiplierInventoryTypeID,
        multiplierDescription: null,
        cItemID: 0,
        multiplierInventoryDescription: null,
        itemName: null,
        mulType: null,
        masterPriceBookItemID: 0,
        companyID: this.userInfo.companyId
      };
    }
    if (params.data.multiplierID > 0) {
      this.spinner.show();
      this.dataSerice.updateData('Multiplier/update?isSingleView=false', postData).subscribe(
        (res) => {
          this.spinner.hide();
          if (res === '1') {
            this.multiplierGridApi.stopEditing();
            let rowNode = this.multiplierGridApi.getRowNode(params.rowIndex);
            rowNode.data.isNewRecord = false;//for save button showing
            params.api.refreshCells({
              columns: ['actions'],
              rowNodes: [params.node],
              force: true,
            });
            this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          } else {
            this.GetMultipliersByItemID();
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        },
        (err) => {
          this.spinner.hide();
        });
    } else {
      // tslint:disable-next-line:max-line-length
      const linkExists = this.multiplierGridRowData.length > 0 ? _.find(this.multiplierGridRowData, ['upcCode', params.data.upcCode]) : null;
      if (linkExists) {
        this.toastr.warning('This UPC code already exists', 'warning');
        this.getStartMultipliersEditingCell('upcCode', params.rowIndex);
        this.stopEditing(params);
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

  getStartMultipliersEditingCell(_colKey, _rowIndex) {
    this.multiplierGridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

}
