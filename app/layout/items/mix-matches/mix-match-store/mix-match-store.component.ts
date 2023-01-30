import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-mix-match-store',
  templateUrl: './mix-match-store.component.html',
  styleUrls: ['./mix-match-store.component.scss']
})
export class MixMatchStoreComponent implements OnInit {

  gridOptions: any;
  rowData: any[] = [];
  constructor(private gridService: GridService, private constants: ConstantService) {
    this.gridOptions = this.gridService.getGridOption(this.constants.gridTypes.mixMatchStoreGrid);
  }

  ngOnInit() {
  }
  editAction(params) {

  }
}
