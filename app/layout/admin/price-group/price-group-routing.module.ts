import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceGroupComponent } from './price-group.component';

const routes: Routes = [
  { path: '', component: PriceGroupComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceGroupRoutingModule { }
