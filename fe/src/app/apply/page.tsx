'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { applyPublic } from '@/services/recruitment.service';
import { CheckCircle2, Briefcase } from 'lucide-react';

export default function ApplyPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [appliedPosition, setAppliedPosition] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [source, setSource] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: () => applyPublic({ fullName, email, phoneNumber, appliedPosition, experience, skills, source }),
    onSuccess: () => setSubmitted(true),
    onError: (err: any) => setError(err?.response?.data ?? 'Có lỗi xảy ra, vui lòng thử lại.'),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    mutation.mutate();
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <CheckCircle2 className="mx-auto mb-4 text-green-500" size={56} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Nộp hồ sơ thành công!</h2>
          <p className="text-gray-500 text-sm">
            Cảm ơn bạn đã ứng tuyển tại <strong>FORHER</strong>.<br />
            Chúng tôi sẽ liên hệ với bạn qua email <strong>{email}</strong> sớm nhất có thể.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Briefcase size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Ứng tuyển tại FORHER</h1>
            <p className="text-xs text-gray-400">Điền thông tin bên dưới để nộp hồ sơ</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Họ tên + Email */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Họ và tên *</label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Email *</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@gmail.com"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* SĐT + Vị trí */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Số điện thoại</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0901234567"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-600">Vị trí ứng tuyển *</label>
              <input
                required
                value={appliedPosition}
                onChange={(e) => setAppliedPosition(e.target.value)}
                placeholder="VD: Nhân viên bán hàng"
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>

          {/* Kinh nghiệm */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Kinh nghiệm làm việc</label>
            <input
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="VD: 2 năm bán lẻ thời trang, quản lý cửa hàng..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* Kỹ năng */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Kỹ năng nổi bật</label>
            <textarea
              rows={3}
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="VD: Giao tiếp tốt, tư vấn khách hàng, sử dụng phần mềm POS..."
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
            />
          </div>

          {/* Nguồn biết đến */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Biết đến FORHER qua</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">-- Chọn --</option>
              <option value="Website">Website công ty</option>
              <option value="Facebook">Facebook</option>
              <option value="VietnamWorks">VietnamWorks</option>
              <option value="TopCV">TopCV</option>
              <option value="Giới thiệu">Người quen giới thiệu</option>
              <option value="Khác">Khác</option>
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors cursor-pointer"
          >
            {mutation.isPending ? 'Đang gửi...' : 'Nộp hồ sơ'}
          </button>
        </form>
      </div>
    </div>
  );
}
