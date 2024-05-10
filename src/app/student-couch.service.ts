import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CouchDBViewResponse, StudentData, loginDetails } from './student-data';
import { Observable, catchError, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { CheckValidityService } from './check-validity.service';
import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
@Injectable({
  providedIn: 'root'
})
export class StudentCouchService {

  readonly baseURL = 'https://192.168.57.185:5984/attendance_system';
  readonly apiUrl="https://192.168.57.185:5984/attendance_system"
  readonly username = 'd_couchdb';
  readonly password = 'Welcome#2';
  public year=new Date().getFullYear()
  public document:any[]=[]
  public masterId:string=''
  public docName:string[]=["student","attendance","leave","notificationStudent"]

  constructor(private http: HttpClient,private router:Router,private check:CheckValidityService) { }
 

  getHeader(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`)
    });
  }
  getFullDocument():Observable<any>{
    return this.http.get<any>(this.baseURL, { headers: this.getHeader() })
  }
  async checkExist(details:any,error:HTMLDivElement):Promise<boolean>{
    let res:any=await this.http.get(this.getUrl(details.registerNumber),{headers:this.getHeader()}).toPromise()
    
    if(res.rows.length>0){
      
      error.innerHTML="Register number alreday exist"
      return false
     }
    let res2:any=await this.http.get(this.getUrl(details.email),{headers:this.getHeader()}).toPromise()
    if(res2.rows.length>0){
      error.innerHTML="Email already exist"
      return false
    }
    return true

  }
  getUrl(value:string):string{
    return `${this.baseURL}/_design/view/_view/checkExist?key="${value}"`
  }

  async createDocument(data: any) {
    
  
    for (let i of this.docName) {
      console.log(i);
      let id = this.createid(i);
      
      if (i === "student") {
        this.masterId = id;
        data["type"] = i;
        let dataToStore: any = {
          "_id": id,
          "data": data
        };
        this.document.push(dataToStore);
      } else if (i === "attendance") {
        try {
          let res = await this.getSubjectCode(data.department, i, this.masterId).toPromise();
          console.log(res);
          let dataToStore: any = {
            "_id": id,
            "data": res
          };
          this.document.push(dataToStore);
        } catch (error) {
          console.error('Error fetching attendance:', error);
        }
      } else if (i === 'leave') {
        let dataToStore = {
          "_id": id,
          "data": {
            "student": this.masterId,
            "Request":[],
            "Accepted":[],
            "Rejected":[],
            "type":i
          }
        };
        this.document.push(dataToStore);
      } else {
        let url = `${this.baseURL}/_design/view/_view/getNotificationId`;
        try {
          let res: any = await this.http.get(url, { headers: this.getHeader() }).toPromise();
          let LookUpId = res.rows[0].id;
          let dataToStore = {
            "_id": id,
            "data": {
              "seen": [],
              "unseen": [],
              "type": i,
              "notification": LookUpId,
              "student": this.masterId
            }
          };
          this.document.push(dataToStore);

          console.log(this.document);
        } catch (error) {
          console.error('Error fetching notification ID:', error);
        }
      }
      if(i==="notificationStudent"){
        this.router.navigate(['/faceRegister',data.registerNumber])
      }
    }
    
   
  }
  async createBulkDoc(){
    console.log("yes comming")
    await this.http.post<any>(`${this.baseURL}/_bulk_docs`, { docs: this.document }, { headers: this.getHeader() }).toPromise();
    this.masterId=""
    this.document=[]
  }

  getId():string{
    return uuidv4()
  }
  createid(name:string){
    return `${name}_2_${this.getId()}`
  }
  getSubjectCode(dept:string,type:string,masterId:string):Observable<any>{
    console.log("comming")
    let url=`${this.baseURL}/_design/view/_view/getsubjectcode?key="${dept}"`
   console.log(url)
    return this.http.get<any>(url, { headers: this.getHeader() }).pipe(
      map(res => {
        console.log(res.rows[0].value.data.subjectCode)
        const subjectCode =res.rows[0].value.data.subjectCode;
        const key = Object.keys(subjectCode);
        const value = Object.values(subjectCode);
        const attendancePercentage: { [key: string]: number } = {};
  
        value.forEach((item: any) => {
          attendancePercentage[item] = 0;
        });
  
        return {
          subjectName: key,
          percentage: attendancePercentage,
          type: type,
          student: masterId
        };
      })
    );
    
  }
  hashedPassword(password:string):string{
    const hashedPassword = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    console.log(hashedPassword)
    return hashedPassword;
  }

  faceUpdate(LabeledDescriptor:any,RegisterNumber:string){
    console.log("face",this.document)
    let id=this.createid("faceLandmark")
    let doc={
      "_id":id,
      "data":{
        "registerNumber":RegisterNumber,
        "faceDescriptor":LabeledDescriptor,
        "type":"faceLandmark",
        "student":this.masterId
      }
    }
    this.document.push(doc)
    console.log(this.document)
    this.createBulkDoc()
  
  }

  getDataById(id:string):Observable<any>{
    return this.http.get<any>(`${this.baseURL}/${id}`,{headers:this.getHeader()})
  }

  getFace(registerNumber:string):Observable<any>{
    return this.http.get(`${this.baseURL}/_design/view/_view/getFaceLandmark?key="${registerNumber}"`,{headers:this.getHeader()})
  }


  login(LoginDetails:loginDetails,errorMessage:HTMLDivElement,video:HTMLVideoElement,data:any) {
    const registerNumber=LoginDetails.registerNumber? LoginDetails.registerNumber : '';
    const password=this.hashedPassword(LoginDetails.password)
    // const password=LoginDetails.password
    this.getDataById(data.student).subscribe(res=>{
      if(res.data.password===password){
        console.log(data)
        this.check.SetData(res)
        this.destroyVideo(video)
      }else{
        errorMessage.innerHTML="Password is incorrect"
        return
      }
    })
  }

  destroyVideo(video:HTMLVideoElement){
    if (video) {
      const stream = video.srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => {
          track.stop();
        });
      }
      video.srcObject = null; 
    }
  }
    
         
          
       











































  putDocuments(details: StudentData, year: number,DivElement?:HTMLDivElement) {
    let email: string = details.email;
    let registerNumber: string = details.registerNumber;

    this.getFullDocument()
      
      .subscribe(data => {
        try {
          
          if (data[year]) {
            const studentData = data[year];
            if (studentData[registerNumber]) {
              console.log("exist")
              if(DivElement)
              DivElement.innerHTML += "Registration number already exists";
              return;
            }

            const studentKeys = Object.keys(studentData);
            const emailExists = studentKeys.some(key => studentData[key].email === email);

            if (emailExists) {
              if(DivElement)
              {
              let val=DivElement.innerHTML
              DivElement.innerHTML +=`${val} <br> Email already exists` ;
              }
              return;
            }

            studentData[registerNumber] = details;
            this.updateDocument(data)

            console.log(registerNumber)


            this.router.navigate(['/faceRegister',registerNumber])
          } 
          else {
            // Academic year does not exist, create it and add the student details inside it
            data[year] = {
              [registerNumber]: details
            };
            console.log(data)
            this.updateDocument(data);
            this.router.navigate(['/faceRegister',registerNumber])

          }
        } catch (error) {
          console.error('Error processing student details:', error);
        }
      });
  }

  updateDocument(data: any) {
    
    this.http.put(this.baseURL, data, { headers: this.getHeader() }).subscribe(
        (response: any) => {
          console.log('Student details added/updated successfully:', response);
        })
  }
  
  getViewUrl(RegisterNumber:string):string{
    return `${this.apiUrl}/_design/views/_view/login?key="${RegisterNumber}"`
  }
 
 

  getRequiredData(): Observable<any> {
    return this.getFullDocument().pipe(
      map(data => data[this.year]),
      catchError(error => {
        // Handle the error if needed
        console.error('Error fetching admin data:', error);
        return of(null); 
      })
    );
  }
  getValueRegisterNumber(regNo:string):Observable<any>{
    return this.http.get<CouchDBViewResponse>(this.getViewUrl(regNo), { headers: this.getHeader() })
  }

  
}
