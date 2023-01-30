import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorOrderComponent } from './vendor-order.component';

const routes: Routes = [
  { path: '', component: VendorOrderComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorOrderRoutingModule { }
