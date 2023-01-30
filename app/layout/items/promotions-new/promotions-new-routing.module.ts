import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PromotionsNewComponent } from './promotions-new.component';

const routes: Routes = [
  { path: '', component: PromotionsNewComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionsNewRoutingModule { }
