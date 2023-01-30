import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MovePackRoutingModule } from './move-pack-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MovePackComponent } from './move-pack.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { DirectivesModule } from '@shared/directive/directives.module';

@NgModule({
  declarations: [MovePackComponent],
  imports: [
    CommonModule,
    MovePackRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonComponentModule,
    DirectivesModule
  ]
})
export class MovePackModule { }
