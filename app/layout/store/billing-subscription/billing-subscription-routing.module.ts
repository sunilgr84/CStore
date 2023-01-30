import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BillingSubscriptionComponent } from './billing-subscription.component';

const routes: Routes = [
  { path: '', component: BillingSubscriptionComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingSubscriptionRoutingModule { }
