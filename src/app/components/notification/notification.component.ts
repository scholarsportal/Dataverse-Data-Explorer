import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, take, timer } from 'rxjs';

@Component({
    selector: 'dct-notification',
    templateUrl: './notification.component.html',
    styleUrls: ['./notification.component.css'],
    standalone: true,
})
export class NotificationComponent {
  notificationSubscription: Subscription | undefined;

  constructor(private store: Store) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  // Function to remove a specific notification by index
  removeNotification(index: number): void {}

  // Function to automatically remove the latest notification
  autoRemoveNotification(): void {}
}
