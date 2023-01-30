import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '@shared/directive/directives.module';

@NgModule({
    imports: [CommonModule, LoginRoutingModule, FormsModule, DirectivesModule],
    declarations: [LoginComponent]
})
export class LoginModule { }
