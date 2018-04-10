import { Component, ChangeDetectorRef} from '@angular/core';
import { NavController, AlertController, LoadingController, NavParams } from 'ionic-angular';
import { Http } from '@angular/http';
import { LogDetails, CardDetails, serviceUrl, maplatlng} from '../../services/root-scope'
import { HomePage } from '../home/home';
import { CustomerService } from '../../services/customer-service';
import {TranslateService} from '@ngx-translate/core';
import { CardIO } from '@ionic-native/card-io';

/*
  Generated class for the PaymentDetails page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-payment-details',
  templateUrl: 'payment-details.html'
})
export class PaymentDetailsPage {

    public data: any;
    public baseUrl: any;
    public http: any;
    private name: any;
    private cardNo: any;
    public cardName: any;
    private expiryDate: any;
    private cvv: any;
    private cardType : any;
    public translate: any;
    public okBtn: any;
    public minYear : any;
    public maxDate : any;

    constructor(private cardIO: CardIO, public nav: NavController, public loadingController: LoadingController, public navParams: NavParams, http: Http, public alertCtrl: AlertController,public customerService: CustomerService, translate : TranslateService, private cd : ChangeDetectorRef) {
        LogDetails.customerId
        this.baseUrl = serviceUrl;
        this.nav = nav;
        this.http = http;
        this.data = {};
        this.translate = translate;
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);
        this.minYear = (new Date()).getFullYear();
        this.maxDate = (this.minYear + 10) + "-12-31";

        this.getCardDetails();
    }


    scan() {
    this.cardIO.canScan().then((res: boolean) => {
      if (res) {
        let options = {
        requireExpiry: true,
        requireCardholderName: true,
        requireCCV: true,        
        scanExpiry: true,
        scanCardHolderName: true,        
        keepApplicationTheme:true,
        guideColor: '#18cdad',
        hideCardIOLogo: true,
        useCardIOLogo:false
        };
        this.cardIO.scan(options).then((data) => {
          this.setCardData(data);
          //this.presentToast('scan' + JSON.stringify(options));
        }, err => {
          console.log(err);
          // An error occurred
        });
      }

    });
  }



  setCardData(data: any) {
    console.log("incoming card details", data);
    this.cardNo = data.cardNumber;
    this.cardType = data.cardType;
    this.cd.detectChanges();
    console.log("setting card details", this.cardNo, this.cardType);

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
                    let alert = this.alertCtrl.create({
                        title: this.translate.get("SAVE_CARD_DETAILS").value,
                        subTitle: this.translate.get("CARD_DETAILS_SAVED_SUCCESSFULLY").value,
                        buttons: [{
                        text: this.okBtn,
                        handler: () => {
                            maplatlng.homeView = 'D';                        
                            this.nav.setRoot(HomePage);
                          }
                        }]
                    });
                    alert.present();
                }
                else if (!this.data.response.success) {
                    let alert = this.alertCtrl.create({
                        title: this.translate.get("CARD_INSERT_ERROR").value,
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


  ionViewDidLoad() {
    console.log('ionViewDidLoad PaymentDetailsPage');
  }

}
