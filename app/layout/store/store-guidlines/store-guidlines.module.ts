import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreGuidlinesRoutingModule } from './store-guidlines-routing.module';
import { StoreGuidlinesComponent } from './store-guidlines.component';

@NgModule({
  declarations: [StoreGuidlinesComponent],
  imports: [
    CommonModule,
    StoreGuidlinesRoutingModule
  ],
  exports: [StoreGuidlinesComponent]
})
export class StoreGuidlinesModule { }
