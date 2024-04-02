export interface StudentData {
    firstName:string
    middleName:string
    lastName:string
    department:string
    registerNumber:string
    email:string
    password:string
    confirmPassword?:string
    leaveLetter:any[]
    notification:string[]
    attendanceRecord:any[]
    numberOfClasses:{}
}
export interface CouchDBViewResponse {
    total_rows: number;
    offset: number;
    rows: any[];
  }

export interface loginDetails{
    registerNumber:string;
    password:string
   
}

export interface facultyLogin{
    name:string
    employeeId:number
    email:string
    password:string
    subject:string
    subjectCode:string
    department:string
    permitted:boolean
    leavePermission:[]
}

export interface leaveLetterForm{
    
    subjectCode:string
    leaveDate:Date
    reason:string
    bool:boolean
    uploadFile:File
}


export interface periodWiseData{
    subjectName:string
    subjectCode:string
    startTime:string
    endTime:string
}
