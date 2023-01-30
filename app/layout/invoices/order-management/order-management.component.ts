import { Component, OnInit } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {

  locationList: any;
  isAdvanceSearchCollapsed = true;
  gridOptions: GridOptions;
  isHideOrderManagement = false;
  storeList: any;
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.orderManagementGrid);
  }

  ngOnInit() {
  }
  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  addOrderManagement() {
    this.isHideOrderManagement = true;
  }
  backToList() {
    this.isHideOrderManagement = false;
  }
}
