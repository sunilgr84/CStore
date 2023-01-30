import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BinInvoiceComponent } from './bin-invoice.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { BinInvoiceRoutingModule } from './bin-invoice-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BinVendorInvoiceComponent } from './bin-vendor-invoice/bin-vendor-invoice.component';
import { BinVendorInvoiceDetailComponent } from './bin-vendor-invoice/bin-vendor-invoice-detail/bin-vendor-invoice-detail.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { VendorInvoiceModule } from '../vendor-invoice/vendor-invoice.module';
@NgModule({
  declarations: [BinInvoiceComponent, BinVendorInvoiceComponent, BinVendorInvoiceDetailComponent],
  imports: [
    CommonModule,
    BinInvoiceRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    VendorInvoiceModule
  ]
})
export class BinInvoiceModule { }
