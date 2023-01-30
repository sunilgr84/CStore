import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmPackComponent } from './confirm-pack.component';

const routes: Routes = [
  { path: '', component: ConfirmPackComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfirmPackRoutingModule { }
