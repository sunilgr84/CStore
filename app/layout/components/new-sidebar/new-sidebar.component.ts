import { Component, OnInit } from '@angular/core';
import { NewRouteInfo } from '@shared/config/new-route.config';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NewRouteConfigService } from '@shared/services/routeConfig/new-route-config.service';
import { Modes } from 'angular-sidebar-menu';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
  selector: 'app-new-sidebar',
  templateUrl: './new-sidebar.component.html',
  styleUrls: ['./new-sidebar.component.scss']
})
export class NewSidebarComponent implements OnInit {
  modes = Modes
    mode: Modes = Modes.EXPANDED;
    menu: NewRouteInfo[] = [];
    userInfo = {
      companyName: null,
      companyId: null,
      storeLocation: null,
      roleName: null,
      userName: null
    };
    constructor( private spinner: NgxSpinnerService, private constant: ConstantService, private sideBarMenu: NewRouteConfigService){}
  ngOnInit(): void {
    this.spinner.show();
    this.userInfo = this.constant.getUserInfo();
    setTimeout(() => {
      this.menu = this.sideBarMenu.getSideBarMenuByRoleName(this.userInfo, this.userInfo['companyId']);
      console.log(this.menu);
      
      this.spinner.hide();
    }, 500);
  }
  
}
