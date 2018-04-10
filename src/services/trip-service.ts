import {Injectable} from "@angular/core";
import {TRIPS} from "./mock-trips";
import { LogDetails, serviceUrl } from "../services/root-scope";

import { LoadingController, AlertController } from 'ionic-angular';
import {TranslateService} from '@ngx-translate/core';
import { Http } from '@angular/http';

@Injectable()
export class TripService {
  private trips:any;
  public translate: any;
  public http: any;
  public baseUrl: any;
  public data: any;
  public bookingHistoryData: any;

  constructor(http: Http, public alertCtrl: AlertController, public loadingController: LoadingController, translate: TranslateService) {
    this.trips = TRIPS;
    this.translate = translate;
    this.http = http;
    this.baseUrl = serviceUrl;
    this.data = {};
  }

  getAll() {
    return this.trips;
  }

  getItem(id) {
    for (var i = 0; i < this.trips.length; i++) {
      if (this.trips[i].id === parseInt(id)) {
        return this.trips[i];
      }
    }
    return null;
  }

  remove(item) {
    this.trips.splice(this.trips.indexOf(item), 1);
  }

 }