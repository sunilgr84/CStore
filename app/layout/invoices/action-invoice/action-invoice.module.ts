import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionInvoiceComponent } from './action-invoice.component';
import { ActionInvoiceRoutingModule } from './action-invoice-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ActionInvoiceComponent],
  imports: [
    CommonModule,
    ActionInvoiceRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    FormsModule
  ]
})
export class ActionInvoiceModule { }
