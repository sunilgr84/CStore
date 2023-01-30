import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { NewDashboardRoutingModule } from './new-dashboard-routing.module';
import { NewDashboardComponent } from './new-dashboard.component';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { FormsModule } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@NgModule({
  declarations: [NewDashboardComponent],
  imports: [
    CommonModule,
    NewDashboardRoutingModule,
    CommonComponentModule,
    FormsModule, Ng2Charts,
    MatIconModule
  ]
})
export class NewDashboardModule { }
