import { PrismaService } from '@pisces/core/backend/prisma/prisma.module';
import { Injectable } from '@nestjs/common';
import { Prisma, RoleUser } from '@prisma/client';
import { Provider } from '@pisces/musubi/server';
import { BizException } from 'libs/core/src/lib/backend/config/exception/biz-exception';
import { hash } from 'bcrypt';
import { User, UserQuery, UserRemoteService } from '../domain/user.entity';
import { PageRequest, DEFAULT_PAGE, paginator, Page } from '@pisces/common';
import { camelCase, mapKeys } from 'lodash';

@Injectable()
export class UserRepository implements Provider<UserRemoteService>{
  constructor(private prisma: PrismaService) { }

  async listUnassignedUser$user(roleId: bigint): Promise<(User & RoleUser)[]> {
    return (await this.prisma
    .$queryRaw<(User & RoleUser)[]>`SELECT su.username, su.display_name, su.user_id, sru.role_id, sru.role_user_id FROM sys_user su LEFT JOIN sys_role_user sru ON su.user_id = sru.user_id AND sru.role_id = ${roleId};`
    ).map((i) => mapKeys(i, (_, v) => camelCase(v)) as unknown as (User & RoleUser));
  }
  /**
   * 查询列表
   */
  async page$user(pageRequest: PageRequest<User> = DEFAULT_PAGE, query?: UserQuery): Promise<Page<User>> {
    return await paginator(pageRequest)(this.prisma.user, { where: query });
  }
  /**
   * 创建用户信息
   */
  async create$user(user: User): Promise<void> {
    console.log("[User][createRpc]==>", JSON.stringify(user));
    // 处理密码
    const pwd = await hash(user.password, 10);
    user.password = pwd;
    // TODO 必填校验怎么统一处理
    // 处理用户唯一 不能重复
    const dbUser = await this.findByUsername(user.username);
    if (dbUser !== null) {
      throw new BizException("该用户信息已存在,不能重复创建!");
    }
    await this.prisma.user.create({ data: user });
  }
  /**
   * 更新用户信息
   */
  async update$user(user: User): Promise<void> {
    // 必填校验
    await this.validUserId(user.userId);
    await this.prisma.user.update({ where: { userId: user.userId }, data: user });
  }

  /**
   * 重置用户密码
   */
  async resetPassword(userId: string, user: User): Promise<void> {
    this.validUserId(user.userId);
  }

  async validUserId(userId: bigint): Promise<void> {
    const dbUser = await this.findByUserId(userId);
    if (dbUser === null) {
      throw new BizException("您操作的用户信息异常,请检查后重试!");
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        username: {
          equals: username,
        },
      },
    });
  }

  async findByUserId(userId: bigint): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        userId: {
          equals: userId,
        },
      },
    });
  }

  async user(userWhereUniqueInput: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });
  }

  async users(options: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }) {
    const { skip, take, cursor, where, orderBy } = options;

    return await this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }


  async updateUser(options: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput; }) {
    const { where, data } = options;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput) {
    return this.prisma.user.delete({
      where,
    });
  }
}
