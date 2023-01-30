import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { LicenseManager } from 'ag-grid-enterprise';
// tslint:disable-next-line:max-line-length
LicenseManager.setLicenseKey('Satish_Kalva_360visioninc_single_1_Devs_1_Deployment_License_9_September_2020_[v2]_MTU5OTYwOTYwMDAwMA==4a50dc59d33c69e72a72b9ac626d935e');

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
