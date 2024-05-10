import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdminService } from 'src/app/admin.service';
import { CheckValidityService } from 'src/app/check-validity.service';
import { StudentCouchService } from 'src/app/student-couch.service';
import { periodWiseData } from 'src/app/student-data';

@Component({
  selector: 'app-schedule-period',
  templateUrl: './schedule-period.component.html',
  styleUrls: ['./schedule-period.component.scss']
})
export class SchedulePeriodComponent implements OnInit{
  public period = [];
  public department:string=''
  public departmentFlag:boolean=false//check department selected
  public periodFlag:boolean=false//readonly
  public divElement!:HTMLDivElement
  public flag:boolean=true//validation
  public subjectCode!:FormGroup
  public attendanceFlag:boolean=false//schedule flag
  public periodForm!:FormGroup
  public dayWisePeriod={}
  public periods:periodWiseData[]=[]
  public displaySubject:boolean=false
  public currentDay:number=0
  public periodCount:number=1
  public days:string[]=[]
  public dataToStore:{[key:string]:string}={}
  public placeHolderArray:any//subjecode to display
  public placeHolderSubject:any//subject to display
  public formFlag:boolean=true//display subjectcode html
  public error!:HTMLDivElement
  public errorVal:string=''
  public count:number=0
  constructor(private check:CheckValidityService,private render:Renderer2,private fb:FormBuilder,private adminService:AdminService,private std:StudentCouchService) { }
  ngOnInit(): void {
    console.log(this.period)
   
    this.error=this.render.selectRootElement(".errorMessage")
}
getCode(event:Event){
  
  this.department=(event.target as HTMLSelectElement).value
  console.log(this.department)
  this.adminService.getViewUrl("departmentwiseCode",this.department).subscribe((res:any)=>{
    if(res.rows.length>0){
      console.log(res)
      this.flag=true
      this.periodFlag=true
      this.placeHolderArray=Object.values(res.rows[0].value.data.subjectCode)
      this.placeHolderSubject=Object.keys(res.rows[0].value.data.subjectCode)
      // this.disableValitator(this.flag)
    }
    else{
      this.flag=false
      this.periodFlag=false
      let subjectCodePlace:string[]=[]
      let subject:string[]=[]
      for(let i=1;i<=5;i++){
        subjectCodePlace.push(`Enter SubjectCode ${i}`)
        subject.push(`Enter subjet name for SubjectCode${i}`)
      }
      this.placeHolderArray=subjectCodePlace
      this.placeHolderSubject=subject
      
      this.error.innerHTML= "Please add a Subject code first."
    }
    this.initializeCodeForm()
    // this.disableValitator(this.flag)
    this.departmentFlag=true
    console.log(this.placeHolderArray)

  })
}
  updateSubjectCodes(){
    this.periodFlag=false
    if(this.count===1){
      console.log(this.subjectCode.value)
      this.updateValue()
    }
    this.count++
      
  }
  async nextPage(){
    if(this.error){
    this.error.innerHTML=""
  } console.log(this.check.getData())
  console.log(this.subjectCode)
  this.assignValue()
    if(!this.periodFlag){
      let uuid= this.std.createid(this.department)
      let data={
        "_id":uuid,
        "data":{
          'subjectCode':this.dataToStore,
          "type":"subjectCode",
          "department":this.department
        }
      }
      this.adminService.createDoc(data).subscribe(res=>{
        console.log(res)
      })
    }
     
  
    this.attendanceFlag=true
    this.formFlag=false
    this.initializeForm()
  
}
assignValue() {
  for (let i = 0; i < 5; i++) {
    this.dataToStore[`${this.subjectCode.value['subjectName' + (i + 1)]}`] = this.subjectCode.value['subjectCode' + (i + 1)];
  }
  console.log(this.dataToStore)
}

  getDay():string{
   
    this.days=['monday','tuesday','wednesday','thursday','friday']
    return this.days[this.currentDay]
    
  }
  updateValue(){
    this.adminService.getViewUrl("departmentwiseCode",this.department).subscribe((res:any)=>{})
  }

