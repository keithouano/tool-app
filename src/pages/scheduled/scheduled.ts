import { Component, ChangeDetectorRef} from '@angular/core';
import { LoadingController , NavController, AlertController } from 'ionic-angular';
import { TripService } from '../../services/trip-service';
import { Http } from '@angular/http';
import { serviceUrl, LogDetails, maplatlng,BookingHistory } from "../../services/root-scope";
import { DriverService } from "../../services/driver-service";
import { HomePage } from "../home/home";
import {TranslateService} from '@ngx-translate/core';


/*
  Generated class for the HistoryPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-scheduled',
  templateUrl: 'scheduled.html'
})
export class ScheduledPage {
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

  constructor(public nav: NavController, public driverService: DriverService, public tripService: TripService, http: Http, public alertCtrl: AlertController, public loadingController: LoadingController, translate: TranslateService, public cd : ChangeDetectorRef) {

      this.baseUrl = serviceUrl;
      this.nav = nav;
      this.http = http;
      this.records = tripService.getAll();
      this.data = {};
      this.translate = translate;
      this.okBtn = this.translate.get("OK").value;
      translate.use(LogDetails.language);
      this.currencyCode = LogDetails.currencyCode;
      this.hasCard = LogDetails.hasCard;

      this.bookingHistory(this.currencyCode, this.hasCard);
  }

  bookingHistory(currencyCode, hasCard) {

      console.log("has card ", hasCard);

      var reqData = JSON.stringify({ customerId: LogDetails.customerId });
      this.http.post(this.baseUrl.baseUrl + 'service/scheduledBooking/', reqData)
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
              else if (this.data.response.status == 'Fail') {

                  /*let alert = this.alertCtrl.create({
                      title: this.translate.get("BOOKING_HISTORY_NOT_FOUND").value,
                      subTitle: this.translate.get(this.data.response.messageCode).value,
                      buttons: [this.okBtn]
                  });
                  alert.present();*/
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
      console.log("Pickup Address : " + bookingData.DropAddress);
      if (rev == 1) {
        maplatlng.pickup = bookingData.DropAddress;
        maplatlng.dropoff = bookingData.PickupAddress;
        maplatlng.dataflag = 1;
      } else {
        maplatlng.pickup = bookingData.PickupAddress;
        maplatlng.dropoff = bookingData.DropAddress;
        maplatlng.dataflag = 1;
      }
    } else {
        maplatlng.dropoff = '';
        maplatlng.dataflag = 0;
    }

    this.cd.detectChanges();

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

        var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId: bookingId });
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

  payTrip(bookingId) {

      console.log("pay trip", bookingId);

      let loader = this.loadingController.create({
            content: this.translate.get('CARD_PAYMENT_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId : bookingId });
      console.log("req data", reqData);
      this.http.post(this.baseUrl.baseUrl + 'service/makePayment/', reqData)
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
 
}
