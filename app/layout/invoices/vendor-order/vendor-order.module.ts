import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorOrderRoutingModule } from './vendor-order-routing.module';
import { VendorOrderComponent } from './vendor-order.component';

@NgModule({
  declarations: [VendorOrderComponent],
  imports: [
    CommonModule,
    VendorOrderRoutingModule
  ]
})
export class VendorOrderModule { }
