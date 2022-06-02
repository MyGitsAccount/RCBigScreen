import { defineStore } from 'pinia';
interface UserInfo {
  userName?: string | null;
  id?: string | null;
  jwt?: string;
}
export const useUserStore = defineStore('user', {
  state: () => {
    const userInfo: UserInfo = {};
    return {
      userInfo,
    };
  },
  getters: {
    getToken: state => state.userInfo.jwt,
    getUserName: state => state?.userInfo?.userName,
  },
  actions: {
    saveUserInfo(info: any) {
      Object.assign(this.userInfo, info);
    },
    deleteUserInfo() {
      this.userInfo = {};
    },
  },

  persist: {
    enabled: true,
    strategies: [
      {
        storage: localStorage,
        paths: ['token', 'ipcToken', 'userInfo'],
      },
    ],
  },
});
