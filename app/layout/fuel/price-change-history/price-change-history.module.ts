import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriceChangeHistoryRoutingModule } from './price-change-history-routing.module';
import { PriceChangeHistoryComponent } from './price-change-history.component';
import { PageHeaderModule } from 'src/app/shared/';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [PriceChangeHistoryComponent],
  imports: [
    CommonModule,
    PriceChangeHistoryRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PriceChangeHistoryModule { }
