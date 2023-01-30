import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-download-confirm-modal',
  templateUrl: './download-confirm-modal.component.html',
  styleUrls: ['./download-confirm-modal.component.scss']
})
export class DownloadConfirmModalComponent implements OnInit {

  @Input() public title;
  @Input() public body;
  @Input() public message;
  @Input() public errors;
  constructor(public modal: NgbActiveModal) { }

  ngOnInit() {
  }

  closeDateError(error) {
    this.errors.DateErrors.splice(this.errors.DateErrors.indexOf(error), 1);
  }
  closePromotionError(error) {
    this.errors.PromotionErrors.splice(this.errors.PromotionErrors.indexOf(error), 1);
  }
  closeTransactionIdError(error) {
    this.errors.TransactionIdErrors.splice(this.errors.TransactionIdErrors.indexOf(error), 1);
  }
  closeFormatError(error) {
    this.errors.FormatErrors.splice(this.errors.FormatErrors.indexOf(error), 1);
  }

}
