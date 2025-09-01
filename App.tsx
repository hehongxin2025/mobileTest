import React, { useState } from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import BookingList from './components/BookingList';

const App = () => {
  const [currentPage, setCurrentPage] = useState('bookings');

  return (
    <View style={styles.appContainer}>
      <View style={styles.tabBar}>
        <Button
          title="船舶预订"
          onPress={() => setCurrentPage('bookings')}
          color={currentPage === 'bookings' ? '#3182ce' : '#a0aec0'}
        />
        <Button
          title="其他页面"
          onPress={() => setCurrentPage('other')}
          color={currentPage === 'other' ? '#3182ce' : '#a0aec0'}
        />
      </View>

      {currentPage === 'bookings' ? (
        <BookingList isVisible={true} />
      ) : (
        <View style={styles.otherPage}>
          <Text>其他页面内容</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f5f5f5',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  otherPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default App;
