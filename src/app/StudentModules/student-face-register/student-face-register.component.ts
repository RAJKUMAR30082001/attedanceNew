import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaceapiService } from 'src/app/faceapi.service';
import { StudentCouchService } from 'src/app/student-couch.service';

@Component({
  selector: 'app-student-face-register',
  templateUrl: './student-face-register.component.html',
  styleUrls: ['./student-face-register.component.scss']
})
export class StudentFaceRegisterComponent implements OnInit, OnDestroy {
  video!:HTMLVideoElement
  errorDiv!:HTMLDivElement
  flag:string='notScanned'
  RegisterNumber!:string
  currentYear= new Date().getFullYear();
  index:number=0

  constructor(private render:Renderer2,private faceApi:FaceapiService,private route:ActivatedRoute,private Couch:StudentCouchService){}

  ngOnInit(): void {
    this.RegisterNumber=this.route.snapshot.params['registerNumber']
    this.video=this.render.selectRootElement('#myVideo') as HTMLVideoElement
    this.errorDiv=this.render.selectRootElement(".errorMessage")
    this.startVideo()
  }
  async startVideo(){
    this.errorDiv.innerHTML=""
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.video) {
        this.video.srcObject = stream;}

      if (this.video) {
        this.video.srcObject = stream;
        this.video.addEventListener('play', async()=>{
          try{
            const results:[]=await this.faceApi.startInterval(this.video,this.RegisterNumber,this.errorDiv)
            console.log("results",results);
            if(results.length>0){
              
              this.Couch.faceUpdate(results,this.RegisterNumber)
              console.log(this.flag)
              this.flag='Scanned'
            }
         
        }catch(error){
          console.log(error)
        }
        })
      }
    } 
    catch (error) {
      console.error('Error accessing webcam:', error);
    }
  }

  ngOnDestroy(): void {
    console.log("destroyed")
    if (this.video) {
      const stream = this.video.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      }
      this.video.srcObject = null; 
    }
  }
  
}

