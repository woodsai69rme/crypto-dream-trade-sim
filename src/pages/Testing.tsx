import React from 'react';
import { ComprehensiveTestingSuite } from '@/components/settings/ComprehensiveTestingSuite';
import { RealTradingValidator } from '@/components/testing/RealTradingValidator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Testing = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">System Testing</h1>
        <p className="text-muted-foreground">
          Comprehensive testing and validation suite
        </p>
      </div>
      <Tabs defaultValue="comprehensive" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comprehensive">System Audit</TabsTrigger>
          <TabsTrigger value="real-trading">Real Trading Validation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="comprehensive">
          <ComprehensiveTestingSuite />
        </TabsContent>
        
        <TabsContent value="real-trading">
          <RealTradingValidator />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Testing;