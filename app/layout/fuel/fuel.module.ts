import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FuelRoutingModule } from './fuel-routing.module';
import { FuelComponent } from './fuel.component';

@NgModule({
  declarations: [FuelComponent],
  imports: [
    CommonModule,
    FuelRoutingModule
  ]
})
export class FuelModule { }
