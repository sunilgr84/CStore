import { NgModule } from '@angular/core';
import { InventoryComponent } from './inventory.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: InventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
