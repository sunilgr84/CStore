import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ISMUpdateComponent } from './ismupdate.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { ISMUpdateRoutingModule } from './ismupdate-routing.module';

@NgModule({
  declarations: [ISMUpdateComponent],
  imports: [
    CommonModule,
    NgSelectModule,
    CommonComponentModule, FormsModule,
    ISMUpdateRoutingModule
  ]
})
export class ISMUpdateModule { }
