"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { fetchOrderStatus } from "@/lib/api";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface PaymentPanelProps {
  orderNumber: string;
  paymentMethod: "CARD" | "MOBILE_MONEY" | "ORANGE_MONEY";
  stripeClientSecret?: string;
  paymentUrl?: string;
  onSettled: (status: "PAID" | "FAILED") => void;
}

export function PaymentPanel({ orderNumber, paymentMethod, stripeClientSecret, paymentUrl, onSettled }: PaymentPanelProps) {
  if (paymentMethod === "CARD" && stripeClientSecret && stripePromise) {
    return (
      <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
        <StripeCardForm onSettled={onSettled} />
      </Elements>
    );
  }

  if (paymentMethod === "ORANGE_MONEY" && paymentUrl) {
    return <RedirectPaymentPanel orderNumber={orderNumber} paymentUrl={paymentUrl} label="Payer avec Orange Money" onSettled={onSettled} />;
  }

  return <PollingPaymentPanel orderNumber={orderNumber} message="Confirmez le paiement Mobile Money sur votre téléphone." onSettled={onSettled} />;
}

function StripeCardForm({ onSettled }: { onSettled: (status: "PAID" | "FAILED") => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function confirmPayment() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError("");

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required"
    });

    if (confirmError) {
      setError(confirmError.message ?? "Le paiement a échoué.");
      onSettled("FAILED");
    } else if (paymentIntent?.status === "succeeded") {
      onSettled("PAID");
    }

    setSubmitting(false);
  }

  return (
    <div className="grid gap-4">
      <PaymentElement />
      {error ? <p className="text-sm font-bold text-red-400">{error}</p> : null}
      <button
        type="button"
        disabled={!stripe || submitting}
        onClick={() => void confirmPayment()}
        className="rounded-full bg-gradient-to-r from-buyCyan to-buyBlue px-6 py-3 font-black text-void transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Traitement..." : "Payer par carte"}
      </button>
    </div>
  );
}

function RedirectPaymentPanel({
  orderNumber,
  paymentUrl,
  label,
  onSettled
}: {
  orderNumber: string;
  paymentUrl: string;
  label: string;
  onSettled: (status: "PAID" | "FAILED") => void;
}) {
  usePollOrderStatus(orderNumber, onSettled);

  return (
    <div className="grid gap-4">
      <p className="text-sm text-textMuted">Finalisez votre paiement dans l'onglet qui s'ouvre. Cette page se met à jour automatiquement.</p>
      <a
        href={paymentUrl}
        target="_blank"
        rel="noreferrer"
        className="rounded-full bg-serviceOrange px-6 py-3 text-center font-black text-white transition"
      >
        {label}
      </a>
    </div>
  );
}

function PollingPaymentPanel({
  orderNumber,
  message,
  onSettled
}: {
  orderNumber: string;
  message: string;
  onSettled: (status: "PAID" | "FAILED") => void;
}) {
  usePollOrderStatus(orderNumber, onSettled);
  return <p className="text-sm text-textMuted">{message}</p>;
}

function usePollOrderStatus(orderNumber: string, onSettled: (status: "PAID" | "FAILED") => void) {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { status } = await fetchOrderStatus(orderNumber);
        if (status === "PAID" || status === "FAILED") {
          onSettled(status);
          clearInterval(interval);
        }
      } catch {
        // Keep polling; a transient network error should not stop the flow.
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderNumber, onSettled]);
}
