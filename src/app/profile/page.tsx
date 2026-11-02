"use client";

import { useRouter } from 'next/navigation';
import { ProfilePage } from '@/views/ProfilePage';

export default function ProfileRoute() {
  const router = useRouter();
  return <ProfilePage navigate={(path) => router.push(path)} />;
}
