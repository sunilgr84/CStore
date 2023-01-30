import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-subscription-details',
  templateUrl: './subscription-details.component.html',
  styleUrls: ['./subscription-details.component.scss']
})
export class SubscriptionDetailsComponent implements OnInit {

  subscriptionDetailGridOptions: any;
  subscriptionDetailRowData: any;
  constructor(private gridService: GridService, private constantsService: ConstantService) {
    this.subscriptionDetailGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.subscriptionDetailGrid);
  }

  ngOnInit() {
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
}
