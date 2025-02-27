import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Image, StyleSheet, View} from 'react-native';
import {ActivityIndicator, Button, Card, Divider, Text, useTheme} from 'react-native-paper';
import {clearHistory, getHistory, HistoryItem} from '../../src/services/storageService';
import {RootStackParamList} from '../navigation/AppNavigator';

type HistoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'History'>;

const HistoryScreen = () => {
  const navigation = useNavigation<HistoryScreenNavigationProp>();
  const theme = useTheme();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const historyItems = await getHistory();
      setHistory(historyItems);
    } catch (error) {
      console.error('Error loading history:', error);
      Alert.alert('Error', 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all chat history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearHistory();
              setHistory([]);
              Alert.alert('Success', 'History cleared successfully');
            } catch (error) {
              console.error('Error clearing history:', error);
              Alert.alert('Error', 'Failed to clear history');
            }
          },
        },
      ]
    );
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isExpanded = expandedItems[item.id] || false;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.headerRow}>
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
            <Text style={styles.provider}>{item.provider}</Text>
          </View>
          
          <Text style={styles.prompt} numberOfLines={isExpanded ? undefined : 2}>
            {item.prompt || 'Image analysis'}
          </Text>
          
          {item.imageUri && (
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.imageUri }} 
                style={styles.image} 
                resizeMode="contain" 
              />
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.response} numberOfLines={isExpanded ? undefined : 3}>
            {item.response}
          </Text>
          
          <Button 
            onPress={() => toggleExpand(item.id)} 
            compact 
            mode="text"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </Button>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conversation History</Text>
        {history.length > 0 && (
          <Button 
            mode="text" 
            onPress={handleClearHistory}
            icon="delete"
          >
            Clear All
          </Button>
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversation history yet.</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Home')}
            style={styles.startButton}
          >
            Start a Conversation
          </Button>
        </View>
      ) : (
        <FlatList
          data={history}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  provider: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    textTransform: 'capitalize',
  },
  prompt: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  response: {
    fontSize: 14,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 8,
  },
  imageContainer: {
    marginVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: 150,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    marginTop: 16,
  },
});

export default HistoryScreen; 