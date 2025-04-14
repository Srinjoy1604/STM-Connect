export interface ConfigData {
  ssid: string;
  bssid: string;
  password: string;
  hidden: boolean;
  reservedData?: string;
}

export interface SmartConfigResult {
  success: boolean;
  ip?: string;
}

export interface Device {
  SSID: string;
  BSSID: string;
}

export interface WifiNetwork {
  SSID: string;
  BSSID?: string;
}