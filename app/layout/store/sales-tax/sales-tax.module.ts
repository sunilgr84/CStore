import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesTaxRoutingModule } from './sales-tax-routing.module';
import { SalesTaxComponent } from './sales-tax.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [SalesTaxComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    SalesTaxRoutingModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [SalesTaxComponent]
})
export class SalesTaxModule { }
