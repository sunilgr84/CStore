// export class PaymentSource1 {
//     paymentSourceID: number;
//     companyID: number;
//     methodOfPaymentID: number;
//     lastCheckNumber: number;
//     sourceName: string;
//     routingNumber: string;
//     accountNumber: string;
//     addressLine1: string;
//     addressLine2: string;
//     city: string;
//     phoneNo: string;
//     stateCode: string;
//     notes: string;
//     createdDateTime: string;
//     lastModifiedBy: string;
//     lastModifiedDateTime: string;
//     createdBy: string;
//     methodOfPaymentDescription: string;
//     isCash: boolean;
//     isCheck: boolean;
//     stateName: string;
//     allowedPaymentStoreLocationID: number;
//     storeLocationID: number;
//     storeName: string;
//     isDefaultSource: boolean;
//     paymentsourceID: any;
//     bankTransactions:any;
// }

export class PaymentSource
{
    paymentSourceID: number;
    methodOfPaymentID: number;
    sourceName: string;
    routingNumber: string;
    addressLine1: string;
    city: string;
    phoneNo: string;
    stateCode: string;
    notes: string;
    storeBanks: any[];
    }
