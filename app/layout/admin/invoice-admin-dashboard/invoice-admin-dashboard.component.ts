import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';

@Component({
  selector: 'app-invoice-admin-dashboard',
  templateUrl: './invoice-admin-dashboard.component.html',
  styleUrls: ['./invoice-admin-dashboard.component.scss']
})
export class InvoiceAdminDashboardComponent implements OnInit {

  invoiceByStoreGridOptions: any;
  invoiceByUserGridOptions: any;
  invoiceCounts: any;
  invoiceByStoreGridAPI: any;
  invoiceByUserGridAPI: any;

  selectedDateRange: any;
  fromDate: any;
  toDate: any;

  constructor(private paginationGridService: PaginationGridService, private constantService: ConstantService, private setupService: SetupService) {
    this.invoiceByStoreGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.invoiceByStoreGrid);
    this.invoiceByUserGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.invoiceByUserGrid);
    this.invoiceCounts = {
      "New": 0,
      "InProgress": 0,
      "ReadyForReview": 0,
      "Completed": 0
    };
    this.fromDate = moment().startOf('month').format('YYYY-MM-DD');
    this.toDate = moment().format('YYYY-MM-DD');
    const dateRange = { fDate:  moment().startOf('month').format('YYYY-MM-DD'), tDate: moment().format('YYYY-MM-DD'), selectionType: "CustomRange" };
    this.selectedDateRange = dateRange;
  }

  ngOnInit() {
    this.getInvoiceDashDetails();
  }

  onInvoiceByStoreGridReady(params) {
    this.invoiceByStoreGridAPI = params.api;
    this.invoiceByStoreGridAPI.sizeColumnsToFit();
  }

  onInvoiceByUserGridReady(params) {
    this.invoiceByUserGridAPI = params.api;
    this.invoiceByUserGridAPI.sizeColumnsToFit();
  }

  getInvoiceDashDetails() {
    this.setupService.getData('Invoice/Dashboard/' + this.fromDate + '/' + this.toDate)
      .subscribe((response) => {
        if (response) {
          this.invoiceCounts = response.invoiceCounts[0];
          this.invoiceByStoreGridAPI.setRowData(response.invoiceByStore);
          response.invoiceByUser.forEach(element => {
            element.fullName = element.FirstName!=null ? element.FirstName : "" +" "+element.LastName!=null ? element.LastName : "";
          });
          this.invoiceByUserGridAPI.setRowData(response.invoiceByUser);
          this.invoiceByStoreGridAPI.sizeColumnsToFit();
          this.invoiceByUserGridAPI.sizeColumnsToFit();
        }
      }, (error) => {
        console.log(error);
      });
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
    this.fromDate = this.selectedDateRange.fDate;
    this.toDate = this.selectedDateRange.tDate;
  }
}
