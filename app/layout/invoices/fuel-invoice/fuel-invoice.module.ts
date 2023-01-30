import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelInvoiceComponent } from './fuel-invoice.component';
import { FuelInvoiceRoutingModule } from './fuel-invoice-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { AddFuelInvoiceComponent } from './add-fuel-invoice/add-fuel-invoice.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { MatCheckboxModule } from '@angular/material';

@NgModule({
  declarations: [FuelInvoiceComponent, AddFuelInvoiceComponent],
  imports: [
    CommonModule,
    FuelInvoiceRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    ReactiveFormsModule,
    FormsModule,
    PageHeaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    DirectivesModule,
    MatCheckboxModule
  ],
})
export class FuelInvoiceModule { }
