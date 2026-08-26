/**
 * Notification Service Abstraction
 * InAppNotificationProvider (centralized store)
 * Future: EmailNotificationProvider (Resend/SendGrid/etc.)
 * 
 * Business logic calls NotificationService.send() — never ties directly
 * to a specific provider.
 */

import { dataStore } from "@/lib/store";
import type { NotificationType } from "@/lib/constants";

export interface NotificationPayload {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  metadata?: Record<string, unknown>;
}

export interface NotificationProvider {
  readonly name: string;
  send(payload: NotificationPayload): Promise<{ error: Error | null }>;
}

/**
 * In-App Notification Provider
 * Stores notifications in local state/store.
 */
class InAppNotificationProvider implements NotificationProvider {
  readonly name = "in-app";

  async send(payload: NotificationPayload): Promise<{ error: Error | null }> {
    try {
      dataStore.createNotification({
        user_id: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
      });
      return { error: null };
    } catch (e: any) {
      return { error: e };
    }
  }
}

// ============================================================
// Notification Service — Use this in application code
// ============================================================

class NotificationService {
  private providers: NotificationProvider[] = [];

  addProvider(provider: NotificationProvider) {
    this.providers.push(provider);
  }

  async send(payload: NotificationPayload): Promise<void> {
    const results = await Promise.allSettled(
      this.providers.map((provider) => provider.send(payload))
    );

    for (const result of results) {
      if (result.status === "rejected") {
        console.error("Notification delivery failed:", result.reason);
      }
    }
  }

  async sendBulk(payloads: NotificationPayload[]): Promise<void> {
    await Promise.allSettled(payloads.map((p) => this.send(p)));
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Register default provider
notificationService.addProvider(new InAppNotificationProvider());
