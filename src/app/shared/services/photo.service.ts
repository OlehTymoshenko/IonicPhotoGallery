import { Injectable } from '@angular/core';

import { Plugins, CameraResultType, Capacitor, FilesystemDirectory,
         CameraPhoto, CameraSource } from '@capacitor/core';

import { Platform } from '@ionic/angular';

const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public photos: Photo[] = [];
  
  private PHOTO_STORAGE: string = "photos";
  private platform: Platform;


  constructor(
    platform: Platform
  ) {
    this.platform = platform;
   }
  
  public async loadSaved() {
    const photoArray = await Storage.get({
      key: this.PHOTO_STORAGE
    });
    this.photos = JSON.parse(photoArray.value) || [];

    if(!this.platform.is("hybrid")) {

      for(let photo of this.photos) {
        const readFile = await Filesystem.readFile({
          path: photo.filepath,
          directory: FilesystemDirectory.Data
        });
        
        // only for web platform
        photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
      }
    }

  }

  public async addNewToGallery() {
    // take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);

    // add new photo to photos array
    this.photos.unshift(savedImageFile);

    // cache all photo data for future retrieval
    Storage.set({
      key: this.PHOTO_STORAGE,
      value: JSON.stringify(this.photos)
    })

  }

  public async savePicture(cameraPhoto: CameraPhoto) {
    // convert photo to base64 format
    const photoAsBase64 = await this.readAsBase64(cameraPhoto);

    // write the file to a fs
    const fileName = new Date().getTime() + ".jpeg";
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: photoAsBase64,
      directory: FilesystemDirectory.Data
    });

    if(this.platform.is("hybrid")) {
      return {
        filepath: savedFile.uri,
        webviewPath: Capacitor.convertFileSrc(savedFile.uri)
      };
    }
    else {
      return {
        filepath: fileName,
        webviewPath: cameraPhoto.webPath
      };
    }
  }
  
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    if(this.platform.is("hybrid")) {
      const file = await Filesystem.readFile({
        path: cameraPhoto.path
      });

      return file.data;
    }
    else {
      const response = await fetch(cameraPhoto.webPath);
      const blob = await response.blob();
      
      return await this.convertBlobToBase64(blob) as string;
    }
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    }

    reader.readAsDataURL(blob);
  }) 
}


///////////////////// INTERFACE
export interface Photo {
  filepath: string, 
  webviewPath : string;
}