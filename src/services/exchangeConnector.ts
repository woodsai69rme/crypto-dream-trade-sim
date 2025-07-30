
import { supabase } from '@/integrations/supabase/client';
import { SecureStorage } from '@/utils/encryption';
import { BrowserExchangeConnector, SUPPORTED_EXCHANGES } from './browserExchangeConnector';

export interface ExchangeConfig {
  id: string;
  name: string;
  apiUrl: string;
  testnetUrl: string;
  supportedOrderTypes: string[];
  minTradeAmount: number;
  maxTradeAmount: number;
  tradingFee: number;
}

export { SUPPORTED_EXCHANGES };

export class ExchangeConnector extends BrowserExchangeConnector {
  constructor(exchangeName: string, isTestnet: boolean = true) {
    super(exchangeName, isTestnet);
  }
}
