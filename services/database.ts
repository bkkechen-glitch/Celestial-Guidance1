
import { UserProfile } from '../types';

/**
 * 模拟云端数据库服务 (Database as a Service)
 * 在实际生产环境中，这里应调用 Supabase, Firebase 或 自建后端 API
 */
class DatabaseService {
  private readonly STORAGE_KEY = 'zodiac_cloud_db_mock';

  // 模拟网络延迟
  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取用户档案
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    await this.delay(800); // 模拟网络延迟
    const db = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    return db[uid] || null;
  }

  /**
   * 保存或更新用户档案到“数据库”
   */
  async saveProfile(profile: UserProfile): Promise<boolean> {
    await this.delay(1200); // 模拟保存时的写入延迟
    const db = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    
    const updatedProfile = {
      ...profile,
      lastSync: new Date().toISOString()
    };
    
    db[profile.uid] = updatedProfile;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    return true;
  }

  /**
   * 删除用户档案
   */
  async deleteProfile(uid: string): Promise<boolean> {
    await this.delay(500);
    const db = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    delete db[uid];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(db));
    return true;
  }

  /**
   * 生成或获取本地 UID (在小程序中通常通过 wx.login 获取)
   */
  getOrCreateUID(): string {
    let uid = localStorage.getItem('zodiac_local_uid');
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('zodiac_local_uid', uid);
    }
    return uid;
  }
}

export const dbService = new DatabaseService();
