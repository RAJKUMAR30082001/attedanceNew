import { Component, OnDestroy, OnInit } from '@angular/core';
import { CheckValidityService } from 'src/app/check-validity.service';
import { FacultyService } from 'src/app/faculty.service';

@Component({
  selector: 'app-holiday-update',
  templateUrl: './holiday-update.component.html',
  styleUrls: ['./holiday-update.component.scss']
})
export class HolidayUpdateComponent implements OnInit, OnDestroy{
  public notification:string[]=[]
  constructor(private check:CheckValidityService,private faculty:FacultyService){}
  ngOnInit(): void {
    this.notification=this.check.getData().unSeen
  }
  ngOnDestroy(): void {
    this.faculty.getFullDocument().subscribe(res=>{
      let data=res['mca']
      let key=Object.keys(data)
      key.forEach((item:any)=>{
        data[item].seen=data[item].unSeen.map((i:any)=>{
            return i
        })
      })
      this.faculty.updateDocument(res)
    })
  }
}
