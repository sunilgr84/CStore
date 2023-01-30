import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelPricingComponent } from './fuel-pricing.component';

const routes: Routes = [
  { path: '', component: FuelPricingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelPricingRoutingModule { }
