import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AddGameRoutingModule } from './add-game-routing.module';
import { AddGameComponent } from './add-game.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [AddGameComponent],
  imports: [
    CommonModule,
    AddGameRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    CommonComponentModule,
    DirectivesModule
  ]
})
export class AddGameModule { }
