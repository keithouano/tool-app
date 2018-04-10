import { Component } from '@angular/core';
import { NavController, NavParams, ViewController } from 'ionic-angular';
import { PlaceService } from '../../services/place-service';
import { LogDetails} from '../../services/root-scope';
import { Http } from '@angular/http';
import { serviceUrl } from "../../services/root-scope";
/*
  Generated class for the PlacesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Component({
  selector: 'page-promotions',
  templateUrl: 'promotions.html'
})


export class PromotionsPage {

  // promotions
  public promotions :any;
  public http: any;
  public baseUrl : any;

  constructor(public nav: NavController, public viewCtrl: ViewController, http: Http) {

      this.http = http;
      this.baseUrl = serviceUrl;
      this.loadPromotions();
  }

  dismiss() {
      this.viewCtrl.dismiss();
  }

  chooseItem(item: any) {

      this.viewCtrl.dismiss(item);
  }

  loadPromotions() {
      var reqData = JSON.stringify({customerUUID: LogDetails.UUID});
      this.http.post(this.baseUrl.baseUrl + 'service/promotionList/', reqData)
          .subscribe(resp => {
              console.log(resp);
              var pros = JSON.parse(resp._body);
              console.log("response : " + pros);

              this.promotions = pros;

          }, error => { 
            console.log("No more promotion");             
          });  
  }
}
