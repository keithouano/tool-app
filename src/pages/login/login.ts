import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, Platform, LoadingController, MenuController } from 'ionic-angular';
import {RegisterPage} from '../register/register';
import { HomePage } from '../home/home'
import { LogDetails, serviceUrl, LiveVehicleDetails } from '../../services/root-scope';
import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { Keyboard } from 'ionic-native';
import { FormBuilder, Validators } from '@angular/forms';
/*
  Generated class for the LoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
    @ViewChild('input') myInput ;
    loginForm: any;

    public uName: any;
    public pwd: any;
    public uuid: any;
    public data: any;
    public baseUrl: any;
    public http: any;
    public translate: any;
    public okBtn: any;
    
    constructor(public nav: NavController, http: Http, public alertCtrl: AlertController, translate: TranslateService, public platform: Platform, public formBuilder: FormBuilder, public loadingController: LoadingController, private menu : MenuController) {
        this.baseUrl = serviceUrl;
        this.nav = nav;
        this.http = http;
        this.data = {};
        this.translate = translate;
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);
        console.log("inside init");
        
        this.loginForm = this.formBuilder.group({
             "uName": ["", Validators.required],
             "pwd": ["",Validators.required]
        });

        platform.ready().then(() => {
            Keyboard.disableScroll(true);
        });
    }

  signup() {
    this.nav.setRoot(RegisterPage);
  }

  login() {
      console.log(this.baseUrl);
      var reqData = JSON.stringify({ uname: this.uName, password: this.pwd, uuid: LogDetails.UUID });

      let loader = this.loadingController.create({
            content:  this.translate.get("LOGIN_IN_PROGRESS").value 
          });  
      loader.present();

      this.http.post(this.baseUrl.baseUrl + 'service/login/', reqData)
          .subscribe(resp => {

        loader.dismiss();

        console.log("response : " + resp._body);
        this.data.response = JSON.parse(resp._body);
        //alert("Response : " + this.data.response);
        
        if (this.data.response.status == 'success') {
            LogDetails.customerId = this.data.response.customerId;

            this.nav.setRoot(HomePage);
        } else if (this.data.response.status == 'fail') {
            console.log("Unable to Login! : " + this.data.response.message);
            let alert = this.alertCtrl.create({
                title: this.translate.get("LOGIN_ERROR").value,
                subTitle: this.translate.get(this.data.response.messageCode).value,
                buttons: [this.okBtn]
            });
            alert.present();
            this.pwd = '';

            //this.nav.setRoot(LoginPage);
        }
    }, error => {
        loader.dismiss();
        let alert = this.alertCtrl.create({
            title: this.translate.get("UNKNOWN_ERROR").value,
            subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
            buttons: [this.okBtn]
        });
        alert.present();
        this.nav.setRoot(LoginPage);
    });
  }

  ionViewDidEnter() {
    
    this.menu.swipeEnable(false);

    setTimeout(() => {
      Keyboard.show() // working only in android version
      this.myInput.setFocus();
    }, 150);
  }


  ionViewWillLeave() {
    this.menu.swipeEnable(true);
  }
}
