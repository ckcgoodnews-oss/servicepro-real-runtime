export interface ReportService{listReports():Promise<unknown[]>;runReport(id:string):Promise<unknown>;}
