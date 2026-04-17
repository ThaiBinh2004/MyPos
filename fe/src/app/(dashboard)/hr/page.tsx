'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HrPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/hr/attendance/kiosk'); }, []);
  return null;
}
