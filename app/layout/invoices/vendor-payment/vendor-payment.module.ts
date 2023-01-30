import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorPaymentRoutingModule } from './vendor-payment-routing.module';
import { VendorPaymentComponent } from './vendor-payment.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [VendorPaymentComponent],
  imports: [
    CommonModule,
    VendorPaymentRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    NgbModule.forRoot(),
  ]
})
export class VendorPaymentModule { }
