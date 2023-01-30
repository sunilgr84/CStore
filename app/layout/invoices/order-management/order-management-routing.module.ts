import { NgModule } from '@angular/core';
import { OrderManagementComponent } from './order-management.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: OrderManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrderManagementRoutingModule { }
