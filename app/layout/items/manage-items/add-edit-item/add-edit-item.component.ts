import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  SimpleChanges,
} from '@angular/core';
import { ColDef, GridApi } from 'ag-grid-community';
import { get as _get, find as _find } from 'lodash';
import { FormBuilder, Validators } from '@angular/forms';

import { SetupService } from '@shared/services/setupService/setup-service';
import { CommonService } from '@shared/services/commmon/common.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { VendorsComponent } from './vendors/vendors.component';
import { MultipliersComponent } from './multipliers/multipliers.component';
import { PriceGroupComponent } from './price-group/price-group.component';
import { LinkedItemsComponent } from './linked-items/linked-items.component';
import * as _ from 'lodash';

@Component({
  selector: 'app-add-edit-item',
  templateUrl: './add-edit-item.component.html',
  styleUrls: ['./add-edit-item.component.scss'],
})
export class AddEditItemComponent implements OnInit {
  @ViewChild(MultipliersComponent) multiplierComponent: MultipliersComponent;
  @ViewChild(VendorsComponent) vendorComponent: VendorsComponent;
  @ViewChild(PriceGroupComponent) priceGroupComponent: PriceGroupComponent;
  @ViewChild(LinkedItemsComponent) linkedItemsComponent: LinkedItemsComponent;

  @ViewChild('dept') deptDropdown;
  @ViewChild('uom') uomDropdown;
  @ViewChild('poscode') poscodeElement: ElementRef;
  @ViewChild('unitsInCase') unitsInCase: ElementRef;
  @ViewChild('desc') desc: ElementRef;
  @ViewChild('sellingUnits') sellingUnits: ElementRef;
  @ViewChild('reset') resetEle: ElementRef;
  @ViewChild('save') saveEle: ElementRef;

  @Input() isOpen: boolean = true;
  itemID: Number = 0;
  @Input('editItemId')
  set editItemId(val) {
    this.itemID = val;
    this.expandedGridIds = this.itemID ? ['multiplier'] : [];
    this.Edit();
  }
  @Input() _upcCode?: any;
  @Input() actions?: any;
  @Input() additionalActions: any;

  @Output() onClose: EventEmitter<any> = new EventEmitter();
  @Output() onSave: EventEmitter<any> = new EventEmitter();
  invalid = true;
  invalidMessage = '';
  isEditMode = false;
  editStoreItemsRowData: any;
  linkedIRowData: any;
  masterPriceBookDetails: any;
  isHideAddMultiplier = true;
  isAddMultipacks = false;
  _noOfBaseUnitsInCase: any;
  _departmentID: any;
  _masterPriceBookItemID: any;
  isLoading = true;

  departmentList: any[];
  descriptionLabel: any;
  isAddParameter = true;
  uomList: any;
  userInfo = this.constantService.getUserInfo();
  masterData: any;
  vendorRowData: any;
  newRowAdded: boolean;
  priceGRowData: any;
  priceRowAdded: boolean;
  format = 'upc'; //'MSI'; // 'CODE128';  // 'CODE128A'; // 'CODE128B';
  //barcode
  elementType = 'svg';
  lineColor = '#000000';
  width = 2;
  height = 35;
  displayValue = true;
  fontOptions = '';
  font = 'monospace';
  textAlign = 'center';
  textPosition = 'bottom';
  textMargin = 2;
  fontSize = 20;
  background = '#ffffff';
  margin = 0;
  marginTop = 0;
  marginBottom = 0;
  marginLeft = 10;
  marginRight = 10;

