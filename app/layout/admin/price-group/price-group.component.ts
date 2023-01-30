import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { FormBuilder, Validators } from '@angular/forms';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { UtilityService } from '@shared/services/utility/utility.service';
import { F } from '@angular/cdk/keycodes';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';

@Component({
  selector: 'app-price-group',
  templateUrl: './price-group.component.html',
  styleUrls: ['./price-group.component.scss'],
  animations: [routerTransition()]
})
export class PriceGroupComponent implements OnInit {

  title = 'Price Group Details';
  gridOptions: any;
  columnDefs: any;
  rowData: any;
  isEdit = false;
  showForm = false;
  manufacturerList: any;
  brandList: any;
  gridApi: GridApi;
  columnApi: ColumnApi;
  gridApi1: GridApi;
  columnApi1: ColumnApi;
  submitted = false;
  isManufacturerLoading = true;
  isBrandLoading: boolean;
  filterText: string;
  filterText1: string;
  masterPriceGroupID: any = 0
  userInfo = this.constantService.getUserInfo();
  priceGroupForm = this._fb.group({
    masterManufacturerID: ['', Validators.required],
    brandID: ['', Validators.required],
    masterGroupName: ['', Validators.required],
    masterPriceGroupID: [0],
    createdBy: [''],
    createdDateTime: [''],
    lastModifiedBy: [''],
    lastModifiedDateTime: [''],
    isDefault: [false]
  });
  initialFormValues: any;
  masterPiceGroupList: any;
  gridOptions1: any;

