import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-mix-match-price-location',
  templateUrl: './mix-match-price-location.component.html',
  styleUrls: ['./mix-match-price-location.component.scss']
})
export class MixMatchPriceLocationComponent implements OnInit {

  gridOptions: any;
  rowData: any[] = [];
  constructor(private gridService: GridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.mixMatchPriceLocationGrid);
  }

  ngOnInit() {
  }
  editAction(params) {

  }
}
