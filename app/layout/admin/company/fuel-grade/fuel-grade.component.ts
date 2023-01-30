import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { EditableGridService } from 'src/app/shared/services/editableGrid/editable-grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-fuel-grade',
  templateUrl: './fuel-grade.component.html',
  styleUrls: ['./fuel-grade.component.scss']
})
export class FuelGradeComponent implements OnInit {
  editGridOptions: any;
  rowData: any;
  private gridApi;
  newRowAdded = false;
  @Input() companyData?: any;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  @Output() passEntry: EventEmitter<any> = new EventEmitter();
  userInfo: any;
  // selectedCompanyID = 75; // TODO: Fetch current company
  constructor(private editableGrid: EditableGridService, private constantsService: ConstantService, private dataService: SetupService,
    private spinner: NgxSpinnerService, private toastr: ToastrService,
    public activeModal: NgbActiveModal) {
    this.editGridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.fuelGradeGrid);
  }
  onReady(params) {
    this.gridApi = params.api;
  }
  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    this.fetchfuelGrade();
  }
  fetchfuelGrade() {
    this.dataService.getData('FuelGrade/list/' + this.userInfo.companyId).subscribe((response) => {
      this.rowData = response;
    });
  }
  addRows() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    this.gridApi.updateRowData({
      add: [{
        fuelGradeID: 0, fuelGradeName: '', isSaveRequired: true
      }]
    });
    this.getStartEditingCell('fuelGradeName', this.rowData.length);
  }
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  editAction(params) {
    if (params.data.fuelGradeName === '') {
      this.toastr.warning('PLease enter fuel Grade..', this.constantsService.infoMessages.error);
      this.getStartEditingCell('fuelGradeName', params.rowIndex);
      return;
    }

    if (params.data.fuelGradeID === 0 && this.rowData) {
      if (this.rowData.filter(function (e) { return e.fuelGradeName === params.data.fuelGradeName; }).length > 0) {
        params.data.fuelGradeName = params.oldValue;
        this.toastr.error('This Value Already Exists..', this.constantsService.infoMessages.error);
        this.getStartEditingCell('fuelGradeName', params.rowIndex);
        return;
      }
      this.spinner.show();
      this.dataService.postData('FuelGrade',
        { companyID: this.userInfo.companyId, fuelGradeName: params.data.fuelGradeName }).
        subscribe((response) => {
          this.spinner.hide();
          this.fetchfuelGrade();
          this.newRowAdded = false;
          this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
        },
          (error) => {
            this.spinner.hide();
            console.log(error);
            this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);

          });
    } else {
      this.spinner.show();
      this.dataService.updateData('FuelGrade', params.data).
        subscribe((response) => {
          this.spinner.hide();
          this.newRowAdded = false;
          this.fetchfuelGrade();
          this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
        }, (error) => {
          console.log(error);
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        });
    }
  }
  deleteRow(params) {
    if (params.data.fuelGradeID === 0) {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
    } else {
      this.spinner.show();
      this.dataService.deleteData(`FuelGrade/${params.data.fuelGradeID}`).
        subscribe((_response) => {
          if (_response) {
            this.gridApi.updateRowData({ remove: [params.data] });
            this.newRowAdded = false;
            this.fetchfuelGrade();
            this.spinner.hide();
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
        });
    }
  }
  showComapnyList() {
    this.backToCompanyList.emit(false);
  }
  popupClose() {
    this.passEntry.emit(this.rowData);
    this.activeModal.close();
  }
}
