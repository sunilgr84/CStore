import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilesInvoiceComponent } from './files-invoice.component';
import { FilesInvoiceRoutingModule } from './files-invoice-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [FilesInvoiceComponent],
  imports: [
    CommonModule,
    FilesInvoiceRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
  ]
})
export class FilesInvoiceModule { }
