import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PaymentCategoriesRoutingModule } from './payment-categories-routing.module';
import { PaymentCategoriesComponent } from './payment-categories.component';

@NgModule({
  declarations: [PaymentCategoriesComponent],
  imports: [
    CommonModule,
    PaymentCategoriesRoutingModule
  ],
  exports: [PaymentCategoriesComponent]
})
export class PaymentCategoriesModule { }
