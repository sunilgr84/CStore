import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PosRoutingModule } from './pos-routing.module';
import { PosComponent } from './pos.component';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { PageHeaderModule } from 'src/app/shared';
import { ToPosComponent } from '../to-pos/to-pos.component';
import { FromPosModule } from '../from-pos/from-pos.module';
import { ToPosModule } from '../to-pos/to-pos.module';
import { FromPosComponent } from '../from-pos/from-pos.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [PosComponent,FromPosComponent, ToPosComponent ],
  entryComponents: [PosComponent],
  imports: [
    CommonModule,
    FormsModule,
    PosRoutingModule,
    ReactiveFormsModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    NgSelectModule,
    FormsModule,
    FromPosModule,
    ToPosModule
  ]
})
export class PosModule { }
