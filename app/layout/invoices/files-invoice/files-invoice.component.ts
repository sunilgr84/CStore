import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-files-invoice',
  templateUrl: './files-invoice.component.html',
  styleUrls: ['./files-invoice.component.scss']
})
export class FilesInvoiceComponent implements OnInit {

  isAdvanceSearchCollapsed = true;
  gridOptions: GridOptions;
  storeLocationList: any;
  rowData: any;
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.filesInvoiceGrid);
  }

  ngOnInit() {
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
}
