import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceGroup1Component } from './price-group1.component';

const routes: Routes = [
  { path: '', component: PriceGroup1Component }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceGroup1RoutingModule { }
