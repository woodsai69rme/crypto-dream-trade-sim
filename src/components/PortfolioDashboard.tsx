
import { useRealTimePortfolio } from "@/hooks/useRealTimePortfolio";
import { SafePortfolioDashboard } from "./portfolio/SafePortfolioDashboard";

export const PortfolioDashboard = () => {
  const { portfolio, paperAccount, loading } = useRealTimePortfolio();

  return (
    <SafePortfolioDashboard 
      portfolio={portfolio}
      paperAccount={paperAccount}
      loading={loading}
    />
  );
};
