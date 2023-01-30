import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromotionsRoutingModule } from './promotions-routing.module';
import { PromotionsComponent } from './promotions.component';
import { PageHeaderModule } from '@shared/modules';
import { ItemMaintanenceComponent } from './item-maintanence/item-maintanence.component';
import { ComboMaintanenceComponent } from './combo-maintanence/combo-maintanence.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';
import { MixmatchMaintanneceComponent } from './mixmatch-maintannece/mixmatch-maintannece.component';
import { DirectivesModule } from '@shared/directive/directives.module';

@NgModule({
  declarations: [PromotionsComponent, ItemMaintanenceComponent, ComboMaintanenceComponent, MixmatchMaintanneceComponent],
  imports: [
    CommonModule,
    PromotionsRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbModule.forRoot(),
    ReactiveFormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgSelectModule,
    FormsModule,
    DirectivesModule
  ]
})
export class PromotionsModule { }