  constructor(private gridService: GridService, private paginationGridService: PaginationGridService, private constants: ConstantService, private _setupService: SetupService,
    private _fb: FormBuilder, private toastr: ToastrService, private spinner: NgxSpinnerService, private utilityService: UtilityService,
    private constantService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.priceGroupGrid);
    this.gridOptions1 = this.paginationGridService.getGridOption(this.constants.gridTypes.priceGroupMasterAllItemGrid);
    this.initialFormValues = this.priceGroupForm.value;
  }

  ngOnInit() {
    this.getPriceGroupList();
    this.getManufacturerList();
  }
  onSearchTextBoxChanged(value) {
    this.gridApi1.setQuickFilter(value);
  }
  editAction(params) {
    this.reset();
    params.hideDeleteAction = true;
    this.isEdit = true;
    this.showForm = true;
    this.priceGroupForm.patchValue(params.data);
    if (this.priceGroupForm.value.masterManufacturerID === '' || this.priceGroupForm.value.masterManufacturerID === 0) {
      this.priceGroupForm.get('brandID').reset();
      this.priceGroupForm.get('brandID').disable();
      this.priceGroupForm.get('masterManufacturerID').setValue("");
      this.priceGroupForm.get('brandID').setValue("");
    } else {
      this.priceGroupForm.get('brandID').enable();
      this.getBrandListByManufactureID();
    }
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
  deleteAction(params) {
    this.spinner.show();
    this._setupService.deleteData(`MasterPriceGroup/${params.data.masterPriceGroupID}`).subscribe(result => {
      this.spinner.hide();
      if (result === '1') {
        this.getPriceGroupList();
        this.toastr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this.toastr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, error => {
      this.spinner.hide();
      this.toastr.error(this.constants.infoMessages.contactAdmin);
    });
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  onGridReady1(params) {
    params.api.sizeColumnsToFit();
    this.gridApi1 = params.api;
    this.columnApi1 = params.columnApi;
  }

  addNewPriceGroup() {
    this.showForm = true;
    this.priceGroupForm.get('brandID').disable();
    this.isEdit = false;
    this.submitted = false;
    this.priceGroupForm.reset({
      masterManufacturerID: '',
      brandID: '',
      masterGroupName: '',
      masterPriceGroupID: 0,
      createdBy: '',
      createdDateTime: '',
      lastModifiedBy: '',
      lastModifiedDateTime: '',
      isDefault: false
    });
  }

  reset() {
    //  this.priceGroupForm.patchValue(this.initialFormValues);
    this.priceGroupForm.reset();
    this.isEdit = false;
    this.submitted = false;
    this.showForm = false;
    this.gridApi.refreshCells({ force: true });
  }
  getPriceGroupList() {
    this._setupService.getData(`MasterPriceGroup/list`).subscribe(result => {
      if (result && result['statusCode']) {
        this.rowData = this.masterPiceGroupList = [];
        this.gridApi.setRowData([]);
        return;
      }
      this.rowData = result;
      this.gridApi.setRowData(result);
      this.masterPiceGroupList = result;
    });
  }
  getManufacturerList() {
    this._setupService.getData('Manufacturer/getAll').subscribe(result => {
      this.isManufacturerLoading = false;
      if (result && result['statusCode']) {
        this.manufacturerList = [];
        return;
      }
      this.manufacturerList = result;
    });
  }
  getBrandListByManufactureID() {
    this.isBrandLoading = true;
    this._setupService.getData('MasterBrand/findByManufacturerID/' + this.priceGroupForm.get('masterManufacturerID').value).subscribe(result => {
      this.isBrandLoading = false;
      if (result && result['statusCode']) {
        this.brandList = [];
        return;
      }
      this.brandList = result;
    });
  }
  onManufacturerChanged() {
    this.priceGroupForm.controls['brandID'].setValue('');
    if (this.priceGroupForm.value.masterManufacturerID === '') {
      this.priceGroupForm.get('brandID').reset();
      this.priceGroupForm.get('brandID').disable();
    } else {
      this.priceGroupForm.get('brandID').enable();
      this.getBrandListByManufactureID();
    }
  }
  editOrSave() {
    var flag = false;
    flag = /^\d+$/.test(this.priceGroupForm.get("masterGroupName").value);

    if (!flag) {
      flag = /[a-zA-Z]/g.test(this.priceGroupForm.get("masterGroupName").value);
    }
    if (flag) {
      this.submitted = true;
      if (this.priceGroupForm.valid) {
        if (this.isEdit) {
          this.priceGroupForm.patchValue({ lastModifiedDateTime: new Date() });
          this.spinner.show();
          this._setupService.updateData(`MasterPriceGroup`, this.priceGroupForm.value).subscribe(result => {
            this.spinner.hide();
            if (result === '1') {
              this.reset();
              this.getPriceGroupList();
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
            } else {
              this.toastr.error(this.constants.infoMessages.alreadyExists, this.constants.infoMessages.error);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
        } else {

          const priceGroupValue = this.masterPiceGroupList.filter(data => {
            return (Number(data.masterManufacturerID) === Number(this.priceGroupForm.value.masterManufacturerID) &&
              // tslint:disable-next-line:max-line-length
              this.utilityService.lowerCase(data.masterGroupName) === this.utilityService.lowerCase(this.priceGroupForm.value.masterGroupName));
          });
          if (priceGroupValue[0]) {
            this.toastr.error(this.constants.infoMessages.alreadyExists, this.constants.infoMessages.error);
            return;
          }

          this.priceGroupForm.patchValue({ createdDateTime: new Date() });
          this.priceGroupForm.patchValue({ createdBy: this.userInfo.userName });
          this.spinner.show();
          console.log(this.priceGroupForm.value);
          this._setupService.postData('MasterPriceGroup', this.priceGroupForm.value).subscribe(result => {
            if (!result.statusCode) {
              this.spinner.hide();
              this.reset();
              this.getPriceGroupList();
              this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
            } else {
              this.spinner.hide();
              this.reset();
              this.getPriceGroupList();
              this.toastr.error(result.result.validationErrors[0].errorMessage, this.constants.infoMessages.error);
            }
          }, error => {
            this.spinner.hide();
            this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
          });
        }
      }
    }
    else {
      this.toastr.error("String must be alphanumeric", this.constants.infoMessages.error);
      return false;
    }
  }


  sideContainer: any = "side-container-close";
  openSideContainer(e) {
    this.spinner.show();
    this._setupService.getData('MasterPriceBookItem/GetBymasterpriceGroupID/' + e.data.masterPriceGroupID).subscribe((response) => {
      if (response) {
        this.masterPriceGroupID = e.data.masterPriceGroupID;
        this.gridApi1.setRowData(response);
        this.gridApi1.sizeColumnsToFit();
        document.getElementById("overlay").style.display = "block";
        this.sideContainer = 'side-container-open';
        this.spinner.hide();
        return;
      }
    }, (error) => {
      this.gridApi1.setRowData([]);
      this.gridApi1.sizeColumnsToFit();
      document.getElementById("overlay").style.display = "block";
      this.sideContainer = 'side-container-open';
      this.spinner.hide();
      console.log(error);
    });
  }

  closeSideContainer() {
    document.getElementById("overlay").style.display = "none";
    this.sideContainer = 'side-container-close';
    this.masterPriceGroupID = 0;
  }

  deleteByMasterPriceBookItemID(e) {
    this.spinner.show();
    this._setupService.deleteData("MasterPriceBookItem/DeleteByMasterPriceGroupID/" + this.masterPriceGroupID + "/" + e.data.masterPriceBookItemID).subscribe(result => {
      if (result == "1") {
        this.spinner.hide();
        this.refreshPopUpData(this.masterPriceGroupID);
      }
    }, error => {
      console.log(error);
      this.toastr.error("Please try again", this.constants.infoMessages.error);
      this.spinner.hide();
    });

  }

  refreshPopUpData(masterPriceGroupID) {
    this._setupService.getData('MasterPriceBookItem/GetBymasterpriceGroupID/' + masterPriceGroupID).subscribe((response) => {
      if (response) {
        this.gridApi1.setRowData(response);
        this.gridApi1.sizeColumnsToFit();
        this.toastr.success("Delete record successfully", this.constants.infoMessages.success);
      }
      this.spinner.hide();
    }, (error) => {
      console.log(error);
      this.spinner.hide();
    });
  }

}
