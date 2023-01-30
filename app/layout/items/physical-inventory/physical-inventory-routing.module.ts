import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PhysicalInventoryComponent } from './physical-inventory.component';

const routes: Routes = [
  { path: '', component: PhysicalInventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PhysicalInventoryRoutingModule { }
