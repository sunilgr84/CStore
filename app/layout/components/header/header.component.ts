import { Component, OnInit, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { WeatherService } from 'src/app/shared/services/weather/weather.service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChangeCompanyComponent } from '@shared/modal-component/change-company/change-company.component';
import * as moment from 'moment';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from '@shared/services/commmon/message-Service';
import { StoreService } from '@shared/services/store/store.service';
import { StoreMessageService } from '@shared/services/commmon/store-message.service';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    pushRightClass = 'push-right';
    weatherInfo: any;
    weather: any;
    tempereture: any;
    isShowWeather: boolean;
    icon: string;
    unit = '°F';
    userInfo = {
        companyId: null,
        companyName: null,
        storeLocation: null,
        roleName: null,
        userName: null,
        userId: null,
        firstName: null,
        fuelobject: null,
        companyLogo: null, roles: null
    };
    isWeatherShow: boolean;
    closeResult: string;
    currentTimeMsg: any;
    brandImage: string;
    noOfItemsInPushToPOSList: any[];
    // company change
    companyList: any[];
    selectedCompany: any;
    selectedCompanyId: any;
    isLoading = true;
    isBrandImg: boolean;
    roleName: any;
    storeLocationList: any;
    isStoreLoading = true;
    storeLocationId: any;
    subscription: Subscription;
    constructor(public router: Router, private weatherService: WeatherService, private storeService: StoreService,
        private constant: ConstantService, private toaster: ToastrService, private messageService: MessageService,
        private modalService: NgbModal, private setupService: SetupService, private storeMessageService: StoreMessageService,
        private spinner: NgxSpinnerService) {
        this.roleName = this.constant.roleName;
        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
        this.subscription = this.messageService.getLogo().subscribe(userInf => {
            if (this.userInfo) {
                this.userInfo.companyLogo = userInf.logo;
                this.selectImage();
            }
        });
    }

    ngOnInit() {
        this.userInfo = this.constant.getUserInfo();
        this.getCompany();
        //  this.getStoreLocationList();
        this.getWeather();
        this.getGreetingTime();
        this.selectImage();
        // this.getNoofItemsInPushToPOSByCompnayID();
        this.getNotificationsByUserId();
        setInterval(() => {
            this.getNotificationsByUserId();
        }, 120000);
        setInterval(() => {
            localStorage.removeItem("notificationItems");
        }, 600000);

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
        this.setupService.postData(`Auth/Logout`, {}).subscribe(
            (response) => {
                console.log("User logged out" + response);
            });
        this.storeService.storeLocation = null;
        this.storeService.vendorList = null;
        this.storeService.departmentList = null;
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }

    getWeather() {
        // const storeInfo = this.userInfo  && this.userInfo.storeLocation; //  : '06101';
        this.isWeatherShow = false;
        this.weatherService.getWeatherByZip(this.userInfo['zipCode'], 'us').subscribe(
            (response) => {
                this.weatherInfo = response;
                this.tempereture = this.weatherInfo.main;
                this.weather = response['weather'][0];
                this.icon = 'https://openweathermap.org/img/w/' + response['weather'][0].icon + '.png';
                this.isWeatherShow = true;
            }, (error) => {
                this.isWeatherShow = false;
                //  console.log('wather log', error.error.message);
            });
    }
    getWatherByCity() {
        this.weatherService.getWeatherByCityName('roma', 'us').subscribe(
            (response) => {
                //  console.log('getWatherByCity()', response);
                this.isShowWeather = true;
            }
        );
    }

    // companyPopup() {
    //     const modal = this.modalService.open(ChangeCompanyComponent, { size: 'sm' }).result.then((result) => {
    //         console.log('company change', result);
    //         this.userInfo.companyName = result.companyName;
    //         this.userInfo.companyId = result.companyID;
    //         this.getNoofItemsInPushToPOSByCompnayID();
    //     }, (reason) => {
    //         this.closeResult = `Dismissed`;
    //     });
    // }

    getGreetingTime() {
        let m: string;
        m = moment().format('HH');
        let g = null;

        const split_afternoon = 12; // 24hr time to split the afternoon
        const split_evening = 17; // 24hr time to split the evening
        const currentHour = parseFloat(m);

        if (currentHour >= split_afternoon && currentHour <= split_evening) {
            g = 'Good Afternoon';
        } else if (currentHour >= split_evening) {
            g = 'Good Evening';
        } else {
            g = 'Good Morning';
        }
        this.currentTimeMsg = g;
    }

    markAsRead(notificationID) {
        this.setupService.updateData(`Notification/` + notificationID, '').subscribe(
            (response) => {
                this.noOfItemsInPushToPOSList.forEach(i => { if (i.NotificationID === notificationID) i.markAsRead = true; });
            });
    }
    getNotificationsByUserId() {
        this.noOfItemsInPushToPOSList = [];
        this.setupService.getData(`Notification/getnotificationbyuserid?userID=` + this.userInfo.userId).subscribe(
            (response) => {
                if (response && response['statusCode']) {
                    this.noOfItemsInPushToPOSList = [];
                    return;
                }
                let tempArray = [];
                tempArray = response;
                let items = JSON.parse(localStorage.getItem('notificationItems'));
                this.noOfItemsInPushToPOSList = tempArray.filter((i) => { return (i.errorCount > 0 && (!items || items.indexOf(i.StoreLocationID) === -1)) });
            });
    }

    showPOSData(storeId) {
        localStorage.setItem('notification', storeId);
        let items = JSON.parse(localStorage.getItem('notificationItems'));
        if (items && items.length > 0)
            items.push(storeId)
        else {
            items = [storeId]
        }
        this.messageService.sendNotification(storeId);
        localStorage.setItem('notificationItems', JSON.stringify(items));
        this.noOfItemsInPushToPOSList = this.noOfItemsInPushToPOSList.filter(i => i.StoreLocationID !== storeId);
        this.spinner.show();
        this.router.navigate(['items/item']);
    }

    pushToPOS(storeId) {
        this.setupService.postData(`PushToPos/PushNow?storeLocationId=${storeId}`, {}).subscribe(
            (response) => {
                if (response && response['statusCode']) {
                    this.toaster.warning(response.result.message);
                    return;
                }
                this.getNotificationsByUserId();
                this.toaster.info(response.message);
            });
    }

    getStoreLocationList() {
        this.isStoreLoading = true;
        let id = this.constant.getStoreLocationId();
        if (this.storeService.storeLocation) {
            this.isStoreLoading = false;
            this.storeLocationList = this.storeService.storeLocation;
            this.storeLocationList.map((store) => {
                let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
                store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
                return store;
            });
            if (this.storeLocationList && this.storeLocationList.length > 0) {
                if (id) {
                    this.storeLocationId = id;
                    this.storeLocationChange(this.storeLocationId);
                } else {
                    this.storeLocationId = this.storeLocationList[0].storeLocationID;
                    this.storeLocationChange(this.storeLocationId);
                }
            }
        } else {
            this.storeService.getStoreLocation(this.userInfo.companyId, this.userInfo.userName).subscribe((response) => {
                this.isStoreLoading = false;
                this.storeLocationList = this.storeService.storeLocation;
                this.storeLocationList.map((store) => {
                    let formattedLocationId = this.pad(store.storeLocationID.toString(), 5);
                    store.storeDetailName = store.storeName + " (" + formattedLocationId + ")";
                    return store;
                });
                if (this.storeLocationList && this.storeLocationList.length > 0) {
                    if (id) {
                        this.storeLocationId = id;
                        this.storeLocationChange(this.storeLocationId);
                    } else {
                        this.storeLocationId = this.storeLocationList[0].storeLocationID;
                        this.storeLocationChange(this.storeLocationId);
                    }
                }
            }, (error) => {
                console.log(error);
            });
        }
    }

    ////// ========================== company load data =========================

    getCompany() {
        // this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
        if (this.userInfo.roleName === this.constant.roleName) { // only superadmin
            this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.userInfo.companyId);
        } else {
            if (this.userInfo.roleName.toLowerCase() === 'cashiers' || this.userInfo.roleName.toLowerCase() === 'storemanager' || this.userInfo.roleName.toLowerCase() === 'companyadmin') {
                this.isLoading = false;
                this.companyList = [];
                let formattedCompanyId = this.pad(this.userInfo.companyId.toString(), 4);
                let companyDetailName = this.userInfo.companyName + " (" + formattedCompanyId + ")";
                this.companyList.push({
                    companyID: this.userInfo.companyId,
                    companyName: this.userInfo.companyName,
                    companyDetailName: companyDetailName
                });
            } else {
                this.getCompaniesByUserId(this.userInfo.userId);
            }

        }
        this.selectedCompanyId = this.userInfo.companyId;
    }
    companyChange(event) {
        this.selectedCompany = event;
        this.isLoading = false;
        this.changeCompany();
    }

    pad(input, size) {
        while (input.length < (size || 2)) {
            input = "0" + input;
        }
        return input;
    }

    changeCompany() {
        if (!this.selectedCompany) {
            this.toaster.warning('Company is not available');
            return false;
        }
        this.storeService.storeLocation = null;
        this.storeService.vendorList = null;
        this.storeService.departmentList = null;
        this.userInfo.companyId = null;
        sessionStorage.setItem('selectedStoreLocationId', null);
        this.userInfo.companyId = this.selectedCompany.companyID;
        this.userInfo.companyName = this.selectedCompany.companyName;
        sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
        setTimeout(() => {
            const href = this.router.url;
            if (href === '/dashboard') {
                window.location.reload();
            } else {
                this.router.navigate(['dashboard']);
            }
            this.getStoreLocationList();
        }, 1000);
        this.messageService.sendMessage(this.selectedCompany);
        this.getNotificationsByUserId();
    }
    getCompaniesById(roleName, userName, companyId) {
        this.setupService.getData('Company/GetCompanysList/' + roleName + '/' + userName + '/' + companyId).subscribe(
            (response) => {
                this.companyList = response;
                this.companyList.map((company) => {
                    let formattedCompanyId = this.pad(company.companyID.toString(), 4);
                    company.companyDetailName = company.companyName + " (" + formattedCompanyId + ")";
                    return company;
                });
                this.isLoading = false;
            });
    }
    getCompaniesByUserId(userId) {
        this.setupService.getData('Users/GetCompanyByUserId/UserId/' + userId).subscribe(
            (response) => {
                this.companyList = response;
                this.companyList.map((company) => {
                    let formattedCompanyId = this.pad(company.companyID.toString(), 4);
                    company.companyDetailName = company.companyName + " (" + formattedCompanyId + ")";
                    return company;
                })
                this.isLoading = false;
            });
    }
    selectImage() {
        this.isBrandImg = false;
        if (this.userInfo && this.userInfo.companyLogo && this.userInfo.roles.indexOf("SuperAdmin") == -1) {
            this.isBrandImg = true;
            this.brandImage = this.userInfo.companyLogo;
        }
    }
    storeLocationChange(params) {
        if (params) {
            sessionStorage.setItem('selectedStoreLocationId', params);
            this.storeMessageService.changeStoreLocationId(params);
            // setTimeout(() => {
            //     const href = this.router.url;
            //     if (href !== '/dashboard') {
            //         this.router.navigate(['dashboard']);
            //     }
            // }, 500);
        }
    }

    isShowScrollToTop: boolean;
    topPosToStartShowing = 50;

    @HostListener('window:scroll')
    checkScroll() {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
        if (scrollPosition >= this.topPosToStartShowing) {
            this.isShowScrollToTop = true;
        } else {
            this.isShowScrollToTop = false;
        }
    }

    gotoTop() {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
