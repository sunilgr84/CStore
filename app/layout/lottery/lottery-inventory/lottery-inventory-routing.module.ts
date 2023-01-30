import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LotteryInventoryComponent } from './lottery-inventory.component';

const routes: Routes = [
  { path: '', component: LotteryInventoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LotteryInventoryRoutingModule { }
