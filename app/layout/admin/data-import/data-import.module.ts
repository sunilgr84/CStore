import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataImportRoutingModule } from './data-import-routing.module';
import { DataImportComponent } from './data-import.component';
import { PageHeaderModule, DualListBoxModule } from 'src/app/shared';
import { CommonComponentModule } from 'src/app/shared/component/common-component.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { importType } from '@angular/compiler/src/output/output_ast';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [DataImportComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DataImportRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgbTypeaheadModule,
    DualListBoxModule,
    NgSelectModule
  ]
})
export class DataImportModule { }
