/**
 * @author - Mahadev Punekar
 * @created on - 12 jan 19
 * @description - to get/post the company related information
 */
import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { catchError, map } from 'rxjs/operators';
import { LoggerService } from '../logger/logger.service';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ConstantService } from '../constant/constant.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Injectable()
export class SetupService {
  userInfo: any;

  constructor(private http: HttpClient, private logger: LoggerService, private router: Router,
    private constantService: ConstantService, private toastr: ToastrService) {
    // this.userInfo = this.constantService.getUserInfo();
  }

  getHeaders(isMultipart?, isUploadComp?) {
    this.userInfo = this.constantService.getUserInfo();
    if(isUploadComp) {
      return {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        })
      };
    }
    if (isMultipart) {
      return {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'multipart/form-data',
          Authorization: 'Bearer ' + this.userInfo.token
        })
      };
    } else {
      return {
        headers: new HttpHeaders({
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + this.userInfo.token
        })
      };
    }
  }
  /** GET: get data from the server */
  getData(apiName: string, requestParams?: string, isFrom?: boolean, isFromWhich?: string): Observable<any> {
    const httpOptions = this.getHeaders();
    if (requestParams) {
      apiName = apiName + '?' + requestParams;
    }
    return this.http.get(environment.baseUrl + apiName, httpOptions).pipe(
      map(response => {
        if (response && response['statusCode'] === 200) {
          return response['data'];
        } else {
          this.showOrmLiteMessage(response);
          return response;
        }
      }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    );
  }

  /** GET: get data from the server by getting 200 res in message string */
  getDataString(apiName: string, requestParams?: string): Observable<any> {
    const httpOptions = this.getHeaders();
    if (requestParams) {
      apiName = apiName + '?' + requestParams;
    }
    return this.http.get(environment.baseUrl + apiName, httpOptions).pipe(
      map(response => {
        if (response && response['statusCode'] === 200) {
          return response['message'];
        } else {
          this.showOrmLiteMessage(response);
          return response;
        }
      }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    );
  }


  /** GET: get data from the server */
  getDataResponse(apiName: string, requestParams?: string, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    if (requestParams) {
      apiName = apiName + '?' + requestParams;
    }
    return this.http.get(environment.baseUrl + apiName, httpOptions)
      .pipe(map((response) => {
        return response;
      }),
        catchError((error) => {
          return throwError(error);
        })
      );
  }

  /** PUT: update data on the server */
  updateData(apiName: string, reqestObj: any, isMultipart?: boolean, isFrom?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http
      .put(environment.baseUrl + apiName, reqestObj, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  /** POST: validate buydown prices */
  validateSellingPrice(apiName: string, reqestObj: any, isMultipart?: boolean, isFrom?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http
      .post(environment.baseUrl + apiName, reqestObj, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response;
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  /** POST: validate add UPC code */
  validateAddUPCCode(apiName: string, reqestObj: any, isMultipart?: boolean, isFrom?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http
      .post(environment.verifyBuyDownPrices + apiName, reqestObj, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response;
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  /** PUT: update data on the server by getting 200 res in message string   */
  updateDataString(apiName: string, reqestObj: any, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http
      .put(environment.baseUrl + apiName, reqestObj, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response['message'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  /** POST: send data to the server */
  postData(apiName: string, requestObject: any, isUploadComp?: boolean, isMultipart?: boolean, isFrom?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart, isUploadComp);
    return this.http
      .post<any>(environment.baseUrl + apiName, requestObject, httpOptions) //environment.baseUrl
      .pipe(
        map(response => {
          if (response && response.statusCode === 200) {
            return response['data'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  postDataString(apiName: string, requestObject: any, isMultipart?: boolean): Observable<any> {
    const httpOptions = this.getHeaders(isMultipart);
    return this.http
      .post<any>(environment.baseUrl + apiName, requestObject, httpOptions)
      .pipe(
        map(response => {
          if (response && response.statusCode === 200) {
            return response['message'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }


  /** DELETE: send data to the server */
  deleteData(apiName: string): Observable<any> {
    const httpOptions = this.getHeaders();
    return this.http
      .delete<any>(environment.baseUrl + apiName, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  deleteDataString(apiName: string): Observable<any> {
    const httpOptions = this.getHeaders();
    return this.http
      .delete<any>(environment.baseUrl + apiName, httpOptions)
      .pipe(
        map(response => {
          if (response && response['statusCode'] === 200) {
            return response['message'];
          } else {
            this.showOrmLiteMessage(response);
            return response;
          }
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      );
  }

  getCountyState() {
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'County/Get', httpOptions).pipe(
        map(response => {
          return response['data'];
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      ),
      this.http.get(environment.baseUrl + 'State/GetAll', httpOptions).pipe(
        map(response => {
          return response['data'];
        }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      )
    );
  }
  getPOSGroupDepartment() {
    this.userInfo = this.constantService.getUserInfo();
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'POSSyncStatus/get', httpOptions)
        .pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http
        .get(environment.baseUrl + 'CompanyPriceGroup/getByCompanyID/' +
          this.userInfo.companyId, httpOptions)
        .pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      // this.http.get(environment.baseUrl + `Department/getAll/${this.userInfo.userName}/${
      //   this.userInfo.companyId}`, httpOptions)
      //   .pipe(
      //     map(response => {
      //       if (response && response['statusCode'] === 200) {
      //         return response['data'];
      //       } else {
      //         return response;
      //       }
      //     }),
      //     catchError(error => {
      //       this.tokenExp(error);
      //       return throwError(error);
      //     })
      //   ),
      // this.http.get(environment.baseUrl + 'Vendor/getAll/' + this.userInfo.companyId, httpOptions)
      //   .pipe(
      //     map(response => {
      //       if (response && response['statusCode'] === 200) {
      //         return response['data'];
      //       } else {
      //         return response;
      //       }
      //     }),
      //     catchError(error => {
      //       this.tokenExp(error);
      //       return throwError(error);
      //     })
      //   )
    );
  }

  showOrmLiteMessage(response) {
    if (response && response['statusCode'] === 500) {
      const str = response.message;
      if (str.search('10 OrmLite Tables') > 0) {
        this.toastr.error('Please contact with Administrator', 'OrmLite Issue');
      }
    }
  }
  tokenExp(error) {
    if (error && error['status'] === 401) {
      this.toastr.warning('Session Expried', 'Login');
      sessionStorage.clear();
      setTimeout(() => {
        this.router.navigate(['login']);
      }, 250);
    }
  }
  fetchFuleInvoiceById(fuelInvoiceId, locationId) {
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'FuelInvoiceDetail/getTotalAmount/' + fuelInvoiceId + '/' + locationId, httpOptions)
        .pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'FuelInvoiceOtherCharge/GetChargeByFuelInvocieID/' +
        fuelInvoiceId, httpOptions).pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(
        environment.baseUrl + 'FuelInvoiceOtherCharge/GetFuelGradebyFuelInvocieID/' +
        fuelInvoiceId + '/' + locationId, httpOptions).pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'FuelInvoiceDetail/GetFuelTaxdataByGrade/' + fuelInvoiceId, httpOptions)
        .pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        )
    );
  }
  getComboMaintance() {
    this.userInfo = this.constantService.getUserInfo();
    const httpOptions = this.getHeaders();
    return forkJoin(this.http.get(environment.baseUrl + `PromotionItemList/getAllPromotionItemList/${this.userInfo.companyId}`, httpOptions)
      .pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      ),
      this.http.get(environment.baseUrl + 'ComboDealMaintanence/GetComboPriorityTypes', httpOptions)
        .pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'POSSyncStatus/getPOSSyncStatusToptwo', httpOptions).pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      )
    );
  }

  getStoreCompetitorPrice(storeLocationId, date, serviceLevel, companyId) {
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'StoreCompetitorPrice/GetlistByDate?storelocationID=' + storeLocationId + '&priceDate='
        + date + '&CompanyID=' + companyId, httpOptions).pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'StoreCompetitorPrice/GetFuelGradePriceData?storelocationID=' + storeLocationId + '&BusinessDate='
        + date + '&CompanyID=' + companyId + '&ServiceLevel=' + serviceLevel, httpOptions).pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        )
    );
  }


  GetEDIProductName(storeLocationId) {
    const httpOptions = this.getHeaders();
    return forkJoin(
      // tslint:disable-next-line:max-line-length
      this.http.get(environment.baseUrl + 'DepartmentLocation/GetDepartmentByUpdateProductNameForEDI/' +
        storeLocationId, httpOptions).pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'DepartmentLocation/getForEDI/' +
        storeLocationId, httpOptions).pipe(map(response => {
          if (response && response['statusCode'] === 200) {
            return response['data'];
          } else {
            return response;
          }
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'DepartmentLocation/GetDepartmentByUpdateSellingPrice/' +
        storeLocationId, httpOptions).pipe(
          map(response => {
            if (response && response['statusCode'] === 200) {
              return response['data'];
            } else {
              return response;
            }
          }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
    );
  }
  getPaymentSourceList(storeLocationId: number) {
    const httpOptions = this.getHeaders();
    return this.http.get(environment.baseUrl + 'StoreBank/GetBankByStoreLocationID?StoreLocationID=' + storeLocationId, httpOptions).pipe(map(response => {
      return response['data'];
    }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    )
  }
  GetPaymentFrequencyList() {
    const httpOptions = this.getHeaders();
    return this.http.get(environment.baseUrl + 'Vendor/GetPurchaseFrequencyData', httpOptions).pipe(map(response => {
      return response['data'];
    }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    )
  }
  GetPaymentTerms() {
    const httpOptions = this.getHeaders();
    return this.http.get(environment.baseUrl + 'Vendor/GetPaymentTerms', httpOptions).pipe(map(response => {
      return response['data'];
    }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    )
  }
  GetVendorPaymentDrop() {
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'Vendor/GetPaymentTerms', httpOptions).pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      ),
      this.http.get(environment.baseUrl + 'Vendor/GetPurchaseFrequencyData', httpOptions).pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      ), this.http.get(environment.baseUrl + 'Vendor/GetPaymentTypes', httpOptions).pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      )
    );
  }
  getDayReconDetail(storeLocationID, movementHeaderID, shiftWiseValue) {
    const httpOptions = this.getHeaders();
    return forkJoin(
      this.http.get(environment.baseUrl + 'StoreFuelGrade/GetFGMbyMHID/' + movementHeaderID + '/' +
        storeLocationID, httpOptions).pipe(map(response => {
          // this.http.get(environment.baseUrl +
          //   'MovementHeader/GetFuelGradeSales?storeLocationID=262&movementHeaderID=836393&shiftwiseValue=0',
          //   httpOptions).pipe(map(response => {
          return response['data'];
          // return response;
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
      this.http.get(environment.baseUrl + 'MovementHeader/GetMOPsalesByMHID/' + movementHeaderID, httpOptions).pipe(map(response => {
        return response['data'];
      }),
        catchError(error => {
          this.tokenExp(error);
          return throwError(error);
        })
      ),
      this.http.get(environment.baseUrl + 'StoreFuelGrade/GetMCMbyMHID/' + movementHeaderID,
        httpOptions).pipe(map(response => {
          return response['data'];
        }),
          catchError(error => {
            this.tokenExp(error);
            return throwError(error);
          })
        ),
    );
  }

  fetchBanksByCompanyAndStores() {
    const httpOptions = this.getHeaders();
    let request1 = this.http.get(environment.baseUrl + `StoreBank/GetBanksByCompanyID?CompanyID=${this.userInfo.companyId}`, httpOptions).pipe(
      map(response => {
        return response['data'];
      }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    );
    let request2 = this.http.get(environment.baseUrl + `StoreLocation/GetStoresDetailsByCompanyId/` + this.userInfo.companyId, httpOptions).pipe(
      map(response => {
        return response['data'];
      }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    );
    return forkJoin(request1, request2);
  }

  getDataElastic(apiName: string, requestParams?: string): Observable<any> {
    const httpOptions = this.getHeaders();
    if (requestParams) {
      apiName = apiName + '?' + requestParams;
    }
    return this.http.get(environment.baseUrl + apiName, httpOptions).pipe(
      map(response => {
        if (response && response['statusCode'] === 200) {
          return response['data'];
        } else {
          this.showOrmLiteMessage(response);
          return response;
        }
      }),
      catchError(error => {
        this.tokenExp(error);
        return throwError(error);
      })
    );
  }

}
