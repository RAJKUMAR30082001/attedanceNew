import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/admin.service';
import { CheckValidityService } from 'src/app/check-validity.service';



@Component({
  selector: 'app-admin-home',
  templateUrl: './admin-home.component.html',
  styleUrls: ['./admin-home.component.scss']
})
export class AdminHomeComponent implements OnInit{

  auth!:boolean|null
  data!:any
  studentData:boolean=false
  facultyData!:boolean
  timetable:boolean=false
  remove:boolean=false
  holiday:boolean=false
  constructor(private check:CheckValidityService,private adminService:AdminService,private route:Router){}
  ngOnInit(): void {
    this.auth=this.check.getAuth()
    console.log(this.auth)
    // this.studentData=true
  }
  Logout(){
    this.check.removeData()
  }
  //yet to complete
  FacultyAdmit(event:Event){
    event.preventDefault()
    this.studentData=true
    this.timetable=false
    this.remove=false
    this.holiday=false
  }
  Timetable(event:Event){
    event.preventDefault()
    this.studentData=false
    this.remove=false
    this.holiday=false
    this.timetable=true
    
  }
  removeStudent(event:Event){
    event.preventDefault()
    this.studentData=false
    this.timetable=false
    this.holiday=false
    this.remove=true
  }
  holidayUpdate(event:Event){
    event.preventDefault()
    this.studentData=false
    this.timetable=false
    this.remove=false
    this.holiday=true
  }
  

}
