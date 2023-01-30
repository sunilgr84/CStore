import { Injectable } from '@angular/core';
import { SetupService } from '../setupService/setup-service';
import { map } from 'rxjs/operators';

@Injectable()
export class StoreService {
  storeLocation: any;
  vendorList: any;
  departmentList: any;

  constructor(private dataService: SetupService) {
  }

  /**
   * @description - get Store Locations
   * @param companyId - require to get stores by company
   */
  getStoresByCompanyId(companyId) {
    return this.dataService.getData('StoreLocation/GetStoresDetailsByCompanyId/' + companyId)
      .pipe(map((response) => {
        return response;
      }));
  }
  getPaymentByCompanyID(companyId) {
    return this.dataService.getData('PaymentSource/getListByCompanyID/' + companyId)
      .pipe(map((response) => {
        return response;
      }));
  }
  getVendorByCompanyId(companyId) {
    return this.dataService.getData('Vendor/getAll/' + companyId)
      .pipe(map((response) => {
        return response;
      }));
  }

  getByCompanyId(companyId, userName) {
    return this.dataService.getData(`StoreLocation/getByCompanyId/${companyId}/${userName}`)
      .pipe(map((response) => {
        return response;
      }));
  }

  /**
   * @description - to get the store loction
   * @param companyId - required
   * @param userName - required
   */
  getStoreLocation(companyId, userName, refresh: boolean = false) {
    if (!this.storeLocation || refresh) {
      return this.dataService.getData(`StoreLocation/getByCompanyId/${companyId}/${userName}`)
        .pipe(map((response) => {
          return this.storeLocation = response;
        }));
    } else {
      return this.storeLocation;
    }
  }

  getStoreLocationList(active = "true") {
    return this.dataService.getData(`StoreLocation/getAllLocations/${active}`)
      .pipe(map((response) => {
        return response;
      }));
  }

  getVendorList(companyId, refresh: boolean = false) {
    if (!this.vendorList || refresh) {
      return this.dataService.getData('Vendor/getAll/' + companyId)
        .pipe(map((response) => {
          this.vendorList = response;
          this.vendorList.sort(function (a, b) {
            if (a.vendorName.toLowerCase() < b.vendorName.toLowerCase()) { return -1; }
            if (a.vendorName.toLowerCase() > b.vendorName.toLowerCase()) { return 1; }
            return 0;
          })
          return this.vendorList;
        }));
    } else {
      return this.vendorList;
    }
  }

  getDepartment(companyId, userName, refresh: boolean = false) {
    if (!this.departmentList || refresh) {
      return this.dataService.getData(`Department/getAll/${userName}/${companyId}`)
        .pipe(map((response) => {
          return this.departmentList = response;
        }));
    } else {
      return this.departmentList;
    }
  }
  getDepartmentByCompanyIdAndStoreId(companyId, storeId) {
    return this.dataService.getData('Department/GetAllDepartmentByStoreAndCompany/' + companyId + '/' + storeId)
      .pipe(map((response) => {
        return response;
      }));
  }
}
