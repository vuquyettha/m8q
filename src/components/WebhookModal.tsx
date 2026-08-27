import React, { useState } from 'react';
import { X, Webhook, Copy, Check, Send, Terminal, Loader2, Sparkles } from 'lucide-react';

interface WebhookModalProps {
  isOpen: boolean;
  onClose: () => void;
  webhookId: string;
  onTriggerWebhook: (payload: any) => Promise<void>;
}

export const WebhookModal: React.FC<WebhookModalProps> = ({
  isOpen,
  onClose,
  webhookId,
  onTriggerWebhook,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        event: 'order.created',
        order_id: 'ORD-77492',
        customer: {
          name: 'Tran Thi B',
          email: 'tranthib@example.com',
          vip: true,
          total_spent: 2400000,
        },
        items: [
          { sku: 'IPHONE-16-PRO', name: 'iPhone 16 Pro Max 256GB', price: 2400000, quantity: 1 },
        ],
        currency: 'VND',
        timestamp: new Date().toISOString(),
      },
      null,
      2
    )
  );
  const [responseLog, setResponseLog] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const fullWebhookUrl = `${currentOrigin}/api/webhook/${webhookId || 'order-received'}`;
  const curlCommand = `curl -X POST "${fullWebhookUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${payloadText.replace(/'/g, "\\'")}'`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(fullWebhookUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleSendTest = async () => {
    try {
      setIsSending(true);
      const parsed = JSON.parse(payloadText);
      await onTriggerWebhook(parsed);
      setResponseLog(`[${new Date().toLocaleTimeString()}] ✅ Gửi Webhook thành công! Đã kích hoạt quy trình đang hoạt động.`);
    } catch (err: any) {
      setResponseLog(`[${new Date().toLocaleTimeString()}] ❌ Lỗi: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      id="webhook-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Webhook className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Trình kiểm tra kích hoạt Webhook</h3>
              <p className="text-xs text-gray-500">
                Gửi sự kiện HTTP bên ngoài vào quy trình tự động hóa của bạn
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* URL Box */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">Địa chỉ Endpoint Webhook trực tiếp</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={fullWebhookUrl}
                className="w-full px-3 py-2 bg-slate-50 font-mono text-slate-800 border border-gray-200 rounded-lg text-xs"
              />
              <button
                id="btn-copy-webhook-url"
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition flex items-center gap-1 shrink-0"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Đã sao chép' : 'Sao chép'}</span>
              </button>
            </div>
          </div>

          {/* cURL Snippet */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-gray-700 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-slate-600" />
                <span>Chạy thử qua Terminal (cURL)</span>
              </label>
              <button
                id="btn-copy-curl-cmd"
                onClick={handleCopyCurl}
                className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1"
              >
                {copiedCurl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>Sao chép lệnh cURL</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 font-mono rounded-lg overflow-x-auto text-[11px]">
              {curlCommand}
            </pre>
          </div>

          {/* Payload Editor */}
          <div className="space-y-1.5">
            <label className="font-semibold text-gray-700">Dữ liệu thử nghiệm JSON Body Payload</label>
            <textarea
              rows={8}
              value={payloadText}
              onChange={(e) => setPayloadText(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-slate-950 text-sky-300 rounded-lg border border-slate-700 focus:outline-none"
            />
          </div>

          {/* Response log feedback */}
          {responseLog && (
            <div className="p-3 rounded-lg bg-slate-100 font-mono text-xs text-slate-800">
              {responseLog}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-500">
            Hỗ trợ nhận JSON payload qua POST/GET
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold"
            >
              Hủy
            </button>
            <button
              id="btn-send-test-webhook"
              onClick={handleSendTest}
              disabled={isSending}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {isSending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>{isSending ? 'Đang gửi...' : 'Gửi thử nghiệm ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
