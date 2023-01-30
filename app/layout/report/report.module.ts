import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { CommonComponentModule } from '@shared/component/common-component.module';

@NgModule({
  declarations: [ReportComponent],
  imports: [
    CommonModule,
    ReportRoutingModule,
    PageHeaderModule,
    ReactiveFormsModule,
    FormsModule,
    DirectivesModule,
    CommonComponentModule,

  ]
})
export class ReportModule { }
