import { Button, StyleSheet, Text, View } from 'react-native';

export const ListScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>List Screen</Text>
      <Text style={styles.subtitle}>Your tasks and lists will appear here.</Text>
      <Button title="List action placeholder" onPress={() => undefined} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
  },
});
