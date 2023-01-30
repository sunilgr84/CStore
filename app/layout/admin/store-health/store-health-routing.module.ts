import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreHealthComponent } from './store-health.component';

const routes: Routes = [
  { path: '', component: StoreHealthComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreHealthRoutingModule { }
