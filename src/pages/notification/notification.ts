import { Component } from '@angular/core';
import { AlertController, NavController, LoadingController} from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import { Http } from '@angular/http';

import { serviceUrl, LogDetails} from "../../services/root-scope";



/*
  Generated class for the NotificationPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-notification',
  templateUrl: 'notification.html'
})
export class NotificationPage {

  public baseUrl: any;
  public http: any;
  public data: any;
  public translate: any;

  public notifications:any;
  public okBtn: any;


  constructor(public nav: NavController, translate: TranslateService, http: Http, public alertCtrl: AlertController, public loadingController: LoadingController) {

    this.nav = nav;
    this.http = http;
  	this.translate = translate;
	translate.use(LogDetails.language);
	this.okBtn = this.translate.get("OK").value;
	this.data = {};
	this.baseUrl = serviceUrl; 

	this.notifications = [];
	this.notificationList();
  }

  notificationList() {

      console.log("notification list");
       
      var reqData = JSON.stringify({sessionId: LogDetails.sessionId });
      this.http.post(this.baseUrl.baseUrl + 'service/notificationList/', reqData)
          .subscribe(resp => {
              console.log(resp);
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);

              if (this.data.response.status == 'Success') {

                  this.notifications = this.data.response.notifications;
              }
              else if (this.data.response.status == 'Fail') {

              }
          }, error => {
                  let alert = this.alertCtrl.create({
                  title: "Notifications",
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [this.okBtn]
              });
              alert.present();
          });
  }

}
