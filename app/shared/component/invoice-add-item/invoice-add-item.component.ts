import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-invoice-add-item',
  templateUrl: './invoice-add-item.component.html',
  styleUrls: ['./invoice-add-item.component.scss']
})
export class InvoiceAddItemComponent implements OnInit {
  @Input() upcCode: any;
  @ViewChild('upcCodeFoucs') upcCodeFoucs: any;
  @Output() closeModel: EventEmitter<any> = new EventEmitter();
  isCollapsed = false;
  itemDetailsForm = this._fb.group({
    itemID: [0],
    companyID: [0],
    departmentID: [null],  //
    activeFlag: [true],
    posCode: [''],   //
    // posCodeFormatID: [0],
    uomid: [null],
    description: [''],  //
    isDefault: false,
    sellingUnits: [1],   //
    unitsInCase: [],  //
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
    noOfBaseUnitsInCase: [''],   //
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
  isLoading = true;
  isUnitsOfMeasurementLoading = true;
  submitedItem = false;
  closeResult: string;
  isAddParameter = false;
  departmentList: any;
  uomList: any;
  userInfo: any;
  isEditMode = false;
  hideBaseUnitsInCase = false;
  isEditModeRedOnly: boolean;
  isCancelClick: boolean;
  initailFormValue: any;
  constructor(private _fb: FormBuilder, private modalService: NgbModal, private dataService: SetupService
    , private constantService: ConstantService, private toastr: ToastrService, private spinner: NgxSpinnerService) {
    this.userInfo = this.constantService.getUserInfo();
    this.initailFormValue = this.itemDetailsForm.value;
  }

  ngOnInit() {
    this.getUOM();
    this.getDepartment();
    if (this.upcCode) {
      this.itemDetailsForm.get('posCode').setValue(this.upcCode);
      // this.checkUPCCode(String(this.upcCode));
    }
  }
  addParameters(contentParameter) {
    this.modalService.open(contentParameter, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  get _item() { return this.itemDetailsForm.controls; }
  addMoreItem() {
    this.itemDetailsForm.patchValue(this.initailFormValue);
    this.isEditMode = this.isEditModeRedOnly = false;
    // this.editStoreItemsRowData = this.multipacksIRowData = this.vendorRowData =
    //   this.priceGRowData = this.multiplierRowData = this.linkedIRowData = this.itemID = this.itemId = null;
    // this.isAddMultipacks = this.isAddRowMultip = false;
    // this.isAddRowLinked = false;
    // this.priceRowAdded = false; this.tempId = this.addrow = 0;
    // this.isHideButtons = true;
    // this.isHideAddMultiplier = true;
    // this.setColumnHideShow(this.isHideAddMultiplier);
    // this.isPriceGridEditMode = false;
    this.submitedItem = false;
    this.isAddParameter = false;
    // this._masterPriceBookItemID = this._departmentID = this._noOfBaseUnitsInCase = null;
    // this.selectStore = null;
    this.enableFields();
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  checkUPCCode(params) {
    this.enableFields();
    const upcCodelength = params.length;
    if (upcCodelength === 8) {
      this.convertUpceToUpca(params);
    } else if (upcCodelength === 12 || upcCodelength === 13) {
      this.checkPosCode(params);
    } else if ((upcCodelength >= 5 && upcCodelength <= 7) || (upcCodelength >= 9 && upcCodelength <= 11) ||
      upcCodelength > 13) {
      if (this.upcCodeFoucs && this.upcCodeFoucs.nativeElement) {
        this.upcCodeFoucs.nativeElement.focus();
      }
      this.toastr.error('Invaild UPC Code..!', this.constantService.infoMessages.error);
    }

  }
  convertUpceToUpca(params) {
    this.dataService.getData(`Item/ConvertUPCETOUPCA/${params}`)
      .subscribe((response) => {
        if (response) {
          this.itemDetailsForm.get('posCode').setValue(response);
          if (response.length === 12 || response.length === 13) {
            this.checkPosCode(response);
          }
        }

      }, (err) => {
        this.toastr.error('Please enter correct POS code', this.constantService.infoMessages.error);
      });
  }
  checkPosCode(params) {
    this.dataService.getData(`Item/checkPOSCode/${params}/${this.userInfo.companyId}`).subscribe(res => {
      if (res && res.itemID) {
        this.toastr.info('Item retive from local item', 'success');
        this.itemDetailsForm.patchValue(res);
        this.EditModeRedOnly();
      }
    }, err => {
      this.toastr.error(this.constantService.infoMessages.contactAdmin);
      console.log(err);
    });
  }
  EditModeRedOnly() {
    this.isEditMode = this.isEditModeRedOnly = true;
    this.itemDetailsForm.controls['noOfBaseUnitsInCase'].disable();
    this.itemDetailsForm.controls['unitsInCase'].disable();
    this.itemDetailsForm.controls['sellingUnits'].disable();
    this.itemDetailsForm.controls['uomid'].disable();
    // this.itemDetailsForm.controls['posCode'].disable();
    this.itemDetailsForm.controls['departmentID'].disable();
    this.itemDetailsForm.controls['isMultipackFlag'].disable();
    this.itemDetailsForm.controls['description'].disable();
    this.isAddParameter = false; this.isCancelClick = false;
  }
  setDescriptionUpperCase(params) {
    this.itemDetailsForm.get('description').setValue(params.toUpperCase());
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
    this.itemDetailsForm.controls['isMultipackFlag'].enable();
    this.itemDetailsForm.controls['description'].enable();
  }
  getUOM() {
    this.dataService.getData('UOM/getAll').subscribe((response) => {
      this.uomList = response;
      this.isUnitsOfMeasurementLoading = false;
    }, (error) => {
      console.log(error);
    });
  }
  getDepartment() {
    // tslint:disable-next-line:max-line-length
    this.dataService.getData(`Department/getAll/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe(res => {
        this.isLoading = false;
        this.departmentList = res;
      }, err => {
        console.log(err);
      });

  }
  editItem() {
    if (this.itemDetailsForm.value.isDefault) {
      this.disableFields();
    } else {
      this.enableFields();
    }
    this.isAddParameter = true;
    this.isEditModeRedOnly = false;
    this.isCancelClick = true;
  }
  cancel() {
    this.EditModeRedOnly();
  }
  addNewItem() {
    this.submitedItem = true;
    if (this.itemDetailsForm.valid) {
      const postData = {
        ...this.itemDetailsForm.value,
        noOfBaseUnitsInCase: this.itemDetailsForm.value.isMultipackFlag ?
          this.itemDetailsForm.get('unitsInCase').value : 0,
        companyID: this.userInfo.companyId,
        lastModifiedBy: this.userInfo.userName,
        lastModifiedDateTime: new Date(),
      };
      this.itemDetailsForm.get('noOfBaseUnitsInCase').setValue(postData.noOfBaseUnitsInCase);
      if (postData.itemID === 0) {
        this.spinner.show();
        this.dataService.postData('Item/addNew?isMobile=false', postData).subscribe(res => {
          this.spinner.hide();
          // res.itemID ? this.isHideButtons = false : this.isHideButtons = true;
          if (res && res.itemID) {
            this.submitedItem = false;
            this.closeModel.emit({ isClose: true, posCode: res.posCode });
            this.toastr.success(this.constantService.infoMessages.addedRecord, this.constantService.infoMessages.success);
            // this.fetchStoreLocationItemByItemID(res.itemID);
            this.itemDetailsForm.patchValue(res);
            //  this.EditModeRedOnly();

          } else {
            this.toastr.error(this.constantService.infoMessages.addRecordFailed);

          }

        }, err => {
          this.spinner.hide();
          this.toastr.error(this.constantService.infoMessages.addRecordFailed);
          console.log(err);
        });

      } else {
        this.spinner.show();
        this.dataService.updateData('Item/update?isMobile=false', postData).subscribe(res => {
          this.spinner.hide();
          if (res && Number(res) > 0) {
            this.toastr.success(this.constantService.infoMessages.updatedRecord, 'Update');
            //  this.setColumnHideShow(this.itemDetailsForm.value.isDefault);
            this.EditModeRedOnly();

          } else {
            this.toastr.error(this.constantService.infoMessages.updateRecordFailed);

          }
        }, err => {
          this.spinner.hide();
          console.log(err);
        });
      }
    }
  }
}
