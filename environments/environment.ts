// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  // baseUrl: 'http://108.174.196.185:5000/api/',
  baseUrl: 'http://97.82.26.55:5000/api/',
  // baseUrl: 'https://41a8sepvzb.execute-api.us-east-1.amazonaws.com/',
  scandataBaseUrl: 'https://41a8sepvzb.execute-api.us-east-1.amazonaws.com/scandata/',
  userPreferences: 'http://18.188.151.234:4001/v1/',
  verifyBuyDownPrices: 'https://api.cstoreiq.com/api/',
  accountSid: "ACe5b2dea3aee5f2cd201678bcde1ad174",
  flexFlowSid: "FOd91d4afc21b3e414c531ab0047cb0959",
  // baseUrl: 'http://69.60.116.16:5001/api/', // setup service - company
  accountUrl: 'AccountingService/api/', // Account service - Payment
  // fuelService: 'http://69.60.116.16:5003/api/', // fuelService service - Payment
  itemService: 'itemservice/api/', // Items Service
  authService: 'authservice/api/', // Auth Service
  // lotteryService: 'http://69.60.116.16:5005/api/', // lottery service
  // elasticSearch: 'http://52.23.167.144:5001/', // elastic search service
  invoiceService: 'invoiceservice/api/',
  setupService: 'setupservice/api/',
  syncDataService: 'syncdataservice/api/',
};
