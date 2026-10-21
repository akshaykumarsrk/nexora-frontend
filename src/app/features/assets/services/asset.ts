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
  Asset,
  AssetRequest
} from '../models/asset';


@Injectable({
  providedIn: 'root'
})
export class AssetService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl =
    `${environment.apiUrl}/assets`;


  getAllAssets(): Observable<Asset[]> {

    return this.http.get<Asset[]>(
      this.apiUrl
    );
  }


  getAssetById(
    id: number
  ): Observable<Asset> {

    return this.http.get<Asset>(
      `${this.apiUrl}/${id}`
    );
  }


  getAssetsBySite(
    siteId: number
  ): Observable<Asset[]> {

    return this.http.get<Asset[]>(
      `${this.apiUrl}/site/${siteId}`
    );
  }


  createAsset(
    request: AssetRequest
  ): Observable<Asset> {

    return this.http.post<Asset>(
      this.apiUrl,
      request
    );
  }


  updateAsset(
    id: number,
    request: AssetRequest
  ): Observable<Asset> {

    return this.http.put<Asset>(
      `${this.apiUrl}/${id}`,
      request
    );
  }


  deleteAsset(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}