import { PrismaService } from '@pisces/core/backend/prisma/prisma.module';
import { Injectable } from '@nestjs/common';
import { Provider } from '@pisces/musubi/server';
import { Menu, MenuNode, MenuRemoteService } from '../domain/menu.entity';
import { camelCase, groupBy, mapKeys } from 'lodash';
import { HasPermission, Perm } from '../infra/permission';
import { prems } from "../infra/permission";

@Injectable()
export class MenuRepository implements Provider<MenuRemoteService> {
  constructor(private prisma: PrismaService) {}
  async deleteRpc(menuId: bigint): Promise<void>{
    await this.prisma.menu.delete({where: {menuId: menuId}});
  };

  @HasPermission('保存菜单中的权限')
  async savePermsRpc(currentMenu: Menu, addPerms: Perm[], removeMenus: Menu[]): Promise<void> {
    const menus = addPerms.map(perm => {
      return <Menu>{menuCode: perm.code, menuName: perm.desc, menuType: 'FUNCTION', pid: currentMenu.menuId};
    })
    this.prisma.$transaction
    await this.prisma.menu.createMany({data:menus});
    await this.prisma.menu.deleteMany({where:{menuId: {in: removeMenus.map(menu => menu.menuId)}}})
  };

  @HasPermission('获取菜单中已分配的权限')
  listAssignedPermByMenuIdRpc(menuId: bigint): Menu[] | Promise<Menu[]>{
    return this.prisma.menu.findMany({where: {pid: menuId}});
  };

  @HasPermission('获取权限列表')
  listPermRpc(): Perm[] {
    return prems;
  }

  @HasPermission('树状查询菜单')
  async treeRpc() {
    const list1 = await this.prisma.$queryRaw<MenuNode[]>`WITH RECURSIVE result AS (
      SELECT *, 1 as level FROM sys_menu WHERE menu_id = 1
      UNION
      SELECT m.*, p.level + 1 as level FROM sys_menu m JOIN result p ON m.pid = p.menu_id)
      SELECT * FROM result;`;
    const list = list1.map((i) => mapKeys(i, (_, v) => camelCase(v))) as MenuNode[];
    const group = groupBy(list, 'pid');
    return list.filter((father) => {
      father.children = group[father.menuId.toString()];
      return father.pid === 0n;
    });
  }

  @HasPermission('创建菜单')
  async createRpc(menu: Menu) {
    await this.prisma.menu.create({ data: menu });
  }

  @HasPermission('更新菜单')
  async updateRpc(menu: Menu) {
    await this.prisma.menu.update({ where: { menuId: menu.menuId }, data: menu });
  }
}
