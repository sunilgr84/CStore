import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceScheduleComponent } from './price-schedule.component';

const routes: Routes = [
  { path: '', component: PriceScheduleComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceScheduleRoutingModule { }
