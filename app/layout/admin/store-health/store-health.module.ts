import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CommonComponentModule } from '@shared/component/common-component.module';

import { StoreHealthComponent } from './store-health.component';

import { StoreHealthRoutingModule } from './store-health-routing.module';

@NgModule({
  declarations: [StoreHealthComponent],
  imports: [
    CommonModule,
    CommonComponentModule,
    StoreHealthRoutingModule
  ]
})
export class StoreHealthModule { }
