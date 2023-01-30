import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceGroup2Component } from './price-group2/price-group2.component';
import { ManageMixMatchComponent } from './manage-mix-match/manage-mix-match.component';
import { PromotionsNewComponent } from './promotions-new.component';
import { PromotionsNewRoutingModule } from './promotions-new-routing.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatRadioModule, MatCheckboxModule } from '@angular/material';
import { ComboDealsComponent } from './combo-deals/combo-deals.component';

@NgModule({
  declarations: [
    PromotionsNewComponent,
    PriceGroup2Component,
    ManageMixMatchComponent,
    ComboDealsComponent
  ],
  imports: [
    CommonModule,
    PromotionsNewRoutingModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgSelectModule,
    FormsModule,
    MatRadioModule,
    MatCheckboxModule,
  ]
})
export class PromotionsNewModule { }
