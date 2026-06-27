import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Check, 
  Copy, 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  FileText, 
  X, 
  CheckCircle2, 
  FileDown, 
  Home, 
  LayoutDashboard,
  Coins
} from 'lucide-react';
import { Course, Ebook, Enrollment } from '../types';
import { createStudentEnrollment } from '../data/dbSync';

interface CheckoutProps {
  isOpen: boolean;
  onClose: () => void;
  item: Course | Ebook;
  itemType: 'course' | 'ebook';
  settings: any;
  onEnrollSuccess: (name: string, email: string, phone: string) => void;
}

const DISTRICTS = [
  'Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Mymensingh',
  'Comilla', 'Narayanganj', 'Gazipur', 'Cox\'s Bazar', 'Bogura', 'Jessore', 'Feni', 'Noakhali'
];

export default function Checkout({
  isOpen,
  onClose,
  item,
  itemType,
  settings,
  onEnrollSuccess
}: CheckoutProps) {
  const [step, setStep] = useState<number>(1);
  
  // Step 1 Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [district, setDistrict] = useState('Dhaka');
  const [notes, setNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discount, setDiscount] = useState<number>(0); // BDT amount

  // Step 2 Form States
  const [selectedMethod, setSelectedMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Upay'>('bKash');

  // Step 3 Form States
  const [transactionId, setTransactionId] = useState('');
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [senderNumber, setSenderNumber] = useState('');
  const [screenshot, setScreenshot] = useState<string>('');
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [confirmedPayment, setConfirmedPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Step 4 Success States
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [copiedTxId, setCopiedTxId] = useState(false);

  if (!isOpen) return null;

  const originalPrice = item.price;
  const currentTotal = Math.max(0, originalPrice - discount);

  // Handle Coupon Application
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'SAVE10' || code === 'PIXEL10') {
      const discAmt = Math.round(originalPrice * 0.1);
      setDiscount(discAmt);
      setAppliedCoupon(code);
      setErrorMsg('');
    } else if (code === 'PIXEL50') {
      const discAmt = Math.round(originalPrice * 0.5);
      setDiscount(discAmt);
      setAppliedCoupon(code);
      setErrorMsg('');
    } else if (code === 'FREE100' || code === 'DEVELOPER') {
      setDiscount(originalPrice);
      setAppliedCoupon(code);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Coupon Code! Try SAVE10, PIXEL50 or DEVELOPER');
      setDiscount(0);
      setAppliedCoupon(null);
    }
  };

  // Helper to copy text to clipboard
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(true);
    setTimeout(() => setCopiedTxId(false), 2000);
  };

  // Get agent number depending on payment method
  const getMerchantNumber = () => {
    switch (selectedMethod) {
      case 'bKash': return settings.bkashNumber || '01700-000000 (Personal)';
      case 'Nagad': return settings.nagadNumber || '01800-000000 (Personal)';
      case 'Rocket': return settings.rocketNumber || '01900-000000-0 (Personal)';
      case 'Upay': return settings.upayNumber || '01600-000000 (Personal)';
      default: return '';
    }
  };

  // Step 1: Place Order
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }
    setErrorMsg('');
    setPaidAmount(currentTotal.toString()); // default auto fill paid amount
    setStep(2);
  };

  // Image Upload handler (Base64 compression for Firestore)
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Limit Base64 length to prevent heavy payloads if file is huge
        if (base64String.length > 800000) {
          setErrorMsg('Screenshot file is too large! Please upload a smaller image.');
          return;
        }
        setScreenshot(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 3: Complete & Verify Payment
  const handleVerifyPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId || !paidAmount || !senderNumber) {
      setErrorMsg('Please fill in all transaction fields.');
      return;
    }
    if (!confirmedPayment) {
      setErrorMsg('Please check the confirmation box to verify payment.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const orderId = 'ORD_' + Math.floor(100000 + Math.random() * 900000);
      setGeneratedOrderId(orderId);

      // Save to Firebase Firestore via custom hook
      await createStudentEnrollment({
        studentId: 'std_' + Math.random().toString(36).substr(2, 9),
        studentName: fullName,
        studentEmail: email.trim().toLowerCase(),
        studentPhone: phone,
        itemType: itemType,
        itemId: item.id,
        itemTitle: item.title,
        paymentMethod: selectedMethod,
        paymentPhone: senderNumber,
        transactionId: transactionId.trim().toUpperCase(),
        // optional extended properties
        country,
        district,
        notes,
        paidAmount: parseFloat(paidAmount),
        screenshotUrl: screenshot || ''
      });

      // Call success hook
      onEnrollSuccess(fullName, email, phone);
      setStep(4);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Something went wrong submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset checkout state
  const handleCloseAndReset = () => {
    setStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscount(0);
    setTransactionId('');
    setPaidAmount('');
    setSenderNumber('');
    setScreenshot('');
    setScreenshotName('');
    setConfirmedPayment(false);
    setErrorMsg('');
    onClose();
  };

  // Generate mock PDF receipt for download
  const handleDownloadInvoice = () => {
    const invoiceContent = `
========================================
         INVOICE / RECEIPT
========================================
Order ID: ${generatedOrderId}
Date: ${new Date().toLocaleDateString()}
Status: Pending Verification

--- CUSTOMER INFORMATION ---
Name: ${fullName}
Email: ${email}
Phone: ${phone}
Location: ${district}, ${country}

--- ORDER DETAILS ---
Product: [${itemType.toUpperCase()}] ${item.title}
Subtotal: ${originalPrice} BDT
Discount: ${discount} BDT
Total Paid: ${paidAmount} BDT
Payment Method: ${selectedMethod}
Transaction ID: ${transactionId}

========================================
Your purchase is secure. Access will be 
granted shortly after payment validation.
Thank you for learning with us!
========================================
    `.trim();

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${generatedOrderId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full my-8 overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800/80 flex flex-col relative max-h-[95vh] sm:max-h-[90vh] transition-colors duration-200">
        
        {/* Header bar */}
        <div className="p-5 sm:px-8 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-slate-900 dark:text-white text-sm sm:text-base">Secure Checkout Gateway</h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">STEP {step} OF 4 • SECURE ENCRYPTED CHANNEL</p>
            </div>
          </div>
          <button 
            onClick={handleCloseAndReset}
            className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex-grow overflow-y-auto p-6 sm:p-8">
          
          {/* Progress Indicators */}
          <div className="mb-8 max-w-xl mx-auto hidden sm:flex items-center justify-between relative">
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-slate-100 dark:bg-slate-800 -z-10" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-emerald-500 transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }} />
            
            {[
              { label: 'Information', stepNum: 1 },
              { label: 'Payment Method', stepNum: 2 },
              { label: 'Instruction', stepNum: 3 },
              { label: 'Complete', stepNum: 4 }
            ].map((p, idx) => (
              <div key={idx} className="flex flex-col items-center bg-white dark:bg-slate-900 px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                  step > p.stepNum 
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : step === p.stepNum 
                    ? 'border-slate-900 dark:border-emerald-500 bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
                }`}>
                  {step > p.stepNum ? <Check className="w-4 h-4" /> : p.stepNum}
                </div>
                <span className={`text-[10px] font-bold mt-1.5 uppercase tracking-wider ${step === p.stepNum ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            
            {/* STEP 1: INFORMATION PAGE */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left: Input Form */}
                <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-5 text-left">
                  <h4 className="font-sans font-bold text-lg text-slate-900 dark:text-white pb-2 border-b border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                    <span>Checkout Information</span>
                  </h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name *</label>
                      <input 
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address *</label>
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">Your invoice will be emailed here.</span>
                      </div>
                      
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number *</label>
                        <input 
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 017XXXXXXXX"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">For updates & portal access login.</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Country</label>
                        <input 
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          placeholder="Bangladesh"
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">District / Region</label>
                        <select 
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250"
                        >
                          {DISTRICTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Optional Notes</label>
                      <textarea 
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any instruction, special message, or alternative contact method..."
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-850 dark:text-white text-sm focus:outline-none focus:border-slate-900 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-4 focus:ring-slate-100 dark:focus:ring-emerald-950/20 transition-all duration-250 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-semibold border border-red-100/50 dark:border-red-900/30">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base rounded-2xl shadow-xl flex items-center justify-center space-x-2 hover:-translate-y-[2px] active:translate-y-0 transition-all duration-200 cursor-pointer"
                  >
                    <span>Place Order</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center justify-center space-x-1.5 pt-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your information is 100% secure and encrypted.</span>
                  </p>
                </form>

                {/* Right: Order Summary Card */}
                <div className="lg:col-span-5 text-left">
                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-800/80 p-6 rounded-3xl space-y-6 sticky top-0 shadow-sm transition-colors">
                    <h4 className="font-sans font-bold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">Order Summary</h4>
                    
                    {/* Item Card */}
                    <div className="flex space-x-4 items-center">
                      <img 
                        src={item.coverImage} 
                        alt={item.title} 
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-850"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-1">
                        <span className="text-[10px] font-extrabold uppercase bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                          {itemType}
                        </span>
                        <h5 className="font-sans font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight line-clamp-2">
                          {item.title}
                        </h5>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.price} BDT</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 space-y-3">
                      {/* Coupon input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Promo / Coupon Code</label>
                        <div className="flex space-x-2">
                          <input 
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="COUPON CODE"
                            className="flex-grow px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white font-mono text-xs focus:outline-none uppercase"
                          />
                          <button 
                            type="button"
                            onClick={handleApplyCoupon}
                            className="px-4 py-2 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-850 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                        {appliedCoupon && (
                          <div className="flex items-center justify-between text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 p-2 rounded-lg font-medium border border-emerald-100 dark:border-emerald-900/30">
                            <span>Coupon '{appliedCoupon}' Applied!</span>
                            <button 
                              type="button" 
                              onClick={() => {
                                setDiscount(0);
                                setAppliedCoupon(null);
                                setCouponCode('');
                              }}
                              className="text-emerald-900 hover:scale-110 font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fees Breakdown */}
                    <div className="border-t border-slate-200/60 dark:border-slate-800/80 pt-4 space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                        <span>Subtotal</span>
                        <span>{originalPrice.toLocaleString()} BDT</span>
                      </div>
                      
                      {discount > 0 && (
                        <div className="flex justify-between font-medium text-emerald-600 dark:text-emerald-400">
                           <span>Coupon Discount</span>
                          <span>-{discount.toLocaleString()} BDT</span>
                        </div>
                      )}

                      <div className="flex justify-between font-extrabold text-slate-900 dark:text-white text-sm sm:text-base border-t border-dashed border-slate-200 dark:border-slate-800 pt-3">
                        <span>Total Amount</span>
                        <span className="text-blue-600 dark:text-emerald-400 font-mono">{currentTotal.toLocaleString()} BDT</span>
                      </div>
                    </div>

                    <div className="bg-white/70 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 p-3 rounded-2xl flex items-start space-x-2.5">
                      <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed font-medium">
                        By completing order you agree to our digital delivery policy. The course asset is non-refundable and will be activated after system ledger audit verification.
                      </p>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT METHOD SELECTION */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="max-w-xl mx-auto space-y-6 text-left"
              >
                <div className="text-center space-y-1">
                  <h4 className="font-sans font-bold text-xl text-slate-900 dark:text-white">Choose Payment Method</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Select any secure digital banking wallet below to continue payment.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    {
                      id: 'bKash' as const,
                      name: 'bKash Wallet',
                      desc: 'Pay securely using bKash.',
                      color: 'border-pink-500/20 bg-pink-50/20 hover:border-pink-500/50',
                      selColor: 'ring-2 ring-pink-500 border-pink-500 bg-pink-50/40',
                      badge: 'bg-[#e2136e] text-white',
                      badgeText: 'bKash'
                    },
                    {
                      id: 'Nagad' as const,
                      name: 'Nagad Wallet',
                      desc: 'Fast payment via Nagad.',
                      color: 'border-orange-500/20 bg-orange-50/20 dark:bg-orange-950/10 hover:border-orange-500/50',
                      selColor: 'ring-2 ring-orange-500 border-orange-500 bg-orange-50/40 dark:bg-orange-950/25',
                      badge: 'bg-[#f7941d] text-white',
                      badgeText: 'Nagad'
                    },
                    {
                      id: 'Rocket' as const,
                      name: 'Rocket Mobile',
                      desc: 'Rocket Mobile Banking.',
                      color: 'border-purple-500/20 bg-purple-50/20 dark:bg-purple-950/10 hover:border-purple-500/50',
                      selColor: 'ring-2 ring-purple-600 border-purple-600 bg-purple-50/40 dark:bg-purple-950/25',
                      badge: 'bg-[#8c2d82] text-white',
                      badgeText: 'Rocket'
                    },
                    {
                      id: 'Upay' as const,
                      name: 'Upay Pay',
                      desc: 'Pay instantly with Upay.',
                      color: 'border-blue-500/20 bg-blue-50/20 dark:bg-blue-950/10 hover:border-blue-500/50',
                      selColor: 'ring-2 ring-blue-600 border-blue-600 bg-blue-50/40 dark:bg-blue-950/25',
                      badge: 'bg-[#005fa9] text-white',
                      badgeText: 'Upay'
                    }
                  ].map((method) => {
                    const isSelected = selectedMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setSelectedMethod(method.id)}
                        className={`p-5 rounded-2xl border text-left flex items-start justify-between transition-all duration-200 group cursor-pointer ${
                          isSelected ? method.selColor : method.color
                        }`}
                      >
                        <div className="space-y-3 flex-grow">
                          <span className={`inline-block text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg tracking-wider ${method.badge}`}>
                            {method.badgeText}
                          </span>
                          <div>
                            <h5 className="font-sans font-bold text-sm text-slate-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-emerald-400 transition-colors">
                              {method.name}
                            </h5>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{method.desc}</p>
                          </div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'bg-slate-900 dark:bg-emerald-500 border-slate-900 dark:border-emerald-500 text-white dark:text-slate-950 scale-110' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-transparent'
                        }`}>
                          <Check className="w-3 h-3" />
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-3.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep(3);
                    }}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>Continue Payment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PAYMENT INSTRUCTION & VERIFICATION FORM */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left"
              >
                {/* Left Side: Merchant Mobile number and instructions */}
                <div className="md:col-span-5 space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl space-y-4 transition-colors">
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 dark:bg-emerald-500 text-white dark:text-slate-950 font-mono">
                      Selected: {selectedMethod}
                    </span>
                    
                    <div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{selectedMethod} Agent Number</p>
                      <div className="flex items-center justify-between mt-1.5 p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
                        <span className="font-mono font-bold text-sm sm:text-base text-slate-900 dark:text-white break-all">{getMerchantNumber()}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(getMerchantNumber())}
                          className="p-1.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
                          title="Copy Number"
                        >
                          {copiedTxId ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <p className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-150 dark:border-slate-800 pb-1.5">Payment Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                        <li>Open your <span className="font-bold">{selectedMethod}</span> app.</li>
                        <li>Click <span className="font-bold">Send Money</span> / Cash Out.</li>
                        <li>Enter the number above.</li>
                        <li>Enter Amount: <span className="font-bold text-blue-600 dark:text-emerald-400 font-mono">{currentTotal} BDT</span></li>
                        <li>Reference: <span className="font-bold">Digital Purchase</span></li>
                        <li>Complete Payment & Copy TxID</li>
                      </ol>
                    </div>
                  </div>

                  <div className="p-4 border border-blue-100 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl flex items-start space-x-2.5">
                    <Coins className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-[10px] text-blue-800 dark:text-blue-400 leading-relaxed font-semibold">
                      Please send the exact amount of {currentTotal} BDT to speed up the automated ledger reconciliation process.
                    </p>
                  </div>
                </div>

                {/* Right Side: Payment Verification Form */}
                <form onSubmit={handleVerifyPayment} className="md:col-span-7 space-y-4">
                  <h4 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Verify manual payment</h4>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Transaction ID (TxID) *</label>
                      <input 
                        type="text"
                        required
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        placeholder="Ex: 8K72HSA9X8"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-white text-sm font-mono font-bold focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-slate-900 dark:focus:border-emerald-500 uppercase transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Paid Amount (BDT) *</label>
                      <input 
                        type="number"
                        required
                        value={paidAmount}
                        onChange={(e) => setPaidAmount(e.target.value)}
                        placeholder="Paid amount"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white text-sm font-bold focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-slate-900 dark:focus:border-emerald-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Sender Mobile Number *</label>
                      <input 
                        type="tel"
                        required
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        placeholder="Number you paid from"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-850 dark:text-white text-sm font-mono focus:outline-none focus:bg-white dark:focus:bg-slate-950 focus:border-slate-900 dark:focus:border-emerald-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Upload Receipt / Screenshot (Optional)</label>
                      <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors flex items-center justify-center cursor-pointer">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleScreenshotChange}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="text-center space-y-1">
                          <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {screenshotName ? `Selected: ${screenshotName}` : 'Click or Drag receipt image'}
                          </p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">PNG, JPG up to 1MB</p>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start space-x-3 text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer select-none py-1.5">
                      <input 
                        type="checkbox"
                        checked={confirmedPayment}
                        onChange={(e) => setConfirmedPayment(e.target.checked)}
                        className="mt-1 rounded border-slate-300 dark:border-slate-800 dark:bg-slate-950 text-slate-900 dark:text-emerald-500 focus:ring-slate-900 dark:focus:ring-emerald-500 cursor-pointer"
                      />
                      <span>I confirm that I have completed the payment and the information matches the ledger.</span>
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold border border-red-100/50 dark:border-red-900/30">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm rounded-xl transition-all cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-grow py-3 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-850 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-sm rounded-xl transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Verifying Payment...</span>
                        </>
                      ) : (
                        <span>Verify Payment</span>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS PAGE */}
            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-xl mx-auto text-center space-y-6"
              >
                {/* Success Animation */}
                <div className="flex justify-center">
                  <div className="relative">
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-200"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 bg-emerald-400 rounded-full -z-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-sans font-bold text-xl sm:text-2xl text-slate-900 dark:text-white">Payment Submitted Successfully</h4>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                    Thank you for your purchase. Our team will verify your payment details and activate your asset within 1-2 hours.
                  </p>
                </div>

                {/* Receipt Panel */}
                <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800/80 rounded-3xl text-left space-y-4 transition-colors">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800/80 pb-3">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Purchase Receipt</span>
                    <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2.5 py-0.5 rounded-full shadow-sm">
                      ID: {generatedOrderId}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Customer Name</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{fullName}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Product Title</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{item.title}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Payment Method</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{selectedMethod} Wallet</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase">Transaction ID</p>
                      <p className="font-mono font-bold text-slate-800 dark:text-slate-200 uppercase break-all">{transactionId}</p>
                    </div>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleDownloadInvoice}
                    className="flex-grow sm:flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-slate-500" />
                    <span>Download Invoice</span>
                  </button>

                  <button
                    onClick={() => {
                      handleCloseAndReset();
                      const element = document.getElementById('student-portal-tab') || document.querySelector('[data-tab="dashboard"]');
                      if (element) {
                        (element as HTMLButtonElement).click();
                      } else {
                        // fallback to reload/redirect in main application if possible
                        window.location.reload();
                      }
                    }}
                    className="flex-grow sm:flex-1 py-3 bg-slate-900 dark:bg-emerald-500 hover:bg-slate-850 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Go To Dashboard</span>
                  </button>

                  <button
                    onClick={handleCloseAndReset}
                    className="flex-grow sm:flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Home className="w-4 h-4 text-slate-500" />
                    <span>Back To Home</span>
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
    </div>
  );
}
