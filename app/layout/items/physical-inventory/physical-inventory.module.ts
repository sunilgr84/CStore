import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PhysicalInventoryRoutingModule } from './physical-inventory-routing.module';
import { PhysicalInventoryComponent } from './physical-inventory.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PhysicalInventoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    PhysicalInventoryRoutingModule,
    CommonComponentModule,
    PageHeaderModule,
    ReactiveFormsModule,
    NgSelectModule,
  ]
})
export class PhysicalInventoryModule { }
