import { UserAnalytics, PerformanceMetrics, MEVDetection } from '../types';

class DatabaseService {
  // In-memory storage (replace with actual database in production)
  private userAnalytics: Map<string, UserAnalytics> = new Map();
  private mevAttacks: MEVDetection[] = [];
  private performanceMetrics: PerformanceMetrics = {
    totalBlocksMonitored: 0,
    totalMEVDetected: 0,
    totalValueProtected: '0',
    avgResponseTime: 0,
    systemUptime: Date.now(),
    activeUsers: 0,
  };

  constructor() {
    console.log('💾 Database service initialized (in-memory mode)');
  }

  // User Analytics
  async saveUserAnalytics(address: string, data: Partial<UserAnalytics>): Promise<void> {
    const existing = this.userAnalytics.get(address.toLowerCase()) || {
      address: address.toLowerCase(),
      totalTransactions: 0,
      protectedTransactions: 0,
      mevSaved: '0',
      avgGasSaved: '0',
      lastActive: Date.now(),
    };

    this.userAnalytics.set(address.toLowerCase(), {
      ...existing,
      ...data,
      lastActive: Date.now(),
    });
  }

  async getUserAnalytics(address: string): Promise<UserAnalytics | null> {
    return this.userAnalytics.get(address.toLowerCase()) || null;
  }

  async getAllUserAnalytics(): Promise<UserAnalytics[]> {
    return Array.from(this.userAnalytics.values());
  }

  async incrementUserTransaction(address: string, isProtected: boolean = false): Promise<void> {
    const user = await this.getUserAnalytics(address) || {
      address: address.toLowerCase(),
      totalTransactions: 0,
      protectedTransactions: 0,
      mevSaved: '0',
      avgGasSaved: '0',
      lastActive: Date.now(),
    };

    user.totalTransactions++;
    if (isProtected) {
      user.protectedTransactions++;
    }

    await this.saveUserAnalytics(address, user);
  }

  // MEV Attacks
  async saveMEVAttack(detection: MEVDetection): Promise<void> {
    this.mevAttacks.push(detection);
    this.performanceMetrics.totalMEVDetected++;
  }

  async getMEVAttacks(limit: number = 100): Promise<MEVDetection[]> {
    return this.mevAttacks.slice(-limit);
  }

  async getMEVAttacksByUser(address: string): Promise<MEVDetection[]> {
    return this.mevAttacks.filter(
      (attack) => attack.targetedUser?.toLowerCase() === address.toLowerCase()
    );
  }

  async getMEVStatistics() {
    const total = this.mevAttacks.length;
    const last24h = this.mevAttacks.filter(
      (attack) => attack.timestamp > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    const byType = this.mevAttacks.reduce((acc, attack) => {
      acc[attack.mevType] = (acc[attack.mevType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = this.mevAttacks.reduce((acc, attack) => {
      acc[attack.severity] = (acc[attack.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, last24h, byType, bySeverity };
  }

  // Performance Metrics
  async updatePerformanceMetrics(data: Partial<PerformanceMetrics>): Promise<void> {
    this.performanceMetrics = {
      ...this.performanceMetrics,
      ...data,
    };
  }

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      ...this.performanceMetrics,
      activeUsers: this.userAnalytics.size,
    };
  }

  async incrementBlocksMonitored(): Promise<void> {
    this.performanceMetrics.totalBlocksMonitored++;
  }

  // Cleanup old data
  async cleanup(maxAge: number = 24 * 60 * 60 * 1000): Promise<void> {
    const cutoff = Date.now() - maxAge;
    
    // Remove old MEV attacks
    this.mevAttacks = this.mevAttacks.filter((attack) => attack.timestamp > cutoff);

    // Remove inactive users
    const activeAddresses = Array.from(this.userAnalytics.entries())
      .filter(([_, user]) => user.lastActive > cutoff)
      .map(([address]) => address);

    const newUserAnalytics = new Map<string, UserAnalytics>();
    activeAddresses.forEach((address) => {
      const user = this.userAnalytics.get(address);
      if (user) {
        newUserAnalytics.set(address, user);
      }
    });

    this.userAnalytics = newUserAnalytics;

    console.log('🧹 Cleanup completed');
  }

  // Export data (for backup or migration)
  async exportData() {
    return {
      userAnalytics: Array.from(this.userAnalytics.entries()),
      mevAttacks: this.mevAttacks,
      performanceMetrics: this.performanceMetrics,
      exportedAt: Date.now(),
    };
  }
}

export const databaseService = new DatabaseService();
