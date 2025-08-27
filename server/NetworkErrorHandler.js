// 网络请求错误处理
class NetworkErrorHandler {
    constructor() {
      this.errorMessages = {
        NETWORK_ERROR: '网络连接失败，请检查网络设置',
        TIMEOUT_ERROR: '请求超时，请重试',
        SERVER_ERROR: '服务器错误，请稍后再试',
        UNAUTHORIZED: '身份验证失败，请重新登录',
        FORBIDDEN: '无权访问该资源',
        NOT_FOUND: '请求的资源不存在',
        UNKNOWN_ERROR: '未知错误，请稍后再试'
      };
    }
  
    // 处理网络错误
    handleNetworkError(error) {
      console.error('Network error:', error);
      
      let errorMessage = this.errorMessages.UNKNOWN_ERROR;
      let errorType = 'UNKNOWN_ERROR';
      
      if (!error) {
        return { message: errorMessage, type: errorType };
      }
      
      // 处理不同类型的错误
      if (error.message && error.message.includes('Network Error')) {
        errorMessage = this.errorMessages.NETWORK_ERROR;
        errorType = 'NETWORK_ERROR';
      } else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        errorMessage = this.errorMessages.TIMEOUT_ERROR;
        errorType = 'TIMEOUT_ERROR';
      } else if (error.response) {
        // 服务器响应错误
        const status = error.response.status;
        
        switch (status) {
          case 401:
            errorMessage = this.errorMessages.UNAUTHORIZED;
            errorType = 'UNAUTHORIZED';
            break;
          case 403:
            errorMessage = this.errorMessages.FORBIDDEN;
            errorType = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = this.errorMessages.NOT_FOUND;
            errorType = 'NOT_FOUND';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = this.errorMessages.SERVER_ERROR;
            errorType = 'SERVER_ERROR';
            break;
          default:
            errorMessage = error.response.data?.message || this.errorMessages.UNKNOWN_ERROR;
            errorType = `SERVER_ERROR_${status}`;
        }
      } else if (error.request) {
        // 请求已发出但没有收到响应
        errorMessage = this.errorMessages.NETWORK_ERROR;
        errorType = 'NETWORK_ERROR';
      }
      
      return { message: errorMessage, type: errorType };
    }
  
    // 记录错误日志
    logError(error, context = '') {
      const timestamp = new Date().toISOString();
      const errorInfo = this.handleNetworkError(error);
      
      console.error(`[${timestamp}] Error in ${context}:`, {
        message: error.message,
        type: errorInfo.type,
        handledMessage: errorInfo.message
      });
    }
  }

  export const networkErrorHandler = new NetworkErrorHandler();