import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { GridService } from 'src/app/shared/services/grid/grid.service';
import { ConstantService } from 'src/app/shared/services/constant/constant.service';
import { FormBuilder } from '@angular/forms';
import { StoreService } from '@shared/services/store/store.service';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';

@Component({
  selector: 'app-emp-time-card',
  templateUrl: './emp-time-card.component.html',
  styleUrls: ['./emp-time-card.component.scss'],
  animations: [routerTransition()]
})
export class EmpTimeCardComponent implements OnInit {

  rowData: any;
  gridOptions: GridOptions;
  gridApi: any;
  storeLocations: any[];
  employeeNames: any[];
  isStoreLoading = false;
  isEmployeeLoading = false;
  employeeTimeCardSearch = this.formBuilder.group({
    storeLocationIDs: [],
    employeeNameIDs: [],
    weekBeginDate: '',
    weekEndDate: '',
    isOnlyMissedClockOutEmployee: false
  });
  selectedDateRange :any;
  weekBeginDate = moment().format('MM-DD-YYYY');
  weekEndDate = moment().format('MM-DD-YYYY');
  userInfo = this.constants.getUserInfo();
  constructor(private gridService: GridService, private constants: ConstantService, private formBuilder: FormBuilder
    , private storeService: StoreService, private spinner: NgxSpinnerService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.employeeTimeCardGrid);
  }

  ngOnInit() {
    this.GetStoreLocation();
  }

  onGridReady(params) {
    this.gridApi = params.api;
  }
  GetStoreLocation() {
    this.isStoreLoading = true;
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(
      (response) => {
        this.storeLocations = response;
        this.isStoreLoading = false;
      }
    );
  }
  onSubmit() {
    console.log(this.employeeTimeCardSearch.value);
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.weekBeginDate = this.selectedDateRange.fDate;
    this.weekEndDate = this.selectedDateRange.tDate;
    this.employeeTimeCardSearch.get('weekBeginDate').setValue(this.selectedDateRange.fDate);
    this.employeeTimeCardSearch.get('weekEndDate').setValue(this.selectedDateRange.tDate);
  }
}
