import { Component, ChangeDetectorRef} from '@angular/core';

import { NavController, Platform, AlertController, LoadingController, ModalController } from 'ionic-angular';
import { CallNumber } from 'ionic-native';

import { DriverService } from '../../services/driver-service';
import { HomePage } from "../home/home";
import {PlacesPage} from '../places/places';
import { TripCompletePage } from '../trip-complete/trip-complete';

import { Http } from '@angular/http';
import { maplatlng, serviceUrl, currentLatLng, LogDetails, paymentDetails, DriverDetails, LiveVehicleDetails, BidDetails, SystemParams,trackingTrip,customerCurrentLatLng } from "../../services/root-scope";
import {TranslateService} from '@ngx-translate/core';
import { SocialSharing } from '@ionic-native/social-sharing';


declare var google: any;

/*
  Generated class for the TrackingPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-tracking',
  templateUrl: 'tracking.html',
  providers: [SocialSharing]
})
export class TrackingPage {
  // map height
  public mapHeight:number = 450;

  // driver info
  public driver: any;
  public driverInfo: any;
  public driverName: any;
  public driverRank: any;
  public vehicleNo: any;
  private lat: any;
  private lng: any;
  public data: any;
  public baseUrl: any;
  public http: any;
  public pickupLatLng: any;
  public dropLatLng: any;
  public driverLat: any;
  public driverLng: any;
  private clrInterval: any;
  public fareAmt: any;
  public okBtn : any;
  public byCashBtn : any;
  public byCardBtn : any;
  public driverPhoto : any;
  public vehicleCurrLocMarker : any;
  public dropAddress : any;
  public dropAddressLat = "";
  public dropAddressLng = "";    
  public dropOffChanged = 0;
  public drvTimeToReach = '';
  public drvReached = '';


  // map
  public map:any;
  public translate:any;
  public tripStatus:any;

  public vehIcon = {
      url: "assets/img/taxi-white-bg-green-taxi.png",
      scaledSize: new google.maps.Size(30, 30),
      origin: new google.maps.Point(0,0),
      anchor: new google.maps.Point(0, 0)
  };

  constructor(public nav: NavController, public driverService: DriverService, public platform: Platform, public alertCtrl: AlertController, http: Http, translate: TranslateService, public loadingController: LoadingController, private socialSharing: SocialSharing, private modalCtrl: ModalController, private cd : ChangeDetectorRef) {

    this.translate = translate;
    this.baseUrl = serviceUrl;
    this.nav = nav;
    this.http = http;
    this.data = {};
    this.fareAmt = 0;
    this.translate = translate;
    this.okBtn = this.translate.get("OK").value;
    this.byCashBtn = this.translate.get("BY_CASH").value;
    this.byCardBtn = this.translate.get("BY_CARD").value;
    this.tripStatus = this.translate.get("CURRENT_MAP").value;
    translate.use(LogDetails.language);

    // get driver info
    this.driver = null;

    this.driverInfo = BidDetails.acceptedBooking;

    if (LogDetails.driverName != null && LogDetails.driverName != '') {

        this.driverInfo = {
          VehicleNo : LogDetails.vehicleNo,
          DriverName : LogDetails.driverName,
          DriverRank : DriverDetails.driverRank
        }
    }

    // when platform ready, init map
    platform.ready().then(() => {

        this.lat = currentLatLng.latitude;
        this.lng = currentLatLng.longitude;

        this.pickupLatLng = trackingTrip.pickup;
        this.dropLatLng = trackingTrip.drop;
        console.log('lat lng ', this.lat, this.lng, customerCurrentLatLng);
        this.dropAddress = trackingTrip.drop;
        this.dropOffChanged = BidDetails.dropOffChanged;

        // init map
        setTimeout(this.initializeMap(), 5000);
        
        this.clrInterval = setInterval(() => {
            this.getVehicleLocation();
        }, 5000);
    });
  }

  getVehicleLocation() {

      var bookingId = DriverDetails.bookingId ? DriverDetails.bookingId : LogDetails.bookingId;
      var vehicleNo = DriverDetails.vehicleNo ? DriverDetails.vehicleNo : LogDetails.vehicleNo;

      if (!bookingId) {
        clearInterval(this.clrInterval);
        return;
      }

      console.log("Vehicle No / Booking: " + vehicleNo + "/" + bookingId);
      var reqData = JSON.stringify({ isDriver: true, vehicleNo: vehicleNo, bookingId: bookingId });
      this.http.post(this.baseUrl.baseUrl + 'service/getVehicleLocation/', reqData)
          .subscribe(resp => {
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              if (this.data.response.status == 'Success') {
                    
                  // go to finding page
                    LiveVehicleDetails.vehicleLat = this.data.response.latitude;
                    LiveVehicleDetails.vehicleLng = this.data.response.longitude;
                    BidDetails.dropOffChanged = this.data.response.dropOffChanged;

                    this.fareAmt = this.data.response.fare;
                    console.log("lat : " + LiveVehicleDetails.vehicleLat + "Lng : " + LiveVehicleDetails.vehicleLng + ", Drv Reached : " + this.data.response.drvReached);

                    this.drvReached = this.data.response.drvReached;

                    if (!DriverDetails.driverPhoto)
                      DriverDetails.driverPhoto = SystemParams.driverPhotoUrl + this.data.response.loginId;

                    if (!this.driverPhoto)
                      this.driverPhoto = DriverDetails.driverPhoto;

                    if (this.data.response.drvReached == '0') {
                      console.log("drv not reached");
                      setTimeout( () => 
                        this.tripStatus =  this.translate.get('DRIVER_ON_THE_WAY').value, 
                        0);
                      this.calculateTime();
                        this.driverLocation(this.data.response.latitude, this.data.response.longitude);
                    } else if (this.data.response.drvReached == '1') {
                      console.log("drv reached");
                      setTimeout( () => 
                        this.tripStatus =  this.translate.get('DRIVER_REACHED').value, 
                        0);
                    } else if (this.data.response.drvReached == '2') {
                      console.log("trip in progress");
                      setTimeout( () => 
                        this.tripStatus =  this.translate.get('TRIP_IN_PROGRESS').value, 
                        0);
                      this.driverLocation(this.data.response.latitude, this.data.response.longitude);                      
                    } else if (this.data.response.drvReached == '3'){
                        console.log("trip Completed");
                        clearInterval(this.clrInterval);
                        LogDetails.driverName = "";

                      setTimeout( () => 
                        this.tripStatus =  this.translate.get('TRIP_COMPLETED').value, 
                        0);

                        var fare = this.fareAmt;


                        //if credit card payment handle payment authorization CCAvenue UI here 

                        var cashAndCard = LogDetails.hasCard == 1 ? 2 : 1;  

                        this.showTripComplete(LogDetails.bookingUUID, this.driverInfo.DriverName, vehicleNo, 2);  


                    } else if (this.fareAmt == '0' || this.data.response.drvReached != 3){
                        this.driverLocation(this.data.response.latitude, this.data.response.longitude);
                    } else {
                        console.log('Inside else part');
                      
                      setTimeout( () => 
                        this.tripStatus = this.translate.get('CURRENT_MAP').value, 
                        0);
                    }
                     
                    this.cd.detectChanges();      
              } else if (this.data.response.status == 'Fail') {

                console.log('Location Error', this.data.response.message);
              }
          }, error => {
              console.log('Location Error - System : ', this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value);
          });
  }


  initializeMap() {

    if(LogDetails.currentMap != null && LogDetails.currentMap.length > 0){
        
        maplatlng.pickupLatLng = new google.maps.LatLng(LogDetails.currentMap[0].pickLat, LogDetails.currentMap[0].pickLng);
        this.pickupLatLng = maplatlng.pickupLatLng;
        maplatlng.dropLatLng = new google.maps.LatLng(LogDetails.currentMap[0].dropLat, LogDetails.currentMap[0].dropLng);
        this.dropLatLng = maplatlng.dropLatLng;

    }

    var directionsDisplay = new google.maps.DirectionsRenderer;
    var directionsService = new google.maps.DirectionsService;

    let latLng = maplatlng.pickupLatLng;//new google.maps.LatLng(this.lat, this.lng);

    let mapOptions = {
      center: latLng,
      zoom: 7,//16,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false
    }

    this.map = null;
    this.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    console.log('done init map');
    // get ion-view height
    var viewHeight = window.screen.height; // minus nav bar
    // get info block height
    var infoHeight = 0;

    if (this.driverInfo.DriverName != undefined && this.driverInfo.DriverName != '')
      infoHeight = document.getElementById('drv-info-id').scrollHeight - 50;

    var dropOffAddrHeight = 0;  
    //if (dropOffAddrHeight)
      dropOffAddrHeight = 0;//55;

    this.mapHeight = viewHeight - infoHeight - dropOffAddrHeight;

    let options = {timeout: 120000, enableHighAccuracy: true};

    directionsDisplay.setMap(this.map);

    this.calculateAndDisplayRoute(directionsService, directionsDisplay);

    // refresh map
    setTimeout(() => {
      google.maps.event.trigger(this.map, 'resize');
    }, 300);
  }

  calculateAndDisplayRoute(directionsService, directionsDisplay) {
      var selectedMode = "DRIVING";
      var origin = this.pickupLatLng;
      var dest = this.dropLatLng;
      
      console.log("before drawing route");
      directionsService.route({
          origin: origin,  
          destination: dest,
      
          travelMode: google.maps.TravelMode[selectedMode]
      }, function (response, status) {
          if (status == 'OK') {
              directionsDisplay.setDirections(response);
          } else {
              console.log('Directions request failed due to ' + status);
          }
      });
      console.log("after drawing route");
  }

  driverLocation(dLat, dLng) {

    var viewHeight = window.screen.height; // minus nav bar

    var infoHeight;
      
    if (this.driverInfo.DriverName != undefined && this.driverInfo.DriverName != '') 
      infoHeight = document.getElementById('drv-info-id').scrollHeight - 50;

      var dropOffAddrHeight = 0;  
     //if (dropOffAddrHeight)
      dropOffAddrHeight = 0;//55;

      this.mapHeight = viewHeight - infoHeight - dropOffAddrHeight;

      let options = { timeout: 120000, enableHighAccuracy: true };
      
      console.log('veh lat lng ', dLat, dLng, LiveVehicleDetails.vehicleLat, LiveVehicleDetails.vehicleLng);

      var newLatLng = new google.maps.LatLng(LiveVehicleDetails.vehicleLat, LiveVehicleDetails.vehicleLng);
      this.map.setCenter(newLatLng);

      if (this.vehicleCurrLocMarker != null)
          this.vehicleCurrLocMarker.setMap(null);

      this.vehicleCurrLocMarker = new google.maps.Marker({
          map: this.map,
          icon: this.vehIcon,
        position: this.map.getCenter()
      });
      this.map.setZoom(18);
        
  }


    // show rating popup
    showRating() {
        let prompt = this.alertCtrl.create({
            title: this.translate.get("THANK_YOU").value,
            message: this.translate.get("RATING_MSG").value,
            buttons: [
                {
                    text: this.translate.get("CANCEL").value,
                    handler: data => {
                        this.nav.setRoot(HomePage);
                    }
                },
                {
                    text: this.translate.get("SUBMIT").value,
                    handler: data => {
                        this.nav.setRoot(HomePage);
                    }
                }
            ]
        })
        prompt.present();
    }
    
    ionViewDidLeave() {
      clearInterval(this.clrInterval);
    }
    
    /*ionViewWillEnter() {
      this.initializeMap();
      //setTimeout(this.initializeMap(), 5000);

      this.clrInterval = setInterval(() => {
          this.getVehicleLocation();
      }, 5000);       
    }*/

    call() {
        CallNumber.callNumber(this.driverInfo.DriverMobNo, true)
            .then(() => console.log('Launched dialer!'))
            .catch(() => console.log('Error launching dialer'));
    }

    sendSOS() {

      //send message to call center

      console.log("send sos : ", LogDetails.bookingUUID, currentLatLng.latitude, currentLatLng.longitude);

      var reqData = JSON.stringify({ bookingUUID: LogDetails.bookingUUID, lat : currentLatLng.latitude, lng : currentLatLng.longitude });
      this.http.post(this.baseUrl.baseUrl + 'service/sendSOSDetails/', reqData)
          .subscribe(resp => {
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              if (this.data.response.status == 'Success') {
                  // go to finding page
                  DriverDetails.bookingId = this.data.response.bookingId;
                  console.log("Booking Details :" + DriverDetails.bookingId);


                      let alert = this.alertCtrl.create({
                          title: this.translate.get("SEND_SOS").value,
                          subTitle: "Your SOS request is successfully submitted. Please wait to be contacted",
                          buttons: [this.okBtn]
                      });
                      alert.present();

              } else if (!this.data.response.success) {

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("SOS_ERROR").value,
                      subTitle: this.translate.get(this.data.response.messageCode).value,
                      buttons: [this.okBtn]
                  });
                  alert.present();
              }
          }, error => {              
              let alert = this.alertCtrl.create({
                  title: this.translate.get("UNKNOWN_ERROR").value,
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [this.okBtn]
              });
              alert.present();
          });

    }

    payTrip(bookingId, payType) {

      var url ='';
      if (payType == 0)
        url = 'service/makeCashPayment/';
      else
        url = 'service/makeCardPayment/';
          
      let loader = this.loadingController.create({
            content: this.translate.get('PAYMENT_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId : bookingId });
      console.log("req data", reqData);
      this.http.post(this.baseUrl.baseUrl + url, reqData)
          .subscribe(resp => {

              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              loader.dismiss();
              if (this.data.response.status == 'approved'
                || this.data.response.status == 'Success') {
                  // go to finding page
                  
                  var refId = this.data.response.payRefId ? this.data.response.payRefId : '';

                  LogDetails.bookingId = null;
                  LogDetails.bookingUUID = null;
                  LogDetails.vehicleNo = null;
                  LogDetails.driverName = null;

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("PAYMENT").value,
                      subTitle: this.translate.get("PAYMENT_SUCCESSFUL").value + refId,
                      buttons: [this.okBtn]
                  });

                  alert.present();
                  // go to finding page
              } else {

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("PAYMENT").value,
                      subTitle: this.translate.get("PAYMENT_UNSUCCESSFUL").value,
                      buttons: [this.okBtn]
                  });
                  alert.present();
              }
          }, error => {

              loader.dismiss();
              let alert = this.alertCtrl.create({
                  title: this.translate.get("UNKNOWN_ERROR").value,
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [this.okBtn]
              });
              alert.present();
          });
    } 


    //for social sharing
    shareTrip() {
      var bookingUUID = DriverDetails.bookingUUID ? DriverDetails.bookingUUID : LogDetails.bookingUUID;
      var message = SystemParams.shareLinkMessage;
      var link = SystemParams.shareLinkUrl + bookingUUID;
      //var link = 'http://viaextech.com';
      console.log("message : "+message+", link : "+link);
      this.share(message, null, null, link);
    }

    share(message, subject, file, link) {
        this.socialSharing.share(message, "My Location Track", null, link).then(() => {
            console.log("Sharing successfull");
        }).catch(() => {
            console.log("Sharing Error");
        });

    }    

    cancelBooking() {
        var bookingId = DriverDetails.bookingId ? DriverDetails.bookingId : LogDetails.bookingId;
        let prompt = this.alertCtrl.create({
            title: this.translate.get("CANCEL_BOOKING").value,
            message: this.translate.get("ARE_YOU_SURE_CANCEL_BOOKING").value,
            buttons: [
                {
                    text: this.translate.get("YES").value,
                    handler: data => {
                        console.log('Yes clicked');
                        this.doCancelBooking(bookingId);
                    }
                },
                {
                    text: this.translate.get("NO").value,
                    handler: data => {
                        console.log('No clicked');
                    }
                }
            ]
        })
        prompt.present();
    }

    doCancelBooking(bookingId) {

        var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId: bookingId });
        this.http.post(this.baseUrl.baseUrl + 'service/cancelBooking/', reqData)
            .subscribe(resp => {

                console.log("response Find : " + resp._body);
                this.data.response = JSON.parse(resp._body);

                if (this.data.response.status == 'Success') {
                    // go to finding page

                    let alert = this.alertCtrl.create({
                        title: this.translate.get("BOOKING_CANCEL").value,
                        subTitle: this.translate.get(this.data.response.messageCode).value,
                        buttons: [this.okBtn]
                    });
                    alert.present();
                    this.nav.setRoot(HomePage);
                }
                else if (this.data.response.status == 'Fail') {
                    let alert = this.alertCtrl.create({
                        title: this.translate.get("CANCELLATION_ERROR").value,
                        subTitle: this.translate.get(this.data.response.messageCode).value,
                        buttons: [this.okBtn]
                    });
                    alert.present();
                }
            }, error => {
                let alert = this.alertCtrl.create({
                    title: this.translate.get("UNKNOWN_ERROR").value,
                    subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                    buttons: [this.okBtn]
                });
                alert.present();
            });
    }

    setVehicleLocation() {

        if (this.vehicleCurrLocMarker != null)
            this.vehicleCurrLocMarker.setMap(null);

        this.vehicleCurrLocMarker = new google.maps.Marker({
          map: this.map,
          position: { lat: LiveVehicleDetails.vehicleLat, lng: LiveVehicleDetails.vehicleLng },
            icon: this.vehIcon
          });
    }

  // choose drop place
  dropPlace() {

      if (BidDetails.dropOffChanged == 0) {

        // go to places page  
        let modal = this.modalCtrl.create(PlacesPage);
        let me = this;
        modal.onDidDismiss(data => {
            if (data) {
              this.dropAddress = data;
              maplatlng.dropoff = data;
            }
        });
        modal.present();
      }
  }

  saveDropOff() {

  console.log("drop off value", BidDetails.dropOffChanged);

      if (BidDetails.dropOffChanged == 1) {

        let alert = this.alertCtrl.create({
            title: this.translate.get("BOOKING_NOT_UPDATED").value,
            subTitle: this.translate.get('DROP_CHANGED').value,
            buttons: [this.okBtn]
        });
        alert.present();

        return;
    } else {

      let prompt = this.alertCtrl.create({
        title: this.translate.get("ARE_YOU_SURE_TO_CHANGE").value,
        message: "",      
        buttons: [
          {
            text: this.translate.get("CANCEL").value,
            handler: data => {

            }
          },
          {
            text: this.translate.get("YES").value,
            handler: data => {

                this.getLatLngFromAddress(this.dropAddress);              
            }
          }
        ]
      });

      prompt.present();
    }
  }

  getLatLngFromAddress(addr) {
    var self = this;

    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
          address: addr
        }, function (results, status) {

          if (status === 'OK') {
              self.dropAddressLat = results[0].geometry.location.lat();
              self.dropAddressLng = results[0].geometry.location.lng();
              
              self.saveVal();
          }
    });
  }

  saveVal() {

      var self = this;
      var bookingUUID = DriverDetails.bookingUUID ? DriverDetails.bookingUUID : LogDetails.bookingUUID;
      var reqData = JSON.stringify({ dropAddress: self.dropAddress, latitude: self.dropAddressLat, longitude: self.dropAddressLng, bookingUUID: bookingUUID });

      self.http.post(self.baseUrl.baseUrl + 'service/saveDropOff/', reqData)
          .subscribe(resp => {
              console.log("response Find : " + resp._body);
              self.data.response = JSON.parse(resp._body);

              if (self.data.response.status == 'Success') {
                  // go to finding page

                  BidDetails.dropOffChanged = self.data.response.dropOffChanged;
                  this.dropOffChanged = BidDetails.dropOffChanged;  
                  let alert = self.alertCtrl.create({
                      title: self.translate.get("BOOKING_UPDATED").value,
                      subTitle: self.translate.get(self.data.response.messageCode).value,
                      buttons: [self.okBtn]
                  });
                  alert.present();
                  self.nav.setRoot(HomePage);
              }
              else if (self.data.response.status == 'Fail') {
                  let alert = self.alertCtrl.create({
                      title: self.translate.get("BOOKING_NOT_UPDATED").value,
                      subTitle: self.translate.get(self.data.response.messageCode).value,
                      buttons: [self.okBtn]
                  });
                  alert.present();
              }
          }, error => {
              let alert = self.alertCtrl.create({
                  title: self.translate.get("UNKNOWN_ERROR").value,
                  subTitle: self.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [self.okBtn]
              });
              alert.present();
          });
  }

  calculateTime() {

    var origin = new google.maps.LatLng( LiveVehicleDetails.vehicleLat, LiveVehicleDetails.vehicleLng ); // using google.maps.LatLng class
    var destination = this.dropLatLng;//target.latitude + ', ' + target.longitude; // using string

    var directionsService = new google.maps.DirectionsService();
    var request = {
        origin: origin, // LatLng|string
        destination: destination, // LatLng|string
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    };

    directionsService.route( request, function( response, status ) {

        if ( status === 'OK' ) {
            var point = response.routes[ 0 ].legs[ 0 ];
            this.drvTimeToReach = point.duration.text;
            $( '#drvTimeToReach' ).html(point.duration.text);
        }
    } );    
  }

  showTripComplete(bookingUUID, driverName, vehicleNo, cashAndCard) {

    this.nav.push(TripCompletePage, { bookingUUID: bookingUUID, driverName: driverName, vehicleNo: vehicleNo, cashAndCard: cashAndCard, calledBy:'T'});    

    /*let modal = this.modalCtrl.create(TripCompletePage, { bookingUUID: bookingUUID, driverName: driverName, vehicleNo: vehicleNo, cashAndCard: cashAndCard, calledBy:'T'});

    modal.onDidDismiss(data => {
        this.nav.setRoot(HomePage);    
    });
    modal.present();*/
  }

}
