import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VendorRoutingModule } from './vendor-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { VendorComponent } from './vendor.component';
import { PageHeaderModule } from '@shared/modules';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVendorComponent } from './add-vendor/add-vendor.component';
import { VendorItemComponent } from './vendor-item/vendor-item.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({

  imports: [
    CommonModule,
    VendorRoutingModule,
    NgbModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderModule, DirectivesModule,
    NgSelectModule,
    GooglePlaceModule
  ], declarations: [VendorComponent, AddVendorComponent, VendorItemComponent],
})
export class VendorModule { }
