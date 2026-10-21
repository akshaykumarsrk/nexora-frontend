import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  JobCard,
  JobCardRequest
} from '../models/job-card';

import { environment } from '../../../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class JobCardService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/job-cards`;


  // =========================================================
  // GET ALL
  // =========================================================

  getJobCards(): Observable<JobCard[]> {

    return this.http.get<JobCard[]>(
      this.apiUrl
    );
  }


  // =========================================================
  // GET BY ID
  // =========================================================

  getJobCardById(
    id: number
  ): Observable<JobCard> {

    return this.http.get<JobCard>(
      `${this.apiUrl}/${id}`
    );
  }


  // =========================================================
  // GET BY JOB ID
  // =========================================================

  getJobCardByJobId(
    jobId: number
  ): Observable<JobCard> {

    return this.http.get<JobCard>(
      `${this.apiUrl}/job/${jobId}`
    );
  }


  // =========================================================
  // CREATE
  // =========================================================

  createJobCard(
    request: JobCardRequest
  ): Observable<JobCard> {

    return this.http.post<JobCard>(
      this.apiUrl,
      request
    );
  }


  // =========================================================
  // UPDATE
  // =========================================================

  updateJobCard(
    id: number,
    request: JobCardRequest
  ): Observable<JobCard> {

    return this.http.put<JobCard>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  // =========================================================
  // ACKNOWLEDGE
  // =========================================================

  acknowledgeJobCard(
    id: number
  ): Observable<JobCard> {

    return this.http.patch<JobCard>(
      `${this.apiUrl}/${id}/acknowledge`,
      {}
    );
  }


  // =========================================================
  // DELETE
  // =========================================================

  deleteJobCard(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }

}