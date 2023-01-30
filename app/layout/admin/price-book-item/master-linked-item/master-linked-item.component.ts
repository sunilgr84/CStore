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
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-master-linked-item',
  templateUrl: './master-linked-item.component.html',
  styleUrls: ['./master-linked-item.component.scss']
})
export class MasterLinkedItemComponent implements OnInit {
  @Input() masterPriceBookItemID: any;
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
  showForm: any = false;
  submitted = false;
  linkedItemTypeList:any=[];
  isEditLinkedItem = false;
  masterLinkItemForm = this.fb.group({
    masterLinkedItemID: [''],
    posCode: ['', Validators.required],
    description: ['', Validators.required],
    promoDiscountAmount: [0, Validators.required],
    linkedItemTypeID: ['', Validators.required],
    masterLinkPriceBookItemID: []
  });
  constructor(private constantService: ConstantService,
    private editGridService: EditableGridService,
    private toastr: ToastrService, private dataSerice: SetupService,
    private spinner: NgxSpinnerService, private commonService: CommonService, private fb: FormBuilder) {
    this.userInfo = this.constantService.getUserInfo();
    this.linkedIGridOptions = this.editGridService.getGridOption(this.constantService.editableGridConfig.gridTypes.masterlinkedItemGrid);
  }

  ngOnInit() {
    this.GetLinkedMatser();
    this.getLinkedItemType();
  }

