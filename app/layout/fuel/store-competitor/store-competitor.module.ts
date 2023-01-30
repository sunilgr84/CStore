import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreCompetitorRoutingModule } from './store-competitor-routing.module';
import { StoreCompetitorComponent } from './store-competitor.component';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [StoreCompetitorComponent],
  imports: [
    CommonModule,
    StoreCompetitorRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule

  ]
})
export class StoreCompetitorModule { }
