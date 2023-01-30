import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MixMatchesRoutingModule } from './mix-matches-routing.module';
import { MixMatchesComponent } from './mix-matches.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { MixMatchItemComponent } from './mix-match-item/mix-match-item.component';
import { MixMatchStoreComponent } from './mix-match-store/mix-match-store.component';
import { MixMatchPriceLocationComponent } from './mix-match-price-location/mix-match-price-location.component';
@NgModule({
  declarations: [MixMatchesComponent, MixMatchItemComponent, MixMatchStoreComponent, MixMatchPriceLocationComponent],
  imports: [
    CommonModule,
    MixMatchesRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgMultiSelectDropDownModule,
  ]
})
export class MixMatchesModule { }
