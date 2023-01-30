import { Component, OnInit } from '@angular/core';
import { GridService } from '@shared/services/grid/grid.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-payment-history',
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {

  paymentHistoryGridOptions: any;
  paymentHistoryRowData: any;
  constructor(private gridService: GridService, private constantsService: ConstantService) {
    this.paymentHistoryGridOptions = this.gridService.getGridOption(this.constantsService.gridTypes.storeBillingSubPaymentHistoryGrid);
  }

  ngOnInit() {
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();

  }
}
