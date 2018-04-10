import { Component, Renderer, ChangeDetectorRef} from '@angular/core';
import { NavController, NavParams, ViewController,AlertController } from 'ionic-angular';

import {TranslateService} from '@ngx-translate/core';
import { Http } from '@angular/http';

import { serviceUrl, maplatlng} from "../../services/root-scope";

import { HomePage } from "../home/home";
import { TabsPage } from "../tabs/tabs";


/*
  Generated class for the TripComplete page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-trip-complete',
  templateUrl: 'trip-complete.html'
})
export class TripCompletePage {

  	public http: any;
  	public nav: any;
  	public translate:any;

  	public baseUrl: any;
  	public selectedDriverRank: any;
  	public driverRateInfo : any;
  	public comment: any;
    public data: any;
    public okBtn : any;
    public calledBy:any;

	constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public renderer: Renderer, http: Http, translate: TranslateService,  public alertCtrl: AlertController, private cd:ChangeDetectorRef) {

		this.http = http;
		this.nav = navCtrl;
		this.translate = translate;

  	this.baseUrl = serviceUrl;
  	this.data = {};

		this.selectedDriverRank = 0;
    this.driverRateInfo = {
      BookingUUID : '',	
      VehicleNo : '',
      DriverName : ''
    }

    this.driverRateInfo.BookingUUID = navParams.get('bookingUUID');
    this.driverRateInfo.VehicleNo = navParams.get('vehicleNo');
    this.driverRateInfo.DriverName = navParams.get('driverName');
    this.calledBy = navParams.get('calledBy');
    this.okBtn = this.translate.get("OK").value;

    console.log('trip complete const ', this.driverRateInfo);
	}

	rateDriver(r) {
		this.selectedDriverRank = r;
    console.log('driver rank', r, this.selectedDriverRank);
    this.cd.detectChanges();
	}

	submitRate(){

	  //post to backend to save

      var reqData = JSON.stringify({ bookingUUID: this.driverRateInfo.BookingUUID, driverRating: this.selectedDriverRank, comment: this.comment});

      console.log('req data', reqData);

      this.http.post(this.baseUrl.baseUrl + 'service/rateTrip/', reqData)
          .subscribe(resp => {

              this.data.response = JSON.parse(resp._body);

              console.log('rate response', this.data.response);

              if (this.data.response.status == 'Success') {

    			      var data = {
    			        status: 'Success'
    			      };

                if (this.calledBy == 'H')
                  this.nav.setRoot(TabsPage);
                else {
                  maplatlng.homeView = 'D';    
                  this.nav.setRoot(HomePage);
                }
              } else {

                  let alert = this.alertCtrl.create({
                      title: this.translate.get("BOOKING_ERROR").value,
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
    	console.log('ionViewDidLoad TripComplete');
  	}

}
