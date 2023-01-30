import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LotteryInventoryRoutingModule } from './lottery-inventory-routing.module';
import { LotteryInventoryComponent } from './lottery-inventory.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
@NgModule({
  declarations: [LotteryInventoryComponent],
  imports: [
    CommonModule,
    LotteryInventoryRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    DirectivesModule
  ]
})
export class LotteryInventoryModule { }
