import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ActivatePackRoutingModule } from './activate-pack-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatePackComponent } from './activate-pack.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { DirectivesModule } from '@shared/directive/directives.module';
import { MatSlideToggleModule } from '@angular/material';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [ActivatePackComponent],
  imports: [
    CommonModule,
    ActivatePackRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonComponentModule,
    DirectivesModule,
    MatSlideToggleModule,
    NgxSpinnerModule
  ]
})
export class ActivatePackModule { }
