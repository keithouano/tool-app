import { Component, ChangeDetectorRef } from '@angular/core';
import { PhotoViewer, ActionSheet, Camera, Transfer, Base64ToGallery, CameraOptions} from 'ionic-native';
import { Events, NavController, Platform, NavParams, AlertController, LoadingController} from 'ionic-angular';
import { Http } from '@angular/http';
import { TranslateService } from '@ngx-translate/core';
import { FilePath } from '@ionic-native/file-path';
import { File } from '@ionic-native/file';

import { LogDetails, ProfileDetails, serviceUrl, maplatlng} from '../../services/root-scope';
import { HomePage } from '../home/home';


@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
    camera: any;
    base64Image: string;
    public profId: any;
    public name: any;
    public contactNo: any;
    public email: any;
    public http: any;
    public baseUrl: any;
    public data: any;
    public translate: any;
    public okBtn: any;
    public customerPhotoUrl : any;

    constructor(public platform : Platform, public navCtrl: NavController, http: Http, public navParams: NavParams, public alertCtrl: AlertController, translate: TranslateService, private file: File, private filePath: FilePath, private cd : ChangeDetectorRef, public loadingController: LoadingController, public events: Events) {

        this.name = ProfileDetails.name;
        this.profId = ProfileDetails.profileId;
        this.contactNo = ProfileDetails.contactNo;
        this.email = ProfileDetails.email;
        this.http = http;
        this.baseUrl = serviceUrl.baseUrl;
        this.data = {};
        this.translate = translate;
        this.okBtn = this.translate.get("OK").value;
        translate.use(LogDetails.language);
        maplatlng.selMenu = 'P'; //Profile page
        this.customerPhotoUrl = this.baseUrl + 'service/renderImage/' + this.profId;
    }

    changePicture() {
        console.log("changePicture called");
        let buttonLabels = [this.translate.get("VIEW_IMAGE").value, this.translate.get("CHANGE_IMAGE").value];
        ActionSheet.show({
            'title': this.translate.get("WHAT_DO_YOU_WANT_WITH_THIS_IMAGE").value,
            'buttonLabels': buttonLabels,
            'addCancelButtonWithLabel': this.translate.get("CANCEL").value,
            'addDestructiveButtonWithLabel': this.translate.get("DELETE").value
        }).then((buttonIndex: number) => {

            if (buttonIndex == 1) {

                //Delelte profile image

                var reqData = JSON.stringify({ profId: this.profId});
                this.http.post(this.baseUrl + 'service/custProfileDelPhoto/', reqData)
                    .subscribe(resp => {
                        console.log(resp);
                        console.log("response : " + resp._body);
                        this.data.response = JSON.parse(resp._body);
                        console.log("Response : " + this.data.response);

                        if (this.data.response.status == 'Success') {
                            
                            this.customerPhotoUrl = '';
                            this.cd.detectChanges();

                            this.events.publish('user-photo:modified', '');

                            let alert = this.alertCtrl.create({
                                title: this.translate.get("SUCCESS").value,
                                subTitle: this.translate.get(this.data.response.messageCode).value,
                                buttons: [this.okBtn]
                            });
                            alert.present();                        
                        } else if (this.data.response.status == 'Fail') {
                            let alert = this.alertCtrl.create({
                                title: this.translate.get("ERROR").value,
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

            } else if (buttonIndex == 2) {

                try {
                    PhotoViewer.show(this.baseUrl + 'service/renderImage/' + this.profId, this.name, { share: false })
                }
                catch (err) {
                    console.log("Error in rendering image : "+err.message);
                }
            } else if(buttonIndex == 3) {
                let alert = this.alertCtrl.create();
                alert.setTitle(this.translate.get("CHOOSE_PHOTO_TYPE").value);

                alert.addInput({
                    type: 'radio',
                    label: this.translate.get("CAMERA").value,
                    value: '1',
                    checked: true
                });

                alert.addInput({
                    type: 'radio',
                    label: this.translate.get("GALLERY").value,
                    value: '2',
                    checked: false
                });

                alert.addButton(this.translate.get("CANCEL").value);
                alert.addButton({
                    text: this.okBtn,
                    handler: data => {
                        console.log("received data : ", data);
                        var options;
                        if (data == '1') {
                            options = {
                                allowEdit: true,
                                correctOrientation: true,
                                saveToPhotoAlbum: true
                            }
                        }
                        else if (data == '2') {
                            options = {
                                sourceType: 2,
                                allowEdit: true,
                                correctOrientation: true,
                                saveToPhotoAlbum: true
                            }
                        }
                        console.log("options : ", options);
                        let correctPath = '';
                        let currentName = '';

                        Camera.getPicture(options).then((imageData) => {

                            if (this.platform.is('android') && data == '2'){

                             this.filePath.resolveNativePath(imageData)
                                    .then(filePath => {

                                    console.log("resolving path");
                                    correctPath = filePath.substr(0, filePath.lastIndexOf('/') + 1);
                                    currentName = imageData.substring(imageData.lastIndexOf('/') + 1, imageData.lastIndexOf('?'));

                                    console.log("resolved path", correctPath, currentName);

                                    this.uploadFileToServer(imageData, correctPath, currentName);

                                });

                            } else {
                                //ios
                                currentName = imageData.substr(imageData.lastIndexOf('/') + 1);
                                correctPath = imageData.substr(0, imageData.lastIndexOf('/') + 1);

                                console.log('upload file in ios');
                                this.uploadFileToServer(imageData, correctPath, currentName);
                            }
                        }, (err) => {
                            // Handle error
                            console.log("Error : ", err);
                        });
                    }
                });
                alert.present();
            }
        });

        this.cd.detectChanges();
    }

    uploadFileToServer(imageData, path, fileName) {

        console.log("imageData : "+imageData);
        let base64Image = 'data:image/jpg;base64,' + imageData;
        console.log("base64Image : "+ base64Image);
        const fileTransfer = new Transfer();
        var fileOptions: any;
        fileOptions = {
            fileKey: 'profPic',
            fileName: this.name + '.jpg',
            params: {
                profId: this.profId,
                profName: this.name
            }
        }

        let loader = this.loadingController.create({
              content:  this.translate.get("IN_PROGRESS").value 
            });  
        loader.present();

        console.log("before file transfer", path, fileName, this.baseUrl + 'service/uploadImage/');
        fileTransfer.upload(path+fileName, this.baseUrl + 'service/uploadImage/', fileOptions)
            .then((data) => {
            
            loader.dismiss();

            // success
            this.customerPhotoUrl = path+fileName;

            this.events.publish('user-photo:modified', path+fileName);    
            
            this.cd.detectChanges();                
            console.log("file upload success : ", data);
            let alert = this.alertCtrl.create({
                title: this.translate.get("SAVE").value,
                subTitle: this.translate.get('UPLOAD_SUCCESS').value,
                buttons: [this.okBtn]
            });
            alert.present();

        }, (err) => {
            // error
            loader.dismiss();
            console.log("file upload failed : ", err);

            let alert = this.alertCtrl.create({
                title: this.translate.get("ERROR").value,
                subTitle: this.translate.get('UPLOAD_FAILURE').value,
                buttons: [this.okBtn]
            });
            alert.present();
        });

    }

    editName() {
        console.log("Name edit clicked");
        let prompt = this.alertCtrl.create({
            title: this.translate.get("NAME_EDIT").value,
            message: this.translate.get("ENTER_YOUR_NAME").value,
            cssClass:'prompt',
            inputs: [
                {
                    name: 'name',
                    placeholder: 'Ex : John Doe',
                    value : this.name
                },
            ],
            buttons: [
                {
                    text: this.translate.get("CANCEL").value,
                    cssClass: 'prompt-button',
                    handler: data => {
                        console.log('Cancel clicked : ', data);
                    }
                },
                {
                    text: this.translate.get("SAVE").value,
                    cssClass: 'prompt-button',
                    handler: data => {
                        console.log('Saved clicked : ', data);
                        var reqData = JSON.stringify({ profId: this.profId, name: data.name });
                        this.http.post(this.baseUrl + 'service/custProfileUpdate/', reqData)
                            .subscribe(resp => {
                                console.log(resp);
                                console.log("response : " + resp._body);
                                this.data.response = JSON.parse(resp._body);
                                console.log("Response : " + this.data.response);

                                if (this.data.response.status == 'Success') {
                                    ProfileDetails.name = data.name;
                                    this.name = data.name;
                                }
                                else if (this.data.response.status == 'Fail') {
                                    let alert = this.alertCtrl.create({
                                        title: this.translate.get("ERROR").value,
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
                                this.navCtrl.setRoot(HomePage);
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    editPassword() {
        console.log("Name edit clicked");
        let prompt = this.alertCtrl.create({
            title: this.translate.get("PASSWORD_EDIT").value,
            message: this.translate.get("ENTER_YOUR_PASSWORD").value,
            cssClass:'prompt',
            inputs: [
                {
                    name: 'pwd',
                    placeholder: this.translate.get("PASSWORD").value,
                    type: 'password',
                    value:''
                },
            ],
            buttons: [
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("CANCEL").value,
                    handler: data => {
                        console.log('Cancel clicked : ', data);
                    }
                },
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("SAVE").value,
                    handler: data => {
                        console.log('Saved clicked : ', data);
                        if (data.pwd.length < 8) {
                            let alert = this.alertCtrl.create({
                                title: this.translate.get("ERROR").value,
                                subTitle: this.translate.get("PASSWORD_LENGTH_ERROR").value,
                                buttons: [this.okBtn]
                            });
                            alert.present();                            
                        } else {
                            var reqData = JSON.stringify({ profId: this.profId, password: data.pwd });
                            this.http.post(this.baseUrl + 'service/custProfileUpdate/', reqData)
                                .subscribe(resp => {
                                    console.log(resp);
                                    console.log("response : " + resp._body);
                                    this.data.response = JSON.parse(resp._body);
                                    console.log("Response : " + this.data.response);

                                    if (this.data.response.status == 'Success') {
                                        let alert = this.alertCtrl.create({
                                            title: this.translate.get("SUCCESS").value,
                                            subTitle: this.translate.get(this.data.response.messageCode).value,
                                            buttons: [this.okBtn]
                                        });
                                        alert.present();
                                    }
                                    else if (this.data.response.status == 'Fail') {
                                        let alert = this.alertCtrl.create({
                                            title: this.translate.get("ERROR").value,
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
                                    this.navCtrl.setRoot(HomePage);
                                });
                        }
                    }
                }
            ]
        });
        prompt.present();
    }

    editEmail() {
        console.log("Name edit clicked");
        let prompt = this.alertCtrl.create({
            title: this.translate.get("EMAIL_EDIT").value,
            message: this.translate.get("ENTER_YOUR_MAIL_ID").value,
            cssClass:'prompt',
            inputs: [
                {
                    name: 'mail',
                    placeholder: 'Ex : JohnDoe@***.com',
                    type: 'mail',
                    value : this.email
                },
            ],
            buttons: [
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("CANCEL").value,
                    handler: data => {
                        console.log('Cancel clicked : ', data);
                    }
                },
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("SAVE").value,
                    handler: data => {
                        console.log('Saved clicked : ', data);
                        var reqData = JSON.stringify({ profId: this.profId, mail: data.mail });
                        this.http.post(this.baseUrl + 'service/custProfileUpdate/', reqData)
                            .subscribe(resp => {
                                console.log(resp);
                                console.log("response : " + resp._body);
                                this.data.response = JSON.parse(resp._body);
                                console.log("Response : " + this.data.response);

                                if (this.data.response.status == 'Success') {
                                    ProfileDetails.email = data.mail;
                                    this.email = data.mail;
                                }
                                else if (this.data.response.status == 'Fail') {
                                    let alert = this.alertCtrl.create({
                                        title: this.translate.get("ERROR").value,
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
                                this.navCtrl.setRoot(HomePage);
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    editContact() {
        console.log("Name edit clicked");
        let prompt = this.alertCtrl.create({
            title: this.translate.get("CONTACT_EDIT").value,
            message: this.translate.get("ENTER_YOUR_CONTACT_NO").value,
            cssClass:'prompt',
            inputs: [
                {
                    name: 'contact',
                    placeholder: 'Ex : +95750****',
                    value : this.contactNo,
                    type: 'tel'
                },
            ],
            buttons: [
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("CANCEL").value,
                    handler: data => {
                        console.log('Cancel clicked : ', data);
                    }
                },
                {
                    cssClass: 'prompt-button',
                    text: this.translate.get("SAVE").value,
                    handler: data => {
                        console.log('Saved clicked : ', data);
                        var reqData = JSON.stringify({ profId: this.profId, contact: data.contact });
                        this.http.post(this.baseUrl + 'service/custProfileUpdate/', reqData)
                            .subscribe(resp => {
                                console.log(resp);
                                console.log("response : " + resp._body);
                                this.data.response = JSON.parse(resp._body);
                                console.log("Response : " + this.data.response);

                                if (this.data.response.status == 'Success') {
                                    ProfileDetails.contactNo = data.contact;
                                    this.contactNo = data.contact;
                                }
                                else if (this.data.response.status == 'Fail') {
                                    let alert = this.alertCtrl.create({
                                        title: this.translate.get("ERROR").value,
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
                                this.navCtrl.setRoot(HomePage);
                            });
                    }
                }
            ]
        });
        prompt.present();
    }

    ionViewDidLoad() {
        console.log('ionViewDidLoad ProfilePage');
    }
    takePicture(){
        let options = {
          destinationType: Camera.DestinationType.DATA_URL,
          targetWidth: 500,
          targetHeight: 500,
          quality: 100,
          allowEdit: true,
          correctOrientation: false,
          saveToPhotoAlbum: true,
          // mediaType: 0
        };
        Camera.getPicture(options)
        .then((imageData)=>{
          this.base64Image = "data:image/jpeg;base64," + imageData;
    
          let cameraImageSelector = document.getElementById('camera-image');
          cameraImageSelector.setAttribute('src', this.base64Image);
    
        })
        .catch(err=>{
          console.log(err);
        })
     }
     image()
     {
        const options: CameraOptions = {
            quality: 50,
            destinationType: this.camera.DestinationType.FILE_URI,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE
          }
          this
            .camera
            .getPicture(options)
            .then((imageData) => {
              this.base64Image = imageData;
              alert(this.base64Image);
            }, (err) => {
              console.log(err);
            });
     }
}