  rowCount = { multiplier: 0, vendor: 0, priceGroup: 0, linkedItems: 0 };
  submittedItem = false;
  isImportPopCancel = false;
  isUnitsOfMeasurementLoading = true;
  initailUpdateFormValue: any;
  isPatch = false;
  itemDetailsForm = this._fb.group({
    itemID: [0],
    companyID: [0],
    departmentID: [null], //
    activeFlag: [true],
    posCode: [''], //
    // posCodeFormatID: [0],
    uomid: [null],
    description: [''], //
    isDefault: false,
    sellingUnits: [1, [Validators.min(1), Validators.max(99)]], //
    unitsInCase: [1, [Validators.min(1), Validators.max(9999)]], //
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    departmentDescription: [''],
    uomDescription: [''],
    regularSellPrice: [0],
    unitCostPrice: [0],
    maxInventory: [0],
    minInventory: [0],
    storeLocationItemID: [0],
    storeLocationID: [0],
    storeName: [''],
    priceRequiredFlag: [false],
    isFractionalQtyAllowedFlag: [false],
    allowFoodStampsFlag: [false],
    isItemReturnableFlag: [false],
    isLoyaltyRedeemEligibleFlag: [false],
    areSpecialDiscountsAllowedFlag: [false],
    storelocationlst: [''],
    buyingCost: [0],
    sellingPrice: [0],
    isMultipackFlag: [false], //
    noOfBaseUnitsInCase: [''], //
    buyDown: [0],
    basicBuyDown: [0],
    rackAllowance: [0],
    isMultiplier: [0],
    multiplierPOSCode: [''],
    multiplierQuantity: [0],
    manufacturerID: [0],
    manufacturerName: [''],
    posCodeWithCheckDigit: [''],
    grossProfit: [0],
    isTrackItem: [true],
    inventoryValuePrice: [0],
    currentInventory: [0],
    inventoryAsOfDate: new Date(),
    vendorID: [0],
    posCodeModifier: [0],
    regularPackageSellPrice: [0],
    mulType: [''],
    multipackItemID: [0],
  });
  get _item() {
    return this.itemDetailsForm.controls;
  }
  get _itemValue() {
    return this.itemDetailsForm.value;
  }
  itemPricingGridApi: GridApi;
  itemPricingGridColumnDef: ColDef[];
  itemPricingGridRowData: any[] = [];

