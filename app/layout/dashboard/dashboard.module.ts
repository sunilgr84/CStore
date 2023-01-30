import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ChartsModule as Ng2Charts } from 'ng2-charts';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule } from '@angular/forms';
import { CommonComponentModule } from '@shared/component/common-component.module';
import { MatIconModule } from '@angular/material';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
    imports: [
        CommonModule,
        CommonComponentModule,
        FormsModule, Ng2Charts,
        MatIconModule, DashboardRoutingModule,NgSelectModule,NgbModule
    ],
    declarations: [
        DashboardComponent
    ],
    providers: [CurrencyPipe]
})
export class DashboardModule { }
