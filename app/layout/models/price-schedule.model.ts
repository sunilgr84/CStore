export class PriceSchedule {
    posCodeOrDesc: string;
    sellingUnitStart: number;
    sellingUnitEnd: number;
    unitsInCaseStart: number;
    unitsInCaseEnd: number;
    sellingPriceStart: number;
    sellingPriceEnd: number;
    inventoryValuePriceStart: number;
    inventoryValuePriceEnd: number;
    currentInventoryStart: number;
    currentInventoryEnd: number;
    pMStartCriteria: number;
    pmEndCriteria: number;
    locationCriteria: string;
    vendorCriteria: string;
    department: string;
    posSyncStatus: number;
    isShowPricing: boolean;
    isClick: boolean;
    isOnWatchList: string;
    priceGroup: number;
    isMultipack: string;
    isActive: string;
    SearchBy: number;
    isShowMultiPackPricing: boolean;
    isShowDetails: boolean;
}
