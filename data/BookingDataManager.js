import AsyncStorage from '@react-native-async-storage/async-storage';
import { bookingService } from '../service/BookingService';
import { isExpired } from '../utils/timeUtils';

// 数据管理器
class BookingDataManager {
    constructor() {
        this.CACHE_KEY = 'SHIP_BOOKING_DATA';
        this.CACHE_EXPIRY_KEY = 'SHIP_BOOKING_DATA_EXPIRY';
        this.CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存
    }

    // 获取数据
    async getShipBookings(forceRefresh = false) {
        try {
            // 如果强制刷新，直接获取新数据
            if (forceRefresh) {
                return await this._fetchAndCacheData();
            }

            // 检查缓存是否有效
            const cachedData = await this._getCachedData();

            // 如果没有缓存数据，直接获取新数据
            if (!cachedData) {
                return await this._fetchAndCacheData();
            }

            // 检查数据是否过期
            if (isExpired(cachedData.expiryTime)) {
                console.log('Data expired, fetching new data');
                return await this._fetchAndCacheData();
            }

            // 数据未过期，检查缓存时间是否过期
            const cacheExpired = await this._isCacheExpired();
            if (cacheExpired) {
                // 缓存过期但数据未过期，后台静默更新数据
                console.log('Cache expired but data still valid, refreshing in background');
                this._fetchAndCacheData().catch(error =>
                    console.warn('Background data refresh failed:', error)
                );
            }

            return cachedData;
        } catch (error) {
            console.error('Error getting ship bookings:', error);

            // 出错也返回过期缓存
            const expiredData = await AsyncStorage.getItem(this.CACHE_KEY);
            if (expiredData) {
                console.log('Returning expired cache data due to error');
                const parsedData = JSON.parse(expiredData);
                // 标记为过期数据
                parsedData.isExpired = true;
                return parsedData;
            }

            throw error;
        }
    }

    // 检查缓存是否过期
    async _isCacheExpired() {
        try {
            const expiryTime = await AsyncStorage.getItem(this.CACHE_EXPIRY_KEY);
            if (!expiryTime) return true;

            return isExpired(expiryTime)
        } catch (error) {
            console.error('Error checking cache expiry:', error);
            return true;
        }
    }

    // 获取并缓存数据
    async _fetchAndCacheData() {
        const data = await bookingService.fetchShipBookings();
        await this._cacheData(data);
        return data;
    }

    // 缓存数据
    async _cacheData(data) {
        try {
            const dataString = JSON.stringify(data);
            const expiryTime = Date.now() + this.CACHE_DURATION;

            await AsyncStorage.multiSet([
                [this.CACHE_KEY, dataString],
                [this.CACHE_EXPIRY_KEY, expiryTime.toString()]
            ]);
        } catch (error) {
            console.error('Error caching data:', error);
            throw error;
        }
    }

    // 获取缓存数据
    async _getCachedData() {
        try {
            const data = await AsyncStorage.getItem(this.CACHE_KEY);
            if (!data) return null;

            return JSON.parse(data);
        } catch (error) {
            console.error('Error retrieving cached data:', error);
            return null;
        }
    }

    // 清除缓存
    async clearCache() {
        try {
            await AsyncStorage.multiRemove([this.CACHE_KEY, this.CACHE_EXPIRY_KEY]);
        } catch (error) {
            console.error('Error clearing cache:', error);
            throw error;
        }
    }
}

export const bookingDataManager = new BookingDataManager();