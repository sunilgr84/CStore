import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PaymentCategoriesComponent } from './payment-categories.component';

const routes: Routes = [
  { path: '', component: PaymentCategoriesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaymentCategoriesRoutingModule { }
