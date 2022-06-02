import { getCurrentInstance } from 'vue';

/**
 * 通过url获取配置json文件
 * @param params
 * @returns
 */
export function getJson(params: { url: string }): Promise<any> {
  return new Promise(reslove => {
    const instance = getCurrentInstance();
    const Resource = instance?.appContext.config.globalProperties.Resource;
    Resource.fetchJson({ url: params.url }).then((data: any) => {
      reslove(data);
    });
  });
}
