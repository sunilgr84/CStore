import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelProfitRoutingModule } from './fuel-profit-routing.module';
import { FuelProfitComponent } from './fuel-profit.component';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [FuelProfitComponent],
  imports: [
    CommonModule,
    FuelProfitRoutingModule,
    CommonComponentModule
  ]
})
export class FuelProfitModule { }
