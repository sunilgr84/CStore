import { Injectable } from '@angular/core';
import { NewRouteInfo } from '@shared/config/new-route.config';
import { isArray } from 'lodash';

@Injectable()
export class NewRouteConfigService {

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
  createMenu(userInfo, companyId, menus?): NewRouteInfo[] {
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
  getSuperAdminUrls(companyId): NewRouteInfo[] {
    return [
      {
        label: 'Day Recon', route: '/admin-accounting/day-recon', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon', normaliseName: 'day recon'
      },
      {
        label: 'Day Recon New', route: '/admin-accounting/day-recon-new', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon', normaliseName: 'day recon new'
      },
      {
        label: 'Live Data', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
      {
        label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', iconName: 'Dashboard.png',
        customClass: 'custom-icon', normaliseName: 'dashboard'
      },
      {
        label: 'Admin', iconClasses: 'asm-menu-anchor__icon fa fa-user', iconName: 'Admin.png', customClass: 'custom-icon', normaliseName: 'admin',
        children: [
          { label: 'Company', route: '/admin/companies', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-th', normaliseName: 'company' },
          { label: 'Data Import', route: '/admin/data-import', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'data import' },
          { label: 'Employee Timecard', route: '/admin/employe-timecard', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'employee timecard' },
          { label: 'Master Price Group', route: '/admin/price-group', iconClasses: 'asm-menu-anchor__icon fa fa-usd', normaliseName: 'master price group' },
          { label: 'Add Department', route: '/admin/department', iconClasses: 'asm-menu-anchor__icon fa fa-building-o', normaliseName: 'add department' },
          { label: 'Add Department Type', route: '/admin/department-type', iconClasses: 'asm-menu-anchor__icon fa fa-building', normaliseName: 'add department type' },
          { label: 'Add Manufacturer', route: '/admin/manufacturer', iconClasses: 'asm-menu-anchor__icon fa fa-usd', normaliseName: 'add manufacturer' },
          { label: 'Add Price Book Item', route: '/admin/price-book-item', iconClasses: 'asm-menu-anchor__icon fa fa-usd', normaliseName: 'add price book item' },
          { label: 'Add Brands', route: '/admin/brand', iconClasses: 'asm-menu-anchor__icon fa fa-usd', normaliseName: 'add brands' },
          { label: 'Add Privileges', route: '/admin/privileges', normaliseName: 'add privileges' },
          { label: 'Copy Data', route: '/admin/copy-data', normaliseName: 'copy data' },
          { label: 'From POS', route: '/admin/from-pos', normaliseName: 'from pos' },
          { label: 'To POS', route: '/admin/to-pos', normaliseName: 'to pos' },
          { label: 'Store Health', route: '/admin/store-health', normaliseName: 'store health' },
          { label: 'Setup Manufacturer', route: '/admin/setup-manufacturer', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Scan Data Submission', route: '/admin/scan-data-config', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Scan Data Acknowledgment', route: '/admin/scan-data-acknowledgment', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'ISM Update', route: '/admin/ism-update', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Master Price Book Wizard', route: '/admin/master-price-book-wizard', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Invoice Admin Dashboard', route: '/admin/inv-admin-dash', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      {
        label: 'Setup', iconClasses: 'asm-menu-anchor__icon fa fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        normaliseName: 'setup company',
        children: [
          {
            label: 'Company Details', route: '/company/add-company', iconClasses: 'asm-menu-anchor__icon fa fa-building-o', fragment: 'add-company',
            normaliseName: 'company details', isCompanyIdRequired: true
          },
          {
            label: 'Banks', route: '/company/add-bank', iconClasses: 'asm-menu-anchor__icon fa fa-university', fragment: 'add-bank', normaliseName: 'add bank'
            , isCompanyIdRequired: true
          },
          {
            label: 'User Management', route: '/company/user-management', iconClasses: 'asm-menu-anchor__icon fa fa-user-o', fragment: 'user-management',
            normaliseName: 'user Management', isCompanyIdRequired: true
          },
          { label: 'Department', route: '/departments', iconClasses: 'asm-menu-anchor__icon fa fa-address-card-o', normaliseName: 'department' },
          { label: 'Accounts', route: '/invoice/vendor', iconClasses: 'asm-menu-anchor__icon fa fa-users', normaliseName: 'add vendors' },
          { label: 'House Account', route: '/houseaccount', iconClasses: 'asm-menu-anchor__icon fa fa-file-excel-o', normaliseName: 'house account' },
          { label: 'Store Group', route: '/store-group', iconClasses: 'asm-menu-anchor__icon fa fa-file-excel-o', normaliseName: 'store group' },
        ]
      },
      {
        label: 'Store', route: '/stores', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'store'
      },
      {
        label: 'TimeOff', route: '/time-off', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'time-off'
      },
      {
        label: 'Scheduling', route: '/scheduling', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'scheduling'
      },
      {
        label: 'Employee timesheet Detail', route: '/employee-timesheet-detail', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon',
        normaliseName: 'employee-timesheet-detail'
      },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        normaliseName: 'price book',
        children: [
          { label: 'Add Item', route: '/items/add-item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'add item' },
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'item advanced search' },
          { label: 'Price Group', route: '/items/company-price-group', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'price group' },
          { label: 'Group Pricing', route: '/items/price-group-new', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'price group new' },
          { label: 'Promotions Old', route: '/items/promotions', iconClasses: 'asm-menu-anchor__icon fa ', normaliseName: 'promotions' },
          { label: 'Promotions', route: '/items/promotions-new', iconClasses: 'asm-menu-anchor__icon fa ', normaliseName: 'promotions new' },
          { label: 'Stock Transaction', route: '/items/stock-transaction', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'stock transaction' },
          { label: 'Physical Inventory', route: '/items/physical-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'physical inventory', },
          {
            label: 'Buy Down Manager', route: '/items/buy-down-manager', iconClasses: 'asm-menu-anchor__icon fa fa-monument', isDisable: true,
            normaliseName: 'buy down manager'
          },
          { label: 'Manage Items', route: '/items/manage-items', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'item advanced search' },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png',
        customClass: 'custom-icon', normaliseName: 'invoices',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'vendor invoice' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'fuel invoice' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'bin invoice' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'action invoice' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'validate invoice' },
          { label: 'Upload EDI Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'upload EDI invoice' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'invoice Dashboard' }

        ]
      },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon', normaliseName: 'fuel',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'tank management', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'competitor pricing', },
          { label: 'Fuel Pricing', route: '/fuel/fuel-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'fuel pricing', },
          { label: 'Store Competitor', route: '/fuel/store-competitor', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'store competitor', },
          { label: 'Network Summary', route: '/fuel/network-summary', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'network summary', },
          { label: 'Fuel Reconciliation', route: '/fuel/fuel-reconciliation', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'fuel reconciliation', },
          { label: 'Bill of Lading', route: '/fuel/fuel-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'bill of lading', },
          { label: 'Fuel Price Change History', route: '/fuel/fuel-price-change-history', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'fuel price change history', },
          {
            label: 'Fuel Inventory',
            route: '/fuel/fuel-inventory',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel inventory'
          },
          {
            label: 'Fuel Profit',
            route: '/fuel/fuel-profit',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel profit'
          }
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        normaliseName: 'lottery',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'add game', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'confirm pack', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'activate pack', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'move pack' },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'return pack' },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'lottery inventory' }
        ]
      },
      {
        label: 'Reports', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'Reports.png',
        customClass: 'custom-icon', normaliseName: 'reports',
        children: [
          { label: 'Purchases', route: '/reports/purchases', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'purchase' },
          { label: 'Sales', route: '/reports/sales', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'sales' },
          { label: 'Inventory', route: '/reports/inventory', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'inventory' },
          { label: 'Fuel', route: '/reports/fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'fuel' },
          { label: 'Accounting', route: '/reports/accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'accounting' },
          { label: 'Lottery', route: '/reports/lottery', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'lottery' },
          { label: 'Misc', route: '/reports/misc', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'misc' },
        ]
      },
      {
        label: 'Accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'House-Account.png',
        customClass: 'custom-icon', normaliseName: 'accounting',
        children: [
          { label: 'House Accounts', route: '/admin-accounting/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument', normaliseName: 'house accounts' },
        ]
      },
      {
        label: 'Setting', iconClasses: 'asm-menu-anchor__icon fa fa fa-cog', normaliseName: 'setting',
        children: [
          // { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-file', normaliseName: 'dashboards' },
          {
            label: 'Dashboard Setting', route: '/setting/dashboard-setting', iconClasses: 'asm-menu-anchor__icon fa fa-file'
            , normaliseName: 'dashboard setting'
          },
        ]
      },
      // {
      //   label: 'Scan Data', route: '/scan-data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png',
      //   customClass: 'custom-icon', normaliseName: 'scan data'
      // },
      {
        label: 'Scan Data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon',
        children: [
          // { label: 'Setup Manufacturer', route: '/setup-manufacturer', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Scan Data Setup', route: '/scan-data1/scan-data-setup', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Data', route: '/scan-data1/data', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'File Log', route: '/scan-data1/file-log', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      // {
      //   label: 'PJR Search', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa fa-search', normaliseName: 'pjr search'
      // }
    ];
  }

  getCompanyAdminUrls(companyId): NewRouteInfo[] {
    return [
      {
        label: 'Day Recon', route: '/admin-accounting/day-recon', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', iconName: 'Dashboard.png', customClass: 'custom-icon' },
      {
        label: 'Setup', iconClasses: 'asm-menu-anchor__icon fa fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        children: [
          { label: 'Company Details', route: '/company/add-company' + companyId, iconClasses: 'asm-menu-anchor__icon fa fa-building', fragment: 'add-company' },
          { label: 'Add Bank', route: '/company/add-bank' + companyId, iconClasses: 'asm-menu-anchor__icon fa fa-building', fragment: 'add-bank' },
          { label: 'Department', route: '/departments', iconClasses: 'asm-menu-anchor__icon fa fa-television', },
          { label: 'User Management', route: '/company/user-management' + companyId, iconClasses: 'asm-menu-anchor__icon fa fa-building', fragment: 'user-management' },
          { label: 'Add Vendors', route: '/invoice/vendor', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
        ]
      },
      { label: 'Store', route: '/stores', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      { label: 'TimeOff', route: '/time-off', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      { label: 'Scheduling', route: '/scheduling', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
     // { label: 'Timesheet (TimeOff)', route: '/timesheet-timeoff', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-table', iconName: 'Store.png', customClass: 'custom-icon' },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Item', route: '/items/add-item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Price Group', route: '/items/company-price-group', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Promotions', route: '/items/promotions', iconClasses: 'asm-menu-anchor__icon fa ' },
          { label: 'Stock Transaction', route: '/items/stock-transaction', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Physical Inventory', route: '/items/physical-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Buy Down Manager', route: '/items/buy-down-manager', iconClasses: 'asm-menu-anchor__icon fa fa-monument', isDisable: true },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Reconcile House', route: '/invoice/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Upload Edi Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument'}
        ]
      },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Pricing', route: '/fuel/fuel-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Store Competitor', route: '/fuel/store-competitor', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Network Summary', route: '/fuel/network-summary', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Reconciliation', route: '/fuel/fuel-reconciliation', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Bill of Lading', route: '/fuel/fuel-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          {
            label: 'Fuel Inventory',
            route: '/fuel/fuel-inventory',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel inventory'
          },
          {
            label: 'Fuel Profit',
            route: '/fuel/fuel-profit',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel profit'
          }
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument' }
        ]
      },
      {
        label: 'Reports', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        children: [
          { label: 'Purchases', route: '/reports/purchases', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Sales', route: '/reports/sales', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Inventory', route: '/reports/inventory', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Fuel', route: '/reports/fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Accounting', route: '/reports/accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Lottery', route: '/reports/lottery', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Misc', route: '/reports/misc', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      {
        label: 'Accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        children: [
          { label: 'House Accounts', route: '/admin-accounting/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
        ]
      },
      { label: 'Scan Data', route: '/scan-data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        label: 'Live Data', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }

  getInvoiceAdminUrls(companyId): NewRouteInfo[] {
    return [
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', iconName: 'Dashboard.png', customClass: 'custom-icon' },
      {
        label: 'Setup', iconClasses: 'asm-menu-anchor__icon fa fa-building', iconName: 'Company.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Vendors', route: '/invoice/vendor', iconClasses: 'asm-menu-anchor__icon fa fa-users' },
        ]
      },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        children: [
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Reconcile House', route: '/invoice/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Upload Edi Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument'}
        ]
      },
      {
        label: 'Reports', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        children: [
          { label: 'Purchases', route: '/reports/purchases', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Sales', route: '/reports/sales', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Inventory', route: '/reports/inventory', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Fuel', route: '/reports/fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Accounting', route: '/reports/accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Lottery', route: '/reports/lottery', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Misc', route: '/reports/misc', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      { label: 'House Account', route: '/houseaccount', iconClasses: 'asm-menu-anchor__icon fa fa-h-square', iconName: 'House-Account.png', customClass: 'custom-icon', },
      //{ label: 'Store Group', route: '/store-group', iconClasses: 'asm-menu-anchor__icon fa fa-file-excel-o', normaliseName: 'store group' },
      { label: 'Data Import', route: '/data-import', iconClasses: 'asm-menu-anchor__icon fa fa-monument', iconName: 'Admin.png', customClass: 'custom-icon' },
      {
        label: 'Setting', iconClasses: 'asm-menu-anchor__icon fa fa fa-cog', normaliseName: 'setting',
        children: [
          { label: 'Dashboard', route: '/setting/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Dashboard Setting', route: '/setting/dashboard-setting', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      }

    ];
  }
  getInventoryManagerUrls(companyId): NewRouteInfo[] {
    return [
      {
        label: 'Day Recon', route: '/admin-accounting/day-recon', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Item', route: '/items/add-item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Price Group', route: '/items/company-price-group', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Promotions', route: '/items/promotions', iconClasses: 'asm-menu-anchor__icon fa ' },
          { label: 'Stock Transaction', route: '/items/stock-transaction', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Physical Inventory', route: '/items/physical-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Buy Down Manager', route: '/items/buy-down-manager', iconClasses: 'asm-menu-anchor__icon fa fa-monument', isDisable: true },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Upload Edi Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument'}
        ]
      },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Pricing', route: '/fuel/fuel-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Store Competitor', route: '/fuel/store-competitor', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Network Summary', route: '/fuel/network-summary', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Reconciliation', route: '/fuel/fuel-reconciliation', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Bill of Lading', route: '/fuel/fuel-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          {
            label: 'Fuel Inventory',
            route: '/fuel/fuel-inventory',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel inventory'
          },
          {
            label: 'Fuel Profit',
            route: '/fuel/fuel-profit',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel profit'
          }
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument' }
        ]
      },
      {
        label: 'Reports', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        children: [
          { label: 'Purchases', route: '/reports/purchases', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Sales', route: '/reports/sales', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Inventory', route: '/reports/inventory', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Fuel', route: '/reports/fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Accounting', route: '/reports/accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Lottery', route: '/reports/lottery', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Misc', route: '/reports/misc', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      {
        label: 'Accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        children: [
          { label: 'House Accounts', route: '/admin-accounting/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
        ]
      },
      { label: 'Scan Data', route: '/scan-data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        label: 'Live Data', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }
  getAssistantManagerUrls(companyId): NewRouteInfo[] {
    return [
      {
        label: 'Day Recon', route: '/admin-accounting/day-recon', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Item', route: '/items/add-item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Price Group', route: '/items/company-price-group', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Promotions', route: '/items/promotions', iconClasses: 'asm-menu-anchor__icon fa ' },
          { label: 'Stock Transaction', route: '/items/stock-transaction', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Physical Inventory', route: '/items/physical-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Buy Down Manager', route: '/items/buy-down-manager', iconClasses: 'asm-menu-anchor__icon fa fa-monument', isDisable: true },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Upload Edi Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument'}

        ]
      },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Pricing', route: '/fuel/fuel-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Store Competitor', route: '/fuel/store-competitor', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Network Summary', route: '/fuel/network-summary', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Reconciliation', route: '/fuel/fuel-reconciliation', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Bill of Lading', route: '/fuel/fuel-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          {
            label: 'Fuel Inventory',
            route: '/fuel/fuel-inventory',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel inventory'
          },
          {
            label: 'Fuel Profit',
            route: '/fuel/fuel-profit',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel profit'
          }
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument' }
        ]
      },
      {
        label: 'Accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        children: [
          { label: 'House Accounts', route: '/admin-accounting/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
        ]
      },
      { label: 'Scan Data', route: '/scan-data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        label: 'Live Data', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },
    ];
  }
  getStoreManagerUrls(companyId): NewRouteInfo[] {
    return [
      {
        label: 'Day Recon', route: '/admin-accounting/day-recon', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png',
        customClass: 'custom-icon'
      },
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', },
      {
        label: 'Price Book', iconClasses: 'asm-menu-anchor__icon fa fa-book', iconName: 'PriceBook.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Item', route: '/items/add-item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Item Advance Search', route: '/items/item', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Price Group', route: '/items/company-price-group', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Promotions', route: '/items/promotions', iconClasses: 'asm-menu-anchor__icon fa ' },
          { label: 'Stock Transaction', route: '/items/stock-transaction', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Physical Inventory', route: '/items/physical-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Buy Down Manager', route: '/items/buy-down-manager', iconClasses: 'asm-menu-anchor__icon fa fa-monument', isDisable: true },
        ]
      },
      {
        label: 'Invoices', iconClasses: 'asm-menu-anchor__icon fa fa-file-text-o', iconName: 'Invoice.png', customClass: 'custom-icon',
        children: [
          { label: 'Vendor Invoice', route: '/invoice/vendor-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Fuel Invoice', route: '/invoice/fuel-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Bin Invoice', route: '/invoice/bin-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Action Invoice', route: '/invoice/action-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Validate Invoice', route: '/invoice/validate-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Upload Edi Invoice', route: '/invoice/upload-edi-invoice', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
          { label: 'Invoice Dashboard', route: '/invoice/invoice-dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-monument'}

        ]
      },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Pricing', route: '/fuel/fuel-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Store Competitor', route: '/fuel/store-competitor', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Network Summary', route: '/fuel/network-summary', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Fuel Reconciliation', route: '/fuel/fuel-reconciliation', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Bill of Lading', route: '/fuel/fuel-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          {
            label: 'Fuel Inventory',
            route: '/fuel/fuel-inventory',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel inventory'
          },
          {
            label: 'Fuel Profit',
            route: '/fuel/fuel-profit',
            iconClasses: 'asm-menu-anchor__icon fa fa-monument',
            normaliseName: 'fuel profit'
          }
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument' }
        ]
      },
      {
        label: 'Reports', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'Reports.png', customClass: 'custom-icon',
        children: [
          { label: 'Purchases', route: '/reports/purchases', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Sales', route: '/reports/sales', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Inventory', route: '/reports/inventory', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Fuel', route: '/reports/fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Accounting', route: '/reports/accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Lottery', route: '/reports/lottery', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
          { label: 'Misc', route: '/reports/misc', iconClasses: 'asm-menu-anchor__icon fa fa-file' },
        ]
      },
      {
        label: 'Accounting', iconClasses: 'asm-menu-anchor__icon fa fa-file-pdf-o', iconName: 'House-Account.png', customClass: 'custom-icon',
        children: [
          { label: 'House Accounts', route: '/admin-accounting/reconcile-house', iconClasses: 'asm-menu-anchor__icon fa fa-monument' },
        ]
      },
      { label: 'Scan Data', route: '/scan-data', iconClasses: 'asm-menu-anchor__icon fa fa fa-barcode', iconName: 'ScanData.png', customClass: 'custom-icon' },
      {
        label: 'Live Data', route: '/pjrsearch', iconClasses: 'asm-menu-anchor__icon fa fa-th-large', iconName: 'Day Recon.png', normaliseName: 'pjr search', customClass: 'custom-icon',
      },];
  }
  getCashierUrls(companyId): NewRouteInfo[] {
    return [
      { label: 'Dashboard', route: '/dashboard', iconClasses: 'asm-menu-anchor__icon fa fa-th-large fa-dashboard', },
      {
        label: 'Fuel', iconClasses: 'asm-menu-anchor__icon fa fa-file', iconName: 'Fuel.png', customClass: 'custom-icon',
        children: [
          { label: 'Tank Management', route: '/fuel/tank-management', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Competitor Pricing', route: '/fuel/competitor-pricing', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
        ]
      },
      {
        label: 'Lottery', iconClasses: 'asm-menu-anchor__icon fa fa-ticket', iconName: 'Lottery.png', customClass: 'custom-icon',
        children: [
          { label: 'Add Game', route: '/lottery/add-game', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Confirm Pack', route: '/lottery/confirm-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Activate Pack', route: '/lottery/activate-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Move Pack', route: '/lottery/move-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Return Pack', route: '/lottery/return-pack', iconClasses: 'asm-menu-anchor__icon fa fa-monument', },
          { label: 'Lottery Inventory', route: '/lottery/lottery-inventory', iconClasses: 'asm-menu-anchor__icon fa fa-monument' }
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
        if (isArray(x && x.children)) {
          const children = [];
          let parent = {};
          x.children.forEach(element => {
            parent = {
              path: x.route, name: x.label, iconClass: x.iconClasses, iconName: x.iconName, customClass: x.customClass,
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