  next(){
    
    let details:periodWiseData={
      subjectName:this.periodForm.value.subjectName?this.periodForm.value.subjectName.toLowerCase():'',
      subjectCode:this.periodForm.value.subjectCode?this.periodForm.value.subjectCode.toLowerCase():'',
      startTime:this.periodForm.value.startTiming?this.periodForm.value.startTiming.toLowerCase():'',
      endTime:this.periodForm.value.endTiming?this.periodForm.value.endTiming.toLowerCase():''

    }
    console.log(typeof(details.startTime))
    if(this.checkAlreadyExist(details)){

    
    this.periodForm.reset()
    if(this.periodCount===3){
      this.periods.push(details);
      this.dayWisePeriod={
        [this.getDay()]:this.periods
      }
      console.log(this.dayWisePeriod)
      this.adminService.getUrl().subscribe(data=>{
        data.schedule.push(this.dayWisePeriod)
        this.adminService.updateAdmin(data)
      })
      this.currentDay++
      this.periods=[]
      this.periodCount=1
      
    }
    else{
     
      this.periodCount++
      this.periods.push(details);
      console.log(this.periods)
    }}
    console.log(this.periodCount)

  }
  initializeForm(){
    this.periodForm=this.fb.group({
      subjectName:['',Validators.required],
      subjectCode:['',Validators.required],
      startTiming: ['', [Validators.required, Validators.pattern(/^(0\d|1[0-2]):[0-5]\d (AM|PM)$/i)]],
      endTiming:['',[Validators.required,Validators.pattern(/^(0\d|1[0-2]):[0-5]\d (AM|PM)$/i)]]
    })
  }
  initializeCodeForm(){
    this.subjectCode = this.fb.group({});
    for(let i=0;i<5;i++){
      this.subjectCode.addControl(`subjectCode${i+1}`,this.fb.control(`${this.placeHolderArray[i]}`,Validators.required))
      this.subjectCode.addControl(`subjectName${i+1}`,this.fb.control(`${this.placeHolderSubject[i]}`,Validators.required))

    }
  }
//   disableValitator(flag:boolean){
//     if(flag){
//       for(let i=1;i<=5;i++){
//         // Remove validators
//         this.subjectCode.get(`subjectCode${i}`)?.clearValidators();
//         this.subjectCode.get(`subjectCode${i}`)?.updateValueAndValidity({ onlySelf: true }); // Update validity status
      
//     }
//   }else{
//     for (let i = 1; i <= 5; i++) {
//       // Add validators
//       this.subjectCode.get(`subjectCode${i}`)?.setValidators(Validators.required);
//       this.subjectCode.get(`subjectCode${i}`)?.updateValueAndValidity({ onlySelf: true }); // Update validity status
//     }
//   }
// }

checkAlreadyExist(details: any): boolean {
  const startTime = this.getTime(details.startTime);
  const endTime = this.getTime(details.endTime);

  for (const item of this.periods) {
    if (item.subjectCode === details.subjectCode) {
      this.errorVal = 'subjectCode already assigned';
      return false;
    }

    if (item.subjectName === details.subjectName) {
      this.errorVal = 'subject period already assigned';
      return false;
    }

    const itemStartTime = this.getTime(item.startTime);
    const itemEndTime = this.getTime(item.endTime);

    if (
      startTime === itemStartTime ||
      endTime === itemEndTime ||
      (startTime >= itemStartTime && startTime <= itemEndTime) ||
      (endTime >= itemStartTime && endTime <= itemEndTime)
    ) {
      this.errorVal = `invalid time assigning already assigned to ${item.subjectName}`;
      return false;
    }
  }

  return true;
}


getTime(Time:string):number{
    let time=Time.split(" ")
    let start=time[0].split(":")
    if(time[1]==='pm' && start[0]!=='12'){
      console.log(time[0])
      return (Number(start[0])+12)*60 + Number(start[1])
    }
    return Number(start[0])*60 + Number(start[1])
  }

  
}



