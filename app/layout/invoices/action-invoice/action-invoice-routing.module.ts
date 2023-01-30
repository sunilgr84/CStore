import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActionInvoiceComponent } from './action-invoice.component';


const routes: Routes = [
  { path: '', component: ActionInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ActionInvoiceRoutingModule { }
