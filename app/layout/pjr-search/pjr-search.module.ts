import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PjrSearchComponent } from './pjr-search.component';
import { PjrSearchRoutingModule } from './pjr-search-routing.module';
import { PageHeaderModule } from 'src/app/shared';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


@NgModule({
  declarations: [PjrSearchComponent],
  imports: [
    CommonModule,
    PjrSearchRoutingModule,
    PageHeaderModule,
    CommonComponentModule,
    NgSelectModule,
    ReactiveFormsModule,
    MatSlideToggleModule, Ng2Charts,FormsModule,
    NgbModule.forRoot()
  ]
})
export class PjrSearchModule { }
