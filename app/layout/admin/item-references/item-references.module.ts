import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ItemReferencesRoutingModule } from './item-references-routing.module';
import { ItemReferencesComponent } from './item-references.component';
import { PageHeaderModule } from 'src/app/shared';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [ItemReferencesComponent],
  imports: [
    CommonModule,
    ItemReferencesRoutingModule,
    NgbModule.forRoot(),
    PageHeaderModule,
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ItemReferencesModule { }
