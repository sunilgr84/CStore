import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManufacturerRoutingModule } from './manufacturer-routing.module';
import { ManufacturerComponent } from './manufacturer.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ManufacturerComponent],
  imports: [
    CommonModule,
    ManufacturerRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ManufacturerModule { }
