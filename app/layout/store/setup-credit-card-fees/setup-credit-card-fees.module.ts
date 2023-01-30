import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SetupCreditCardFeesRoutingModule } from './setup-credit-card-fees-routing.module';
import { SetupCreditCardFeesComponent } from './setup-credit-card-fees.component';

@NgModule({
  declarations: [SetupCreditCardFeesComponent],
  imports: [
    CommonModule,
    SetupCreditCardFeesRoutingModule
  ],
  exports: [SetupCreditCardFeesComponent]
})
export class SetupCreditCardFeesModule { }
