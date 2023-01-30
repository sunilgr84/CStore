import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StoreInformtionRoutingModule } from './store-informtion-routing.module';
import { StoreInformtionComponent } from './store-informtion.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { PageHeaderModule } from 'src/app/shared';
import { GooglePlaceModule } from 'ngx-google-places-autocomplete';

@NgModule({
  declarations: [StoreInformtionComponent],
  imports: [
    CommonModule,
    StoreInformtionRoutingModule,
    NgbModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    DirectivesModule,
    PageHeaderModule,
    GooglePlaceModule
  ],
  exports: [StoreInformtionComponent]
})
export class StoreInformtionModule { }
