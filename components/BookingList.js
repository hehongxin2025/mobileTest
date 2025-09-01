import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { bookingDataManager } from '../data/BookingDataManager.js';
import { getRemainingTime, formatDuration } from '../utils/timeUtils';

// 预订列表组件
const BookingList = ({ isVisible }) => {
    const [bookingData, setBookingData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // 加载数据
    const loadData = useCallback(async (forceRefresh = false) => {
        if (forceRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await bookingDataManager.getShipBookings(forceRefresh);
            console.log('Ship booking data:', data);
            setBookingData(data);
        } catch (error) {
            Alert.alert('错误', '获取船舶预订数据失败');
            console.error('Failed to load ship bookings:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // 加载数据
    useEffect(() => {
        if (isVisible) {
            loadData();
        }
    }, [isVisible, loadData]);

    // 渲染航段
    const renderSegmentItem = ({ item }) => (
        <View style={styles.segmentItem}>

            <View style={styles.routeContainer}>
                <View style={styles.location}>
                    <Text style={styles.locationTitle}> 出发地 </Text>
                    <Text style={styles.locationCode}>{item.originAndDestinationPair.origin.code}</Text>
                    <Text style={styles.locationName}>{item.originAndDestinationPair.origin.displayName}</Text>
                    <Text style={styles.city}>{item.originAndDestinationPair.originCity}</Text>
                </View>

                <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                </View>

                <View style={styles.location}>
                    <Text style={styles.locationTitle}> 目的地 </Text>
                    <Text style={styles.locationCode}>{item.originAndDestinationPair.destination.code}</Text>
                    <Text style={styles.locationName}>{item.originAndDestinationPair.destination.displayName}</Text>
                    <Text style={styles.city}>{item.originAndDestinationPair.destinationCity}</Text>
                </View>
            </View>
        </View>
    );

    // 渲染头部信息
    const renderHeader = () => {
        if (!bookingData) return null;

        return (
            <View style={styles.headerContainer}>
                <View style={styles.refContainer}>
                    <Text style={styles.label}>预订号:</Text>
                    <Text style={styles.value}>{bookingData.shipReference}</Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Text style={styles.label}>有效期:</Text>
                        <Text style={styles.value}>{getRemainingTime(bookingData.expiryTime)}</Text>
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.label}>总时长:</Text>
                        <Text style={styles.value}>{formatDuration(bookingData.duration)}</Text>
                    </View>
                </View>

                {bookingData.isExpired && (
                    <View style={styles.expiredWarning}>
                        <Text style={styles.expiredText}>注意: 网络异常请刷新</Text>
                    </View>
                )}

                <View style={styles.separator} />
                <Text style={styles.sectionTitle}>航段信息</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.pageHeader}>
                <Text style={styles.pageTitle}>船舶预订</Text>
                <Button title="刷新" onPress={() => loadData(bookingData)} />
            </View>

            {loading && <ActivityIndicator size="large" style={styles.loader} />}

            {bookingData && !loading && (
                <FlatList
                    data={bookingData.segments}
                    renderItem={renderSegmentItem}
                    keyExtractor={item => item.id.toString()}
                    ListHeaderComponent={renderHeader}
                    refreshing={refreshing}
                    onRefresh={() => loadData(true)}
                />
            )}

            {!bookingData && !loading && (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>暂无预订数据</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={() => loadData()}>
                        <Text style={styles.retryText}>重试</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff'
    },
    pageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a365d'
    },
    loader: {
        marginVertical: 20
    },
    headerContainer: {
        marginBottom: 16
    },
    refContainer: {
        marginBottom: 12
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12
    },
    infoItem: {
        flex: 1
    },
    label: {
        fontSize: 14,
        color: '#718096',
        marginBottom: 4
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2d3748'
    },
    expiredWarning: {
        backgroundColor: '#fed7d7',
        padding: 10,
        borderRadius: 6,
        marginBottom: 12
    },
    expiredText: {
        color: '#c53030',
        textAlign: 'center'
    },
    separator: {
        height: 1,
        backgroundColor: '#e2e8f0',
        marginVertical: 16
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a365d',
        marginBottom: 12
    },
    segmentItem: {
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0'
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    location: {
        flex: 1,
        alignItems: 'center'
    },
    locationTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#2d3748',
        marginBottom: 4
    },
    locationCode: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#3182ce',
        marginBottom: 4
    },
    locationName: {
        fontSize: 14,
        color: '#4a5568',
        textAlign: 'center',
        marginBottom: 4
    },
    city: {
        fontSize: 12,
        color: '#718096'
    },
    arrowContainer: {
        paddingHorizontal: 16
    },
    arrow: {
        fontSize: 20,
        color: '#a0aec0'
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40
    },
    emptyText: {
        fontSize: 16,
        color: '#718096',
        marginBottom: 16
    },
    retryButton: {
        backgroundColor: '#3182ce',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 6
    },
    retryText: {
        color: 'white',
        fontWeight: '500'
    }
});

export default BookingList;