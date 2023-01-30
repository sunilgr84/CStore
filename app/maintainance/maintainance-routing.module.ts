import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MaintainanceComponent } from './maintainance.component';

const routes: Routes = [
  { path: '', component: MaintainanceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaintainanceRoutingModule { }
