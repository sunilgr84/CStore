import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LiveSummaryComponent } from './live-summary.component';

const routes: Routes = [
  { path: '', component: LiveSummaryComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LiveSummaryRoutingModule { }
