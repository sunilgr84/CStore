import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { StoreFuelGrade } from 'src/app/layout/models/store-fuel-grade.model';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { NgbModal, ModalDismissReasons, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { FormMode } from 'src/app/layout/models/form-mode.enum';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { FuelGradeComponent } from 'src/app/layout/admin/company/fuel-grade/fuel-grade.component';
import { UtilityService } from '@shared/services/utility/utility.service';
import { BlendDetailCellRenderer } from '@shared/component/expandable-grid/partials/blend-details-renderer.component';
import { ConfirmationDialogService } from '@shared/component/confirmation-dialog/confirmation-dialog.service';
import * as _ from 'lodash';
import { TankDetailCellRenderer } from '@shared/component/expandable-grid/partials/tank-details-renderer.component';

@Component({
  selector: 'app-store-fuel-grade-detail',
  templateUrl: './store-fuel-grade-detail.component.html',
  styleUrls: ['./store-fuel-grade-detail.component.scss']
})
export class StoreFuelGradeDetailComponent implements OnInit {
  private _storeFuelGrade: StoreFuelGrade;
  submitted: boolean;
  modalOption: NgbModalOptions = {};
  blendedDropdwonList: any;
  isEditGradeInfo: boolean;
  selectedGrade: any;
  detailCellRenderer: any;
  tankDetailCellRenderer: any;
  filterText: any;
  gridApi: any;
  filterTextTankDetail: any;
  @Input() set storeFuelGrade(storeFuelGradeInternal: StoreFuelGrade) {
    this._storeFuelGrade = storeFuelGradeInternal;
    this.loadFormDetails();
  }
  get storeFuelGrade(): StoreFuelGrade {
    return this._storeFuelGrade;
  }

  fuelGradeList: any;
  @Input() storeLocationId: number;
  @Input() formMode: FormMode;
  @Output() closeForm = new EventEmitter<boolean>();
  @ViewChild('fuelGradeSelects') fuelGradeSelect: any;
  fuelTaxList: any;
  userInfo = this.constants.getUserInfo();
  tankDetailsGridApi: any;
  tankDetailsColumnApi: any;
  tankDetailsGridOptions: any;
  tankDetailsRowData: any[];

  blendGridApi: any;
  blendColumnApi: any;
  blendGridOptions: any;
  blendRowData: any[];

  storeFuelGridOptions: any;
  storeFuelRowData: any[];
  tankTypeList: any;
  isStoreFuelGradeDetailCollapsed = false;
  isTankDetailCollapsed = true;
  isBlendDetailCollapsed = true;
  isFuelTaxLoading = true;
  isTankTypeLoading = true;
  departmentList: any;
  initialFuelTankFormValues: any;
  initialFuelGradeFormValues: any;
  storeFuelGradeList: any;
  isFuelGradeLoading = true;
  isStoreFuelDeptLoading = true;
  isTankFuelGradeLoading = true;
  sideContainer = 'side-container-close'
  storeFuelGradeDetailForm = this._fb.group({
    storeFuelGradeID: [0],
    departmentID: [''],
    storeFuelGradeNo: [''],
    storeLocationID: [0],
    naxProductCodeID: [null],
    departmentDescription: [''],
    tankDescription: [''],
    tankNo: [0],
    isBlend: [true],
    storeFuelGradeTaxIDs: [null],
    storeFuelGradeTaxID: [0],
    fuelTaxDescription: [''],
    fuelTaxRate: [0],
    isApplyPrice: [false],
    storeFuelGradeName: [''],
  });
  addBlendForm = this._fb.group({
    storeFuelGradeID: [''],
    primaryFuelGradeBlendID: [null],
    secondaryFuelGradeBlendID: [null],
    primaryFuelBlendPercentage: [''],
    secondaryFuelBlendPercentage: ['']
  });
  tankDetailForm = this._fb.group({
    storeTankID: [0],
    storeTankNo: [''],
    tankName: [''],
    tankVolume: [''],
    tankReOrderVolume: [''],
    tankUllage: [''],
    currentTankVolume: [''],
    tankNotes: [''],
    storeFuelGradeID: [''],
    tankTypeId: [''],
  });
  editStoreTank: boolean = false;
  constructor(private _fb: FormBuilder, private constants: ConstantService,
    private _setupService: SetupService, private _modal: NgbModal, private gridService: GridService,
    private spinner: NgxSpinnerService, private _toastr: ToastrService,
    private utilityService: UtilityService, private confirmationDialogService: ConfirmationDialogService) {
    this.tankDetailsGridOptions = this.gridService.getGridOption(this.constants.gridTypes.fuelGradeTankGrid);
    this.blendGridOptions = this.gridService.getGridOption(this.constants.gridTypes.fuelGradeBlendDetailsGrid);
    this.storeFuelGridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeFuelGrid);
    this.initialFuelTankFormValues = this.tankDetailForm.value;
    this.initialFuelGradeFormValues = this.storeFuelGradeDetailForm.value;
    this.detailCellRenderer = BlendDetailCellRenderer;
    this.tankDetailCellRenderer = TankDetailCellRenderer;
  }

  ngOnInit() {
    this.fetchBlendDetails();
    this.getFuelTaxByStoreLocationID();
    this.fetchTankDetails();
    this.fetchFuelGradeList();
    this.fetchDepartmentList();
    this.getTankType();
    this.fetchStoreFuelGradeMapping();
    this.getBlendedDropdown(this.storeLocationId);
  }

  onAddFuelGrade() {
    this.isEditGradeInfo = false;
    this.storeFuelGradeDetailForm.reset();
    this.openSideContainer();
  }

  openSideContainer() {
    document.getElementById("overlay").style.display = "block";
    document.getElementsByTagName("body")[0].style.overflowY = 'hidden';
    this.sideContainer = 'side-container-open';
  }
  closeSideContainer() {
    document.getElementById("overlay").style.display = "none";
    document.getElementsByTagName("body")[0].style.overflowY = 'auto';
    this.sideContainer = 'side-container-close';
  }
  loadFormDetails() {
    if (this._storeFuelGrade) {
      this.fetchTankDetails();
      this.fetchBlendDetails();
      this.storeFuelGradeDetailForm.patchValue(this._storeFuelGrade);
    }
  }
  get storeFuelGradeDetails() { return this.storeFuelGradeDetailForm.controls; }

  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  onTankDetailsGridReady(params) {
    this.tankDetailsGridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  onFilterTextBoxChangedTankDetail() {
    this.tankDetailsGridApi.setQuickFilter(this.filterTextTankDetail);

  }
  onTankDetailCellValueChanged(params) {
    console.log(params);
  }

  addTankDetails(content) {
    this.editStoreTank = false;
    this.tankDetailForm.reset();
    this._modal.open(content, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }
  getFuelTaxByStoreLocationID() {
    this._setupService.getData(`FuelTax/GetFuelTaxByStoreLocationID/${this.storeLocationId}`).
      subscribe((response) => {
        this.fuelTaxList = response;
        this.isFuelTaxLoading = false;
      });
  }
  fetchStoreFuelGradeMapping() {
    const aarray = [];
    this._setupService.getData(`StoreFuelGrade/list/${this.storeLocationId}`).subscribe((data: StoreFuelGrade[]) => {
      // if (data && data[0]) {
      //   this.addBlendForm.controls.storeFuelGradeID.setValue(data[0].storeFuelGradeID);
      // }
      const result = _.chain(data).groupBy('storeFuelGradeNo').map((v, i) => {
        return {
          storeFuelGradeNo: i,
          departmentDescription: _.get(_.find(v, 'departmentDescription'), 'departmentDescription'),
          storeFuelGradeTaxIDs: _.get(_.find(v, 'lstFuelTax'), 'lstFuelTax'), /// _.map(v, 'storeFuelGradeTaxID'),
          departmentID: v[0]['departmentID'],
          fuelTaxDescription: _.get(_.find(v, 'fuelTaxDescription'), 'fuelTaxDescription'), // v[0]['fuelTaxDescription'],
          fuelTaxRate: _.get(_.find(v, 'fuelTaxRate'), 'fuelTaxRate'),
          isApplyPrice: v[0]['isApplyPrice'],
          isBlend: v[0]['isBlend'],
          naxProductCodeID: v[0]['naxProductCodeID'],
          storeFuelGradeID: _.get(_.find(v, 'storeFuelGradeID'), 'storeFuelGradeID'),
          storeFuelGradeName: _.get(_.find(v, 'storeFuelGradeName'), 'storeFuelGradeName'),
          storeFuelGradeTaxID: _.get(_.find(v, 'storeFuelGradeTaxID'), 'storeFuelGradeTaxID'),
          storeLocationID: v[0]['storeLocationID'],
          tankDescription: _.get(_.find(v, 'tankDescription'), 'tankDescription'),
          tankNo: v[0]['tankNo'],
          taxDescription: v[0]['fuelTaxDetails'].map(x => x.description).join(',')
        };
      }).value();
      this.storeFuelRowData = this.storeFuelGradeList = result;
      this.isTankFuelGradeLoading = false;
    }, (error) => {
      console.log('StoreFuelGrade Main list', 'no data found');
    });
  }
  resetFuelGrade() {
    if (!this.isEditGradeInfo) {
      this.storeFuelGradeDetailForm.patchValue(this.initialFuelGradeFormValues);
      this.addBlendForm.reset();
    }
    this.selectedGrade = null;
    this.fetchStoreFuelGradeMapping();
  }
  resetStoreTank() {
    this.tankDetailForm.patchValue(this.initialFuelTankFormValues);
  }

  saveFuelGrade() {
    let fuelTaxList = this.getFuelTaxObjList(this.storeFuelGradeDetailForm.value.storeFuelGradeTaxIDs);
    if (fuelTaxList.length == 0) {
      return;
    }
    const postData = {
      storeLocationID: this.storeLocationId,
      storeFuelGradeNo: this.storeFuelGradeDetailForm.value.storeFuelGradeNo,
      departmentID: this.storeFuelGradeDetailForm.value.departmentID,
      naxProductCodeID: this.storeFuelGradeDetailForm.value.naxProductCodeID,
      storeFuelGradeName: this.storeFuelGradeDetailForm.value.storeFuelGradeName,
      storeFuelGradeID: (this.storeFuelGradeDetailForm.value.storeFuelGradeID ? this.storeFuelGradeDetailForm.value.storeFuelGradeID : 0),
      // isBlend: (this.storeFuelGradeDetailForm.value.isBlend ? this.storeFuelGradeDetailForm.value.isBlend : false),
      // tankNo: (this.storeFuelGradeDetailForm.value.tankNo ? this.storeFuelGradeDetailForm.value.tankNo : 0),
      // storeFuelGradeTaxID: (this.storeFuelGradeDetailForm.value.storeFuelGradeTaxID ? this.storeFuelGradeDetailForm.value.storeFuelGradeTaxID : 0),
      // isApplyPrice: (this.storeFuelGradeDetailForm.value.isApplyPrice ? this.storeFuelGradeDetailForm.value.isApplyPrice : false),
      lstFuelTax: fuelTaxList
    };
    if (this.storeFuelGradeDetailForm.valid) {
      this.spinner.show();
      this._setupService.postData('StoreFuelGrade', postData).subscribe(response => {
        this.spinner.hide();
        if (response && response.statusCode === 400) {
          let errorMessage = '';
          if (response.result.validationErrors) {
            response.result.validationErrors.forEach(vError => {
              errorMessage += vError.errorMessage;
            });
            this._toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
            return;
          }
        }
        if (response && response[0] && response[0].storeFuelGradeID) {
          this.storeFuelGradeDetailForm.get('storeFuelGradeID').setValue(response[0].storeFuelGradeID);
          this._toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
          this.getBlendedDropdown(this.storeLocationId);
          this.isEditGradeInfo = true;
          this.resetFuelGrade();
        } else {
          this._toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
        }

      }, err => {
        console.log(err);
        this.spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
        } else {
          this._toastr.error(this.constants.infoMessages.contactAdmin);
        }
      });
    }
  }
  AddNewFuelGrade() {
    if (this.fuelGradeSelect && this.fuelGradeSelect.filterInput && this.fuelGradeSelect.filterInput.nativeElement) {
      this.fuelGradeSelect.filterInput.nativeElement.focus();
    }
  }
  // edit Fule Grade grid
  editAction(params) {
    if (this.fuelGradeSelect && this.fuelGradeSelect.filterInput && this.fuelGradeSelect.filterInput.nativeElement) {
      this.fuelGradeSelect.filterInput.nativeElement.focus();
    }
    this.storeFuelGradeDetailForm.reset();
    params.data.storeFuelGradeTaxIDs = params.data.taxDescription.split(',');
    this.storeFuelGradeDetailForm.patchValue(params.data);
    this.addBlendForm.reset();
    this.getStoreFuelGradeBlend(params.data.storeFuelGradeID);
    this.isEditGradeInfo = true;
    this.isStoreFuelGradeDetailCollapsed = true;
  }

  deleteAction(params) {
    this.spinner.show();
    this._setupService.deleteData(`StoreFuelGrade/${params.data.storeFuelGradeID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '0') {
        this._toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else if (result === '1') {
        this._toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
      }
      this.fetchStoreFuelGradeMapping();
    }, error => {
      this.spinner.hide();
      this._toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  editTankDetailsAction(params, contentTankDetails) {
    this.editStoreTank = true;
    this.tankDetailForm.patchValue(params.data);
    this._modal.open(contentTankDetails, { size: 'lg' }).result.then((result) => {
      console.log(`Closed with: ${result}`);
    }, (reason) => {
      console.log(`Dismissed ${this.getDismissReason(reason)}`);
    });
  }

  deleteTankDetailsAction(params) {
    this.spinner.show();
    this._setupService.deleteData(`StoreTank/${params.data.storeTankID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '0') {
        this._toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      } else if (result === '1') {
        this._toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.delete);
      }
      this.fetchTankDetails();
    }, error => {
      this.spinner.hide();
      this._toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }

  getStoreFuelGradeBlend(storeFuelGradeID: any): any {
    this._setupService.getData(`StoreFuelGradeBlend/get/` + storeFuelGradeID)
      .subscribe(res => {
        if (res) {
          this.addBlendForm.patchValue(res);
          this.openSideContainer();
        }
      });
  }
  getFuelTaxObjList(fuelTaxIds) {
    let fuelTaxList = [];
    if (fuelTaxIds) {
      fuelTaxIds.forEach(fuelTax => {
        let obj = { "fuelTaxId": fuelTax.fuelTaxId }
        fuelTaxList.push(obj);
      });
    }
    return fuelTaxList;
  }
  updateFuelGrade() {
    let fuelTaxList = this.getFuelTaxObjList(this.storeFuelGradeDetailForm.value.storeFuelGradeTaxIDs);
    if (fuelTaxList.length == 0) {
      return;
    }
    const postData = {
      storeFuelGradeID: this.storeFuelGradeDetailForm.value.storeFuelGradeID,
      fuelGradeID: this.storeFuelGradeDetailForm.value.fuelGradeID,
      departmentID: this.storeFuelGradeDetailForm.value.departmentID,
      storeFuelGradeNo: this.storeFuelGradeDetailForm.value.storeFuelGradeNo,
      naxProductCodeID: this.storeFuelGradeDetailForm.value.naxProductCodeID,
      storeFuelGradeName: this.storeFuelGradeDetailForm.value.storeFuelGradeName,
      storeLocationID: this.storeLocationId,
      lstFuelTax: fuelTaxList
    };
    if (this.storeFuelGradeDetailForm.valid) {
      this.spinner.show();
      this._setupService.updateData('StoreFuelGrade', postData).subscribe(response => {
        this.spinner.hide();
        if (response) {
          this._toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
          this.getBlendedDropdown(this.storeLocationId);
          this.resetFuelGrade();
        } else {
          this._toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
        }
      }, err => {
        console.log(err);
        this.spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._toastr.error(errorMessage, this.constants.infoMessages.updateRecordFailed);
        } else {
          this._toastr.error(this.constants.infoMessages.contactAdmin);
        }
      });
    }
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
  fetchDepartmentList() {
    this._setupService.getData(`Department/getFuelDepartments/${this.userInfo.companyId}/${this.storeLocationId}`).subscribe(result => {
      this.departmentList = result;
      this.isStoreFuelDeptLoading = false;
    });
  }
  fetchTankDetails() {
    this.spinner.show();
    this._setupService.getData(`StoreTank/GetStoreTankByStoreLocationID/${this.storeLocationId}`)
      .subscribe(respose => {
        this.spinner.hide();
        this.tankDetailsRowData = [];
        this.utilityService._storeFuelGradeList = [];
        if (respose && respose.length > 0) {
          const arr = this.utilityService.sliceArray(respose);
          this.utilityService._storeFuelGradeList = this.tankDetailsRowData = arr;
        }
        this.isTankFuelGradeLoading = false;
      });
  }

  fetchBlendDetails() {
    this._setupService.getData('StoreFuelGradeBlend/list')
      .subscribe(res => {
        this.blendRowData = res;
      });
  }
  fetchFuelGradeList() {
    this._setupService.getData(`StoreFuelGrade/GetAllFProducts`)
      .subscribe(res => {
        this.fuelGradeList = res;
        this.isFuelGradeLoading = false;
      });
  }

  getTankType() {
    this._setupService.getData('TankType/list').subscribe(res => {
      this.tankTypeList = res;
      this.isTankTypeLoading = false;
    });
  }
  onCellChanged(params) {
    if (params.column.colId === 'connectedStoreTankID' && params.data.connectedStoreTankID && params.value !== ''
      && params.value && params.data.tankTypeName === 'Manifold') {
      this.confirmationDialogService.confirm(this.constants.infoMessages.confirmTitle,
        'Are you sure you want to connect tank')
        .then(() => {
          //  console.log(params);
          let connectedTank = [];
          connectedTank = params.value.split(',');
          const fArray = this.tankDetailsRowData.filter(
            book => book.storeTankNo === Number(connectedTank[0]));
          const postData = {
            ...params.data,
            connectedStoreTankID: fArray[0].storeTankID
          };
          this.spinner.show();
          this._setupService.updateData('StoreTank/Update', postData).subscribe(res => {
            if (res) {
              // const ar = fArray[0] && this.tankDetailsGridApi ? this.tankDetailsGridApi.updateRowData({ remove: [fArray[0]] }) : '';
              // this.getTankDetailsRowData();
              this.fetchTankDetails();
              this.spinner.hide();
              this._toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            } else {
              this._toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            }
          }, err => {
            console.log(err);
            this.spinner.hide();
            let errorMessage = '';
            if (err.error.validationErrors) {
              err.error.validationErrors.forEach(vError => {
                errorMessage += vError.errorMessage;
              });
              this._toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
            } else {
              this._toastr.error(this.constants.infoMessages.contactAdmin);
            }
          });
          console.log(postData);
        }).catch(() => console.log('User dismissed the dialog'));

    }
  }
  getTankDetailsRowData() {
    const rowData = [];
    this.tankDetailsGridApi.forEachNode(function (node) {
      rowData.push(node.data);
    });
    this.utilityService._storeFuelGradeList = this.tankDetailsRowData = rowData;
  }
  saveFuelTank() {
    let postData = {
      ...this.tankDetailForm.value,
      storeLocationID: this.storeLocationId,
    };
    if (!this.editStoreTank)
      postData.storeTankID = 0;
    if (this.tankDetailForm.valid) {
      this.spinner.show();
      this._setupService.updateData('StoreTank/Update', postData).subscribe(res => {
        this.spinner.hide();
        if (res == 1) {
          this.resetStoreTank();
          this.fetchTankDetails();
          this._toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
        } else {
          this._toastr.error(this.constants.infoMessages.contactAdmin);
        }
        this._modal.dismissAll();
      }, err => {
        console.log(err);
        this.spinner.hide();
        let errorMessage = '';
        if (err.error.validationErrors) {
          err.error.validationErrors.forEach(vError => {
            errorMessage += vError.errorMessage;
          });
          this._toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
        } else {
          this._toastr.error(this.constants.infoMessages.contactAdmin);
        }
      });
    }
  }

  resetFuelTankDetails() {
    this.tankDetailForm.patchValue(this.initialFuelTankFormValues);
  }
  // addFuelGrade by Company Id
  addFuelGrade() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    const modalRef = this._modal.open(FuelGradeComponent, this.modalOption);
    modalRef.componentInstance.passEntry.subscribe((receivedEntry) => {
      this.fuelGradeList = receivedEntry;
    });
  }
  saveBlend() {
    if (this.storeFuelGradeDetailForm.value.storeFuelGradeID) {
      this.addBlendForm.get('storeFuelGradeID').setValue(this.storeFuelGradeDetailForm.value.storeFuelGradeID);
      this.spinner.show();
      this._setupService.updateData('StoreFuelGradeBlend', this.addBlendForm.value).subscribe(
        (response) => {
          this.spinner.hide();
          this._toastr.success('Blend details save successfuly...');
        }, (err) => {
          console.log(err);
          this.spinner.hide();
          let errorMessage = '';
          if (err.error.validationErrors) {
            err.error.validationErrors.forEach(vError => {
              errorMessage += vError.errorMessage;
            });
            this._toastr.error(errorMessage, this.constants.infoMessages.addRecordFailed);
          } else {
            this._toastr.error(this.constants.infoMessages.contactAdmin);
          }
        });
    } else {
      this._toastr.error('Store Fuel Grade ID Not Found...!');
    }
  }
  getBlendedDropdown(storeLocationID) {
    this._setupService.getData(`StoreFuelGrade/list/${storeLocationID}`).subscribe(
      (response) => {
        if (response) {
          this.blendedDropdwonList = response;
          this.addBlendForm.controls.storeFuelGradeID.setValue(this.blendedDropdwonList[0]
            && this.blendedDropdwonList[0].storeFuelGradeID);
        }
      });
  }

  calculatePercentage(controlName) {
    if (controlName === 'primaryFuelBlendPercentage') {
      if (Number(this.addBlendForm.controls.primaryFuelBlendPercentage.value) > 100) {
        this.addBlendForm.controls.primaryFuelBlendPercentage.setValue(0);
      }
      this.addBlendForm.controls.secondaryFuelBlendPercentage.setValue(100 -
        Number(this.addBlendForm.controls.primaryFuelBlendPercentage.value));
    } else {
      if (Number(this.addBlendForm.controls.secondaryFuelBlendPercentage.value) > 100) {
        this.addBlendForm.controls.secondaryFuelBlendPercentage.setValue(0);
      }
      this.addBlendForm.controls.primaryFuelBlendPercentage.setValue(100 -
        Number(this.addBlendForm.controls.secondaryFuelBlendPercentage.value));
    }
  }

  onFuelChange(event) {
    this.selectedGrade = null;
    this.selectedGrade = event;
  }
}
