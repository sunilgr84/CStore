import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EmpTimeCardComponent } from './emp-time-card.component';

const routes: Routes = [
  {
    path: '', component: EmpTimeCardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmpTimeCardRoutingModule { }
