import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesComponent } from './sales.component';
import { SalesRoutingModule } from './sales-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { SalesReportComponent } from './sales-report/sales-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { DayReconReportComponent } from './day-recon-report/day-recon-report.component';
import { AbnormalProfitMarginComponent } from './abnormal-profit-margin/abnormal-profit-margin.component';
import { WeeklyReportComponent } from './weekly-report/weekly-report.component';
import { SalesHistoryByUpcReportComponent } from './sales-history-by-upc-report/sales-history-by-upc-report.component';
import { ModifierSalesReportComponent } from './modifier-sales-report/modifier-sales-report.component';
import { SalesComparisonReportComponent } from './sales-comparison-report/sales-comparison-report.component';
import { ManualDataEntryReportComponent } from './manual-data-entry-report/manual-data-entry-report.component';
import { ItemsBySalesMarginReportComponent } from './items-by-sales-margin-report/items-by-sales-margin-report.component';
import { PromotionReportComponent } from './promotion-report/promotion-report.component';
import { TaxableItemsReportComponent } from './taxable-items-report/taxable-items-report.component';
import { SirInventoryControlReportComponent } from './sir-inventory-control-report/sir-inventory-control-report.component';
import { SalesComparisionYearAgoReportComponent } from './sales-comparision-year-ago-report/sales-comparision-year-ago-report.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxBarcodeModule } from 'ngx-barcode';


@NgModule({
  declarations: [
    SalesComponent, SalesReportComponent, DayReconReportComponent, AbnormalProfitMarginComponent,
    WeeklyReportComponent, SalesHistoryByUpcReportComponent, ModifierSalesReportComponent,
    SalesComparisonReportComponent, ManualDataEntryReportComponent, ItemsBySalesMarginReportComponent,
    PromotionReportComponent, TaxableItemsReportComponent, SirInventoryControlReportComponent,
    SalesComparisionYearAgoReportComponent
  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,NgxBarcodeModule
  ]
})
export class SalesModule { }
