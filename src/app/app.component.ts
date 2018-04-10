import { Component, ChangeDetectorRef } from '@angular/core';
import { Events, Platform, NavController, AlertController, App, LoadingController} from 'ionic-angular';
import {ViewChild} from '@angular/core';
import { StatusBar, Device, Geolocation, BackgroundMode } from 'ionic-native';
import { Http } from '@angular/http';
import { SplashScreen } from '@ionic-native/splash-screen';
import { CardIO } from '@ionic-native/card-io';
import 'rxjs/add/operator/timeout';
import { Push, PushObject, PushOptions} from '@ionic-native/push';

// import pages
import {LoginPage} from '../pages/login/login';
import {HomePage} from '../pages/home/home';
import {HistoryPage} from '../pages/history/history';
import {ScheduledPage} from '../pages/scheduled/scheduled';
import {NotificationPage} from '../pages/notification/notification';
import { SupportPage } from '../pages/support/support';
import { LogDetails, serviceUrl, currentLatLng, LiveVehicleDetails, maplatlng, ProfileDetails, DriverDetails, SystemParams, BidDetails,customerCurrentLatLng,trackingTrip } from '../services/root-scope';
import { RegisterPage } from '../pages/register/register';
import { PaymentDetailsPage } from '../pages/payment-details/payment-details';
import { TrackingPage } from '../pages/tracking/tracking';
import { ProfilePage } from '../pages/profile/profile';
import { TabsPage } from '../pages/tabs/tabs';
import { TripCompletePage } from '../pages/trip-complete/trip-complete';

import {TranslateService} from '@ngx-translate/core';


declare var google: any;

@Component({
  templateUrl: 'app.html',
  queries: {
    nav: new ViewChild('content')
  }
})
export class MyApp {

  public rootPage: any;
  public uuid: any;
  public data: any;
  public baseUrl: any;
  public http: any;
  private lat: any;
  private lng: any;
  public nav: any;
  public translate: any;
  public customerPhotoUrl:any;
  public deviceOS : any;

  //menuInit
  //'T' is used by Tracking Page
  //'P' is used by Profile Page

  public pages = [
    {
      title: 'HOME',
      icon: 'ios-home-outline',
      count: 0,
      component: HomePage,
      menuInit:'H'
    },
    {
      title: 'TRIPS',
      icon: 'ios-time-outline',
      count: 0,
      component: TabsPage,
      menuInit:'R' 
    },
    {
      title: 'NOTIFICATIONS',
      icon: 'ios-notifications-outline',
      count: 0,
      component: NotificationPage,
      menuInit:'N'
    },    
    /*{
      title: 'CARD_DETAILS',
      icon: 'ios-card',
      count: 0,
      component: PaymentDetailsPage,
      menuInit:'C'
    },*/
    {
      title: 'LOGOUT',
      icon: 'ios-log-out-outline',
      count: 0,
      component: LoginPage,
      menuInit:'L'
    }
  ];

