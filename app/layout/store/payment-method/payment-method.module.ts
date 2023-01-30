import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaymentMethodRoutingModule } from './payment-method-routing.module';
import { PaymentMethodComponent } from './payment-method.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';

@NgModule({
  declarations: [PaymentMethodComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    PaymentMethodRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [PaymentMethodComponent]
})
export class PaymentMethodModule { }
