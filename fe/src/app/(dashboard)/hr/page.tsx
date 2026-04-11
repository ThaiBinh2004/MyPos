import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export default function HrDashboard() {
  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Nhân viên</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-blue-600">—</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Hợp đồng sắp hết hạn</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-yellow-600">—</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Ứng viên đang xử lý</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-purple-600">—</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Đơn hàng hôm nay</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold text-green-600">—</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
