import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from '@shared/services/store/store.service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-lottery-details',
  templateUrl: './lottery-details.component.html',
  styleUrls: ['./lottery-details.component.scss']
})
export class LotteryDetailsComponent implements OnInit {
  tabsInitialized = false;
  @ViewChild('tabs') public tabs: NgbTabset;
  setData: any; // active pack data
  storeLocationList = [];
  userInfo = this.constant.getUserInfo();
  _activeTab: any;
  constructor(private constant: ConstantService, private storeService: StoreService) {
    this.getStoreLocation();
  }

  ngOnInit() {


  }
  // OutPut event Tab Change
  selectTab(params) {
    this.setData = params.data;
    this.tabs.select(params.tabId);
  }
  tabChange(event) {
    this.getStoreLocation();
    this._activeTab = event;

  }
  getStoreLocation() {
    this.storeService.getByCompanyId(this.userInfo.companyId, this.userInfo.userName).subscribe(response => {
      this.storeLocationList = response;
    });
  }
}
