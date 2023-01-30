import { Component, OnInit, ViewChild } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';

@Component({
  selector: 'app-brand',
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss'],
  animations: [routerTransition()]
})
export class BrandComponent implements OnInit {
  filterText: '';
  @ViewChild('manufacturerId') _manufacturer: any;
  gridOptions: any;
  isBrandCollapsed = false;
  isEdit = false;
  manufacturerList: any;
  submitted = false;
  gridApi: GridApi;
  columnApi: ColumnApi;
  isLoading = true;
  brandForm = this.fb.group({
    brandID: [0],
    brandName: ['', Validators.required],
    manufacturerID: ['', Validators.required],
    manufacturerName: ['']
  });
  brandList: any;
  tempId: any;
  newRowAdded: any;
  showForm = false;

  constructor(private paginationGridService: PaginationGridService, private constant: ConstantService, private fb: FormBuilder,
    private toastr: ToastrService, private _setupService: SetupService, private spinner: NgxSpinnerService) {
    this.gridOptions = this.paginationGridService.getGridOption(this.constant.gridTypes.masterBrandGrid);
  }

  ngOnInit() {
    this.getBrandList();
    this.getManufacturerNameList();
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

  onSearchTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
    if (this.gridApi.getDisplayedRowCount() === 0) {
      this.gridApi.showNoRowsOverlay();
    } else {
      this.gridApi.hideOverlay();
    }
  }

  get brandFormControls() { return this.brandForm.controls; }

  addNew() {
    this.showForm = true;
    this.brandForm.get('brandName').disable();
    this.isEdit = false;
    this.submitted = false;
    this.brandForm.patchValue({
      brandID: 0,
      brandName: '',
      manufacturerID: '',
    });
  }

  onClearAddBrand() {
    this.showForm = false;
    this.isEdit = false;
    this.submitted = false;
    this.brandForm.reset({
      brandID: 0,
      brandName: '',
      manufacturerID: '',
    });
    this.gridApi.refreshCells({ force: true });
  }

  onManufacturerChange() {
    if (this.brandForm.value.manufacturerID === '') {
      this.brandForm.get('brandName').reset();
      this.brandForm.get('brandName').disable();
    } else {
      this.brandForm.get('brandName').enable();
    }
  }

  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }

  delete(param) {
    if (param.data.brandID === 0) {
      this.newRowAdded = false;
      this.gridApi.updateRowData({ remove: [param.data] });
      return;
    }
    if (param.data.brandID > 0) {
      this.spinner.show();
      this._setupService.deleteData(`MasterBrand/${param.data.brandID}`).subscribe(result => {
        this.spinner.hide();
        if (result === '0') {
          this.toastr.error(this.constant.infoMessages.deleteRecordFailed, this.constant.infoMessages.error);
        } else if (result === '1') {
          this.newRowAdded = false;
          this.toastr.success(this.constant.infoMessages.deletedRecord, this.constant.infoMessages.delete);
        }
        this.getBrandList();
      }, error => {
        this.spinner.hide();
        this.toastr.error(this.constant.infoMessages.contactAdmin);
      });
    } else {
      this.gridApi.updateRowData({
        remove: [param.data]
      });
      this.newRowAdded = false;
    }
  }

  updateBrand(params) {
    this.gridApi.refreshCells({ force: true });
    params.hideDeleteAction = true;
    this.brandForm.get('brandName').reset();
    this.brandForm.get('brandName').enable();
    this.showForm = true;
    this.isEdit = true;
    this.brandForm.patchValue({
      brandID: params.data.brandID,
      brandName: params.data.brandName,
      manufacturerID: params.data.manufacturerID
    });
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  saveOrUpdateBrand() {
    this.submitted = true;
    if (this.brandForm.valid) {
      if (this.brandForm.value.manufacturerID === '' || this.brandForm.value.manufacturerID === null) {
        this.toastr.error('Manufacturer Name is required..', this.constant.infoMessages.error);
        return;
      }
      if (this.brandForm.value.brandName === '' || this.brandForm.value.brandName === null) {
        this.toastr.error('Brand Name is required..', this.constant.infoMessages.error);
        return;
      }
      if (this.brandForm.value.brandID !== 0) {
        this.spinner.show();
        this._setupService.updateData(`MasterBrand`, this.brandForm.value).subscribe(result => {
          this.spinner.hide();
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toastr.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result === '1') {
            this.showForm = false;
            this.isEdit = false;
            this.toastr.success(this.constant.infoMessages.updatedRecord, this.constant.infoMessages.success);
            this.getBrandList();
          } else {
            this.toastr.error(this.constant.infoMessages.updateRecordFailed, this.constant.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constant.infoMessages.contactAdmin);
        });
      } else {
        const brandValue = this.brandList.filter(data => {
          return (this.lowerCase(data.brandName) === this.lowerCase(this.brandForm.value.brandName));
        });
        if (brandValue && brandValue[0]) {
          this.toastr.error('Brand Name Already Exists..', this.constant.infoMessages.error);
          return;
        }
        this.spinner.show();
        this._setupService.postData(`MasterBrand`, this.brandForm.value).subscribe(result => {
          this.spinner.hide();
          if (result && result.statusCode === 400) {
            if (result && result.result && result.result.validationErrors[0]) {
              this.toastr.error(result.result.validationErrors[0].errorMessage);
            }
            return 0;
          }
          if (result && result.brandID > 0) {
            this.showForm = false;
            this.isEdit = false;
            this.toastr.success(this.constant.infoMessages.addedRecord, this.constant.infoMessages.success);
            this.getBrandList();
          } else {
            this.toastr.error(this.constant.infoMessages.addRecordFailed, this.constant.infoMessages.error);
          }
        }, error => {
          this.spinner.hide();
          this.toastr.error(this.constant.infoMessages.contactAdmin);
        });
      }
    }
  }

  lowerCase(title: string) {
    return title.toLocaleLowerCase();
  }

  getBrandList() {
    this.spinner.show();
    this._setupService.getData(`MasterBrand/list`).subscribe(result => {
      this.spinner.hide();
      if (result && result['statusCode']) {
        this.gridApi.setRowData([]);
        this.brandList = [];
        return;
      }
      this.gridApi.setRowData(result);
      this.brandList = result;
    }, (error) => { this.spinner.hide(); });
  }
  getManufacturerNameList() {
    this._setupService.getData(`Manufacturer/getAll`).subscribe(result => {
      this.isLoading = false;
      if (result && result['statusCode']) {
        // this.commonService.manufacturerList = [];
        this.manufacturerList = [];
        return;
      }
      this.manufacturerList = result;
      // this.commonService.manufacturerList = result;
    });
  }

  // GetDropDownManufacturer() {
  //   const array = this.commonService.manufacturerList;
  //   const finalArray = [''];
  //   if (array) {
  //     array.forEach(x => {
  //       const contct = x.manufacturerName; //  x.companyPriceGroupID + ',' +
  //       finalArray.push(contct);
  //     });
  //   }
  //   return finalArray;
  // }
}
