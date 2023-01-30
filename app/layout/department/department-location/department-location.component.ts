import { Component, OnInit, Input, EventEmitter, OnChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { Department } from '@models/department.model';
import { DepartmentLocation } from '@models/department-location.model';
import { FormMode } from '@models/form-mode.enum';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { GridApi, ColumnApi } from 'ag-grid-community';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-department-location',
  templateUrl: './department-location.component.html',
  styleUrls: ['./department-location.component.scss']
})
export class DepartmentLocationComponent implements OnInit, OnChanges {
  filterText = null;
  @Input() selectedDepartment: Department;
  @Input() showAllDepartment: EventEmitter<boolean>;

  editRowData: any;

  formMode: FormMode = FormMode.ADD;

  gridApi: any;
  columnApi: ColumnApi;
  newDepartmentLocation = false;

  gridOptions: any;

  rowData: any;

  showLocation = false;
  userInfo = this.constants.getUserInfo();
  constructor(private spinner: NgxSpinnerService, private gridService: GridService,
    private constants: ConstantService, private _itemsService: SetupService, private _tstr: ToastrService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.departmentLocationGrid);
  }

  ngOnInit() {
    this.fetchDepartmentLocationData();
  }
  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    // this.columnApi = params.columnApi;
  }
  ngOnChanges() {
    if (this.selectedDepartment) {
      this.fetchDepartmentLocationData();
    }
  }

  edit(params) {
    this.editRowData = params.data;
    this.formMode = FormMode.EDIT;
    this.newDepartmentLocation = true;
  }

  delete(params) {
    if (!params.data && !params.data.departmentLocationID) {
      return;
    }
    this.spinner.show();
    this._itemsService.deleteData(`DepartmentLocation?id=${params.data.departmentLocationID}`).subscribe(res => {
      this.spinner.hide();
      if (res && Number(res) > 0) {
        this.fetchDepartmentLocationData();
        this._tstr.success(this.constants.infoMessages.deletedRecord, this.constants.infoMessages.success);
      } else {
        this._tstr.error(this.constants.infoMessages.deleteRecordFailed, this.constants.infoMessages.error);
      }
    }, err => {
      this.spinner.hide();
      this._tstr.error(this.constants.infoMessages.contactAdmin);
    });
  }



  addDepartmentLocation(show: boolean) {
    this.editRowData = null;
    this.formMode = FormMode.ADD;
    this.newDepartmentLocation = show;
  }


  /**
   * Fetch the Department Location data from server
   */
  fetchDepartmentLocationData(): void {
    // tslint:disable-next-line:max-line-length
    this._itemsService.getData(`DepartmentLocation/getByDepartmentId/${this.selectedDepartment.departmentID}/${this.userInfo.userName}/${this.userInfo.companyId}`)
      .subscribe((data: DepartmentLocation[]) => {
        data.map((deptLoc) => {
          deptLoc.departmentDescription = this.selectedDepartment.departmentDescription;
        });
        this.rowData = data;
        this.gridApi.sizeColumnsToFit();
      }, (err) => {
        console.log(err);
        this._tstr.error('Unable to fetch Deprtment Location data!');
      });
  }
  showAllDepartmentLocations(show: boolean) {
    this.editRowData = null;
    this.formMode = FormMode.ADD;
    this.newDepartmentLocation = show;
    this.fetchDepartmentLocationData();
  }
  backToList() {
    this.showAllDepartment.emit(true);
    window.scrollTo(0, 0);
  }

}
