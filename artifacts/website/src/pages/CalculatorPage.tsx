import { useState } from "react";
import { useListCalculatorRates } from "@workspace/api-client-react";
import PublicLayout from "@/components/PublicLayout";
import { Calculator } from "lucide-react";

function formatZAR(n: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2 }).format(n);
}

export default function CalculatorPage() {
  const { data: rates } = useListCalculatorRates();
  const [purchasePrice, setPurchasePrice] = useState<string>("");
  const [bondAmount, setBondAmount] = useState<string>("");

  const getRate = (type: string) => {
    const r = (rates ?? []).find(r => r.rateType === type);
    return r ? parseFloat(r.value) : 0;
  };

  const price = parseFloat(purchasePrice) || 0;
  const bond = parseFloat(bondAmount) || 0;
  const threshold = getRate("transfer_duty_threshold") || 1100000;

  // Transfer duty calculation (2024 SARS brackets simplified)
  let transferDuty = 0;
  if (price > threshold) {
    const r3 = getRate("transfer_duty_rate_3pct") || 0.03;
    const r6 = getRate("transfer_duty_rate_6pct") || 0.06;
    const bracket2End = 1512500;
    const bracket3End = 2117500;
    if (price <= bracket2End) {
      transferDuty = (price - threshold) * r3;
    } else if (price <= bracket3End) {
      transferDuty = (bracket2End - threshold) * r3 + (price - bracket2End) * r6;
    } else {
      transferDuty = (bracket2End - threshold) * r3 + (bracket3End - bracket2End) * r6 + (price - bracket3End) * 0.08;
    }
  }

  const conveyancingFee = price > 0 ? (getRate("conveyancing_base_fee") || 18000) + price * 0.003 : 0;
  const bondFee = bond > 0 ? (getRate("bond_registration_base") || 15000) + bond * 0.003 : 0;
  const totalTransfer = transferDuty + conveyancingFee;
  const totalBond = bondFee;
  const grandTotal = totalTransfer + totalBond;

  return (
    <PublicLayout>
      <section className="py-24 px-6 max-w-4xl mx-auto">
        <div className="mb-16">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Tools</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-calculator-title">Conveyancing Calculator</h1>
          <p className="text-[#B8B8B8] mt-6 max-w-2xl text-lg leading-relaxed">
            Get an estimate of your property transfer costs and bond registration fees. Rates are managed and updated by the firm.
          </p>
        </div>

        <div className="bg-[#151515] border border-[#2A2A2A] p-10 mb-10">
          <h2 className="text-xl font-serif text-[#F7F4EE] mb-8 flex items-center gap-3">
            <Calculator size={20} className="text-[#C6A15B]" /> Property Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3" htmlFor="purchase-price">
                Purchase Price (ZAR)
              </label>
              <input
                id="purchase-price"
                type="number"
                value={purchasePrice}
                onChange={e => setPurchasePrice(e.target.value)}
                placeholder="e.g. 2500000"
                data-testid="input-purchase-price"
                className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 text-lg focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-3" htmlFor="bond-amount">
                Bond Amount (ZAR) — optional
              </label>
              <input
                id="bond-amount"
                type="number"
                value={bondAmount}
                onChange={e => setBondAmount(e.target.value)}
                placeholder="e.g. 2000000"
                data-testid="input-bond-amount"
                className="w-full bg-[#0E0E0E] border border-[#2A2A2A] text-[#F7F4EE] px-4 py-4 text-lg focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {price > 0 && (
          <div className="bg-[#151515] border border-[#C6A15B]/30 p-10" data-testid="section-results">
            <h2 className="text-xl font-serif text-[#F7F4EE] mb-8">Estimated Cost Breakdown</h2>

            <div className="space-y-3 mb-8">
              <div className="flex justify-between py-3 border-b border-[#2A2A2A]">
                <span className="text-[#B8B8B8]">Transfer Duty (SARS)</span>
                <span className="text-[#F7F4EE] font-medium" data-testid="text-transfer-duty">{formatZAR(transferDuty)}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-[#2A2A2A]">
                <span className="text-[#B8B8B8]">Transfer Attorney Fee (est.)</span>
                <span className="text-[#F7F4EE] font-medium" data-testid="text-conveyancing-fee">{formatZAR(conveyancingFee)}</span>
              </div>
              {bond > 0 && (
                <div className="flex justify-between py-3 border-b border-[#2A2A2A]">
                  <span className="text-[#B8B8B8]">Bond Registration Fee (est.)</span>
                  <span className="text-[#F7F4EE] font-medium" data-testid="text-bond-fee">{formatZAR(bondFee)}</span>
                </div>
              )}
              <div className="flex justify-between py-4 pt-6">
                <span className="text-[#F7F4EE] font-semibold text-lg">Total Estimated Cost</span>
                <span className="text-[#C6A15B] font-bold text-xl" data-testid="text-total-cost">{formatZAR(grandTotal)}</span>
              </div>
            </div>

            <p className="text-[#B8B8B8] text-sm leading-relaxed border-t border-[#2A2A2A] pt-6">
              * This is an estimate only. Actual costs may vary based on transaction complexity, disbursements, and current SARS rates. 
              Contact us for a precise quote.
            </p>
          </div>
        )}

        <div className="mt-10 border border-[#2A2A2A] p-8 text-center">
          <h3 className="text-xl font-serif text-[#F7F4EE] mb-3">Need a Precise Quote?</h3>
          <p className="text-[#B8B8B8] text-sm mb-6">Our conveyancing team will provide a detailed cost estimate for your specific transaction.</p>
          <a href="mailto:nike@npinc.co.za" className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors" data-testid="link-contact-quote">
            Get a Quote
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
