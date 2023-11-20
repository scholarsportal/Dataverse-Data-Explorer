import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, take, timer } from 'rxjs';
import { removeNotification } from 'src/state/actions';
import { State } from 'src/state/reducers';
import { selectNotifications } from 'src/state/selectors';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent {
notifications$ = this.store.select(selectNotifications);
  notificationSubscription: Subscription | undefined;

  constructor(private store: Store<State>) { }

  ngOnInit(): void {
    this.notificationSubscription = this.notifications$.subscribe((notifications: any) => {
      // Show the notifications
      // Logic to display notifications in the UI

      // Automatically clear notifications after 2 seconds
      timer(2000)
        .pipe(take(1))
        .subscribe(() => {
          this.autoRemoveNotification(); // Function to automatically remove the notification
        });
    });
  }

  ngOnDestroy(): void {
    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  // Function to remove a specific notification by index
  removeNotification(index: number): void {
    this.store.dispatch(removeNotification({ index }));
  }

  // Function to automatically remove the latest notification
  autoRemoveNotification(): void {
    const latestNotificationIndex = 0; // Replace this logic to get the index of the latest notification
    this.store.dispatch(removeNotification({ index: latestNotificationIndex }));
  }
}
