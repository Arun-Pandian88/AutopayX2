'use client';

import { useState, useEffect } from 'react';
import { FileText, Code2, Copy, CheckCircle2, ChevronRight, Hash, Terminal } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});
  const [activeLangCreate, setActiveLangCreate] = useState('curl');
  const [activeLangWebhook, setActiveLangWebhook] = useState('php');
  const [plans, setPlans] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/dashboard/plans`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setPlans(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [id]: false });
    }, 2000);
  };

  const navLinks = [
    { name: 'Introduction', href: '#introduction' },
    { name: 'Quickstart', href: '#quickstart' },
    { name: 'Authentication', href: '#authentication' },
    { name: 'Create order', href: '#create-order' },
    { name: 'Order status', href: '#order-status' },
    { name: 'Webhooks', href: '#webhooks' },
    { name: 'PHP integration', href: '#php-integration' },
    { name: 'Errors', href: '#errors' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'FAQ', href: '#faq' },
  ];

  const createSnippets = {
    curl: `curl -X POST https://api.autopayx.in/v1/create-order \\
  -H "X-API-Key: aupi_live_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"amount": 1499, "customer_name": "Rahul Sharma", "webhook_url": "https://yoursite.com/webhook"}'`,
    
    php: `<?php
$ch = curl_init("https://api.autopayx.in/v1/create-order");
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "X-API-Key: aupi_live_your_key",
        "Content-Type: application/json"
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "amount" => 1499,
        "customer_name" => "Rahul Sharma"
    ])
]);
$response = curl_exec($ch);
$order = json_decode($response, true);
// $order["payment_url"] -> redirect the customer`,
    
    node: `const res = await fetch("https://api.autopayx.in/v1/create-order", {
  method: "POST",
  headers: { 
    "X-API-Key": process.env.AUTOPAYX_KEY, 
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ amount: 1499, customer_name: "Rahul" }),
});
const order = await res.json();
// order.payment_url -> redirect the customer`,
    
    python: `import requests

res = requests.post(
    "https://api.autopayx.in/v1/create-order",
    headers={
        "X-API-Key": "aupi_live_your_key",
        "Content-Type": "application/json"
    },
    json={"amount": 1499, "customer_name": "Rahul Sharma"}
)
order = res.json()
# order["payment_url"] -> redirect the customer`,
    
    java: `import java.net.http.*;
import java.net.URI;

HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.autopayx.in/v1/create-order"))
    .header("X-API-Key", "aupi_live_your_key")
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(
        "{\\"amount\\": 1499, \\"customer_name\\": \\"Rahul\\"}"
    ))
    .build();

HttpResponse<String> res = client.send(request, HttpResponse.BodyHandlers.ofString());
// Parse res.body() to get payment_url`
  };

  const webhookSnippets = {
    curl: `curl -X POST https://yoursite.com/webhook \\
  -H "X-AutoUpi-Signature: t=1789453200,v1=fake_sig" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "payment.paid", "order_id": "ORD123"}'`,
    php: `<?php
// autoupi-webhook.php
$secret = "whsec_your_webhook_secret";
$raw = file_get_contents("php://input");
$header = $_SERVER["HTTP_X_AUTOUPI_SIGNATURE"] ?? "";

parse_str(str_replace(",", "&", $header), $parts); // t=..., v1=...
$expected = hash_hmac("sha256", $parts["t"] . "." . $raw, $secret);

if (!hash_equals($expected, $parts["v1"] ?? "")) {
    http_response_code(401);
    exit("bad signature");
}

$event = json_decode($raw, true);
if ($event["event"] === "payment.paid") {
    // idempotent: skip if order is already fulfilled
    mark_order_paid($event["order_id"]);
}
http_response_code(200);`,
    node: `const express = require('express');
const crypto = require('crypto');
const app = express();

app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const secret = 'whsec_your_webhook_secret';
  const header = req.headers['x-autoupi-signature'] || '';
  
  const parts = Object.fromEntries(header.split(',').map(s => s.split('=')));
  const expected = crypto.createHmac('sha256', secret)
    .update(parts.t + '.' + req.body.toString())
    .digest('hex');

  if (expected !== parts.v1) return res.status(401).send('bad sig');

  const event = JSON.parse(req.body);
  if (event.event === 'payment.paid') {
    // fulfil order
  }
  res.send('ok');
});`,
    python: `import hmac
import hashlib
from flask import Flask, request, abort

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    secret = b'whsec_your_webhook_secret'
    header = request.headers.get('X-AutoUpi-Signature', '')
    
    parts = dict(p.split('=') for p in header.split(','))
    payload = f"{parts.get('t')}.{request.get_data(as_text=True)}".encode()
    
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    
    if not hmac.compare_digest(expected, parts.get('v1', '')):
        abort(401)
        
    event = request.json
    if event.get('event') == 'payment.paid':
        pass # fulfil order
        
    return 'ok', 200`,
    java: `@PostMapping("/webhook")
public ResponseEntity<String> webhook(
    @RequestHeader("X-AutoUpi-Signature") String signature,
    @RequestBody String rawBody
) throws Exception {
    String secret = "whsec_your_webhook_secret";
    
    Map<String, String> parts = Arrays.stream(signature.split(","))
        .map(s -> s.split("="))
        .collect(Collectors.toMap(a -> a[0], a -> a[1]));
        
    String payload = parts.get("t") + "." + rawBody;
    
    Mac mac = Mac.getInstance("HmacSHA256");
    mac.init(new SecretKeySpec(secret.getBytes(), "HmacSHA256"));
    byte[] hash = mac.doFinal(payload.getBytes());
    
    String expected = HexFormat.of().formatHex(hash);
    
    if (!MessageDigest.isEqual(expected.getBytes(), parts.get("v1").getBytes())) {
        return ResponseEntity.status(401).body("bad sig");
    }
    
    return ResponseEntity.ok("ok");
}`
  };

  const createOrderResponse = `{
  "ok": true,
  "order_id": "ORD20260915A1B2C3",
  "slug": "9fkq2wra",
  "amount": 1499,
  "payable_amount": 1499.37,
  "status": "active",
  "payment_url": "https://pay.autopayx.in/9fkq2wra"
}`;

  const orderStatusRequest = `curl "https://api.autopayx.in/v1/order-status?order_id=ORD..." \\
  -H "X-API-Key: aupi_live_your_key"`;

  const orderStatusResponse = `{
  "ok": true,
  "order": {
    "order_id": "ORD20260915A1B2C3",
    "slug": "9fkq2wra",
    "customer_name": "Rahul Sharma",
    "amount": 1499,
    "payable_amount": 1499.37,
    "status": "paid",
    "payer_name": "RAHUL SHARMA",
    "paid_at": "2026-09-15T10:21:44.120Z",
    "detected_at": "2026-09-15T10:21:52.480Z",
    "expires_at": "2026-09-15T10:26:00.000Z"
  }
}`;

  const webhookPayload = `POST https://yoursite.com/autoupi-webhook.php
X-AutoUpi-Signature: t=1789453200,v1=6f3c...9ab

{
  "event": "payment.paid",
  "order_id": "ORD20260915A1B2C3",
  "amount": 1499,
  "payable_amount": 1499.37,
  "status": "paid",
  "payer_name": "RAHUL SHARMA",
  "paid_at": "2026-09-15T10:21:44.120Z"
}

signed_payload = "{t}." + raw_request_body
v1 = hex(hmac_sha256(webhook_secret, signed_payload))`;

  const phpHelper1 = `<?php
class AutoPayX {
    private string $key;
    private string $base;

    public function __construct(string $key, string $base = "https://api.autopayx.in/v1") {
        $this->key = $key;
        $this->base = $base;
    }

    private function request(string $url, ?array $body = null): array {
        $ch = curl_init($url);
        $headers = ["X-API-Key: {$this->key}"];
        
        if ($body !== null) {
            $headers[] = "Content-Type: application/json";
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true, 
            CURLOPT_HTTPHEADER => $headers, 
            CURLOPT_TIMEOUT => 20
        ]);
        
        $res = json_decode(curl_exec($ch), true);
        curl_close($ch);
        return is_array($res) ? $res : ["ok" => false, "error" => "network_error"];
    }

    public function createOrder(float $amount, string $customer = "", string $webhook = ""): array {
        return $this->request($this->base . "/create-order", [
            "amount" => $amount,
            "customer_name" => $customer,
            "webhook_url" => $webhook,
        ]);
    }

    public function status(string $orderId): array {
        return $this->request($this->base . "/order-status?order_id=" . urlencode($orderId));
    }
}`;

  const phpHelper2 = `<?php
require "autopayx.php";
$api = new AutoPayX("aupi_live_your_key");

$order = $api->createOrder(1499, "Rahul Sharma", "https://yoursite.com/webhook.php");

if (empty($order["ok"])) {
    die("Could not start payment: " . ($order["error"] ?? "unknown"));
}

// store it so the webhook can find the buyer later
save_order($order["order_id"], $_SESSION["user_id"], $order["amount"]);

header("Location: " . $order["payment_url"]);
exit;`;

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#1C1D22] font-sans selection:bg-indigo-500/20">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 h-16 flex items-center px-6 md:px-12 justify-between">
        <Link href="/" className="text-xl font-black tracking-tight text-[#1C1D22]">AutoPayX <span className="text-indigo-600 font-bold ml-1 text-sm bg-indigo-50 px-2 py-0.5 rounded-full">DOCS</span></Link>
        <div className="flex space-x-6 text-sm font-bold">
          <Link href="/" className="text-gray-500 hover:text-[#1C1D22] transition-colors">Home</Link>
          <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 transition-colors">Go to Dashboard</Link>
        </div>
      </nav>

      <div className="flex max-w-[90rem] mx-auto px-6 md:px-12 py-10">
        
        {/* Left Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0 pr-8">
          <div className="sticky top-28 space-y-1">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-3">Getting Started</h4>
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="block px-3 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-[#1C1D22] rounded-lg transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-4xl lg:mr-12">
          
          <section id="introduction" className="mb-16">
            <h1 className="text-4xl font-black tracking-tight mb-4">API Documentation</h1>
            <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8">
              AutoPayX is a self-serve UPI collection gateway. Create an order from your server, send the customer to the hosted checkout page, and the order is confirmed automatically — no commission, no reconciliation, money straight into your UPI account.
            </p>
            <div className="p-4 bg-white border border-gray-200 rounded-xl flex items-center text-sm font-bold text-gray-700 shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
              Base URL: <code className="ml-2 font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">https://api.autopayx.in/v1</code>
            </div>
          </section>

          <section id="quickstart" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Quickstart
            </h2>
            <ol className="space-y-4 list-decimal list-inside text-gray-600 font-medium leading-relaxed">
              <li className="pl-2">Create an account and sign in to the merchant console.</li>
              <li className="pl-2">Connect an account — pick Google Pay, PhonePe or Paytm and complete the setup.</li>
              <li className="pl-2">Generate an API key on the API Keys page. Copy it once; regenerating replaces the old key.</li>
              <li className="pl-2">Create an order from your server and redirect the customer to the returned <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">payment_url</code>.</li>
              <li className="pl-2">Confirm the payment through the status endpoint or your webhook, then fulfil the order.</li>
            </ol>
          </section>

          <section id="authentication" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Authentication
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              Every request carries your secret key in the <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">X-API-Key</code> header. Keys start with <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">aupi_live_</code>. Call the API only from your server; never expose the key in browser code.
            </p>
            
            <div className="bg-[#1C1D22] rounded-xl overflow-hidden shadow-lg border border-[#2d2e33] mb-6">
              <div className="flex items-center px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <span className="ml-4 text-xs font-mono text-gray-400">Headers</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <span className="text-indigo-400">X-API-Key</span>: aupi_live_xxxxxxxxxxxxxxxxxxxxxxxx<br/>
                  <span className="text-indigo-400">Content-Type</span>: application/json
                </pre>
              </div>
            </div>
          </section>

          <section id="create-order" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Create order
            </h2>
            <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 border border-green-200 text-xs font-bold rounded-md uppercase tracking-wider mb-4">POST <span className="ml-2 font-mono text-[10px] bg-green-100/50 px-2 py-0.5 rounded text-green-800 lowercase">/api/public/v1/create-order</span></div>
            
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              Creates a new payment intent and returns a hosted checkout URL.
            </p>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700">Field</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Type</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Required</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="px-4 py-4 font-mono text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">amount</span></td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">number</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">Yes</td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Order amount in INR, 1 to 10,00,000.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">customer_name</span></td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">string</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">No</td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Shown on the checkout page.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">webhook_url</span></td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">string</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">No</td>
                    <td className="px-4 py-4 text-gray-600 font-medium">HTTPS URL that receives the signed <code className="bg-gray-100 border border-gray-200 px-1 rounded">payment.paid</code> webhook.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">link_type</span></td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-600">string</td>
                    <td className="px-4 py-4 text-xs font-medium text-gray-800">No</td>
                    <td className="px-4 py-4 text-gray-600 font-medium"><code className="bg-gray-100 border border-gray-200 px-1 rounded">one_time</code> (default) or <code className="bg-gray-100 border border-gray-200 px-1 rounded">reusable</code>.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Language Tabs */}
            <div className="flex space-x-2 mb-2 mt-8">
              {['curl', 'php', 'node', 'python', 'java'].map((lang) => (
                <button
                  key={`create-${lang}`}
                  onClick={() => setActiveLangCreate(lang)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ${activeLangCreate === lang ? 'bg-[#1C1D22] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Request Block */}
            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ {activeLangCreate}</span>
                <button onClick={() => handleCopy('reqCreate', createSnippets[activeLangCreate as keyof typeof createSnippets])} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['reqCreate'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#a9dc76] leading-relaxed">
                  {createSnippets[activeLangCreate as keyof typeof createSnippets]}
                </pre>
              </div>
            </div>

            {/* Response Block */}
            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Code2 className="w-3.5 h-3.5 mr-2" /> &lt;/&gt; 200 response</span>
                <button onClick={() => handleCopy('resCreate', createOrderResponse)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['resCreate'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#78dce8] leading-relaxed">
                  {createOrderResponse}
                </pre>
              </div>
            </div>
            
          </section>

          <section id="order-status" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Order status
            </h2>
            <div className="inline-flex items-center px-3 py-1 bg-[#1e7eb6] text-white text-xs font-bold rounded-md uppercase tracking-wider mb-4">GET <span className="ml-2 font-mono text-[10px] bg-white/20 px-2 py-0.5 rounded text-white lowercase">/api/public/v1/order-status?order_id=ORD...</span></div>
            
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              Poll this endpoint from your server (or after the customer returns) to confirm a payment before fulfilment.
            </p>

            <div className="flex space-x-2 mb-2 mt-8">
              <button className="px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm bg-[#1C1D22] text-white">curl</button>
              <button className="px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm bg-white border border-gray-200 text-gray-600 hover:bg-gray-50">php</button>
            </div>

            {/* Request Block */}
            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-4">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ curl</span>
                <button onClick={() => handleCopy('reqStatus', orderStatusRequest)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['reqStatus'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#a9dc76] leading-relaxed">
                  {orderStatusRequest}
                </pre>
              </div>
            </div>

            {/* Response Block */}
            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-8">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Code2 className="w-3.5 h-3.5 mr-2" /> &lt;/&gt; 200 response</span>
                <button onClick={() => handleCopy('resStatus', orderStatusResponse)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['resStatus'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#78dce8] leading-relaxed">
                  {orderStatusResponse}
                </pre>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700">Status</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Meaning</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22] w-32"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-medium">active</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Waiting for payment. Links expire 5 minutes after creation.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-medium">paid</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">A matching credit alert was detected. Safe to fulfil.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]"><span className="bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded text-xs font-medium">expired</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">No payment detected in time. Create a new order.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="webhooks" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Webhooks
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              Each API key ships with a webhook secret (<code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">whsec_...</code>) shown on the API Keys page. Pass a <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">webhook_url</code> when creating an order and we POST a signed <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">payment.paid</code> event the moment the order is confirmed as paid. You can also save one default webhook URL on the <strong>Config</strong> page in your dashboard — it is used for every order of your account when the create order call does not send its own <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">webhook_url</code>.
            </p>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              The same Config page holds your <strong>success</strong> and <strong>failed</strong> redirect URLs. After the checkout result screen the payer is sent to your URL with <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">?order_id=...&status=paid</code> or <code className="px-1.5 py-0.5 bg-gray-100 text-gray-800 rounded font-mono text-sm border border-gray-200">?order_id=...&status=failed</code>. Redirects are per account, so only your own orders use them. Always confirm the final state with the webhook or the order status endpoint before you fulfil.
            </p>

            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-6 mt-8">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ payload</span>
                <button onClick={() => handleCopy('reqPayload', webhookPayload)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['reqPayload'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-gray-300 leading-relaxed">
                  {webhookPayload}
                </pre>
              </div>
            </div>

            <div className="flex space-x-2 mb-2 mt-8">
              {['php', 'node', 'curl', 'python', 'java'].map((lang) => (
                <button
                  key={`webhook-${lang}`}
                  onClick={() => setActiveLangWebhook(lang)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-colors shadow-sm ${activeLangWebhook === lang ? 'bg-[#1C1D22] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {lang}
                </button>
              ))}
            </div>

            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ {activeLangWebhook}</span>
                <button onClick={() => handleCopy('reqWebhook', webhookSnippets[activeLangWebhook as keyof typeof webhookSnippets])} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['reqWebhook'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#a9dc76] leading-relaxed">
                  {webhookSnippets[activeLangWebhook as keyof typeof webhookSnippets]}
                </pre>
              </div>
            </div>
          </section>

          <section id="php-integration" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> PHP integration in 3 files
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-6">
              Copy these three files into any PHP site (WordPress, Laravel, CodeIgniter or plain PHP). Only the API key, webhook secret and your database calls need changing.
            </p>

            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-6">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ 1. autopayx.php — tiny helper class</span>
                <button onClick={() => handleCopy('php1', phpHelper1)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['php1'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto max-h-96 custom-scrollbar">
                <pre className="text-[13px] font-mono text-[#a9dc76] leading-relaxed">
                  {phpHelper1}
                </pre>
              </div>
            </div>

            <div className="bg-[#1C1D22] rounded-2xl overflow-hidden shadow-lg border border-[#2d2e33] mb-6">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#2d2e33] bg-[#222328]">
                <span className="text-xs font-bold text-gray-400 flex items-center"><Terminal className="w-3.5 h-3.5 mr-2" /> &gt;_ 2. checkout.php — start a payment</span>
                <button onClick={() => handleCopy('php2', phpHelper2)} className="text-gray-400 hover:text-white transition-colors">
                  {copiedStates['php2'] ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="p-5 overflow-x-auto">
                <pre className="text-[13px] font-mono text-[#a9dc76] leading-relaxed">
                  {phpHelper2}
                </pre>
              </div>
            </div>
          </section>

          <section id="errors" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Errors
            </h2>
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-8 shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 font-bold text-gray-700 w-16">HTTP</th>
                    <th className="px-4 py-3 font-bold text-gray-700 w-48">Code</th>
                    <th className="px-4 py-3 font-bold text-gray-700">Fix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">401</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">invalid_api_key</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Key missing, revoked or replaced by a regenerate.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">400</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">invalid_amount</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Amount must be greater than 0 and up to 10,00,000.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">400</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">UPI_NOT_CONFIGURED</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Save a UPI ID on Connect Accounts first.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">400</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">QUOTA_EXCEEDED</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">QR limit finished — upgrade to Pro.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">400</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">ALL_PAYMENT_SLOTS_BUSY</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">Too many pending orders at the same amount; retry shortly.</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-4 font-mono font-bold text-[#1C1D22]">404</td>
                    <td className="px-4 py-4 font-mono text-xs"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-1 rounded">not_found</span></td>
                    <td className="px-4 py-4 text-gray-600 font-medium">The order ID does not belong to this key.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="pricing" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> Pricing
            </h2>
            <p className="text-gray-600 font-medium leading-relaxed mb-8">
              No per-transaction commission — you collect straight into your own UPI account.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.length > 0 ? plans.map((plan: any) => (
                <div key={plan.id} className={`${plan.name === 'Pro' || plan.is_popular ? 'bg-[#0A0A0B] border-[#2d2e33] shadow-xl relative overflow-hidden' : 'bg-white border-gray-200 shadow-sm'} border rounded-2xl p-6 flex flex-col h-full`}>
                  {(plan.name === 'Pro' || plan.is_popular) && (
                    <>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                      <div className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full self-start mb-4">Most Popular</div>
                    </>
                  )}
                  <h3 className={`font-bold mb-2 ${(plan.name === 'Pro' || plan.is_popular) ? 'text-white' : 'text-[#1C1D22]'}`}>{plan.name}</h3>
                  <div className={`text-3xl font-black mb-1 ${(plan.name === 'Pro' || plan.is_popular) ? 'text-white' : 'text-[#1C1D22]'}`}>
                    {plan.is_custom ? 'Talk to us' : `₹${plan.price}`}
                  </div>
                  <div className={`text-xs mb-6 font-medium ${(plan.name === 'Pro' || plan.is_popular) ? 'text-gray-400' : 'text-gray-500'}`}>
                    {plan.is_custom ? 'high volume' : (plan.price == '0' || plan.price == '0.00' ? 'to get started' : (plan.interval === 'monthly' ? 'per 30 days' : `per ${plan.interval}`))}
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features?.map((feature: string, idx: number) => (
                      <li key={idx} className={`flex items-start text-sm font-medium ${(plan.name === 'Pro' || plan.is_popular) ? 'text-gray-300' : 'text-gray-600'}`}>
                        <CheckCircle2 className={`w-4 h-4 mr-2 shrink-0 mt-0.5 ${(plan.name === 'Pro' || plan.is_popular) ? 'text-indigo-400' : 'text-indigo-500'}`} /> 
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-2.5 text-sm font-bold rounded-xl transition-colors ${(plan.name === 'Pro' || plan.is_popular) ? 'bg-[#6C3FE2] hover:bg-[#5a34bd] text-white shadow-lg' : 'bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800'}`}>
                    {plan.is_custom ? 'Contact sales' : (plan.price === '0.00' || plan.price === '0' ? 'Create account' : 'Start now')}
                  </button>
                </div>
              )) : (
                <>
                  {/* Free Plan */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col h-full shadow-sm">
                    <h3 className="font-bold text-[#1C1D22] mb-2">Free</h3>
                    <div className="text-3xl font-black text-[#1C1D22] mb-1">₹0</div>
                    <div className="text-xs text-gray-500 mb-6 font-medium">to get started</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> 3 payment QR codes total</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> 1 merchant account</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Full REST API access</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Automatic payment confirmation</li>
                    </ul>
                    <button className="w-full py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-xl transition-colors">Create account</button>
                  </div>
  
                  {/* Pro Plan */}
                  <div className="bg-[#0A0A0B] border border-[#2d2e33] rounded-2xl p-6 flex flex-col h-full shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <div className="bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest py-1 px-3 rounded-full self-start mb-4">Most Popular</div>
                    <h3 className="font-bold text-white mb-2">Pro</h3>
                    <div className="text-3xl font-black text-white mb-1">₹299</div>
                    <div className="text-xs text-gray-400 mb-6 font-medium">per 30 days</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-start text-sm text-gray-300 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0 mt-0.5" /> 3,000 QR codes per 30 days</li>
                      <li className="flex items-start text-sm text-gray-300 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0 mt-0.5" /> Unlimited payment links</li>
                      <li className="flex items-start text-sm text-gray-300 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0 mt-0.5" /> Signed webhooks</li>
                      <li className="flex items-start text-sm text-gray-300 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-400 mr-2 shrink-0 mt-0.5" /> Priority support</li>
                    </ul>
                    <button className="w-full py-2.5 bg-[#6C3FE2] hover:bg-[#5a34bd] text-white text-sm font-bold rounded-xl transition-colors shadow-lg">Start now</button>
                  </div>
  
                  {/* Custom Plan */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col h-full shadow-sm">
                    <h3 className="font-bold text-[#1C1D22] mb-2">Custom</h3>
                    <div className="text-2xl font-black text-[#1C1D22] mb-1">Talk to us</div>
                    <div className="text-xs text-gray-500 mb-6 font-medium">high volume</div>
                    <ul className="space-y-3 mb-8 flex-1">
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Higher QR limits</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Multiple merchant accounts</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Self-hosted deployment</li>
                      <li className="flex items-start text-sm text-gray-600 font-medium"><CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" /> Dedicated support</li>
                    </ul>
                    <button className="w-full py-2.5 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 text-sm font-bold rounded-xl transition-colors">Contact sales</button>
                  </div>
                </>
              )}
            </div>
          </section>

          <section id="faq" className="mb-16 scroll-mt-24">
            <h2 className="text-2xl font-bold mb-6 flex items-center group">
              <Hash className="w-5 h-5 text-gray-300 mr-2 group-hover:text-indigo-600 transition-colors" /> FAQ
            </h2>
            
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[#1C1D22] mb-2 text-sm">Do I need a payment gateway account?</h4>
                <p className="text-gray-500 text-sm font-medium">No. Money reaches your own UPI account directly; AutoPayX only confirms and records the order.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[#1C1D22] mb-2 text-sm">What if two customers pay the same amount?</h4>
                <p className="text-gray-500 text-sm font-medium">They can't — each active order carries its own unique <code className="bg-gray-100 border border-gray-200 px-1 rounded">payable_amount</code>.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[#1C1D22] mb-2 text-sm">How long is a link valid?</h4>
                <p className="text-gray-500 text-sm font-medium">5 minutes. After that the order becomes <code className="bg-gray-100 border border-gray-200 px-1 rounded">expired</code> and moves to Transactions.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[#1C1D22] mb-2 text-sm">Which PHP version do I need?</h4>
                <p className="text-gray-500 text-sm font-medium">PHP 7.4 or newer with the cURL extension — no composer package required.</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h4 className="font-bold text-[#1C1D22] mb-2 text-sm">Can I regenerate my API key?</h4>
                <p className="text-gray-500 text-sm font-medium">Yes. Regenerating issues a new key and instantly disables the previous one.</p>
              </div>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
