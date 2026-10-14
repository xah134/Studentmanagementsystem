'use client';

import React, { useEffect, useState } from 'react';
import { KpiWidget } from '@/components/kpi/kpi-widget';
import { Building2 } from 'lucide-react';

export function InstitutionCountKpi() {
  const [value, setValue] = useState<number | null>(null);
  const [description, setDescription] = useState<string>('Registered institutions');

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_STUDENT_PORTAL_API_URL || 'http://localhost:5156/api';
    
    fetch(`${apiUrl}/institutions?page=1&pageSize=1`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load institutions count');
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.summary && typeof data.summary.totalCount === 'number') {
          setValue(data.summary.totalCount);
        } else {
          throw new Error('Invalid response structure');
        }
      })
      .catch((err) => {
        setDescription(err.message || 'Error loading count');
      });
  }, []);

  return (
    <KpiWidget
      label="Institutions"
      value={value}
      description={description}
      icon={Building2}
    />
  );
}