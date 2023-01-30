import { NgModule } from '@angular/core';
import { FilesInvoiceComponent } from './files-invoice.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', component: FilesInvoiceComponent }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FilesInvoiceRoutingModule { }
