import AsyncStorage from '@react-native-async-storage/async-storage';
import { isExpired } from '../utils/timeUtils';

// 缓存数据处理类
class CacheDataHandler {
    constructor(props) {
        this.CACHE_KEY = props.CACHE_KEY;
        this.CACHE_EXPIRY_KEY = props.CACHE_EXPIRY_KEY;
        this.CACHE_DURATION = props.CACHE_DURATION;
    }

    // 缓存数据
    async cacheData(data) {
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
    async getCachedData() {
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


    // 检查缓存是否过期
    async isCacheExpired() {
        try {
            const expiryTime = await AsyncStorage.getItem(this.CACHE_EXPIRY_KEY);
            if (!expiryTime) return true;

            return isExpired(expiryTime)
        } catch (error) {
            console.error('Error checking cache expiry:', error);
            return true;
        }
    }
}

export default CacheDataHandler;