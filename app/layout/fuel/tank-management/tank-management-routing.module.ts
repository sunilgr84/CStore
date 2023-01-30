import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TankManagementComponent } from './tank-management.component';

const routes: Routes = [
  { path: '', component: TankManagementComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TankManagementRoutingModule { }
