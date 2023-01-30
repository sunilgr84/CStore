import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceAdminDashboardComponent } from './invoice-admin-dashboard.component';
import { InvoiceAdminDashboardRoutingModule } from './invoice-admin-dashboard-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [InvoiceAdminDashboardComponent],
  imports: [
    CommonModule,
    InvoiceAdminDashboardRoutingModule,
    NgbModule,
    CommonComponentModule
  ]
})
export class InvoiceAdminDashboardModule { }
