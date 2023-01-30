import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorInvoiceRoutingModule } from './vendor-invoice-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from '@shared/modules';
import { VendorInvoiceComponent } from './vendor-invoice.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AddInvoiceComponent } from './add-invoice/add-invoice.component';
import { InvoiceDetailComponent } from './add-invoice/invoice-detail/invoice-detail.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { MatCheckboxModule } from '@angular/material';

@NgModule({
  declarations: [VendorInvoiceComponent, AddInvoiceComponent, InvoiceDetailComponent],
  imports: [
    CommonModule,
    VendorInvoiceRoutingModule,
    // tslint:disable-next-line: deprecation
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderModule,
    NgSelectModule,
    DirectivesModule,
    MatCheckboxModule
  ],
  exports: [AddInvoiceComponent]
})
export class VendorInvoiceModule { }
