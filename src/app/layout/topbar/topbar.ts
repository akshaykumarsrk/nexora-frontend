import {
  Component,
  OnDestroy,
  OnInit,
  output,
  signal,
  computed
} from '@angular/core';

import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { Popover } from 'primeng/popover';

import { interval, Subscription } from 'rxjs';

import { Theme } from '../../core/services/theme';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';

import { NotificationResponse } from '../../core/models/notification';
import { NAVIGATION_ITEMS } from '../navigation/navigation.config';


@Component({
  selector: 'app-topbar',

  imports: [Popover],

  templateUrl: './topbar.html',

  styleUrl: './topbar.css'
})
export class Topbar implements OnInit, OnDestroy {

  // =========================================================
  // MOBILE SIDEBAR
  // =========================================================

  /**
   * Emits when the user clicks the mobile/tablet
   * sidebar menu button.
   *
   * Flow:
   *
   * User clicks menu
   *        ↓
   * Topbar emits menuClicked
   *        ↓
   * Shell receives event
   *        ↓
   * Shell toggles sidebar
   */
  readonly menuClicked = output<void>();


  // =========================================================
  // NOTIFICATIONS
  // =========================================================

  readonly notifications =
    signal<NotificationResponse[]>([]);

  readonly unreadCount =
    signal<number>(0);

  readonly notificationsLoading =
    signal<boolean>(false);

  private notificationRefreshSubscription?: Subscription;
  private routeSubscription?: Subscription;
  readonly currentPage = signal('Dashboard');
  readonly searchQuery = signal('');
  readonly searchItems = computed(() => {
    const role = this.authService.getRole();
    let items = NAVIGATION_ITEMS;
    if (role === 'TECHNICIAN') {
      items = items.filter(item => ['/dashboard', '/notifications', '/ai-assistant'].includes(item.route))
        .map(item => item.route === '/dashboard' ? { ...item, route: '/technician-dashboard', label: 'My Technician Dashboard' } : item);
    } else if (role === 'STAFF') {
      items = items.filter(item => !['/employees', '/technicians', '/settings/branding', '/payments'].includes(item.route));
    } else if (role === 'MANAGER') {
      items = items.filter(item => item.route !== '/settings/branding');
    }
    const extra = role === 'TECHNICIAN' ? [{ label: 'My Job Cards', icon: 'pi pi-briefcase', route: '/job-cards' }] : [
      { label: 'Settings', icon: 'pi pi-cog', route: '/settings' },
      { label: 'Job Cards', icon: 'pi pi-briefcase', route: '/job-cards' }
    ];
    const all = [...items, ...extra];
    const query = this.searchQuery().trim().toLowerCase();
    return query ? all.filter(item => item.label.toLowerCase().includes(query)) : all;
  });


  // =========================================================
  // PROFILE MENU NAVIGATION
  // =========================================================

  openProfileRoute(route: string, popover: Popover): void {
    popover.hide();
    void this.router.navigateByUrl(route);
  }

  logoutFromProfile(popover: Popover): void {
    popover.hide();
    this.logout();
  }


  // =========================================================
  // CONSTRUCTOR
  // =========================================================

  constructor(
    readonly theme: Theme,
    readonly authService: AuthService,
    readonly router: Router,
    private readonly notificationService: NotificationService
  ) {}


  // =========================================================
  // INITIALIZATION
  // =========================================================

  ngOnInit(): void {

    this.updateCurrentPage(this.router.url);
    this.routeSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(event => this.updateCurrentPage(event.urlAfterRedirects));

    this.loadNotifications();

    /*
     * Refresh notifications every 10 seconds.
     */
    this.notificationRefreshSubscription =
      interval(10000).subscribe(() => {
        this.loadNotifications();
      });
  }


  ngOnDestroy(): void {

    this.notificationRefreshSubscription?.unsubscribe();
    this.routeSubscription?.unsubscribe();

  }


