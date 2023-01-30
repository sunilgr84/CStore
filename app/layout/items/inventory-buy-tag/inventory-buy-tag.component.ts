import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-inventory-buy-tag',
  templateUrl: './inventory-buy-tag.component.html',
  styleUrls: ['./inventory-buy-tag.component.scss']
})
export class InventoryBuyTagComponent implements OnInit {

  gridOptions: any;
  rowData: any[] = [];
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constantService.gridTypes.masterInventoryBuyTagGrid);
  }

  ngOnInit() {
  }
  onGridReady(params) {
    console.log('not working');
  }
  edit(params) {
  }
  delete(params) {
  }
}
