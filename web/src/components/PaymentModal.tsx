import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Loader2, Crown, Lock } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  price?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ 
  isOpen, 
  onClose, 
  planName = "DSA Coach Pro", 
  price = "$99/yr" 
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  if (!isOpen) return null;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setTimeout(() => {
      setStatus('success');
    }, 2000);
  };

  const handleClose = () => {
    setStatus('idle');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#f4f1ea] dark:bg-[#1e1e1e] border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center space-x-2 text-amber-500">
            <Crown className="w-5 h-5" />
            <h2 className="font-bold">Upgrade to Premium</h2>
          </div>
          <button 
            onClick={handleClose}
            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            disabled={status === 'processing'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-2 animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Payment Successful!</h3>
            <p className="text-slate-600">
              Welcome to {planName}. Your premium features have been unlocked.
            </p>
            <button 
              onClick={handleClose}
              className="mt-6 w-full py-2.5 bg-white text-black rounded-xl font-bold hover:bg-slate-200 transition"
            >
              Continue Learning
            </button>
          </div>
        ) : (
          <div className="p-6">
            <div className="bg-white rounded-xl p-4 mb-6 flex justify-between items-center border border-amber-500/20">
              <div>
                <p className="text-slate-900 font-semibold">{planName}</p>
                <p className="text-xs text-slate-600">Billed annually</p>
              </div>
              <div className="text-xl font-black text-amber-500">{price}</div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Card Information</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input 
                    type="text" 
                    required
                    placeholder="0000 0000 0000 0000" 
                    className="w-full bg-[#141414] border border-slate-200 text-slate-900 rounded-lg pl-10 pr-4 py-2.5 focus:border-amber-500 outline-none transition font-mono text-sm"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    required
                    placeholder="MM/YY" 
                    className="w-full bg-[#141414] border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 focus:border-amber-500 outline-none transition font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">CVC</label>
                  <input 
                    type="text" 
                    required
                    placeholder="123" 
                    className="w-full bg-[#141414] border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 focus:border-amber-500 outline-none transition font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Name on Card</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe" 
                  className="w-full bg-[#141414] border border-slate-200 text-slate-900 rounded-lg px-4 py-2.5 focus:border-amber-500 outline-none transition text-sm"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  disabled={status === 'processing'}
                  className="w-full py-3 bg-amber-500 text-[#141414] rounded-xl font-bold hover:bg-amber-400 transition flex items-center justify-center disabled:opacity-70"
                >
                  {status === 'processing' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 mr-2" />
                      Pay {price}
                    </>
                  )}
                </button>
                <p className="text-center text-[10px] text-slate-600 mt-3 flex items-center justify-center">
                  <Lock className="w-3 h-3 mr-1" />
                  Payments are secure and encrypted
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
