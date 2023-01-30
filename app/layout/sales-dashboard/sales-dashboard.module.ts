import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesDashboardRoutingModule } from './sales-dashboard-routing.module';
import { SalesDashboardComponent } from './sales-dashboard.component';
import { MatSelectModule, MatTooltipModule } from '@angular/material';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    SalesDashboardComponent
  ],
  imports: [
    CommonModule, SalesDashboardRoutingModule, MatSelectModule,
    Ng2Charts, CommonComponentModule, ReactiveFormsModule, NgbModule, MatTooltipModule,
    NgSelectModule, FormsModule
  ]
})
export class SalesDashboardModule { }
