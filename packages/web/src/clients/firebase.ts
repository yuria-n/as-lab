import { FirebaseAnalytics } from '@firebase/analytics-types';
import { FirebaseAuth } from '@firebase/auth-types';
import { FirebaseFirestore } from '@firebase/firestore-types';

export class Firebase {
  private static delay = 1000;
  private static retryCount = 0;
  static get firebase(): any {
    return (window as any).firebase;
  }

  static async analytics(): Promise<FirebaseAnalytics> {
    return this.retry(async () => this.firebase.analytics());
  }

  static async auth(): Promise<FirebaseAuth> {
    return this.retry(async () => this.firebase.auth());
  }

  static async firestore(): Promise<FirebaseFirestore> {
    return this.retry(async () => this.firebase.firestore());
  }

  private static async retry<T>(handler: () => Promise<T>): Promise<T> {
    try {
      return await handler();
    } catch (err) {
      console.debug(err);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(handler());
        }, ++this.retryCount * this.delay);
      });
    }
  }
}
