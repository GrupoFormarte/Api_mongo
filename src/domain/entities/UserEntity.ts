export interface UserMetadata {
  type_id: number;
  number_id: string;
  name: string;
  second_name: string;
  last_name: string;
  second_last: string;
  email: string;
  password: string;
  cellphone: string;
  locate_district: string;
  type_user: string;
  gender: string;
  programa: string;
  birthday: string;
  createdAt: Date;
}

export class UserEntity {
  constructor(
    private readonly metadata: UserMetadata
  ) {}

  static create(metadata: Omit<UserMetadata, 'createdAt'>): UserEntity {
    return new UserEntity({
      ...metadata,
      createdAt: new Date()
    });
  }

  getMetadata(): UserMetadata {
    return { ...this.metadata };
  }

  validate(): boolean {
    // Basic validation rules
    if (!this.metadata.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return false;
    if (!this.metadata.number_id || this.metadata.number_id.length < 5)
      return false;
    if (!this.metadata.name || !this.metadata.last_name)
      return false;
    if (!this.metadata.cellphone.match(/^\+?[1-9]\d{6,14}$/))
      return false;
    // if (!['M', 'F', 'O'].includes(this.metadata.gender))
    //   return false;
    if (!this.metadata.password || this.metadata.password.length < 6)
      return false;
    
    return true;
  }
}