import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StoreInformtionComponent } from './store-informtion.component';

const routes: Routes = [
  { path: '', component: StoreInformtionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoreInformtionRoutingModule { }
