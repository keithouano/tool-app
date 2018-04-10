import {Injectable} from "@angular/core";
import { LogDetails, CardDetails, serviceUrl } from "../services/root-scope";

import { LoadingController, AlertController } from 'ionic-angular';
import { Http } from '@angular/http';
import {TranslateService} from '@ngx-translate/core';

@Injectable()
export class CustomerService {
  public http: any;
  public baseUrl: any;
  public translate:any;
  public data : any;

  constructor(http: Http, public loadingController: LoadingController, translate: TranslateService) {
    this.http = http;
    this.baseUrl = serviceUrl;
    this.translate = translate;
    this.data = {};
  }


 getCardDetails() : any {

      console.log("getCardDetails for customer ", LogDetails.customerId);

      let loader = this.loadingController.create({
            content: this.translate.get('SERVICE_INPROGRESS').value
          });  
      loader.present();
      
      var reqData = JSON.stringify({ customerId: LogDetails.customerId });
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

              	return CardDetails;
              } else {
              	console.log('card details fail');
              	return null;
              }
          }, error => {

          	console.log("Error getting card details");
          	return null;
          });
    }
 
 }