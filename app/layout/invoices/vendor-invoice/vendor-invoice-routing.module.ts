import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VendorInvoiceComponent } from './vendor-invoice.component';

const routes: Routes = [
  { path: '', component: VendorInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VendorInvoiceRoutingModule { }
