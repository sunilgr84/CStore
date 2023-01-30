import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PriceChangeHistoryComponent } from './price-change-history.component';

const routes: Routes = [
  { path: '', component: PriceChangeHistoryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PriceChangeHistoryRoutingModule { }
