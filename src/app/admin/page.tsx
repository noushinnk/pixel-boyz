"use client";

import { useRouter } from 'next/navigation';
import { AdminPage } from '@/views/AdminPage';

export default function AdminRoute() {
  const router = useRouter();
  return <AdminPage navigate={(path) => router.push(path)} />;
}
