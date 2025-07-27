import React from 'react';
import { ComprehensiveTestingSuite } from '@/components/settings/ComprehensiveTestingSuite';

const Testing = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Testing</h1>
        <p className="text-muted-foreground">
          Comprehensive testing and validation suite
        </p>
      </div>
      <ComprehensiveTestingSuite />
    </div>
  );
};

export default Testing;