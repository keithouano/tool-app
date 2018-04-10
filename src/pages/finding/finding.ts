import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, AlertController } from 'ionic-angular';
import { DriverService } from '../../services/driver-service';
import { DriverPage } from '../driver/driver';
import { HomePage } from '../home/home';
import { Http } from '@angular/http';
import { serviceUrl, LogDetails, DriverDetails, BidDetails, FindingNav, SystemParams } from "../../services/root-scope";
import { TranslateService } from '@ngx-translate/core';
/*
  Generated class for the FindingPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
    selector: 'page-finding',
    templateUrl: 'finding.html'
})
export class FindingPage {
    public drivers: any;
    public driverFound: any = 2;
    public data: any;
    public baseUrl: any;
    public http: any;
    public bidList: any;
    private clrInterval: any;
    public translate: any;
    public okBtn: any;
    bidCount: any = 0;
    public vehicleNos : any;

    constructor(public nav: NavController, http: Http, public driverService: DriverService, public alertCtrl: AlertController, translate: TranslateService, private cd : ChangeDetectorRef) {
        // get list drivers
        this.drivers = driverService.getAll();
        this.baseUrl = serviceUrl;
        this.nav = nav;
        this.http = http;
        this.data = {};
        this.translate = translate;
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);

        this.driverFound = 2;
        this.vehicleNos = "";

        this.submitGetBidListRequest();
    }

    submitGetBidListRequest() {

        this.clrInterval = setInterval(() => {
            this.driverFound = 2;
            this.getBidList();
        }, 5000)

    }

    getBidList() {
//console.log("bid list submit time", new Date());
        var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId: DriverDetails.bookingId });
          this.http.post(this.baseUrl.baseUrl + 'service/getBidStatus/', reqData)
                .subscribe(resp => {

                    //clearInterval(this.clrInterval);
                    console.log("recd response", resp._body);
                    this.data.response = JSON.parse(resp._body);
                    //console.log("response Find : ", new Date(), this.data.response, this.data.response.bidDetails);

                    if (this.data.response.status == 'Success') {
                        this.driverFound = 4;
                        BidDetails.bidList = this.data.response.bidDetails;

                        this.bidList = BidDetails.bidList; 

                        for (let bidvalue of this.bidList) {
                            
                            console.log("Here : ", bidvalue.BidStatus);

                            if (bidvalue.BidStatus == 'Accepted') {
                                console.log(bidvalue.BidStatus);
                                BidDetails.acceptedBooking = bidvalue;
                                DriverDetails.vehicleNo = bidvalue.VehicleNo;
                                DriverDetails.driverPhoto = SystemParams.driverPhotoUrl+bidvalue.LoginId;
                                DriverDetails.driverRank = bidvalue.Rank;
                                console.log("Vehicle no : " + DriverDetails.vehicleNo);

                                LogDetails.bookingId = bidvalue.BookingId;
                                LogDetails.bookingUUID = bidvalue.BookingUUID;
                                LogDetails.vehicleNo = DriverDetails.vehicleNo;
                                LogDetails.driverName = DriverDetails.driverName;
                                LogDetails.drvReached = -1;

                                this.nav.setRoot(DriverPage);
                            } else if (bidvalue.BidStatus == 'Rejected') {

                                let alert = this.alertCtrl.create({
                                    title: 'Vehicle Not Found',
                                    subTitle: 'Sorry! No Vehicle Found. Please try again after sometime.',
                                    buttons: ['OK']
                                });
                                alert.present();
                                this.nav.setRoot(HomePage);
                            } else if (bidvalue.BidStatus == 'Open') {

                            }
                        }

                    } else if (this.data.response.status == 'Fail') {
                        console.log('bid count', this.bidCount);
                        if (this.bidCount == 3) {
                            let alert = this.alertCtrl.create({
                                title: 'Vehicle Not Found',
                                subTitle: 'Sorry! No Vehicle Found. Please try again after sometime.',
                                buttons: ['OK']
                            });
                            alert.present();
                            this.nav.setRoot(HomePage);
                        }
                        this.driverFound = 1;
                        setTimeout(() => {
                            this.bidCount++;
                            this.driverFound = 2;
                        }, 3000);
                        console.log("resubmitting request ", this.bidCount);                        
                    }

                    //this.cd.detectChanges();                          
                }, error => {
                    clearInterval(this.clrInterval);
                    this.nav.setRoot(HomePage);
                });
    }


    cancelBooking() {

        console.log("Booking Save : " + DriverDetails.bookingId);
        var reqData = JSON.stringify({ customerId: LogDetails.customerId, bookingId: DriverDetails.bookingId });
        this.http.post(this.baseUrl.baseUrl + 'service/cancelBooking/', reqData)
            .subscribe(resp => {
                clearInterval(this.clrInterval);
                console.log(resp);
                console.log("response Find : " + resp._body);
                this.data.response = JSON.parse(resp._body);

                if (this.data.response.status == 'Success') {

                    let alert = this.alertCtrl.create({
                        title: this.translate.get("BOOKING_CANCEL").value,
                        subTitle:  this.translate.get(this.data.response.messageCode).value,
                        buttons: [this.okBtn]
                    });
                    alert.present();
                    FindingNav.findingScreen = 'CancelBooking';
                    this.nav.setRoot(HomePage);
                }
                else if (this.data.response.status == 'Fail') {
                console.log('here 4');
                    let alert = this.alertCtrl.create({
                        title: this.translate.get("BOOKING_CANCEL").value,
                        subTitle: this.translate.get(this.data.response.messageCode).value,
                        buttons: [this.okBtn]
                    });
                    alert.present();
                }
            }, error => {
                clearInterval(this.clrInterval);
                let alert = this.alertCtrl.create({
                    title: this.translate.get("BOOKING_CANCEL").value,
                    subTitle: this.translate.get("SOMETHING_WENT_WORNG_TRY_AGAIN_AFTER_SOMETIME").value,
                    buttons: [this.okBtn]
                });
                alert.present();
            });
    }
    
    driverSearch2() {
        setTimeout(() => {
            this.driverFound = 1;
        }, 10000)
    }

    ionViewDidLeave() {
        clearInterval(this.clrInterval);
    }
}
