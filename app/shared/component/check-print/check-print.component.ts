import { Component, OnInit, AfterViewInit, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SetupService } from '@shared/services/setupService/setup-service';
import { ConstantService } from '@shared/services/constant/constant.service';
import { UtilityService } from '@shared/services/utility/utility.service';
import * as moment from 'moment';


@Component({
  selector: 'app-check-print',
  templateUrl: './check-print.component.html',
  styleUrls: ['./check-print.component.scss'],
})
export class CheckPrintComponent implements OnInit {


  constructor(public router: Router, private routeParams: ActivatedRoute, private spinner: NgxSpinnerService,
    private toastr: ToastrService, private _setupService: SetupService, private constants: ConstantService) {
    this.showCheckPage = false;
  }
  invoiceId: any;
  paymentSourceId: any;
  checkData: any;
  showCheckPage: boolean;
  paymentID: any;
  printedBy: any;
  storeBankID: any;
  ngOnInit() {
    this.spinner.show();
    this.routeParams.params.subscribe(params => {
      this.paymentSourceId = params.paymentSourceID;
      this.paymentID = params.paymentID;
      this.printedBy = params.printedBy;
      this.storeBankID = params.storeBankID;
    });
    this._setupService.getData('CheckPrint/GetPrintDetails/' + this.paymentSourceId + '/' + this.paymentID + '/' + this.printedBy + '/' + this.storeBankID).subscribe(res => {
      this.showCheckPage = true;
      this.spinner.hide();
      if (res && res.statusCode == 400) {
        window.opener.postMessage(res, "*");
      } else {
        setTimeout(() => {
          window.opener.postMessage(res, "*");
        });
        this.checkData = res;
        this.checkData.invoiceDate = moment(this.checkData.invoiceDate).format('MM/DD/YYYY');
        let amount = this.checkData.invoiceAmountPaid.toString();
        let floatValue = amount.split(".")[1];
        let floatValueString = '';
        if (floatValue !== undefined) {
          floatValueString = " and " + floatValue + "/100";
        }
        this.checkData.amountInWords = this.numberToEnglish(Math.trunc(this.checkData.invoiceAmountPaid), "") + floatValueString;
        this.checkData.invoiceAmountPaid = parseFloat(this.checkData.invoiceAmountPaid).toFixed(2);
        // setTimeout(() => {
        //   window.print();
        // });
      }
    }, err => {
      this.spinner.hide();
      this.toastr.error('Unable To Print Check', this.constants.infoMessages.error);
    });
  }

  /**
 * Convert an integer to its words representation
 * 
 * @author McShaman (http://stackoverflow.com/users/788657/mcshaman)
 * @source http://stackoverflow.com/questions/14766951/convert-digits-into-words-with-javascript
 */
  numberToEnglish(n, custom_join_character) {

    var string = n.toString(),
      units, tens, scales, start, end, chunks, chunksLen, chunk, ints, i, word, words;

    var and = custom_join_character || 'and';

    /* Is number zero? */
    if (parseInt(string) === 0) {
      return 'zero';
    }

    /* Array of units as words */
    units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    /* Array of tens as words */
    tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    /* Array of scales as words */
    scales = ['', 'thousand', 'million', 'billion', 'trillion', 'quadrillion', 'quintillion', 'sextillion', 'septillion', 'octillion', 'nonillion', 'decillion', 'undecillion', 'duodecillion', 'tredecillion', 'quatttuor-decillion', 'quindecillion', 'sexdecillion', 'septen-decillion', 'octodecillion', 'novemdecillion', 'vigintillion', 'centillion'];

    /* Split user arguemnt into 3 digit chunks from right to left */
    start = string.length;
    chunks = [];
    while (start > 0) {
      end = start;
      chunks.push(string.slice((start = Math.max(0, start - 3)), end));
    }

    /* Check if function has enough scale words to be able to stringify the user argument */
    chunksLen = chunks.length;
    if (chunksLen > scales.length) {
      return '';
    }

    /* Stringify each integer in each chunk */
    words = [];
    for (i = 0; i < chunksLen; i++) {

      chunk = parseInt(chunks[i]);

      if (chunk) {

        /* Split chunk into array of individual integers */
        ints = chunks[i].split('').reverse().map(parseFloat);

        /* If tens integer is 1, i.e. 10, then add 10 to units integer */
        if (ints[1] === 1) {
          ints[0] += 10;
        }

        /* Add scale word if chunk is not zero and array item exists */
        if ((word = scales[i])) {
          words.push(word);
        }

        /* Add unit word if array item exists */
        if ((word = units[ints[0]])) {
          words.push(word);
        }

        /* Add tens word if array item exists */
        if ((word = tens[ints[1]])) {
          words.push(word);
        }

        /* Add 'and' string after units or tens integer if: */
        if (ints[0] || ints[1]) {

          /* Chunk has a hundreds integer or chunk is the first of multiple chunks */
          if (ints[2] || !i && chunksLen) {
            words.push(and);
          }

        }

        /* Add hundreds word if array item exists */
        if ((word = units[ints[2]])) {
          words.push(word + ' hundred');
        }

      }

    }
    if (words[words.length - 1] === and) {
      words.pop();
    }
    return words.reverse().join(' ');

  }

  printCheck() {
    if (this.showCheckPage)
      window.print();
  }

}
