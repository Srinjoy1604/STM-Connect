import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Text, PermissionsAndroid } from 'react-native';
import ConfigForm from '../components/ConfigForm';
import Feedback from '../components/Feedback';
import NetInfo from "react-native-wifi-reborn";
import { Device, WifiNetwork } from '../types';
import axios from 'axios';
import { Alert, Linking } from 'react-native';
import qs from 'qs'; // Import qs for form encoding

const HomeScreen: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [ssid, setSsid] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [securityId, setSecurityId] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [devices, setDevices] = useState<Device[]>([]);

  const checkWiFiStatus = async (): Promise<boolean> => {
    try {
      const currentSSID = await NetInfo.getCurrentWifiSSID();
      console.log('Current SSID:', currentSSID);

      if (!currentSSID) {
        setFeedback('NACK: No Wi-Fi connection detected. Please enable Wi-Fi and connect to a network.');
        Alert.alert(
          'Wi-Fi Required',
          'Please enable Wi-Fi and connect to a network to scan for devices.',
          [{ text: 'Open Wi-Fi Settings', onPress: () => Linking.openSettings() }]
        );
        return false;
      }
      return true;
    } catch (error: unknown) {
      const errorDetails = error as { message: string; code?: string };
      console.log('Error checking Wi-Fi status:', {
        message: errorDetails.message,
        code: errorDetails.code,
      });
      setFeedback(`NACK: Error checking Wi-Fi status - ${errorDetails.message}`);
      return false;
    }
  };

  const scanForDevices = async () => {
    console.log('Starting Wi-Fi scan...');
    if (!(await checkWiFiStatus())) return;

    try {
      const wifiList: WifiNetwork[] = await NetInfo.loadWifiList();
      const espDevices: Device[] = wifiList
        .filter((network: WifiNetwork) => network.SSID && network.SSID.startsWith('ESP32_'))
        .map((network: WifiNetwork) => ({
          SSID: network.SSID,
          BSSID: network.BSSID || '',
        }));
      setDevices(espDevices);
      if (espDevices.length === 0) {
        setFeedback('No ESP32 devices found. Ensure they are broadcasting.');
      }
    } catch (error: unknown) {
      const errorDetails = error as { message: string; code?: string };
      console.log('Scan error:', {
        message: errorDetails.message,
        code: errorDetails.code,
      });
      setFeedback(`NACK: Error scanning networks - ${errorDetails.message}`);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      if (!(await checkWiFiStatus())) return;

      await requestPermissions().then(() => scanForDevices());
    };

    initialize();
  }, []);

  const requestPermissions = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.NEARBY_WIFI_DEVICES,
      ]);

      const deniedPermissions = Object.entries(granted).filter(
        ([, value]) => value !== PermissionsAndroid.RESULTS.GRANTED
      );

      const neverAskAgain = Object.entries(granted).filter(
        ([, value]) => value === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
      );

      if (deniedPermissions.length === 0) {
        console.log('✅ All permissions granted');
      } else {
        console.log('❌ Some permissions denied:', granted);
        setFeedback('NACK: Some permissions were denied');

        if (neverAskAgain.length > 0) {
          console.log('🚫 Permissions set to never_ask_again:', neverAskAgain);
          setFeedback('Permission permanently denied. Please enable from settings.');

          Alert.alert(
            'Permissions Required',
            'Some permissions were permanently denied. Please enable them in Settings.',
            [
              { text: 'Open Settings', onPress: () => Linking.openSettings() },
              { text: 'Cancel', style: 'cancel' },
            ]
          );
        }
      }
    } catch (err) {
      console.warn('Permission request error:', err);
      setFeedback('NACK: Error requesting permissions');
    }
  };

  const connectToESP32 = async (ssid: string) => {
    try {
      console.log('Attempting to connect to', ssid);
      await NetInfo.connectToProtectedSSID(ssid, '12345678', false, false);
      console.log(`Connected to ${ssid}`);
      return true;
    } catch (error) {
      console.log('Connection error:', error);
      setFeedback(`NACK: Failed to connect to ${ssid} - ${(error as Error).message}`);
      return false;
    }
  };

  const submitConfig = async () => {
    if (!selectedDevice || !ssid || !password || !securityId) {
      setFeedback('Please select a device and fill all fields!');
      return;
    }

    const vehicleId = selectedDevice.SSID.replace('ESP32_', '');
    setFeedback(`ACK: Connecting to ${selectedDevice.SSID}...`);

    const connected = await connectToESP32(selectedDevice.SSID);
    if (!connected) {
      console.log('Connection failed - stopping');
      return;
    }
    console.log('Connected successfully - proceeding to send config');

    setFeedback(`ACK: Sending config to ${selectedDevice.SSID}...`);

    const configData = {
      vehicleId,
      ssid,
      password,
      securityId,
    };

    try {
      const formData = qs.stringify(configData);
      console.log('Sending HTTP POST with form data:', formData);
      const response = await axios.post(
        'http://192.168.4.1/config',
        formData,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );
      console.log('HTTP response:', response.status, response.data);
      if (response.status === 200) {
        setFeedback(`ACK: Device ${vehicleId} config sent successfully!`);
      } else {
        setFeedback(`NACK: Failed to send config - HTTP ${response.status}: ${response.data}`);
      }
    } catch (error: any) {
      console.log('HTTP error:', error.message, error.response?.data);
      const errorMessage = error.response?.data || error.message;
      setFeedback(`NACK: Error sending config - ${errorMessage}`);
    }
  };

  const handleReload = async () => {
    setFeedback('Scanning for devices...');
    await scanForDevices();
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity 
      style={styles.deviceItem} 
      onPress={() => setSelectedDevice(item)}
    >
      <Text>{item.SSID} ({item.BSSID})</Text>
      {selectedDevice?.SSID === item.SSID && <Text style={styles.selected}>Selected</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.reloadButton} onPress={handleReload}>
        <Text style={styles.reloadButtonText}>Reload Devices</Text>
      </TouchableOpacity>
      <FlatList
        data={devices}
        renderItem={renderDevice}
        keyExtractor={(item) => item.BSSID || item.SSID}
        ListEmptyComponent={<Text style={styles.NodeviceText}>No ESP32 devices found. Scanning...</Text>}
        style={styles.ListArea}
      />
      <Feedback feedback={feedback} />
      {selectedDevice && (
        <ConfigForm
          ssid={ssid}
          password={password}
          securityId={securityId}
          setSsid={setSsid}
          setPassword={setPassword}
          setSecurityId={setSecurityId}
          onSubmit={submitConfig}
        />
      )}
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 , display:"flex",flexDirection:"column",backgroundColor:"#f3cc44" },
  deviceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor:'	#d4d2a5'
  },
  ListArea:{
    borderColor:"black",
    backgroundColor:"#a4e8f3",
    padding:"2%",
    height: "20%",
    flexGrow:0,
    overflow:'scroll'
    
  },
  NodeviceText:{
    color:"red",
    fontSize:20,
    fontWeight:500
  },
  selected: { color: 'green' },
  reloadButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;