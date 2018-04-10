import { Component, NgZone, ViewChild } from '@angular/core';
import { NavController, ViewController } from 'ionic-angular';
//import { PlaceService } from '../../services/place-service';
import { LogDetails, currentLatLng} from '../../services/root-scope';
import { Keyboard } from 'ionic-native';

/*
  Generated class for the PlacesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

declare var google: any;

@Component({
  selector: 'page-places',
  templateUrl: 'places.html'
})


export class PlacesPage {
     @ViewChild('input') myInput ;

    autocompleteItems;
    autocomplete;
    service = new google.maps.places.AutocompleteService();


  public places: any;
  public getLocality: any;
  public recentLocations: any;
  public currentLocAddr : any;

  constructor(public nav: NavController, public viewCtrl: ViewController, private zone: NgZone) {
      this.autocompleteItems = [];
      this.autocomplete = {
          query: ''
      };
      
      console.log("rec locs ", LogDetails.recentLoc, currentLatLng.formattedAddress);

      if (LogDetails.recentLoc)
        this.recentLocations = LogDetails.recentLoc;
      else 
        this.recentLocations = [];

console.log('recent loc', this.recentLocations);        
      if (LogDetails.recentLoc 
        && currentLatLng.formattedAddress
        && this.recentLocations.indexOf(currentLatLng.formattedAddress) == -1)
        this.currentLocAddr = currentLatLng.formattedAddress;
  }

  dismiss() {
      this.viewCtrl.dismiss();
  }

  chooseItem(item: any) {

      this.viewCtrl.dismiss(item);

      
  }

  choosePlace() {
    this.nav.pop();
  }

  updateSearch() {
      //alert("update search called");
      if (this.autocomplete.query == '') {
          this.autocompleteItems = [];
          //return;
      }
      let me = this;
      this.service.getPlacePredictions({
          input: this.autocomplete.query, componentRestrictions: { country: LogDetails.country }
      }, function (predictions, status) {
          me.autocompleteItems = [];
          me.zone.run(function () {

            if (predictions) {
              predictions.forEach(function (prediction) {
                  console.log("Prediction : ", prediction.description);
                  me.autocompleteItems.push(prediction.description);
              });
            }
          });
      });
  }


  ionViewDidEnter() {
    setTimeout(() => {
      Keyboard.show() // working only in android version
      this.myInput.setFocus();
    }, 150);
  }

  goBack() {
    this.nav.pop();  
  }

}
