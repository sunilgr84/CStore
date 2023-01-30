import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';

import { ManageItemsRoutingModule } from './manage-items-routing.module';
// import { NgxBarcode6Module } from 'ngx-barcode6';
import { CommonComponentModule } from '@shared/component/common-component.module';

import { ManageItemsComponent } from './manage-items.component';
import { AddEditItemComponent } from './add-edit-item/add-edit-item.component';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { MultipliersComponent } from './add-edit-item/multipliers/multipliers.component';
import { VendorsComponent } from './add-edit-item/vendors/vendors.component';
import { PriceGroupComponent } from './add-edit-item/price-group/price-group.component';
import { LinkedItemsComponent } from './add-edit-item/linked-items/linked-items.component';
import { PricingComponent } from './add-edit-item/pricing/pricing.component';
import { AddMultiPacksComponent } from './add-edit-item/add-multi-packs/add-multi-packs.component';
import { StockTransactionsComponent } from './add-edit-item/stock-transactions/stock-transactions.component';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { MatSelectModule, MatSlideToggleModule, MatTooltipModule } from '@angular/material';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PurchaseHistoryComponent } from './add-edit-item/purchase-history/purchase-history.component';

@NgModule({
  declarations: [
    ManageItemsComponent,
    AddEditItemComponent,
    MultipliersComponent,
    VendorsComponent,
    PriceGroupComponent,
    LinkedItemsComponent,
    PricingComponent,
    AddMultiPacksComponent,
    StockTransactionsComponent,
    PurchaseHistoryComponent
  ],
  imports: [
    CommonModule,
    CommonComponentModule,
    ManageItemsRoutingModule,
    // SharedModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    // NgxBarcode6Module,
    DirectivesModule,
    Ng2Charts,
    MatSlideToggleModule,
    MatSelectModule,
    MatTooltipModule,
    NgbModule.forRoot(),

  ],
  providers: [SetupService, ConstantService],
  exports: [AddEditItemComponent],
})
export class ManageItemsModule { }
