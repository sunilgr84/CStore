import { Injectable } from '@angular/core';
import { ConstantService } from '../constant/constant.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { noComponentFactoryError } from '@angular/core/src/linker/component_factory_resolver';
import { Observable, ObservableLike } from 'rxjs';
import { SetupService } from '../setupService/setup-service';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScanDataService {

  // baseUrl = 'http://104.239.143.92:5007/';
  baseUrl;

  userInfo: any;
  constructor(private constantService: ConstantService,
    private http: HttpClient,
    private dataService: SetupService,
  ) {
    this.baseUrl = environment.scandataBaseUrl;
  }

  getHeaders(isMultipart?) {
    this.userInfo = this.constantService.getUserInfo();
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

  getManufacturers(): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/getmanufacturers');
  }

  getManufacturersByCompanyId(id): Observable<any> {
    return this.http.get(this.baseUrl + 'api/ScanData/getmanufacturerfromsetup/' + id);
  }

  testConnection(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Common/testconnection', body);
  }

  getManufacturerSetupDetail(id): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Setup/getmanufacturersetupdetail/' + id);
  }

  getDataHandlers(): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/getdatahandlers');
  }

  getCompaniesByManufacturer(id): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/getcompaniesbymanufacturer/' + id);
  }

  getStoresByCompany(id): Observable<any> {
    // return this.http.get(this.baseUrl + 'api/Common/getstoresbycompany/' + id);
    return this.dataService.getData('StoreLocation/GetStoresDetailsByCompanyId/' + id)
      .pipe(map((response) => {
        return response;
      }));
  }

  getManufacturerSetup(): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/Setup/getmanufacturersetup');
  }

  addManufacturerSetup(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Setup/addmanufacturersetup', body);
  }

  updateManufacturerSetup(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Setup/updatemanufacturersetup', body);
  }

  deleteManufacturerSetup(id): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/Setup/deletemanufacturersetup/' + id);
  }

  getCompanySetup(companyId): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/Setup/getcompanysetup/' + companyId);
  }

  addCompanySetup(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Setup/addcompanysetup', body);
  }

  updateCompanySetup(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Setup/updatecompanysetup', body);
  }

  deleteCompanySetup(id): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/Setup/deletecompanysetup/' + id);
  }

  getScanData(mId, cId, sId): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/ScanData/getscanneddata/' + mId + '/' + cId + '/' + sId);
  }

  getScanDataByDate(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getscandatabydate/', body);
  }

  getScanDataByJournal(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getscanneddatabyjournal/', body);
  }

  getScanDataByTransaction(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getscanneddatabytransaction/', body);
  }

  getScanDataByUPC(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getscanneddatabyupc/', body);
  }

  getScanDataByDateCount(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getscandatabydatecount/', body);
  }

  getKpiCardData(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/getkpicarddata/', body);
  }

  getScanDataFile(id): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/ScanData/getfile/' + id, { responseType: 'text' });
  }

  getScanDataLogs(): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/ScanData/getfilesubmissionlogs/');
  }

  retryScanDataLogs(id): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/ScanData/retryfilesubmission/' + id);
  }

  updateScanData(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/ScanData/updatescanneddata', body);
  }

  getSubmissionTypes(): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/getsubmissiontypes');
  }

  getSubmissionTypeForCompany(manufacturerId, companyId, storeId): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/getsubmisstiontypeforcompany/' + manufacturerId + '/' + companyId + '/' + storeId);
  }

  changeSubmissionType(setupId, submissionTypeId): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Common/changesubmissiontype/' + setupId + '/' + submissionTypeId);
  }

  reSubmitData(WeekEndDate, manufacturerId, companyId, storeId, userName): Observable<any> {
    return this.http.get(this.baseUrl + 'api/ScanData/resubmitdata/' + WeekEndDate + '/' + manufacturerId + '/' + companyId + '/' + storeId + '/' + userName);
  }

  markAsSubmit(WeekEndDate, manufacturerId, companyId, storeId, userName): Observable<any> {
    return this.http.get(this.baseUrl + 'api/ScanData/marksubmit/' + WeekEndDate + '/' + manufacturerId + '/' + companyId + '/' + storeId + '/' + userName);
  }

  reSyncData(WeekEndDate, manufacturerId, companyId, storeId): Observable<any> {
    return this.http.get(this.baseUrl + 'api/ScanData/resyncdata/' + WeekEndDate + '/' + manufacturerId + '/' + companyId + '/' + storeId);
  }

  downloadFile(WeekEndDate, manufacturerId, companyId, storeId): Observable<any> {
    // const httpOptions = { headers: new HttpHeaders().set('responseType', 'text') };
    return this.http.get(this.baseUrl + 'api/ScanData/downloadfile/' + WeekEndDate + '/' + manufacturerId + '/' + companyId + '/' + storeId, { responseType: 'text' });
  }

  downloadFileFromLog(logId): Observable<any> {
    // const httpOptions = { headers: new HttpHeaders().set('responseType', 'text') };
    return this.http.get(this.baseUrl + 'api/ScanData/downloadFileFromLog/' + logId, { responseType: 'text' });
  }

  getFileLog(body): Observable<any> {
    // const httpOptions = { headers: new HttpHeaders().set('responseType', 'text') };
    return this.http.post(this.baseUrl + 'api/ScanData/getFileLogs/', body);
  }

  getFileLogCount(): Observable<any> {
    // const httpOptions = { headers: new HttpHeaders().set('responseType', 'text') };
    return this.http.get(this.baseUrl + 'api/ScanData/getfilelogcount/');
  }

  validateData(journalId): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.get(this.baseUrl + 'api/ScanData/validatedata/' + journalId);
  }

  getScanDataReport(body): Observable<any> {
    // const httpOptions = this.getHeaders();
    return this.http.post(this.baseUrl + 'api/Dashboard/getscandatareport', body);
  }

  getScanDataAcknowledgment(body): Observable<any> {
    return this.http.post(this.baseUrl + 'api/Acknowlegment/getscandataacknowlegmentlist', body);
  }

  getScanDataAcknowledgmentJsonFile(scanDataAckowlegmentID): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Acknowlegment/getscandataacknowlegmentjsonfile/' + scanDataAckowlegmentID);
  }

  getScanDataAcknowledgmentLogs(scanDataAckowlegmentID): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Acknowlegment/getscandataacknowlegmentlogs/' + scanDataAckowlegmentID);
  }

  downloadScanDataAcknowledgmentFile(fileName): Observable<any> {
    return this.http.get(this.baseUrl + 'api/Acknowlegment/getscandataacknowlegmentrejectedfile?rejectedFilePath=' + fileName, { responseType: 'text' });
  }

  resyncScanData(startDate, endDate, manufacturerId, companyId, storeId, userName): Observable<any> {
    return this.http.get(this.baseUrl + 'api/ScanData/resyncdata/' + startDate + '/' + endDate + '/' + manufacturerId + '/' + companyId + '/' + storeId + '/' + userName);
  }

  downloadScanDataFile(startDate, endDate, manufacturerId, companyId, storeId, userName): Observable<any> {
    // const httpOptions = { headers: new HttpHeaders().set('responseType', 'text') };
    return this.http.get(this.baseUrl + 'api/ScanData/downloadfile/' + startDate + '/' + endDate + '/' + manufacturerId + '/' + companyId + '/' + storeId + '/' + userName, { responseType: 'text' });
  }

}
