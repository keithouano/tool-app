import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, ViewController, ModalController, LoadingController } from 'ionic-angular';
import { PaymentDetailsPage } from '../payment-details/payment-details';
import { LogDetails, CardDetails, DriverDetails, paymentDetails, maplatlng, serviceUrl, HomeNav,currentLatLng } from '../../services/root-scope';
import { Http } from '@angular/http';
import { HomePage } from '../home/home';
import { FindingPage } from "../finding/finding";
import {TranslateService} from '@ngx-translate/core';

/*
 Generated class for the PaymentMethodPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
    selector: 'page-payment-method',
    templateUrl: 'payment-method.html'
})
export class PaymentMethodPage {

    public isDisabled: boolean = true;
    public cardName: any;
    public cardNo: any;
    public expiryDate: any;
    public cvv: any;
    public cardType : any;
    public baseUrl: any;
    public http: any;
    public data: any;
    public paymentMethod: any;
    public translate : any;
    public pickupAddress : any;
    public dropAddress : any;
    public note : any;
    public okBtn: any;

    constructor(public nav: NavController, public navParams:NavParams, http: Http, public alertCtrl: AlertController, private modalCtrl: ModalController, public viewCtrl: ViewController, public loadingController : LoadingController, translate : TranslateService) {
        this.baseUrl = serviceUrl;
        this.nav = nav;
        this.http = http;
        this.data = {};
        this.translate = translate;
        console.log("dest loc ", navParams.get('pickupAddress'), navParams.get('dropAddress'));
        this.pickupAddress = navParams.get('pickupAddress');
        this.dropAddress = navParams.get('dropAddress');
        this.note = navParams.get('note');
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);
        this.getCardDetails();
    }

    // apply change method
    changeMethod(method) {
        // go back

        if (method == "Card") {

            paymentDetails.paymentType = "Card";

            this.isDisabled = false;
        }
        else if (method == "Cash") {
            paymentDetails.paymentType = method;
            this.isDisabled = true;
            this.paymentMethod = method;
            paymentDetails.paymentType = "Cash";
            HomeNav.paymentScreen = "PaymentMethod";
            
            this.nav.setRoot(HomePage);
        }
    }

    closeWindow() {
        this.viewCtrl.dismiss();
    }

    getCardDetails() {

      console.log("getCardDetails for customer ", LogDetails.customerId);

      let loader = this.loadingController.create({
            content: this.translate.get('SERVICE_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ UUID: LogDetails.UUID });
      console.log("req data", reqData);
      this.http.post(this.baseUrl.baseUrl + 'service/getCardDetails/', reqData)
          .subscribe(resp => {
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);              

              loader.dismiss();
              if (this.data.response.status == 'Success') {
                var obj = this.data.response;
                console.log('found card details');
                console.log('card obj ', obj);
                CardDetails.customerName = obj.customerName;
                CardDetails.cardNumber = obj.cardNumber;
                CardDetails.expiryDate = obj.expiryDate;
                CardDetails.cardType = obj.cardType;
                CardDetails.ccv = obj.ccv;

                this.cardName = obj.customerName;
                this.cardNo = obj.cardNumber; 
                this.expiryDate = obj.expiryDate;
                this.cvv = obj.ccv;
                this.cardType = obj.cardType;
                
              } else {
                console.log('card details fail');
              }
          }, error => {

            console.log("Error getting card details");
          });
    }

    paymentSubmit() {

        var reqData = JSON.stringify({ cardName: this.cardName, cardNo: this.cardNo, expiryDate: this.expiryDate, cvv: this.cvv, customerId: LogDetails.customerId, cardType: this.cardType });
        this.http.post(this.baseUrl.baseUrl + 'service/paymentDetails/', reqData)
            .subscribe(resp => {
                console.log(resp);
                console.log("response : " + resp._body);
                this.data.response = JSON.parse(resp._body);

                if (this.data.response.status) {

                    console.log("card details saved");
                    console.log("submittig booking");
                    this.book();
                    console.log("booking done");

                    this.nav.setRoot(HomePage);
                }
                else if (!this.data.response.success) {
                    console.log("save card details fail ") ;                
                    let alert = this.alertCtrl.create({
                        title: this.translate.get("CARD_SAVE_ERROR").value,
                        subTitle: this.translate.get(this.data.response.messageCode).value,
                        buttons: [this.okBtn]
                    });
                    alert.present();
                }
            }, error => {
                console.log("save card details error ") ;
            });
    }

    book() {

      var radius = 5;

        var reqData = JSON.stringify({ pickup: this.pickupAddress, dropoff: this.dropAddress, drivernote: this.note, customerId: LogDetails.customerId, latitude: currentLatLng.latitude, longitude: currentLatLng.longitude, radius: radius });
        
        console.log("book request ", reqData);

        this.http.post(this.baseUrl.baseUrl + 'service/bookingSave/', reqData)
          .subscribe(resp => {
              console.log(resp);
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              if (this.data.response.status == 'Success') {
                  // go to finding page
                  DriverDetails.bookingId = this.data.response.bookingId;
                  console.log("Booking Details :" + DriverDetails.bookingId);
                  if (DriverDetails.bookingId) {
                      console.log("Booking No : " + DriverDetails.bookingId);
                      this.nav.push(FindingPage);
                  }
                  // go to finding page
              }
              else if (!this.data.response.success) {

                  let alert = this.alertCtrl.create({
                      title: 'Booking Error',
                      subTitle: this.data.response.message,
                      buttons: ['OK']
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
}
