import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { ChangeCompanyComponent } from '@shared/modal-component/change-company/change-company.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SidebarMenuModule } from 'angular-sidebar-menu';
import { NewSidebarComponent } from './components/new-sidebar/new-sidebar.component';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule.forRoot(),
        NgbModule,
        NgSelectModule,
        FormsModule,
        SidebarMenuModule
    ],
    declarations: [LayoutComponent, SidebarComponent, NewSidebarComponent, HeaderComponent, ChangeCompanyComponent],
    entryComponents: [ChangeCompanyComponent]
})
export class LayoutModule { }
