import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelPricingRoutingModule } from './fuel-pricing-routing.module';
import { FuelPricingComponent } from './fuel-pricing.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { DynamicFormBuilderModule } from '@shared/dynamic-form-builder/dynamic-form-builder.module';

@NgModule({
  declarations: [FuelPricingComponent],
  imports: [
    CommonModule,
    FuelPricingRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    DynamicFormBuilderModule
  ]
})
export class FuelPricingModule { }
