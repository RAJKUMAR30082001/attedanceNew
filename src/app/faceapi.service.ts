import { Injectable } from '@angular/core';
import { StudentCouchService } from './student-couch.service';
declare const faceapi: any;

@Injectable({
  providedIn: 'root'
})
export class FaceapiService {
  public video: HTMLVideoElement | undefined;
  public displaySize: { width: number; height: number } = { width: 0, height: 0 }; // Provide initial values
  public descriptions: any[] = [];
  public flag: boolean = false;
  public results: any;
  public count: number = 0;
  public resize: any;
  public canva: any;
  public timeInterval: any;
 

  constructor(private couch:StudentCouchService) { }
  async loadModels(): Promise<void> {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('./assets/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./assets/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./assets/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('./assets/models')
      ]);
      console.log("Models loaded successfully");
    } catch (error) {
      console.error("Error loading models:", error);
    }
  }

  async FaceDetection(video: HTMLVideoElement, registerNumber: string,divElement:HTMLDivElement): Promise<any> {
    divElement.innerHTML="Don't move util face have been scanned"

    try {
      await this.loadModels()
      console.log("loaded");
    } catch (error) {
      console.log("error of the model", error);
    }
    if (!this.canva) {
      this.canva = await faceapi.createCanvasFromMedia(video);
      const div = document.getElementById("canvacontainer");
      if (div) {
        div.append(this.canva);
      }
    }

    if (video) {
      this.displaySize = { width: video.width, height: video.height };
    }

    faceapi.matchDimensions(this.canva, this.displaySize);

    this.results = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    console.log("results:", this.results);
    const labeledDescriptors = this.results.map((result: { descriptor: any; }) => {
      return new faceapi.LabeledFaceDescriptors(registerNumber, [result.descriptor]);
    });
    console.log(labeledDescriptors);

    this.resize = faceapi.resizeResults(this.results, this.displaySize);

    this.canva.getContext('2d').clearRect(0, 0, this.canva.width, this.canva.height);
    faceapi.draw.drawDetections(this.canva, this.resize);

    if (labeledDescriptors.length > 0) {
      this.clearIntervalTimer();
      divElement.innerHTML="face scanned successfully"
    }
    return labeledDescriptors;
  }

  startInterval(video: HTMLVideoElement, registerNumber: string,divTag:HTMLDivElement): Promise<any> {
    return new Promise((resolve) => {
      this.timeInterval = setInterval(async () => {
        const labeledDescriptors = await this.FaceDetection(video, registerNumber,divTag);
        resolve(labeledDescriptors);
      }, 1000);
    });
  }

  clearIntervalTimer() {
    clearInterval(this.timeInterval);
  }

  async confirmImage(video: HTMLVideoElement, registerNumber: string, divTag: HTMLDivElement): Promise<any> {
    try {
      await this.loadModels();
  
      return new Promise((resolve) => {
        let clearId: any;
  
        clearId = setInterval(async () => {
          let resultsDes = await this.detectFace(video, divTag);
          if (resultsDes.length > 0) {
            console.log(resultsDes);
            this.clearIntervalId(clearId);
            resolve(resultsDes);
          }
        }, 1000);
      });
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  
  async detectFace(video: HTMLVideoElement, divTag: HTMLDivElement): Promise<any> {
    divTag.innerHTML = "Don't move face until face scanned";
    let resultsVal = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
    return resultsVal.map((res: any) => res.descriptor);
    
  }
  
  clearIntervalId(id: any) {
    clearInterval(id);
  }
  faceMatchDescriptor(regNo: string, descriptor: any,error:HTMLDivElement): Promise<string> {
    return new Promise<any>((resolve, reject) => {
      this.couch.getFace(regNo).subscribe(async data => {
        if (data.rows.length>0) {
          let descriptorStored = data.rows[0].value.faceDescriptor;
          let result=await this.faceMatch(descriptorStored,descriptor)
          resolve({result:result.toString(),data:data.rows[0].value});
        }
        else{
            error.innerHTML="RegisterNumber is not exist"
        }
      }, error => {
        reject(error);
      });
    });
  }
  adminFaceMatch(descriptorStored:any, descriptors:any):Promise<string>{
    return new Promise<string>(async(resolve,reject)=>{
        let result=await this.faceMatch(descriptorStored,descriptors)
        console.log(result)
          resolve(result.toString());
    })
  }
  faceMatch(descriptorStored:any,descriptor:any){
    return new Promise<string>((resolve,reject)=>{
      console.log(descriptorStored)
      let floatArray = new Float32Array(descriptorStored[0].descriptors[0]);
          console.log(floatArray);
          const labeledDes = new faceapi.LabeledFaceDescriptors(descriptorStored[0].label, [floatArray]);
          console.log(labeledDes);
          const faceMatcher = new faceapi.FaceMatcher([labeledDes]);
          console.log(descriptor);
          let result = faceMatcher.findBestMatch(descriptor[0]);
          console.log(result,"final result")
          resolve(result.toString());
    })
  }

  
}
