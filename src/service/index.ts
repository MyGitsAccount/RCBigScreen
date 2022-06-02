import Request from './request';
import { useUserStore } from '@/store';
// import router from '@/router';
import type { RequestConfig } from './request/types';

interface BmRequestConfig<T> extends RequestConfig {
  data?: T;
}
interface BmResponse<T> {
  statusCode: number;
  desc: string;
  data: T;
}

const request = new Request({
  baseURL: import.meta.env.VITE_BASE_URL as string,
  timeout: 1000 * 6,
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config: any) => {
      const userStore = useUserStore();
      config.headers.bitEmgToken = userStore.userInfo.jwt;
      return config;
    },
    // 响应拦截器
    responseInterceptors: (response: any) => {
      if (response.status === 200) {
        if (response.request.responseType === 'blob') {
          // 文件类型
          return response.data;
        }

        switch (response.data.code) {
          case '20000': // 请求成功
            return response.data.data;
          default:
            setTimeout(() => {
              (window as any).$message?.error(response.data.data || response.data.message || '请求失败');
            }, 1000);
            return Promise.reject(response.data);
        }
      } else {
        return Promise.reject();
      }
    },
    responseInterceptorsCatch: (error: any) => {
      // useUserStore().deleteUserInfo();
      // router.replace('/login');
      setTimeout(() => {
        (window as any).$message?.error('令牌已过期,重新登录');
      }, 500);
      console.log(error);

      return Promise.reject(error);
    },
  },
});

/**
 * @description: 函数的描述
 * @generic D 请求参数
 * @generic T 响应结构
 * @param {BmRequestConfig} config 不管是GET还是POST请求都使用data
 * @returns {Promise}
 */
const bmRequest = <D = any, T = any>(config: BmRequestConfig<D>) => {
  const { method = 'GET' } = config;
  if (method === 'get' || method === 'GET') {
    config.params = config.data;
  }
  return request.request<BmResponse<T>>(config);
};
// 取消请求
export const cancelRequest = (url: string | string[]) => {
  return request.cancelRequest(url);
};
// 取消全部请求
export const cancelAllRequest = () => {
  return request.cancelAllRequest();
};

export default bmRequest;
