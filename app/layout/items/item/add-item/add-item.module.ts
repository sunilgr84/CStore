import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddItemRoutingModule } from './add-item-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
// Import ngx-barcode module
import { NgxBarcodeModule } from 'ngx-barcode';
import { AddItemComponent } from './add-item.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { AddPricingComponent } from './add-pricing/add-pricing.component';
import { AddMultipacksComponent } from './add-multipacks/add-multipacks.component';
import { AddItemPricegroupComponent } from './add-item-pricegroup/add-item-pricegroup.component';
import { AddItemVendorComponent } from './add-item-vendor/add-item-vendor.component';
import { AddItemMultipliersComponent } from './add-item-multipliers/add-item-multipliers.component';
import { AddLinkedItemComponent } from './add-linked-item/add-linked-item.component';
import { MatSelectModule, MatSlideToggleModule, MatTooltipModule } from '@angular/material';
import { StockTransactionsComponent } from './stock-transactions/stock-transactions.component';
import { PurchaseHistoryComponent } from './purchase-history/purchase-history.component';
import { ChartsModule as Ng2Charts } from 'ng2-charts';

@NgModule({
  declarations: [AddItemComponent, AddPricingComponent, AddMultipacksComponent,
    AddItemPricegroupComponent, AddItemVendorComponent, AddItemMultipliersComponent, AddLinkedItemComponent, StockTransactionsComponent, PurchaseHistoryComponent],
  imports: [
    CommonModule,
    AddItemRoutingModule,
    PageHeaderModule,
    // tslint:disable-next-line: deprecation
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxBarcodeModule,
    DirectivesModule,
    MatSlideToggleModule,
    MatSelectModule,
    Ng2Charts, 
    MatTooltipModule
  ]
})
export class AddItemModule { }
