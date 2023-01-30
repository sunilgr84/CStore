import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryComponent } from './inventory.component';
import { InventoryRoutingModule } from './inventory-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { InventoryReportComponent } from './inventory-report/inventory-report.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { UnupdatedInventoryReportComponent } from './unupdated-inventory-report/unupdated-inventory-report.component';
import { ItemTxnReportComponent } from './item-txn-report/item-txn-report.component';
import { ShrinkageReportComponent } from './shrinkage-report/shrinkage-report.component';
import { PurchaseReportComponent } from './purchase-report/purchase-report.component';
@NgModule({
  declarations: [InventoryComponent, InventoryReportComponent, UnupdatedInventoryReportComponent, ItemTxnReportComponent,ShrinkageReportComponent, PurchaseReportComponent],
  imports: [
    CommonModule,
    InventoryRoutingModule,
    PageHeaderModule,
    NgSelectModule, ReactiveFormsModule, FormsModule, CommonComponentModule,
    NgbModule.forRoot()
  ]
})
export class InventoryModule { }
