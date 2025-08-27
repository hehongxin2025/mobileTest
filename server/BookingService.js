import { networkErrorHandler } from './NetworkErrorHandler';

// 请求船舶数据
class BookingService {
    // 获取船舶预订数据
    async fetchShipBookings() {
        try {
            const MOCK_BOOKING_DATA = require('../mockData/booking.json');

            await new Promise((resolve) => setTimeout(() => {
                resolve();
            }, 1000))
            return MOCK_BOOKING_DATA;
        } catch (error) {
            networkErrorHandler.logError(error, 'BookingServer.fetchShipBookings');
            throw error;
        }
    }
}


export const bookingService = new BookingService();