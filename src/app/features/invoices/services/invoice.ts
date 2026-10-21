import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../../environments/environment.development";
import { Observable } from "rxjs";
import { Invoice, InvoiceRequest } from "../models/invoice";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/invoices`;

  getAllInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getInvoiceById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/${id}`
    );
  }

  getInvoiceByJob(jobId: number): Observable<Invoice> {
    return this.http.get<Invoice>(
      `${this.apiUrl}/job/${jobId}`
    );
  }

  createInvoice(
    request: InvoiceRequest
  ): Observable<Invoice> {
    return this.http.post<Invoice>(
      this.apiUrl,
      request
    );
  }

  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(
      `${this.apiUrl}/${id}/pdf`,
      {
        responseType: 'blob'
      }
    );
  }
}