  get masterLinkItemControls() { return this.masterLinkItemForm.controls; }

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
        masterLinkedItemID: 0,
        masterPriceBookItemID: 0,
        masterLinkPriceBookItemID: 0,
        promoDiscountAmount: null,
        createdBy: this.userInfo.userName,
        createdDateTime: new Date(),
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
        linkedItemTypeID: 0,
        linkedTypeDescription: '',
        posCode: '',
        description: ''
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
      this.dataSerice.getData('MasterPriceBookItem/get/' + rowNode.data.posCode).subscribe(
        (response) => {
          console.log(response);
          this.spinner.hide();
          if (response && response.masterPriceBookItemID === this.masterPriceBookItemID) {
            this.toastr.warning('You can not make relation with same item', this.constantService.infoMessages.warning);
            this.getStartlinkedEditingCell('posCode', params.rowIndex);
            return;
          }
          if (response && response.masterPriceBookItemID) {
            rowNode.setDataValue('description', response.description);
            rowNode.setDataValue('masterLinkPriceBookItemID', response.masterPriceBookItemID);
            // rowNode.setDataValue('itemID', response.itemID);
          } else {
            rowNode.setDataValue('posCode', params.oldValue);
            this.toastr.warning('Item UPC code not found', this.constantService.infoMessages.warning);
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
  GetLinkedMatser() {
    this.spinner.show();
    this.dataSerice.getData('MasterLinkedItem/GetByMasterPriceBookitem/'
      + this.masterPriceBookItemID).subscribe((response) => {
        this.spinner.hide();
        if (response && response['statusCode']) {
          this.linkedIRowData = [];
          return;
        }
        this.linkedIRowData = response ? response : [];
      }, (error) => {
        this.spinner.hide();
        console.log(error);
      });
  }
  saveLocalLinkedItem() {
    if (!this.masterLinkItemForm.valid) {
      return;
    }
    const postData = {
      masterLinkedItemID: this.masterLinkItemForm.value.masterLinkedItemID,
      masterPriceBookItemID: this.masterPriceBookItemID,
      masterLinkPriceBookItemID: this.masterLinkItemForm.value.masterLinkPriceBookItemID,
      promoDiscountAmount: this.masterLinkItemForm.value.promoDiscountAmount,
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      linkedItemTypeID: this.masterLinkItemForm.value.linkedItemTypeID,
      isDefault: true,
      posCode: this.masterLinkItemForm.value.posCode,
      description: this.masterLinkItemForm.value.description,
      departmentID: 0,
      companyID: this.userInfo.companyId
    };
    if (postData.masterLinkedItemID > 0) {
      this.spinner.show();
      this.dataSerice.updateData('MasterLinkedItem', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res && Number(res) > 0) {
          this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
          this.isAddRowLinked = false;
          this.showForm = false;
          this.isEditLinkedItem = false;
          this.GetLinkedMatser();
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
      const linkExists = this.linkedIRowData.length > 0 ? _.find(this.linkedIRowData, ['posCode', this.masterLinkItemForm.value.posCode]) : null;
      // _.find(this.linkedIRowData, function (o) { return o.posCode = params.data.posCode; }) : null;
      if (linkExists) {
        this.toastr.warning('This UPC code already exists', 'warning');
        return;
      }
      this.spinner.show();
      this.dataSerice.postData('MasterLinkedItem', postData).subscribe((res) => {
        this.spinner.hide();
        if (res && res['statusCode']) {
          this.toastr.error(this.constantService.infoMessages.addRecordFailed, this.constantService.infoMessages.error);
          return;
        }
        if (res) {
          this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
          this.GetLinkedMatser();
          this.isAddRowLinked = false;
          this.showForm = false;
          this.isEditLinkedItem = false;
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
    this.spinner.show();
    this.dataSerice.deleteData('MasterLinkedItem/' + params.data.masterLinkedItemID).subscribe((response) => {
      this.spinner.hide();
      if (response && Number(response) === 1) {
        this.toastr.success(this.constantService.infoMessages.deletedRecord, this.constantService.infoMessages.success);
        this.linkedIGridApi.updateRowData({ remove: [params.data] });
        this.GetLinkedMatser();
      } else {
        this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, this.constantService.infoMessages.success);
      }
    }, (error) => {
      this.spinner.hide();
      console.log(error);
    }
    );
  }

  searchUpcCode(params) {
    if (params.target.value === '' || params.target.value === null) {
      return;
    }
    this.spinner.show();
    this.dataSerice.getData(`MasterPriceBookItem/get/` + params.target.value).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode'] === 204) {
        this.toastr.error('Item not found!', 'Error');
        return;
      }
      if (result && result['statusCode']) {
        return;
      }
      if (result && (result === null || result === '')) {
        this.toastr.error('Item not found!', 'Error');
        return;
      } else {
        this.masterLinkItemForm.get('description').setValue(result.description);
        this.masterLinkItemForm.get('masterLinkPriceBookItemID').setValue(result.masterPriceBookItemID);
      }
    });
  }

  onAdd() {
    this.showForm = true;
    this.submitted = false;
    this.isEditLinkedItem = false;
    this.masterLinkItemForm.reset({
      masterLinkedItemID: 0,
      posCode: null,
      description: null,
      promoDiscountAmount: 0,
      linkedItemTypeID: null,
      masterLinkPriceBookItemID: null
    });
  }

  onClear() {
    this.showForm = false;
    this.submitted = false;
    this.isEditLinkedItem = false;
    this.masterLinkItemForm.reset({
      masterLinkedItemID: 0,
      posCode: null,
      description: null,
      promoDiscountAmount: 0,
      linkedItemTypeID: null,
      masterLinkPriceBookItemID: null
    });
  }

  updateLinkedItem(params) {
    this.showForm = true;
    this.isEditLinkedItem = true;
    this.masterLinkItemForm.patchValue({
      masterLinkedItemID: params.data.masterLinkedItemID,
      posCode: params.data.posCode,
      description: params.data.description,
      promoDiscountAmount: params.data.promoDiscountAmount,
      linkedItemTypeID: params.data.linkedItemTypeID,
      masterLinkPriceBookItemID: params.data.masterLinkPriceBookItemID
    });
  }

  getLinkedItemType() {
    this.dataSerice.getData('LinkedType/getAll').subscribe(result => {
      if (result && result['statusCode']) {
        this.commonService.LinkedTypeList = this.linkedItemTypeList = [];
        return;
      }
      this.commonService.LinkedTypeList = this.linkedItemTypeList = result;
    });
  }

}
