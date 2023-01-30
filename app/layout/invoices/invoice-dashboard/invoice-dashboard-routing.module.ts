import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoiceDashboardComponent } from './invoice-dashboard.component';

const routes: Routes = [
  { path: '', component: InvoiceDashboardComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InvoiceDashboardRoutingModule { }
