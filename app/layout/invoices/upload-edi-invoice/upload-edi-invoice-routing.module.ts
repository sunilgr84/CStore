import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UploadEdiInvoiceComponent } from './upload-edi-invoice.component';

const routes: Routes = [
  { path: '', component: UploadEdiInvoiceComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UploadEdiInvoiceRoutingModule { }
