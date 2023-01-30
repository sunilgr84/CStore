import { Injectable } from '@angular/core';
import { RouteInfo } from '@shared/config/route.config';
import { isArray } from 'lodash';

@Injectable()
export class RouteConfigService {

  constructor() { }

  getSideBarMenuByRoleName(userInfo, companyId) {
    const roleName = userInfo.roleName;
    let menuItems;
    switch (roleName && roleName.toLowerCase()) {
      case 'superadmin':
        const menu = this.getSuperAdminUrls(companyId);
        menuItems = this.createMenu(userInfo, companyId, menu);
        return menuItems;
      default:
        menuItems = this.createMenu(userInfo, companyId);
        return menuItems;
      // case 'companyadmin':
      //   // menuItems = this.getCompanyAdminUrls(companyId);
      //   menuItems = this.createMenu(userInfo, companyId);
      //   return menuItems;
      // case 'inventorymanager':
      //   // menuItems = this.getInventoryManagerUrls(companyId);
      //   menuItems = this.createMenu(userInfo, companyId);
      //   return menuItems;
      // case 'assistantmanager':
      //   // menuItems = this.getAssistantManagerUrls(companyId);
      //   menuItems = this.createMenu(userInfo, companyId);
      //   return menuItems;
      // case 'storemanager':
      //   // menuItems = this.getStoreManagerUrls(companyId);
      //   menuItems = this.createMenu(userInfo, companyId);
      //   return menuItems;
      // case 'cashiers':
      //   // menuItems = this.getCashierUrls(companyId);
      //   menuItems = this.createMenu(userInfo, companyId);
      //   return menuItems;
    }
  }

