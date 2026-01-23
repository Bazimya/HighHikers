import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  eventTitle: string;
  amount: number;
  currency: string;
  onSuccess?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  eventId,
  eventTitle,
  amount,
  currency,
  onSuccess,
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">(
    "confirm"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const createPaymentMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payments/create-intent", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Payment setup failed");
      }
      return res.json();
    },
    onSuccess: (data) => {
      // In a real app, you'd open Stripe checkout or embed payment form
      // For now, we'll simulate the payment process
      setStep("processing");
      handlePaymentConfirmation(data.paymentId, data.clientSecret);
    },
    onError: (error) => {
      setStep("error");
      setErrorMessage(error.message);
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: async (
      paymentData: { paymentId: string; paymentIntentId: string }
    ) => {
      const res = await fetch("/api/payments/confirm", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Payment confirmation failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setStep("success");
      setTimeout(() => {
        toast({
          title: "Payment Successful!",
          description: `You are now registered for ${eventTitle}`,
        });
        onOpenChange(false);
        setStep("confirm");
        onSuccess?.();
      }, 2000);
    },
    onError: (error) => {
      setStep("error");
      setErrorMessage(error.message);
    },
  });

  const handlePaymentConfirmation = (paymentId: string, paymentIntentId: string) => {
    // Simulate Stripe payment processing
    setTimeout(() => {
      confirmPaymentMutation.mutate({
        paymentId,
        paymentIntentId,
      });
    }, 1500);
  };

  const handleInitiatePayment = () => {
    createPaymentMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Registration Payment</DialogTitle>
          <DialogDescription>
            Register for {eventTitle}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Amount Summary */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">Event:</span>
              <span className="font-medium">{eventTitle}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
              <span>Total:</span>
              <span>
                {amount.toLocaleString()} {currency}
              </span>
            </div>
          </div>

          {/* Confirm Step */}
          {step === "confirm" && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Click below to proceed with payment. You'll be securely processed through Stripe.
                </AlertDescription>
              </Alert>
              <Button
                onClick={handleInitiatePayment}
                disabled={createPaymentMutation.isPending}
                className="w-full"
                size="lg"
              >
                {createPaymentMutation.isPending ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Setting up payment...
                  </>
                ) : (
                  `Pay ${amount.toLocaleString()} ${currency}`
                )}
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader className="h-8 w-8 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Processing your payment...
              </p>
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <p className="text-center font-medium">
                Payment successful! You're registered for the event.
              </p>
            </div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
              <Button
                onClick={() => {
                  setStep("confirm");
                  setErrorMessage("");
                }}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
