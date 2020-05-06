import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import * as _ from 'lodash';
import { Plugins, FilesystemDirectory, FilesystemEncoding, Capacitor } from '@capacitor/core';
import {DomSanitizer} from '@angular/platform-browser';
const { Filesystem } = Plugins;
import { File } from '@ionic-native/file/ngx';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-photo-base64',
  templateUrl: './photo-base64.component.html',
  styleUrls: ['./photo-base64.component.scss'],
})
export class PhotoBase64Component implements OnInit {
  imageError: string;
    isImageSaved: boolean;
    cardImageBase64: string;
    singleImageBase64:string[]=[];
    fileName:string;
    filePath:string;
    clicked:boolean=false;
    fileType:string;
    productName:string;
    productType:string;
    savedInDB:any;
    constructor(
    private _DomSanitizationService: DomSanitizer,
    public storage: Storage, private file:File,
    private dbService: NgxIndexedDBService) { }

  ngOnInit() {
    // if(window.indexedDB){
     
     
// console.log(window.indexedDB)
//       alert(window.indexedDB)
//     }
//     else{
//       alert("not supported")
//     }
  }

  addToIndexDB(){
    console.log(this.productName)
    this.dbService.add('Products', { productName: this.productName, mfgDate: this.productType }).then(
      () => {
          // Do something after the value was added
          alert("added")
      },
      error => {
          console.log(error);
      }
  );
  }

  updateDB(){
    this.dbService.getByIndex('Products', 'productName', this.productName).then(
      person => {
          console.log(person);
         
      
      },
      error => {
          console.log(error);
      }
  );

  this.dbService.update('Products', { id:5, productName: this.productName, mfgDate: this.productType }).then(
    () => {
        // Do something after update
        alert("updated")
    },
    error => {
        console.log(error);
    }
);
  }
  getIndexDB(){
    this.dbService.count('Products').then(
      peopleCount => {
         alert(peopleCount);
      },
      error => {
          console.log(error);
      }
  );
  this.dbService.getAll('Products').then(
    product => {
        console.log(product);
        this.savedInDB=product
    },
    error => {
        console.log(error);
    }
);
  }
  async fileChangeEvent(fileInput: any) {
    this.imageError = null;
    debugger;
    if (fileInput.target.files && fileInput.target.files[0]) {

        const fileName=fileInput.target.files[0].name;
        this.fileType=fileInput.target.files[0].type;
        const reader = new FileReader();
        reader.onload = (e: any) => {

                    const imgBase64Path = e.target.result;
                    this.cardImageBase64 = imgBase64Path;
                    console.log(this.cardImageBase64)
                    this.isImageSaved = true;
            
                
                try {
                  const result =  Filesystem.writeFile({
                    path: 'secrets/'+fileName,
                    data:e.target.result,
                    directory: FilesystemDirectory.Documents,
                    recursive:true
                   
                  }).then(
                    (writeFileResult) => {
                      Filesystem.getUri({
                        directory: FilesystemDirectory.Documents,
                        path:'secrets/'+fileName
                      }).then(
                        result => {
                          debugger;
                          const urlpath = result.uri;
                          let path = Capacitor.convertFileSrc(result.uri);       
                        },
                        err => {
                          console.log(err);
                        }
                      );
                    },err => {
                      console.log(err);
                    }
                  );
                
                  console.log(fileName);
                  this.fileName=fileName;
                  this.filePath='secrets/'+fileName;
                  this.storage.set(fileName,{'path':'secrets/'+fileName,'type':this.fileType})
                  console.log('Wrote file', result);
      
                } catch(e) {
                  console.error('Unable to write file', e);
                }
        };
         
        if(this.fileType.includes('pdf')){
          
          var blobUrl=URL.createObjectURL(fileInput.target.files[0]);
          window.open(blobUrl)
        reader.readAsDataURL(fileInput.target.files[0]);
        }
        else{
          reader.readAsDataURL(fileInput.target.files[0]);
        }
    }
}

removeImage() {
    this.cardImageBase64 = null;
    this.isImageSaved = false;
    this.storage.remove(this.fileName)
}

allFiles:[{name:string,path:string,type:string}]=[{name:"",path:"",type:""}];

getAllFIles(){
  
  this.allFiles=[{name:"",path:"",type:""}];
  debugger;
  this.clicked=true;
  this.storage.forEach((path,name)=>{
   var obj={name:"",path:"",type:""};
   obj.name=name;
   obj.path=path;     
   this.allFiles.push(obj);
    })
}

clearList(){
  this.allFiles=[{name:"",path:"",type:""}];
  this.clicked=false;
}

async showFile(obj){
 console.log(obj.path.type)
  debugger;
  let type=obj.path.type
  console.log(FilesystemDirectory.Data)
//  / this.singleImageBase= FilesystemDirectory.Data+'/secrets/'+obj.name;
  let contents = await Filesystem.readFile({
    path: 'secrets/'+obj.name,
    directory: FilesystemDirectory.Documents,
    
    // encoding: FilesystemEncoding.UTF8
  }).then(res=>{
if(type.includes('image')){
    this.singleImageBase64[obj.name]='data:image/jpeg;base64,'+res.data;

}
else if(type.includes('pdf')){
  this.b64toBlob(res.data,'application/pdf',512);
}
else{
  this.b64toBlob(res.data,type,512);
}
   // 'data:image/jpeg;base64,'+res.data; 
  }); 
}

// async showpdf(obj){

//   let contents = await Filesystem.readFile({
//     path: 'secrets/'+obj.name,
//     directory: FilesystemDirectory.Documents,
//   });
 
//     this.b64toBlob(contents.data,'application/pptx',512);
// }

b64toBlob(b64Data, contentType, sliceSize) {
  var contentType = contentType || '';
  var sliceSize = sliceSize || 512;
  var byteCharacters = atob(b64Data);
  var byteArrays = [];
  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
  }
  var blob= new Blob(byteArrays, {type: contentType});
  var blobUrl=URL.createObjectURL(blob)
  window.open(blobUrl);
}
}
