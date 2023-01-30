import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelManagementComponent } from './fuel-management.component';

const routes: Routes = [
  { path: '', component: FuelManagementComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelManagementRoutingModule { }
