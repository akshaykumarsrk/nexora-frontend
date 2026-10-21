/**
 * Notification received from the Nexora backend.
 *
 * This matches:
 * NotificationResponse.java
 */
export interface NotificationResponse {

  id: number;

  title: string;

  message: string;

  type: string;

  referenceType: string | null;

  referenceId: number | null;

  read: boolean;

  createdAt: string;
}