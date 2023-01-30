import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { EditableGridService } from 'src/app/shared/services/editableGrid/editable-grid.service';
import { SetupService } from 'src/app/shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';

@Component({
  selector: 'app-company-recon-parameter',
  templateUrl: './company-recon-parameter.component.html',
  styleUrls: ['./company-recon-parameter.component.scss']
})
export class CompanyReconParameterComponent implements OnInit {
  editGridOptions: any;
  rowData: any;
  gridApi: any;
  newRowAdded = false;
  @Input() companyData?: any;
  @Output() backToCompanyList: EventEmitter<any> = new EventEmitter();
  @Output() changeTabs: EventEmitter<any> = new EventEmitter();

  selectedCompanyID: any;
  userInfo: any;
  roleName: string;

  constructor(private editableGrid: EditableGridService, private constantsService: ConstantService,
    private dataService: SetupService,
    private toastr: ToastrService, private spinner: NgxSpinnerService, private route: ActivatedRoute) {
    this.roleName = this.constantsService.roleName;
    this.editGridOptions = this.editableGrid.getGridOption(this.constantsService.editableGridConfig.gridTypes.companyReconParameterGrid);
  }

  ngOnInit() {
    this.userInfo = this.constantsService.getUserInfo();
    const id = this.route.snapshot.paramMap.get('id');
    if (id || this.companyData) {
      this.selectedCompanyID = id ? id : this.companyData.companyID;
      this.fetCompanyReconParameters();
    }
  }
  fetCompanyReconParameters() {
    this.dataService.getData('CompanyReconParameter/list/' + this.selectedCompanyID).
      subscribe((response) => {
        if (response && response['statusCode']) {
          this.rowData = [];
          return;
        }
        this.rowData = response;
      });
  }

  onReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  addRows() {
    if (this.newRowAdded) {
      this.toastr.error('Please save existing data first before adding another!');
      return;
    }
    this.newRowAdded = true;
    this.gridApi.updateRowData({
      add: [{ companyReconParameterID: '', companyReconParameterName: '', isExpense: false, isSaveRequired: true }],
      addIndex: this.rowData ? this.rowData.length : 0,
    });
    this.getStartEditingCell('companyReconParameterName', this.rowData.length);
  }
  // set edit cell
  getStartEditingCell(_colKey, _rowIndex) {
    this.gridApi.startEditingCell({
      rowIndex: _rowIndex,
      colKey: _colKey
    });
  }
  editAction(params) {
    if (params.data.companyReconParameterName && Number(params.data.companyReconParameterName.length) >= 20) {
      this.toastr.error('Company recon parameter should less than 20 character!', this.constantsService.infoMessages.error);
      return;
    }
    if (!params.data.companyReconParameterName) {
      this.toastr.error('Please enter company recon parameter!', this.constantsService.infoMessages.error);
      return;
    }
    if (params.data.companyReconParameterName && (params.data.companyReconParameterName).trim() === '') {
      this.toastr.error('Please Enter Company Recon Name..!', this.constantsService.infoMessages.error);
      this.getStartEditingCell('companyReconParameterName', params.rowIndex);
      return;
    }
    if (params.data.companyReconParameterID === '') {
      const duplicate = _.find(this.rowData, ['companyReconParameterName', params.data.companyReconParameterName]);
      if (duplicate) {
        this.toastr.error('Company recon parameter already existing!', this.constantsService.infoMessages.error);
        this.getStartEditingCell('companyReconParameterName', params.rowIndex);
        return;
      }
      this.spinner.show();
      const reqObj = {
        companyReconParameterID: 0, companyID: this.selectedCompanyID,
        companyReconParameterName: params.data.companyReconParameterName, isExpense: params.data.isExpense
      };
      this.dataService.postData('CompanyReconParameter', reqObj).subscribe((response) => {
        this.newRowAdded = false;
        this.spinner.hide();
        if (response['statusCode'] === 400 || response['statusCode'] === 500) {
          this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
          return;
        }
        if (response) {
          this.fetCompanyReconParameters();
          this.toastr.success(this.constantsService.infoMessages.addedRecord, this.constantsService.infoMessages.success);
        }
      }, (error) => {
        this.spinner.hide();
        this.toastr.error(this.constantsService.infoMessages.addRecordFailed, this.constantsService.infoMessages.error);
      }
      );
    } else {
      this.spinner.show();
      this.dataService.updateData('CompanyReconParameter', params.data).
        subscribe((response) => {
          this.spinner.hide();
          if (response) {
            this.newRowAdded = false;
            //  this.fetCompanyReconParameters();
            this.toastr.success(this.constantsService.infoMessages.updatedRecord, this.constantsService.infoMessages.success);
          } else {
            this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
          }
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.updateRecordFailed, this.constantsService.infoMessages.error);
        });
    }
  }

  deleteRow(params) {
    if (params.data.companyReconParameterID === '') {
      this.gridApi.updateRowData({ remove: [params.data] });
      this.newRowAdded = false;
    } else {
      this.spinner.show();
      this.dataService.deleteData(`CompanyReconParameter/${params.data.companyReconParameterID}`).
        subscribe((response) => {
          if (response === '1') {
            this.gridApi.updateRowData({ remove: [params.data] });
            this.newRowAdded = false;
            this.spinner.hide();
            this.toastr.success(this.constantsService.infoMessages.deletedRecord, this.constantsService.infoMessages.success);
          } else {
            this.spinner.hide();
            this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
          }
          this.fetCompanyReconParameters();
        }, (error) => {
          this.spinner.hide();
          this.toastr.error(this.constantsService.infoMessages.deleteRecordFailed, this.constantsService.infoMessages.error);
        });
    }

  }
  Reset() {
    this.newRowAdded = false;
    this.fetCompanyReconParameters();
  }
  onNavigateUserManagement() {
    const data = { tabId: 'tab-user-management' };
    this.changeTabs.emit(data);
  }
  showComapnyList() {
    this.backToCompanyList.emit(false);
  }
}
