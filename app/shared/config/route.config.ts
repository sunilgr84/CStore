export interface RouteInfo {
    path: string;
    name: string;
    iconClass: string;
    iconName?: string;
    customClass?: string;
    submenu?: any[];
    fragment?: string;
    normaliseName?: string;
    isCompanyIdRequired?: boolean;
}
