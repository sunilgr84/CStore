import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchasesComponent } from './purchases.component';
import { PurchasesRoutingModule } from './purchases-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { InvoiceBinReportComponent } from './invoice-bin-report/invoice-bin-report.component';
import { WeeklyReportComponent } from './weekly-report/weekly-report.component';
import { InvoiceStatusReportComponent } from './invoice-status-report/invoice-status-report.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    PurchasesComponent, PurchaseReportComponent, InvoiceBinReportComponent,
    WeeklyReportComponent, InvoiceStatusReportComponent
  ],
  imports: [
    CommonModule,
    PurchasesRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class PurchasesModule { }