  constructor(private app: App, public platform: Platform, http: Http, public alertCtrl: AlertController, translate: TranslateService, public push: Push, public splashScreen: SplashScreen, public loadingController: LoadingController, public events: Events, public cd : ChangeDetectorRef) {

      this.baseUrl = serviceUrl;
      this.http = http;
      this.data = {};
      this.translate = translate;

      translate.addLangs(["en", "ar"]);
      LogDetails.language = translate.getBrowserLang();
      console.log("setting language", LogDetails.language);
      translate.setDefaultLang(LogDetails.language);
      

    platform.ready().then(() => {
        StatusBar.styleDefault();

        if (this.platform.is('cordova')) {
            LogDetails.UUID = Device.uuid;
            this.deviceOS = Device.platform;
        } else {
            LogDetails.UUID = '1234567890';
            this.deviceOS = 'web';
        }
            
        console.log("platform ready ", LogDetails.UUID);
        BackgroundMode.enable();
        if (BackgroundMode.isEnabled()) {
            console.log("BackgroundMode is enabled");
            if (BackgroundMode.isActive()) {
                console.log("BackgroundMode is Active");
            }
        }
        
        this.getSystemParameters();

        let loader = this.loadingController.create({
              content:  this.translate.get("LOADING_IN_PROGRESS").value 
            });  
        loader.present();

        
            this.pushsetup();

          loader.dismiss();

        // Geolocation
        // .getCurrentPosition({ enableHighAccuracy: true, timeout:60000 })
        // .then((resp) => {
        //     console.log("latitude : "+ resp.coords.latitude);
        //     console.log("longitude : "+ resp.coords.longitude);
        //     this.lat = resp.coords.latitude;
        //     this.lng = resp.coords.longitude;
        //     currentLatLng.latitude = this.lat;
        //     currentLatLng.longitude = this.lng;
        //     customerCurrentLatLng.latitude = this.lat;
        //     customerCurrentLatLng.longitude = this.lng;

        //     var latlng = { lat: parseFloat(this.lat), lng: parseFloat(this.lng) };
        //     var geocoder = new google.maps.Geocoder();
        //     geocoder.geocode({ 'location': latlng}, function (results, status) {
              
        //         loader.dismiss();

        //          if (this.splashScreen) {
        //                 setTimeout(() => {
        //                   this.splashScreen.hide();
        //                 }, 50);
        //          }

        //         if (status === 'OK') {

        //             console.log("result in full", results);
        //             if (results[0]) {
        //                 console.log("retrieved address obj : "+ LogDetails.country);
        //                 console.log("retrieved formattedAddress : " + results[0].formatted_address);
        //                 currentLatLng.formattedAddress = results[0].formatted_address;
        //                 console.log("Current Latlng  : " + currentLatLng.formattedAddress);
        //             } else {
        //                 console.log('No results found');
        //             }
        //         } else {
        //             console.log('Geocoder failed due to: ' + status);
        //             let alert = this.alertCtrl.create({
        //                 title: 'Location Error',
        //                 subTitle: this.translate.get("NO_GPS").value,
        //                 buttons: ['OK']
        //             });
        //             alert.present();                    
        //         }
        //     });

        //     this.pushsetup();
        // }, (error) => {

        //   loader.dismiss();

        //   console.log(error);
        //   let alert = this.alertCtrl.create({
        //       title: 'Location Error',
        //       subTitle: this.translate.get("NO_GPS").value,
        //       buttons: ['OK']
        //   });
        //   alert.present();          


        //    if (this.splashScreen) {
        //           setTimeout(() => {
        //             this.splashScreen.hide();
        //           }, 50);
        //    }

        //   //this.platform.exitApp();
        // }).catch((error) => {
        //     console.log('Error getting location : '+ error.message);
            
        //     loader.dismiss();

        //     let alert = this.alertCtrl.create({
        //         title: 'Location Error',
        //         subTitle: this.translate.get("NO_GPS").value,
        //         buttons: ['OK']
        //     });
        //     alert.present();

        //    if (this.splashScreen) {
        //           setTimeout(() => {
        //             this.splashScreen.hide();
        //           }, 50);
        //    }
        //   //this.platform.exitApp();
        // });


        console.log("UUID :" + LogDetails.UUID);

        events.subscribe('user-photo:modified', (photoUrl) => {
          console.log('user-photo modified event');
          this.customerPhotoUrl = photoUrl;
          this.cd.detectChanges();
        });

    });
  }

