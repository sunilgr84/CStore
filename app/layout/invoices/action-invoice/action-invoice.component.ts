import { Component, OnInit } from '@angular/core';
import { GridOptions, GridApi } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-action-invoice',
  templateUrl: './action-invoice.component.html',
  styleUrls: ['./action-invoice.component.scss']
})
export class ActionInvoiceComponent implements OnInit {

  gridOptions: GridOptions;
  gridApi: GridApi;
  rowData: any[];
  filterText: string;
  userInfo = this.constantService.getUserInfo();
  constructor(private gridService: GridService, private constantService: ConstantService, private setupService: SetupService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.actionInvoiceGrid);
  }

  ngOnInit() {
    this.GetInvoiceActionData();
  }
  onGridReady(params) {
    this.gridApi = params.api;
    params.api.sizeColumnsToFit();
  }
  GetInvoiceActionData() {
    this.setupService.getData('InvoiceAction/GetInvoiceActionData?CompanyID=' + this.userInfo.companyId).subscribe((response) => {
      this.rowData = response;
    }, (error) => {
      console.error(error);
    });
  }
}
