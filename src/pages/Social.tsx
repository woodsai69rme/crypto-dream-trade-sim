import React from 'react';
import { SocialTradingSystem } from '@/components/SocialTradingSystem';

const Social = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Social Trading</h1>
        <p className="text-muted-foreground">
          Follow top traders and copy their strategies
        </p>
      </div>
      <SocialTradingSystem />
    </div>
  );
};

export default Social;