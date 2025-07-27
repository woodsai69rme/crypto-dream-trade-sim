
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Download, FileText, FileSpreadsheet, Image, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportExporterProps {
  data: any;
  reportType: 'portfolio' | 'trades' | 'analytics' | 'bots';
  accountName?: string;
}

export const ReportExporter = ({ data, reportType, accountName }: ReportExporterProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  const { toast } = useToast();

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      // Header
      doc.setFontSize(20);
      doc.text('CryptoTrader Pro Report', pageWidth / 2, 20, { align: 'center' });
      
      doc.setFontSize(12);
      doc.text(`Report Type: ${reportType.charAt(0).toUpperCase() + reportType.slice(1)}`, 20, 40);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 50);
      
      if (accountName) {
        doc.text(`Account: ${accountName}`, 20, 60);
      }

      // Content based on report type
      let yPosition = 80;
      
      if (reportType === 'portfolio') {
        doc.setFontSize(14);
        doc.text('Portfolio Summary', 20, yPosition);
        yPosition += 20;
        
        const portfolioData = [
          ['Metric', 'Value'],
          ['Total Balance', `$${data.balance?.toLocaleString() || '0'}`],
          ['Total P&L', `$${data.totalPnl?.toLocaleString() || '0'}`],
          ['Win Rate', `${data.winRate?.toFixed(2) || '0'}%`],
          ['Total Trades', `${data.totalTrades || '0'}`]
        ];
        
        (doc as any).autoTable({
          startY: yPosition,
          head: [portfolioData[0]],
          body: portfolioData.slice(1),
          theme: 'striped'
        });
      }
      
      if (reportType === 'trades') {
        doc.setFontSize(14);
        doc.text('Trade History', 20, yPosition);
        yPosition += 20;
        
        const tradeData = data.trades?.slice(0, 20).map((trade: any) => [
          trade.symbol,
          trade.side,
          trade.amount.toString(),
          `$${trade.price.toFixed(2)}`,
          new Date(trade.created_at).toLocaleDateString()
        ]) || [];
        
        (doc as any).autoTable({
          startY: yPosition,
          head: [['Symbol', 'Side', 'Amount', 'Price', 'Date']],
          body: tradeData,
          theme: 'striped'
        });
      }

      doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export Successful",
        description: `${reportType} report exported as PDF`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export PDF report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToCSV = () => {
    setIsExporting(true);
    try {
      let csvContent = '';
      
      if (reportType === 'trades' && data.trades) {
        csvContent = 'Symbol,Side,Amount,Price,Total Value,Date\n';
        data.trades.forEach((trade: any) => {
          csvContent += `${trade.symbol},${trade.side},${trade.amount},${trade.price},${trade.total_value},${trade.created_at}\n`;
        });
      } else if (reportType === 'portfolio') {
        csvContent = 'Metric,Value\n';
        csvContent += `Total Balance,${data.balance || 0}\n`;
        csvContent += `Total P&L,${data.totalPnl || 0}\n`;
        csvContent += `Win Rate,${data.winRate || 0}%\n`;
        csvContent += `Total Trades,${data.totalTrades || 0}\n`;
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${reportType} report exported as CSV`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export CSV report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = () => {
    setIsExporting(true);
    try {
      const jsonData = {
        reportType,
        accountName,
        generatedAt: new Date().toISOString(),
        data
      };
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: `${reportType} report exported as JSON`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export JSON report",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'json':
        exportToJSON();
        break;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv' | 'json') => setExportFormat(value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    JSON
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Export
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Export your {reportType} data in your preferred format for analysis or record keeping.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
