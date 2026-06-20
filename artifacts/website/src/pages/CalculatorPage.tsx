import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import { Printer } from "lucide-react";

type Tab = "transfer" | "bond" | "repayment";

function fmt(n: number) {
  if (!n && n !== 0) return "R —";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

// ─── SARS Transfer Duty — effective 1 April 2025 (unchanged for 2026/27) ──────
function calcTransferDuty(price: number): number {
  if (price <= 1_210_000) return 0;
  if (price <= 1_663_800) return (price - 1_210_000) * 0.03;
  if (price <= 2_329_300) return 13_614 + (price - 1_663_800) * 0.06;
  if (price <= 2_994_800) return 53_544 + (price - 2_329_300) * 0.08;
  if (price <= 13_310_000) return 106_784 + (price - 2_994_800) * 0.11;
  return 1_241_456 + (price - 13_310_000) * 0.13;
}

// ─── Deeds Office Tariff (GN R.4447 — effective 1 April 2024) ────────────────
function calcDeedsOfficeFee(value: number): number {
  if (value <= 100_000) return 155;
  if (value <= 200_000) return 220;
  if (value <= 300_000) return 285;
  if (value <= 600_000) return 440;
  if (value <= 800_000) return 550;
  if (value <= 1_000_000) return 770;
  if (value <= 2_000_000) return 1_320;
  if (value <= 4_000_000) return 1_980;
  if (value <= 6_000_000) return 2_530;
  if (value <= 8_000_000) return 3_190;
  return 3_850;
}

// ─── LSSA Conveyancing Attorney Tariff — Transfer (2024, excl VAT) ───────────
function calcTransferAttorneyFee(price: number): number {
  if (price <= 0) return 0;
  if (price <= 100_000) return 6_640;
  if (price <= 300_000) return 6_640 + (price - 100_000) * 0.028;
  if (price <= 600_000) return 12_240 + (price - 300_000) * 0.022;
  if (price <= 1_000_000) return 18_840 + (price - 600_000) * 0.018;
  if (price <= 2_000_000) return 26_040 + (price - 1_000_000) * 0.014;
  if (price <= 4_000_000) return 40_040 + (price - 2_000_000) * 0.011;
  if (price <= 8_000_000) return 62_040 + (price - 4_000_000) * 0.008;
  return 94_040 + (price - 8_000_000) * 0.005;
}

// ─── LSSA Bond Registration Attorney Tariff (2024, excl VAT) ─────────────────
function calcBondAttorneyFee(bond: number): number {
  if (bond <= 0) return 0;
  if (bond <= 100_000) return 5_750;
  if (bond <= 300_000) return 5_750 + (bond - 100_000) * 0.025;
  if (bond <= 600_000) return 10_750 + (bond - 300_000) * 0.019;
  if (bond <= 1_000_000) return 16_450 + (bond - 600_000) * 0.016;
  if (bond <= 2_000_000) return 22_850 + (bond - 1_000_000) * 0.012;
  if (bond <= 4_000_000) return 34_850 + (bond - 2_000_000) * 0.009;
  if (bond <= 8_000_000) return 52_850 + (bond - 4_000_000) * 0.007;
  return 80_850 + (bond - 8_000_000) * 0.004;
}

const VAT = 0.15;

// ─── Transfer Cost Calculator ──────────────────────────────────────────────────
function TransferCalculator() {
  const [priceStr, setPriceStr] = useState("");
  const [result, setResult] = useState<null | {
    attorneyFee: number;
    postages: number;
    deedsOffice: number;
    electronicGen: number;
    fica: number;
    deedsSearches: number;
    ratesClearance: number;
    transferDuty: number;
    total: number;
    price: number;
  }>(null);

  function calculate() {
    const price = parseFloat(priceStr.replace(/[^\d.]/g, "")) || 0;
    if (!price) return;
    const attorneyFeeExVat = calcTransferAttorneyFee(price);
    const attorneyFee = attorneyFeeExVat * (1 + VAT);
    const postages = 2_500;
    const deedsOffice = calcDeedsOfficeFee(price);
    const electronicGen = 220;
    const fica = 500;
    const deedsSearches = 1_500;
    const ratesClearance = 2_500;
    const transferDuty = calcTransferDuty(price);
    const total = attorneyFee + postages + deedsOffice + electronicGen + fica + deedsSearches + ratesClearance + transferDuty;
    setResult({ attorneyFee, postages, deedsOffice, electronicGen, fica, deedsSearches, ratesClearance, transferDuty, total, price });
  }

  const rows = result ? [
    { label: "Transfer Attorney Fees", tip: "LSSA recommended tariff, incl 15% VAT", value: result.attorneyFee },
    { label: "Postages & Petties", tip: "Courier, postage & admin disbursements", value: result.postages },
    { label: "Deeds Office Fees", tip: "Government tariff — GN R.4447 (April 2024)", value: result.deedsOffice },
    { label: "Electronic Generation Fee", tip: "Deeds Office electronic document generation", value: result.electronicGen },
    { label: "FICA", tip: "Financial Intelligence Centre Act compliance", value: result.fica },
    { label: "Deeds Office Searches", tip: "Title deed, endorsements & rates searches", value: result.deedsSearches },
    { label: "Rates Clearance Fees", tip: "Municipality rates clearance certificate", value: result.ratesClearance },
    { label: "Transfer Duty", tip: "SARS tariff, effective 1 April 2025", value: result.transferDuty },
  ] : [];

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#F7F4EE] mb-1">Transfer Cost Calculator</h2>
      <p className="text-[#B8B8B8] text-sm mb-8">Calculate your approximate transfer costs together with estimated registration fees and transfer duty</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Transfer Details</h3>
          <div className="mb-6">
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Purchase Price</label>
            <div className="flex">
              <span className="bg-[#2A2A2A] border border-r-0 border-[#3A3A3A] text-[#B8B8B8] px-4 flex items-center text-sm">R</span>
              <input
                type="number"
                value={priceStr}
                onChange={e => setPriceStr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && calculate()}
                placeholder="0"
                data-testid="input-purchase-price"
                className="flex-1 bg-[#0E0E0E] border border-[#3A3A3A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button
            onClick={calculate}
            data-testid="button-calculate-transfer"
            className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors w-full mb-8"
          >
            Calculate
          </button>
          <div className="text-[#B8B8B8] text-xs leading-relaxed space-y-2">
            <p>Enter the value as required and click the 'Calculate' button.</p>
            <p>The costs of transferring ownership of property into your name comprise costs due to the government in the form of transfer duty, legal costs as well as a number of payments the attorneys have to make to obtain clearances.</p>
            <p className="text-[#C6A15B]/70">Please note that all values returned are quotation values subject to change. Although every effort has been made to ensure accuracy, Nike Pillay Inc accepts no liability in respect of any errors contained herein.</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Results</h3>
          {result ? (
            <>
              <div className="space-y-0">
                {rows.map(r => (
                  <div key={r.label} className="flex justify-between items-center py-3 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#B8B8B8] text-sm">{r.label}</span>
                      <span className="group relative cursor-default">
                        <span className="text-[#C6A15B]/50 text-xs border border-[#C6A15B]/30 rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
                        <span className="hidden group-hover:block absolute left-6 top-0 z-10 bg-[#0E0E0E] border border-[#2A2A2A] text-[#B8B8B8] text-xs p-2 w-48 leading-snug">{r.tip}</span>
                      </span>
                    </div>
                    <span className="text-[#F7F4EE] font-medium text-sm tabular-nums">{fmt(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-4 bg-[#C6A15B]/10 px-3 mt-2">
                  <span className="text-[#F7F4EE] font-semibold">Total Transfer Costs (incl VAT)</span>
                  <span className="text-[#C6A15B] font-bold text-lg tabular-nums" data-testid="text-total-transfer">{fmt(result.total)}</span>
                </div>
              </div>
              <p className="text-[#B8B8B8] text-xs mt-4 italic">Approximate transfer quotation for purchase price of {fmt(result.price)}</p>
              <button onClick={() => window.print()} className="mt-4 flex items-center gap-2 text-[#C6A15B] text-xs uppercase tracking-widest border border-[#C6A15B]/30 px-4 py-2 hover:border-[#C6A15B] transition-colors">
                <Printer size={12} /> Print / Save PDF
              </button>
            </>
          ) : (
            <div className="space-y-3">
              {["Transfer Attorney Fees", "Postages & Petties", "Deeds Office Fees", "Electronic Generation Fee", "FICA", "Deeds Office Searches", "Rates Clearance Fees", "Transfer Duty"].map(l => (
                <div key={l} className="flex justify-between py-3 border-b border-[#2A2A2A]">
                  <span className="text-[#B8B8B8] text-sm">{l}</span>
                  <span className="text-[#3A3A3A] text-sm">R</span>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-[#C6A15B]/5 px-3">
                <span className="text-[#F7F4EE] font-semibold text-sm">Total Transfer Costs (incl VAT)</span>
                <span className="text-[#3A3A3A] font-bold">R</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bond Cost Calculator ──────────────────────────────────────────────────────
function BondCalculator() {
  const [bondStr, setBondStr] = useState("");
  const [result, setResult] = useState<null | {
    attorneyFee: number;
    postages: number;
    deedsOffice: number;
    electronicGen: number;
    electronicInstruction: number;
    deedsSearches: number;
    total: number;
    bond: number;
  }>(null);

  function calculate() {
    const bond = parseFloat(bondStr.replace(/[^\d.]/g, "")) || 0;
    if (!bond) return;
    const attorneyFeeExVat = calcBondAttorneyFee(bond);
    const attorneyFee = attorneyFeeExVat * (1 + VAT);
    const postages = 2_000;
    const deedsOffice = calcDeedsOfficeFee(bond);
    const electronicGen = 220;
    const electronicInstruction = 175;
    const deedsSearches = 900;
    const total = attorneyFee + postages + deedsOffice + electronicGen + electronicInstruction + deedsSearches;
    setResult({ attorneyFee, postages, deedsOffice, electronicGen, electronicInstruction, deedsSearches, total, bond });
  }

  const rows = result ? [
    { label: "Bond Attorney Fee", tip: "LSSA recommended tariff, incl 15% VAT", value: result.attorneyFee },
    { label: "Postages & Petties", tip: "Courier, postage & admin disbursements", value: result.postages },
    { label: "Deeds Office Fees", tip: "Government tariff — GN R.4447 (April 2024)", value: result.deedsOffice },
    { label: "Electronic Generation Fee", tip: "Deeds Office electronic document generation", value: result.electronicGen },
    { label: "Electronic Instruction Fee", tip: "Bank electronic instruction processing fee", value: result.electronicInstruction },
    { label: "Deeds Office Searches", tip: "Deeds and bond searches", value: result.deedsSearches },
  ] : [];

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#F7F4EE] mb-1">Bond Cost Calculator</h2>
      <p className="text-[#B8B8B8] text-sm mb-8">Calculate your approximate bond costs when buying property</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Bond Details</h3>
          <div className="mb-6">
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Bond Amount</label>
            <div className="flex">
              <span className="bg-[#2A2A2A] border border-r-0 border-[#3A3A3A] text-[#B8B8B8] px-4 flex items-center text-sm">R</span>
              <input
                type="number"
                value={bondStr}
                onChange={e => setBondStr(e.target.value)}
                onKeyDown={e => e.key === "Enter" && calculate()}
                placeholder="0"
                data-testid="input-bond-amount"
                className="flex-1 bg-[#0E0E0E] border border-[#3A3A3A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <button
            onClick={calculate}
            data-testid="button-calculate-bond"
            className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors w-full mb-8"
          >
            Calculate
          </button>
          <div className="text-[#B8B8B8] text-xs leading-relaxed space-y-2">
            <p>Enter the value as required and click the 'Calculate' button.</p>
            <p>There are legal and administration costs in registering a bank loan to cover the balance of your purchase price. These costs are required upfront before registration can take place.</p>
            <p className="text-[#C6A15B]/70">Please note that all values returned are quotation values subject to change. Nike Pillay Inc accepts no liability in respect of any errors contained herein.</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Results</h3>
          {result ? (
            <>
              <div className="space-y-0">
                {rows.map(r => (
                  <div key={r.label} className="flex justify-between items-center py-3 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#B8B8B8] text-sm">{r.label}</span>
                      <span className="group relative cursor-default">
                        <span className="text-[#C6A15B]/50 text-xs border border-[#C6A15B]/30 rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
                        <span className="hidden group-hover:block absolute left-6 top-0 z-10 bg-[#0E0E0E] border border-[#2A2A2A] text-[#B8B8B8] text-xs p-2 w-48 leading-snug">{r.tip}</span>
                      </span>
                    </div>
                    <span className="text-[#F7F4EE] font-medium text-sm tabular-nums">{fmt(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-4 bg-[#C6A15B]/10 px-3 mt-2">
                  <span className="text-[#F7F4EE] font-semibold">Total Bond Costs (incl VAT)</span>
                  <span className="text-[#C6A15B] font-bold text-lg tabular-nums" data-testid="text-total-bond">{fmt(result.total)}</span>
                </div>
              </div>
              <p className="text-[#B8B8B8] text-xs mt-4 italic">Approximate bond cost quotation for bond of {fmt(result.bond)}</p>
              <button onClick={() => window.print()} className="mt-4 flex items-center gap-2 text-[#C6A15B] text-xs uppercase tracking-widest border border-[#C6A15B]/30 px-4 py-2 hover:border-[#C6A15B] transition-colors">
                <Printer size={12} /> Print / Save PDF
              </button>
            </>
          ) : (
            <div className="space-y-3">
              {["Bond Attorney Fee", "Postages & Petties", "Deeds Office Fees", "Electronic Generation Fee", "Electronic Instruction Fee", "Deeds Office Searches"].map(l => (
                <div key={l} className="flex justify-between py-3 border-b border-[#2A2A2A]">
                  <span className="text-[#B8B8B8] text-sm">{l}</span>
                  <span className="text-[#3A3A3A] text-sm">R</span>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-[#C6A15B]/5 px-3">
                <span className="text-[#F7F4EE] font-semibold text-sm">Total Bond Costs (incl VAT)</span>
                <span className="text-[#3A3A3A] font-bold">R</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bond Repayment Calculator ────────────────────────────────────────────────
const YEAR_OPTIONS = [5, 10, 20, 25, 30];

function RepaymentCalculator() {
  const [bondStr, setBondStr] = useState("");
  const [years, setYears] = useState(20);
  const [rateStr, setRateStr] = useState("11.25");
  const [result, setResult] = useState<null | {
    monthly: number;
    interestRepayment: number;
    totalRepayment: number;
  }>(null);

  function calculate() {
    const P = parseFloat(bondStr.replace(/[^\d.]/g, "")) || 0;
    const annualRate = parseFloat(rateStr) / 100;
    const r = annualRate / 12;
    const n = years * 12;
    if (!P || !r) return;
    const monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalRepayment = monthly * n;
    const interestRepayment = totalRepayment - P;
    setResult({ monthly, interestRepayment, totalRepayment });
  }

  return (
    <div>
      <h2 className="text-2xl font-serif text-[#F7F4EE] mb-1">Bond Repayment Calculator</h2>
      <p className="text-[#B8B8B8] text-sm mb-8">Calculate your approximate monthly bond payment, interest repayment, and total loan repayment</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Bond Details</h3>
          <div className="mb-5">
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Bond Amount</label>
            <div className="flex">
              <span className="bg-[#2A2A2A] border border-r-0 border-[#3A3A3A] text-[#B8B8B8] px-4 flex items-center text-sm">R</span>
              <input
                type="number"
                value={bondStr}
                onChange={e => setBondStr(e.target.value)}
                placeholder="0"
                className="flex-1 bg-[#0E0E0E] border border-[#3A3A3A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Years to Repay</label>
            <div className="flex gap-2">
              {YEAR_OPTIONS.map(y => (
                <button
                  key={y}
                  onClick={() => setYears(y)}
                  className={`flex-1 py-2 text-sm font-semibold border transition-colors ${
                    years === y
                      ? "bg-[#C6A15B] text-[#0E0E0E] border-[#C6A15B]"
                      : "bg-[#0E0E0E] text-[#B8B8B8] border-[#3A3A3A] hover:border-[#C6A15B] hover:text-[#C6A15B]"
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[#B8B8B8] text-xs uppercase tracking-widest mb-2">Interest Rate</label>
            <div className="flex">
              <span className="bg-[#2A2A2A] border border-r-0 border-[#3A3A3A] text-[#B8B8B8] px-4 flex items-center text-sm">%</span>
              <input
                type="number"
                step="0.25"
                value={rateStr}
                onChange={e => setRateStr(e.target.value)}
                className="flex-1 bg-[#0E0E0E] border border-[#3A3A3A] text-[#F7F4EE] px-4 py-3 focus:border-[#C6A15B] focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[#B8B8B8] text-xs mt-1">Current SA prime rate: 11.25%</p>
          </div>
          <button
            onClick={calculate}
            data-testid="button-calculate-repayment"
            className="bg-[#C6A15B] text-[#0E0E0E] px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors w-full mb-8"
          >
            Calculate
          </button>
          <div className="text-[#B8B8B8] text-xs leading-relaxed space-y-2">
            <p>Enter the values as required and click the 'Calculate' button.</p>
            <p>The bond repayment calculator will assist you in finding out what monthly expense you can expect on your bond.</p>
            <p className="text-[#C6A15B]/70">Please note that all values returned are quotation values subject to change. Nike Pillay Inc accepts no liability in respect of any errors contained herein.</p>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif text-[#F7F4EE] mb-6 pb-3 border-b border-[#2A2A2A]">Results</h3>
          {result ? (
            <>
              <div className="space-y-0">
                {[
                  { label: "Interest Repayment", tip: "Total interest paid over the loan term", value: result.interestRepayment },
                  { label: "Total Loan Repayment", tip: "Principal + total interest", value: result.totalRepayment },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-3 border-b border-[#2A2A2A]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#B8B8B8] text-sm">{r.label}</span>
                      <span className="group relative cursor-default">
                        <span className="text-[#C6A15B]/50 text-xs border border-[#C6A15B]/30 rounded-full w-4 h-4 inline-flex items-center justify-center">i</span>
                        <span className="hidden group-hover:block absolute left-6 top-0 z-10 bg-[#0E0E0E] border border-[#2A2A2A] text-[#B8B8B8] text-xs p-2 w-48 leading-snug">{r.tip}</span>
                      </span>
                    </div>
                    <span className="text-[#F7F4EE] font-medium text-sm tabular-nums">{fmt(r.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-4 bg-[#C6A15B]/10 px-3 mt-2">
                  <span className="text-[#F7F4EE] font-semibold">Total Monthly Cost</span>
                  <span className="text-[#C6A15B] font-bold text-lg tabular-nums" data-testid="text-monthly-repayment">{fmt(result.monthly)}</span>
                </div>
              </div>
              <button onClick={() => window.print()} className="mt-4 flex items-center gap-2 text-[#C6A15B] text-xs uppercase tracking-widest border border-[#C6A15B]/30 px-4 py-2 hover:border-[#C6A15B] transition-colors">
                <Printer size={12} /> Print / Save PDF
              </button>
            </>
          ) : (
            <div className="space-y-3">
              {["Interest Repayment", "Total Loan Repayment"].map(l => (
                <div key={l} className="flex justify-between py-3 border-b border-[#2A2A2A]">
                  <span className="text-[#B8B8B8] text-sm">{l}</span>
                  <span className="text-[#3A3A3A] text-sm">R</span>
                </div>
              ))}
              <div className="flex justify-between py-4 bg-[#C6A15B]/5 px-3">
                <span className="text-[#F7F4EE] font-semibold text-sm">Total Monthly Cost</span>
                <span className="text-[#3A3A3A] font-bold">R</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalculatorPage() {
  const [tab, setTab] = useState<Tab>("transfer");

  const tabs: { id: Tab; label: string }[] = [
    { id: "transfer", label: "Transfer Cost Calculator" },
    { id: "bond", label: "Bond Cost Calculator" },
    { id: "repayment", label: "Bond Repayment Calculator" },
  ];

  return (
    <PublicLayout>
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#C6A15B] text-xs uppercase tracking-[0.25em] mb-4">Tools</p>
          <h1 className="text-5xl md:text-6xl font-serif text-[#F7F4EE]" data-testid="text-calculator-title">Calculators</h1>
          <p className="text-[#B8B8B8] mt-4 max-w-2xl text-lg leading-relaxed">
            Estimate your property transfer costs, bond registration fees, and monthly repayments. Rates sourced from SARS and the Deeds Office.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex border-b border-[#2A2A2A] mb-10 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className={`px-6 py-4 text-xs uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors -mb-px ${
                tab === t.id
                  ? "border-[#C6A15B] text-[#C6A15B]"
                  : "border-transparent text-[#B8B8B8] hover:text-[#F7F4EE]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="bg-[#151515] border border-[#2A2A2A] p-8 md:p-12">
          {tab === "transfer" && <TransferCalculator />}
          {tab === "bond" && <BondCalculator />}
          {tab === "repayment" && <RepaymentCalculator />}
        </div>

        {/* Rate sources */}
        <div className="mt-6 text-[#B8B8B8] text-xs leading-relaxed border border-[#2A2A2A] p-6">
          <p className="font-semibold text-[#F7F4EE] mb-2">Rate Sources</p>
          <ul className="space-y-1">
            <li>• Transfer Duty: SARS official tariff, effective 1 April 2025 (confirmed unchanged for 2026/27)</li>
            <li>• Deeds Office Fees: Government Notice GN R.4447, Government Gazette No. 50239, effective 1 April 2024</li>
            <li>• Attorney Fees: Based on LSSA recommended conveyancing tariff (2024), incl. 15% VAT</li>
            <li>• Bond Repayment: Standard amortisation formula at the specified interest rate</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-8 border border-[#2A2A2A] p-8 text-center">
          <h3 className="text-xl font-serif text-[#F7F4EE] mb-3">Need a Precise Quote?</h3>
          <p className="text-[#B8B8B8] text-sm mb-6">Our conveyancing team will provide a detailed cost estimate for your specific transaction.</p>
          <a
            href="mailto:nike@npinc.co.za"
            className="inline-flex items-center gap-3 bg-[#C6A15B] text-[#0E0E0E] px-8 py-4 text-sm font-semibold uppercase tracking-widest hover:bg-[#9F7E3F] transition-colors"
            data-testid="link-contact-quote"
          >
            Get a Quote
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}
