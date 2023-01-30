import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreRoutingModule } from './store-routing.module';
import { StoreComponent } from './store.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { StoreInformtionModule } from './store-informtion/store-informtion.module';
import { StoreGuidlinesModule } from './store-guidlines/store-guidlines.module';
import { FuelGradeMappingModule } from './fuel-grade-mapping/fuel-grade-mapping.module';
import { PaymentMethodModule } from './payment-method/payment-method.module';
import { SalesRestrictionModule } from './sales-restriction/sales-restriction.module';
import { SalesTaxModule } from './sales-tax/sales-tax.module';
import { PaymentCategoriesModule } from './payment-categories/payment-categories.module';
import { SetupCreditCardFeesModule } from './setup-credit-card-fees/setup-credit-card-fees.module';
import { StoreFeesComponent } from './store-fees/store-fees.component';
import { StoreServicesModule } from './store-services/store-services.module';
import { AccoutingModule } from './accouting/accouting.module';
import { DirectivesModule } from '@shared/directive/directives.module';
import { StoreLotterySettingComponent } from './store-lottery-setting/store-lottery-setting.component';
import { BillingSubscriptionModule } from './billing-subscription/billing-subscription.module';
import { MatSlideToggleModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { SettingTimeoffModule } from './setting-time-off/setting-time-off.module';
import { SchedulingSettingComponent } from './scheduling-setting/scheduling-setting.component';
import { TimesheetTimeOffModule } from '../timesheet-timeoff/timesheet-timeoff.module';

@NgModule({
  declarations: [StoreComponent, StoreFeesComponent, StoreLotterySettingComponent, SchedulingSettingComponent],
  imports: [CommonModule, StoreRoutingModule, PageHeaderModule, CommonComponentModule,
    StoreInformtionModule, StoreGuidlinesModule, FuelGradeMappingModule, PaymentMethodModule,
    SalesRestrictionModule, SalesTaxModule, PaymentCategoriesModule, SetupCreditCardFeesModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, StoreServicesModule, SettingTimeoffModule, TimesheetTimeOffModule,
    AccoutingModule, DirectivesModule, BillingSubscriptionModule, MatSlideToggleModule,NgSelectModule
  ]
})
export class StoreModule { }
