import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelProfitComponent } from './fuel-profit.component';

const routes: Routes = [
  { path: '', component: FuelProfitComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelProfitRoutingModule { }
