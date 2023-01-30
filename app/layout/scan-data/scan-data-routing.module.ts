import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ScanDataComponent } from './scan-data.component';

const routes: Routes = [
  { path: '', component: ScanDataComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ScanDataRoutingModule { }
