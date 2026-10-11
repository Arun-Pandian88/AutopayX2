const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const regex = /if \(state === 'success'\) \{\s*return \([\s\S]*?\);\s*\}/;

const newSuccessUI = `if (state === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative transition-colors duration-1000" style={{ backgroundColor: brandColor }}>
        {/* Background Animation Effects */}
        <div className="absolute inset-0 bg-black/10 backdrop-blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/20 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl relative z-10 animate-in zoom-in-95 duration-500 fade-in">
          
          <div className="flex flex-col items-center mb-8 animate-in slide-in-from-bottom-6 duration-700 delay-150 fill-mode-both">
            <div className="relative mb-8 mt-4">
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"></div>
              <div className="absolute inset-0 bg-white rounded-full animate-pulse opacity-40 scale-110"></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.5)] relative z-10">
                <CheckCircle2 className="w-12 h-12 animate-in zoom-in duration-500 delay-300" style={{ color: brandColor }} strokeWidth={3} />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-white text-center tracking-tight mb-3">Payment Successful!</h1>
            <p className="text-white/80 text-center font-medium text-sm">
              Your payment has been verified securely. <br/>
              <span className="text-white font-bold mt-1 inline-block text-base">{data?.merchant?.business_name || data?.merchant?.name}</span>
            </p>
          </div>

          <div className="bg-white/10 rounded-3xl p-6 mb-8 border border-white/10 animate-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-both shadow-inner space-y-5">
            <div className="flex flex-col items-center pb-5 border-b border-white/10">
              <span className="text-white/60 font-medium text-sm mb-1">Amount Paid</span>
              <span className="text-5xl font-black text-white tracking-tighter">?{data?.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-white/60 font-medium text-sm">Transaction ID</span>
              <span className="text-white font-mono text-xs font-bold tracking-wider bg-black/20 px-3 py-1.5 rounded-xl">{txnId}</span>
            </div>
          </div>
          
          <div className="text-center animate-in fade-in duration-700 delay-500 fill-mode-both">
            <p className="text-white/50 text-xs font-bold flex items-center justify-center gap-1.5 uppercase tracking-[0.2em]">
              <ShieldCheck className="w-4 h-4" /> Secured by AutoPayX
            </p>
          </div>
        </div>
      </div>
    );
  }`;

data = data.replace(regex, newSuccessUI);
fs.writeFileSync(file, data);
