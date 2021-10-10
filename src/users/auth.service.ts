import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async siginup(email: string, password: string) {
    // emailが使用済かどうか確認
    const users = await this.usersService.find(email);
    if (users.length) {
      throw new BadRequestException('email in use');
    }

    // passwordをハッシュ化
    // Salt生成
    const salt = randomBytes(8).toString('hex');

    // パスワードとSaltをハッシュ化
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    // ハッシュ値とSaltの結合
    const result = salt + '.' + hash.toString('hex');

    // 新しいユーザの作成と保存
    const user = await this.usersService.create(email, result);

    // ユーザを返す
    return user;
  }

  async signin(email: string, password: string) {
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }

    const [salt, storedHash] = user.password.split('.');

    // 入力したパスワードの照合
    const hash = (await scrypt(password, salt, 32)) as Buffer;

    if (storedHash !== hash.toString('hex')) {
      throw new BadRequestException('bad password');
    }

    return user;
  }
}
