import { Component } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { DriverService } from '../../services/driver-service';
import { TrackingPage } from '../tracking/tracking';
import { DriverDetails, BidDetails, serviceUrl } from '../../services/root-scope'

/*
  Generated class for the DriverPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-driver',
  templateUrl: 'driver.html'
})
export class DriverPage {
  public driver:any;
  public driverName: any;
  public driverNo: any;
  public vehicleNo: any;
  public bookingNo: any;
  public driverPhoto : any ;
  public serviceUrl: any;
  
  constructor(public nav: NavController, public driverService: DriverService, public platform: Platform) {
      // get driver info
      this.serviceUrl = serviceUrl;
      this.driver = BidDetails.acceptedBooking;
      this.driverPhoto = DriverDetails.driverPhoto;

      console.log("Driver Value : "+this.driver.BidStatus);

      platform.ready().then(() => {
          console.log('ready');
          // init map
          this.initializeMap();

      });
  }

  initializeMap() {

  }



  track() {
    this.nav.setRoot(TrackingPage);
  }
}
