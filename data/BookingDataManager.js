import { bookingService } from '../service/BookingService';
import CacheDataHandler from '../service/CacheDataHandler';
import { isExpired } from '../utils/timeUtils';

// 数据管理器
class BookingDataManager {
    constructor() {
        this.cacheDataHandler = new CacheDataHandler({ // 缓存处理器
            CACHE_KEY: 'SHIP_BOOKING_DATA',
            CACHE_EXPIRY_KEY: 'SHIP_BOOKING_DATA_EXPIRY',
            CACHE_DURATION: 5 * 60 * 1000 // 5分钟缓存
        });
    }

    // 获取数据
    async getShipBookings(forceRefresh = false) {
        try {
            // 如果强制刷新，直接获取新数据
            if (forceRefresh) {
                return await this._fetchAndCacheData();
            }

            // 检查缓存是否有效
            const cachedData = await this.cacheDataHandler.getCachedData();

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
            const cacheExpired = await this.cacheDataHandler.isCacheExpired();
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
            const expiredData = await this.cacheDataHandler.getCachedData();
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

    // 获取并缓存数据
    async _fetchAndCacheData() {
        const data = await bookingService.fetchShipBookings();
        await this.cacheDataHandler.cacheData(data);
        return data;
    }
}

export const bookingDataManager = new BookingDataManager();