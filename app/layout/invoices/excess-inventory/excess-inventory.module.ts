import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExcessInventoryRoutingModule } from './excess-inventory-routing.module';
import { ExcessInventoryComponent } from './excess-inventory.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [ExcessInventoryComponent],
  imports: [
    CommonModule,
    ExcessInventoryRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
  ]
})
export class ExcessInventoryModule { }
