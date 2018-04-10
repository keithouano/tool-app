import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { Device } from 'ionic-native';

import {LoginPage} from '../login/login';
import { HomePage } from "../home/home";
import { LogDetails, serviceUrl } from '../../services/root-scope';
import { Http } from '@angular/http';
import {TranslateService} from '@ngx-translate/core';

/*
 Generated class for the RegisterPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {
    tabBarElement: any;
    splash = true;
    secondPage = LoginPage;
    public name: any;
    public mobileNo: any;
    public uName: any;
    public password: any;
    public email: any;
    public http: any;
    public baseUrl: any;
    public data: any;
    public pwd: any;
    public selLang:any;
    public translate: any;
    public okBtn: any;
    public deviceOS : any;

    constructor(public nav: NavController, http: Http, public alertCtrl: AlertController, public platform: Platform, translate: TranslateService) {
        this.baseUrl = serviceUrl;
        this.nav = nav;
        this.http = http;
        this.tabBarElement = document.querySelector('.tabber');
        
        this.data = {};
        this.translate = translate;
        translate.setDefaultLang(LogDetails.language);
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);

        platform.ready().then(() => {
  
          if (this.platform.is('cordova')) {
              this.deviceOS = Device.platform;
          } else {
              this.deviceOS = 'web';
          }
          
          this.selLang = 'en';
        });        
    }

    ionViewDidLoad(){
        setTimeout(() => this.splash = false, 4000);
      }

  signup() {
    
      console.log("Name : " + this.name + "Mobile No : " + this.mobileNo + "email : " + this.uName + "\t passWord : " + this.pwd + "UUID :" +LogDetails.UUID);
      console.log("baseUrl : " + this.baseUrl.baseUrl);
      
      var reqData = JSON.stringify({ name: this.name, email: this.uName, password: this.pwd, mobileNo: this.mobileNo, uuid: LogDetails.UUID });
      this.http.post(this.baseUrl.baseUrl + 'service/registerCustomer/', reqData)
          .subscribe(resp => {
              console.log(resp);
              console.log("response : " + resp._body);
              this.data.response = JSON.parse(resp._body);
              console.log("Response : " + this.data.response);

              if (this.data.response.status == 'success') {
                  //alert("status : " + this.data.response.status);
                  this.nav.setRoot(HomePage);
              }
              else if (this.data.response.status == 'fail') {
                  let alert = this.alertCtrl.create({
                      title: this.translate.get("REGISTRATION_ERROR").value,
                      subTitle: this.translate.get(this.data.response.messageCode).value,
                      buttons: [this.okBtn]
                  });
                  alert.present();
                  this.nav.setRoot(RegisterPage);
              }
          }, error => {

              let alert = this.alertCtrl.create({
                  title: this.translate.get("UNKNOWN_ERROR").value,
                  subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                  buttons: [this.okBtn]
              });
              alert.present();
              this.nav.setRoot(LoginPage);
          });
  }

  login() {
    this.nav.setRoot(LoginPage);
  }

  chgLang(lng) {
      
      this.selLang = lng;
      LogDetails.language = this.selLang;
      this.translate.use(LogDetails.language);
  }

}
