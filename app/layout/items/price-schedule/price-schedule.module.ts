import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriceScheduleRoutingModule } from './price-schedule-routing.module';
import { PriceScheduleComponent } from './price-schedule.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PriceScheduleComponent],
  imports: [
    CommonModule,
    PriceScheduleRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    CommonComponentModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
  ]
})
export class PriceScheduleModule { }
