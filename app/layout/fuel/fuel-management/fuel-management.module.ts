import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelManagementRoutingModule } from './fuel-management-routing.module';
import { FuelManagementComponent } from './fuel-management.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [FuelManagementComponent],
  imports: [
    CommonModule,
    FuelManagementRoutingModule,
    CommonComponentModule,
    PageHeaderModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgbModule.forRoot(),
    FormsModule
  ]
})
export class FuelManagementModule { }
