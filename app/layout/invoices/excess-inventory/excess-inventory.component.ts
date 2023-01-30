import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-excess-inventory',
  templateUrl: './excess-inventory.component.html',
  styleUrls: ['./excess-inventory.component.scss'],
  animations: [routerTransition()]
})
export class ExcessInventoryComponent implements OnInit {
  storeLocationList: any;
  rowData: any;
  gridOption: GridOptions;
  gridApi: any;
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOption = this.gridService.getGridOption(this.constantService.gridTypes.excessInventoryGrid);
  }

  ngOnInit() {
  }
  onGridReady(params) {
    this.gridApi = params.api;
    this.rowData = [];
    params.api.sizeColumnsToFit();
  }
}
