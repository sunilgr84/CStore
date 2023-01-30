import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmployeeTimesheetDetailComponent } from './employee-timesheet-detail.component';


const routes: Routes = [
  {
    path: '', component: EmployeeTimesheetDetailComponent,

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeTimesheetDetailRoutingModule { }
