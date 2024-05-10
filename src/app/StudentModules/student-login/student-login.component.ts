import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/admin.service';
import { FaceapiService } from 'src/app/faceapi.service';
import { StudentCouchService } from 'src/app/student-couch.service';
import { loginDetails } from 'src/app/student-data';

@Component({
  selector: 'app-student-login',
  templateUrl: './student-login.component.html',
  styleUrls: ['./student-login.component.scss']
})
export class StudentLoginComponent implements OnInit,OnDestroy {
  loginForm!:FormGroup
  errorMessage!:HTMLDivElement
  year:number=new Date().getFullYear()
  isLog!:boolean
  video!:HTMLVideoElement
  flag!:any
  inputFlag:Boolean = false;
  styleFlag:boolean=false
  constructor(private fb:FormBuilder,private render:Renderer2,private service:StudentCouchService,private route:Router,private admin:AdminService,private faceApi:FaceapiService){}

  ngOnInit(): void {
    this.video=this.render.selectRootElement('#video') as HTMLVideoElement
   
    this.errorMessage=this.render.selectRootElement(".errorMessage")
    this.loginForm=this.fb.group({
      registerNumber:['',[Validators.required]],
      password:["",[Validators.required]]
    })
    this.startVideo()
    
  }
  
 
  async onSubmit(){
    const studentDetails:loginDetails={
      registerNumber:this.loginForm.value.registerNumber,
      password:this.loginForm.value.password
    }
    if(studentDetails.registerNumber.length===5){
    this.isLog=await(this.admin.checkAdmin(studentDetails.password,studentDetails.registerNumber,this.flag))
    if(this.isLog){
      this.admin.setValue(this.isLog)
      this.route.navigate(['/adminHome']);
    }}
    else{
    console.log(this.flag)
    if(this.flag.length>0){
      console.log("coming")
      let finalResult:any=await this.faceApi.faceMatchDescriptor(this.loginForm.value.registerNumber,this.flag,this.errorMessage)
      console.log(finalResult.result,this.loginForm.value.registerNumber,finalResult.data)
      if(finalResult.result.split(' ')[0]===this.loginForm.value.registerNumber){
      this.service.login(studentDetails,this.errorMessage,this.video,finalResult.data)

    }
    else{
      this.styleFlag=false
      this.errorMessage.innerHTML="Face did not matched"
    }
  }
  else{
    console.log("odu motha")
  }
  }
  }

  async startVideo(): Promise<void> {
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      
      if (this.video) {
        this.video.srcObject = stream;
  
        await new Promise<any>((resolve) => {
          this.video.addEventListener('play', async () => {
            this.errorMessage.innerHTML="wait until scan...."
            try {
              const results = await this.faceApi.confirmImage(
                this.video,
                this.loginForm.value.registerNumber,
                this.errorMessage
              );
              this.styleFlag=true
              this.errorMessage.innerHTML="face scanned successfully"
             
              console.log(results)
              this.flag=results
              this.inputFlag=true
                
              resolve(results);
            } catch (error) {
              console.log(error);
              resolve(false);
            }
          });
        });
      }
    } catch (error) {
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

