import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompetitorPricingComponent } from './competitor-pricing.component';

const routes: Routes = [
  { path: '', component: CompetitorPricingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompetitorPricingRoutingModule { }
