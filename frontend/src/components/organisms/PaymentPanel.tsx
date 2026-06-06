import { PaymentResult } from "@/lib/types";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

interface PaymentPanelProps {
  orderId: string;
  amount: string;
  method: string;
  result?: PaymentResult;
  onOrderChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onMethodChange: (value: string) => void;
  onSubmit: () => void;
}

// Renders the payment panel section.
export function PaymentPanel({
  orderId,
  amount,
  method,
  result,
  onOrderChange,
  onAmountChange,
  onMethodChange,
  onSubmit,
}: PaymentPanelProps) {
  return (
    <section className="panel stack">
      <div>
        <h2 className="section-title">Payment (Simulated)</h2>
        <p className="muted">Record an instalment or full payment. No gateway required.</p>
      </div>
      <div className="row">
        <Input label="Order ID" value={orderId} onChange={(event) => onOrderChange(event.target.value)} />
        <Input
          label="Amount"
          type="number"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
        />
        <Input label="Method" value={method} onChange={(event) => onMethodChange(event.target.value)} />
      </div>
      <Button type="button" onClick={onSubmit}>
        Process Payment
      </Button>
      {result ? (
        <div className="banner">
          {result.payment.message} Remaining: $ {result.remainingBalance.toFixed(2)}
        </div>
      ) : null}
    </section>
  );
}
