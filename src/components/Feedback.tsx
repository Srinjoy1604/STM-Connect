import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import globalStyles from '../styles/styles';

interface FeedbackProps {
  feedback: string;
}

const Feedback: React.FC<FeedbackProps> = ({ feedback }) => {
  return (
    <View style={styles.feedbackContainer}>
      <Text style={globalStyles.feedback}>{feedback}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  feedbackContainer: { marginTop: 20 },
});

export default Feedback;