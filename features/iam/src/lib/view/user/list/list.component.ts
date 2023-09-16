import { Consumer, RemoteService } from '@pisces/musubi/client/remote.service';
import { Component, Inject, OnInit } from '@angular/core';
import { User } from '@prisma/client';
import { MatDrawer } from '@angular/material/sidenav';
import { UserQuery, UserRemoteService } from '../../../domain/user.entity';
import { Route, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { FormGroup } from '@angular/forms';
import { EmptyObject, Page, PageRequest } from "@pisces/common";
import type { UserRepository } from '../../../repository/user.repository'
import { PageEvent } from '@angular/material/paginator';
import { isNumber, pickBy } from 'lodash';

@Component({
  selector: 'pisces-user-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class UserListComponent implements OnInit {

  current?: User;
  ;

  pageInfo: Page<User> = {
    data: [],
    total: 0,
    lastPage: 0,
    page: 0,
    size: 20,
    prev: null,
    next: null
  }

  displayedColumns = [
    'username', 'displayName', 'email', 'phone', 'sex', 'effectiveStartDate',
    'effectiveEndDate', 'lockedTime', 'enabledFlag', 'operations',
  ];
  options: FormlyFormOptions = {};
  searchModel: UserQuery = EmptyObject;
  searchForm = new FormGroup({});
  searchFields: FormlyFieldConfig[] = [
    {
      fieldGroupClassName: 'row',
      fieldGroup: [
        {
          className: 'col-md-2',
          key: 'username',
          type: 'input',
          props: {
            label: '用户名',
          },
        },
        {
          className: 'col-md-2',
          key: 'displayName',
          type: 'input',
          props: {
            label: '姓名',
          },
        },
        {
          className: 'col-md-2',
          key: 'enabledFlag',
          type: 'select',
          props: {
            label: '是否启用',
            options: [
              { value: true, label: '启用' },
              { value: false, label: '禁用' },
            ],
          },
          defaultValue: true,
        },
      ],
    },
  ];

  constructor(
    @Inject(RemoteService) private userRemoteService: Consumer<UserRemoteService, 'user'>,
    private route: Router
  ) { }

  ngOnInit() {
    const r = this.route.config[2] as any;
    // 子路由，需要遍历
    console.log(r._loadedRoutes);
    this.query();
  }

  edit(user: User, drawer: MatDrawer) {
    this.current = user;
    drawer.toggle();
  }
  close(drawer: MatDrawer) {
    this.current = undefined;
    drawer.toggle();
    this.query();
  }

  query(pageEvent?: PageEvent) {
    const pageRequest = PageRequest.of<User>(pageEvent?.pageIndex || this.pageInfo.page, pageEvent?.pageSize || this.pageInfo.size);
    this.userRemoteService.user.page(pageRequest, pickBy(this.searchModel, Boolean) as UserQuery).subscribe(users => {
      this.pageInfo = { ...users };
    });
  }
}
