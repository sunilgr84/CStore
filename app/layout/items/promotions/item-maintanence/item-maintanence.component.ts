import { Component, OnInit, ViewChild } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { FormBuilder, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { PriceGroupCellRenderer } from '@shared/component/expandable-grid/partials/pricegroup-cell-renderer.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-item-maintanence',
  templateUrl: './item-maintanence.component.html',
  styleUrls: ['./item-maintanence.component.scss']
})
export class ItemMaintanenceComponent implements OnInit {
  rowData: any;
  itemListRowData: any;
  itemGridApi: any;
  includedItemGridApi: any;
  includedItemListRowData: any;
  gridOptions: any;
  itemListGridOptions: any;
  includedItemListGridOptions: any;
  title: boolean;
  companyPriceGroupList: [];
  userInfo = this.constantService.getUserInfo();
  isAddItemList = false;
  isUPC = false;
  isPriceGroup = false;
  priceGroupExpandGridOptions: any;
  priceGroupRowData: any = [];
  ItemListTypes: any[];
  isTypeLoading = true;
  itemListForm = this._fb.group({
    itemListID: [0],
    companyID: [0],
    itemListName: ['', Validators.required],
    lastModifiedBy: [''],
    createdDateTime: new Date(),
    lastModifiedDateTime: new Date(),
    itemListTypeID: ['', Validators.required],
    itemListTypename: [''],
    upcDescription: '',
    companyPriceGroupID: null
  });
  initialFormValues: any;
  detailCellRenderer: any;
  priceGroupApi: any;
  // upcDescription: '';
  submited = false;
  filterText: string;
  @ViewChild('itemListName') _itemListName: any;
  isEdit: boolean;
  constructor(private constants: ConstantService, private gridService: GridService,
    private constantService: ConstantService, private _fb: FormBuilder, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemMaintanenceGrid);
    this.itemListGridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemListMaintanenceGrid);
    this.includedItemListGridOptions = this.gridService.getGridOption(this.constants.gridTypes.includedItemListMaintanenceGrid);
    this.priceGroupExpandGridOptions = this.gridService.getGridOption(this.constants.gridTypes.itemPriceGroupExpandGrid);
    this.initialFormValues = this.itemListForm.value;
    this.detailCellRenderer = PriceGroupCellRenderer;
  }

  ngOnInit() {
    this.GetAllPromotionItemList();
    this.GetAllItemListTypes();
    this.getCompanyPriceGroup();
  }
  gridReady(params) {
    params.api.sizeColumnsToFit();
  }
  onItemListGridReady(params) {
    this.itemGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onIncludedItemGridReady(params) {
    this.includedItemGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onPriceGroupExpandReady(params) {
    this.priceGroupApi = params.api;
    params.api.sizeColumnsToFit();
  }
  GetAllItemListTypes() {
    this.setupService.getData('PromotionItemList/getAllItemListTypes').subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.ItemListTypes = [];
          this.isTypeLoading = false;
          return;
        }
        this.ItemListTypes = response;
        this.isTypeLoading = false;
      }
    );
  }
  getCompanyPriceGroup() {
    this.setupService.getData('CompanyPriceGroup/getByCompanyID/' + this.userInfo.companyId).subscribe(
      (res) => {
        if (res && res['statusCode']) {
          this.companyPriceGroupList = [];
          return true;
        }
        this.companyPriceGroupList = res;
      }, (error) => {
        console.log(error);
      }
    );
  }
  AddMore() {
    // this.isAddItemList = true;
    this.itemListForm.patchValue(this.initialFormValues);
    this.submited = this.isEdit = this.isUPC = this.isPriceGroup = false;
  }
  editAction(params) {
    this.isEdit = true;
    this.itemListForm.patchValue(params.data);
    this._itemListName.nativeElement.focus();
    if (params.data.itemListTypeID) {
      this.selectChange(params.data.itemListTypeID.toString());
      this.getItemListMaintanenceDetaill(params.data.itemListID);
    }
    this.isAddItemList = true;
  }
  getItemListMaintanenceDetaill(itemListID: any) {

    this.setupService.getData('ItemMaintanenceList/getItemListMaintanenceDetaill/' + itemListID).subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.includedItemListRowData = [];
          this.priceGroupRowData = [];
          return true;
        }
        if (this.isUPC) {
          this.includedItemListRowData = response;
        }
        if (this.isPriceGroup) {
          this.priceGroupRowData = response;
        }
      }, (error) => {
        console.log(error);
      }
    );

  }
  GetAllPromotionItemList() {
    this.setupService.getData('PromotionItemList/getAllPromotionItemList/' + this.userInfo.companyId).subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.rowData = [];
          return true;
        }
        this.rowData = response;
      }
    );
  }
  // backToList() {
  //   this.GetAllPromotionItemList();
  //   this.includedItemListRowData = this.itemListRowData = [];
  //   this.itemListForm.patchValue(this.initialFormValues);
  //   this.isAddItemList = this.submited = this.isPriceGroup = this.isUPC = false;
  // }
  onAddItemList() {
    this.submited = true;
    if (this.itemListForm.valid) {
      const postData = {
        ...this.itemListForm.value,
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
        createdDateTime: new Date(),
        lastModifiedDateTime: new Date()
      };
      this.spinner.show();
      if (postData.itemListID > 0) {
        this.setupService.postData('PromotionItemList/Update', postData).subscribe(
          (response) => {
            this.spinner.hide();
            if (response) {
              this.toastr.success(this.constantService.infoMessages.updatedRecord, this.constantService.infoMessages.success);
              // this.itemListForm.patchValue(response);
              this.selectChange(postData.itemListTypeID);
              this.GetAllPromotionItemList();
            } else {
              this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed, this.constantService.infoMessages.error);
          }
        );
      } else {
        this.setupService.postData('PromotionItemList/addNew', postData).subscribe(
          (response) => {
            this.spinner.hide();
            if (response && response.statusCode === 400) {
              if (response && response.result && response.result.validationErrors[0]) {
                this.toastr.error(response.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
              }
            } else {
              this.isEdit = true;
              this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
              this.itemListForm.patchValue(response);
              this.selectChange(postData.itemListTypeID);
              this.GetAllPromotionItemList();
            }
          }, (error) => {
            this.spinner.hide();
            this.toastr.error(error.result.validationErrors[0].errorMessage, this.constantService.infoMessages.error);
          }
        );
      }
    }
  }
  selectChange(itemListTypeID) {
    if (itemListTypeID === '1') {
      this.isUPC = true;
      this.isPriceGroup = false;
      // this.upcDescription = '';
      // this.searchUPCCode();
    }
    if (itemListTypeID === '2') {
      this.isUPC = false;
      this.isPriceGroup = true;
    }
  }
  searchUPCCode() {
    if (this.itemListForm.value.upcDescription) {
      this.setupService.getData('ItemMaintanenceList/getItemsByDescriptionOrPosCode/' +
        this.itemListForm.value.upcDescription + '?CompanyID=' + this.userInfo.companyId + '&ItemListID='
        + this.itemListForm.value.itemListID).subscribe(
          (response) => {
            if (response && response['statusCode']) {
              this.itemListRowData = [];
              return true;
            }
            this.itemListRowData = response;
          }
        );
    } else {
      this.toastr.warning('Please enter UPC Code / description', 'warning');
      return;
    }

  }
  // action button add move the right side grid show data
  addedAction(params) {
    if (this.isUPC) {
      const validData = _.find(this.includedItemListRowData, ['itemID', Number(params.data.itemid)]);
      // const validData = this.includedItemListRowData && this.includedItemListRowData.filter(
      //   x => x.itemID === Number(params.data.itemid));
      if (validData) {
        this.toastr.warning('UPC Code already exists in included items', 'Warning');
        return;
      }
    }
    const postData = {
      listItemID: 0,
      itemListID: this.itemListForm.value.itemListID,
      itemID: this.isUPC ? params.data.itemid : null,
      companyPriceGroupID: this.isPriceGroup ? this.itemListForm.value.companyPriceGroupID : null,
      lastModifiedBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedDateTime: new Date(),
      posCode: this.isUPC ? params.data.posCode : '',
      description: this.isUPC ? params.data.description : ''
    };
    this.spinner.show();
    this.setupService.postData('ItemMaintanenceList/addNew', postData).subscribe(
      (res) => {
        console.log(res); this.spinner.hide();
        if (res && res.listItemID) {
          this.toastr.success(this.constantService.infoMessages.addedRecord, 'success');
          if (this.isUPC && res && res.listItemID) {
            // this.includedItemGridApi.updateRowData({ add: [res] });
            this.itemGridApi.updateRowData({ remove: [params.data] });
            //  this.getIncludedRowData();
            this.getItemRowData();
            this.getItemListMaintanenceDetaill(res.itemListID);
          }
          if (this.isPriceGroup && res && res.itemListID) {
            this.getItemListMaintanenceDetaill(this.itemListForm.value.itemListID);
          }
        }
        let errorMessage = '';
        if (res && res.statusCode === 400) {
          if (res.result.validationErrors) {
            res.result.validationErrors.forEach(vError => {
              errorMessage += vError.errorMessage;
            });
            this.toastr.error(errorMessage);
          }
        }

      }, (err) => {
        this.spinner.hide(); console.log(err);
      }
    );
  }
  getItemRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.itemGridApi && this.itemGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.itemListRowData = arr;
  }
  getIncludedRowData() {
    const arr = [];
    // tslint:disable-next-line:no-unused-expression
    this.includedItemGridApi && this.includedItemGridApi.forEachNode(function (node) {
      arr.push(node.data);
    });
    this.includedItemListRowData = arr;
  }
  deleteIncludedAction(params) {
    const data = params.data;
    if (params.data && params.data.listItemID) {
      this.spinner.show();
      this.setupService.deleteData('ItemMaintanenceList?id=' + params.data.listItemID).subscribe(
        (res) => {
          this.spinner.hide();
          if (res && res === '1') {
            this.toastr.success(this.constantService.infoMessages.deletedRecord, 'success');
            if (this.isUPC) {
              this.includedItemGridApi.updateRowData({ remove: [data] });
              this.getIncludedRowData();
              // this.itemGridApi.updateRowData({ add: [data] });
              // this.getItemRowData();
            }
            if (this.isPriceGroup) {
              this.priceGroupApi.updateRowData({ remove: [data] });
            }
            //  this.getItemRowData();
          } else {
            this.toastr.error(this.constantService.infoMessages.deleteRecordFailed, 'error');
          }

        }, (err) => {
          this.spinner.hide(); console.log(err);
        }
      );
    }
  }
  deleteAction(params) {
    if (!params.data.itemListID) {
      return;
    }
    this.spinner.show();
    this.setupService.deleteData(`PromotionItemList?id=` + params.data.itemListID).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
        return;
      }
      if (result && Number(result) >= 0) {
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
        this.GetAllPromotionItemList();
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
    });
  }
}
