import { NgModule } from '@angular/core';
import { IonicApp, IonicModule } from 'ionic-angular';
import { MyApp } from './app.component';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Push, PushObject, PushOptions} from '@ionic-native/push';
import { CardIO } from '@ionic-native/card-io';
import { File } from '@ionic-native/file';
import { FilePath } from '@ionic-native/file-path';
import { StatusBar } from '@ionic-native/status-bar';

// import services
import {DriverService} from '../services/driver-service';
import {NotificationService} from '../services/notification-service';
import {PlaceService} from '../services/place-service';
import {TripService} from '../services/trip-service';
import {CustomerService} from '../services/customer-service';
// end import services

// import pages
import { DriverPage} from '../pages/driver/driver';
import { FindingPage} from '../pages/finding/finding';
import { HistoryPage} from '../pages/history/history';
import { ScheduledPage } from '../pages/scheduled/scheduled';
import { HomePage} from '../pages/home/home';
import { LoginPage} from '../pages/login/login';
import { ModalRatingPage} from '../pages/modal-rating/modal-rating';
import { NotificationPage} from '../pages/notification/notification';
import { PaymentMethodPage} from '../pages/payment-method/payment-method';
import { PlacesPage} from '../pages/places/places';
import { ProfilePage} from '../pages/profile/profile';
import { RegisterPage} from '../pages/register/register';
import { SupportPage} from '../pages/support/support';
import { TrackingPage } from '../pages/tracking/tracking';
import { PaymentDetailsPage } from '../pages/payment-details/payment-details';
import { PromotionsPage } from '../pages/promotions/promotions';
import { TabsPage } from '../pages/tabs/tabs';
import { TripCompletePage } from '../pages/trip-complete/trip-complete';
// end import pages

import {HttpModule, Http} from '@angular/http';
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import { DatePicker } from 'ionic2-date-picker/ionic2-date-picker';



/*  'core': {
    'app_id': 'c0fe6e98'
  },
  'push': {
    'sender_id': '120802024565',
    'pluginConfig': {
      'ios': {
        'badge': true,
        'sound': true
      },
      'android': {
        'iconColor': '#ff0000'
      }
    }
  }
};*/

export function HttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    MyApp,
    DriverPage,
    FindingPage,
    HistoryPage,
    ScheduledPage,
    HomePage,
    LoginPage,
    ModalRatingPage,
    NotificationPage,
    PaymentMethodPage,
    PlacesPage,
    ProfilePage,
    RegisterPage,
    SupportPage,
    TrackingPage,
    PaymentDetailsPage,
    PromotionsPage,
    TabsPage,
    DatePicker,
    TripCompletePage
],
  imports: [
   IonicModule.forRoot(MyApp),
   TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    })     
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    DriverPage,
    FindingPage,
    HistoryPage,
    ScheduledPage,
    HomePage,
    LoginPage,
    ModalRatingPage,
    NotificationPage,
    PaymentMethodPage,
    PlacesPage,
    ProfilePage,
    RegisterPage,
    SupportPage,
    TrackingPage,
    PaymentDetailsPage,
    PromotionsPage,
    TabsPage,
    DatePicker,
    TripCompletePage

],
  providers: [
    DriverService,
    NotificationService,
    PlaceService,
    TripService,
    CustomerService,
    Push,
    SplashScreen,
    CardIO,
    File,
    FilePath,
    StatusBar
]
})
export class AppModule {}
