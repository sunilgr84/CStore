import { Component, OnInit } from '@angular/core';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { SetupService } from '@shared/services/setupService/setup-service';
import { NgxSpinnerService } from 'ngx-spinner';
import { GridService } from '@shared/services/grid/grid.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-store-health',
  templateUrl: './store-health.component.html',
  styleUrls: ['./store-health.component.scss']
})
export class StoreHealthComponent implements OnInit {
  userInfo: any;

  
  //1 - only error records
  //0 - all
  status: boolean = true;


  storeLocationList: any = [];
  storeLocationObj: any = {};
  serviceHealthList: any = [];
  posHealthList: any = [];
  pjrStatusList: any = [];
  companyIds: any = [];

  healthGridOptions: any;
  healthGridApi: any;
  healthGridCoulmnApi: any;

  serviceHealthGridOptions:any;
  serviceHealthGridApi:any;
  serviceHealthColumnApi : any;
  pjrGridOptions : any;
  pjrGridApi:any;
  pjrGridColumnApi:any;

  constructor(private constants: ConstantService, private storeService: StoreService, 
    private setupService: SetupService, private spinner: NgxSpinnerService, private gridService: GridService,
   ) { 
    this.userInfo = this.constants.getUserInfo();
    this.healthGridOptions = this.gridService.getGridOption(
      this.constants.gridTypes.storeHealthGrid
    );

    this.serviceHealthGridOptions = this.gridService.getGridOption(
      this.constants.gridTypes.serviceHealthGrid
    );

    this.pjrGridOptions = this.gridService.getGridOption(
      this.constants.gridTypes.pjrGrid
    );

  }

  ngOnInit() {
    this.refreshAll();
  }

  refreshAll(){
    this.getStoreLocation();
    this.getPosServiceHealth();
    this.getStoreServiceHealth();
    this.getPjrStatus();
  }

  onHealthGridReady(params) {
    this.healthGridApi = params.api;
    this.healthGridCoulmnApi = params.columnApi;
    this.setVisibleColumns(this.healthGridCoulmnApi);
    if (this.posHealthList && this.posHealthList.length > 0) {
      // setTimeout(() => {
      this.healthGridApi.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
      this.healthGridApi.sizeColumnsToFit();
      this.healthGridApi.expandAll();
      // }, 2000);
    }
  }

  onServiceHealthGridReady(params){
    this.serviceHealthGridApi = params.api;
    this.serviceHealthColumnApi = params.columnApi;
    this.setVisibleColumns(this.serviceHealthColumnApi);
    if (this.serviceHealthList && this.serviceHealthList.length > 0) {
      // setTimeout(() => {
      this.serviceHealthGridApi.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
      this.serviceHealthGridApi.sizeColumnsToFit();
      this.serviceHealthGridApi.expandAll();
      // }, 2000);
    }
  }
  onpjrGridReady(params){
    this.pjrGridApi = params.api;
    this.pjrGridColumnApi = params.columnApi;
    this.setVisibleColumns(this.pjrGridColumnApi);
    if (this.pjrStatusList && this.pjrStatusList.length > 0) {
      // setTimeout(() => {
      this.pjrGridApi.forEachNode(function (rowNode) {
        if (rowNode.group) {
          rowNode.setExpanded(true);
        }
      });
      this.pjrGridApi.sizeColumnsToFit();
      this.pjrGridApi.expandAll();
      // }, 2000);
    }
  }

  onStatusChange(e){
    // if((!e.checked) == (this.status == 0)){
    //   return;
    // }
    this.status = e.checked;
    this.serviceHealthList = [];
    this.posHealthList = [];
    this.pjrStatusList = [];
   
    this.refreshAll();
  }

  setVisibleColumns(current){
    if (this.status) {
      current.removeRowGroupColumn('CompanyID')
      current.setColumnsVisible(['CompanyID'], false);
    } else {
      current.addRowGroupColumn('CompanyID')
      current.setColumnsVisible(['CompanyID'], false);
    }
  }

  getQueryString(){
    //removed so super admin can see full list
    //this page won't show to company admin
    //(this.userInfo.companyId? 'companyID=' + this.userInfo.companyId : "") + 
    return  (this.status ? 'status=' + this.status: "");
  }

  parseResponse(r, type){
    let pr = [];
    let k = [];
    r.forEach(e => {
      if (!this.status) {
        k = e.StoreLocations;
        let p;
        if (type == 'getStorePOSStatus')
          p = _.sortBy(k, o => o.pos);
        if (type == 'getStoreServiceHealthStatus' || type == 'getStorePJRStatus')
          p = _.sortBy(k, o => o.Status);
        for (let i = 0; i < p.length; i++) {
          p[i]["CompanyID"] = e.CompanyID;
        }
      pr = [...pr, ...p]
      }
      else{
        let p = e.StoreLocations;
        for (let i = 0; i < p.length; i++) {
          p[i]["CompanyID"] = e.CompanyID;
          k.push(p[i]);
        }
      }
    });
    if(this.status){
      let p;
      if (type == 'getStorePOSStatus')
        p = _.sortBy(k, o => o.pos);
      if (type == 'getStoreServiceHealthStatus' || type == 'getStorePJRStatus')
        p = _.sortBy(k, o => o.Status);
      pr = [...pr, ...p] 
    }

    return pr;
  }


  bindStoreList(list: any){
    this.storeLocationList = this.storeLocationList.concat(list);
    list.forEach(s => { 
      this.storeLocationObj[s.storeLocationID] = s.storeName;
    });
  }

  getStoreLocation() {
    if(this.storeLocationList && this.storeLocationList.length){
      return;
    }
    this.storeService.getStoreLocationList().subscribe((response) => {
      this.bindStoreList(response);
    }, (error) => {
      console.log(error);
    });
  }

  getStoreLocationName(store){
    let s = this.storeLocationObj[store.StoreLocationID];
    if(s){
      return s;
    }
    return store.StoreLocationID
  }

  getStoreServiceHealth(){
    this.spinner.show();
    
    this.setupService.getDataElastic('elastic/getStoreServiceHealthStatus?' + this.getQueryString())
    .subscribe((response) => {
      this.serviceHealthList = this.parseResponse(response, 'getStoreServiceHealthStatus');
      this.spinner.hide();
    });
  }


  getPosServiceHealth(){
    this.spinner.show();

    this.setupService.getDataElastic('elastic/getStorePOSStatus?' + this.getQueryString())
    .subscribe((response) => {
      this.posHealthList = this.parseResponse(response, 'getStorePOSStatus');
      this.spinner.hide();
    });
  }
  
  getPjrStatus(){
    this.spinner.show();

    this.setupService.getDataElastic('elastic/getStorePJRStatus?' + this.getQueryString())
    .subscribe((response) => {
      this.pjrStatusList = this.parseResponse(response, 'getStorePJRStatus');
      this.spinner.hide();
    });
  }
}
