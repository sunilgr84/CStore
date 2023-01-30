import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompetitorPricingRoutingModule } from './competitor-pricing-routing.module';
import { CompetitorPricingComponent } from './competitor-pricing.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from 'src/app/shared';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [CompetitorPricingComponent],
  imports: [
    CommonModule,
    CompetitorPricingRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule
  ]
})
export class CompetitorPricingModule { }