  displayName(): string {
    const username = this.authService.getUsername();
    if (!username) return 'Account';
    const localPart = username.includes('@') ? username.split('@')[0] : username;
    return localPart.replace(/[._-]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  }

  displayRole(): string {
    return this.authService.getRole() ?? 'USER';
  }

  avatarInitial(): string {
    return this.displayName().trim().charAt(0).toUpperCase() || 'U';
  }

  private updateCurrentPage(url: string): void {
    const path = url.split('?')[0].split('#')[0];
    const labels: Record<string, string> = {
      '/dashboard': 'Dashboard', '/employees': 'Employees', '/customers': 'Customers',
      '/sites': 'Sites', '/assets': 'Assets', '/technicians': 'Technicians',
      '/service-requests': 'Service Requests', '/jobs': 'Jobs', '/job-cards': 'Job Cards',
      '/parts': 'Parts', '/inventory': 'Inventory', '/stock-movements': 'Stock Movements',
      '/catalog': 'Brands & Models', '/invoices': 'Invoices', '/payments': 'Payments',
      '/settings': 'Settings', '/profile': 'My Profile', '/settings/branding': 'Organization Branding',
      '/notifications': 'Notifications', '/ai-assistant': 'AI Technician Assistant'
    };
    const match = Object.keys(labels).sort((a, b) => b.length - a.length).find(key => path === key || path.startsWith(`${key}/`));
    this.currentPage.set(match ? labels[match] : 'Workspace');
  }

  // =========================================================
  // LOAD NOTIFICATIONS
  // =========================================================

  loadNotifications(): void {

    this.notificationsLoading.set(true);

    this.notificationService
      .getAllNotifications()
      .subscribe({

        next: (
          notifications: NotificationResponse[]
        ) => {

          this.notifications.set(
            notifications
          );

          const unread =
            notifications.filter(
              notification => !notification.read
            ).length;

          this.unreadCount.set(unread);

          this.notificationsLoading.set(false);
        },

        error: (error: unknown) => {

          console.error(
            'Error loading notifications:',
            error
          );

          this.notifications.set([]);

          this.unreadCount.set(0);

          this.notificationsLoading.set(false);
        }

      });
  }


  // =========================================================
  // MARK ONE AS READ
  // =========================================================

  markNotificationAsRead(
    notification: NotificationResponse
  ): void {

    if (notification.read) {
      return;
    }

    this.notificationService
      .markAsRead(notification.id)
      .subscribe({

        next: (
          updatedNotification: NotificationResponse
        ) => {

          this.notifications.update(
            notifications =>
              notifications.map(
                item =>
                  item.id === updatedNotification.id
                    ? updatedNotification
                    : item
              )
          );

          this.unreadCount.update(
            count => Math.max(0, count - 1)
          );
        },

        error: (error: unknown) => {

          console.error(
            'Error marking notification as read:',
            error
          );
        }

      });
  }


  // =========================================================
  // MARK ALL AS READ
  // =========================================================

  markAllAsRead(): void {

    this.notificationService
      .markAllAsRead()
      .subscribe({

        next: () => {

          this.notifications.update(
            notifications =>
              notifications.map(
                notification => ({
                  ...notification,
                  read: true
                })
              )
          );

          this.unreadCount.set(0);
        },

        error: (error: unknown) => {

          console.error(
            'Error marking all notifications as read:',
            error
          );
        }

      });
  }


  // =========================================================
  // NOTIFICATION ICON
  // =========================================================

  getNotificationIcon(
    type: string
  ): string {

    switch (type.toUpperCase()) {

      case 'SUCCESS':
        return 'pi pi-check-circle';

      case 'WARNING':
        return 'pi pi-exclamation-triangle';

      case 'ERROR':
        return 'pi pi-times-circle';

      case 'JOB':
      case 'JOB_CREATED':
      case 'JOB_ASSIGNED':
      case 'JOB_SCHEDULED':
      case 'JOB_STARTED':
      case 'JOB_COMPLETED':
      case 'JOB_CANCELLED':
        return 'pi pi-briefcase';

      case 'PAYMENT':
        return 'pi pi-wallet';

      case 'CUSTOMER':
        return 'pi pi-user';

      default:
        return 'pi pi-bell';
    }
  }


  // =========================================================
  // NOTIFICATION TYPE CLASS
  // =========================================================

  getNotificationTypeClass(
    type: string
  ): string {

    switch (type.toUpperCase()) {

      case 'SUCCESS':
        return 'notification-success';

      case 'WARNING':
        return 'notification-warning';

      case 'ERROR':
        return 'notification-error';

      case 'PAYMENT':
        return 'notification-payment';

      case 'CUSTOMER':
        return 'notification-customer';

      case 'JOB':
      case 'JOB_CREATED':
      case 'JOB_ASSIGNED':
      case 'JOB_SCHEDULED':
      case 'JOB_STARTED':
      case 'JOB_COMPLETED':
      case 'JOB_CANCELLED':
        return 'notification-job';

      default:
        return 'notification-default';
    }
  }


  // =========================================================
  // DATE FORMAT
  // =========================================================

  formatNotificationDate(
    createdAt: string
  ): string {

    const date = new Date(createdAt);

    return date.toLocaleString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }
    );
  }


  // =========================================================
  // NOTIFICATION CLICK
  // =========================================================

  handleNotificationClick(
    notification: NotificationResponse,
    notificationPopover: Popover
  ): void {

    /*
     * Mark as read first.
     */
    if (!notification.read) {
      this.markNotificationAsRead(notification);
    }

    /*
     * Close popup.
     */
    notificationPopover.hide();

    /*
     * Navigate according to reference.
     */
    if (
      notification.referenceType &&
      notification.referenceId
    ) {

      switch (
        notification.referenceType.toUpperCase()
      ) {

        case 'JOB':
          this.router.navigate(['/jobs', notification.referenceId]);
          break;
        case 'SERVICE_REQUEST':
        case 'SERVICEREQUEST':
          this.router.navigate(['/service-requests', notification.referenceId]);
          break;
        case 'INVOICE':
          this.router.navigate(['/invoices', notification.referenceId]);
          break;
        case 'PAYMENT':
          this.router.navigate(['/payments']);
          break;
        case 'CUSTOMER':
          this.router.navigate(['/customers', notification.referenceId]);
          break;
        case 'SITE':
          this.router.navigate(['/sites', notification.referenceId]);
          break;
        case 'ASSET':
          this.router.navigate(['/assets', notification.referenceId]);
          break;
        case 'PART':
          this.router.navigate(['/parts', notification.referenceId]);
          break;
        case 'INVENTORY':
          this.router.navigate(['/inventory', notification.referenceId]);
          break;
        default:
          this.router.navigate(['/notifications']);
          break;
      }
    }
  }


  // =========================================================
  // OPEN NOTIFICATIONS
  // =========================================================

  openNotifications(
    event: Event,
    popover: Popover
  ): void {

    this.loadNotifications();

    popover.toggle(event);
  }

  openHelp(event: Event, popover: Popover): void {
    popover.toggle(event);
  }

  openSearch(event: Event, popover: Popover): void {
    this.searchQuery.set('');
    popover.toggle(event);
  }

  navigateFromSearch(path: string, popover: Popover): void {
    popover.hide();
    void this.router.navigate([path]);
  }

  openHelpRoute(path: string, popover: Popover): void {
    popover.hide();
    void this.router.navigate([path]);
  }


  // =========================================================
  // LOGOUT
  // =========================================================

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);
  }

}