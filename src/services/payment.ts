/**
 * Payment Service Abstraction
 * 
 * Decouples course enrollment logic from payment implementation.
 * Current: MockPaymentProvider
 * Future: RazorpayPaymentProvider
 * 
 * Course activation only happens after backend-verified payment.
 * Never trust payment success from the frontend alone.
 */

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  studentId: string;
  courseId: string;
  planId: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId: string;
  providerPaymentId?: string;
  providerOrderId?: string;
  providerSignature?: string;
  error?: string;
}

export interface PaymentVerification {
  verified: boolean;
  transactionId: string;
  error?: string;
}

/**
 * Abstract payment provider interface.
 * All payment providers must implement these methods.
 */
export interface PaymentProvider {
  /** Provider name for audit trail */
  readonly name: string;

  /** Create a payment order (server-side in production) */
  createOrder(params: {
    amount: number;
    currency: string;
    studentId: string;
    courseId: string;
    planId: string;
  }): Promise<PaymentOrder>;

  /** Process payment (client-side interaction) */
  processPayment(order: PaymentOrder): Promise<PaymentResult>;

  /** Verify payment (MUST be server-side in production) */
  verifyPayment(result: PaymentResult): Promise<PaymentVerification>;
}

/**
 * Mock Payment Provider
 * Simulates payment flow for development.
 * Designed to match the same interface that Razorpay will use.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async createOrder(params: {
    amount: number;
    currency: string;
    studentId: string;
    courseId: string;
    planId: string;
  }): Promise<PaymentOrder> {
    // Simulate server-side order creation
    const orderId = `MOCK_ORD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    return {
      orderId,
      amount: params.amount,
      currency: params.currency,
      studentId: params.studentId,
      courseId: params.courseId,
      planId: params.planId,
    };
  }

  async processPayment(order: PaymentOrder): Promise<PaymentResult> {
    // Simulate payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock: 90% success rate
    const success = Math.random() > 0.1;

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    if (success) {
      return {
        success: true,
        transactionId,
        providerPaymentId: `MOCK_PAY_${Date.now()}`,
        providerOrderId: order.orderId,
      };
    }

    return {
      success: false,
      transactionId,
      error: "Payment was declined. Please try again.",
    };
  }

  async verifyPayment(result: PaymentResult): Promise<PaymentVerification> {
    // In production Razorpay: verify signature on backend
    // Mock: trust the result (this is the ONLY provider that does this)
    return {
      verified: result.success,
      transactionId: result.transactionId,
      error: result.success ? undefined : "Payment verification failed",
    };
  }
}

/**
 * Future Razorpay Provider Template
 * 
 * Integration flow:
 * Frontend → Backend create order → Razorpay → Razorpay callback/webhook
 * → Backend signature verification → Payment SUCCESS → Enrollment activation
 * 
 * NEVER put Razorpay secret keys in the frontend.
 */
// export class RazorpayPaymentProvider implements PaymentProvider {
//   readonly name = "razorpay";
//   
//   async createOrder(params) {
//     // Call Spring Boot API to create Razorpay order
//     // Backend uses RAZORPAY_KEY_SECRET (server-side only)
//   }
//   
//   async processPayment(order) {
//     // Open Razorpay checkout modal
//     // Return handler result
//   }
//   
//   async verifyPayment(result) {
//     // Call Spring Boot API (/api/v1/payments/verify) to verify signature
//     // Backend verifies razorpay_signature using secret
//   }
// }

// ============================================================
// Payment Service — Use this in application code
// ============================================================

let currentProvider: PaymentProvider = new MockPaymentProvider();

export function setPaymentProvider(provider: PaymentProvider) {
  currentProvider = provider;
}

export function getPaymentProvider(): PaymentProvider {
  return currentProvider;
}
