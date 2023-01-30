import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SchedulingComponent } from './scheduling.component';
import { AmazingTimePickerModule } from 'amazing-time-picker';

const routes: Routes = [
  {
    path: '', component: SchedulingComponent,

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), AmazingTimePickerModule],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
