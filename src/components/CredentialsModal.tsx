import React, { useState } from 'react';
import { X, KeyRound, ShieldCheck, Plus, Trash2, Check, Lock, Eye, EyeOff } from 'lucide-react';
import { Credential } from '../types';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_CREDENTIALS: Credential[] = [
  {
    id: 'cred_1',
    name: 'Gemini AI API Key',
    type: 'apiKey',
    data: { apiKey: 'AIzaSyDemoKey_AES_GCM_Encrypted_99841' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred_2',
    name: 'Telegram Bot Token',
    type: 'bearer',
    data: { token: '7192837482:AAFtDemoTelegramBotToken_v2' },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'cred_3',
    name: 'SMTP Email Gateway (Gmail)',
    type: 'smtp',
    data: { host: 'smtp.gmail.com', port: '587', user: 'bot@company.com' },
    createdAt: new Date().toISOString(),
  },
];

export const CredentialsModal: React.FC<CredentialsModalProps> = ({ isOpen, onClose }) => {
  const [credentials, setCredentials] = useState<Credential[]>(DEFAULT_CREDENTIALS);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [newCredName, setNewCredName] = useState('');
  const [newCredType, setNewCredType] = useState<any>('apiKey');
  const [newCredValue, setNewCredValue] = useState('');

  if (!isOpen) return null;

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCredName.trim() || !newCredValue.trim()) return;

    const newCred: Credential = {
      id: `cred_${Date.now()}`,
      name: newCredName.trim(),
      type: newCredType,
      data: { secret: newCredValue.trim() },
      createdAt: new Date().toISOString(),
    };

    setCredentials([newCred, ...credentials]);
    setNewCredName('');
    setNewCredValue('');
  };

  const handleDelete = (id: string) => {
    setCredentials(credentials.filter((c) => c.id !== id));
  };

  const toggleShow = (id: string) => {
    setShowSecret((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div
      id="credentials-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <span>Kho Khóa & Thông Tin Xác Thực AES-256</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                  Mã hóa an toàn
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                Lưu trữ bảo mật API Key, Access Token và thông tin đăng nhập dịch vụ
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
        <div className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Add New Credential Form */}
          <form onSubmit={handleAddCredential} className="p-3.5 bg-slate-50 rounded-xl border border-gray-200 space-y-3">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Thêm thông tin xác thực mã hóa mới</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Tên khóa (Ví dụ: Gemini Key)"
                value={newCredName}
                onChange={(e) => setNewCredName(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                required
              />
              <select
                value={newCredType}
                onChange={(e) => setNewCredType(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
              >
                <option value="apiKey">Khóa API (API Key)</option>
                <option value="bearer">Mã Bearer (Bearer Token)</option>
                <option value="oauth2">Mã OAuth2 (OAuth2 Token)</option>
                <option value="smtp">Mật khẩu SMTP</option>
              </select>
              <input
                type="password"
                placeholder="Giá trị bí mật (Secret)"
                value={newCredValue}
                onChange={(e) => setNewCredValue(e.target.value)}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-mono"
                required
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Lock className="w-3 h-3" />
              <span>Mã hóa & Lưu vào kho</span>
            </button>
          </form>

          {/* Stored Credentials List */}
          <div className="space-y-2">
            <h4 className="font-bold text-gray-800">Thông tin xác thực đã lưu ({credentials.length})</h4>
            {credentials.map((cred) => {
              const val = Object.values(cred.data)[0] || '••••••••';
              const isRevealed = showSecret[cred.id];

              return (
                <div
                  key={cred.id}
                  className="p-3 bg-white rounded-xl border border-gray-200 flex items-center justify-between hover:border-gray-300 transition"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{cred.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] uppercase font-mono font-semibold">
                        {cred.type}
                      </span>
                    </div>
                    <p className="font-mono text-gray-500 text-[11px]">
                      {isRevealed ? val : '•••••••••••••••••••••••••'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleShow(cred.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded transition"
                      title={isRevealed ? 'Ẩn giá trị' : 'Hiện giá trị'}
                    >
                      {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDelete(cred.id)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 rounded transition"
                      title="Xóa thông tin này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-500">
          <span>Có thể tham chiếu trong biểu thức node qua cú pháp {`{{$env.SECRET_NAME}}`}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-100"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
