import { Component, OnDestroy, OnInit } from '@angular/core';
import { FacultyService } from 'src/app/faculty.service';
import { facultyLogin } from 'src/app/student-data';

@Component({
  selector: 'app-faculty-admit',
  templateUrl: './faculty-admit.component.html',
  styleUrls: ['./faculty-admit.component.scss']
})
export class FacultyAdmitComponent implements OnInit{
  facultyDataToPermit!:any
  department:any[]=[]
  constructor(private  Service : FacultyService) {}
  ngOnInit(): void {
    
    this.Service.getFacultyData().subscribe((data:any) => {
      let row=data.rows
      this.facultyDataToPermit=row.map((item:any)=>{
          // item.value.data.department.map(
          //   (i:any)=>{
          //     if(item.value.data.department.length>1)
          //     this.department.push(Object.keys(i)[0])
          //   }
          // )
        return item.value
      })
      console.log(this.facultyDataToPermit)
    });

   
    
    }
    allowFaculty(faculty:any){
      faculty.data.permitted=true
      this.Service.updateDocument(faculty)
        console.log(faculty)
      this.removeFromPending(faculty)
    }
    denyFaculty(faculty:any){
      faculty.data.permitted="no"
      this.Service.updateDocument(faculty)
      console.log(faculty)
      this.removeFromPending(faculty)
    }
    removeFromPending(faculty:any){
      const index=this.facultyDataToPermit.indexOf(faculty)
      if(index!=-1){
        this.facultyDataToPermit.splice(index,1)
      }
    }
    
  }
