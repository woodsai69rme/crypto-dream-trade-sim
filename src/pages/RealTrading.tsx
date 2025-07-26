
import React from 'react';
import { RealTradingSetup } from '@/components/trading/RealTradingSetup';

const RealTrading = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Real Money Trading</h1>
        <p className="text-muted-foreground">
          Connect your exchange accounts and trade with real money. Use with extreme caution.
        </p>
      </div>
      <RealTradingSetup />
    </div>
  );
};

export default RealTrading;
