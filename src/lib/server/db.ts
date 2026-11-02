import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  wallet_address: string;
  created_at: number;
  last_active: number;
}

export interface WalletSession {
  id: string;
  wallet_address: string;
  nonce: string;
  token?: string;
  expires_at: number;
  created_at: number;
}

export interface AgentIdVerification {
  id: string;
  wallet_address: string;
  agent_id_name?: string;
  verified: boolean;
  checked_at: number;
}

export interface XAccountRecord {
  id: string;
  wallet_address: string;
  x_user_id: string;
  x_username?: string;
  bound_at: number;
}

export interface CampaignSubmission {
  id: string;
  wallet_address: string;
  post_id: string;
  post_url: string;
  x_user_id?: string;
  verified: boolean;
  error_reason?: string;
  verified_at: number;
}

export interface MerkleAllowlistRecord {
  id: string;
  wallet_address: string;
  added_at: number;
  active: boolean;
}

export interface MintActivityRecord {
  id: string;
  wallet_address: string;
  quantity: number;
  free_qty: number;
  paid_qty: number;
  price_bnb: string;
  tx_hash: string;
  created_at: number;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  details: string;
  admin_address?: string;
  ip?: string;
  timestamp: number;
}

interface DatabaseState {
  users: UserRecord[];
  wallet_sessions: WalletSession[];
  agent_id_verifications: AgentIdVerification[];
  x_accounts: XAccountRecord[];
  campaign_submissions: CampaignSubmission[];
  merkle_allowlist: MerkleAllowlistRecord[];
  mint_activity: MintActivityRecord[];
  admin_audit_logs: AdminAuditLog[];
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_FILE_PATH = IS_SERVERLESS
  ? path.join('/tmp', 'pixelboyz-store.json')
  : path.join(process.cwd(), 'data', 'store.json');

class DatabaseService {
  private state: DatabaseState = {
    users: [],
    wallet_sessions: [],
    agent_id_verifications: [],
    x_accounts: [],
    campaign_submissions: [],
    merkle_allowlist: [],
    mint_activity: [],
    admin_audit_logs: []
  };

  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (this.initialized) return;
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        this.state = JSON.parse(raw);
      } else {
        // In serverless environments, check if initial seed exists in repo data/
        const seedPath = path.join(process.cwd(), 'data', 'store.json');
        if (IS_SERVERLESS && fs.existsSync(seedPath)) {
          try {
            const raw = fs.readFileSync(seedPath, 'utf-8');
            this.state = JSON.parse(raw);
          } catch {
            // fallback to empty state
          }
        }
        this.persist();
      }
      this.initialized = true;
    } catch (e) {
      console.error('Failed to initialize database store:', e);
    }
  }

  private persist() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const tmpPath = `${DB_FILE_PATH}.tmp`;
      fs.writeFileSync(tmpPath, JSON.stringify(this.state, null, 2), 'utf-8');
      fs.renameSync(tmpPath, DB_FILE_PATH);
    } catch (e) {
      console.error('Failed to persist database state:', e);
    }
  }

  // Users
  public getOrCreateUser(walletAddress: string): UserRecord {
    this.init();
    const normalized = walletAddress.toLowerCase();
    let user = this.state.users.find(u => u.wallet_address.toLowerCase() === normalized);
    const now = Date.now();
    if (!user) {
      user = {
        id: `usr_${now}_${Math.random().toString(36).slice(2, 7)}`,
        wallet_address: normalized,
        created_at: now,
        last_active: now
      };
      this.state.users.push(user);
      this.persist();
    } else {
      user.last_active = now;
      this.persist();
    }
    return user;
  }

  // Wallet Sessions & Nonces
  public createNonce(walletAddress: string): string {
    this.init();
    const normalized = walletAddress.toLowerCase();
    const nonce = `pxb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const now = Date.now();
    
    // Purge expired sessions for this wallet
    this.state.wallet_sessions = this.state.wallet_sessions.filter(
      s => s.expires_at > now && s.wallet_address.toLowerCase() !== normalized
    );

    this.state.wallet_sessions.push({
      id: `sess_${now}_${Math.random().toString(36).slice(2, 7)}`,
      wallet_address: normalized,
      nonce,
      expires_at: now + 10 * 60 * 1000, // 10 minutes expiry
      created_at: now
    });
    this.persist();
    return nonce;
  }

  public verifyNonce(walletAddress: string, nonce: string): boolean {
    this.init();
    const normalized = walletAddress.toLowerCase();
    const now = Date.now();
    const sessionIndex = this.state.wallet_sessions.findIndex(
      s => s.wallet_address.toLowerCase() === normalized && s.nonce === nonce && s.expires_at > now
    );
    if (sessionIndex === -1) return false;

    // Invalidate nonce after single use
    this.state.wallet_sessions.splice(sessionIndex, 1);
    this.persist();
    return true;
  }

  public createSessionToken(walletAddress: string): string {
    this.init();
    const normalized = walletAddress.toLowerCase();
    const token = `pxb_token_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
    const now = Date.now();
    this.state.wallet_sessions.push({
      id: `sess_${now}_${Math.random().toString(36).slice(2, 7)}`,
      wallet_address: normalized,
      nonce: '',
      token,
      expires_at: now + 24 * 60 * 60 * 1000, // 24 hours expiry
      created_at: now
    });
    this.persist();
    return token;
  }

  public validateSessionToken(token: string): string | null {
    this.init();
    const now = Date.now();
    const session = this.state.wallet_sessions.find(
      s => s.token === token && s.expires_at > now
    );
    return session ? session.wallet_address : null;
  }

  // Agent ID Verification
  public setAgentIdVerification(walletAddress: string, verified: boolean, agentIdName?: string): AgentIdVerification {
    this.init();
    const normalized = walletAddress.toLowerCase();
    const now = Date.now();
    let record = this.state.agent_id_verifications.find(
      a => a.wallet_address.toLowerCase() === normalized
    );
    if (record) {
      record.verified = verified;
      record.agent_id_name = agentIdName || record.agent_id_name;
      record.checked_at = now;
    } else {
      record = {
        id: `aid_${now}_${Math.random().toString(36).slice(2, 7)}`,
        wallet_address: normalized,
        agent_id_name: agentIdName,
        verified,
        checked_at: now
      };
      this.state.agent_id_verifications.push(record);
    }
    this.persist();
    return record;
  }

  public getAgentIdVerification(walletAddress: string): AgentIdVerification | null {
    this.init();
    const normalized = walletAddress.toLowerCase();
    return this.state.agent_id_verifications.find(
      a => a.wallet_address.toLowerCase() === normalized
    ) || null;
  }

  // X Account & Campaign Submissions
  public getCampaignSubmissionByPostId(postId: string): CampaignSubmission | null {
    this.init();
    return this.state.campaign_submissions.find(s => s.post_id === postId) || null;
  }

  public getCampaignSubmissionByWallet(walletAddress: string): CampaignSubmission | null {
    this.init();
    const normalized = walletAddress.toLowerCase();
    return this.state.campaign_submissions.find(
      s => s.wallet_address.toLowerCase() === normalized && s.verified
    ) || null;
  }

  public getCampaignSubmissionByXUser(xUserId: string): CampaignSubmission | null {
    this.init();
    return this.state.campaign_submissions.find(
      s => s.x_user_id === xUserId && s.verified
    ) || null;
  }

  public recordCampaignSubmission(data: {
    wallet_address: string;
    post_id: string;
    post_url: string;
    x_user_id?: string;
    verified: boolean;
    error_reason?: string;
  }): CampaignSubmission {
    this.init();
    const now = Date.now();
    const record: CampaignSubmission = {
      id: `camp_${now}_${Math.random().toString(36).slice(2, 7)}`,
      wallet_address: data.wallet_address.toLowerCase(),
      post_id: data.post_id,
      post_url: data.post_url,
      x_user_id: data.x_user_id,
      verified: data.verified,
      error_reason: data.error_reason,
      verified_at: now
    };
    this.state.campaign_submissions.push(record);
    this.persist();
    return record;
  }

  // Merkle Allowlist
  public addToAllowlist(walletAddress: string): MerkleAllowlistRecord {
    this.init();
    const normalized = walletAddress.toLowerCase();
    let record = this.state.merkle_allowlist.find(
      m => m.wallet_address.toLowerCase() === normalized
    );
    if (!record) {
      record = {
        id: `mkl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        wallet_address: normalized,
        added_at: Date.now(),
        active: true
      };
      this.state.merkle_allowlist.push(record);
      this.persist();
    }
    return record;
  }

  public getAllActiveAllowlist(): string[] {
    this.init();
    return this.state.merkle_allowlist
      .filter(m => m.active)
      .map(m => m.wallet_address.toLowerCase());
  }

  // Mint Activity
  public recordMint(data: {
    wallet_address: string;
    quantity: number;
    free_qty: number;
    paid_qty: number;
    price_bnb: string;
    tx_hash: string;
  }): MintActivityRecord {
    this.init();
    const record: MintActivityRecord = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      wallet_address: data.wallet_address.toLowerCase(),
      quantity: data.quantity,
      free_qty: data.free_qty,
      paid_qty: data.paid_qty,
      price_bnb: data.price_bnb,
      tx_hash: data.tx_hash,
      created_at: Date.now()
    };
    this.state.mint_activity.unshift(record);
    this.persist();
    return record;
  }

  public getRecentMints(limit = 20): MintActivityRecord[] {
    this.init();
    return this.state.mint_activity.slice(0, limit);
  }

  // Audit Logs
  public addAuditLog(action: string, details: string, adminAddress?: string, ip?: string): AdminAuditLog {
    this.init();
    const log: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      action,
      details,
      admin_address: adminAddress?.toLowerCase(),
      ip,
      timestamp: Date.now()
    };
    this.state.admin_audit_logs.unshift(log);
    this.persist();
    return log;
  }

  public getAuditLogs(limit = 50): AdminAuditLog[] {
    this.init();
    return this.state.admin_audit_logs.slice(0, limit);
  }

  public getMetrics() {
    this.init();
    return {
      totalUsers: this.state.users.length,
      totalAgentIdVerifications: this.state.agent_id_verifications.filter(a => a.verified).length,
      totalCampaignCompletions: this.state.campaign_submissions.filter(c => c.verified).length,
      totalAllowlistWallets: this.state.merkle_allowlist.filter(m => m.active).length,
      recentMints: this.state.mint_activity.slice(0, 15),
      recentVerifications: this.state.agent_id_verifications.slice(-15),
      recentCampaigns: this.state.campaign_submissions.slice(-15),
      auditLogs: this.state.admin_audit_logs.slice(0, 20)
    };
  }
}

export const db = new DatabaseService();
