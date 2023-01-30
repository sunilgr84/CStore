import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadEdiInvoiceComponent } from './upload-edi-invoice.component';
import { UploadEdiInvoiceRoutingModule } from './upload-edi-invoice-routing.module';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [UploadEdiInvoiceComponent],
  imports: [
    CommonModule,
    UploadEdiInvoiceRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    // tslint:disable-next-line: deprecation
    NgbModule.forRoot(),
    FormsModule
  ]
})
export class UploadEdiInvoiceModule { }
