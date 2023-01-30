import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingSubscriptionRoutingModule } from './billing-subscription-routing.module';
import { BillingSubscriptionComponent } from './billing-subscription.component';
import { SubscriptionDetailsComponent } from './subscription-details/subscription-details.component';
import { ChangePlanComponent } from './change-plan/change-plan.component';
import { SubscriptionHistoryComponent } from './subscription-history/subscription-history.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [BillingSubscriptionComponent,
    SubscriptionDetailsComponent, ChangePlanComponent, SubscriptionHistoryComponent,
    PaymentHistoryComponent],
  imports: [
    CommonModule,
    BillingSubscriptionRoutingModule,
    CommonComponentModule,
    FormsModule, NgbModule.forRoot(), ReactiveFormsModule, NgSelectModule
  ],
  exports: [BillingSubscriptionComponent]
})
export class BillingSubscriptionModule { }
