import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';
import { FormBuilder } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-mix-matches',
  templateUrl: './mix-matches.component.html',
  styleUrls: ['./mix-matches.component.scss']
})
export class MixMatchesComponent implements OnInit {
  gridApi: any;
  gridOptions: any;
  rowData: any[];
  showGrid = false;
  isEdit = false;
  mixMatchPromotionList = [];
  submitted = false;
  mixmathchForm = this._fb.group({
    mixMatchID: 0,
    companyID: 75,
    mixMatchPromotionUnitTypeID: '',
    mixMatchName: '',
    beginDate: new Date(),
    endDate: new Date(),
    trasactionLimit: 0,
    mixMatchValue: 0,
    mixMatchUnits: 0,
    lastModifiedBy: '',
    createdDateTime: new Date(),
    lastModifiedDateTime: new Date(),
    mixMatchPromotionUnitTypeName: '',
    mixMatchPromotionUnitTypeDescription: '',
    countMixMatchItem: 0
  });
  initialFormValues: any;
  constructor(private gridService: GridService, private constants: ConstantService, private dataService: SetupService,
    private _fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.mixMatchesGroupGrid);
    this.initialFormValues = this.mixmathchForm;
  }

  ngOnInit() {
    this.rowData = [
      { mixMatchName: 'Lance & Lays 2/$1', promotionType: 'MixMatchPrice', mixMatchItemCount: 25 },
      { mixMatchName: 'Lance & Lays 2/$1', promotionType: 'MixMatchPrice', mixMatchItemCount: 25 },
    ];
    this.getMixMatchPromotionUnitType();
  }
  editAction(params) {
    this.isEdit = true;
    this.showGrid = true;
    this.mixmathchForm.patchValue(params.data);
  }
  onGridReady(params) {
    this.gridApi = params.api;
  }
  getMixMatchPromotionUnitType() {
    this.dataService.getData('MixMatchPromotionUnitType/getAll', '').subscribe(
      (response) => {
        this.mixMatchPromotionList = response;
      }, (error) => {

      }
    );
  }

  editOrSaveClose(event) {
    this.editOrSave(event, () => { this.showGrid = false; });
  }

  editOrSave(_event, callBack = () => { }) {
    this.submitted = true;
    if (this.mixmathchForm.valid) {
      this.spinner.show();
      if (this.isEdit) {
        const postData = {
          ...this.mixmathchForm.value
        };
        this.dataService.updateData('MixMatch/update', postData).
          subscribe((response: any) => {
            if (response) {
              this.spinner.hide();
              this.toastr.success(this.constants.infoMessages.updatedRecord, this.constants.infoMessages.success);
              callBack();
            } else {
              this.spinner.hide();
              this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
            }
          }, (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constants.infoMessages.updateRecordFailed, this.constants.infoMessages.error);
          });
      } else {
        this.spinner.show();
        const postData = {
          ...this.mixmathchForm.value,
          companyID: 75,
        };
        this.dataService.postData('MixMatch/addNew', postData).
          subscribe((response) => {
            if (response && response.mixMatchID) {
              this.toastr.success(this.constants.infoMessages.addedRecord, this.constants.infoMessages.success);
              this.mixmathchForm.get('mixMatchID').setValue(response.paymentSourceID);
              this.isEdit = true;
              callBack();
            } else {
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            }
            this.spinner.hide();
          },
            (error) => {
              this.spinner.hide();
              console.log(error);
              this.toastr.error(this.constants.infoMessages.addRecordFailed, this.constants.infoMessages.error);
            });
      }
    }
  }
  backToList(isBack) {
    this.showGrid = isBack;
  }
}
