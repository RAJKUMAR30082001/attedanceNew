import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CheckValidityService } from 'src/app/check-validity.service';
import { StudentCouchService } from 'src/app/student-couch.service';
import { StudentData, facultyLogin } from 'src/app/student-data';

@Component({
  selector: 'app-update-attendance',
  templateUrl: './update-attendance.component.html',
  styleUrls: ['./update-attendance.component.scss']
})
export class UpdateAttendanceComponent implements OnInit, AfterViewChecked {
  public details!:facultyLogin
  public flag:boolean=false
  public displayStudent:StudentData[]=[]
  public subjectCode:string=''
  public percentage:number[]=[]
  public elementValue:string=''
  public percentageValue!:number
  public filteredValue!:any
  public showUpdateContainer:boolean = false;
  public showTable:boolean=true
  public regNo:string=''
  public currentPercentage!:number
  public errorMessage!:string
  public inputValue!:number
  constructor (private stdService:StudentCouchService,private check:CheckValidityService,private render:Renderer2,private cdr:ChangeDetectorRef) {}
  @ViewChild('flashContainer', { static: false }) flashContainer!: ElementRef;

  ngOnInit(): void {
    this.details=this.check.getData()
    // this.subjectCode=this.details.subjectCode
    this.getDetails()
   
  }
  ngAfterViewChecked(): void {
    if (this.flashContainer && this.flashContainer.nativeElement) {
      this.flashContainer.nativeElement.style.display="block"
    }
  }
  

  updateAttendance(regNo:string, currentPercentage:number){
    this.regNo=regNo
    this.currentPercentage=currentPercentage
    this.showUpdateContainer=true
    this.showTable=false
    console.log("yes detect changes")
    this.cdr.detectChanges();
  }
  
  obtainPercentage(value: any, updateFlag?:boolean):Observable<any>| any {
    const attendanceRecord = value.attendanceRecord;
  
    const targetObject = attendanceRecord.find((record: { [key: string]: number }) =>
    record.hasOwnProperty(this.subjectCode)
  );
    if(targetObject && updateFlag){
      targetObject[this.subjectCode]=this.inputValue
      console.log(value)
      return of(value)
    }
    else if (targetObject) {
      this.percentageValue = targetObject[this.subjectCode];
      console.log(this.percentageValue)
      this.percentage.push(this.percentageValue);
    }
  }
  filterTable(){
    this.flag=true
    this.elementValue=(document.getElementById("filterInput") as HTMLInputElement).value.toLowerCase()
    console.log(this.elementValue)
    this.getDetails()
    
  }
  getDetails(){
    this.errorMessage=''
    this.stdService.getFullDocument().subscribe(data=>{
      if(data['2024']){
      let dataDetails=data['2024']
      let key=Object.keys(dataDetails);
      this.displayStudent=key.map(i=>{
        if(this.flag && i===this.elementValue){
          this.filteredValue=dataDetails[i]
          this.obtainPercentage(dataDetails[i])
        }
        else if(this.showUpdateContainer && i===this.regNo){
          this.obtainPercentage(dataDetails[i],this.showUpdateContainer).subscribe((updatedData: any)=>{
            data['2024'][i]=updatedData
            this.stdService.updateDocument(data)
          })
          return dataDetails[i]
        }
        else{
        this.obtainPercentage(dataDetails[i])
        return  dataDetails[i]
      }
      })
    }
    })
    console.log(this.displayStudent)
  
  }
  
confirmUpdate(){
  
  this.errorMessage=""
  this.inputValue=Number((document.getElementById("newAttendance") as HTMLInputElement)?.value)
  
  if(this.checkNumber(this.inputValue,this.currentPercentage)){
    this.getDetails()
    this.errorMessage="updated successfully"
    
    
    
    setTimeout(()=>{
      location.reload()
    
  },2000)

  }
}
checkNumber(value:any,percentage:number):boolean{
  if(isNaN(value) || value>100 || value<0 || value<percentage ){
    this.errorMessage="Enter valid percentage value"
    return false
  }
  return true
}
back(){
  this.showUpdateContainer=false
  this.showTable=true
}
  
}
