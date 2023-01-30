import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyPriceGroupComponent } from './company-price-group.component';

const routes: Routes = [
  { path: '', component: CompanyPriceGroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyPriceGroupRoutingModule { }
