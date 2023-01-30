import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemRoutingModule } from './item-routing.module';
import { ItemComponent } from './item.component';
// import { AddItemComponent } from './add-item/add-item.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
// import { AddVendoritemsComponent } fro../add-item/add-vendoritems/add-vendoritems.componentent';
// import { AddItemgroupComponent } fro../add-item/add-itemgroup/add-itemgroup.componentent';
// Import ngx-barcode module
import { NgxBarcodeModule } from 'ngx-barcode';
import { DirectivesModule } from '@shared/directive/directives.module';
import { MatCheckboxModule } from '@angular/material';

@NgModule({
  declarations: [ItemComponent],
  imports: [
    CommonModule,
    ItemRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    NgxBarcodeModule,
    DirectivesModule,
    MatCheckboxModule
  ],
  // entryComponents: [AddVendoritemsComponent, AddItemgroupComponent]
})
export class ItemModule { }
