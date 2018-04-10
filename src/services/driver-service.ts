import {Injectable} from "@angular/core";
import { DRIVERS } from "./mock-drivers";
import { BookingHistory, BidDetails, DriverDetails, serviceUrl } from "./root-scope";
import { Http } from '@angular/http';
import { LoadingController, AlertController } from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class DriverService {
    private drivers: any;
    private history: any;
    private bookingAccept: any;
    private driverName: any;
    private vehicleNo: any;
    public http: any;
    public translate:any;
    public data : any;  
    public serviceUrl: any;

  constructor(http: Http, public loadingController: LoadingController, translate: TranslateService) {
      this.drivers = DRIVERS;
      this.history = BookingHistory.bookingHistoryDetails;
      this.bookingAccept = BidDetails.acceptedBooking;
      this.driverName = BidDetails.driverName;
      this.vehicleNo = BidDetails.vehicleNo;

      this.http = http;
      this.translate = translate;
      this.serviceUrl = serviceUrl;
      this.data = {}; 
  }

  getAll() {
      return this.drivers;
  }

  getBookingHistory() {
      return this.history;
  }

  getAcceptBooking() {
      return this.bookingAccept;
  }

  getDriverName() {
    return this.driverName;
  }
  getVehicleNo() {
    return this.vehicleNo;
  }
  getItem(id) {
    console.log("getDriver for Id ", id);

      let loader = this.loadingController.create({
            content: this.translate.get('SERVICE_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ driverId: id });
      console.log("req data", reqData);
      this.http.post(this.serviceUrl.baseUrl + 'service/driver/driverById', reqData)
          .subscribe(resp => {
              console.log("response : " + resp._body);
          this.data.response = JSON.parse(resp._body);              

          loader.dismiss();
          if (this.data.response.status == 'Success') {
            var obj = this.data.response;
            console.log('found driver details');
            console.log('driver obj ', obj);
            DriverDetails.driverPhoto = obj.photoUrl;

            return DriverDetails;
          } else {
            console.log('driver details fail');
            return null;
          }
    }, error => {

      console.log("Error getting driver details");
      return null;
    });
  }
}