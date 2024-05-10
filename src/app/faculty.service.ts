import { Injectable } from '@angular/core';
import { StudentCouchService } from './student-couch.service';
import { facultyLogin } from './student-data';
import { HttpClient } from '@angular/common/http';
import * as CryptoJS from 'crypto-js';
import { Observable, Subject, find, map } from 'rxjs';
import { CheckValidityService } from './check-validity.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FacultyService {

  // Base URL for faculty data
  private baseUrl = this.stdService.apiUrl;
 public dataStruct:any
  // API URL
  private apiUrl = this.stdService.apiUrl;

  // HTTP headers for requests
  private Header = this.stdService.getHeader();

  // Current year
  year = new Date().getFullYear();

  constructor(private stdService: StudentCouchService, private http: HttpClient,private check:CheckValidityService,private route:Router) { }

  // Method to update or insert faculty data
  getSubjectCodeName(dept: string): Promise<[keys: string[], values: string[] ]> {
    console.log(dept)
    const url = `${this.baseUrl}/_design/view/_view/getsubjectcode?key="${dept}"`;
    return new Promise<[keys: string[], values: string[] ]>((resolve, reject) => {
        this.http.get<any>(url, { headers: this.Header }).subscribe(
            res => {
                const subjectCode = res.rows[0].value.data.subjectCode;
                const keys = Object.keys(subjectCode);
                const values:string[] = Object.values(subjectCode);
                resolve([keys, values ]);
            },
            error => {
                reject(error);
            }
        );
    });
}
async createDocument(data:any, error:HTMLDivElement){
  console.log("yeah")
  let email=data.email
  let employeeId=data.employeeId
  console.log(typeof employeeId)
  this.findEmailExist(email,"email",error)
  this.findIdExist(employeeId,"employeeId",error)
  let uuid=this.stdService.getId()
  this.dataStruct={
    "_id":`faculty_2_${uuid}`,
    "data":data
  }
  // this.http.post(this.baseUrl,dataStruct,{headers:this.Header}).subscribe(res=>{
  //   console.log(res)
  // })
}

async toCheckAlreadyExist(data:any,error:HTMLDivElement):Promise<boolean>{
  let Subject:string[]=[]
  let subjectCode:string[]=[]
  try {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    const val: any = Object.values(data)[0];
    console.log(val);

    if (!val || typeof val !== 'object') {
      throw new Error('Invalid value format');
    }

    let final=Object.entries(val);
    console.log(final[0][0],final[0][1])
    let department=Object.keys(data)[0]
    let storedValue=await this.getSearchIndex(department,"department")
    if(storedValue.length>0){
    storedValue.forEach((val:any)=>{
      Object.values(val).forEach((restVal:any)=>{
        Subject.push(Object.keys(restVal)[0])
        subjectCode.push(Object.values(restVal)[0] as string)
      })
    })
    console.log(Subject,subjectCode)
   

    
    if(Subject.includes(final[0][0])){
      error.innerHTML="subject already exist"
      return false;
    }

    else{
      if(final[0][1]){
        for(let i of subjectCode){
          if(i===final[0][1]){
            console.log("coming")
            error.innerHTML="subject code already exist"
            return false
          }}
          
      }}
      return true
    }
    return true

   
  } catch (error) {
    console.error('Error checking existence:', error);
    return false;
  }

}
getIndex(value:string,type:string){
  console.log(value)
  let body=this.getBody(value,type)
  console.log(body)
  return this.http.post(`${this.baseUrl}/_design/view/_search/findExist`,body,{headers:this.Header})
}

getSearchIndex(value:string,type:string){
  
  return this.getIndex(value,type).toPromise().then((res:any)=>{
    console.log(res)
    if(res.rows.length>0){
    return res.rows[0].doc.data.department;}
    else{
      return []
    }
  })
   
}
getBody(value:string,type:string){
  return{ q:`${type}:${value}`,'include_docs':true}
}

findEmailExist(email:string,type:string,error:HTMLDivElement){
  this.getIndex(email,type).toPromise().then((res:any)=>{
    console.log(res.rows.length,res)
    if(res.rows.length>0){
      error.innerHTML="email already exist"
    }
  })
}
findIdExist(empId:string,type:string,error:HTMLDivElement){
  this.getIndex('_'+empId,type).toPromise().then((res:any)=>{
    console.log(res.rows.length,res)
    if(res.rows.length>0){
      error.innerHTML="Employee Id already exist"
    }
    else{
      this.http.post(this.baseUrl,this.dataStruct,{headers:this.Header}).subscribe(res=>{
          console.log(res)
          error.innerHTML="successfully submitted wait for approval"
        })
      }
    })
 
}
  updateDocument(doc: any) {
    let id=doc._id
    let rev=doc._rev
    this.http.put(`${this.baseUrl}/${id}?rev=${rev}`, doc, { headers: this.Header }).subscribe(res => {
      console.log("Successfully updated");
    });
  }

  // Method to hash password using SHA256
  hashedPassword(password: string): string {
    const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    console.log(hashedPassword);
    return hashedPassword;
  }

 
  loginCheck(email: string, password: string, errorMessage: HTMLDivElement) {
   
    this.http.get<any>(`${this.getViewUrl(email,"facultylogin")}`, { headers: this.Header }).subscribe(data => {
      console.log(data)
      if (data.rows.length === 0) {
        errorMessage.innerHTML = "Enter valid email";
        return;
      } else {
        let permit = data.rows[0].value.permitted;
        console.log(permit)
        if (!permit) {
          errorMessage.innerHTML = 'You are not authenticated';
          return;
        } else {
          let passHashed = data.rows[0].value.password;
          if (this.hashedPassword(password) === passHashed) {
            this.check.SetData(data['rows'][0].value);
            this.route.navigate(['/facultyHome'])
          } else {
            errorMessage.innerHTML = "Enter correct password";
          }
        }
      }
    });
  }

  // Method to generate the URL for fetching faculty data based on email
  getViewUrl(data: string,view:string): string {
    return `${this.baseUrl}/_design/view/_view/${view}?key="${data}"`;
  }

  getFacultyData():Observable<any>{
    return this.http.get<any>(`${this.baseUrl}/_design/view/_view/permitFaculty`,{headers:this.Header})
    
  }
  getFullDocument():Observable<any>{
    return this.http.get<any>(this.baseUrl, { headers: this.Header })
  }
  facultyForLetter(data:string='22ca022'):Observable<any>{
    const doc=this.getViewUrl(data,'getFaculty')
    return this.http.get<any>(doc,{headers:this.Header})
  }
}
