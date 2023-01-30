export class Company {
    // constructor(public companyName: string,
    //     public vat: string) {
    // }
    public companyID: any;
    public companyName: string;
    public companyLoginCode: string;
    public vat: string;
    public street: string;
    public city: string;
    public zipCode: string; // neew field
    public postalCode: number;
    public countryName: string;
    public companyTaxID: string;
    public companyAddressLine1: string;
    public companyAddressLine2: string;
    public countyCode: string;
    public companyContact: string; // neew field
    public stateCode: string;
    public e_Mail: string;
    public phoneNo: string;
    public fax: string;
    public syncUser: string;
    public syncPwd: string;
    public enableMobileLogging = true;
    public isInPOSSyncStatus = true;
    public isJobber = false;
    public isActive: boolean;
    public storeLocations: any[];
    public companyLogo: string;
}
