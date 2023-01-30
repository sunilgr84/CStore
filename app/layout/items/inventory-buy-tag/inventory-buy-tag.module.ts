import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryBuyTagRoutingModule } from './inventory-buy-tag-routing.module';
import { InventoryBuyTagComponent } from './inventory-buy-tag.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PageHeaderModule } from 'src/app/shared';

@NgModule({
  declarations: [InventoryBuyTagComponent],
  imports: [
    CommonModule,
    InventoryBuyTagRoutingModule,
    CommonComponentModule,
    PageHeaderModule,
    NgbModule.forRoot(),

  ]
})
export class InventoryBuyTagModule { }
