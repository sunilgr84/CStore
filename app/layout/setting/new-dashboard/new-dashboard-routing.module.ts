import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NewDashboardComponent } from './new-dashboard.component';

const routes: Routes = [
  { path: '', component: NewDashboardComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewDashboardRoutingModule { }
