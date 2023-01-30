import {
  Component,
  OnInit,
  Input,
  Output,
  AfterViewInit,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import {
  get as _get,
  groupBy as _groupBy,
  slice as _slice,
  findIndex as _findIndex,
  find as _find,
} from 'lodash';
import { StringifyOptions } from 'querystring';

@Component({
  selector: 'app-custom-grid',
  templateUrl: 'custom-grid.component.html',
})
export class CustomGridComponent implements OnInit {
  @Input() colData: CGColData[] = [];
  @Input() rowData: any[] = [];
  parsedRowData: any = [];
  groupedRowData: any = [];
  selectedCheckboxData: any;

  // pagination related
  @Input() serverRecords: number = 0;
  firstPage: number = 1;
  lastPage: number = 0;
  currentPage: number = 0;
  firstRowOfPage: number = 0;
  lastRowOfPage: number = 0;
  totalRecords: number = 0;

  @Input() gridOptions: CGOptions;
  // define required default options here
  mGridOptions: CGOptions = {
    enablePagination: false,
    enableServerPagination: false,
    enableCheckbox: false,
    perPageRecords: 10,
  };
  // template render
  isGroupedTemplate: boolean = false;

  // grouping expansion
  visibleGroupIds: any[] = [];

  @Output() rowSelected: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
    this.mGridOptions = { ...this.mGridOptions, ...this.gridOptions };

    if (this.mGridOptions.onInit) {
      this.mGridOptions.onInit(
        this.firstPage,
        this.mGridOptions.perPageRecords
      );
    }
    // set first page as current page on load
    this.currentPage = this.firstPage;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.rowData) {
      this.handleRowDataChange();
    }
  }

  // actions to trigger on row data changed
  async handleRowDataChange() {
    this.parsedRowData = this.rowData.map((d, index) => {
      let o = Object.assign({}, d);
      o['cgIndex'] = 'cgIndex' + index;
      return o;
    });

    if (this.mGridOptions.enablePagination) {
      this.totalRecords = this.rowData.length;
    } else if (this.mGridOptions.enableServerPagination) {
      this.totalRecords = this.serverRecords;
    }

    const paginationDone = await this.checkAndGeneratePagination();
    const groupingDone = await this.checkAndHandleGrouping();
  }

  //
  // Start: Pagination related
  // Initial function to start pagination
  checkAndGeneratePagination(): void | boolean {
    if (!this.isPaginationEnabled()) {
      return false;
    }

    const pageCount = this.totalRecords / this.mGridOptions.perPageRecords;

    this.lastPage =
      Math.round(pageCount) < pageCount
        ? Math.round(pageCount) + 1
        : Math.round(pageCount);

    this.calculatePaginationValues();
    return true;
  }

  // calculate pagination values
  calculatePaginationValues(): void {
    const currentPageRecords =
      this.mGridOptions.perPageRecords * (this.currentPage - 1);

    this.firstRowOfPage = currentPageRecords + 1;

    const lastRecord = currentPageRecords + this.mGridOptions.perPageRecords;
    this.lastRowOfPage =
      lastRecord >= this.totalRecords ? this.totalRecords : lastRecord;

    if (!this.mGridOptions.enableServerPagination) {
      this.parsedRowData = _slice(
        this.rowData,
        this.firstRowOfPage - 1,
        this.lastRowOfPage
      );
    }
  }

  // handle page change and make api call
  handlePageChange(val: 'first' | 'prev' | 'next' | 'last'): void {
    switch (val) {
      case 'first':
        this.currentPage = this.firstPage;
        break;

      case 'prev':
        const prevPage = this.currentPage - 1;
        this.currentPage =
          prevPage < this.firstPage ? this.firstPage : prevPage;
        break;

      case 'next':
        const nextPage = this.currentPage + 1;
        this.currentPage = nextPage > this.lastPage ? this.lastPage : nextPage;
        break;

      case 'last':
        this.currentPage = this.lastPage;
        break;
    }

    if (this.mGridOptions.onPageChange) {
      this.mGridOptions.onPageChange(
        this.currentPage,
        this.mGridOptions.perPageRecords
      );
    }
    this.selectedCheckboxData = undefined;
    this.calculatePaginationValues();
  }

  // checks if pagination enabled or not
  isPaginationEnabled = (): boolean => {
    if (
      this.mGridOptions.enablePagination &&
      this.mGridOptions.enableServerPagination
    ) {
      console.error('Supports one format of pagination a time disable any one');
      return false;
    }
    return (
      this.mGridOptions.enablePagination ||
      this.mGridOptions.enableServerPagination
    );
  };
  // End: Pagination related
  //

  //
  // Start: Grouping related
  // Initiation
  checkAndHandleGrouping(): void | boolean {
    if (!this.isGroupingEnabled()) {
      return false;
    }
    const groupByKey = _get(this.mGridOptions, 'groupBy.key', '');
    const groupByLabel = _get(this.mGridOptions, 'groupBy.label', '');

    let groupByData = {};
    if (groupByKey) {
      groupByData = _groupBy(this.parsedRowData, groupByKey);
    }

    Object.keys(groupByData).forEach((key) => {
      this.groupedRowData.push({
        keyValue: key,
        key: groupByKey,
        label: groupByLabel,
        labelValue: _get(groupByData[key], `[0].${groupByLabel}`, ''),
      });
    });
    this.parsedRowData = groupByData;

    return true;
  }

  // handles group expansion and collapse
  handleGroupRowToggle(key: any): void {
    if (this.visibleGroupIds.includes(key)) {
      this.visibleGroupIds = this.visibleGroupIds.filter((k) => k != key);
    } else {
      this.visibleGroupIds.push(key);
    }
  }

  // checks if grouping enabled or not
  isGroupingEnabled = (): boolean => {
    return _get(this.mGridOptions, 'groupBy.label', false) &&
      _get(this.mGridOptions, 'groupBy.key', false)
      ? true
      : false;
  };
  // End: Grouping related
  //

  //
  // Start: Checkbox related
  // handle checkbox change of different types/levels
  handleCheckboxChange(
    e: Event,
    type: 'header_row' | 'body_row' | 'group_header_row' | 'group_body_row',
    rowD: any = {},
    grKey?: any
  ) {
    const $target: any = e.target;

    switch (type) {
      case 'header_row':
        this.handleHeaderRowCheckboxChange($target.checked);
        break;

      case 'body_row':
        this.handleBodyRowCheckboxChange($target.checked, rowD);
        break;

      case 'group_header_row':
        this.handleGroupHeaderRowCheckboxChange($target.checked, rowD);
        break;

      case 'group_body_row':
        this.handleGroupBodyRowCheckboxChange($target.checked, rowD, grKey);
    }

    // this.mGridOptions.onCheckboxChange(rowD, $target.chekced);
    this.rowSelected.emit(this.selectedCheckboxData);
  }

  // check checkbox is checked/indeterminate of different types/levels
  checkboxStatus(
    statusType: 'indeterminate' | 'checked',
    type: 'header_row' | 'body_row' | 'group_header_row' | 'group_body_row',
    rowD?: any,
    grKey?: any
  ): boolean {
    let isChecked = false;
    let isIndeterminate = false;

    if (this.selectedCheckboxData) {
      switch (type) {
        case 'header_row':
          isChecked =
            this.getParsedDataLength() == this.getSelectedCheckboxDataLength();
          isIndeterminate =
            this.getSelectedCheckboxDataLength() > 0 &&
            this.getParsedDataLength() != this.getSelectedCheckboxDataLength();
          break;

        case 'body_row':
          isChecked = _findIndex(this.selectedCheckboxData, rowD) != -1;
          break;

        case 'group_header_row':
          isChecked =
            this.getParsedDataLength(rowD) ==
            this.getSelectedCheckboxDataLength(rowD);
          isIndeterminate =
            this.getSelectedCheckboxDataLength(rowD) > 0 &&
            this.getParsedDataLength(rowD) !=
            this.getSelectedCheckboxDataLength(rowD);
          break;

        case 'group_body_row':
          isChecked = _findIndex(this.selectedCheckboxData[grKey], rowD) != -1;
          break;
      }
    }

    return statusType == 'checked' ? isChecked : isIndeterminate;
  }

  // handle header checkbox change
  handleHeaderRowCheckboxChange(isChecked: boolean) {
    if (isChecked) {
      this.selectedCheckboxData = this.parsedRowData;
    } else {
      this.selectedCheckboxData = [];
    }
  }

  // handle default row checkbox change
  handleBodyRowCheckboxChange(isChecked: boolean, rowD: any) {
    if (isChecked) {
      if (!this.selectedCheckboxData) {
        this.selectedCheckboxData = [];
      }
      this.selectedCheckboxData.push(rowD);
    } else {
      this.selectedCheckboxData = this.selectedCheckboxData.filter(
        (d) => d.cgIndex != rowD.cgIndex
      );
    }
  }

  // handle group header checkbox change
  handleGroupHeaderRowCheckboxChange(isChecked: boolean, rowKey: any) {
    if (isChecked) {
      if (!this.selectedCheckboxData) {
        this.selectedCheckboxData = {};
      }
      if (!this.selectedCheckboxData[rowKey]) {
        this.selectedCheckboxData[rowKey] = [];
      }
      this.selectedCheckboxData[rowKey] = this.parsedRowData[rowKey];
    } else {
      delete this.selectedCheckboxData[rowKey];
    }
  }

  // handle group body row checkbox change
  handleGroupBodyRowCheckboxChange(
    isChecked: boolean,
    rowD: any,
    rowKey?: any
  ) {
    if (isChecked) {
      if (!this.selectedCheckboxData) {
        this.selectedCheckboxData = {};
      }
      if (!this.selectedCheckboxData[rowKey]) {
        this.selectedCheckboxData[rowKey] = [];
      }
      this.selectedCheckboxData[rowKey].push(rowD);
    } else {
      this.selectedCheckboxData[rowKey] = this.selectedCheckboxData[
        rowKey
      ].filter((d) => d.cgIndex != rowD.cgIndex);
    }
  }

  // return selected checkbox length
  getSelectedCheckboxDataLength = (key?: string): number => {
    let length = 0;
    if (this.selectedCheckboxData) {
      if (Array.isArray(this.selectedCheckboxData)) {
        length = this.selectedCheckboxData.length;
      } else {
        if (key && this.selectedCheckboxData[key]) {
          length = this.selectedCheckboxData[key].length;
        }
        if (!key) {
          Object.keys(this.selectedCheckboxData).forEach(
            (d) => (length += this.selectedCheckboxData[d].length)
          );
        }
      }
    }
    return length;
  };
  // End: Checkbox related
  //

  //
  // Start: Generic helper functions
  // returns cell text
  getCellText = (rowD, colD: CGColData): string => {
    const key = _get(colD, 'dataKey', '');
    let returnData = _get(colD, 'default', '-');
    if (key) {
      if (key === 'POSCodeWithCheckDigit') {
        returnData = '<div class="upcDescription">' + _get(rowD, 'Description', '-') + '</div>' +
          '<div class="upcCode">' + _get(rowD, 'POSCodeWithCheckDigit', '-') + '</div>';
      } else if (key === 'RegularSellPrice') {
        let sellingPrice = _get(rowD, key, '-');
        returnData = (sellingPrice !== '-' && sellingPrice !== null) ? "$" + sellingPrice.toFixed(2) : '';
      } else
        returnData = _get(rowD, key, '-');
    }
    return returnData;
  };

  // returns group header cell text
  getGroupHeaderCellText = (key: string): string => {
    const data = _find(this.groupedRowData, ['keyValue', key]);
    return data ? data.labelValue : 'Group';
  };

  // returns cell index
  getCellIndex = (rowD, index: number): number => {
    let returnIndex: number = index + 1;

    if (this.isPaginationEnabled() && !this.isGroupingEnabled()) {
      returnIndex = this.firstRowOfPage + index;
    }

    return returnIndex;
  };

  // get length of data to be populated
  getParsedDataLength = (key?: string): number => {
    let length = 0;
    if (this.parsedRowData) {
      if (Array.isArray(this.parsedRowData)) {
        length = this.parsedRowData.length;
      } else {
        if (key && this.parsedRowData[key]) {
          length = this.parsedRowData[key].length;
        }
        if (!key) {
          Object.keys(this.parsedRowData).forEach(
            (d) => (length += this.parsedRowData[d].length)
          );
        }
      }
    }
    return length;
  };

  // handle row actions
  handleRowAction(
    actionType: 'edit' | 'delete' | 'save' | 'cancel' | 'itemHistory' | 'salesActivity' | 'suspend',
    rowD: any,
    colD: CGColData
  ) {
    switch (actionType) {
      case 'edit':
        colD.cellParams.onEdit(rowD);
        break;

      case 'delete':
        colD.cellParams.onDelete(rowD);
        break;
      case 'itemHistory':
        colD.cellParams.itemHistory(rowD);
        break;
      case 'salesActivity':
        colD.cellParams.salesActivity(rowD);
        break;
      case 'suspend':
        colD.cellParams.suspend(rowD);
        break;
      case 'save':
      case 'cancel':
        console.warn(
          'Action Type ' + actionType + ' Functionality yet to be completed'
        );

      default:
        console.warn('Action type not defined');
    }
  }
  // End: Generic helper functions
  //

  //
  // Start: Public functions to return/manipulate data from outside
  // returns selected data
  public getSelectedData() {
    return {
      data: this.selectedCheckboxData,
      dataKeys: this.groupedRowData,
    };
  }

  // End: Public functions to return/manipulate data from outside
  //

  stringify = (data) => {
    return JSON.stringify(data);
  };
}

// define types here
export interface CGOptions {
  groupBy?: {
    label: any;
    key: any;
  };
  enableServerPagination?: boolean;
  enablePagination?: boolean;
  enableCheckbox?: boolean;
  perPageRecords?: number;
  onPageChange?: (currentPage: number, perPageRecords: number) => void;
  onInit?: (currentPage: number, perPageRecords: number) => void;
  onEdit?: (rowD: any, colD: CGColData) => void;
  onDelete?: (rowD: any, colD: CGColData) => void;
  // onCheckboxChange?: (currentSelection: {}, isChecked: boolean) => void;
}

export interface CGColData {
  headerName?: string;
  defaultText?: string;
  dataKey?: string;
  cellType?: 'actionCell' | 'dataCell' | 'indexCell' | 'customUPCCell' | 'pricingCell';
  cellParams?: any;
}
