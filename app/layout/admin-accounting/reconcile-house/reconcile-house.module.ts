import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReconcileHouseRoutingModule } from './reconcile-house-routing.module';
import { ReconcileHouseComponent } from './reconcile-house.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ReconcileHouseComponent],
  imports: [
    CommonModule,
    ReconcileHouseRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ReconcileHouseModule { }
