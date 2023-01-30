import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelInvoiceComponent } from './fuel-invoice.component';

const routes: Routes = [
  { path: '', component: FuelInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FuelInvoiceRoutingModule { }
