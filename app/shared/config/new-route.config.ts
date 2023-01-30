export interface NewRouteInfo {
    route?: string;
    label: string;
    iconClasses?: string;
    iconName?: string;
    customClass?: string;
    children?: NewRouteInfo[];
    fragment?: string;
    normaliseName?: string;
    isCompanyIdRequired?: boolean;
    roles?: string
    isDisable?: boolean
}
