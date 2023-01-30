import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ValidateInvoiceRoutingModule } from './validate-invoice-routing.module';
import { ValidateInvoiceComponent } from './validate-invoice.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [ValidateInvoiceComponent],
  imports: [
    CommonModule,
    ValidateInvoiceRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    NgbModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ValidateInvoiceModule { }
