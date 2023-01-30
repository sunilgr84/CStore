import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DayReconsComponent } from './day-recon.component';

const routes: Routes = [
  { path: '', component: DayReconsComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DayReconRoutingModule { }
