import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FacultyService } from 'src/app/faculty.service';
import { facultyLogin } from 'src/app/student-data';
interface DepartmentObject {
  [key: string]: { [key: string]: string };
}

@Component({
  selector: 'app-faculty-register',
  templateUrl: './faculty-register.component.html',
  styleUrls: ['./faculty-register.component.scss']
})
export class FacultyRegisterComponent implements OnInit {
  private facultyDetails!:facultyLogin
  facultyForm!:FormGroup
  errorMessage!:HTMLDivElement
  subjectCodeArray:string[]=[]
  subjectArray:string[]=[]
  teachingDepartments:any[]=[]
  flag:boolean=false

  constructor(private facultyService:FacultyService,private fb:FormBuilder,private render:Renderer2,private route:Router){}

  ngOnInit(): void {
    this.errorMessage=this.render.selectRootElement(".errorMessage")
    this.facultyForm=this.fb.group({
      name:['',[Validators.required,Validators.pattern(/^[a-zA-Z\s]+$/)]],
      employeeId:['',[Validators.required,Validators.pattern(/^[0-9]+$/),Validators.maxLength(4)]],

      email:['',[Validators.required,Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z]).+$/)]
      ],
      subject:["",[Validators.required,Validators.pattern(/^[a-zA-Z\s]+$/)]],
      subjectCode:['',[Validators.required]],
      department:["",[Validators.required,Validators.pattern(/^[a-zA-Z\s]+$/)]]
    })
  }
  async onSubmit(){
    let find!:boolean
    this.errorMessage.innerHTML=""
    console.log("onsubmit")
    find = await this.addAnotherDepartment()
    console.log(find)
    if(find){
    if (this.facultyForm.valid){
      this.facultyDetails={
        name:this.facultyForm.value.name?this.facultyForm.value.name.toLowerCase():"",
        employeeId:this.facultyForm.value.employeeId,
        email:this.facultyForm.value.email?this.facultyForm.value.email.toLowerCase():'',
        password:this.facultyForm.value.password?this.facultyService.hashedPassword(this.facultyForm.value.password):'',
        department:this.teachingDepartments,
        permitted:false,
        type:"faculty"
       
      }
     
      console.log(this.facultyDetails)
      this.facultyService.createDocument(this.facultyDetails,this.errorMessage)
      console.log("success")
      this.facultyForm.reset()
      // this.route.navigate(['/home'])

      
    }}
  }
  async addAnotherDepartment():Promise<boolean>{
    this.flag=true
    let deptObj:{[key:string]:{}}={}
    if(!this.isDepartmentExist(this.facultyForm.value.department)){
    deptObj[this.facultyForm.value.department]={
      [this.facultyForm.value.subject]:this.facultyForm.value.subjectCode
    }
    let flags=await this.facultyService.toCheckAlreadyExist(deptObj,this.errorMessage)
    console.log(flags)
    if(flags){
    this.teachingDepartments.push(deptObj)
    return true
  }else{
    this.flag=false
    return false
  }
  }
  else{
    this.errorMessage.innerHTML="Department already entered"
    return false
  }
}
 
onDepartmentChange(event:Event){
  console.log(this.teachingDepartments)
  const selectedDepartment = (event.target as HTMLSelectElement).value;
  this.facultyService.getSubjectCodeName(selectedDepartment).then(res=>{
    this.subjectArray=res[0]
    this.subjectCodeArray=res[1]
  })
  
  
}
clearValue(){
  (document.getElementById("department") as HTMLSelectElement).value="";
  (document.getElementById("subject") as HTMLSelectElement).value="";
  (document.getElementById("subjectCode") as HTMLSelectElement).value=""
}
isDepartmentExist(department: string): boolean {
  return this.teachingDepartments.some((deptObj: DepartmentObject) => deptObj.hasOwnProperty(department));
}
}
