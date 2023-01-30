
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FuelInventoryRoutingModule } from './fuel-inventory-routing.module';
import { FuelInventoryComponent } from './fuel-inventory.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from 'src/app/shared';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [FuelInventoryComponent],
  imports: [
    CommonModule,
    FuelInventoryRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule
  ]
})
export class FuelInventoryModule { }