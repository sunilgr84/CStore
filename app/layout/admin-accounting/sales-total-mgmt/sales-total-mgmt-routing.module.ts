import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SalesTotalMgmtComponent } from './sales-total-mgmt.component';

const routes: Routes = [
  { path: '', component: SalesTotalMgmtComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesTotalMgmtRoutingModule { }
