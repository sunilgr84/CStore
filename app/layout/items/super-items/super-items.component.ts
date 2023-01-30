import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-super-items',
  templateUrl: './super-items.component.html',
  styleUrls: ['./super-items.component.scss']
})
export class SuperItemsComponent implements OnInit {
  gridApi: any;
  gridOptions: GridOptions;
  rowData: any;
  constructor(private gridSerivce: GridService, private constantService: ConstantService) {
    this.gridOptions = this.gridSerivce.getGridOption(this.constantService.gridTypes.supreItemsGrid);
  }

  ngOnInit() {

  }
  getGridReady(params) {
    this.gridApi = params.api;
    this.rowData = [];
    this.gridApi.sizeColumnsToFit();
  }
}
