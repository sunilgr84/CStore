import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ActivatePackComponent } from './activate-pack.component';

const routes: Routes = [
  { path: '', component: ActivatePackComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActivatePackRoutingModule { }
