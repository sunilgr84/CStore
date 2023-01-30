import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-subscription-history',
  templateUrl: './subscription-history.component.html',
  styleUrls: ['./subscription-history.component.scss']
})
export class SubscriptionHistoryComponent implements OnInit {

  subscriptionHistoryGridOptions: any;
  subscriptionDetailRowData: any;
  constructor(private gridService: GridService, private constantsService: ConstantService) {
    this.subscriptionHistoryGridOptions = this.gridService.getGridOption(
      this.constantsService.gridTypes.storeBillingSubSubscriptionHistoryGrid);
  }

  ngOnInit() {
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
}
