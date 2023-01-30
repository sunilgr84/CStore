import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReturnPackRoutingModule } from './return-pack-routing.module';
import { ReturnPackComponent } from './return-pack.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { DirectivesModule } from '@shared/directive/directives.module';

@NgModule({
  declarations: [ReturnPackComponent],
  imports: [
    CommonModule,
    ReturnPackRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonComponentModule,
    DirectivesModule
  ]
})
export class ReturnPackModule { }
