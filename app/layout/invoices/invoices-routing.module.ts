import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { InvoicesComponent } from './invoices.component';

const routes: Routes = [
  {
    path: '', component: InvoicesComponent,
    children: [
      { path: 'vendor', loadChildren: './vendor/vendor.module#VendorModule' },
      { path: 'vendor-invoice', loadChildren: './vendor-invoice/vendor-invoice.module#VendorInvoiceModule' },
      { path: 'fuel-invoice', loadChildren: './fuel-invoice/fuel-invoice.module#FuelInvoiceModule' },
      { path: 'bin-invoice', loadChildren: './bin-invoice/bin-invoice.module#BinInvoiceModule' },
      { path: 'action-invoice', loadChildren: './action-invoice/action-invoice.module#ActionInvoiceModule' },
      { path: 'files-invoice', loadChildren: './files-invoice/files-invoice.module#FilesInvoiceModule' },
      { path: 'order-management', loadChildren: './order-management/order-management.module#OrderManagementModule' },
      { path: 'vendor-payment', loadChildren: './vendor-payment/vendor-payment.module#VendorPaymentModule' },
      { path: 'vendor-order', loadChildren: './vendor-order/vendor-order.module#VendorOrderModule' },
      { path: 'validate-invoice', loadChildren: './validate-invoice/validate-invoice.module#ValidateInvoiceModule' },
      { path: 'excess-inventory', loadChildren: './excess-inventory/excess-inventory.module#ExcessInventoryModule' },
      { path: 'upload-edi-invoice', loadChildren: './upload-edi-invoice/upload-edi-invoice.module#UploadEdiInvoiceModule' },
      { path: 'invoice-dashboard', loadChildren: './invoice-dashboard/invoice-dashboard.module#InvoiceDashboardModule'}
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InvoicesRoutingModule { }
