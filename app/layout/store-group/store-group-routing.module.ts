import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreGroupComponent } from './store-group.component';

const routes: Routes = [
  { path: '', component: StoreGroupComponent }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreGroupRoutingModule { }
