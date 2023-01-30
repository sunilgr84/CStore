import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ScanDataRoutingModule } from './scan-data-routing.module';
import { ScanDataComponent } from './scan-data.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { PageHeaderModule } from 'src/app/shared';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ScanDataComponent],
  imports: [
    CommonModule,
    ScanDataRoutingModule,
    ScanDataRoutingModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    PageHeaderModule,
    ReactiveFormsModule,
    NgSelectModule,
  ]
})
export class ScanDataModule { }
