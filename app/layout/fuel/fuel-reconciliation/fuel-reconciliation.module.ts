import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelReconciliationRoutingModule } from './fuel-reconciliation-routing.module';
import { FuelReconciliationComponent } from './fuel-reconciliation.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [FuelReconciliationComponent],
  imports: [
    CommonModule,
    FuelReconciliationRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class FuelReconciliationModule { }
