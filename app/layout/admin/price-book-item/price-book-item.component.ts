import { Component, OnInit, TemplateRef, ViewChild, Inject, ElementRef } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { SetupService } from '@shared/services/setupService/setup-service';
import { FormBuilder } from '@angular/forms';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { NgbModal, NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { MasterLinkedItemCellRenderer } from '@shared/component/expandable-grid/partials/master-linked-item-renderer.component';
import { DOCUMENT } from '@angular/platform-browser';
import { CommonService } from '@shared/services/commmon/common.service';
declare var $:any;
@Component({
  selector: 'app-price-book-item',
  templateUrl: './price-book-item.component.html',
  styleUrls: ['./price-book-item.component.scss'],
  animations: [routerTransition()]
})
export class PriceBookItemComponent implements OnInit {
  @ViewChild('tabs') public tabs: NgbTabset;
  gridOptions: GridOptions;
  gridApi: any;
  rowData: any;
  // expand Grid
  masterLinkedItemRenderer: any;
  isAdvanceSearchCollapsed = true;
  isBulkUpdateCollapsed = true;
  isNewItemCollapsed = false;
  departmentList: any;
  groupNameList: any;
  brandNameList: any;
  advanBrandNameList: any;
  manufacturerList: any;
  userInfo = this.constants.getUserInfo();
  priceBookItemForm = this._fb.group({
    masterPriceBookItemID: [0],
    upcCode: [''],
    upcCodeFormatID: [0],
    description: [''],
    sellingUnits: [null],
    unitsInCase: [null],
    cartonPackMasterPriceBookItemUpc: [''],
    cartonPackMasterPriceBookItemID: [''],
    isPack: [false],
    masterDepartmentID: [null],
    uomid: [null],
    baseUnitsInCase: [0],
    brandID: [null],
    manufacturerID: [null],
    masterPriceGroupID: [null],
    isDefault: [true],
    dataSourceID: [1],
    createdBy: [''],
    createdDateTime: [''],
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    IsLinkedItem: false,
    masterPriceBookLinkedItemDetails: this._fb.group({
      masterLinkedItemID: 0,
      masterPriceBookItemID: 0,
      masterLinkPriceBookItemID: 0,
      promoDiscountAmount: null,
      createdBy: '',
      createdDateTime: '',
      lastModifiedBy: '',
      lastModifiedDateTime: '',
      linkedItemTypeID: null,
      linkedTypeDescription: '',
      linkedUPCcode: null,
      upcCode: '',
      description: ''
    }),
  });

  advanSearchForm = this._fb.group({
    Department: null,
    Manufacturer: null,
    GroupID: null,
    BrandID: null,
    PosCodeOrDesc: null,
    UOMID: null,
    UnitsIncase: null,
    IsDefault: true,
    IsPack: false,
  });

  defaultAdvanForm: any;
  uomList: any;
  defaultFormValue: any;
  submitted: boolean;
  updateDataList = [
    { columnId: 'masterDepartmentID', columnName: 'Department' },
    { columnId: 'MasterPriceGroupID', columnName: 'Group Name' },
    { columnId: 'UOMID', columnName: 'UOM' },
    { columnId: 'UnitsInCase', columnName: 'Unit In Case' },
    { columnId: 'manufacturerID', columnName: 'Manufacturer' },
    { columnId: 'BrandID', columnName: 'Brand' },
    { columnId: 'sellingunits', columnName: 'Selling Units' },
  ];

  updateDataForm = this._fb.group({
    column: [],
    value: [],
    masterPriceBookItemIDS: [],
    itemEffective: [false],
  });
  selectedItems = 0;
  selectedMasterPriceBookItemID: any;
  isUnitInCase: boolean;
  isUOMeasurement: boolean;
  isGroupName: boolean;
  isDepartment: boolean;
  isManufacturer: boolean;

  // Add Link Item Tab Property
  masterPriceBookLinkedItemList: any = [];
  isLinkedItemSignal = true;

  @ViewChild('modalContent') modalContent: TemplateRef<any>;
  @ViewChild('upcCodes') upcCode: any;
  @ViewChild('cartonPackUpc') cartonPackUpc: any;
  @ViewChild('descriptions') _descriptions: any;
  @ViewChild('linkedUPCCode') linkedUpcCode: any;

  updateBrandNameList: any;
  selectedBrandId = null;
  defaultUpdateForm: any;
  filterText: string;
  isEditMode: boolean;
  upcOrDescSearch: any;
  isSellingunits: boolean;
  isBrand: boolean;
  linkedItemTypeList: any[];
  isLinkedItemSearch: boolean;
  cartonPackDescription: string;
  isBrandLoading: boolean;
  isGroupNameLoading: boolean;

  isAdvanceSearch: boolean;
  newAdvancedSearchForm = this._fb.group({
    posCodeOrDesc: [null],
    groupID: [],
    manufacturer: [],
    brand: [],
    department: [],
    unitsInCase: [],
    sellingUnits: [],
    isPack: [],
    uOMID: []
  });
  newAdvancedSearchFormUpdated: any;

  isAddItem: boolean;
  showGrid: boolean;

  constructor(private setupService: SetupService, private _fb: FormBuilder,
    private constants: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService,
    // tslint:disable-next-line: deprecation
    private gridServie: GridService, @Inject(DOCUMENT) private document: Document,
    private modal: NgbModal, private commonService: CommonService, private el: ElementRef) {
    this.gridOptions = this.gridServie.getGridOption(this.constants.gridTypes.MasterPriceBookItemGrid);
    this.defaultFormValue = this.priceBookItemForm.value;
    this.defaultAdvanForm = this.advanSearchForm.value;
    this.defaultUpdateForm = this.updateDataForm.value;
    this.linkedItemData.get('linkedTypeDescription').disable();
    this.masterLinkedItemRenderer = MasterLinkedItemCellRenderer;
  }

  ngOnInit() {
    this.newAdvancedSearchFormUpdated = false;
    this.isAdvanceSearch = true;
    this.showGrid = true;
    this.getLinkedItemType();
    this.fetchDepartmentDetials();
    this.fetchBrandDetails();
    this.fetchManufacturerList();
    this.getPriceGroupList();
    this.getUOM();
    this.newAdvancedSearchForm.valueChanges.subscribe(x => {
      this.newAdvancedSearchFormUpdated = true;
    })
  }
  get f() { return this.priceBookItemForm.controls; }
  get advan() { return this.advanSearchForm.value; }
  gridReady(params) {

  }

  openAdvanceSearch() {
    this.isAddItem = false;
    this.showGrid = true;
    this.isAdvanceSearch = !this.isAdvanceSearch;
    this.newAdvancedSearchForm.reset();
  }

  openAddItem() {
    this.isAdvanceSearch = false;
    this.isAddItem = !this.isAddItem;
    this.showGrid = false;
    this.priceBookItemForm.get('brandID').disable();
    this.priceBookItemForm.get('masterPriceGroupID').disable();
  }

  fetchDepartmentDetials() {
    this.setupService.getData(`MasterDepartment/list`).subscribe(result => {
      if (result && result['statusCode']) {
        this.departmentList = [];
        return;
      }
      this.departmentList = result;
    });
  }
  getPriceGroupList() {
    this.setupService.getData(`MasterPriceGroup/list`).subscribe(result => {
      if (result && result['statusCode']) {
        this.groupNameList = [];
        return;
      }
      this.groupNameList = result;
    });
  }
  fetchBrandDetails() {
    this.setupService.getData('MasterBrand/list').subscribe(result => {
      if (result && result['statusCode']) {
        this.brandNameList = [];
        return;
      }
      this.brandNameList = result;
    });
  }
  fetchManufacturerList() {
    this.setupService.getData('Manufacturer/getAll').subscribe(res => {
      if (res && res['statusCode']) {
        this.manufacturerList = [];
        return;
      }
      this.manufacturerList = res;
    });
  }
  getUOM() {
    this.setupService.getData('UOM/getAll').subscribe((response) => {
      if (response && response['statusCode']) {
        this.uomList = [];
        return;
      }
      this.uomList = response;
    }, (error) => {
      console.log(error);
    });
  }
  reset() {
    this.isEditMode = false;
    this.EditDisableEnableMode();
    //  this.enableDisableCartonUPCCode(false);
    this.submitted = false;
    this.isLinkedItemSearch = false;
    this.masterPriceBookLinkedItemList = [];
    this.priceBookItemForm.patchValue(this.defaultFormValue);
    this.cartonPackDescription = "";

  }
  get priceBookItemData() { return this.priceBookItemForm.value; }
  get linkedItemData(): any { return this.priceBookItemForm.get('masterPriceBookLinkedItemDetails'); }
  isValidUPCCode(code) {
    let isUPCCode: boolean;
    if (code.length === 8 || code.length === 12 || code.length === 13) {
      isUPCCode = true;
    }
    return isUPCCode;
  }

  saveNewItem(linkItems: any) {
    let navigateToLinkItems = false;
    if (linkItems === 'linkItems') {
      navigateToLinkItems = true;
    }
    this.submitted = true;
    if (!this.priceBookItemForm.valid) {
      return;
    }

    if (!this.isLinkedItemSearch && this.priceBookItemForm.get('IsLinkedItem').value) {
      this.toastr.error('Linked item UPC code not found!', 'Error');
      this.linkedUpcCode.nativeElement.focus();
      return;
    }
    if (!this.isValidUPCCode(this.priceBookItemForm.get('upcCode').value) && this.priceBookItemForm.valid) {
      this.toastr.error('UPC code length should be 8,12,13 ', 'error');
      this.upcCode.nativeElement.focus();
      return false;
    }
    if (this.cartonPackUpc && !this.isValidUPCCode(this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').value) && this.priceBookItemForm.valid) {
      this.cartonPackUpc.nativeElement.focus();
      this.toastr.error('Carton/Pack UPC code length should be 8,12,13 ', 'error');
      return false;
    }
    const masterPriceBookDetails = {
      // ...this.priceBookItemForm.value,
      brandID: this.priceBookItemData.brandID,
      cartonPackMasterPriceBookItemID: this.priceBookItemData.cartonPackMasterPriceBookItemID,
      description: this.priceBookItemData.description,
      isDefault: this.priceBookItemData.isDefault,
      isPack: this.priceBookItemData.isPack,
      manufacturerID: this.priceBookItemData.manufacturerID ? this.priceBookItemData.manufacturerID : null,
      masterDepartmentID: this.priceBookItemData.masterDepartmentID,
      masterPriceBookItemID: this.priceBookItemData.masterPriceBookItemID,
      masterPriceGroupID: this.priceBookItemData.masterPriceGroupID,
      uomid: this.priceBookItemData.uomid,
      upcCode: this.priceBookItemForm.get('upcCode').value,

      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      dataSourceID: 1,
      upcCodeFormatID: 1,
      sellingUnits: this.priceBookItemForm.value.sellingUnits ? this.priceBookItemForm.value.sellingUnits : 0,
      unitsInCase: this.priceBookItemForm.value.unitsInCase ? this.priceBookItemForm.value.unitsInCase : 0,
      baseUnitsInCase: this.priceBookItemForm.value.unitsInCase ? this.priceBookItemForm.value.unitsInCase : 0,
    };
    const masterPriceBookLinkedItemDetails = {
      ...this.linkedItemData.value,
      masterLinkedItemID: this.linkedItemData.value.masterLinkedItemID,
      masterPriceBookItemID: this.linkedItemData.value.masterPriceBookItemID,
      masterLinkPriceBookItemID: this.linkedItemData.value.masterLinkPriceBookItemID,
      promoDiscountAmount: this.linkedItemData.value.promoDiscountAmount,
      createdBy: this.userInfo.userName,
      createdDateTime: new Date(),
      lastModifiedBy: this.userInfo.userName,
      lastModifiedDateTime: new Date(),
      linkedItemTypeID: this.linkedItemData.value.linkedItemTypeID,
      linkedTypeDescription: this.linkedItemData.get('linkedTypeDescription').value
    };
    const postData = {
      masterPriceBookDetails: { ...masterPriceBookDetails },
      masterPriceBookLinkedItemDetails: { ...masterPriceBookLinkedItemDetails },
    };
    if (this.priceBookItemForm.get('IsLinkedItem').value === true) {
      if (this.priceBookItemForm.valid) {
        if (this.priceBookItemForm.value.masterPriceBookItemID > 0) {
          this.spinner.show();
          this.setupService.postData('MasterPriceBookItem/UpdateMasterPriceBookNLinkedItem', postData).subscribe(res => {
            this.spinner.hide();
            if (res && res.statusCode === 500) {
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, 'error');
              return;
            } else {
              this.submitted = false;
              setTimeout(() => {
                if (navigateToLinkItems) this.tabs.select('addLinkedItems');
              });
              this.toastr.success(this.constants.infoMessages.updatedRecord, 'updated');
            }
          }, err => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, 'error');
          });
        } else {
          this.spinner.show();
          this.setupService.postData('MasterPriceBookItem/AddMasterPriceBookNLinkedItem', postData).subscribe(res => {
            this.spinner.hide();
            if (res && res.masterpriceBookItemData && res.masterpriceBookItemData.masterPriceBookItemID) {
              this.submitted = false;
              this.toastr.success(this.constants.infoMessages.addedRecord, 'success');
              this.priceBookItemForm.patchValue(res.masterpriceBookItemData);
              this.isEditMode = true;
              setTimeout(() => {
                if (navigateToLinkItems) this.tabs.select('addLinkedItems');
              });
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, 'error');
              return;
            }
          }, err => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.addRecordFailed, 'error');
          });
        }
      }
    } else {
      if (this.priceBookItemForm.value.masterPriceBookItemID > 0) {
        this.spinner.show();
        this.setupService.updateData('MasterPriceBookItem', postData.masterPriceBookDetails).subscribe(res => {
          this.spinner.hide();
          if (res && res['statusCode']) {
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, 'error');
            return;
          } else {
            this.submitted = false;
            this.toastr.success(this.constants.infoMessages.updatedRecord, 'updated');
            setTimeout(() => {
              if (navigateToLinkItems) this.tabs.select('addLinkedItems');
            });
          }
        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, 'error');
        });
      } else {
        this.spinner.show();
        this.setupService.postData('MasterPriceBookItem', postData.masterPriceBookDetails).subscribe(res => {
          this.spinner.hide();
          if (res && res.masterPriceBookItemID) {
            this.submitted = false;
            this.toastr.success(this.constants.infoMessages.addedRecord, 'success');
            this.priceBookItemForm.patchValue(res);
            if (this.rowData)
              this.rowData = [...this.rowData, res];
            else
              this.rowData = [res];
            this.isEditMode = true;
            setTimeout(() => {
              if (navigateToLinkItems) this.tabs.select('addLinkedItems');
            });
          } else {
            this.toastr.error(this.constants.infoMessages.addRecordFailed, 'error');
            return;
          }
        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constants.infoMessages.addRecordFailed, 'error');
        });
      }
    }

  }
  onAdvanSearch(isSearchCheck?: Boolean) {
    if (isSearchCheck) { this.advanSearchForm.get('PosCodeOrDesc').setValue(this.upcOrDescSearch); }
    const postData = {
      Department: this.advan.Department ? this.advan.Department : null,
      Manufacturer: this.advan.Manufacturer ? this.advan.Manufacturer : null,
      GroupID: this.advan.GroupID ? this.advan.GroupID : null,
      BrandID: this.advan.BrandID ? this.advan.BrandID : null,
      PosCodeOrDesc: this.advan.PosCodeOrDesc ? this.advan.PosCodeOrDesc : null,
      UOMID: this.advan.UOMID ? this.advan.UOMID : null,
      UnitsIncase: this.advan.UnitsIncase ? this.advan.UnitsIncase : null,
      IsDefault: this.advan.IsDefault,
      IsPack: this.advan.IsPack,
    };
    this.selectedItems = 0;
    this.selectedMasterPriceBookItemID = null;
    this.spinner.show();
    this.setupService.getData('MasterPriceBookItem/GetAdvanceSearchMasterData?Department=' + postData.Department
      + '&Manufacturer=' + postData.Manufacturer + '&GroupID=' + postData.GroupID
      + '&BrandID=' + postData.BrandID + '&PosCodeOrDesc=' + postData.PosCodeOrDesc +
      '&UOMID=' + postData.UOMID + '&UnitsIncase=' + postData.UnitsIncase).subscribe(result => {
        this.spinner.hide();
        if (result && result['statusCode']) {
          this.rowData = [];
          return;
        }
        const masterpriceBookItemData = [];
        result.forEach(x => {
          x.masterpriceBookItemData['masterLinkedItemdata'] = x['masterLinkedItemdata'] ? x['masterLinkedItemdata'] : [];
          masterpriceBookItemData.push(x.masterpriceBookItemData);
        });
        this.rowData = masterpriceBookItemData;
      }, err => {
        this.spinner.hide();
        console.log(err);
      });
  }
  onReset() {
    this.advanSearchForm.patchValue(this.defaultAdvanForm);
    this.upcOrDescSearch = '';
    this.advanSearchForm.get('GroupID').setValue(null);
    this.advanSearchForm.get('Manufacturer').setValue(null);
    this.advanSearchForm.get('BrandID').setValue(null);
    this.advanSearchForm.get('GroupID').enable();
    this.advanSearchForm.get('Manufacturer').enable();
    this.advanSearchForm.get('BrandID').enable();
  }
  selectManufacture() {
    this.advanSearchForm.get('BrandID').setValue(null);
    if (this.advanSearchForm.get('Manufacturer').value) {
      this.advanSearchForm.get('GroupID').setValue(null);
      this.advanSearchForm.get('GroupID').disable();

    } else {
      this.advanSearchForm.get('GroupID').enable();
      this.advanSearchForm.get('GroupID').setValue(null);
    }
    if (!this.advanSearchForm.get('Manufacturer').value) {
      this.advanBrandNameList = [];
      return;
    }
    this.setupService.getData(`MasterBrand/findByManufacturerID/${this.advan.Manufacturer}`)
      .subscribe(result => {
        this.advanBrandNameList = result;
        $("html,body").scrollTop({left:0,top:0,behavior: 'smooth'});
      }, err => {
        console.log(err);
      });
  }
  onRowSelected(params) {
    this.selectedItems = params.length;
    this.selectedMasterPriceBookItemID = params ? params.map(x => x.data.masterPriceBookItemID).join(',') : '';
  }
  bulkUpdate() {
    if (this.selectedItems <= 0 || !this.selectedMasterPriceBookItemID) {
      this.toastr.warning('Please select Master Price Book Item', 'warning');
      return;
    }
    if (!this.updateDataForm.value.column) {
      this.toastr.warning('Please select update Data For', 'warning');
      return;
    }
    const postData = {
      ...this.updateDataForm.value,
      itemEffective: false,
      value: this.selectedBrandId ? this.selectedBrandId : this.updateDataForm.value.value,
      masterPriceBookItemIDS: this.selectedMasterPriceBookItemID,
    };
    if (postData.column === 'ManufacturerID' || postData.column === 'UOMID' || postData.column === 'UnitsInCase') {
      this.modal.open(this.modalContent, { size: 'sm' });
    } else {
      this.bulkUpdateData(postData);
    }
  }
  affectChangesYes() {
    this.modal.dismissAll();
    const postData = {
      ...this.updateDataForm.value,
      value: this.selectedBrandId ? this.selectedBrandId : this.updateDataForm.value.value,
      itemEffective: true,
      masterPriceBookItemIDS: this.selectedMasterPriceBookItemID,
    };
    this.bulkUpdateData(postData);
  }
  affectChangesNo() {
    this.modal.dismissAll();
    const postData = {
      ...this.updateDataForm.value,
      itemEffective: false,
      value: this.selectedBrandId ? this.selectedBrandId : this.updateDataForm.value.value,
      masterPriceBookItemIDS: this.selectedMasterPriceBookItemID,
    };
    this.bulkUpdateData(postData);
  }


  bulkUpdateData(postData) {
    this.spinner.show();
    // tslint:disable-next-line:max-line-length
    this.setupService.updateData(`MasterPriceBookItem/BulkUpdate?column=${postData.column}&value=${postData.value}&masterPriceBookItemIDS=${postData.masterPriceBookItemIDS}&itemEffective=${postData.itemEffective}&userName=${this.userInfo.userName}`, '')
      .subscribe(result => {
        this.spinner.hide();
        if (result && Number(result) === 1) {
          this.selectedItems = 0;
          this.resetBulkUpdateForm();
          this.priceBookAdvSearch();
          this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
        } else {
          this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        }
      }, err => {
        this.spinner.hide();
        this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        console.log(err);
      });
  }
  resetBulkUpdateForm() {
    this.selectedBrandId = null;
    this.updateDataForm.get('value').setValue(null);
  }
  updateDataChange(params) {
    this.resetBulkUpdateForm();
    if (!params) {
      this.isUnitInCase = false;
      this.isUOMeasurement = false;
      this.isGroupName = false;
      this.isDepartment = false;
      this.isManufacturer = false;
      this.isSellingunits = false;
      this.isManufacturer = false;
      this.isBrand = false;
      return;
    }
    switch (params.columnId) {
      case 'masterDepartmentID':
        this.isUnitInCase = false;
        this.isUOMeasurement = false;
        this.isGroupName = false;
        this.isDepartment = true;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = false;
        this.isBrand = false;
        return;
      case 'MasterPriceGroupID':
        this.isUnitInCase = false;
        this.isUOMeasurement = false;
        this.isGroupName = true;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = false;
        this.isBrand = false;
        return;
      case 'UOMID':
        this.isUnitInCase = false;
        this.isUOMeasurement = true;
        this.isGroupName = false;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = false;
        this.isBrand = false;
        return;
      case 'UnitsInCase':
        this.isUnitInCase = true;
        this.isUOMeasurement = false;
        this.isGroupName = false;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = false;
        this.isBrand = false;
        return;
      case 'sellingunits':
        this.isUnitInCase = false;
        this.isUOMeasurement = false;
        this.isGroupName = false;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = true;
        this.isManufacturer = false;
        this.isBrand = false;
        return;
      case 'manufacturerID':
        this.isUnitInCase = false;
        this.isUOMeasurement = false;
        this.isGroupName = false;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = true;
        this.isBrand = false;
        return;
      case 'BrandID':
        this.isUnitInCase = false;
        this.isUOMeasurement = false;
        this.isGroupName = false;
        this.isDepartment = false;
        this.isManufacturer = false;
        this.isSellingunits = false;
        this.isManufacturer = false;
        this.isBrand = true;
        return;
    }
  }

  editAction(params) {
    this.isEditMode = true;
    // document.getElementById('addNewMasterItem').click();
    this.isAdvanceSearch = false;
    this.isAddItem = true;
    // this.GetMastersItemDetails();
    Object.keys(params.data).forEach(function(key) {
      if(key=="brandID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="masterPriceBookItemID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="upcCodeFormatID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="masterDepartmentID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="uomid"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="manufacturerID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
      if(key=="masterPriceGroupID"){
        params.data[key] = params.data[key] !=0 ? params.data[key] : null;
      }
    });
    this.priceBookItemForm.patchValue(params.data);
    this.EditDisableEnableMode();
    this.getBrandListByManufactureID();
    this.getGroupListByBrandID();
    if (this._descriptions && this._descriptions.nativeElement) {
      this._descriptions.nativeElement.focus();
    }
    this.document.body.scrollTop = 0;
  }

  deleteAction(params) {
    this.spinner.show();
    this.setupService.deleteData(`MasterPriceBookItem/${params.data.masterPriceBookItemID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.priceBookAdvSearch();
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  SelectGroupManu(name) {
    if (name === 'Group') {
      if (this.advanSearchForm.get('GroupID').value) {
        this.advanSearchForm.get('Manufacturer').setValue(null);
        this.advanSearchForm.get('BrandID').setValue(null);
        this.advanSearchForm.get('Manufacturer').disable();
        this.advanSearchForm.get('BrandID').disable();
      } else {
        this.advanSearchForm.get('Manufacturer').enable();
        this.advanSearchForm.get('BrandID').enable();
        this.advanSearchForm.get('Manufacturer').setValue(null);
        this.advanSearchForm.get('BrandID').setValue(null);
      }
    }
    if (name === 'Manufacturer') {
      if (this.advanSearchForm.get('Manufacturer').value) {
        this.advanSearchForm.get('GroupID').setValue(null);
        this.advanSearchForm.get('GroupID').disable();

      } else {
        this.advanSearchForm.get('GroupID').enable();
        this.advanSearchForm.get('GroupID').setValue(null);
      }
    }
  }

  searchUpcCode(params) {
    if (params.target.value === '' || params.target.value === null) {
      return;
    }
    this.spinner.show();
    this.setupService.getData(`MasterPriceBookItem/get/` + params.target.value).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode'] === 204) {
        this.toastr.error('Item not found!', 'Error');
        this.isLinkedItemSearch = false;
        return;
      }
      if (result && result['statusCode']) {
        this.isLinkedItemSearch = false;
        return;
      }
      if (result && (result === null || result === '')) {
        this.isLinkedItemSearch = false;
        this.toastr.error('Item not found!', 'Error');
        return;
      } else {
        this.isLinkedItemSearch = true;
        this.linkedItemData.get('description').setValue(result.description);
        this.linkedItemData.get('masterLinkPriceBookItemID').setValue(result.masterPriceBookItemID);
      }
    });
  }
  getLinkedItemType() {
    this.setupService.getData('LinkedType/getAll').subscribe(result => {
      if (result && result['statusCode']) {
        this.commonService.LinkedTypeList = this.linkedItemTypeList = [];
        return;
      }
      this.commonService.LinkedTypeList = this.linkedItemTypeList = result;
    });
  }

  GetMastersItemDetails() {
    if (!this.priceBookItemForm.get('upcCode').value) {
      this.submitted = false;
      this.isLinkedItemSearch = false;
      this.masterPriceBookLinkedItemList = [];
      this.isLinkedItemSignal = true;
      this.priceBookItemForm.patchValue(this.defaultFormValue);
      return;
    }
    this.setupService.getData(`MasterPriceBookItem/GetMastersItemDetails/${this.priceBookItemForm.get('upcCode').value}`).subscribe(res => {
      this.masterPriceBookLinkedItemList = [];
      this.isLinkedItemSignal = true;
      this.priceBookItemForm.get('IsLinkedItem').setValue(false);
      if (res && res.masterPriceBookDetails && res.masterPriceBookDetails.masterPriceBookItemID) {
        this.priceBookItemForm.patchValue(res.masterPriceBookDetails);
        if (res.masterPriceBookLinkedItemDetails && res.masterPriceBookLinkedItemDetails[0]) {
          // this.priceBookItemForm.patchValue(
          //   { masterPriceBookLinkedItemDetails: res.masterPriceBookLinkedItemDetails[0] }
          // );
          // this.isLinkedItemSearch = true;
          // this.priceBookItemForm.get('IsLinkedItem').setValue(true);
          this.masterPriceBookLinkedItemList = res.masterPriceBookLinkedItemDetails;
        }

        this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').setValue('');
        if (res && res.masterCartonPriceBookDetails && res.masterCartonPriceBookDetails.upcCode) {
          this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').setValue(res.masterCartonPriceBookDetails.upcCode);
          this.cartonPackDescription = res.masterCartonPriceBookDetails.description;
          //  this.enableDisableCartonUPCCode(true);
        }

        if (this._descriptions && this._descriptions.nativeElement) {
          this._descriptions.nativeElement.focus();
        }
        this.isEditMode = true;
        this.EditDisableEnableMode();
        this.toastr.info('ITEM EXISTS', 'success');
        this.selectTab();
      } else {
        this.isLinkedItemSearch = false;
        this.toastr.warning('UPC Code doesn’t exist.', 'warning');
      }
    }, err => {
      this.toastr.error(this.constants.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  getCartonUpcCodeDetails() {
    if (this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').value) {
      this.setupService.getData(`MasterPriceBookItem/GetMastersItemDetails/${this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').value}`).subscribe(res => {
        if (res && res.masterPriceBookDetails && res.masterPriceBookDetails.masterPriceBookItemID) {
          // this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').setValue(res.masterPriceBookDetails.upcCode);
          this.priceBookItemForm.get('cartonPackMasterPriceBookItemID').setValue(res.masterPriceBookDetails.masterPriceBookItemID);
          this.cartonPackDescription = res.masterPriceBookDetails.description;
        }
        else {
          this.toastr.warning('Carton UPC Code doesn’t exist.', 'warning');
          this.cartonPackDescription = "";
        }
      }, err => {
        this.toastr.error(this.constants.infoMessages.contactAdmin);
        //console.log(err);
      });
    }
  }
  EditDisableEnableMode() {
    if (this.isEditMode) {
      this.priceBookItemForm.get('upcCode').disable();
    } else {
      this.priceBookItemForm.get('upcCode').enable();
    }
  }
  enableDisableCartonUPCCode(isDisable: boolean) {
    isDisable ? this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').disable() : this.priceBookItemForm.get('cartonPackMasterPriceBookItemUpc').enable()
  }
  selectTab() {
    this.tabs.select('addNewItem');
  }
  onManufacturerChanged() {
    this.priceBookItemForm.get('brandID').enable();
    this.priceBookItemForm.controls['brandID'].setValue(null);
    this.getBrandListByManufactureID();
  }
  getBrandListByManufactureID() {
    this.isBrandLoading = true;
    this.setupService.getData('MasterBrand/findByManufacturerID/' + this.priceBookItemForm.get('manufacturerID').value).subscribe(result => {
      this.isBrandLoading = false;
      if (result && result['statusCode']) {
        this.brandNameList = [];
        return;
      }
      this.brandNameList = result;
      $("html,body").scrollTop({left:0,top:0,behavior: 'smooth'});
    });
  }
  onBrandChanged() {
    this.priceBookItemForm.get('masterPriceGroupID').enable();
    this.priceBookItemForm.controls['masterPriceGroupID'].setValue(null);
    this.getGroupListByBrandID();
  }
  getGroupListByBrandID() {
    this.isGroupNameLoading = true;
    this.setupService.getData('MasterPriceGroup/GetByBrandID/' + this.priceBookItemForm.get('brandID').value).subscribe(result => {
      this.isGroupNameLoading = false;
      if (result && result['statusCode']) {
        this.groupNameList = [];
        return;
      }
      this.groupNameList = result;
    });
  }

  priceBookAdvSearch() {
    if (!this.newAdvancedSearchFormUpdated) {
      this.toastr.error("Please select filters", 'Error');
      return;
    }
    this.showGrid = true;
    this.spinner.show();
    this.setupService.postData('MasterPriceBookItem/SearchMasterItems', this.newAdvancedSearchForm.value).subscribe(res => {
      this.spinner.hide();
      if (res && res.statusCode === 500) {
        this.toastr.error("Error While Searching", 'Error');
        return;
      } else {
        this.rowData = res;
      }
    }, err => {
      this.spinner.hide();
    });
  }

  checkLength(value) {
    if (value.length > 13) {
      this.priceBookItemForm.get('upcCode').setValue(value.substr(0, 13));
      this.toastr.warning('Entered UPC code exceed max length(13 chars)');
    }
  }

  checkUPCCode(params) {
    params = params.target.value;
    if (params.length > 0) {
      if (!params.match(/^0+$/)) {
        const upcCodelength = params.length;
        if (this.validateUPCCode(params)) {
          if (upcCodelength === 8) {
            let updatedUPCCode = '0000' + params;
            this.priceBookItemForm.get('upcCode').setValue(updatedUPCCode);
            this.GetMastersItemDetails();
          } else if (upcCodelength === 12 || upcCodelength === 13) {
            this.priceBookItemForm.get('upcCode').setValue(params);
            this.GetMastersItemDetails();
          } else {
            this.priceBookItemForm.get('upcCode').setValue(params);
            this.GetMastersItemDetails();
          }
        } else if (upcCodelength === 8) {
          this.convertUpceToUpca(params);
        } else {
          this.toastr.error('Invaild UPC Code..!', this.constants.infoMessages.error);
        }
      } else {
        this.toastr.error('UPC Code contains all zeroes!', this.constants.infoMessages.error);
      }
    }
  }

  validateUPCCode(upcCode: any) {
    if (isNaN(upcCode)) return false;
    let upcLength = upcCode.length;
    let upcArray: [] = upcCode.split('');
    let checkDigit = Number(upcArray[upcLength - 1]);
    if (
      upcLength === 8 ||
      upcLength === 12 ||
      upcLength === 13 ||
      upcLength === 14
    ) {
      let checkSum = 0;
      let j = 0;
      for (let i = upcLength - 2; i >= 0; i--) {
        if (j === 0) {
          checkSum += Number(upcArray[i]) * 3;
          j++;
        } else {
          checkSum += Number(upcArray[i]);
          j = 0;
        }
      }
      let roundedCheckSum = Math.floor(checkSum / 10) * 10 + 10;
      let calcCheckDigit = roundedCheckSum - checkSum;
      if (calcCheckDigit === 10) calcCheckDigit = 0;
      if (calcCheckDigit === checkDigit) return true;
      else return false;
    } else if (
      upcLength === 1 ||
      upcLength === 2 || upcLength === 3 || upcLength === 4)
      return true;
    else return false;
  }

  convertUpceToUpca(params) {
    this.spinner.show();
    this.setupService.getData(`Item/ConvertUPCETOUPCA/${params}`).subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          let upcaCode = response ? response : '';
          upcaCode = response ? response : upcaCode;
          this.priceBookItemForm
            .get('upcCode')
            .setValue(upcaCode);
          if (
            upcaCode.length === 8 ||
            upcaCode.length === 12 ||
            upcaCode.length === 13
          ) {
            this.GetMastersItemDetails();
          }
        }
      },
      (err) => {
        this.toastr.error(
          'Please enter correct POS code',
          this.constants.infoMessages.error
        );
      }
    );
  }
}
