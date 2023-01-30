import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReconcileHouseComponent } from './reconcile-house.component';

const routes: Routes = [
  { path: '', component: ReconcileHouseComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReconcileHouseRoutingModule { }
