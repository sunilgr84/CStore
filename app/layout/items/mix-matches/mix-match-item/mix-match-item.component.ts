import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-mix-match-item',
  templateUrl: './mix-match-item.component.html',
  styleUrls: ['./mix-match-item.component.scss']
})
export class MixMatchItemComponent implements OnInit {

  gridOptions: any;
  rowData: any[] = [];
  constructor(private gridService: GridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.mixMatchItemGrid);
  }

  ngOnInit() {
  }
  editAction(params) {

  }
}
