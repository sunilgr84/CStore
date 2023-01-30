import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SettingComponent } from './setting.component';

const routes: Routes = [
  { path: '', component: SettingComponent },
  { path: 'dashboard-setting', loadChildren: './dashboard-setting/dashboard-setting.module#DashboardSettingModule' },
  { path: 'dashboard', loadChildren: './new-dashboard/new-dashboard.module#NewDashboardModule' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingRoutingModule { }
