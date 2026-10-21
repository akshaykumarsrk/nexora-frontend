import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import {
  JobPart,
  JobPartRequest
} from '../models/job-part';

@Injectable({
  providedIn: 'root'
})
export class JobPartService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/job-parts`;


  // =========================================================
  // GET ALL JOB PARTS
  // =========================================================

  getAllJobParts(): Observable<JobPart[]> {

    return this.http.get<JobPart[]>(
      this.apiUrl
    );
  }


  // =========================================================
  // GET JOB PART BY ID
  // =========================================================

  getJobPartById(
    id: number
  ): Observable<JobPart> {

    return this.http.get<JobPart>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // GET PARTS USED IN A JOB
  // =========================================================

  getJobPartsByJobId(
    jobId: number
  ): Observable<JobPart[]> {

    return this.http.get<JobPart[]>(
      `${this.apiUrl}/job/${jobId}`
    );
  }


  // =========================================================
  // CREATE JOB PART
  // =========================================================

  createJobPart(
    request: JobPartRequest
  ): Observable<JobPart> {

    return this.http.post<JobPart>(
      this.apiUrl,
      request
    );
  }


  // =========================================================
  // UPDATE JOB PART
  // =========================================================

  updateJobPart(
    id: number,
    request: JobPartRequest
  ): Observable<JobPart> {

    return this.http.put<JobPart>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  // =========================================================
  // DELETE JOB PART
  // =========================================================

  deleteJobPart(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}