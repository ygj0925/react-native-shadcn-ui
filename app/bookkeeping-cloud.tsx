import React from 'react';
import Screen from '@/features/bookkeeping/cloud-screen';
import { PrivacyGate } from '@/features/bookkeeping/native-tools';
export default function BookkeepingCloudRoute() {
  return (
    <PrivacyGate>
      <Screen />
    </PrivacyGate>
  );
}
