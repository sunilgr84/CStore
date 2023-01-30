import { Component, OnInit } from '@angular/core';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-fuel-profit',
  templateUrl: './fuel-profit.component.html',
  styleUrls: ['./fuel-profit.component.scss']
})
export class FuelProfitComponent implements OnInit {
  startDate: string;
  endDate: string;
  storeLocationId: number;
  gridApi: any;
  fuelProfitData: any;
  gridFuelProfitOptions: any;
  gridFuelProfitPurchaseOptions: any;
  gridFuelProfitSplitOptions: any;
  fuelProfitType: string;
  selectedDateRange: any;

  constructor(
    private setupService: SetupService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.storeLocationId = parseInt(sessionStorage.getItem('selectedStoreLocationId'));
    this.getFuelProfitType();
  }

  getFuelProfitType() {
    this.setupService
      .getData(`StoreFuelOptions/GetByStoreLocationID/${this.storeLocationId}`)
      .subscribe(response => {
        this.fuelProfitType = response[0].description;
        console.log('RESPONSE GET PROFIT TYPE', this.fuelProfitType);
      });
  }

  getFuelProfitData() {
    this.spinner.show()

    this.setupService
      .getData(`FuelProfit/Get/${this.storeLocationId}/${this.startDate}/${this.endDate}`)
      .subscribe(response => {
        console.log('RESPONSE OF FUEL PROFIT => ', response);
        this.fuelProfitData = response;
        this.spinner.hide();
      });
  }

  dateRangeChange(event) {
    this.startDate = event.fDate;
    this.endDate = event.tDate;
    this.getFuelProfitData();
  }
}
