import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriceGroupRoutingModule } from './price-group-routing.module';
import { PriceGroupComponent } from './price-group.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PriceGroupComponent],
  imports: [
    CommonModule,
    PriceGroupRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    NgSelectModule

  ]
})
export class PriceGroupModule { }
