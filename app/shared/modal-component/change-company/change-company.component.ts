import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SetupService } from '@shared/services/setupService/setup-service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { MessageService } from '@shared/services/commmon/message-Service';
import { ConstantService } from '@shared/services/constant/constant.service';

@Component({
  selector: 'app-change-company',
  templateUrl: './change-company.component.html',
  styleUrls: ['./change-company.component.scss']
})
export class ChangeCompanyComponent implements OnInit {
  companyList: any[];
  selectedCompany: any;
  selectedCompanyId: any;
  userInfo: any;
  isLoading = true;
  constructor(private activeModal: NgbActiveModal, private dataService: SetupService,
    private router: Router, private messageService: MessageService, private constService: ConstantService) { }

  ngOnInit() {
    this.userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    if (this.userInfo.roleName === this.constService.roleName) {
      this.getCompaniesById(this.userInfo.roleName, this.userInfo.userName, this.userInfo.companyId); // only superadmin
    } else {
      this.getCompaniesByUserId(this.userInfo.userId);
    }
  }

  dismiss() {
    this.activeModal.dismiss('cancel');
  }

  companyChange(event) {
    this.selectedCompany = event;
    this.isLoading = false;
  }

  changeCompany() {
    this.userInfo.companyId = null;
    this.userInfo.companyId = this.selectedCompany.companyID;
    this.userInfo.companyName = this.selectedCompany.companyName;
    sessionStorage.setItem('userInfo', JSON.stringify(this.userInfo));
    this.activeModal.close(this.selectedCompany);
    this.router.navigate(['dashboard']);
    // setTimeout(() => {
    //   location.reload();
    // }, 1000);
    this.messageService.sendMessage(this.selectedCompany);
  }
  getCompaniesById(roleName, userName, companyId) {
    this.dataService.getData('Company/list/' + roleName + '/' + userName + '/' + companyId).subscribe(
      (response) => {
        this.companyList = response;
        this.isLoading = false;
      });
  }
  getCompaniesByUserId(userId) {
    this.dataService.getData('Users/GetCompanyByUserId/UserId/' + userId).subscribe(
      (response) => {
        this.companyList = response;
        this.isLoading = false;
      });
  }
}
