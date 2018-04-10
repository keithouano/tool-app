import {Injectable} from "@angular/core";
import { Component } from '@angular/core';
import { LogDetails, LiveVehicleDetails, serviceUrl } from "../services/root-scope";
//maplatlng, CardDetails, 
import { LoadingController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import {TranslateService} from '@ngx-translate/core';

@Component({
  providers:[VehicleService]
})

@Injectable()
export class VehicleService {
  public http: any;
  public baseUrl: any;
  public translate:any;
  public data : any;

  constructor(http: Http, public loadingController: LoadingController, translate: TranslateService) {
    this.http = http;
    this.baseUrl = serviceUrl;
    this.translate = translate;
    this.data = {};
  }


 getNearByVehicles(lat, lng) : any {

      console.log("getLiveVehicleDetails for lat lang ", lat, lng);
      //console.log("getLiveVehicleDetails for lat lang ", maplatlng.lat, maplatlng.lng);

      let loader = this.loadingController.create({
            content: this.translate.get('SERVICE_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ lat: lat, lng : lng });
      //var reqData = JSON.stringify({ lat: maplatlng.lat, lng : maplatlng.lng });
      console.log("req data", reqData);
      this.http.post(this.baseUrl.baseUrl + 'service/fetchNearbyVehicles/', reqData)
          .subscribe(resp => {
              console.log("response : " + resp._body);
			  this.data.response = JSON.parse(resp._body);              

              loader.dismiss();
              if (this.data.response.status == 'Success') {
              	var obj = this.data.response;
              	console.log('found vehicle details');
              	LiveVehicleDetails.vehicleLat = obj.Latitude;
                LiveVehicleDetails.vehicleLng = obj.Longitude;
                LiveVehicleDetails.vehicleType = 'Standard';

              	return LiveVehicleDetails;
              } else {
              	console.log('live vehicle details fail');
              	return null;
              }
          }, error => {

          	console.log("Error getting live vehicle details");
          	return null;
          });
    }
 
 }