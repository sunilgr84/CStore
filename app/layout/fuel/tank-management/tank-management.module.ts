import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TankManagementRoutingModule } from './tank-management-routing.module';
import { TankManagementComponent } from './tank-management.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { NgxGaugeModule } from 'ngx-gauge';

@NgModule({
  declarations: [TankManagementComponent],
  imports: [
    CommonModule,
    TankManagementRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    FormsModule,
    NgxGaugeModule
  ]
})
export class TankManagementModule { }
