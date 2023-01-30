import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelReportComponent } from './fuel.component';

const routes: Routes = [
  { path: '', component: FuelReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelReportRoutingModule { }
