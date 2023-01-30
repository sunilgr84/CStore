import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceGroup1Component } from './price-group1.component';
import { PriceGroup1RoutingModule } from './price-group1-routing.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PriceGroup1Component],
  imports: [
    CommonModule,
    PriceGroup1RoutingModule,
    CommonComponentModule,
    FormsModule, AgGridModule,NgSelectModule
  ]
})
export class PriceGroup1Module { }
