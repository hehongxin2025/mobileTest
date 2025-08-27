// 计算剩余时间
export const getRemainingTime = (expiryTime) => {
    const now = Math.floor(Date.now() / 1000); // 当前时间戳
    const remaining = expiryTime - now;

    if (remaining <= 0) return "已过期";

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    return `${hours}小时${minutes}分钟`;
};

// 格式化持续时间
export const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours}小时${minutes}分钟`;
};

// 检查是否过期
export const isExpired = (expiryTime) => {
    const now = Math.floor(Date.now() / 1000); // 当前时间戳
    return now > parseInt(expiryTime, 10);
};