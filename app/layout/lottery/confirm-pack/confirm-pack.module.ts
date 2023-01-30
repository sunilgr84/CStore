import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmPackRoutingModule } from './confirm-pack-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ConfirmPackComponent } from './confirm-pack.component';
import { DirectivesModule } from '@shared/directive/directives.module';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { MatSlideToggleModule } from '@angular/material';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  declarations: [ConfirmPackComponent],
  imports: [
    CommonModule,
    ConfirmPackRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonComponentModule,
    DirectivesModule,
    MatSlideToggleModule,
    NgxSpinnerModule
  ]
})
export class ConfirmPackModule { }
