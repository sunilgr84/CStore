import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MasterDepartmentComponent } from './master-department.component';

const routes: Routes = [
  { path: '', component: MasterDepartmentComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MasterDepartmentRoutingModule { }
