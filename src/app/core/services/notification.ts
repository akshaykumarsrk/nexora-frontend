import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable
} from 'rxjs';

import {
  NotificationResponse
} from '../models/notification';
import { environment } from '../../../environments/environment';


/**
 * This service handles all notification API calls.
 *
 * Notifications are application-wide,
 * so the service belongs inside core/services.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  /**
   * Backend notification API.
   *
   * The backend controller is:
   * /api/notifications
   */
  private readonly apiUrl = `${environment.apiUrl}/notifications`;


  constructor(
    private readonly http: HttpClient
  ) {}


  /**
   * Get all notifications for the
   * currently logged-in user's organization.
   */
  getAllNotifications():
    Observable<NotificationResponse[]> {

    return this.http.get<NotificationResponse[]>(
      this.apiUrl
    );
  }


  /**
   * Get only unread notifications.
   */
  getUnreadNotifications():
    Observable<NotificationResponse[]> {

    return this.http.get<NotificationResponse[]>(
      `${this.apiUrl}/unread`
    );
  }


  /**
   * Get number of unread notifications.
   *
   * Example:
   * 3 unread notifications
   */
  getUnreadCount():
    Observable<number> {

    return this.http.get<number>(
      `${this.apiUrl}/unread/count`
    );
  }


  /**
   * Mark one notification as read.
   */
  markAsRead(
    id: number
  ): Observable<NotificationResponse> {

    return this.http.patch<NotificationResponse>(
      `${this.apiUrl}/${id}/read`,
      {}
    );
  }


  /**
   * Mark all notifications as read.
   */
  markAllAsRead():
    Observable<void> {

    return this.http.patch<void>(
      `${this.apiUrl}/read-all`,
      {}
    );
  }
}