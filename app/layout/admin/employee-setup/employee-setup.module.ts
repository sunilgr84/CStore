import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmployeeSetupRoutingModule } from './employee-setup-routing.module';
import { EmployeeSetupComponent } from './employee-setup.component';
import { PageHeaderModule } from 'src/app/shared';
import { NgbModalModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { DirectivesModule } from '@shared/directive/directives.module';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [EmployeeSetupComponent],
  imports: [
    CommonModule,
    EmployeeSetupRoutingModule,
    PageHeaderModule,
    NgbModule.forRoot(),
    CommonComponentModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule, DirectivesModule
  ]
})
export class EmployeeSetupModule { }
