import { Injectable } from '@angular/core';
import { Workbook } from 'exceljs';
import * as fs from 'file-saver';
import { logoBase64 } from '@models/logoBase64';
import { ExcelModel } from '@models/excel-data-model';
import { ConstantService } from '../constant/constant.service';
@Injectable({
  providedIn: 'root'
})
export class ExcelGeneratedService {
  userInfo: any;
  constructor(private constantsService: ConstantService) { }
  generateExcel(excel: ExcelModel) {

    // Excel Title, Header, Data
    const title = excel.reportName;
    const header = excel.header; // ['Year', 'Month', 'Make', 'Model', 'Quantity', 'Pct'];
    const data = excel.data;
    let total;
    if (excel.totalsRow) {
      total = excel.totalsRow;
    }
    // Create workbook and worksheet
    // tslint:disable-next-line:prefer-const
    let workbook = new Workbook();
    // tslint:disable-next-line:prefer-const
    let worksheet = workbook.addWorksheet(title);


    // Add Row and formatting
    // tslint:disable-next-line:prefer-const
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: '"Roboto", sans-serif', family: 4, size: 13, underline: 'none', bold: true };
    worksheet.addRow([]);

    //adding from date and to date
    if (excel.startDate && excel.endDate) {
      let fromDate = worksheet.addRow(['From Date: ' + excel.startDate]);
      fromDate.font = { name: '"Roboto", sans-serif', family: 4, size: 10, underline: 'none', bold: true };
      let toDate = worksheet.addRow(['To Date: ' + excel.endDate]);
      toDate.font = { name: '"Roboto", sans-serif', family: 4, size: 10, underline: 'none', bold: true };
    }
    // let date = worksheet.addRow(['Form Date:2019-02-05']);
    // let subTitleRow = worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')])


    // Add Image
    // tslint:disable-next-line:prefer-const
    let logo = workbook.addImage({
      base64: logoBase64.data,
      extension: 'png',
    });

    worksheet.addImage(logo, 'C1:C3');
    worksheet.mergeCells('C1:C3');
    worksheet.mergeCells('A1:B2');
    // Blank Row
    worksheet.addRow([]);

    // Add Header Row
    // tslint:disable-next-line:prefer-const
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    // worksheet.addRows(data);total
    if(excel.totalsRow){
    let totalRow = worksheet.addRow(total);

    // total row added
    totalRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '333399E5' },
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
  }
    // Add Data and Conditional Formatting
    data.forEach(d => {
      let row = worksheet.addRow(d);
      //adding styles for grouped data
      if (excel.groupedData && d[0] != '') {
        row._cells.forEach(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '333399E5' }
          };
        });
      } else if (excel.subGroupedData && d[0] == '' && d[1] != '') {
        row._cells.forEach(cell => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '333399E5' }
          };
        });
      }
    });
    for (let h = 1; h < header.length; h++) {
      worksheet.getColumn(h).width = 18;
    }
    // worksheet.getColumn(1).width = 30;
    // worksheet.getColumn(2).width = 30;
    worksheet.addRow([]);

    // Footer Row
    // tslint:disable-next-line:prefer-const
    let footerRow = worksheet.addRow(['This is system generated excel sheet.']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };
    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);

    // Generate Excel File with given name
    // tslint:disable-next-line: no-shadowed-variable
    workbook.xlsx.writeBuffer().then((data) => {
      // tslint:disable-next-line:prefer-const
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    });

  }

  generateExcelMultiDayRecon(excel: ExcelModel, formDate, toDate) {
    this.userInfo = this.constantsService.getUserInfo();
    // Excel Title, Header, Data
    const title = excel.reportName;
    const header = excel.header; // ['Year', 'Month', 'Make', 'Model', 'Quantity', 'Pct'];
    const data = excel.data;
    // Create workbook and worksheet
    // tslint:disable-next-line:prefer-const
    let workbook = new Workbook();
    // tslint:disable-next-line:prefer-const
    let worksheet = workbook.addWorksheet(title);


    // Add Row and formatting
    // tslint:disable-next-line:prefer-const
    let titleRow = worksheet.addRow([title]);
    titleRow.font = { name: '"Roboto", sans-serif', family: 4, size: 13, underline: 'none', bold: true };
    worksheet.addRow([]);
    let Formdate = worksheet.addRow(['Form: ' + formDate]);
    Formdate.font = { name: '"Roboto", sans-serif', family: 4, size: 10, underline: 'none', bold: true };
    let Todate = worksheet.addRow(['To: ' + toDate]);
    Todate.font = { name: '"Roboto", sans-serif', family: 4, size: 10, underline: 'none', bold: true };
    // let subTitleRow = worksheet.addRow(['Date : ' + this.datePipe.transform(new Date(), 'medium')])


    // Add Image
    // tslint:disable-next-line:prefer-const
    let logo = workbook.addImage({
      base64: logoBase64.data,
      extension: 'png',
    });

    worksheet.addImage(logo, 'C1:C3');
    worksheet.mergeCells('C1:C3');
    worksheet.mergeCells('A1:B2');


    // Blank Row
    worksheet.addRow([]);

    // Add Header Row
    // tslint:disable-next-line:prefer-const
    let headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell, number) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFFF00' },
        bgColor: { argb: 'FF0000FF' }
      };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
    });
    // worksheet.addRows(data);

    // Add Data and Conditional Formatting
    data.forEach(d => {
      worksheet.addRow(d);
    });
    for (let h = 1; h < header.length; h++) {
      worksheet.getColumn(h).width = 18;
    }

    worksheet.addRow([]);

    // Footer Row
    // tslint:disable-next-line:prefer-const
    let footerRow = worksheet.addRow(['Note : *Network Total = (Credit,Debit,Crind Credit & Crind Debit)']);
    footerRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };
    footerRow.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Merge Cells
    worksheet.mergeCells(`A${footerRow.number}:F${footerRow.number}`);
    worksheet.addRow([]);
    let footerRow1 = worksheet.addRow(['This is system generated excel sheet.']);
    footerRow1.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFCCFFE5' }
    };
    footerRow1.getCell(1).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

    // Merge Cells
    worksheet.mergeCells(`A${footerRow1.number}:F${footerRow1.number}`);

    // Generate Excel File with given name
    // tslint:disable-next-line: no-shadowed-variable
    workbook.xlsx.writeBuffer().then((data) => {
      // tslint:disable-next-line:prefer-const
      let blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      fs.saveAs(blob, title + '.xlsx');
    });

  }
}
