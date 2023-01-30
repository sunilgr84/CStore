import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as _ from 'lodash';
import { ConstantService } from '../constant/constant.service';

@Injectable()
export class UtilityService {
  _storeFuelGradeList: any[];
  userInfo: any;
  // tslint:disable-next-line:max-line-length

  constructor(private pipe: DatePipe, private consts: ConstantService) { }

  formatPhoneNumber(value) {
    if (!value) {
      return;
    }
    let number = value.toString().trim().replace(/^\+/, '');

    if (number.match(/[^0-9]/)) {
      return number;
    }
    if (!number) { return ''; }
    number = String(number);
    // Will return formattedNumber.
    // If phonenumber isn't longer than an area code, just show number
    let formattedNumber = number;

    // if the first character is '1', strip it out and add it back
    const c = (number[0] === '1') ? '1 ' : '';
    number = number[0] === '1' ? number.slice(1) : number;

    // # (###) ###-#### as c (area) front-end
    const area = number.substring(0, 3);
    const front = number.substring(3, 6);
    const end = number.substring(6, 10);

    if (front) {
      formattedNumber = (c + '(' + area + ') ' + front);
    }
    if (end) {
      formattedNumber += ('-' + end);
    }
    return formattedNumber;
  }
  lowerCase(title: string) {
    return title.toLocaleLowerCase();
  }
  formatCurrency(value) {
    return value ? '$' + value.toString() : '';
  }
  formatDecimalCurrency(value) {
    return value ? '$' + parseFloat(value).toFixed(2).toString() : '';
  }
  formatDecimalCurrencyWithCommaSeparated(value) {
    value = value ? '$' + parseFloat(value).toFixed(2).toString() : '';
    return value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
  formatDecimalCurrencyWithCommaSeparatedWithDefaultValue(value) {
    value = value ? '$' + parseFloat(value).toFixed(2).toString() : '$0.00';
    return value.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  }
  formatDecimalCurrencyThreePrecision(value) {
    return value ? '$' + parseFloat(value).toFixed(3).toString() : '';
  }
  formatDecimalCurrencyWithZero(value) {
    return value ? '$' + parseFloat(value).toFixed(2).toString() : '$' + (0.00).toFixed(2).toString();
  }
  formatFourDecimalCurrency(value) {
    return value ? '$' + parseFloat(value).toFixed(4).toString() : '';
  }
  formatSevenDecimalCurrency(value) {
    return value ? '$' + parseFloat(value).toFixed(7).toString() : '';
  }
  formatFourDecimal(value) {
    return value ? parseFloat(value).toFixed(4).toString() : '';
  }
  formatSevenDecimal(value) {
    return value ? parseFloat(value).toFixed(7).toString() : '';
  }
  formatDecimalCurrencyWithDash(value) {
    return value !== null ? '$' + parseFloat(value).toFixed(2).toString() : '-';
  }

  formatDecimalCurrencyWithNegativeValue(value) {
    if (value < 0) {
      return value !== null ? '-$' + parseFloat(Math.abs(value).toString()).toFixed(2).toString() : '';
    } else {
      return value !== null ? '$' + parseFloat(value).toFixed(2).toString() : '';
    }
  }


  formatDecimalCurrencyFuel(value) {
    return value ? '$' + parseFloat(value).toFixed(7).toString() : '';
  }
  formatpercentage(value) {
    return value ? value.toString() + '%' : '';
  }
  formatProfitPercentage(value) {
    return value ? value.toFixed(2).toString() + '%' : '';
  }
  formatSalespercentage(value) {
    return value ? parseFloat(value).toFixed(3).toString() + '%' : '';
  }

  // 'MM-DD-YYYY'
  formatDate(value) {
    return this.pipe.transform(value ? new Date(value) : new Date(), 'MM-dd-yyyy');
    //   return value ? new Date(value).getMonth() + '-' + new Date(value).getDate() + '-' + new Date(value).getFullYear() : '';
  }
  formatDateEmpty(value) {
    return value ? this.pipe.transform(new Date(value), 'MM-dd-yyyy') : '';
    //   return value ? new Date(value).getMonth() + '-' + new Date(value).getDate() + '-' + new Date(value).getFullYear() : '';
  }
  formatDateTime(value) {
    return this.pipe.transform(value ? new Date(value) : new Date(), 'MM-dd-yyyy HH:mm');
  }
  formatDecimalDigit(value) {
    return value = value ? parseFloat(value).toFixed(2) : null;
  }
  sliceArray(list) {
    const arrayList = list;
    const toDeleteArray = [];
    list.forEach(element => {
      if (element.connectedStoreTankID) {
        toDeleteArray.push(element.connectedStoreTankID);
        // arrayList.splice(list.indexOf(element), 1);
      }
    });
    toDeleteArray.forEach(element => {
      for (let i = arrayList.length; i--;) {
        if (arrayList[i].storeTankID === element) {
          arrayList.splice(i, 1);
        }
      }
    });
    console.log('arrayList', arrayList);
    return arrayList;
  }
  remove_duplicates(array1, array2, control) {
    const data = array1;
    const data1 = array2;
    for (let i = 0, len = data1.length; i < len; i++) {
      for (let j = 0, len2 = data.length; j < len2; j++) {
        if (data1[i][control] === data[j][control]) {
          data.splice(j, 1);
          len2 = data.length;
        }
      }
    }
    return data;
  }
  setReadonlyPrivileage(array1, array2, control, name) {
    for (let i = 0, len = array2.length; i < len; i++) {
      for (let j = 0, len2 = array1.length; j < len2; j++) {
        if (array2[i][control] === array1[j][control]) {
          array1[j][name] = true;
          array1[j]['isDefault'] = true;
          len2 = array1.length;
        }
      }
    }
    return array1;
  }
  pageHeaderFooter(doc, headerData, event) {
    this.userInfo = this.consts.getUserInfo();
    doc.setTextColor(40);
    doc.setFontStyle('normal');
    const img = new Image();
    img.src = 'assets/images/logo.png'; // path.resolve('sample.jpg');
    if (img) {
      doc.addImage(img, 'JPEG', event.settings.margin.left, 15, 120, 50);
      doc.setFontSize(15);
      const splitTitle = doc.splitTextToSize(this.userInfo.companyName, 150);
      doc.text(splitTitle, event.settings.margin.left + 300, 50);
      doc.setFontSize(10);
      doc.text('Location : QuickBuy108', event.settings.margin.left + 300, 70);
      doc.setFontSize(10);
      doc.text('2815 US 84E,Cairo,229-378-8939', event.settings.margin.left + 300, 85);
    }
    doc.setFontSize(15);
    doc.text(headerData.reportName, event.settings.margin.left, 85);
    doc.setFontSize(10);
    doc.text('From: ' + headerData.fromDate, event.settings.margin.left, 98);
    doc.text('To:    ' + headerData.toDate, event.settings.margin.left, 108);

    // Footer
    let str = 'Page ' + doc.internal.getNumberOfPages();
    // Total page number plugin only available in jspdf v1.0+
    if (typeof doc.putTotalPages === 'function') {
      str = str; // + ' of ' + doc.internal.getNumberOfPages();
    }
    doc.setFontSize(10);

    // jsPDF 1.4+ uses getWidth, <1.4 uses .width
    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    doc.text(str, event.settings.margin.left, pageHeight - 10);
  }


  /* To copy Text from Textbox */
  copyInputMessage(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  /* To copy any Text */
  copyText(val: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  splitLotteryBarcodeByLength(barcode: string) {
    let splittedData;
    if (barcode.length === 24) {
      splittedData = {
        lotteryGameNo: barcode.substring(0, 4),
        packNo: barcode.substring(4, 11),
        ticketDigits: barcode.substring(11, 14),
        minLotteryGameNoLength: 4,
        maxLotteryGameNoLength: 4,
        minPackNoLength: 7,
        maxPackNoLength: 7
      };
    } else if (barcode.length === 22) {
      splittedData = {
        lotteryGameNo: barcode.substring(0, 3),
        packNo: barcode.substring(3, 9),
        ticketDigits: barcode.substring(9, 12),
        minLotteryGameNoLength: 3,
        maxLotteryGameNoLength: 3,
        minPackNoLength: 6,
        maxPackNoLength: 6
      };
    } else {
      splittedData = {
        lotteryGameNo: barcode.substring(0, 4),
        packNo: barcode.substring(4, 11),
        ticketDigits: barcode.substring(11, barcode.length),
        minLotteryGameNoLength: 3,
        maxLotteryGameNoLength: 3,
        minPackNoLength: 2,
        maxPackNoLength: 9
      };
    }
    return splittedData;
  }
}
