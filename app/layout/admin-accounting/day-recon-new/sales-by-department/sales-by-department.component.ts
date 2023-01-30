// modules
import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

// services
import { PaginationGridService } from '@shared/services/paginationGrid/pagination-grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

// components
// import { SalesByDepartmentDetailCellRenderer } from '@shared/component/pagination-grid/partials/sales-by-department-detail-cell-renderer.component';

// types
import { GridApi, ColumnApi } from 'ag-grid-community';
// import { ActionParams } from '@shared/component/pagination-grid/pagination-grid.component';

@Component({
  selector: 'day-recon--sales-by-department',
  templateUrl: 'sales-by-department.component.html',
})
export class SalesByDepartmentComponent implements OnInit {
  @Input() isOpen: boolean = true;
  @Output() onClose: EventEmitter<any> = new EventEmitter();

  salesByDepartmentGridApi: GridApi;
  salesByDepartmentGridColumnApi: ColumnApi;
  salesByDepartmentGridOptions: any;
  salesByDepartmentGridRowData: any = [];

  salesByDepartmentDetailCellRenderer: any;

  constructor(
    private gridService: PaginationGridService,
    private constants: ConstantService
  ) {
    // this.salesByDepartmentGridOptions = this.gridService.getGridOption(
    //   this.constants.gridTypes.salesByDepartmentGrid
    // );
    // this.salesByDepartmentDetailCellRenderer = SalesByDepartmentDetailCellRenderer;
  }

  ngOnInit() {
    window.scrollTo(0, 0);
    this.fetchMockData();
  }

  fetchMockData() {
    for (var i = 1; i <= 10; i++) {
      let dataset = {
        department: 'AUTO' + i,
        upcSales: 55 + i,
        upcAmount: '$' + 12.99 + i,
        nonUpcSales: 52 + i,
        nonUpcAmount: '$' + 12.99 + i,
        totalItemsSold: i,
        totalSales: '$' + 12.99 * i,
      };
      this.salesByDepartmentGridRowData.push(dataset);
    }
  }

  salesByDepartmentGridReady(params: any) {
    this.salesByDepartmentGridApi = params.api;
    this.salesByDepartmentGridColumnApi = params.columnApi;

    this.salesByDepartmentGridApi.sizeColumnsToFit();
  }

  onAction(data: any) {
    console.log({ data });
    alert(`clicked on ${data.type}`);
  }

  onDialogClose(e: any) {
    console.log({ e });
    this.onClose.emit('salesByDepartment');
  }
}
