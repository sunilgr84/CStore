import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthGuard } from './shared';
import { CommonServiceModule } from './shared/services/common-services.module';
// Import 3rd party components
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { NgxMatDatetimePickerModule, NgxMatTimepickerModule } from 'ngx-mat-datetime-picker';
import 'ag-grid-enterprise';
import { TimeoutInterceptor, DEFAULT_TIMEOUT } from '@shared/core/timeout.interceptor';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UploadFilesComponent } from './upload-files/upload-files.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NgxSpinnerModule,
    NgxMatTimepickerModule,
    NgxMatDatetimePickerModule,
    NgbModule.forRoot(),
    CommonServiceModule.forRoot(),
    ToastrModule.forRoot({
      timeOut: 10000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
    }),
  ],
  declarations: [AppComponent, UploadFilesComponent],
  providers: [
    AuthGuard,
    {
      provide: LocationStrategy,
      useClass: HashLocationStrategy
    },
   // [{ provide: HTTP_INTERCEPTORS, multi: true }],// useClass: TimeoutInterceptor,
   // [{ provide: DEFAULT_TIMEOUT, useValue: 30000 }]
    // ,{
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: HttpConfigInterceptor,
    //   multi: true
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
