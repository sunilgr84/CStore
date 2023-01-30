import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InventoryBuyTagComponent } from './inventory-buy-tag.component';

const routes: Routes = [
  { path: '', component: InventoryBuyTagComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryBuyTagRoutingModule { }
