import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../../environments/environment';

import {
  Job
} from '../models/job';

import {
  JobRequest
} from '../models/job-request';


@Injectable({
  providedIn: 'root'
})
export class JobService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/jobs`;


  // =========================================================
  // GET ALL JOBS
  // =========================================================

  getAllJobs(): Observable<Job[]> {

    console.log(
      '[JobService] GET:',
      this.apiUrl
    );

    return this.http.get<Job[]>(
      this.apiUrl
    );

  }

  /** Returns only jobs assigned to the authenticated technician. */
  getMyJobs(): Observable<Job[]> {
    return this.http.get<Job[]>(`${this.apiUrl}/my-jobs`);
  }


  // =========================================================
  // GET JOB BY ID
  // =========================================================

  getJobById(
    id: number
  ): Observable<Job> {

    return this.http.get<Job>(
      `${this.apiUrl}/${id}`
    );

  }


  // =========================================================
  // CREATE JOB
  // =========================================================

  createJob(
    request: JobRequest
  ): Observable<Job> {

    return this.http.post<Job>(
      this.apiUrl,
      request
    );

  }


  // =========================================================
  // UPDATE JOB
  // =========================================================

  updateJob(
    id: number,
    request: JobRequest
  ): Observable<Job> {

    return this.http.put<Job>(
      `${this.apiUrl}/${id}`,
      request
    );

  }


  // =========================================================
  // ASSIGN TECHNICIAN
  // =========================================================

  assignTechnician(
    id: number,
    technicianId: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/assign`,
      null,
      {
        params: { technicianId: String(technicianId) }
      }
    );

  }


  // =========================================================
  // SCHEDULE JOB
  // =========================================================

  scheduleJob(
    id: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/schedule`,
      {}
    );

  }


  // =========================================================
  // START JOB
  // =========================================================

  startJob(
    id: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/start`,
      {}
    );

  }


  // =========================================================
  // HOLD JOB
  // =========================================================

  holdJob(
    id: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/hold`,
      {}
    );

  }


  // =========================================================
  // RESUME JOB
  // =========================================================

  resumeJob(
    id: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/resume`,
      {}
    );

  }


  // =========================================================
  // COMPLETE JOB
  // =========================================================

  completeJob(
    id: number,
    workSummary: string
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/complete`,
      {
        workSummary
      }
    );

  }


  // =========================================================
  // CANCEL JOB
  // =========================================================

  cancelJob(
    id: number
  ): Observable<Job> {

    return this.http.patch<Job>(
      `${this.apiUrl}/${id}/cancel`,
      {}
    );

  }


  // =========================================================
  // DELETE JOB
  // =========================================================

  deleteJob(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );

  }

}