import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ValidateInvoiceComponent } from './validate-invoice.component';

const routes: Routes = [
  { path: '', component: ValidateInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ValidateInvoiceRoutingModule { }
