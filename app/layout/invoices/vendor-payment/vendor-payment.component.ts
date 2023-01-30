import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { GridOptions } from 'ag-grid-community';
import { ConstantService } from '@shared/services/constant/constant.service';
import { GridService } from '@shared/services/grid/grid.service';

@Component({
  selector: 'app-vendor-payment',
  templateUrl: './vendor-payment.component.html',
  styleUrls: ['./vendor-payment.component.scss'],
  animations: [routerTransition()]
})
export class VendorPaymentComponent implements OnInit {
  isAdvanceSearchCollapsed = true;
  storeLocationList: any;
  fromDate = new Date();
  gridOption: GridOptions;
  rowData: any;
  constructor(private gridService: GridService, private constantService: ConstantService) {
    this.gridOption = this.gridService.getGridOption(this.constantService.gridTypes.vendorPaymentGrid);
  }

  ngOnInit() {
  }

}
