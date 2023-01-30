import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardSettingComponent } from './dashboard-setting.component';

const routes: Routes = [
  { path: '', component: DashboardSettingComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardSettingRoutingModule { }
