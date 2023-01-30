import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LotteryDetailsComponent } from './lottery-details.component';

const routes: Routes = [
  { path: '', component: LotteryDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LotteryDetailsRoutingModule { }