  onChangePricing(postData) {
    this.onSave.emit(postData);
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.additionalActions) {
      if (changes.additionalActions.currentValue.navigateToItemHistory) {
        if (changes.additionalActions.previousValue) {
          setTimeout(() => {
            document.getElementById("stock").scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          });
        } else {
          setTimeout(() => {
            document.getElementById("stock").scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          }, 1500);
        }
      } else if (changes.additionalActions.currentValue.navigateToSalesActivity) {
        if (changes.additionalActions.previousValue) {
          setTimeout(() => {
            document.getElementById("purchase").scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          });
        } else {
          setTimeout(() => {
            document.getElementById("purchase").scrollIntoView({
              behavior: "smooth",
              block: "start",
              inline: "nearest"
            });
          }, 1500);
        }
      } else if (changes.additionalActions.currentValue.navigateToItem) {
        setTimeout(() => {
          document.getElementById("itemPanel").scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest"
          });
        });
      }
    }
  }

  departmentClick($event) {
    if (this.itemDetailsForm.get('departmentDescription').value != '') {
      //this.deptDropdown.disabled = true;
      this._item.departmentID.markAsTouched()
      //this.deptDropdown.blur();
    }
  }
  uomClick($event) {
    //if (this.itemDetailsForm.get('uomid').value != null)
    // this.uomDropdown.blur();
  }
  onDepartmentChange(event) {
    //this.deptDropdown.blur();
    //this.deptDropdown.disabled = true;
    this._item.departmentID.markAsTouched()
    if (event) {
      this.itemDetailsForm.get('departmentDescription').setValue(event.departmentDescription);
    }
    else {
      this.itemDetailsForm.get('departmentDescription').setValue('');
    }
    if (this.deptDropdown && this.deptDropdown['element'])
      this.deptDropdown['element'].focus();
  }
  uomChange() {
    //this.uomDropdown.blur();
    if (this.uomDropdown && this.uomDropdown['element'])
      this.uomDropdown['element'].focus();
  }
  checkDeptKey(e) {
    e = e || window.event;
    if (e.shiftKey && e.keyCode == 9) {
      this.desc.nativeElement.focus();
      return false;
    } else if (e.keyCode === 9) {
      this.unitsInCase.nativeElement.focus();
      return false;
    }
    return true;
  }
  checkUOMKey(e) {
    e = e || window.event;
    if (e.shiftKey && e.keyCode == 9) {
      this.sellingUnits.nativeElement.focus();
      return false;
    }
    else if (e.keyCode === 9) {
      if (this.itemID)
        this.resetEle.nativeElement.focus();
      else
        this.saveEle.nativeElement.focus();
      return false;
    }
    return true;
  }
  cancel() {
    this.isPatch = true;
    this.itemDetailsForm.patchValue(this.initailUpdateFormValue);

    this.itemDetailsForm.get('posCodeWithCheckDigit').setValue(this.initailUpdateFormValue.posCode);
    setTimeout(() => {
      this.isPatch = false;
    }, 1000);
    this.descriptionLabel = '';
  }
  ngAfterViewInit() {
    this.poscodeElement.nativeElement.focus();
  }

  editItem() {
    if (this.itemDetailsForm.get('isDefault').value) {
      this.disableFields();
    } else {
      this.enableFields();
    }
    this.isAddParameter = true;
  }

  expandedItemPricingGridIds: any[] = [];
  handleItemPricingGridExpansion(
    expansionId: any,
    isAccordion: boolean = true
  ) {
    // collapse if already expanded
    if (this.expandedItemPricingGridIds.includes(expansionId)) {
      this.expandedItemPricingGridIds = this.expandedItemPricingGridIds.filter(
        (ids) => ids != expansionId
      );
    } else {
      // if it is an accordion then keep show only one grid at a time
      if (isAccordion) {
        this.expandedItemPricingGridIds = [];
      }
      this.expandedItemPricingGridIds.push(expansionId);
    }
  }
  updateRowCount(params) {
    this.rowCount[params.key] = params.value;
  }
  expandedGridIds: any[] = this.itemID ? ['multiplier'] : [];
  handleGridExpansion(expansionId: any, isAccordion: boolean = true) {
    // collapse if already expanded
    if (this.itemID) {
      if (this.expandedGridIds.includes(expansionId)) {
        this.expandedGridIds = this.expandedGridIds.filter(
          (ids) => ids != expansionId
        );
      } else {
        // if it is an accordion then keep show only one grid at a time
        if (isAccordion) {
          this.expandedGridIds = [];
        }
        this.expandedGridIds.push(expansionId);
      }
    }
  }
  handleGridAdd(event, item) {
    if (this.itemID) {
      event.stopPropagation();
      if (!this.expandedGridIds.includes(item)) this.handleGridExpansion(item);
      setTimeout(() => {
        if (item == 'multiplier') this.multiplierComponent.AddMultiplier(event);
        else if (item == 'vendor') this.vendorComponent.editVendorItem(event);
        else if (item == 'priceGroup')
          this.priceGroupComponent.editPriceGroupItem(event);
        else if (item == 'linkedItems')
          this.linkedItemsComponent.addRowLinked(event);
      }, 200);
    }
  }

  editVendorItem(event) {
    event.stopPropagation();
    this.vendorComponent.editVendorItem(event);
  }

  openDialogConfirmRemove: boolean = false;
  removeData: any;
  handleConfirmRemoveClose(e) {
    this.openDialogConfirmRemove = false;
    if (e == 'confirm') {
      // remove data from ag grid
      this.removeData.api.applyTransaction({
        remove: [this.removeData.data],
      });
      // remove data from actual dataset
      const gridIdName = `${this.removeData.gridId}GridRowData`;
      this[gridIdName] = this[gridIdName].filter((d) => {
        return d.id != this.removeData.data.id;
      });
    }
    this.removeData = null;
  }
  get values(): string[] {
    return this.itemDetailsForm.controls.posCodeWithCheckDigit.value.split(
      '\n'
    );
  }
  constructor(
    private dataSerice: SetupService,
    private constantService: ConstantService,
    private _fb: FormBuilder,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private commonService: CommonService
  ) { }
  isVerified = false;
  ngOnInit() {
    this.getDepartment();
    this.getUOM();
    this.CheckUnitsInCase(this.itemDetailsForm.get('unitsInCase').value);
    this.itemDetailsForm.get('unitsInCase').valueChanges.subscribe((units) => {
      if (!this.isPatch) this.CheckUnitsInCase(units);
    });
    this.itemDetailsForm
      .get('sellingUnits')
      .valueChanges.subscribe((sellingUnits) => {
        if (
          !this.isPatch &&
          Number(sellingUnits) > Number(this.itemDetailsForm.value.unitsInCase)
        ) {
          this.itemDetailsForm.get('sellingUnits').setValue(null);
          this.toastr.error(
            'Selling units must be less than or equal to Units in case'
          );
        }
      });
    this.CheckMultipack(this.itemDetailsForm.get('isMultipackFlag').value);
    this.itemDetailsForm
      .get('isMultipackFlag')
      .valueChanges.subscribe((multipack) => {
        if (!this.isPatch) this.CheckMultipack(multipack);
      });
  }

  CheckUnitsInCase(units) {
    if (Number(this.itemDetailsForm.value.sellingUnits) > Number(units)) {
      this.itemDetailsForm.get('sellingUnits').setValue(null);
    }
    if (Number(units) <= 1) {
      this.itemDetailsForm.get('isMultipackFlag').setValue(false);
    }
  }
  CheckMultipack(multipack) {
    if (
      !multipack &&
      !this.isVerified &&
      this.itemDetailsForm.get('unitsInCase').value &&
      Number(this.itemDetailsForm.get('unitsInCase').value) > 0
    ) {
      this.isVerified = true;
      // this.itemDetailsForm.get('unitsInCase').setValue(1);
      this.itemDetailsForm.get('sellingUnits').setValue(1);
    }
    if (multipack) {
      this.isVerified = false;
      if (this.itemDetailsForm.get('unitsInCase').value <= 1) {
        this.toastr.warning(
          'Units in case should be greater than 1 to select Multipack',
          'Warning'
        );
        this.itemDetailsForm.get('isMultipackFlag').setValue(false);
      }
    }
  }

  Edit() {
    if (this.itemID) {
      this.isEditMode = true;
      this.fetchItemById(this.itemID);
      this.isAddParameter = false;
    } else {
      this.isEditMode = false;
    }
  }

  EditModeReadOnly() {
    this.descriptionLabel = this.itemDetailsForm.value.description;
    this.isEditMode = true;
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].disable();
    this.itemDetailsForm.controls['unitsInCase'].disable();
    this.itemDetailsForm.controls['sellingUnits'].disable();
    this.itemDetailsForm.controls['uomid'].disable();
    this.itemDetailsForm.controls['departmentID'].disable();
    this.itemDetailsForm.controls['isMultipackFlag'].disable();
    this.itemDetailsForm.controls['description'].disable();
    this.isAddParameter = false;
  }

  fetchItemById(itemId) {
    this.spinner.show();
    this.dataSerice.getData('Item/get/' + itemId, '').subscribe(
      (response) => {
        this.spinner.hide();
        if (response) {
          this.initailUpdateFormValue = response;
          const upc = this._upcCode
            ? this._upcCode
            : response.posCode;
          this.initailUpdateFormValue.posCode = upc;
          this.isPatch = true;
          this.itemDetailsForm.patchValue(response);
          setTimeout(() => {
            this.isPatch = false;
          }, 1000);
          this.descriptionLabel = response.description;
          this.commonService.isItemDefault = this.itemDetailsForm.get(
            'isDefault'
          ).value;

          this.itemDetailsForm.get('posCodeWithCheckDigit').setValue(upc);
          this._departmentID = response.departmentID;
          this._noOfBaseUnitsInCase = this.itemDetailsForm.get(
            'unitsInCase'
          ).value;
          if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
            this.isAddMultipacks = true;
            // this.addMultipack();
            // this.GetMultipacks(itemId);
          } else {
            this.isAddMultipacks = false;
          }
          response.isDefault === false || response.isDefault === null
            ? (this.isHideAddMultiplier = false)
            : (this.isHideAddMultiplier = true);
          // this.setColumnHideShow(this.isHideAddMultiplier);
        }
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }

  getDepartment() {
    // tslint:disable-next-line:max-line-length
    document.addEventListener("keydown", this.preventTab);
    // this.spinner.show();
    this.dataSerice
      .getData(
        `Department/GetByfuel/${this.userInfo.userName}/${this.userInfo.companyId}/false`
      )
      .subscribe(
        (res) => {
          document.removeEventListener("keydown", this.preventTab);
          // this.spinner.hide();
          this.isLoading = false;
          const myOrderedArray = _.sortBy(res, (o) => o.departmentDescription);
          this.departmentList = myOrderedArray;
        },
        (err) => {
          this.spinner.hide();
          console.log(err);
        }
      );
  }

  getUOM() {
    document.addEventListener("keydown", this.preventTab);
    // this.spinner.show();
    this.dataSerice.getData('UOM/getAll').subscribe(
      (response) => {
        document.removeEventListener("keydown", this.preventTab);
        // this.spinner.hide();
        const myOrderedArray = _.sortBy(response, (o) => o.uomDescription);
        this.uomList = myOrderedArray;
        this.isUnitsOfMeasurementLoading = false;
      },
      (error) => {
        this.spinner.hide();
        console.log(error);
      }
    );
  }
  getVendorItem() {
    // this.spinner.show();
    this.dataSerice
      .getData('Vendor/getAll/' + this.userInfo.companyId)
      .subscribe((response) => {
        // this.spinner.hide();
        if (response && response['statusCode']) {
          this.commonService.vendorItemList = [];
          return;
        }
        this.commonService.vendorItemList = response;
      });
  }
  fetchVendorItemByItemID(id) {
    // this.spinner.show();
    this.dataSerice.getData(`VendorItem/getByItemId/${id}`).subscribe(
      (res) => {
        this.newRowAdded = false;
        // this.spinner.hide();
        if (res && res['statusCode']) {
          this.vendorRowData = [];
          return;
        }
        this.vendorRowData = res;
      },
      (err) => {
        this.spinner.hide();
        console.log(err);
      }
    );
  }

  getCompanyPriceGroup() {
    this.spinner.show();
    this.dataSerice
      .getData(`CompanyPriceGroup/getByCompanyID/${this.userInfo.companyId}`)
      .subscribe(
        (response) => {
          this.spinner.hide();
          if (response && response['statusCode']) {
            this.commonService._companyPriceGroupRow = [];
            return;
          }
          this.commonService._companyPriceGroupRow = response;
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }

  getItemPriceGroup() {
    // this.spinner.show();
    this.dataSerice
      .getData(
        'ItemPriceGroup/getByItemId/' +
        this.itemID +
        '/' +
        this.userInfo.companyId
      )
      .subscribe(
        (response) => {
          // this.spinner.hide();
          if (response && response['statusCode']) {
            this.priceGRowData = [];
            return;
          }
          this.priceGRowData = response ? response : [];
        },
        (error) => {
          this.spinner.hide();
          console.log(error);
        }
      );
  }

  convertUpceToUpca(params) {
    this.spinner.show();
    document.addEventListener("keydown", this.preventTab);
    this.dataSerice.getData(`Item/ConvertUPCETOUPCA/${params}`).subscribe(
      (response) => {
        document.removeEventListener("keydown", this.preventTab);
        this.spinner.hide();
        if (response) {
          let upcaCode = response ? response : '';
          upcaCode = response ? response : upcaCode;
          this.itemDetailsForm.get('posCodeWithCheckDigit').setValue(upcaCode);
          setTimeout(() => {
            this.invalid = false;
          }, 1000);
          if (
            upcaCode.length === 8 ||
            upcaCode.length === 12 ||
            upcaCode.length === 13
          ) {
            this.checkPosCode(upcaCode);
          }
        }
      },
      (err) => {
        this.toastr.error(
          'Please enter correct POS code',
          this.constantService.infoMessages.error
        );
      }
    );
  }

  disableFields() {
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].disable();
    this.itemDetailsForm.controls['unitsInCase'].disable();
    this.itemDetailsForm.controls['sellingUnits'].disable();
    this.itemDetailsForm.controls['uomid'].disable();
    this.itemDetailsForm.controls['departmentID'].enable();
    this.itemDetailsForm.controls['isMultipackFlag'].enable();
    this.itemDetailsForm.controls['description'].enable();
  }
  enableFields() {
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].enable();
    this.itemDetailsForm.controls['unitsInCase'].enable();
    this.itemDetailsForm.controls['sellingUnits'].enable();
    this.itemDetailsForm.controls['uomid'].enable();
    this.itemDetailsForm.controls['departmentID'].enable();
    this.itemDetailsForm.controls['description'].enable();
  }
  checkUPCCode(params) {
    if (params.relatedTarget && params.relatedTarget.querySelector('i.flaticon-cancel')) {
      return;
    }
    params = params.target.value;
    if (!this.isEditMode && params.length > 0) {
      this.format = 'upc';
      this.invalid = true;
      if (!params.match(/^0+$/)) {
        this.editStoreItemsRowData = [];
        this.enableFields();
        const upcCodelength = params.length;
        if (this.validateUPCCode(params)) {
          if (upcCodelength === 8) {
            let updatedUPCCode = '0000' + params;
            this.itemDetailsForm
              .get('posCodeWithCheckDigit')
              .setValue(updatedUPCCode);
            this.checkPosCode(updatedUPCCode);
          } else if (upcCodelength === 12 || upcCodelength === 13) {
            if (upcCodelength === 13) this.format = 'EAN13';
            this.checkPosCode(params);
          } else this.checkPosCode(params);
          this.invalid = false;
        } else if (upcCodelength === 8) {
          this.convertUpceToUpca(params);
        } else {
          this.invalidMessage = 'Invaild UPC Code..!';
          this.toastr.error(
            this.invalidMessage,
            this.constantService.infoMessages.error
          );
        }
      } else {
        this.invalidMessage = 'UPC Code contains all zeroes!';
        this.toastr.error(
          this.invalidMessage,
          this.constantService.infoMessages.error
        );
      }
    }
    else if (this.isEditMode)
      this.invalid = false;
  }

  checkPosCode(params) {
    this.isHideAddMultiplier = true;
    document.addEventListener("keydown", this.preventTab);
    setTimeout(() => {
      this.spinner.show();
    }, 0);
    this.dataSerice
      .getData(`Item/checkPOSCode/${params}/${this.userInfo.companyId}`)
      .subscribe(
        (res) => {
          document.removeEventListener("keydown", this.preventTab);
          this.spinner.hide();
          if (res && res.itemID) {
            this.itemID = res.itemID;
            this.toastr.info('Item Already Exists', 'Success');
            this.isEditMode = true;
            this.isPatch = true;
            this.invalid = false;
            this.itemDetailsForm.patchValue(res);
            setTimeout(() => {
              this.isPatch = false;
            }, 1000);
            this.initailUpdateFormValue = res;
            this.descriptionLabel = res.description;
            this.itemDetailsForm.get('posCode').setValue(params);
            this.commonService.isItemDefault = this.itemDetailsForm.get(
              'isDefault'
            ).value;
            if (this.itemDetailsForm.get('isMultipackFlag').value === true) {
              this.isAddMultipacks = true;
            } else {
              this.isAddMultipacks = false;
            }
            this._departmentID = res.departmentID;
            this._noOfBaseUnitsInCase = this.itemDetailsForm.get(
              'unitsInCase'
            ).value;
            res.isDefault === false || res.isDefault === null
              ? (this.isHideAddMultiplier = false)
              : (this.isHideAddMultiplier = true);
            this.cancel();
          } else {
            this.getMasterPriceBookItem(params);
          }
        },
        (err) => {
          this.toastr.error(this.constantService.infoMessages.contactAdmin);
          console.log(err);
        }
      );
  }
  getMasterPriceBookItem(upcCode) {
    this.masterPriceBookDetails = null;
    this.spinner.show();
    this.dataSerice
      .getData(`MasterPriceBookItem/GetMastersItemDetails/${upcCode}`)
      .subscribe(
        (res) => {
          this.spinner.hide();
          if (
            res &&
            res.masterPriceBookDetails &&
            res.masterPriceBookDetails.masterPriceBookItemID
          ) {
            this.masterData = res;
            this.masterPriceBookDetails = res.masterPriceBookDetails;
            this.toastr.info('Retrieved from the master price book', 'Success');
            this.itemDetailsForm.get('itemID').setValue(0);
            this._noOfBaseUnitsInCase = res.masterPriceBookDetails.unitsInCase;
            this.isHideAddMultiplier = true;
            this.itemID = 0;
            this.itemDetailsForm
              .get('posCode')
              .setValue(res.masterPriceBookDetails.upcCode);
            this.itemDetailsForm
              .get('isDefault')
              .setValue(res.masterPriceBookDetails.isDefault);
            this.itemDetailsForm
              .get('uomid')
              .setValue(res.masterPriceBookDetails.uomid);
            this.itemDetailsForm
              .get('description')
              .setValue(res.masterPriceBookDetails.description);
            this.itemDetailsForm
              .get('sellingUnits')
              .setValue(res.masterPriceBookDetails.sellingUnits);
            this.itemDetailsForm
              .get('noOfBaseUnitsInCase')
              .setValue(res.masterPriceBookDetails.sellingUnits);
            this.itemDetailsForm
              .get('unitsInCase')
              .setValue(res.masterPriceBookDetails.unitsInCase);
            this.linkedIRowData = res.masterPriceBookLinkedItemDetails;
            if (res.masterPriceBookDetails.isDefault) {
              this.disableFields();
            }
          }
        },
        (err) => {
          // this.toastr.error(this.constantService.infoMessages.contactAdmin);
        }
      );
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
      upcLength === 2 ||
      upcLength === 3 ||
      upcLength === 4
    )
      return true;
    else return false;
  }

  handlePanelClose() {
    this.onClose.emit();
  }

  preventTab = function (e) {
    e = e || window.event;
    //if (e.keyCode === 9) { // If tab key is pressed
    e.preventDefault() // Stop event from its action
    // }
  }
  compareObject(source, destination) {
    let matched = true;
    for (var key in source) {
      if (
        source.hasOwnProperty(key) &&
        key !== 'posCode' &&
        key !== 'lastModifiedBy' &&
        key !== 'lastModifiedDateTime' &&
        (((!destination[key] || !source[key]) && destination[key] !== source[key]) || (destination[key] && source[key] && destination[key].toString() !== source[key].toString()))
      ) {
        matched = false;
      }
    }
    return matched;
  }

  addNewItem() {
    let updated = true;
    if (this.invalid) {
      this.toastr.clear();
      this.toastr.error(
        this.invalidMessage,
        this.constantService.infoMessages.error
      );
    }
    this.itemDetailsForm.value.itemID =
      this.itemDetailsForm.value.itemID === null
        ? 0
        : this.itemDetailsForm.value.itemID;
    if (
      this.itemDetailsForm.value.itemID > 0 &&
      this.compareObject(
        this.itemDetailsForm.value,
        this.initailUpdateFormValue
      )
    ) {
      updated = false;
      this.toastr.warning(
        'No value is updated',
        this.constantService.infoMessages.warning
      );
    }
    this.submittedItem = true;
    if (this.itemDetailsForm.valid && !this.invalid && updated) {
      const postData = {
        ...this.itemDetailsForm.value,
        priceRequiredFlag: false,
        noOfBaseUnitsInCase: this.itemDetailsForm.value.isMultipackFlag
          ? this.itemDetailsForm.get('unitsInCase').value
          : 0,
        posCode: this.itemDetailsForm.get('posCodeWithCheckDigit').value,
        isDefault: this.itemDetailsForm.get('isDefault').value,
        uomid: this.itemDetailsForm.get('uomid').value,
        description: this.itemDetailsForm.get('description').value,
        sellingUnits: Number(this.itemDetailsForm.get('sellingUnits').value),
        unitsInCase: Number(this.itemDetailsForm.get('unitsInCase').value),
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
      };
      this.itemDetailsForm
        .get('noOfBaseUnitsInCase')
        .setValue(postData.noOfBaseUnitsInCase);
      if (postData.itemID == 0) {
        this.spinner.show();
        this.dataSerice
          .postData('Item/addNew?isMobile=false', postData)
          .subscribe(
            (res) => {
              this.spinner.hide();
              if (res && res.itemID) {
                this.itemID = res.itemID;
                this.submittedItem = false;
                this.isPatch = true;
                this.itemDetailsForm.patchValue(res);
                setTimeout(() => {
                  this.isPatch = false;
                }, 1000);
                this.initailUpdateFormValue = res;
                this.commonService.isItemDefault = this.itemDetailsForm.get(
                  'isDefault'
                ).value;
                this.toastr.success(
                  this.constantService.infoMessages.addedRecord,
                  this.constantService.infoMessages.success
                );
                this._noOfBaseUnitsInCase = this.itemDetailsForm.get(
                  'unitsInCase'
                ).value;
                this._departmentID = res.departmentID;
                if (
                  this.itemDetailsForm.get('isMultipackFlag').value === true
                ) {
                  this.isAddMultipacks = true;
                } else {
                  this.isAddMultipacks = false;
                }
                this.isEditMode = true;
                this.isHideAddMultiplier = false;
                this.cancel();
                this.onSave.emit(postData);
              } else {
                this.toastr.error(
                  this.constantService.infoMessages.addRecordFailed
                );
              }
            },
            (err) => {
              this.spinner.hide();
              this.toastr.error(
                this.constantService.infoMessages.addRecordFailed
              );
              console.log(err);
            }
          );
      } else {
        this.spinner.show();
        this.dataSerice
          .updateData('Item/update?isMobile=false', postData)
          .subscribe(
            (res) => {
              this.spinner.hide();
              if (res && res['statusCode']) {
                this.toastr.error(
                  this.constantService.infoMessages.updateRecordFailed
                );
                return;
              }
              if (res && Number(res) > 0) {
                this.onSave.emit(postData);
                this.initailUpdateFormValue = postData;
                this.toastr.success(
                  this.constantService.infoMessages.updatedRecord,
                  'Update'
                );
                this._noOfBaseUnitsInCase = this.itemDetailsForm.get(
                  'unitsInCase'
                ).value;
                this._departmentID = this.itemDetailsForm.get(
                  'departmentID'
                ).value;
                if (
                  this.itemDetailsForm.get('isMultipackFlag').value === true
                ) {
                  this.isAddMultipacks = true;
                } else {
                  this.isAddMultipacks = false;
                }
              } else {
                this.toastr.error(
                  this.constantService.infoMessages.updateRecordFailed
                );
              }
            },
            (err) => {
              this.spinner.hide();
              console.log(err);
            }
          );
      }
    }
  }
  checkDesc($event) {
    if ($event.target.value)
      this.itemDetailsForm
        .get('description')
        .setValue($event.target.value.toUpperCase().trim());
  }
  checkLength(value) {
    this.invalid = true;
    if (value.length > 13) {
      this.itemDetailsForm
        .get('posCodeWithCheckDigit')
        .setValue(value.substr(0, 13));
      this.toastr.warning('Entered UPC code exceed max length(13 chars)');
    }
  }
  checkChar(e) {
    var specialKeys = new Array();
    specialKeys.push(8); //Backspace
    specialKeys.push(9); //Tab
    specialKeys.push(46); //Delete
    specialKeys.push(36); //Home
    specialKeys.push(36); //$
    specialKeys.push(92); // \
    specialKeys.push(47); //   /
    specialKeys.push(46); // .
    specialKeys.push(45); //-
    let keyCode = e.keyCode == 0 ? e.charCode : e.keyCode;
    return (
      keyCode === 32 ||
      (keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 65 && keyCode <= 90) ||
      (keyCode >= 97 && keyCode <= 122) ||
      specialKeys.indexOf(e.keyCode) != -1
    ); //&& e.charCode != e.keyCode
  }

  onMultipackPress(evt: KeyboardEvent) {
    const isCodeAllowed = evt.code ? ['Space', 'Enter'].includes(evt.code) : false;
    const isWhichAllowed = evt.which ? [13, 32].includes(evt.which) : false;
    const isKeyCodeAllowed = evt.which ? [13, 32].includes(evt.which) : false;
    if (isCodeAllowed || isWhichAllowed || isKeyCodeAllowed) {
      evt.preventDefault();
      // @ts-ignore
      evt.target.click();
    }
  }
}
