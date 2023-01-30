import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CopyDataRoutingModule } from './copy-data-routing.module';
import { CopyDataComponent } from './copy-data.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [CopyDataComponent],
  imports: [
    CommonModule,
    CopyDataRoutingModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule, DirectivesModule,
    // tslint:disable-next-line: deprecation
    NgbModule.forRoot(),
  ]
})
export class CopyDataModule { }
