import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SetupCreditCardFeesComponent } from './setup-credit-card-fees.component';

const routes: Routes = [
  { path: '', component: SetupCreditCardFeesComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SetupCreditCardFeesRoutingModule { }
