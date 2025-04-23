import React from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Text } from 'react-native';
import globalStyles from '../styles/styles';

interface ConfigFormProps {
  ssid: string;
  password: string;
  securityId: string;
  setSsid: (value: string) => void;
  setPassword: (value: string) => void;
  setSecurityId: (value: string) => void;
  onSubmit: () => void;
}

const ConfigForm: React.FC<ConfigFormProps> = ({
  ssid,
  password,
  securityId,
  setSsid,
  setPassword,
  setSecurityId,
  onSubmit,
}) => {
  return (
    <View style={styles.form}>
      <TextInput
        style={globalStyles.input}
        placeholder="WiFi SSID"
        value={ssid}
        onChangeText={setSsid}
        placeholderTextColor="#888"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="WiFi Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Security ID"
        value={securityId}
        onChangeText={setSecurityId}
        placeholderTextColor="#888"
      />
      <TouchableOpacity onPress={onSubmit} style={styles.SubmitBut}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: 50,
    marginTop: 10,
    padding: "2%",
    backgroundColor: "#F0F0F0",
    borderRadius: 15
  },
  SubmitBut: {
    backgroundColor: '#3e9b3d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ConfigForm;