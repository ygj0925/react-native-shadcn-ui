import React from 'react';
import Screen from '@/features/bookkeeping/screen';
import { PrivacyGate } from '@/features/bookkeeping/native-tools';
export default function BookkeepingRoute() {
  return (
    <PrivacyGate>
      <Screen />
    </PrivacyGate>
  );
}
