import { Component } from '@angular/core';
import { PhotoService } from '../shared/services/photo.service';
import { Plugins,
         PushNotification,
         PushNotificationToken,
         PushNotificationActionPerformed,
         Capacitor
        } from '@capacitor/core'; 
import { AlertController } from '@ionic/angular';
//import { FirebaseMessaging } from '@ionic-native/firebase-messaging/ngx';


const { PushNotifications } = Plugins;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  constructor(
    public photoService : PhotoService,
  //  private messagingFB : FirebaseMessaging
  ) {}

  async ngOnInit() {
    await this.photoService.loadSaved();
    await this.setUpPushNotifications();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }
  
  private async setUpPushNotifications() {
    //this.messagingFB.subscribe("all");
   // alert(await this.messagingFB.getToken() );
  }
}
