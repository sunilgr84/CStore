import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NetworkSummaryComponent } from './network-summary.component';

const routes: Routes = [
  { path: '', component: NetworkSummaryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NetworkSummaryRoutingModule { }
