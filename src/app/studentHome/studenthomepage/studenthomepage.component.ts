import { Component, OnInit } from '@angular/core';
import { CheckValidityService } from 'src/app/check-validity.service';

@Component({
  selector: 'app-studenthomepage',
  templateUrl: './studenthomepage.component.html',
  styleUrls: ['./studenthomepage.component.scss']
})
export class StudenthomepageComponent implements OnInit{
  StudentDetail:any
  userAuth!:boolean|null
  userDetails!:any
  keys!:string[]
  notificationFlag:boolean=false
  leaveLetterFlag:boolean=false
  attendanceFlag:boolean=false
  redMark:boolean=false
  holiday:boolean=false

constructor(private service:CheckValidityService){}
    ngOnInit(): void {
      this.userAuth=this.service.getAuth()
      if(this.userAuth===true){
        this.userDetails=this.service.getData()
        console.log(this.userDetails)
        // let notification$=this.userDetails.attendanceRecord
        // console.log(notification$)
        // notification$.forEach((element: any) => {
        //   let key=Object.keys(element)[0]
         
        //   if(element[key]<70){
        //       this.redMark=true
              
        //   }
          
        // });
      }
    }
    Logout(){
      this.service.removeData()
      
    }
    notification(event:Event){
      event.preventDefault()
      this.notificationFlag=true
      this.attendanceFlag=false
      this.leaveLetterFlag=false
      this.redMark=false
      this.holiday=false
    }
    leaveLetter(event:Event){
      event.preventDefault()
      this.holiday=false
      this.notificationFlag=false
      this.attendanceFlag=false
      this.leaveLetterFlag=true
    }
    attendance(event:Event){
      event.preventDefault()
      this.holiday=false
      this.notificationFlag=false
      this.attendanceFlag=true
      this.leaveLetterFlag=false
    }
    holidayNotification(event:Event){
      event.preventDefault()
     
      this.notificationFlag=false
      this.attendanceFlag=false
      this.leaveLetterFlag=false
      this.holiday=true
    }
}
