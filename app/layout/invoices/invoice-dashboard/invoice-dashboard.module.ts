import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { FormsModule } from '@angular/forms';
import { InvoiceDashboardRoutingModule } from './invoice-dashboard-routing.module';
import { InvoiceDashboardComponent } from './invoice-dashboard.component';

@NgModule({
  declarations: [InvoiceDashboardComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    FormsModule,
    PageHeaderModule,
    InvoiceDashboardRoutingModule
  ]
})
export class InvoiceDashboardModule { }
