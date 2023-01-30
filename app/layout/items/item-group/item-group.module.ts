import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemGroupRoutingModule } from './item-group-routing.module';
import { ItemGroupComponent } from './item-group.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';

@NgModule({
  declarations: [ItemGroupComponent],
  imports: [
    CommonModule,
    ItemGroupRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModalModule,
    NgMultiSelectDropDownModule,
  ]
})
export class ItemGroupModule { }
