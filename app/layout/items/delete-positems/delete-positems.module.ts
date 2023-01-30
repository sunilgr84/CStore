import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DeletePOSItemsRoutingModule } from './delete-positems-routing.module';
import { DeletePOSItemsComponent } from './delete-positems.component';
import { PageHeaderModule } from '@shared/modules';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [DeletePOSItemsComponent],
  imports: [
    CommonModule,
    DeletePOSItemsRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
  ]
})
export class DeletePOSItemsModule { }
