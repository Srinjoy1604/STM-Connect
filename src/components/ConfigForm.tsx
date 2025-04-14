import React from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
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
      />
      <TextInput
        style={globalStyles.input}
        placeholder="WiFi Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={globalStyles.input}
        placeholder="Security ID"
        value={securityId}
        onChangeText={setSecurityId}
      />
      <Button title="Submit" onPress={onSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  form: {
    marginBottom: 50,
    marginTop: 10,
    padding:"2%",
    backgroundColor: "wheat",
  },
});

export default ConfigForm;