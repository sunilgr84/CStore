import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BuyDownManagerComponent } from './buy-down-manager.component';

const routes: Routes = [
  { path: '', component: BuyDownManagerComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BuyDownManagerRoutingModule { }
