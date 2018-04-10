import { Component,ChangeDetectorRef } from '@angular/core';
import { Platform, LoadingController , NavController, AlertController, ModalController, App } from 'ionic-angular';
import { TripService } from '../../services/trip-service';
import { Http } from '@angular/http';
import { serviceUrl, LogDetails, maplatlng,BookingHistory } from "../../services/root-scope";
import { DriverService } from "../../services/driver-service";
import { HomePage } from "../home/home";
import {TranslateService} from '@ngx-translate/core';
import { TripCompletePage } from '../trip-complete/trip-complete';

declare var google: any;

/*
  Generated class for the HistoryPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-history',
  templateUrl: 'history.html'
})
export class HistoryPage {
  // history records
  public records:any;

  public baseUrl: any;
  public http: any;
  public data: any;
  public bookingHistoryData: any;
  public currencyCode : any;
  public hasCard: any;
  public translate: any;
  public okBtn: any;
  public tabBarElement : any;

  constructor(public platform: Platform, private app: App, public nav: NavController, public driverService: DriverService, public tripService: TripService, http: Http, public alertCtrl: AlertController, public loadingController: LoadingController, translate: TranslateService, private modalCtrl: ModalController, private cd: ChangeDetectorRef) {

      this.nav = nav;
      this.http = http;
      this.translate = translate;
      this.data = {};
      this.baseUrl = serviceUrl;
      //this.records = tripService.getAll();
      this.currencyCode = LogDetails.currencyCode;
      this.hasCard = LogDetails.hasCard;

      this.tabBarElement = document.querySelector('.tabbar.show-tabbar');

      platform.ready().then(() => {

        translate.use(LogDetails.language);
        this.okBtn = this.translate.get("OK").value;

        this.bookingHistory(this.currencyCode, this.hasCard);

        this.cd.detectChanges();
      });
  }

  bookingHistory(currencyCode, hasCard) {

      console.log("has card ", hasCard);
       
      var reqData = JSON.stringify({ customerId: LogDetails.customerId, sessionId: LogDetails.sessionId });
      this.http.post(this.baseUrl.baseUrl + 'service/bookingHistory/', reqData)
          .subscribe(resp => {
              console.log(resp);
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              if (this.data.response.status == 'Success') {
                  // go to finding page
                  
                  BookingHistory.bookingHistoryDetails = this.data.response.bookingHistory;
                  console.log("Booking Details :" + BookingHistory.bookingHistoryDetails);
                  this.bookingHistoryData = BookingHistory.bookingHistoryDetails;
                  // go to finding page
              }
              else if (this.data.response.status == 'fail') {

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("BOOKING_HISTORY_NOT_FOUND").value,
                      subTitle: this.translate.get(this.data.response.messageCode).value,
                      buttons: [this.okBtn]
                  });
                  alert.present();
              }
          }, error => {0
              let alert = this.alertCtrl.create({
                  title: this.translate.get("BOOKING_HISTORY_NOT_FOUND").value,
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [this.okBtn]
              });
              alert.present();
          });
  }

  bookTrip(bookingData, rev, homeView) {

    if (bookingData != null) {

      console.log("Pickup Address : " + bookingData.PickupAddress);
      console.log("Drop Address : " + bookingData.DropAddress);
      console.log("lat long ", bookingData.PKLt, bookingData.PKLg, bookingData.DRLt, bookingData.DRLg);

      if (rev == 1) {

        maplatlng.pickup = bookingData.DropAddress;
        maplatlng.pickupLatLng = [bookingData.DRLt,bookingData.DRLg];

        maplatlng.dropoff = bookingData.PickupAddress;
        maplatlng.dropLatLng = [bookingData.PKLt,bookingData.PKLg];

        maplatlng.dataflag = 1;
      } else {

        maplatlng.pickup = bookingData.PickupAddress;
        maplatlng.pickupLatLng = [bookingData.PKLt,bookingData.PKLg];

        maplatlng.dropoff = bookingData.DropAddress;
        maplatlng.dropLatLng = [bookingData.DRLt,bookingData.DRLg];

        maplatlng.dataflag = 1;
      }
    } else {

        maplatlng.dropoff = '';
        maplatlng.dataflag = 0;
    }

    //this.cd.detectChanges();  
    
    maplatlng.homeView = homeView;
    maplatlng.selMenu = 'H';

    this.nav.setRoot(HomePage);
  }

  cancelBooking(bookingId) {

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

        console.log("cancel booking", bookingId);

        var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId: bookingId, sessionId:LogDetails.sessionId });
        this.http.post(this.baseUrl.baseUrl + 'service/cancelBooking/', reqData)
            .subscribe(resp => {
                console.log(resp);
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
                    this.bookingHistory(LogDetails.currencyCode, LogDetails.hasCard);  
                } else if (this.data.response.status == 'Fail') {
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

  payTrip(bookingId) {

      console.log("pay trip", bookingId);

      let loader = this.loadingController.create({
            content: this.translate.get('CARD_PAYMENT_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId : bookingId });
      console.log("req data", reqData);
      this.http.post(this.baseUrl.baseUrl + 'service/makeCardPayment/', reqData)
          .subscribe(resp => {
              console.log(resp);
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              loader.dismiss();
              if (this.data.response.status == 'approved') {
                  // go to finding page
                  
                  LogDetails.bookingId = null;
                  LogDetails.vehicleNo = null;
                  LogDetails.driverName = null;

                  this.bookingHistory(LogDetails.currencyCode, LogDetails.hasCard);
                  
                  let alert = this.alertCtrl.create({
                      title: this.translate.get("PAYMENT_SUCCESSFUL").value,
                      subTitle: this.translate.get("CARD_PAYMENT_SUCCESSFUL").value + this.data.response.payRefId,
                      buttons: [this.okBtn]
                  });

                  alert.present();
                  // go to finding page
              } else {

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("PAYMENT_UNSUCCESSFUL").value,
                      subTitle: this.translate.get("CARD_PAYMENT_UNSUCCESSFUL").value,
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

    rateTrip(history) {
      console.log('history rate trip', history);
      this.showTripComplete(history.BookingUUID, history.DriverName, history.VehicleNo, -1);
    }

    showTripComplete(bookingUUID, driverName, vehicleNo, cashAndCard) {

      console.log('showTripComplete', bookingUUID, driverName, vehicleNo, cashAndCard);

      this.app.getRootNav().push(TripCompletePage, { bookingUUID: bookingUUID, driverName: driverName, vehicleNo: vehicleNo, cashAndCard: cashAndCard, calledBy:'H'});

      /*let modal = this.modalCtrl.create(TripCompletePage, { bookingUUID: bookingUUID, driverName: driverName, vehicleNo: vehicleNo, cashAndCard: cashAndCard});
      modal.onDidDismiss(data => {
        this.nav.setRoot(HomePage);
      });
      modal.present();*/
    }

}
