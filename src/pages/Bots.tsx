import { EnhancedMultiAccountBotManager } from "@/components/bots/EnhancedMultiAccountBotManager";
import { RealMoneyTradingSystem } from "@/components/trading/RealMoneyTradingSystem";
import { StressTester } from "@/components/trading/StressTester";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Bots = () => {
  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="bots" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="bots">AI Trading Bots</TabsTrigger>
          <TabsTrigger value="real-trading">Real Money Trading</TabsTrigger>
          <TabsTrigger value="stress-test">Stress Testing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bots">
          <EnhancedMultiAccountBotManager />
        </TabsContent>
        
        <TabsContent value="real-trading">
          <RealMoneyTradingSystem />
        </TabsContent>
        
        <TabsContent value="stress-test">
          <StressTester />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Bots;