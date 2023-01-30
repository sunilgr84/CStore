import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceAdminDashboardComponent } from './invoice-admin-dashboard.component';

const routes: Routes = [
  { path: '', component: InvoiceAdminDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoiceAdminDashboardRoutingModule { }
