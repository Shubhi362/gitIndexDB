import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
import { MultiFileUploadComponent } from '../app/components/multi-file-upload/multi-file-upload.component';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import {File} from '@ionic-native/file/ngx';

import { IonicStorageModule } from '@ionic/storage';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { NgxIndexedDBModule, DBConfig } from 'ngx-indexed-db';
const dbConfig: DBConfig  = {
  name: 'MyDb4',
  version: 1,
  objectStoresMeta: [{
    store: 'Products',
    storeConfig: {key:'productName', keyPath: 'productName', autoIncrement: false },
    storeSchema: [
      { name: 'productName', keypath: 'productName', options: { unique: true } },
      { name: 'mfgDate', keypath: 'mfgDate', options: { unique: false } }
    ]
  }]
};
@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule,

    IonicStorageModule.forRoot({
      name: '__mydb',
      driverOrder: [ 'sqlite','indexeddb', 'websql']
     },
     
     ),
     NgxIndexedDBModule.forRoot(dbConfig)
  ],
  providers: [
    StatusBar,
    SplashScreen,
    FileUploadModule,
    File,
    
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
