import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageHeaderModule, DualListBoxModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FromPosRoutingModule } from './from-pos-routing.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    FromPosRoutingModule,
    ReactiveFormsModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbTypeaheadModule,
    DualListBoxModule,
    NgSelectModule,
    NgbModule
  ]
})
export class FromPosModule { }