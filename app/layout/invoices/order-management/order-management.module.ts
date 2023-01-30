import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderManagementComponent } from './order-management.component';
import { OrderManagementRoutingModule } from './order-management-routing.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from '@shared/modules';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [OrderManagementComponent],
  imports: [
    CommonModule,
    OrderManagementRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
  ]
})
export class OrderManagementModule { }
