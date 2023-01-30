import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { StoreFuelGradeTax } from '../../../models/store-fuel-grade-tax.model';
import { ToastrService } from 'ngx-toastr';
import { StoreFuelGrade } from 'src/app/layout/models/store-fuel-grade.model';
import { FuelGrade } from 'src/app/layout/models/fuel-grade.model';
import { FormMode } from 'src/app/layout/models/form-mode.enum';
import { ConfirmationDialogService } from 'src/app/shared/component/confirmation-dialog/confirmation-dialog.service';
import { SetupService } from '@shared/services/setupService/setup-service';


@Component({
  selector: 'app-store-fuel-grade-tax',
  templateUrl: './store-fuel-grade-tax.component.html',
  styleUrls: ['./store-fuel-grade-tax.component.scss']
})
export class StoreFuelGradeTaxComponent implements OnInit {

  @Input() storeFuelGrade: StoreFuelGrade;
  @Input() fuelGradeList: FuelGrade[];
  isStorefuelGradeTaxCollapsed: any;
  formMode: FormMode = FormMode.ADD;

  selectedStoreFuelGradeTax: StoreFuelGradeTax = null;
  newFuelGradeTaxes = false;
  gridApi: any;
  columnApi: any;

  gridOptions: any;

  rowData: any;

  showLocation = false;
  storeFuelGradeTaxForm = this._fb.group({
    fuelTaxDescription: ['', [Validators.required]],
    fuelGradeID: ['', [Validators.required]],
    fuelTaxRate: ['', [Validators.required]],
    isApplyPrice: [false],
  });

  constructor(
    private _fb: FormBuilder, private gridService: GridService,
    private constants: ConstantService, private _dataService: SetupService,
    private _tstr: ToastrService, private constantsService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.storeFuelGradeTaxesGrid);
  }

  ngOnInit() {
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.columnApi = params.columnApi;
  }

  displayFormTitle(): string {
    if (this.formMode === FormMode.ADD) {
      return 'Add New Fuel Tax';
    } else if (this.formMode === FormMode.EDIT) {
      return `Editing Store Fuel Tax - ${this.selectedStoreFuelGradeTax.fuelTaxDescription}`;
    }
  }


  addFuelGradeTaxes(show: boolean) {
    this.formMode = FormMode.ADD;
    this.selectedStoreFuelGradeTax = null;
    this.storeFuelGradeTaxForm.reset();
    this.newFuelGradeTaxes = show;
  }

  fetchStoreFuelGradeTaxes() {
    this._dataService.getData(`StoreFuelGradeTax/list/${this.storeFuelGrade.storeFuelGradeID}`).subscribe((data: StoreFuelGradeTax[]) => {
      this.rowData = data;
    });
  }

  save(andClose?: boolean) {

    if (this.formMode === FormMode.ADD) {
      this.store();
    } else if (this.formMode === FormMode.EDIT) {
      this.update();
    }
    if (andClose) {
      this.newFuelGradeTaxes = false;
    }
  }
  store() {
    this._dataService.updateData(
      `StoreFuelGradeTax`, <StoreFuelGradeTax>this.storeFuelGradeTaxForm.value).subscribe((data) => {
        this._tstr.success(data);
        this.storeFuelGradeTaxForm.reset();
      }, err => {
        this._tstr.error(err);
      });
  }

  update() {
    // tslint:disable-next-line:max-line-length
    this._dataService.updateData(`StoreFuelGradeTax/update/${this.storeFuelGradeTaxForm.get('fuelTaxDescription').value}/${this.storeFuelGradeTaxForm.get('fuelTaxRate').value}/${this.selectedStoreFuelGradeTax.storeFuelGradeID}/${this.selectedStoreFuelGradeTax.storeLocationID}/${this.selectedStoreFuelGradeTax.storeFuelGradeNo}`
      , {}).subscribe((data) => {
        this._tstr.success(data);
      }, err => {
        this._tstr.error(err);
      });
  }
  edit(params) {
    this.selectedStoreFuelGradeTax = params.data;
    this.formMode = FormMode.EDIT;
    this.storeFuelGradeTaxForm.patchValue(params.data);
    this.newFuelGradeTaxes = true;
  }
  delete(params) {
    this._dataService.deleteData(`StoreFuelGradeTax/${params.data.storeFuelGradeTaxID}`).subscribe((data) => {
      if (data) {
        this.gridApi.updateRowData({ remove: [params.data] });
        this._tstr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
      } else {
        this._tstr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
      }
      console.log(data);
    });
  }



}
