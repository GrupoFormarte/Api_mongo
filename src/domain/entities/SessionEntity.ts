export interface SessionMetadata {
  userId: string;
  token: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class SessionEntity {
  private metadata: SessionMetadata;

  private constructor(metadata: SessionMetadata) {
    this.metadata = metadata;
  }

  public static create(
    userId: string,
    token: string,
    ipAddress: string,
    userAgent: string,
    expiresIn: number = 24 * 60 * 60 * 1000 // 24 hours default
  ): SessionEntity {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresIn);

    const metadata: SessionMetadata = {
      userId,
      token,
      ipAddress,
      userAgent,
      createdAt: now,
      expiresAt,
      isActive: true,
    };

    return new SessionEntity(metadata);
  }

  public getMetadata(): SessionMetadata {
    return { ...this.metadata };
  }

  public isValid(ipAddress: string): boolean {
    const now = new Date();

    // Check if session is active
    if (!this.metadata.isActive) {
      return false;
    }

    // Check if session has expired
    if (now > this.metadata.expiresAt) {
      return false;
    }

    // Check if IP matches
    if (this.metadata.ipAddress !== ipAddress) {
      return false;
    }

    return true;
  }

  public invalidate(): void {
    this.metadata.isActive = false;
  }

  public isExpired(): boolean {
    return new Date() > this.metadata.expiresAt;
  }

  public getUserId(): string {
    return this.metadata.userId;
  }

  public getToken(): string {
    return this.metadata.token;
  }

  public getIpAddress(): string {
    return this.metadata.ipAddress;
  }
}
