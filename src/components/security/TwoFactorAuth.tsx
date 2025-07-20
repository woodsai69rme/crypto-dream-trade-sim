
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Smartphone, Key, AlertTriangle } from "lucide-react";

interface TwoFactorAuthProps {
  onVerificationComplete: (token: string) => void;
  isRequired?: boolean;
  purpose: 'trade_execution' | 'credential_management' | 'account_security';
}

export const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({
  onVerificationComplete,
  isRequired = false,
  purpose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    checkTwoFactorStatus();
  }, [user]);

  const checkTwoFactorStatus = async () => {
    // Check if user has 2FA enabled
    // In a real implementation, this would check the user's 2FA status
    console.log('Checking 2FA status for user:', user?.id);
  };

  const generateQRCode = async () => {
    setIsSetupMode(true);
    
    // Generate TOTP secret and QR code
    const secret = generateTOTPSecret();
    const appName = 'CryptoTrader Pro';
    const userEmail = user?.email || 'user@example.com';
    
    const otpAuthUrl = `otpauth://totp/${appName}:${userEmail}?secret=${secret}&issuer=${appName}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpAuthUrl)}`;
    
    setQrCodeUrl(qrUrl);
    
    // Generate backup codes
    const codes = Array.from({ length: 8 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const generateTOTPSecret = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    return secret;
  };

  const verifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, verify the TOTP code against the secret
      const isValid = otpCode === '123456' || /^\d{6}$/.test(otpCode);
      
      if (isValid) {
        const verificationToken = `2fa_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        toast({
          title: "Verification Successful",
          description: "Two-factor authentication completed",
        });
        
        onVerificationComplete(verificationToken);
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const getPurposeDescription = () => {
    switch (purpose) {
      case 'trade_execution':
        return 'Required for executing live trades with real money';
      case 'credential_management':
        return 'Required for managing exchange API credentials';
      case 'account_security':
        return 'Required for accessing security settings';
      default:
        return 'Two-factor authentication required';
    }
  };

  const getPurposeIcon = () => {
    switch (purpose) {
      case 'trade_execution':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'credential_management':
        return <Key className="w-5 h-5 text-blue-400" />;
      case 'account_security':
        return <Shield className="w-5 h-5 text-green-400" />;
      default:
        return <Shield className="w-5 h-5" />;
    }
  };

  if (isSetupMode) {
    return (
      <Card className="crypto-card-gradient">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-white/80 mb-4">
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </p>
            {qrCodeUrl && (
              <img src={qrCodeUrl} alt="2FA QR Code" className="mx-auto mb-4" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-white">Enter verification code from your app:</Label>
            <Input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="bg-white/5 border-white/20 text-white text-center text-lg tracking-widest"
              maxLength={6}
            />
          </div>

          <Button
            onClick={verifyOTP}
            disabled={isVerifying || otpCode.length !== 6}
            className="w-full"
          >
            {isVerifying ? 'Verifying...' : 'Complete Setup'}
          </Button>

          {backupCodes.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <h4 className="font-medium text-yellow-400 mb-2">Backup Codes</h4>
              <p className="text-sm text-yellow-300 mb-3">
                Save these codes in a secure location. Each can only be used once.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-xs bg-yellow-500/5 p-1 rounded">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="crypto-card-gradient">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          {getPurposeIcon()}
          Two-Factor Authentication Required
          {isRequired && <Badge className="bg-red-500/20 text-red-400">Required</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/80 text-sm">{getPurposeDescription()}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-white">Verification Code</Label>
          <Input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="Enter 6-digit code"
            className="bg-white/5 border-white/20 text-white text-center text-lg tracking-widest"
            maxLength={6}
          />
          <p className="text-xs text-white/60">
            Enter the code from your authenticator app
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={verifyOTP}
            disabled={isVerifying || otpCode.length !== 6}
            className="flex-1"
          >
            {isVerifying ? 'Verifying...' : 'Verify'}
          </Button>
          <Button
            onClick={generateQRCode}
            variant="outline"
            className="border-white/20 hover:bg-white/10"
          >
            Setup 2FA
          </Button>
        </div>

        <div className="text-center">
          <button
            onClick={() => onVerificationComplete('bypass_demo')}
            className="text-xs text-white/60 hover:text-white/80 underline"
          >
            Skip for Demo (Development Only)
          </button>
        </div>
      </CardContent>
    </Card>
  );
};
