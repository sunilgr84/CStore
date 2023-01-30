import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PriceBookItemRoutingModule } from './price-book-item-routing.module';
import { PriceBookItemComponent } from './price-book-item.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from '@shared/modules';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DirectivesModule } from '@shared/directive/directives.module';
import { MasterLinkedItemComponent } from './master-linked-item/master-linked-item.component';

@NgModule({
  declarations: [PriceBookItemComponent, MasterLinkedItemComponent],
  imports: [
    CommonModule,
    PriceBookItemRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    ReactiveFormsModule,
    NgbModule.forRoot(),
    FormsModule,
    DirectivesModule
  ]
})
export class PriceBookItemModule { }
