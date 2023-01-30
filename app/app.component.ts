import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonService } from '@shared/services/commmon/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  constructor(private modalService: NgbModal, private commonService: CommonService) {
    this.commonService.getErrors()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((errors) => {
        this.errorMessage = errors.toString();
        this.open();
      });
  }

  private ngUnsubscribe = new Subject();

  //error modal
  errorMessage: any;
  @ViewChild('errorModal') errorModal: any;

  ngOnInit() {
  }

  open() {
    this.modalService.dismissAll();
    this.modalService.open(this.errorModal, { keyboard: false, backdrop: 'static', centered: true });
  }

  onRefresh() {
    window.location.reload();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
