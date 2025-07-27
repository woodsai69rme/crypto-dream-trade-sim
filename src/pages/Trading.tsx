
import React, { useState } from 'react';
import { TradingInterface } from '@/components/trading/TradingInterface';
import { TradingViewChart } from '@/components/charts/TradingViewChart';
import { ReportExporter } from '@/components/exports/ReportExporter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMultipleAccounts } from '@/hooks/useMultipleAccounts';

const Trading = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const { accounts, currentAccount } = useMultipleAccounts();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trading Dashboard</h1>
        <ReportExporter 
          data={{ trades: [], balance: currentAccount?.balance || 0 }}
          reportType="trades"
          accountName={currentAccount?.account_name}
        />
      </div>

      <Tabs defaultValue="interface" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="interface">Trading Interface</TabsTrigger>
          <TabsTrigger value="charts">Advanced Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="interface" className="space-y-6">
          <TradingInterface />
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <TradingViewChart 
                symbol={selectedSymbol} 
                interval="1D"
                theme="light"
                height={500}
              />
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Symbol Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'LINK'].map(symbol => (
                      <button
                        key={symbol}
                        onClick={() => setSelectedSymbol(symbol)}
                        className={`p-2 rounded text-sm font-medium transition-colors ${
                          selectedSymbol === symbol
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trading;
