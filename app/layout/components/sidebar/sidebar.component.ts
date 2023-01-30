import { Component, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, RouteConfigLoadStart } from '@angular/router';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeCompanyComponent } from '@shared/modal-component/change-company/change-company.component';
import { RouteConfigService } from '@shared/services/routeConfig/route-config.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { MessageService } from '@shared/services/commmon/message-Service';
import { Subscription } from 'rxjs';
import { SetupService } from '@shared/services/setupService/setup-service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {
  isActive = false;
  collapsed = false;
  showMenu = '';
  pushRightClass = 'push-right';
  title: string;
  menuItems: any;
  // side bar navigation for cstorebo web app
  sidebar: any;
  userInfo = {
    companyName: null,
    companyId: null,
    storeLocation: null,
    roleName: null,
    userName: null
  };
  subscription: Subscription;
  @Output() collapsedEvent = new EventEmitter<boolean>();
  closeResult: string;
  noOfItemsInPushToPOSList: any[];
  roleNameSuperAdmin: string;
  constructor(public router: Router, private constant: ConstantService, private modalService: NgbModal,
    private setupService: SetupService,
    private sideBarMenu: RouteConfigService, private spinner: NgxSpinnerService, private messageService: MessageService) {
    this.roleNameSuperAdmin = this.constant.roleName;
    this.router.events.subscribe(val => {
      if (
        val instanceof NavigationEnd &&
        window.innerWidth <= 992 &&
        this.isToggled()
      ) {
        this.toggleSidebar();
      }
    });
    this.subscription = this.messageService.getMessage().subscribe(userInf => {
      const userInfo = userInf && userInf.text;
      if (userInf.text === 'expanded_collaps') {
        this.toggleAwalyCollapsed();
        return;
      }
      if (userInf.text === 'expand_collaps') {
        this.toggleCollapsed();
        return;
      }
      if (userInfo) {
        this.sidebar = null;
        this.spinner.show();
        setTimeout(() => {
          this.sidebar = this.sideBarMenu.getSideBarMenuByRoleName(this.userInfo, userInfo['companyID']);
          this.spinner.hide();
        }, 50);
      }
    });
  }
  ngOnInit() {
    this.spinner.show();
    this.userInfo = this.constant.getUserInfo();
    setTimeout(() => {
      this.sidebar = this.sideBarMenu.getSideBarMenuByRoleName(this.userInfo, this.userInfo['companyId']);
      this.spinner.hide();
    }, 500);
  }

  eventCalled() {
    this.isActive = !this.isActive;
  }

  addExpandClass(element: any) {
    this.title = '';
    if (element === this.showMenu) {
      this.showMenu = '0';
    } else {
      this.showMenu = element;
      this.title = this.showMenu;
    }
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed;
    this.collapsedEvent.emit(this.collapsed);
  }
  toggleAwalyCollapsed() {
    this.collapsed = true;
    this.collapsedEvent.emit(this.collapsed);
  }
  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  onLoggedout() {
    sessionStorage.removeItem('isGasStationUserLogin');
  }

  companyPopup() {
    const modal = this.modalService.open(ChangeCompanyComponent, { size: 'sm' }).result.then((result) => {
      this.userInfo.companyName = result.companyName;
      this.userInfo.companyId = result.companyID;
      this.getNoofItemsInPushToPOSByCompnayID();
    }, (reason) => {
      this.closeResult = `Dismissed`;
    });
  }
  getNoofItemsInPushToPOSByCompnayID() {
    this.noOfItemsInPushToPOSList = [];
    this.setupService.getData(`StoreLocationItem/getNoofItemsInPushToPOSByCompnayID/${this.userInfo.companyId}`).subscribe(
      (response) => {
        if (response && response['statusCode']) {
          this.noOfItemsInPushToPOSList = [];
          return;
        }
        let tempArray = [];
        tempArray = response;
        this.noOfItemsInPushToPOSList = tempArray.filter((i) => i.noofItemsinPushToPOS > 0);
      });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
