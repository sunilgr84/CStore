import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimesheetTimeoffComponent } from './timesheet-timeoff.component';

const routes: Routes = [
  {
    path: '', component: TimesheetTimeoffComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimesheetTimeoffRoutingModule { }
