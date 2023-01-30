import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FuelGradeMappingComponent } from './fuel-grade-mapping.component';

const routes: Routes = [
  { path: '', component: FuelGradeMappingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FuelGradeMappingRoutingModule { }