  customerLoginUUID() {

     if (this.splashScreen) {
            setTimeout(() => {
              this.splashScreen.hide();
            }, 50);
     }

      var reqData = JSON.stringify({ uuid: LogDetails.UUID, deviceToken: LogDetails.deviceToken, lat: this.lat, lng: this.lng, deviceOS : this.deviceOS });

      let loader = this.loadingController.create({
            content:  this.translate.get("LOGIN_IN_PROGRESS").value 
          });  
      loader.present();

      this.http.post(this.baseUrl.baseUrl + 'service/loginUUID/', reqData)
          .timeout(30000)
          .subscribe(resp => {

              loader.dismiss();

              console.log(resp);
              this.data.response = JSON.parse(resp._body);
              console.log("Response : ", this.data.response);

              if (this.data.response.status == 'Success') {

                  LogDetails.customerId = this.data.response.customerId;
                  LogDetails.sessionId = this.data.response.sessionId;
                  LogDetails.hasCard = this.data.response.hasCard;
                  LogDetails.bookingId = this.data.response.bookingId;
                  LogDetails.bookingUUID = this.data.response.bookingUUID;
                  LogDetails.vehicleNo = this.data.response.vehicleNo;
                  LogDetails.driverName = this.data.response.driverName;
                  LogDetails.drvReached = this.data.response.drvReached;
                  LogDetails.geofencePass = this.data.response.isPlaceWithinGeofence;

                  if (LogDetails.geofencePass) {

                    DriverDetails.driverName = this.data.response.driverName;
                    DriverDetails.driverRank = this.data.response.driverRank;
                    BidDetails.dropOffChanged = this.data.response.dropOffChanged;
                    if(this.data.response.currentMap != "") {
                        LogDetails.currentMap = this.data.response.currentMap;
                        maplatlng.pickup = LogDetails.currentMap[0].pickAddr;
                        maplatlng.dropoff = LogDetails.currentMap[0].dropAddr;
                        maplatlng.dataflag = 0;

                        trackingTrip.pickup = LogDetails.currentMap[0].pickAddr;
                        trackingTrip.drop = LogDetails.currentMap[0].dropAddr;                       
                    }

                    maplatlng.homeView = 'D';

                    ProfileDetails.profileId = this.data.response.customerId;
                    ProfileDetails.name = this.data.response.customerName;
                    ProfileDetails.contactNo = this.data.response.contactNo;
                    ProfileDetails.email = this.data.response.email;
                    this.customerPhotoUrl = this.baseUrl.baseUrl + 'service/renderImage/' + ProfileDetails.profileId;

                    console.log("Customer ID : " + LogDetails.customerId);
                    LiveVehicleDetails.liveVehicles = this.data.response.liveVehicles;
                    LogDetails.recentLoc = this.data.response.recentLocations;

                    console.log("Live Vehicles count: " + LiveVehicleDetails.liveVehicles.length);
                    
                    this.translate.use(LogDetails.language);

                    console.log("Login params : ", LogDetails);

                    if (LogDetails.driverName != null && LogDetails.driverName != '') {
                      maplatlng.selMenu = 'T';
                      this.nav.setRoot(TrackingPage);
                    } else {
                      maplatlng.selMenu = 'H';                  
                      this.nav.push(HomePage);
                    }
                  } else {

                    let alert = this.alertCtrl.create({
                        title: 'Location Error',
                        subTitle: this.translate.get("LOCATION_NOT_ALLOWED").value,
                        buttons: ['OK']
                    });
                    alert.present();

                    this.nav.setRoot(RegisterPage);                  
                  }
              }
              else if (this.data.response.status == 'fail') {
                  this.nav.setRoot(RegisterPage);
              }
          }, error => {

              loader.dismiss();

              let alert = this.alertCtrl.create({
                  title: 'Login Error',
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: ['OK']
              });
              alert.present();
              this.nav.setRoot(RegisterPage);
          });  
  }

getSystemParameters() {

      var reqData = JSON.stringify({ uuid: LogDetails.UUID, deviceToken: LogDetails.deviceToken });
      this.http.post(this.baseUrl.baseUrl + 'service/systemParameters/', reqData)
          .timeout(30000)
          .subscribe(resp => {
              console.log(resp);
              this.data.response = JSON.parse(resp._body);
              console.log("Response : ", this.data.response);

              if (this.data.response.status == 'success') {
                  LogDetails.currencyCode = this.data.response.currencyCode;
                  LogDetails.drvReached = this.data.response.drvReached;
                  LogDetails.country = this.data.response.countryCode;
                  
                  SystemParams.shareLinkMessage = this.data.response.shareLinkMessage;
                  SystemParams.shareLinkUrl = this.data.response.shareLinkUrl;
                  SystemParams.driverPhotoUrl = this.data.response.driverPhotoUrl;
                  SystemParams.radius = this.data.response.radius;
                  SystemParams.vehiclePollInterval = this.data.response.vehiclePollInterval;

                  console.log("Live Vehicles count: " + LiveVehicleDetails.liveVehicles.length);
                  
                  this.translate.use(LogDetails.language);

                  console.log("Login params : ", LogDetails);

                  return;
              }
              else if (this.data.response.status == 'fail') {
                  return;
              }
          }, error => {
              return;
          });  
  }

  openPage(page) {
    console.log('open page ', page.title, maplatlng.selMenu, page.menuInit);
    if (page.title == 'HOME') {
      console.log('opening home/tracking page');
      maplatlng.homeView = 'D';

      if (maplatlng.selMenu != 'H' && maplatlng.selMenu != 'T') {
        console.log('here 1', maplatlng.selMenu);
        if (LogDetails.driverName != null && LogDetails.driverName != '') {
          maplatlng.selMenu = 'T';
          this.nav.setRoot(TrackingPage);
        } else {
          maplatlng.selMenu = 'H';
          this.nav.setRoot(HomePage);
        }
      } else
        console.log('here 2', maplatlng.selMenu);

    } else  {
      console.log('opening non home/tracking page');

        if (maplatlng.selMenu != page.menuInit) {
          maplatlng.selMenu = page.menuInit;
          this.nav.setRoot(page.component);
        }
    }
  }

  viewProfile() {
      this.nav.setRoot(ProfilePage);
  }

  pushsetup() {

    console.log('push setup');
    if (!this.platform.is('cordova')) {
      console.warn("Push notifications not initialized. Cordova is not available - Run in physical device");
      this.customerLoginUUID();
    } else {

      if (LogDetails.UUID != "") {

        const options: PushOptions = {
           android: {
               senderID: '556958165775'
           },
           ios: {
               alert: 'true',
               badge: true,
               sound: 'false'
           },
           windows: {}
        };  

        const pushObject: PushObject = this.push.init(options);

        pushObject.on('notification').subscribe((notification: any) => {
          if (notification.additionalData.foreground) {
              console.log('new message', notification.message);
            }
        });

        pushObject.on('registration').subscribe((registration: any) => {

          console.log('push notification registered ', registration);
          LogDetails.deviceToken = registration.registrationId;
          this.customerLoginUUID();

        });

        pushObject.on('error').subscribe(error => alert('Error with Push plugin' + error));
      } else {
         let alert = this.alertCtrl.create({
            title: 'Login Error',
            subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
            buttons: ['OK']
        });
        alert.present();     
        this.platform.exitApp();
      }  
    }
  }
}