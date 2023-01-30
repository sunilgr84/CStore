import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class WeatherService {

  accuweatherApiKey = '4d0534e1f26a67ff1394e5870cc3202b';
  googleApiKey = 'AIzaSyARlRX82ld-Ha_eAwOkzl_RX4I-9hPKIV0';

  constructor(private http: HttpClient) { }
  getWeatherByZip(zipCode: number, countryCode: string) { // 94040, us
    return this.http.get('https://api.openweathermap.org/data/2.5/weather?zip=' + zipCode + ',' +
      countryCode + '&appid=' + this.accuweatherApiKey + '&units=imperial');
  }
  getWeatherByCityName(cityName: string, countryCode: string) {
    return this.http.get('https://api.accuweather.com/locations/v1/cities/search.json?q=' + cityName
      + '&apikey=' + this.accuweatherApiKey + '&language=en-us');
  }

  getCityStateZip(searchText) {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?address=' + searchText + '&key=' + this.googleApiKey);
  }
  getRouteNum(routeNum) {
    return this.http.get('https://www.routingnumbers.info/api/data.json?rn=' + routeNum);
  }
  autoCompletePlaces(inputText) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      })
    };
    return this.http.get('https://maps.googleapis.com/maps/api/place/autocomplete/json?' +
      'input=' + inputText + '&types=geocode&language=us&key=' + this.googleApiKey, httpOptions);
    //   + 'input=' + inputText + '&key=' + this.googleApiKey, httpOptions); // + '&sessiontoken=1234567890');
  }
}
