import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelReconciliationComponent } from './fuel-reconciliation.component';

const routes: Routes = [
  { path: '', component: FuelReconciliationComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelReconciliationRoutingModule { }
