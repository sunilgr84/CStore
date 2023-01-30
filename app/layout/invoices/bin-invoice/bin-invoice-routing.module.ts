import { NgModule } from '@angular/core';
import { BinInvoiceComponent } from './bin-invoice.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: BinInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BinInvoiceRoutingModule { }