  /**
   * @description - to created dynamic menu by user roles
   * @param userInfo - userinfo object
   * @param companyId - current / selected company id
   */
  createMenu(userInfo, companyId, menus?): RouteInfo[] {
    const menu = menus ? menus : userInfo.privileges;
    menu.forEach(mainMenu => {
      if (mainMenu.isCompanyIdRequired) {
        mainMenu.path += companyId;
      }
      if (mainMenu.submenu && mainMenu.submenu.length > 0) {
        const submenu = mainMenu.submenu;
        submenu.forEach(sMenu => {
          if (sMenu.isCompanyIdRequired) {
            sMenu.path += companyId;
          }
        });
      }
    });

    return menu;
  }
  getSuperAdminUrls(companyId): RouteInfo[] {
    return [
      {
        name: 'Day Recon', path: 'admin-accounting/day-recon', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon', normaliseName: 'day recon'
      },
      {
        name: 'Day Recon New', path: 'admin-accounting/day-recon-new', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon', normaliseName: 'day recon new'
      },
      {
        name: 'Live Data', path: 'pjrsearch', iconClass: 'fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
      {
        name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', iconName: 'Dashboard.png',
        customClass: 'custom-icon', normaliseName: 'dashboard'
      },
      {
        name: 'Admin', path: 'admin', iconClass: 'fa-user', iconName: 'Admin.png', customClass: 'custom-icon', normaliseName: 'admin',
        submenu: [
          { name: 'Company', path: 'companies', iconClass: 'fa-fw fa-th', normaliseName: 'company' },
          { name: 'Data Import', path: 'data-import', iconClass: 'fa-monument', normaliseName: 'data import' },
          { name: 'Employee Timecard', path: 'employe-timecard', iconClass: 'fa-monument', normaliseName: 'employee timecard' },
          { name: 'Master Price Group', path: 'price-group', iconClass: 'fa-usd', normaliseName: 'master price group' },
          { name: 'Add Department', path: 'department', iconClass: 'fa-building-o', normaliseName: 'add department' },
          { name: 'Add Department Type', path: 'department-type', iconClass: 'fa-building', normaliseName: 'add department type' },
          { name: 'Add Manufacturer', path: 'manufacturer', iconClass: 'fa-usd', normaliseName: 'add manufacturer' },
          { name: 'Add Price Book Item', path: 'price-book-item', iconClass: 'fa-usd', normaliseName: 'add price book item' },
          { name: 'Add Brands', path: 'brand', iconClass: 'fa-usd', normaliseName: 'add brands' },
          { name: 'Add Privileges', path: 'privileges', normaliseName: 'add privileges' },
          { name: 'Copy Data', path: 'copy-data', normaliseName: 'copy data' },
          { name: 'From POS', path: 'from-pos', normaliseName: 'from pos' },
          { name: 'To POS', path: 'to-pos', normaliseName: 'to pos' },
          { name: 'Store Health', path: 'store-health', normaliseName: 'store health' },
          { name: 'Setup Manufacturer', path: 'setup-manufacturer', iconClass: 'fa-file' },
          { name: 'Scan Data Submission', path: 'scan-data-config', iconClass: 'fa-file' },
          { name: 'Scan Data Acknowledgment', path: 'scan-data-acknowledgment', iconClass: 'fa-file' },
          { name: 'ISM Update', path: 'ism-update', iconClass: 'fa-file' },
          { name: 'Master Price Book Wizard', path: 'master-price-book-wizard', iconClass: 'fa-file' },
          { name: 'Invoice Admin Dashboard', path: 'inv-admin-dash', iconClass: 'fa-file' },
        ]
      },
      {
        name: 'Setup', path: '/', iconClass: 'fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        normaliseName: 'setup company',
        submenu: [
          {
            name: 'Company Details', path: 'company/', iconClass: 'fa-building-o', fragment: 'add-company',
            normaliseName: 'company details', isCompanyIdRequired: true
          },
          {
            name: 'Banks', path: 'company/', iconClass: 'fa-university', fragment: 'add-bank', normaliseName: 'add bank'
            , isCompanyIdRequired: true
          },
          {
            name: 'User Management', path: 'company/', iconClass: 'fa-user-o', fragment: 'user-management',
            normaliseName: 'user Management', isCompanyIdRequired: true
          },
          { name: 'Department', path: 'departments', iconClass: 'fa-address-card-o', normaliseName: 'department' },
          { name: 'Accounts', path: 'invoice/vendor', iconClass: 'fa-users', normaliseName: 'add vendors' },
          { name: 'House Account', path: 'houseaccount', iconClass: 'fa-file-excel-o', normaliseName: 'house account' },
          { name: 'Store Group', path: 'store-group', iconClass: 'fa-file-excel-o', normaliseName: 'store group' },
        ]
      },
      {
        name: 'Store', path: 'stores', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'store'
      },
      {
        name: 'TimeOff', path: 'time-off', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'time-off'
      },
      {
        name: 'Scheduling', path: 'scheduling', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'scheduling'
      },
      {
        name: 'Employee timesheet Detail', path: 'employee-timesheet-detail', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'employee-timesheet-detail'
      },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        normaliseName: 'price book',
        submenu: [
          { name: 'Add Item', path: 'add-item', iconClass: 'fa-monument', normaliseName: 'add item' },
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', normaliseName: 'item advanced search' },
          { name: 'Price Group', path: 'company-price-group', iconClass: 'fa-monument', normaliseName: 'price group' },
          { name: 'Group Pricing', path: 'price-group-new', iconClass: 'fa-monument', normaliseName: 'price group new' },
          { name: 'Promotions Old', path: 'promotions', iconClass: '', normaliseName: 'promotions' },
          { name: 'Promotions', path: 'promotions-new', iconClass: '', normaliseName: 'promotions new' },
          { name: 'Stock Transaction', path: 'stock-transaction', iconClass: 'fa-monument', normaliseName: 'stock transaction' },
          { name: 'Physical Inventory', path: 'physical-inventory', iconClass: 'fa-monument', normaliseName: 'physical inventory', },
          {
            name: 'Buy Down Manager', path: 'buy-down-manager', iconClass: 'fa-monument', isDisable: true,
            normaliseName: 'buy down manager'
          },
          { name: 'Manage Items', path: 'manage-items', iconClass: 'fa-monument', normaliseName: 'item advanced search' },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png',
        customClass: 'custom-icon', normaliseName: 'invoices',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument', normaliseName: 'vendor invoice' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument', normaliseName: 'fuel invoice' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument', normaliseName: 'bin invoice' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument', normaliseName: 'action invoice' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument', normaliseName: 'validate invoice' },
          { name: 'Upload EDI Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument', normaliseName: 'upload EDI invoice' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument', normaliseName: 'invoice Dashboard' }

        ]
      },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon', normaliseName: 'fuel',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', normaliseName: 'tank management', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', normaliseName: 'competitor pricing', },
          { name: 'Fuel Pricing', path: 'fuel-pricing', iconClass: 'fa-monument', normaliseName: 'fuel pricing', },
          { name: 'Store Competitor', path: 'store-competitor', iconClass: 'fa-monument', normaliseName: 'store competitor', },
          { name: 'Network Summary', path: 'network-summary', iconClass: 'fa-monument', normaliseName: 'network summary', },
          { name: 'Fuel Reconciliation', path: 'fuel-reconciliation', iconClass: 'fa-monument', normaliseName: 'fuel reconciliation', },
          { name: 'Bill of Lading', path: 'fuel-management', iconClass: 'fa-monument', normaliseName: 'bill of lading', },
          { name: 'Fuel Inventory', path: 'fuel-inventory', iconClass: 'fa-monument', normaliseName: 'fuel inventory', },
          { name: 'Fuel Price Change History', path: 'fuel-price-change-history', iconClass: 'fa-monument', normaliseName: 'fuel price change history', }
        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        normaliseName: 'lottery',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', normaliseName: 'add game', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', normaliseName: 'confirm pack', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', normaliseName: 'activate pack', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', normaliseName: 'move pack' },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', normaliseName: 'return pack' },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument', normaliseName: 'lottery inventory' }
        ]
      },
      {
        name: 'Reports', path: 'reports', iconClass: 'fa-file-pdf-o', iconName: 'Reports.png',
        customClass: 'custom-icon', normaliseName: 'reports',
        submenu: [
          { name: 'Purchases', path: 'purchases', iconClass: 'fa-file', normaliseName: 'purchase' },
          { name: 'Sales', path: 'sales', iconClass: 'fa-file', normaliseName: 'sales' },
          { name: 'Inventory', path: 'inventory', iconClass: 'fa-file', normaliseName: 'inventory' },
          { name: 'Fuel', path: 'fuel', iconClass: 'fa-file', normaliseName: 'fuel' },
          { name: 'Accounting', path: 'accounting', iconClass: 'fa-file', normaliseName: 'accounting' },
          { name: 'Lottery', path: 'lottery', iconClass: 'fa-file', normaliseName: 'lottery' },
          { name: 'Misc', path: 'misc', iconClass: 'fa-file', normaliseName: 'misc' },
        ]
      },
      {
        name: 'Accounting', path: 'admin-accounting', iconClass: 'fa-file-pdf-o', iconName: 'House-Account.png',
        customClass: 'custom-icon', normaliseName: 'accounting',
        submenu: [
          { name: 'House Accounts', path: 'reconcile-house', iconClass: 'fa-monument', normaliseName: 'house accounts' },
        ]
      },
      {
        name: 'Setting', path: 'setting', iconClass: 'fa fa-cog', normaliseName: 'setting',
        submenu: [
          // { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-file', normaliseName: 'dashboards' },
          {
            name: 'Dashboard Setting', path: 'dashboard-setting', iconClass: 'fa-file'
            , normaliseName: 'dashboard setting'
          },
        ]
      },
      // {
      //   name: 'Scan Data', path: 'scan-data', iconClass: 'fa fa-barcode', iconName: 'ScanData.png',
      //   customClass: 'custom-icon', normaliseName: 'scan data'
      // },
      {
        name: 'Scan Data', path: 'scan-data1', iconClass: 'fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon',
        submenu: [
          // { name: 'Setup Manufacturer', path: 'setup-manufacturer', iconClass: 'fa-file' },
          { name: 'Scan Data Setup', path: 'scan-data-setup', iconClass: 'fa-file' },
          { name: 'Data', path: 'data', iconClass: 'fa-file' },
          { name: 'File Log', path: 'file-log', iconClass: 'fa-file' },
        ]
      },
      // {
      //   name: 'PJR Search', path: 'pjrsearch', iconClass: 'fa fa-search', normaliseName: 'pjr search'
      // }
    ];
  }

  getCompanyAdminUrls(companyId): RouteInfo[] {
    return [
      {
        name: 'Day Recon', path: 'admin-accounting/day-recon', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', iconName: 'Dashboard.png', customClass: 'custom-icon' },
      {
        name: 'Setup', path: '/', iconClass: 'fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Company Details', path: 'company/' + companyId, iconClass: 'fa-building', fragment: 'add-company' },
          { name: 'Add Bank', path: 'company/' + companyId, iconClass: 'fa-building', fragment: 'add-bank' },
          { name: 'Department', path: 'departments', iconClass: 'fa-television', },
          { name: 'User Management', path: 'company/' + companyId, iconClass: 'fa-building', fragment: 'user-management' },
          { name: 'Add Vendors', path: 'invoice/vendor', iconClass: 'fa-monument' },
        ]
      },
      { name: 'Store', path: 'stores', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      { name: 'TimeOff', path: 'time-off', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      { name: 'Scheduling', path: 'scheduling', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
     // { name: 'Timesheet (TimeOff)', path: 'timesheet-timeoff', iconClass: 'fa-fw fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Item', path: 'add-item', iconClass: 'fa-monument', },
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', },
          { name: 'Price Group', path: 'company-price-group', iconClass: 'fa-monument', },
          { name: 'Promotions', path: 'promotions', iconClass: '' },
          { name: 'Stock Transaction', path: 'stock-transaction', iconClass: 'fa-monument', },
          { name: 'Physical Inventory', path: 'physical-inventory', iconClass: 'fa-monument', },
          { name: 'Buy Down Manager', path: 'buy-down-manager', iconClass: 'fa-monument', isDisable: true },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument' },
          { name: 'Reconcile House', path: 'reconcile-house', iconClass: 'fa-monument' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument' },
          { name: 'Upload Edi Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument'}
        ]
      },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', },
          { name: 'Fuel Pricing', path: 'fuel-pricing', iconClass: 'fa-monument', },
          { name: 'Store Competitor', path: 'store-competitor', iconClass: 'fa-monument', },
          { name: 'Network Summary', path: 'network-summary', iconClass: 'fa-monument', },
          { name: 'Fuel Reconciliation', path: 'fuel-reconciliation', iconClass: 'fa-monument', },
          { name: 'Bill of Lading', path: 'fuel-management', iconClass: 'fa-monument', },
          { name: 'Fuel Inventory', path: 'fuel-inventory', iconClass: 'fa-monument',  }

        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument' }
        ]
      },
      {
        name: 'Reports', path: 'reports', iconClass: 'fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Purchases', path: 'purchases', iconClass: 'fa-file' },
          { name: 'Sales', path: 'sales', iconClass: 'fa-file' },
          { name: 'Inventory', path: 'inventory', iconClass: 'fa-file' },
          { name: 'Fuel', path: 'fuel', iconClass: 'fa-file' },
          { name: 'Accounting', path: 'accounting', iconClass: 'fa-file' },
          { name: 'Lottery', path: 'lottery', iconClass: 'fa-file' },
          { name: 'Misc', path: 'misc', iconClass: 'fa-file' },
        ]
      },
      {
        name: 'Accounting', path: 'admin-accounting', iconClass: 'fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        submenu: [
          { name: 'House Accounts', path: 'reconcile-house', iconClass: 'fa-monument' },
        ]
      },
      { name: 'Scan Data', path: 'scan-data', iconClass: 'fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        name: 'Live Data', path: 'pjrsearch', iconClass: 'fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }

  getInvoiceAdminUrls(companyId): RouteInfo[] {
    return [
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', iconName: 'Dashboard.png', customClass: 'custom-icon' },
      {
        name: 'Setup', path: '/', iconClass: 'fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Vendors', path: 'invoice/vendor', iconClass: 'fa-users' },
        ]
      },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument' },
          { name: 'Reconcile House', path: 'reconcile-house', iconClass: 'fa-monument' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument' },
          { name: 'Upload Edi Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument'}
        ]
      },
      {
        name: 'Reports', path: 'reports', iconClass: 'fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Purchases', path: 'purchases', iconClass: 'fa-file' },
          { name: 'Sales', path: 'sales', iconClass: 'fa-file' },
          { name: 'Inventory', path: 'inventory', iconClass: 'fa-file' },
          { name: 'Fuel', path: 'fuel', iconClass: 'fa-file' },
          { name: 'Accounting', path: 'accounting', iconClass: 'fa-file' },
          { name: 'Lottery', path: 'lottery', iconClass: 'fa-file' },
          { name: 'Misc', path: 'misc', iconClass: 'fa-file' },
        ]
      },
      { name: 'House Account', path: 'houseaccount', iconClass: 'fa-h-square', iconName: 'House-Account.png', customClass: 'custom-icon', },
      //{ name: 'Store Group', path: 'store-group', iconClass: 'fa-file-excel-o', normaliseName: 'store group' },
      { name: 'Data Import', path: 'data-import', iconClass: 'fa-monument', iconName: 'Admin.png', customClass: 'custom-icon' },
      {
        name: 'Setting', path: 'setting', iconClass: 'fa fa-cog', normaliseName: 'setting',
        submenu: [
          { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-file' },
          { name: 'Dashboard Setting', path: 'dashboard-setting', iconClass: 'fa-file' },
        ]
      }

    ];
  }
  getInventoryManagerUrls(companyId): RouteInfo[] {
    return [
      {
        name: 'Day Recon', path: 'admin-accounting/day-recon', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Item', path: 'add-item', iconClass: 'fa-monument', },
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', },
          { name: 'Price Group', path: 'company-price-group', iconClass: 'fa-monument', },
          { name: 'Promotions', path: 'promotions', iconClass: '' },
          { name: 'Stock Transaction', path: 'stock-transaction', iconClass: 'fa-monument', },
          { name: 'Physical Inventory', path: 'physical-inventory', iconClass: 'fa-monument', },
          { name: 'Buy Down Manager', path: 'buy-down-manager', iconClass: 'fa-monument', isDisable: true },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument' },
          { name: 'Upload Edi Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument'}
        ]
      },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', },
          { name: 'Fuel Pricing', path: 'fuel-pricing', iconClass: 'fa-monument', },
          { name: 'Store Competitor', path: 'store-competitor', iconClass: 'fa-monument', },
          { name: 'Network Summary', path: 'network-summary', iconClass: 'fa-monument', },
          { name: 'Fuel Reconciliation', path: 'fuel-reconciliation', iconClass: 'fa-monument', },
          { name: 'Bill of Lading', path: 'fuel-management', iconClass: 'fa-monument', },
          { name: 'Fuel Inventory', path: 'fuel-inventory', iconClass: 'fa-monument',  }

        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument' }
        ]
      },
      {
        name: 'Reports', path: 'reports', iconClass: 'fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Purchases', path: 'purchases', iconClass: 'fa-file' },
          { name: 'Sales', path: 'sales', iconClass: 'fa-file' },
          { name: 'Inventory', path: 'inventory', iconClass: 'fa-file' },
          { name: 'Fuel', path: 'fuel', iconClass: 'fa-file' },
          { name: 'Accounting', path: 'accounting', iconClass: 'fa-file' },
          { name: 'Lottery', path: 'lottery', iconClass: 'fa-file' },
          { name: 'Misc', path: 'misc', iconClass: 'fa-file' },
        ]
      },
      {
        name: 'Accounting', path: 'admin-accounting', iconClass: 'fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        submenu: [
          { name: 'House Accounts', path: 'reconcile-house', iconClass: 'fa-monument' },
        ]
      },
      { name: 'Scan Data', path: 'scan-data', iconClass: 'fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        name: 'Live Data', path: 'pjrsearch', iconClass: 'fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }
  getAssistantManagerUrls(companyId): RouteInfo[] {
    return [
      {
        name: 'Day Recon', path: 'admin-accounting/day-recon', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Item', path: 'add-item', iconClass: 'fa-monument', },
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', },
          { name: 'Price Group', path: 'company-price-group', iconClass: 'fa-monument', },
          { name: 'Promotions', path: 'promotions', iconClass: '' },
          { name: 'Stock Transaction', path: 'stock-transaction', iconClass: 'fa-monument', },
          { name: 'Physical Inventory', path: 'physical-inventory', iconClass: 'fa-monument', },
          { name: 'Buy Down Manager', path: 'buy-down-manager', iconClass: 'fa-monument', isDisable: true },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument' },
          { name: 'Upload Edi Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument'}

        ]
      },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', },
          { name: 'Fuel Pricing', path: 'fuel-pricing', iconClass: 'fa-monument', },
          { name: 'Store Competitor', path: 'store-competitor', iconClass: 'fa-monument', },
          { name: 'Network Summary', path: 'network-summary', iconClass: 'fa-monument', },
          { name: 'Fuel Reconciliation', path: 'fuel-reconciliation', iconClass: 'fa-monument', },
          { name: 'Bill of Lading', path: 'fuel-management', iconClass: 'fa-monument', },
          { name: 'Fuel Inventory', path: 'fuel-inventory', iconClass: 'fa-monument',  }

        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument' }
        ]
      },
      {
        name: 'Accounting', path: 'admin-accounting', iconClass: 'fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        submenu: [
          { name: 'House Accounts', path: 'reconcile-house', iconClass: 'fa-monument' },
        ]
      },
      { name: 'Scan Data', path: 'scan-data', iconClass: 'fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        name: 'Live Data', path: 'pjrsearch', iconClass: 'fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }
  getStoreManagerUrls(companyId): RouteInfo[] {
    return [
      {
        name: 'Day Recon', path: 'admin-accounting/day-recon', iconClass: 'fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', },
      {
        name: 'Price Book', path: 'items', iconClass: 'fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Item', path: 'add-item', iconClass: 'fa-monument', },
          { name: 'Item Advance Search', path: 'item', iconClass: 'fa-monument', },
          { name: 'Price Group', path: 'company-price-group', iconClass: 'fa-monument', },
          { name: 'Promotions', path: 'promotions', iconClass: '' },
          { name: 'Stock Transaction', path: 'stock-transaction', iconClass: 'fa-monument', },
          { name: 'Physical Inventory', path: 'physical-inventory', iconClass: 'fa-monument', },
          { name: 'Buy Down Manager', path: 'buy-down-manager', iconClass: 'fa-monument', isDisable: true },
        ]
      },
      {
        name: 'Invoices', path: 'invoice', iconClass: 'fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Vendor Invoice', path: 'vendor-invoice', iconClass: 'fa-monument' },
          { name: 'Fuel Invoice', path: 'fuel-invoice', iconClass: 'fa-monument' },
          { name: 'Bin Invoice', path: 'bin-invoice', iconClass: 'fa-monument' },
          { name: 'Action Invoice', path: 'action-invoice', iconClass: 'fa-monument' },
          { name: 'Validate Invoice', path: 'validate-invoice', iconClass: 'fa-monument' },
          { name: 'Upload Edi Invoice', path: 'upload-edi-invoice', iconClass: 'fa-monument' },
          { name: 'Invoice Dashboard', path: 'invoice-dashboard', iconClass: 'fa-monument'}

        ]
      },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', },
          { name: 'Fuel Pricing', path: 'fuel-pricing', iconClass: 'fa-monument', },
          { name: 'Store Competitor', path: 'store-competitor', iconClass: 'fa-monument', },
          { name: 'Network Summary', path: 'network-summary', iconClass: 'fa-monument', },
          { name: 'Fuel Reconciliation', path: 'fuel-reconciliation', iconClass: 'fa-monument', },
          { name: 'Bill of Lading', path: 'fuel-management', iconClass: 'fa-monument', },
          { name: 'Fuel Inventory', path: 'fuel-inventory', iconClass: 'fa-monument',  }

        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument' }
        ]
      },
      {
        name: 'Reports', path: 'reports', iconClass: 'fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Purchases', path: 'purchases', iconClass: 'fa-file' },
          { name: 'Sales', path: 'sales', iconClass: 'fa-file' },
          { name: 'Inventory', path: 'inventory', iconClass: 'fa-file' },
          { name: 'Fuel', path: 'fuel', iconClass: 'fa-file' },
          { name: 'Accounting', path: 'accounting', iconClass: 'fa-file' },
          { name: 'Lottery', path: 'lottery', iconClass: 'fa-file' },
          { name: 'Misc', path: 'misc', iconClass: 'fa-file' },
        ]
      },
      {
        name: 'Accounting', path: 'admin-accounting', iconClass: 'fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        submenu: [
          { name: 'House Accounts', path: 'reconcile-house', iconClass: 'fa-monument' },
        ]
      },
      { name: 'Scan Data', path: 'scan-data', iconClass: 'fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        name: 'Live Data', path: 'pjrsearch', iconClass: 'fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },];
  }
  getCashierUrls(companyId): RouteInfo[] {
    return [
      { name: 'Dashboard', path: 'dashboard', iconClass: 'fa-fw fa-dashboard', },
      {
        name: 'Fuel', path: 'fuel', iconClass: 'fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Tank Management', path: 'tank-management', iconClass: 'fa-monument', },
          { name: 'Competitor Pricing', path: 'competitor-pricing', iconClass: 'fa-monument', },
        ]
      },
      {
        name: 'Lottery', path: 'lottery', iconClass: 'fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        submenu: [
          { name: 'Add Game', path: 'add-game', iconClass: 'fa-monument', },
          { name: 'Confirm Pack', path: 'confirm-pack', iconClass: 'fa-monument', },
          { name: 'Activate Pack', path: 'activate-pack', iconClass: 'fa-monument', },
          { name: 'Move Pack', path: 'move-pack', iconClass: 'fa-monument', },
          { name: 'Return Pack', path: 'return-pack', iconClass: 'fa-monument', },
          { name: 'Lottery Inventory', path: 'lottery-inventory', iconClass: 'fa-monument' }
        ]
      },
    ];
    //  return this.getPrivilegesByUser();
  }
  /**
   * @tutorial user by privileges list
   * @template access urls
   */
  getPrivilegesByUser() {
    const users = JSON.parse(sessionStorage.getItem('userInfo'));
    const privileges = users.privileges;
    const urls = [];
    if (privileges && privileges.length > 0) {
      const allUrl = this.getSuperAdminUrls(users.companyId);
      allUrl.forEach(x => {
        if (isArray(x && x.submenu)) {
          const children = [];
          let parent = {};
          x.submenu.forEach(element => {
            parent = {
              path: x.path, name: x.name, iconClass: x.iconClass, iconName: x.iconName, customClass: x.customClass,
              submenu: null, fragment: x.fragment, normaliseName: x.normaliseName,
            };
            privileges.forEach(y => {
              if (y.privilegeTitle === element.normaliseName) {
                children.push(element);
              }
            });
          });
          if (children.length > 0) {
            urls.push({ ...parent, submenu: children });
          }
        } else {
          privileges.forEach(y => {
            if (y.privilegeTitle === x.normaliseName) {
              urls.push(x);
            }
          });
        }
      });
    }
    return urls;
  }
}
