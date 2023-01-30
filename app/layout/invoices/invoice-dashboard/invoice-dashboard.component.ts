import { Component, OnInit } from '@angular/core';
import { ConstantService } from '@shared/services/constant/constant.service';
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-invoice-dashboard',
  templateUrl: './invoice-dashboard.component.html',
  styleUrls: ['./invoice-dashboard.component.scss']
})
export class InvoiceDashboardComponent implements OnInit {


  isShowSearch = true;
  userInfo = this.constantService.getUserInfo();
  selectedDateRange: any;
  fromDate: any;
  toDate: any;
  filterText: any;
  gridApi: any;
  paginationGridOptions: any;
  isEDIInvoice: any;

  constructor(private setupService: SetupService, private constantService: ConstantService,
    private paginationGridService: PaginationGridService, private spinner: NgxSpinnerService) {
    this.paginationGridOptions = this.paginationGridService.getGridOption(this.constantService.gridTypes.invoiceDashboardGrid);
  }

  ngOnInit() {
    this.isEDIInvoice = false;
  }


  onGridReady(params) {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
  }

  onFilterTextBoxChanged() {
    this.gridApi.setQuickFilter(this.filterText);
  }

  dateRangeChange(event: any) {
    this.selectedDateRange = event;
  }

  getInvoiceDashboardDetails() {
    this.spinner.show();
    if (this.selectedDateRange === undefined) {
      this.selectedDateRange = {
        fDate: moment().format("YYYY-MM-DD"),
        tDate: moment().format("YYYY-MM-DD")
      }
    }
    this.setupService.getData("Invoice/GetInvoiceCountDetails/" + this.userInfo.companyId + "/" + this.userInfo.userName + "?dtFromCriteria=" + moment(this.selectedDateRange.fDate).format("YYYY-MM-DD") + "&dtToCriteria=" + moment(this.selectedDateRange.tDate).format("YYYY-MM-DD") + "&IsEDIInvoice=" + this.isEDIInvoice).subscribe(result => {
      this.spinner.hide();
      this.gridApi.setRowData(result);
    })
  }

  onStatusChange(e) {
    this.isEDIInvoice = e.checked;
  }

}

