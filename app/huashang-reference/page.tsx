'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  FileText,
  FolderKanban,
  Gavel,
  Home,
  Menu,
  Plus,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';

const mainMenus = {
  工作: ['工作首页', '消息中心', '日志', '任务', '日程'],
  文档: ['我的文档', '团队资料', '律所资料'],
  项目: [
    '线索阶段',
    '案源阶段',
    '合同阶段',
    '项目收款',
    '个人台账',
    '归档卷宗',
  ],
  客户: [
    '我的客户',
    '常年顾问客户',
    '签约客户',
    '意向客户',
    '潜在客户',
    '联系人',
    '对方/关联当事人',
  ],
  综合: ['通讯录', '申请大厅', '通知公告', '内部项目'],
  法律工具: [
    '我的工具',
    '效率工具',
    '信息查询',
    '司法网址',
    '诉讼仲裁',
    '知识产权',
    '资本市场',
    '数据合规',
  ],
} as const;

const projects = [
  [
    'Northstar Holdings IPO',
    '（2026）HW01CM000148',
    '2026-09-03',
    'Sarah Lin',
    '进行中',
    '未收款',
  ],
  [
    'Orion BioTech v. Atlas',
    '（2026）HW02LIT000027',
    '2026-08-27',
    'Michael Chen',
    '已立案',
    '部分收款',
  ],
  [
    'Aster Mobility market entry',
    '（2026）HW03CS000091',
    '2026-08-18',
    'Evelyn Park',
    '待审批',
    '未收款',
  ],
  [
    'Blue River Securities filing',
    '（2026）HW01CM000087',
    '2026-08-05',
    'Sarah Lin',
    '已结案',
    '已收款',
  ],
];

const files = [
  ['Northstar 10-K review.docx', 'DOCX', 'v4', 'Sarah Lin', '等待审阅'],
  ['SEC comment response.pdf', 'PDF', 'v2', 'Michael Chen', '已归档'],
  ['Engagement letter.docx', 'DOCX', 'v1', 'Evelyn Park', 'WPS 编辑中'],
];

const initialLogs = [
  [
    '2026-09-08',
    'Sarah Lin',
    'Northstar Holdings IPO',
    '完成首轮文件审阅',
    '待阅 2',
  ],
  [
    '2026-09-07',
    'Evelyn Park',
    'Aster Mobility market entry',
    '更新项目基础资料',
    '已阅',
  ],
];

const CUSTOMER_REGISTRY_KEY = 'hamilton-os.customer-registry';

function registerCustomer(row: string[]) {
  if (typeof window === 'undefined') return;
  try {
    const current = JSON.parse(
      window.localStorage.getItem(CUSTOMER_REGISTRY_KEY) ?? '[]',
    ) as string[][];
    const next = [row, ...current.filter((item) => item[0] !== row[0])];
    window.localStorage.setItem(CUSTOMER_REGISTRY_KEY, JSON.stringify(next));
  } catch {
    // Keep the in-memory page flow when browser storage is unavailable.
  }
}

const initialTasks = [
  [
    '审阅 SEC 回复文件',
    'Northstar Holdings IPO',
    'Sarah Lin',
    '2026-09-09',
    '进行中',
  ],
  [
    '确认客户会议时间',
    'Aster Mobility market entry',
    'Evelyn Park',
    '2026-09-10',
    '未开始',
  ],
];

const initialProjectMembership: Record<string, 'member' | 'invited'> = {
  'Northstar Holdings IPO': 'member',
  'Orion BioTech v. Atlas': 'member',
  'Aster Mobility market entry': 'invited',
  'Blue River Securities filing': 'member',
};

const initialDirectory = [
  [
    'Sarah Lin',
    'New York Office',
    'Capital Markets',
    '高级合伙人',
    '—',
    '已启用',
  ],
  [
    'Michael Chen',
    'New York Office',
    'Litigation',
    '合伙人',
    'Sarah Lin',
    '已启用',
  ],
  [
    'Evelyn Park',
    'New York Office',
    'Corporate Services',
    '高级律师',
    'Sarah Lin',
    '已启用',
  ],
  [
    'Daniel Wu',
    'New York Office',
    'Capital Markets',
    '律师',
    'Sarah Lin',
    '待激活',
  ],
];

const initialPositions = [
  ['高级合伙人', '所级管理', '可审批全部团队'],
  ['合伙人', '业务团队', '可审批本团队'],
  ['高级律师', '业务团队', '可提交项目审批'],
  ['律师', '业务团队', '可创建任务和日志'],
];

type AppNotification = {
  id: string;
  title: string;
  body: string;
  category: '项目' | '日志' | '任务' | '日程' | '审批' | '公告' | '系统';
  time: string;
  read: boolean;
  target?: string;
};

const initialNotifications: AppNotification[] = [
  {
    id: 'project-invite-aster',
    title: '项目加入邀请',
    body: '你被邀请加入 Aster Mobility market entry',
    category: '项目',
    time: '刚刚',
    read: false,
    target: '工作首页',
  },
  {
    id: 'log-review-northstar',
    title: '待阅日志',
    body: 'Northstar Holdings IPO 有新的日志待你审阅',
    category: '日志',
    time: '16 分钟前',
    read: false,
    target: '消息中心',
  },
  {
    id: 'system-trial',
    title: '系统通知',
    body: 'Hamilton FirmOS 系统试运行通知',
    category: '系统',
    time: '今天 09:00',
    read: true,
    target: '通知公告',
  },
];

function publishNotification(
  payload: Omit<AppNotification, 'id' | 'time' | 'read'>,
) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('hamilton-os:notify', { detail: payload }),
  );
}

export default function HuashangReference() {
  const [topMenu, setTopMenu] = useState<keyof typeof mainMenus>('工作');
  const [openMenu, setOpenMenu] = useState<keyof typeof mainMenus | null>(null);
  const [section, setSection] = useState('工作首页');
  const [projectSubview, setProjectSubview] = useState<string | null>(null);
  const [contractProjectOpen, setContractProjectOpen] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePanel, setProfilePanel] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] =
    useState<AppNotification[]>(initialNotifications);
  const [newName, setNewName] = useState('');
  const [projectRows, setProjectRows] = useState(projects);
  const [sharedLogs, setSharedLogs] = useState<string[][]>(initialLogs);
  const [sharedTasks, setSharedTasks] = useState<string[][]>(initialTasks);
  const [projectMembership, setProjectMembership] = useState(
    initialProjectMembership,
  );
  const [directoryRows, setDirectoryRows] = useState(initialDirectory);
  const [positions, setPositions] = useState(initialPositions);
  const logsHydrated = useRef(false);
  const tasksHydrated = useRef(false);
  const notificationsHydrated = useRef(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('hamilton-os.notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setNotifications(parsed);
      } catch {
        // Keep seed notifications when browser storage is invalid.
      }
    }
    notificationsHydrated.current = true;
    const receiveNotification = (event: Event) => {
      const detail = (event as CustomEvent).detail as Omit<
        AppNotification,
        'id' | 'time' | 'read'
      >;
      if (!detail?.title) return;
      setNotifications((current) => [
        {
          ...detail,
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          time: '刚刚',
          read: false,
        },
        ...current,
      ]);
    };
    window.addEventListener('hamilton-os:notify', receiveNotification);
    return () =>
      window.removeEventListener('hamilton-os:notify', receiveNotification);
  }, []);

  useEffect(() => {
    if (!notificationsHydrated.current) return;
    window.localStorage.setItem(
      'hamilton-os.notifications',
      JSON.stringify(notifications),
    );
  }, [notifications]);

  useEffect(() => {
    const savedLogs = window.localStorage.getItem('hamilton-os.logs');
    if (!savedLogs) {
      logsHydrated.current = true;
      return;
    }
    try {
      const parsed = JSON.parse(savedLogs);
      if (Array.isArray(parsed)) setSharedLogs(parsed);
    } catch {
      // Ignore an invalid local demo cache and keep the seeded examples.
    }
    logsHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!logsHydrated.current) return;
    window.localStorage.setItem('hamilton-os.logs', JSON.stringify(sharedLogs));
  }, [sharedLogs]);

  useEffect(() => {
    const savedTasks = window.localStorage.getItem('hamilton-os.tasks');
    if (!savedTasks) {
      tasksHydrated.current = true;
      return;
    }
    try {
      const parsed = JSON.parse(savedTasks);
      if (Array.isArray(parsed)) setSharedTasks(parsed);
    } catch {
      // Ignore an invalid local demo cache and keep the seeded examples.
    }
    tasksHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!tasksHydrated.current) return;
    window.localStorage.setItem(
      'hamilton-os.tasks',
      JSON.stringify(sharedTasks),
    );
  }, [sharedTasks]);

  function selectSection(item: string) {
    setSection(item);
    setProjectSubview(null);
    const matchedMenu =
      (Object.keys(mainMenus) as Array<keyof typeof mainMenus>).find((key) =>
        mainMenus[key].includes(item as never),
      ) ??
      ([
        '申请大厅',
        '待处理的',
        '我发起的',
        '已处理的',
        '抄送我的',
        '变更审批人',
        '流程审批',
      ].includes(item)
        ? '综合'
        : '工作');
    setTopMenu(matchedMenu);
    setOpenMenu(null);
  }

  function selectProjectSubview(parent: string, child: string) {
    setProjectSubview(child);
    setSection(parent);
    if (parent === '合同阶段') setContractProjectOpen(true);
    setTopMenu('项目');
    setOpenMenu(null);
  }

  function createProject() {
    if (!newName.trim()) return;
    setProjectRows((rows) => [
      [
        newName.trim(),
        `（2026）HW01CM000${rows.length + 200}`,
        '2026-09-08',
        '当前用户',
        '待审批',
        '未收款',
      ],
      ...rows,
    ]);
    setNewName('');
    setShowNew(false);
    setSection('业务项目');
    setTopMenu('项目');
    publishNotification({
      title: '立项申请已提交',
      body: `${newName.trim()} 已进入审批流程`,
      category: '审批',
      target: '我发起的',
    });
  }

  const visibleProjects = projectRows.filter((row) =>
    row.join(' ').toLowerCase().includes(search.toLowerCase()),
  );
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-[#202633]">
      <header className="sticky top-0 z-40 flex h-[64px] items-center bg-[#252a34] px-4 text-white shadow-md">
        <div className="flex w-[250px] items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg border-2 border-[#f06a70] text-lg font-bold">
            华
          </div>
          <div>
            <p className="text-[16px] font-semibold tracking-wide">
              Hamilton FirmOS
            </p>
          </div>
        </div>
        <nav className="flex h-full items-stretch gap-1">
          {(Object.keys(mainMenus) as Array<keyof typeof mainMenus>).map(
            (menu) => (
              <div key={menu} className="relative flex items-center">
                <button
                  onClick={() =>
                    setOpenMenu((open) => (open === menu ? null : menu))
                  }
                  className={`flex h-full items-center gap-1 px-5 text-[15px] transition ${topMenu === menu ? 'bg-[#f1666d] text-white' : 'text-[#e3e6eb] hover:bg-white/10'}`}
                >
                  {menu}
                  {menu !== '客户' && <ChevronDown className="size-3.5" />}
                </button>
                {openMenu === menu && (
                  <div className="absolute left-0 top-[64px] z-50 min-w-[180px] border border-[#e3e6eb] bg-white py-1 text-[#364152] shadow-xl">
                    {mainMenus[menu].map((item) => (
                      <button
                        key={item}
                        onClick={() => selectSection(item)}
                        className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-[#fff1f1] hover:text-[#e45159] ${section === item ? 'bg-[#fff1f1] text-[#e45159]' : ''}`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ),
          )}
        </nav>
        <div className="ml-auto flex items-center gap-5 text-sm">
          <span className="hidden text-[#dce0e6] lg:inline">Hamilton 行政</span>
          <div className="relative">
            <button
              onClick={() => setShowNotifications((open) => !open)}
              className="relative flex items-center gap-2 rounded px-2 py-1.5 hover:bg-white/10"
              aria-label="打开消息通知"
            >
              <Bell className="size-5" />
              <span>消息</span>
              {unreadNotificationCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-[#f1666d] px-1 text-[10px] leading-4 text-white">
                  {unreadNotificationCount > 99
                    ? '99+'
                    : unreadNotificationCount}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-11 z-50 w-[360px] overflow-hidden rounded-xl border border-[#dfe3e8] bg-white text-[#364152] shadow-2xl">
                <div className="flex items-center justify-between border-b border-[#edf0f2] px-4 py-3">
                  <div>
                    <p className="font-semibold">消息通知</p>
                    <p className="mt-0.5 text-xs text-[#8993a0]">
                      {unreadNotificationCount} 条未读
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setNotifications((current) =>
                        current.map((item) => ({ ...item, read: true })),
                      )
                    }
                    className="text-xs text-[#e45159]"
                  >
                    全部已读
                  </button>
                </div>
                <div className="max-h-[420px] overflow-y-auto">
                  {notifications.length ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          setNotifications((current) =>
                            current.map((item) =>
                              item.id === notification.id
                                ? { ...item, read: true }
                                : item,
                            ),
                          );
                          setShowNotifications(false);
                          if (notification.target)
                            selectSection(notification.target);
                        }}
                        className={`flex w-full gap-3 border-b border-[#edf0f2] px-4 py-3 text-left hover:bg-[#f7f8fa] ${notification.read ? 'bg-white' : 'bg-[#fff8f8]'}`}
                      >
                        <span className="relative mt-1 grid size-9 shrink-0 place-items-center rounded-full bg-[#eef5ff] text-[#4680bd]">
                          <Bell className="size-4" />
                          {!notification.read && (
                            <span className="absolute right-0 top-0 size-2 rounded-full bg-[#f1666d]" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <strong className="truncate text-sm">
                              {notification.title}
                            </strong>
                            <span className="shrink-0 text-[11px] text-[#a1a8b0]">
                              {notification.time}
                            </span>
                          </span>
                          <span className="mt-1 block text-xs leading-5 text-[#697586]">
                            {notification.body}
                          </span>
                          <span className="mt-1 inline-block rounded bg-[#f0f2f5] px-1.5 py-0.5 text-[10px] text-[#8993a0]">
                            {notification.category}
                          </span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="py-12 text-center text-sm text-[#a1a8b0]">
                      暂无消息
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowNotifications(false);
                    selectSection('消息中心');
                  }}
                  className="block w-full border-t border-[#edf0f2] py-3 text-center text-sm text-[#e45159]"
                >
                  查看全部消息
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowProfile((value) => !value)}
            className="flex items-center gap-2 rounded px-1 py-1 hover:bg-white/10"
            aria-label="打开个人中心"
          >
            <span className="grid size-8 place-items-center rounded-full bg-[#87909d] text-xs">
              SL
            </span>
            <ChevronDown className="size-4" />
          </button>
        </div>
      </header>
      {showProfile && (
        <div className="absolute right-4 top-[62px] z-50 w-64 border border-[#dfe3e8] bg-white p-2 text-[#364152] shadow-xl">
          <div className="border-b border-[#edf0f2] px-3 py-3">
            <p className="font-semibold">Sarah Lin</p>
            <p className="mt-1 text-xs text-[#8a96a3]">
              Hamilton Weiss PLLC · 律师
            </p>
          </div>
          {[
            '个人简历',
            '头像设置',
            '绑定手机',
            '绑定邮箱',
            '修改密码',
            '银行账号设置',
            '我的订单',
            '我的等级',
            '管理仪表盘',
          ].map((item) => (
            <button
              key={item}
              onClick={() => {
                setShowProfile(false);
                setProfilePanel(item);
              }}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#fff1f1] hover:text-[#e45159]"
            >
              {item}
            </button>
          ))}
        </div>
      )}
      {profilePanel && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#edf0f2] pb-3">
              <h2 className="text-lg font-semibold">{profilePanel}</h2>
              <button
                aria-label="关闭个人中心面板"
                onClick={() => setProfilePanel(null)}
                className="text-xl text-[#8993a0]"
              >
                ×
              </button>
            </div>
            {profilePanel === '管理仪表盘' ? (
              <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                {[
                  ['待办审批', '0'],
                  ['团队成员', '4'],
                  ['本月工时', '32.5h'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded bg-[#f7f8fa] p-4">
                    <p className="text-xs text-[#8993a0]">{label}</p>
                    <p className="mt-2 text-lg font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            ) : profilePanel === '我的等级' || profilePanel === '我的订单' ? (
              <div className="mt-6 rounded bg-[#f7f8fa] p-6 text-center text-sm text-[#8993a0]">
                暂无记录
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <p className="text-sm text-[#697586]">
                  {profilePanel === '个人简历'
                    ? '维护个人执业信息，供通讯录、审批和项目协作使用。'
                    : '维护当前账号的安全与联系信息。'}
                </p>
                <label className="block text-sm">
                  {profilePanel === '个人简历'
                    ? '个人简介'
                    : profilePanel === '头像设置'
                      ? '头像地址'
                      : profilePanel === '绑定手机'
                        ? '手机号码'
                        : profilePanel === '绑定邮箱'
                          ? '邮箱地址'
                          : profilePanel === '修改密码'
                            ? '新密码'
                            : '银行账号'}
                  <input
                    type={profilePanel === '修改密码' ? 'password' : 'text'}
                    placeholder="请输入"
                    className="mt-1 h-10 w-full rounded border border-[#dce1e6] px-3 text-sm"
                  />
                </label>
                {profilePanel === '个人简历' && (
                  <textarea
                    placeholder="执业地区、Bar Number、专业方向等"
                    className="h-24 w-full rounded border border-[#dce1e6] p-3 text-sm"
                  />
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setProfilePanel(null)}
                    className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
                  >
                    取消
                  </button>
                  <button
                    onClick={() => setProfilePanel(null)}
                    className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                  >
                    保存
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="flex min-h-[calc(100vh-64px)]">
        <aside
          className={`${sidebarOpen ? 'w-[250px]' : 'w-[56px]'} shrink-0 border-r border-[#dfe3e8] bg-white transition-all`}
        >
          <div className="flex h-12 items-center justify-between border-b border-[#edf0f2] px-4">
            <span
              className={`${sidebarOpen ? '' : 'hidden'} text-sm font-semibold`}
            >
              {topMenu === '工作'
                ? '工作台'
                : topMenu === '综合' &&
                    [
                      '申请大厅',
                      '待处理的',
                      '我发起的',
                      '已处理的',
                      '抄送我的',
                      '变更审批人',
                      '流程审批',
                    ].includes(section)
                  ? '流程审批'
                  : topMenu}
            </span>
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="text-[#748091]"
            >
              <Menu className="size-5" />
            </button>
          </div>
          {sidebarOpen && (
            <div className="p-3">
              {topMenu === '工作' && (
                <>
                  <SideIcon
                    icon={Home}
                    label="工作首页"
                    active={section === '工作首页'}
                    onClick={() => selectSection('工作首页')}
                  />
                  <SideIcon
                    icon={Bell}
                    label="消息中心"
                    active={section === '消息中心'}
                    onClick={() => selectSection('消息中心')}
                  />
                  <SideIcon
                    icon={ClipboardList}
                    label="日志"
                    active={section === '日志'}
                    onClick={() => selectSection('日志')}
                  />
                  <SideIcon
                    icon={ClipboardList}
                    label="任务"
                    active={section === '任务'}
                    onClick={() => selectSection('任务')}
                  />
                  <SideIcon
                    icon={CalendarDays}
                    label="日程"
                    active={section === '日程'}
                    onClick={() => selectSection('日程')}
                  />
                </>
              )}
              {topMenu === '项目' && (
                <>
                  {section === '线索阶段' ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        线索阶段
                      </p>
                      <SideIcon
                        icon={FolderKanban}
                        label="团队公共线索库"
                        active={projectSubview === '团队公共线索库'}
                        onClick={() =>
                          selectProjectSubview('线索阶段', '团队公共线索库')
                        }
                      />
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        线索综合
                      </p>
                      {['团队线索管理', '我负责的线索', '线索跟进计划'].map(
                        (x) => (
                          <SideIcon
                            key={x}
                            icon={FolderKanban}
                            label={x}
                            active={projectSubview === x}
                            onClick={() => selectProjectSubview('线索阶段', x)}
                          />
                        ),
                      )}
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        线索统计
                      </p>
                      {['线索数量统计', '线索转化统计', '接洽人业务统计'].map(
                        (x) => (
                          <SideIcon
                            key={x}
                            icon={FolderKanban}
                            label={x}
                            active={projectSubview === x}
                            onClick={() => selectProjectSubview('线索阶段', x)}
                          />
                        ),
                      )}
                    </>
                  ) : section === '案源阶段' ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        案源阶段
                      </p>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        案源综合
                      </p>
                      {['我的案源', '暂缓跟进案源', '近期关注案源'].map((x) => (
                        <SideIcon
                          key={x}
                          icon={FolderKanban}
                          label={x}
                          active={projectSubview === x}
                          onClick={() => selectProjectSubview('案源阶段', x)}
                        />
                      ))}
                    </>
                  ) : section === '合同阶段' ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        合同阶段
                      </p>
                      <button
                        onClick={() => setContractProjectOpen((open) => !open)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold text-[#87929f] hover:text-[#e45159]"
                      >
                        <span>项目综合</span>
                        <span className="text-sm">
                          {contractProjectOpen ? '⌃' : '⌄'}
                        </span>
                      </button>
                      {contractProjectOpen &&
                        [
                          '业务项目',
                          '子项目管理',
                          '外所协办项目',
                          '近期关注项目',
                        ].map((x) => (
                          <SideIcon
                            key={x}
                            icon={FolderKanban}
                            label={x}
                            active={projectSubview === x}
                            onClick={() => selectProjectSubview('合同阶段', x)}
                          />
                        ))}
                      {[
                        '合同管理',
                        '顾问续约',
                        '财产保全管理',
                        '业务项目统计',
                      ].map((x) => (
                        <SideIcon
                          key={x}
                          icon={FileText}
                          label={x}
                          active={projectSubview === x}
                          onClick={() => selectProjectSubview('合同阶段', x)}
                        />
                      ))}
                    </>
                  ) : section === '项目收款' ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        项目收款
                      </p>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        业务款项管理
                      </p>
                      {[
                        '合同应收款',
                        '项目收/退款',
                        '已开发票',
                        '公开招领款项',
                      ].map((x) => (
                        <SideIcon
                          key={x}
                          icon={FileText}
                          label={x}
                          active={projectSubview === x}
                          onClick={() => selectProjectSubview('项目收款', x)}
                        />
                      ))}
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        催款管理
                      </p>
                      {[
                        '预计收款统计',
                        '已开票未到账款项',
                        '已到账未开票款项',
                        '已立案3个月未收款项目',
                      ].map((x) => (
                        <SideIcon
                          key={x}
                          icon={FileText}
                          label={x}
                          active={projectSubview === x}
                          onClick={() => selectProjectSubview('项目收款', x)}
                        />
                      ))}
                    </>
                  ) : section === '归档卷宗' ? (
                    <>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        归档卷宗
                      </p>
                      <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                        卷宗管理
                      </p>
                      {['我的卷宗', '律所卷宗借阅'].map((x) => (
                        <SideIcon
                          key={x}
                          icon={FileText}
                          label={x}
                          active={projectSubview === x}
                          onClick={() => selectProjectSubview('归档卷宗', x)}
                        />
                      ))}
                    </>
                  ) : section === '个人台账' ? (
                    <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                      个人台账
                    </p>
                  ) : (
                    <>
                      <SideIcon
                        icon={FolderKanban}
                        label="项目综合"
                        active={false}
                        onClick={() => {}}
                      />
                      <SideIcon
                        icon={FileText}
                        label="项目收款"
                        active={section === '项目收款'}
                        onClick={() => selectSection('项目收款')}
                      />
                      <SideIcon
                        icon={FileText}
                        label="个人台账"
                        active={section === '个人台账'}
                        onClick={() => selectSection('个人台账')}
                      />
                      <SideIcon
                        icon={FileText}
                        label="归档卷宗"
                        active={section === '归档卷宗'}
                        onClick={() => selectSection('归档卷宗')}
                      />
                    </>
                  )}
                </>
              )}
              {topMenu === '文档' && (
                <>
                  <SideIcon
                    icon={FileText}
                    label="我的文档"
                    active={section === '我的文档'}
                    onClick={() => selectSection('我的文档')}
                  />
                  <SideIcon
                    icon={Users}
                    label="团队资料"
                    active={section === '团队资料'}
                    onClick={() => selectSection('团队资料')}
                  />
                  <SideIcon
                    icon={FileText}
                    label="律所资料"
                    active={section === '律所资料'}
                    onClick={() => selectSection('律所资料')}
                  />
                </>
              )}
              {topMenu === '综合' && (
                <>
                  <SideIcon
                    icon={ClipboardList}
                    label="申请大厅"
                    active={section === '申请大厅'}
                    onClick={() => selectSection('申请大厅')}
                  />
                  {[
                    '待处理的',
                    '我发起的',
                    '已处理的',
                    '抄送我的',
                    '变更审批人',
                  ].map((item) => (
                    <SideIcon
                      key={item}
                      icon={ClipboardList}
                      label={item}
                      active={section === item}
                      onClick={() => selectSection(item)}
                    />
                  ))}
                  <SideIcon
                    icon={ClipboardList}
                    label="流程审批"
                    active={section === '流程审批'}
                    onClick={() => selectSection('流程审批')}
                  />
                  <SideIcon
                    icon={Bell}
                    label="通知公告"
                    active={section === '通知公告'}
                    onClick={() => selectSection('通知公告')}
                  />
                  <SideIcon
                    icon={FolderKanban}
                    label="内部项目"
                    active={section === '内部项目'}
                    onClick={() => selectSection('内部项目')}
                  />
                </>
              )}
              {topMenu === '客户' && (
                <>
                  <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
                    客户/联系人
                  </p>
                  <SideIcon
                    icon={Users}
                    label="我的客户"
                    active={section === '我的客户'}
                    onClick={() => selectSection('我的客户')}
                  />
                  {[
                    '常年顾问客户',
                    '签约客户',
                    '意向客户',
                    '潜在客户',
                    '联系人',
                    '对方/关联当事人',
                  ].map((x) => (
                    <SideIcon
                      key={x}
                      icon={Users}
                      label={x}
                      active={section === x}
                      onClick={() => selectSection(x)}
                    />
                  ))}
                </>
              )}
              {topMenu === '法律工具' && (
                <>
                  <SideIcon
                    icon={Gavel}
                    label="我的工具"
                    active={section === '我的工具'}
                    onClick={() => selectSection('我的工具')}
                  />
                  <SideIcon
                    icon={Search}
                    label="信息查询"
                    active={section === '信息查询'}
                    onClick={() => selectSection('信息查询')}
                  />
                  <SideIcon
                    icon={Gavel}
                    label="司法网址"
                    active={section === '司法网址'}
                    onClick={() => selectSection('司法网址')}
                  />
                  <SideIcon
                    icon={FileText}
                    label="资本市场"
                    active={section === '资本市场'}
                    onClick={() => selectSection('资本市场')}
                  />
                </>
              )}
            </div>
          )}
          <div
            className={`${sidebarOpen ? '' : 'hidden'} absolute bottom-0 w-[250px] border-t border-[#edf0f2] p-4 text-xs text-[#86909c]`}
          >
            <Settings className="mr-2 inline size-4" />
            系统设置
          </div>
        </aside>
        <section className="min-w-0 flex-1">
          <div className="border-b border-[#e0e4e8] bg-white px-7 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#8c96a3]">当前位置 / {topMenu}</p>
                <h1 className="mt-1 text-2xl font-semibold">{section}</h1>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9da7b3]" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 w-64 rounded border border-[#d8dde3] pl-9 text-sm outline-none focus:border-[#f1666d]"
                    placeholder="项目名称/编号/客户"
                  />
                </div>
                {(section === '业务项目' || section === '项目综合') && (
                  <button
                    onClick={() => setShowNew(true)}
                    className="flex h-9 items-center gap-1 rounded bg-[#f1666d] px-4 text-sm text-white hover:bg-[#df5961]"
                  >
                    <Plus className="size-4" />
                    创建新项目
                  </button>
                )}
              </div>
            </div>
          </div>
          <Content
            section={section}
            projects={visibleProjects}
            setProjects={setProjectRows}
            files={files}
            logs={sharedLogs}
            setLogs={setSharedLogs}
            tasks={sharedTasks}
            setTasks={setSharedTasks}
            projectMembership={projectMembership}
            setProjectMembership={setProjectMembership}
            directoryRows={directoryRows}
            setDirectoryRows={setDirectoryRows}
            positions={positions}
            setPositions={setPositions}
            onNavigate={setSection}
            onNew={() => setShowNew(true)}
            projectSubview={projectSubview}
          />
        </section>
      </div>
      {showNew && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35">
          <div className="w-[440px] rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">创建新项目</h2>
              <button onClick={() => setShowNew(false)}>
                <X className="size-5 text-[#8993a0]" />
              </button>
            </div>
            <label className="mt-5 block text-sm">
              项目名称
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="mt-2 h-10 w-full rounded border border-[#d8dde3] px-3 outline-none focus:border-[#f1666d]"
                placeholder="请输入项目名称"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="rounded border border-[#d8dde3] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={createProject}
                disabled={!newName.trim()}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                提交立项申请
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProjectDetail({
  project,
  onBack,
}: {
  project: string[];
  onBack: () => void;
}) {
  const tabs = [
    '主页',
    '动态',
    '合同',
    '款项',
    '联系人',
    '项目成员',
    '项目进程',
    '日志',
    '文档',
    '日程',
    '财产保全',
    '电子卷宗',
  ];
  const [tab, setTab] = useState('主页');
  const [followed, setFollowed] = useState(false);
  const [note, setNote] = useState('');
  const [contractFlow, setContractFlow] = useState({
    approval: '已审批',
    seal: '已盖电子章',
    returned: '未交回',
  });
  const [financeTab, setFinanceTab] = useState('合同应收款');
  const [showReceivable, setShowReceivable] = useState(false);
  const [receivableForm, setReceivableForm] = useState({
    name: '',
    type: '计量收费',
    amount: '',
    date: '2026-09-15',
    condition: '',
    note: '',
  });
  const [receivables, setReceivables] = useState([
    [
      '合同律师费',
      '律师费',
      '$100,842',
      '2026-09-03',
      '$0',
      '$100,842',
      '$0',
      '未到账',
      '未开票',
    ],
  ]);
  const [events, setEvents] = useState([
    '项目文件已上传，等待团队审阅。',
    '项目成员已完成利益冲突声明。',
  ]);
  const [memberRows, setMemberRows] = useState([
    ['张博彦', '线索获取人', '参与中'],
    ['张博彦', '案源开拓人', '参与中'],
    ['张博彦', '业务主管', '参与中'],
    ['张博彦', '主办律师', '参与中'],
    ['孙绘媛', '项目登记人', '参与中'],
  ]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('主办律师');
  const [processTemplate, setProcessTemplate] = useState('');
  const [processStep, setProcessStep] = useState('未配置');
  const [processCategory, setProcessCategory] = useState('全部');
  const [processSearch, setProcessSearch] = useState('');
  const [showProjectEvent, setShowProjectEvent] = useState(false);
  const [projectEvent, setProjectEvent] = useState({
    title: '',
    date: '2026-09-15',
    type: '会议',
  });
  const [projectEvents, setProjectEvents] = useState<string[][]>([]);
  const [showArchiveUpload, setShowArchiveUpload] = useState(false);
  const [archiveName, setArchiveName] = useState('');
  const [docSearch, setDocSearch] = useState('');
  const [includeSubFolders, setIncludeSubFolders] = useState(true);
  const [showNewDocument, setShowNewDocument] = useState(false);
  const [docRows, setDocRows] = useState([
    ['20260907151308829（1）.pdf', '孙绘媛', '311.28K', '2026-09-07'],
    ['20260907151308829.pdf', '孙绘媛', '311.28K', '2026-09-07'],
    [
      'SIGNED KYLE CHAN & ASSOCIATES DESIGN LIMITED-engagement letter-260825（1）.pdf',
      '孙绘媛',
      '225.37K',
      '2026-08-27',
    ],
    [
      'SIGNED KYLE CHAN & ASSOCIATES DESIGN LIMITED-engagement letter-260825.pdf',
      '孙绘媛',
      '813.48K',
      '2026-08-27',
    ],
  ]);
  const [archiveRows, setArchiveRows] = useState([
    ['项目合同原件', '待归档', '1', '未交回', '管理卷宗'],
    ['工作底稿', '未归档', '0', '—', '管理卷宗'],
  ]);
  const body = {
    主页: (
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          [
            '项目摘要',
            '受理日期：2026-09-03\n项目类型：境外资本市场\n数据区域：US / Singapore',
          ],
          [
            '当前团队',
            '主办律师：Sarah Lin\n业务主管：Michael Chen\n项目登记人：Evelyn Park',
          ],
          ['业务状态', '合同：已审批 / 原件待交回\n款项：未收款\n归档：未归档'],
        ].map(([title, text]) => (
          <section key={title} className="border border-[#e1e5e9] bg-white p-5">
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-[#667382]">
              {text}
            </p>
          </section>
        ))}
      </div>
    ),
    动态: (
      <section className="border border-[#e1e5e9] bg-white p-5">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="h-20 w-full resize-none rounded border border-[#dce1e6] p-3 text-sm outline-none focus:border-[#f1666d]"
          placeholder="项目有什么新的进展，可以快速分享给大家哦～"
        />
        <div className="mt-2 flex justify-between">
          <span className="text-xs text-[#86919d]">
            项目成员可见 · 添加附件
          </span>
          <button
            onClick={() => {
              if (note.trim()) {
                setEvents((items) => [note.trim(), ...items]);
                setNote('');
              }
            }}
            className="rounded bg-[#f1666d] px-4 py-1.5 text-xs text-white"
          >
            发布
          </button>
        </div>
        <div className="mt-5 space-y-4">
          {events.map((event, index) => (
            <article
              key={`${event}-${index}`}
              className="border-t border-[#edf0f2] pt-4"
            >
              <div className="flex justify-between text-sm">
                <b>Sarah Lin</b>
                <span className="text-xs text-[#8d98a5]">
                  项目成员可见 · 删除
                </span>
              </div>
              <p className="mt-2 text-sm text-[#5c6876]">{event}</p>
              <p className="mt-2 text-xs text-[#9ba4ae]">刚刚 · 下载 · 评论</p>
            </article>
          ))}
        </div>
      </section>
    ),
    合同: (
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setContractFlow((v) => ({ ...v, approval: '待发起电子签' }))
            }
            className="rounded bg-[#f1666d] px-3 py-2 text-xs text-white"
          >
            发起电子签
          </button>
          <button
            onClick={() =>
              setContractFlow((v) => ({ ...v, seal: '待用印审批' }))
            }
            className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs"
          >
            申请用印
          </button>
          <button
            onClick={() =>
              setContractFlow((v) => ({ ...v, returned: '已交回' }))
            }
            className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs"
          >
            标记合同已交回
          </button>
        </div>
        <DetailTable
          headers={[
            '审批时间',
            '审批状态',
            '合同文档名称',
            '合同类型',
            '用印状态',
            '合同交回状态',
          ]}
          rows={[
            [
              '2026-09-03',
              contractFlow.approval,
              'Engagement Letter.pdf',
              '委托合同',
              contractFlow.seal,
              contractFlow.returned,
            ],
          ]}
          footer="合同原件将进入电子卷宗；签署、用印和交回状态均需写入审计记录。"
        />
      </section>
    ),
    款项: (
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[
            '合同应收款',
            '项目收/退款',
            '已开发票',
            '费用支出',
            '项目利润',
          ].map((item, index) => (
            <button
              key={item}
              onClick={() => setFinanceTab(item)}
              className={`rounded px-4 py-2 text-sm ${financeTab === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => setShowReceivable(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            新增应收款
          </button>
        </div>
        <DetailTable
          headers={
            financeTab === '合同应收款'
              ? ['应收款名称', '金额', '预计收款日', '状态', '操作']
              : ['事项', '金额', '日期', '状态', '操作']
          }
          rows={
            financeTab === '合同应收款'
              ? receivables.map((row) => [
                  row[1],
                  row[2],
                  row[3],
                  row[7],
                  row[8],
                ])
              : [['示例财务事项', '$25,000', '2026-09-20', '待审批', '查看']]
          }
          footer="新增应收、开票、退款、取消收款和冲红应由审批流程驱动；平台只留存合同和付款状态，结算可在线下完成。"
        />
      </section>
    ),
    联系人: (
      <DetailTable
        headers={['姓名', '客户/机构', '职务', '电话/邮箱', '关系']}
        rows={[
          [
            'Alex Morgan',
            'Northstar Holdings',
            'General Counsel',
            '受权限保护',
            '客户联系人',
          ],
          [
            'Jamie Reed',
            'Northstar Holdings',
            'CFO',
            '受权限保护',
            '客户联系人',
          ],
        ]}
        footer="联系人数据按客户和事项权限控制，不在公共动态中展示。"
      />
    ),
    项目成员: (
      <section className="border border-[#e1e5e9] bg-white p-5">
        <div className="flex justify-between">
          <h3 className="font-semibold">本所成员</h3>
          <button
            onClick={() => setShowMemberModal(true)}
            className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white"
          >
            添加
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {memberRows.map(([name, role, status]) => (
            <div
              key={role}
              className="flex items-center justify-between rounded border border-[#edf0f2] px-4 py-3"
            >
              <div>
                <p className="font-medium">{name}</p>
                <p className="mt-1 text-xs text-[#8b96a3]">
                  {role} · {status}
                </p>
                <p className="mt-1 text-xs text-[#a0a9b3]">
                  贡献度：待评估 · 参与审级：全程 · 备注：—
                </p>
              </div>
              <div className="flex gap-3 text-xs text-[#e45159]">
                <button>查看记录</button>
                <button>更换人员</button>
                <button
                  onClick={() =>
                    setMemberRows((items) =>
                      items.filter(
                        (item) => item[0] !== name || item[1] !== role,
                      ),
                    )
                  }
                >
                  退出
                </button>
              </div>
            </div>
          ))}
        </div>
        <h3 className="mt-6 font-semibold">外所成员</h3>
        <p className="mt-3 text-sm text-[#9ba4ae]">暂无外所成员</p>
        <p className="mt-4 border-t border-[#edf0f2] pt-4 text-xs text-[#8b96a3]">
          参与记录：成员加入、退出、更换人员和操作人均会进入审计记录。
        </p>
      </section>
    ),
    项目进程: (
      <section className="border border-[#e1e5e9] bg-white p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            任务列表 <span className="mx-2 text-[#c5cbd2]">|</span> 项目进程
          </h3>
        </div>
        <h4 className="mt-5 text-sm font-semibold">选择进程母版</h4>
        <div className="mt-3 flex flex-wrap gap-2">
          {['全部', '团队进程', '所内进程', '平台进程'].map((kind) => (
            <button
              key={kind}
              onClick={() => setProcessCategory(kind)}
              className={`rounded px-3 py-1.5 text-xs ${processCategory === kind ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
            >
              {kind}
            </button>
          ))}
        </div>
        <input
          value={processSearch}
          onChange={(e) => setProcessSearch(e.target.value)}
          placeholder="搜索进程母版"
          className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <div className="mt-3 max-h-64 overflow-y-auto rounded border border-[#edf0f2]">
          {[
            '[推荐]【专项】股权激励方案设计业务流程',
            '空白流程',
            '【行政】一审通用业务流程',
            '【民事】代理被告一审通用流程',
            '【民事】代理原告一审通用流程',
            '【民事】复杂商事诉讼业务流程',
            '【民事】交通事故一审业务流程',
            '【刑事】二审通用业务流程',
            '【刑事】一审通用业务流程',
            '【刑事】审查起诉阶段通用流程',
            '【刑事】侦查阶段通用流程',
          ]
            .filter((item) => !processSearch || item.includes(processSearch))
            .map((item) => (
              <button
                key={item}
                onClick={() => setProcessTemplate(item)}
                className={`block w-full border-b border-[#f0f2f4] px-4 py-2 text-left text-sm last:border-b-0 ${processTemplate === item ? 'bg-[#fff5f5] text-[#e45159]' : 'hover:bg-[#fafbfc]'}`}
              >
                {item}
              </button>
            ))}
        </div>
        {processTemplate && (
          <div className="mt-4 rounded border border-[#edf0f2] p-4">
            <p className="font-medium">进程使用说明</p>
            <p className="mt-2 text-sm">
              {processTemplate
                .replace(/【.*?】/g, '')
                .replace('[推荐]', '')
                .trim()}
            </p>
            <p className="mt-2 text-xs text-[#7f8b98]">
              业务类别：非诉/专项，公司业务
            </p>
            <p className="text-xs text-[#7f8b98]">流程类别：金助理平台进程</p>
            <p className="text-xs text-[#7f8b98]">更新时间：2018-04-27</p>
            <p className="mt-2 text-xs text-[#7f8b98]">
              研发者信息：该法律产品由金助理团队研发。
            </p>
            <div className="mt-3 flex gap-2">
              <button className="rounded border border-[#dce1e6] px-3 py-1.5 text-xs">
                预览进程
              </button>
              <button
                onClick={() => setProcessStep('第 1 节点：待分配负责人')}
                className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white"
              >
                确定使用
              </button>
            </div>
          </div>
        )}
        <p className="mt-4 text-xs text-[#8b96a3]">
          {processStep === '未配置'
            ? '选择进程母版后可预览并确定使用。'
            : `当前模板：${processTemplate} · ${processStep}`}
        </p>
      </section>
    ),
    日志: (
      <DetailTable
        headers={['日期', '人员', '日志内容', '关联事项']}
        rows={[
          ['2026-09-08', 'Sarah Lin', '完成首轮文件审阅', project[0]],
          ['2026-09-07', 'Evelyn Park', '上传委托合同', project[0]],
        ]}
        footer="日志支持待阅、评论、@成员和事项关联。"
      />
    ),
    文档: (
      <section className="space-y-4">
        <p className="text-xs text-[#84909d]">文件和文件夹支持拖动整理</p>
        <div className="grid gap-4 lg:grid-cols-[190px_1fr]">
          <div className="rounded border border-[#e1e5e9] bg-white p-4">
            <p className="text-sm font-medium">文件夹</p>
            <p className="mt-4 text-sm text-[#9ba4ae]">暂无数据</p>
          </div>
          <div className="rounded border border-[#e1e5e9] bg-white p-4">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={includeSubFolders}
                  onChange={(e) => setIncludeSubFolders(e.target.checked)}
                />
                含子文件夹
              </label>
              <button className="rounded border border-[#dce1e6] px-3 py-1.5 text-xs">
                排序
              </button>
              <input
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="文档名称/类型/创建人"
                className="min-w-52 flex-1 rounded border border-[#dce1e6] px-3 py-1.5 text-xs"
              />
              <button className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white">
                上传
              </button>
              <button
                onClick={() => setShowNewDocument(true)}
                className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white"
              >
                新建
              </button>
              <button className="rounded border border-[#dce1e6] px-3 py-1.5 text-xs">
                ⋮
              </button>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-xs">
                <thead className="bg-[#f6f7f8] text-[#6d7885]">
                  <tr>
                    <th className="px-3 py-2">
                      <input type="checkbox" aria-label="全选/反选" /> 全选/反选
                    </th>
                    <th className="px-3 py-2">文件名</th>
                    <th className="px-3 py-2">创建人</th>
                    <th className="px-3 py-2">大小</th>
                    <th className="px-3 py-2">创建时间</th>
                    <th className="px-3 py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {docRows
                    .filter(
                      (row) => !docSearch || row.join(' ').includes(docSearch),
                    )
                    .map((row) => (
                      <tr key={row[0]} className="border-t border-[#edf0f2]">
                        <td className="px-3 py-3">
                          <input type="checkbox" />
                        </td>
                        <td className="px-3 py-3">
                          <button
                            className="text-left text-[#2563eb] hover:underline"
                            onClick={() => setDocSearch(row[0])}
                          >
                            {row[0]}
                          </button>
                        </td>
                        <td className="px-3 py-3">{row[1]}</td>
                        <td className="px-3 py-3">{row[2]}</td>
                        <td className="px-3 py-3">{row[3]}</td>
                        <td className="px-3 py-3">预览</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-[#84909d]">
              共{' '}
              {
                docRows.filter(
                  (row) => !docSearch || row.join(' ').includes(docSearch),
                ).length
              }{' '}
              条
            </p>
          </div>
        </div>
      </section>
    ),
    日程: (
      <section className="border border-[#e1e5e9] bg-white p-5">
        <div className="flex justify-between">
          <h3 className="font-semibold">项目日程</h3>
          <button
            onClick={() => setShowProjectEvent(true)}
            className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white"
          >
            新建日程
          </button>
        </div>
        <div className="mt-4 grid grid-cols-7 gap-2 text-center text-sm">
          {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
            <div
              key={day}
              className={`rounded p-3 ${index === 2 ? 'bg-[#fff0f0] text-[#e45159]' : 'bg-[#f6f7f8]'}`}
            >
              {day}
              <br />
              <span className="text-xs">{6 + index}</span>
            </div>
          ))}
        </div>
        {projectEvents.length === 0 ? (
          <p className="mt-5 text-sm text-[#8c97a4]">
            暂无项目日程。支持工作、开庭、会议、培训和外出等类型。
          </p>
        ) : (
          <div className="mt-5 space-y-2">
            {projectEvents.map((event) => (
              <div
                key={`${event[0]}-${event[1]}`}
                className="rounded border border-[#edf0f2] px-4 py-3 text-sm"
              >
                <b>{event[0]}</b>
                <span className="ml-3 text-xs text-[#84909d]">
                  {event[1]} · {event[2]} · 项目成员可见
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    ),
    财产保全: (
      <DetailTable
        headers={['保全事项', '申请日期', '到期日', '状态', '负责人']}
        rows={[['待建立保全事项', '—', '—', '未开始', '—']]}
        footer="保全到期将进入工作首页的业务提醒。"
      />
    ),
    电子卷宗: (
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowArchiveUpload(true)}
            className="rounded bg-[#f1666d] px-3 py-2 text-xs text-white"
          >
            上传合同原件
          </button>
          <button
            onClick={() => setShowArchiveUpload(true)}
            className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs"
          >
            上传电子卷宗
          </button>
        </div>
        <DetailTable
          headers={['卷宗名称', '归档状态', '文件数', '原件状态', '操作']}
          rows={archiveRows.map((row, index) => [
            ...row.slice(0, 4),
            row[3] === '借阅中'
              ? '归还'
              : index === 0
                ? '归档 / 借阅'
                : '管理卷宗',
          ])}
          footer="电子卷宗用于归档、借阅、原件留存；所有下载、借阅和归档动作需要审计。"
        />
        <div className="flex flex-wrap gap-2">
          {archiveRows.map((row, index) => (
            <div key={row[0]} className="flex gap-2 text-xs">
              <button
                onClick={() =>
                  setArchiveRows((items) =>
                    items.map((item, i) =>
                      i === index
                        ? [
                            item[0],
                            item[1] === '已归档' ? '待归档' : '已归档',
                            item[2],
                            item[3],
                            item[4],
                          ]
                        : item,
                    ),
                  )
                }
                className="rounded border border-[#dce1e6] bg-white px-3 py-1.5"
              >
                {row[1] === '已归档' ? '取消归档' : `归档 · ${row[0]}`}
              </button>
              <button
                onClick={() =>
                  setArchiveRows((items) =>
                    items.map((item, i) =>
                      i === index
                        ? [
                            item[0],
                            item[1],
                            item[2],
                            item[3] === '借阅中' ? '已归还' : '借阅中',
                            item[4],
                          ]
                        : item,
                    ),
                  )
                }
                className="rounded border border-[#dce1e6] bg-white px-3 py-1.5"
              >
                {row[3] === '借阅中' ? '归还' : '借阅'}
              </button>
            </div>
          ))}
        </div>
      </section>
    ),
  } as Record<string, ReactNode>;
  return (
    <div className="p-6">
      <button onClick={onBack} className="mb-4 text-sm text-[#e45159]">
        ← 返回项目列表
      </button>
      <section className="border border-[#e0e4e8] bg-white">
        <div className="border-b border-[#edf0f2] px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">
                {project[0]}{' '}
                <button
                  onClick={() => setFollowed(!followed)}
                  className={`ml-2 text-sm ${followed ? 'text-[#f1a14b]' : 'text-[#a6afb9]'}`}
                >
                  {followed ? '★ 已关注' : '☆ 关注'}
                </button>
              </h2>
              <p className="mt-2 text-xs text-[#7f8a97]">
                {project[1]} ｜ {project[4]} ｜ 合同生效 1/1 ｜ {project[5]} ｜
                未归档
              </p>
            </div>
            <button className="rounded border border-[#dce1e6] px-3 py-1.5 text-xs">
              更多操作
            </button>
          </div>
        </div>
        <div className="flex overflow-x-auto border-b border-[#edf0f2] px-3">
          {tabs.map((item) => (
            <button
              onClick={() => setTab(item)}
              key={item}
              className={`shrink-0 px-3 py-3 text-sm ${tab === item ? 'border-b-2 border-[#f1666d] font-medium text-[#e45159]' : 'text-[#5f6b78]'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="bg-[#f7f8fa] p-5">{body[tab]}</div>
      </section>
      {showMemberModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">邀请项目成员</h3>
            <p className="mt-2 text-xs text-[#84909d]">
              成员确认后才可访问项目资料，并会在工作首页收到邀请提醒。
            </p>
            <input
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="成员姓名或邮箱"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <select
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
              className="mt-3 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              <option>线索获取人</option>
              <option>案源开拓人</option>
              <option>业务主管</option>
              <option>主办律师</option>
              <option>项目登记人</option>
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowMemberModal(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (memberName.trim())
                    setMemberRows((items) => [
                      ...items,
                      [memberName.trim(), memberRole, '待确认'],
                    ]);
                  setMemberName('');
                  setShowMemberModal(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                发送邀请
              </button>
            </div>
          </div>
        </div>
      )}
      {showReceivable && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">添加应收款</h3>
            <label className="mt-4 block text-sm">
              *款项名称
              <input
                value={receivableForm.name}
                onChange={(e) =>
                  setReceivableForm({ ...receivableForm, name: e.target.value })
                }
                placeholder="请输入款项名称"
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-sm">
              *款项类型
              <select
                value={receivableForm.type}
                onChange={(e) =>
                  setReceivableForm({ ...receivableForm, type: e.target.value })
                }
                className="mt-2 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>计量收费</option>
                <option>风险收费</option>
                <option>代付费用</option>
                <option>协商增收</option>
              </select>
            </label>
            <label className="mt-3 block text-sm">
              *应收金额
              <input
                value={receivableForm.amount}
                onChange={(e) =>
                  setReceivableForm({
                    ...receivableForm,
                    amount: e.target.value,
                  })
                }
                placeholder="金额必须为数字"
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-sm">
              预计收款时间
              <input
                type="date"
                value={receivableForm.date}
                onChange={(e) =>
                  setReceivableForm({ ...receivableForm, date: e.target.value })
                }
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-sm">
              *收款条件
              <input
                value={receivableForm.condition}
                onChange={(e) =>
                  setReceivableForm({
                    ...receivableForm,
                    condition: e.target.value,
                  })
                }
                placeholder="如果不清楚收款条件，可以写“按合同约定的条件收款”"
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-3 block text-sm">
              备注
              <input
                value={receivableForm.note}
                onChange={(e) =>
                  setReceivableForm({ ...receivableForm, note: e.target.value })
                }
                placeholder="请输入备注内容"
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowReceivable(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (
                    receivableForm.name.trim() &&
                    receivableForm.amount.trim()
                  ) {
                    setReceivables((items) => [
                      ...items,
                      [
                        '新增应收款',
                        receivableForm.name.trim(),
                        `$${receivableForm.amount}`,
                        receivableForm.date,
                        '$0',
                        `$${receivableForm.amount}`,
                        '$0',
                        '未到账',
                        '未开票',
                      ],
                    ]);
                    setShowReceivable(false);
                    setReceivableForm({
                      name: '',
                      type: '计量收费',
                      amount: '',
                      date: '2026-09-15',
                      condition: '',
                      note: '',
                    });
                  }
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                提交
              </button>
            </div>
          </div>
        </div>
      )}
      {showNewDocument && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">新建文档</h3>
              <button
                onClick={() => setShowNewDocument(false)}
                className="text-xl text-[#84909d]"
              >
                ×
              </button>
            </div>
            <p className="mt-4 text-sm">* 文书类别</p>
            <div className="mt-2 flex gap-5 text-sm">
              <label>
                <input type="radio" checked readOnly /> 业务文档
              </label>
              <label className="text-[#b7bec7]">
                <input type="radio" disabled /> 所务文档
              </label>
            </div>
            <p className="mt-4 text-sm">* 关联项目/案源</p>
            <input
              value={project[0]}
              disabled
              className="mt-2 w-full rounded border border-[#dce1e6] bg-[#f7f8fa] px-3 py-2 text-sm"
            />
            <div className="mt-4 flex gap-4 text-sm">
              <span>全部</span>
              <span>团队模板</span>
              <span>所内模板</span>
              <span>平台模板</span>
            </div>
            <input
              placeholder="请输入关键词检索"
              className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {[
                '委托合同',
                '所函',
                '介绍信',
                '会见信',
                '见证书',
                '空白文档',
              ].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    if (item === '空白文档') {
                      setDocRows((items) => [
                        [
                          '新建文档.docx',
                          '当前用户',
                          '0K',
                          new Date().toISOString().slice(0, 10),
                        ],
                        ...items,
                      ]);
                      setShowNewDocument(false);
                    }
                  }}
                  className="rounded border border-[#e5e9ed] px-3 py-3 text-left hover:bg-[#fff7f7]"
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-[#84909d]">
              选择模板后进入文档编辑页面。
            </p>
          </div>
        </div>
      )}
      {showProjectEvent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">新建项目日程</h3>
            <input
              value={projectEvent.title}
              onChange={(e) =>
                setProjectEvent({ ...projectEvent, title: e.target.value })
              }
              placeholder="日程标题"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                type="date"
                value={projectEvent.date}
                onChange={(e) =>
                  setProjectEvent({ ...projectEvent, date: e.target.value })
                }
                className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <select
                value={projectEvent.type}
                onChange={(e) =>
                  setProjectEvent({ ...projectEvent, type: e.target.value })
                }
                className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>会议</option>
                <option>开庭</option>
                <option>工作</option>
                <option>培训</option>
                <option>外出</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowProjectEvent(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (projectEvent.title.trim())
                    setProjectEvents((items) => [
                      ...items,
                      [
                        projectEvent.title.trim(),
                        projectEvent.date,
                        projectEvent.type,
                      ],
                    ]);
                  setProjectEvent({
                    title: '',
                    date: '2026-09-15',
                    type: '会议',
                  });
                  setShowProjectEvent(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存日程
              </button>
            </div>
          </div>
        </div>
      )}
      {showArchiveUpload && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">上传卷宗文件</h3>
            <p className="mt-2 text-xs text-[#84909d]">
              上传后进入原件留存和归档审核，不会自动对外共享。
            </p>
            <input
              value={archiveName}
              onChange={(e) => setArchiveName(e.target.value)}
              placeholder="文件或卷宗名称"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowArchiveUpload(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (archiveName.trim())
                    setArchiveRows((items) => [
                      [archiveName.trim(), '待归档', '1', '未交回', '管理卷宗'],
                      ...items,
                    ]);
                  setArchiveName('');
                  setShowArchiveUpload(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                上传并登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailTable({
  headers,
  rows,
  footer,
}: {
  headers: string[];
  rows: string[][];
  footer: string;
}) {
  return (
    <section className="rounded border border-[#e1e5e9] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-[#f6f7f8] text-xs text-[#73808e]">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-4 py-3 font-medium">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="border-t border-[#edf0f2]">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${cell}-${cellIndex}`}
                    className="px-4 py-4 text-[#596675]"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="border-t border-[#edf0f2] px-4 py-3 text-xs text-[#8c97a4]">
        {footer}
      </p>
    </section>
  );
}

function WorkOperations({
  section,
  logs,
  setLogs,
  tasks,
  setTasks,
  projects,
  projectMembership,
  setProjectMembership,
}: {
  section: string;
  logs: string[][];
  setLogs: React.Dispatch<React.SetStateAction<string[][]>>;
  tasks: string[][];
  setTasks: React.Dispatch<React.SetStateAction<string[][]>>;
  projects: string[][];
  projectMembership: Record<string, 'member' | 'invited'>;
  setProjectMembership: React.Dispatch<
    React.SetStateAction<Record<string, 'member' | 'invited'>>
  >;
}) {
  const [taskView, setTaskView] = useState('分配给我的');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskProject, setTaskProject] = useState('Northstar Holdings IPO');
  const [taskDeadline, setTaskDeadline] = useState('2026-09-12');
  const [taskPriority, setTaskPriority] = useState('普通');
  const [taskAssignee, setTaskAssignee] = useState('Sarah Lin');
  const [taskFilter, setTaskFilter] = useState('全部任务');
  const [logMode, setLogMode] = useState('我写的日志');
  const [showLogForm, setShowLogForm] = useState(false);
  const [logText, setLogText] = useState('');
  const [logType, setLogType] = useState('项目/案源');
  const [relatedProject, setRelatedProject] = useState(
    'Northstar Holdings IPO',
  );
  const [workType, setWorkType] = useState('文件审阅');
  const [workMode, setWorkMode] = useState('工作');
  const [hours, setHours] = useState('0.5');
  const [reviewer, setReviewer] = useState('');
  const [visibility, setVisibility] = useState('项目团队可见');
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('2026-09-10');
  const [eventTime, setEventTime] = useState('10:00');
  const [eventType, setEventType] = useState('会议');
  const [eventProject, setEventProject] = useState('Northstar Holdings IPO');
  const [eventScope, setEventScope] = useState('项目团队可见');
  const [events, setEvents] = useState<string[][]>([
    [
      '2026-09-10',
      '客户会议',
      '会议',
      'Northstar Holdings IPO',
      '项目团队可见',
    ],
    [
      '2026-09-12',
      '文件审阅',
      '工作',
      'Orion BioTech v. Atlas',
      '项目团队可见',
    ],
  ]);
  const calendarEvents = [
    ...events,
    ...tasks
      .filter((task) => !['已完成', '已取消'].includes(task[4]))
      .map((task) => [
        task[3],
        `截止：${task[0]}`,
        '任务',
        task[1],
        '项目团队可见',
      ]),
  ];
  if (section === '日志' && logMode !== '我写的日志')
    return (
      <LogSubmodule
        mode={logMode}
        onMode={setLogMode}
        logs={logs}
        setLogs={setLogs}
      />
    );
  if (section === '日志')
    return (
      <div className="p-7">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">工作日志</h2>
            <p className="mt-1 text-xs text-[#84909d]">
              记录、待阅、评论与项目关联
            </p>
          </div>
          <button
            onClick={() => setShowLogForm(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            写日志
          </button>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {[
            '我写的日志',
            '业务协作日志',
            '提交给我的',
            '抄送给我的',
            '工时统计',
          ].map((item) => (
            <button
              key={item}
              onClick={() => setLogMode(item)}
              className={`rounded px-3 py-1.5 text-xs ${logMode === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mb-4 grid gap-2 rounded border border-[#e0e4e8] bg-white p-4 md:grid-cols-4">
          <input
            className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
            placeholder="开始日期"
            value="2026-06-08"
            readOnly
          />
          <input
            className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
            placeholder="结束日期"
            value="2026-09-08"
            readOnly
          />
          <input
            className="rounded border border-[#dce1e6] px-3 py-2 text-sm md:col-span-2"
            placeholder="日志内容 / 客户 / 项目名称"
          />
          <button className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white md:col-span-4">
            搜索
          </button>
        </div>
        <DetailTable
          headers={['日期', '提交人', '关联项目', '日志摘要', '状态']}
          rows={logs}
          footer="支持按项目、人员和时间检索；评论与 @ 提醒均进入消息中心。"
        />
        {showLogForm && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">工作日志 · 2026-09-08</h3>
                <button
                  onClick={() => setShowLogForm(false)}
                  className="text-xl text-[#87929f]"
                >
                  ×
                </button>
              </div>
              <label className="mt-5 block text-sm font-medium">
                * 日志内容
              </label>
              <textarea
                value={logText}
                onChange={(e) => setLogText(e.target.value)}
                className="mt-2 h-28 w-full rounded border border-[#dce1e6] p-3 text-sm"
                placeholder="请输入内容..."
              />
              <label className="mt-4 block text-sm font-medium">
                * 日志类型
              </label>
              <div className="mt-2 flex flex-wrap gap-4 text-sm">
                {['项目/案源', '客户开发/维护', '所务/公共事务'].map((item) => (
                  <label key={item} className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={logType === item}
                      onChange={() => setLogType(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
              <label className="mt-4 block text-sm font-medium">
                * 关联项目
              </label>
              <select
                value={relatedProject}
                onChange={(e) => setRelatedProject(e.target.value)}
                className="mt-2 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                {projects
                  .filter(
                    (project) => projectMembership[project[0]] === 'member',
                  )
                  .map((project) => (
                    <option key={project[0]}>{project[0]}</option>
                  ))}
              </select>
              <p className="text-xs text-[#8c97a4]">
                仅显示当前用户已加入的项目；受邀项目需先在首页确认加入。
              </p>
              <label className="mt-4 block text-sm font-medium">
                * 工作类型
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="mt-2 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>文件审阅</option>
                <option>法律研究</option>
                <option>客户沟通</option>
                <option>会议 / 出庭</option>
                <option>行政事务</option>
              </select>
              <label className="mt-4 block text-sm font-medium">日志附件</label>
              <div className="mt-2 rounded border border-dashed border-[#cbd4dd] p-4 text-center text-xs text-[#7e8996]">
                上传文档 · 拖拽上传 · 选择已有文档
              </div>
              <label className="mt-4 block text-sm font-medium">
                * 办理人 / 工时
              </label>
              <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_auto_1fr_auto]">
                <input
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  value="Sarah Lin"
                  readOnly
                />
                <div className="flex items-center gap-3 text-xs">
                  <label>
                    <input
                      type="radio"
                      checked={workMode === '工作'}
                      onChange={() => setWorkMode('工作')}
                    />{' '}
                    工作
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={workMode === '在途'}
                      onChange={() => setWorkMode('在途')}
                    />{' '}
                    在途
                  </label>
                </div>
                <input
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  placeholder="工时"
                />
                <span className="self-center text-xs text-[#7e8996]">小时</span>
              </div>
              <label className="mt-4 block text-sm font-medium">提交审阅</label>
              <select
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                className="mt-2 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option value="">请选择审阅人</option>
                <option>Michael Chen</option>
                <option>Evelyn Park</option>
              </select>
              <input
                className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="选择抄送人"
              />
              <label className="mt-3 block text-sm font-medium">可见范围</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                className="mt-2 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>项目团队可见</option>
                <option>全所可见</option>
                <option>仅自己可见</option>
              </select>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <input
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  placeholder="下次联系时间"
                />
                <input
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  placeholder="下次联系事项"
                />
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowLogForm(false)}
                  className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (logText.trim()) {
                      setLogs((items) => [
                        [
                          '2026-09-08',
                          'Sarah Lin',
                          relatedProject,
                          `${workType}：${logText.trim()}（${hours} 小时）`,
                          `待阅 · ${visibility}`,
                        ],
                        ...items,
                      ]);
                      publishNotification({
                        title: '日志已提交审阅',
                        body: `${relatedProject} 的工作日志已进入待阅流程`,
                        category: '日志',
                        target: '消息中心',
                      });
                    }
                    setLogText('');
                    setShowLogForm(false);
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  提交日志
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  if (section === '日程')
    return <ScheduleWorkspace projects={projects} tasks={tasks} />;
  if (section === '日程')
    return (
      <div className="p-7">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">日程</h2>
            <p className="mt-1 text-xs text-[#84909d]">个人 / 团队 · 周视图</p>
          </div>
          <button
            onClick={() => setShowEventForm(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            新建日程
          </button>
        </div>
        <section className="border border-[#e0e4e8] bg-white p-5">
          <div className="grid grid-cols-7 border-b border-[#edf0f2] text-center text-xs text-[#7d8996]">
            {['日 6', '一 7', '二 8', '三 9', '四 10', '五 11', '六 12'].map(
              (day) => (
                <div
                  key={day}
                  className="border-r border-[#edf0f2] py-3 last:border-r-0"
                >
                  {day}
                </div>
              ),
            )}
          </div>
          <div className="grid min-h-[360px] grid-cols-7 text-xs">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="border-r border-[#edf0f2] p-2 last:border-r-0"
              >
                {calendarEvents
                  .filter((event) => Number(event[0].slice(-2)) === 6 + i)
                  .map((event) => (
                    <div
                      key={`${event[0]}-${event[1]}`}
                      className="mb-2 rounded bg-[#eef5ff] p-2 text-[#4680bd]"
                    >
                      <strong>{event[1]}</strong>
                      <br />
                      {event[2]} · {event[3]}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </section>
        <p className="mt-3 text-xs text-[#87929f]">
          任务截止日期、日志下次联系时间和审批截止时间可自动生成日程；类型和可见范围由创建人控制。
        </p>
        {showEventForm && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold">新建日程</h3>
              <div className="mt-4 space-y-3">
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="日程标题"
                  className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  />
                </div>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>会议</option>
                  <option>工作</option>
                  <option>开庭</option>
                  <option>培训</option>
                  <option>外出</option>
                </select>
                <select
                  value={eventProject}
                  onChange={(e) => setEventProject(e.target.value)}
                  className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>Northstar Holdings IPO</option>
                  <option>Orion BioTech v. Atlas</option>
                  <option>Aster Mobility market entry</option>
                </select>
                <select
                  value={eventScope}
                  onChange={(e) => setEventScope(e.target.value)}
                  className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>项目团队可见</option>
                  <option>全所可见</option>
                  <option>仅自己可见</option>
                </select>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowEventForm(false)}
                  className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (eventTitle.trim())
                      setEvents((items) => [
                        [
                          eventDate,
                          `${eventTime} ${eventTitle.trim()}`,
                          eventType,
                          eventProject,
                          eventScope,
                        ],
                        ...items,
                      ]);
                    setEventTitle('');
                    setShowEventForm(false);
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  保存日程
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">任务</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            支持项目任务、个人任务与业务协作
          </p>
        </div>
        <button
          onClick={() => setShowTaskForm(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          新建任务
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {['分配给我的', '待我分配', '我分配的', '我发布的', '业务协作'].map(
          (item) => (
            <button
              key={item}
              onClick={() => setTaskView(item)}
              className={`rounded px-4 py-2 text-sm ${taskView === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded border border-[#e0e4e8] bg-white p-3 text-xs">
        {['全部任务', '未完成', '已超期', '已完成', '已取消'].map((item) => (
          <button
            key={item}
            onClick={() => setTaskFilter(item)}
            className={`rounded px-3 py-1.5 ${taskFilter === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
          >
            {item}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-[#657181]">
          <input type="checkbox" defaultChecked /> 包含系统任务
        </label>
        <span className="text-[#8c97a4]">按截止时间排序</span>
      </div>
      <DetailTable
        headers={[
          '状态',
          '项目/案源',
          '工作内容',
          '截止时间',
          '分配人',
          '优先级',
        ]}
        rows={tasks
          .filter((task) =>
            taskFilter === '全部任务'
              ? true
              : taskFilter === '未完成'
                ? !['已完成', '已取消'].includes(task[4])
                : taskFilter === '已超期'
                  ? task[3] < '2026-09-08' &&
                    !['已完成', '已取消'].includes(task[4])
                  : task[4] === taskFilter,
          )
          .filter((task) =>
            taskView === '分配给我的'
              ? task[2] === 'Sarah Lin'
              : taskView === '待我分配'
                ? task[2] === '待分配'
                : taskView === '我分配的'
                  ? task[5] === 'Sarah Lin'
                  : taskView === '我发布的'
                    ? task[5] === 'Sarah Lin'
                    : taskView === '业务协作'
                      ? task[6] === '业务协作'
                      : true,
          )
          .map((task) => [
            task[4],
            task[1],
            task[0],
            task[3],
            task[2],
            taskPriority,
          ])}
        footer={`当前视图：${taskView}。任务状态变更会同步项目进程和工作首页待办提醒。`}
      />
      {tasks.length > 0 && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() =>
              setTasks((items) =>
                items.map((task, index) =>
                  index === 0 ? [...task.slice(0, 4), '已完成'] : task,
                ),
              )
            }
            className="rounded bg-[#eaf7ef] px-3 py-2 text-xs text-[#258956]"
          >
            完成首项任务
          </button>
          <button
            onClick={() =>
              setTasks((items) =>
                items.map((task, index) =>
                  index === 0 ? [...task.slice(0, 4), '已取消'] : task,
                ),
              )
            }
            className="rounded border border-[#f2c7ca] px-3 py-2 text-xs text-[#d9525b]"
          >
            取消首项任务
          </button>
        </div>
      )}
      {showTaskForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">创建任务</h3>
              <button
                onClick={() => setShowTaskForm(false)}
                className="text-xl text-[#87929f]"
              >
                ×
              </button>
            </div>
            <div className="mt-5 space-y-3">
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="工作内容 / 任务名称"
                className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <select
                value={taskProject}
                onChange={(e) => setTaskProject(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>Northstar Holdings IPO</option>
                <option>Orion BioTech v. Atlas</option>
                <option>Aster Mobility market entry</option>
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>普通</option>
                  <option>重要</option>
                  <option>紧急</option>
                </select>
              </div>
              <select
                value={taskAssignee}
                onChange={(e) => setTaskAssignee(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>Sarah Lin</option>
                <option>Michael Chen</option>
                <option>Evelyn Park</option>
                <option>待分配</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowTaskForm(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (taskTitle.trim()) {
                    setTasks((items) => [
                      [
                        taskTitle.trim(),
                        taskProject,
                        taskAssignee,
                        taskDeadline,
                        '未开始',
                        'Sarah Lin',
                        taskView,
                      ],
                      ...items,
                    ]);
                    publishNotification({
                      title: '新任务提醒',
                      body: `${taskTitle.trim()} 已分配给 ${taskAssignee}`,
                      category: '任务',
                      target: '任务',
                    });
                  }
                  setTaskTitle('');
                  setShowTaskForm(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存任务
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MessageCenter({
  logs = [],
  tasks = [],
}: {
  logs?: string[][];
  tasks?: string[][];
}) {
  const [category, setCategory] = useState('@/评论/赞');
  const [read, setRead] = useState<string[]>([]);
  const categories = [
    '@/评论/赞',
    '待阅日志',
    '项目协作',
    '收款开票',
    '日程提醒',
    '待办任务',
    '流程审批',
    '案源协作',
  ];
  const messages = [
    ['Sarah Lin 在 Northstar 项目动态中提到了你', '@/评论/赞', '2 分钟前'],
    ['Northstar 10-K review.docx 已提交给你审阅', '待阅日志', '16 分钟前'],
    ['外部律师协作需求收到新的投标', '案源协作', '1 小时前'],
    ['首期法律服务费预计 2026-09-20 到期', '收款开票', '今天'],
    ...logs
      .filter((row) => row[4]?.startsWith('待阅'))
      .map((row) => [`${row[2]} 有新的日志待你审阅`, '待阅日志', '刚刚']),
    ...tasks
      .filter((row) => !['已完成', '已取消'].includes(row[4]))
      .map((row) => [`任务待处理：${row[0]}`, '待办任务', row[3] ?? '待定']),
  ];
  const visible = messages.filter(
    (row) => row[1] === category || category === '@/评论/赞',
  );
  return (
    <div className="p-7">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">消息中心</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            统一汇总工作提醒、协作通知和待处理事项
          </p>
        </div>
        <button
          onClick={() => setRead(messages.map((row) => row[0]))}
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          全部标记已读
        </button>
      </div>
      <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border border-[#e0e4e8] bg-white p-2">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`flex w-full items-center justify-between rounded px-3 py-3 text-left text-sm ${category === item ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
            >
              <span>{item}</span>
              <span className="text-xs text-[#d65b63]">
                {item === '待阅日志' ? '1' : item === '案源协作' ? '1' : ''}
              </span>
            </button>
          ))}
        </aside>
        <section className="border border-[#e0e4e8] bg-white">
          <div className="divide-y divide-[#edf0f2]">
            {visible.map((row) => (
              <button
                key={row[0]}
                onClick={() =>
                  setRead((items) => [...new Set([...items, row[0]])])
                }
                className={`flex w-full items-start justify-between gap-4 p-4 text-left hover:bg-[#fffafa] ${read.includes(row[0]) ? 'opacity-50' : ''}`}
              >
                <div>
                  <p className="text-sm font-medium">{row[0]}</p>
                  <p className="mt-1 text-xs text-[#8a96a3]">
                    {row[1]} · {row[2]}
                  </p>
                </div>
                <span className="mt-1 size-2 rounded-full bg-[#f1666d]" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ScheduleWorkspace({
  projects,
  tasks,
}: {
  projects: string[][];
  tasks: string[][];
}) {
  type ScheduleItem = {
    date: string;
    title: string;
    type: string;
    project: string;
    time: string;
    location: string;
    participants: string;
  };
  const [tab, setTab] = useState('我的日程');
  const [view, setView] = useState<'月' | '周' | '列表'>('月');
  const [cursor, setCursor] = useState(new Date(2026, 8, 1));
  const [category, setCategory] = useState('工作日程');
  const [onlyMine, setOnlyMine] = useState(false);
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('工作');
  const [project, setProject] = useState(projects[0]?.[0] ?? '');
  const [startDate, setStartDate] = useState('2026-09-08');
  const [startTime, setStartTime] = useState('08:30');
  const [endDate, setEndDate] = useState('2026-09-08');
  const [endTime, setEndTime] = useState('09:00');
  const [allDay, setAllDay] = useState(false);
  const [location, setLocation] = useState('');
  const [room, setRoom] = useState('');
  const [mainParticipants, setMainParticipants] = useState('');
  const [otherParticipants, setOtherParticipants] = useState('');
  const [description, setDescription] = useState('');
  const [sharedTeam, setSharedTeam] = useState('张博彦律师团队');
  const [notShared, setNotShared] = useState(false);
  const [reminder1, setReminder1] = useState('');
  const [reminder2, setReminder2] = useState('');
  const [items, setItems] = useState<ScheduleItem[]>([
    {
      date: '2026-09-10',
      title: '客户会议',
      type: '会议',
      project: 'Northstar Holdings IPO',
      time: '10:00',
      location: '纽约办公室',
      participants: 'Sarah Lin',
    },
    {
      date: '2026-09-12',
      title: '文件审阅',
      type: '工作',
      project: 'Orion BioTech v. Atlas',
      time: '14:00',
      location: '',
      participants: 'Sarah Lin',
    },
  ]);
  const categories = [
    '工作日程',
    '开庭日程',
    '会议日程',
    '培训日程',
    '外出日程',
  ];
  const monthLabel = `${cursor.getFullYear()}年${cursor.getMonth() + 1}月`;
  const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const firstDay = monthStart.getDay();
  const daysInMonth = new Date(
    cursor.getFullYear(),
    cursor.getMonth() + 1,
    0,
  ).getDate();
  const cells = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    return { date, inMonth: day >= 1 && day <= daysInMonth };
  });
  const taskItems: ScheduleItem[] = tasks
    .filter((task) => !['已完成', '已取消'].includes(task[4]))
    .map((task) => ({
      date: task[3],
      title: `截止：${task[0]}`,
      type: '工作',
      project: task[1],
      time: '全天',
      location: '',
      participants: task[2],
    }));
  const visibleItems = [...items, ...taskItems].filter((item) => {
    const matchesSearch = `${item.title} ${item.project} ${item.participants}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      category === '工作日程' || item.type === category.replace('日程', '');
    const matchesMine =
      !onlyMine ||
      item.participants.includes('Sarah Lin') ||
      item.participants.includes('当前账号');
    return matchesSearch && matchesCategory && matchesMine;
  });
  const dateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const openForm = (date?: string) => {
    if (date) {
      setStartDate(date);
      setEndDate(date);
    }
    setMenuOpen(false);
    setShowForm(true);
  };
  const create = () => {
    if (!title.trim()) return;
    setItems((current) => [
      {
        date: startDate,
        title: title.trim(),
        type,
        project,
        time: allDay ? '全天' : startTime,
        location: location || room,
        participants: mainParticipants || '当前账号',
      },
      ...current,
    ]);
    publishNotification({
      title: '日程已创建',
      body: `${startDate} ${allDay ? '全天' : startTime} · ${title.trim()}`,
      category: '日程',
      target: '日程',
    });
    setTitle('');
    setDescription('');
    setShowForm(false);
  };
  return (
    <div className="flex min-h-[calc(100vh-130px)] bg-white">
      <aside className="w-52 shrink-0 border-r border-[#edf0f2] bg-white">
        <div className="flex border-b border-[#edf0f2] text-sm">
          {['我的日程', '团队日程'].map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`flex-1 py-4 ${tab === item ? 'border-b-2 border-[#f1666d] text-[#e45159]' : 'text-[#52606d]'}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="border-b border-[#edf0f2] p-3">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>{monthLabel}</span>
            <span className="flex gap-3 text-[#697586]">
              <button
                aria-label="上一个月"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                  )
                }
              >
                ‹
              </button>
              <button
                aria-label="下一个月"
                onClick={() =>
                  setCursor(
                    new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                  )
                }
              >
                ›
              </button>
            </span>
          </div>
          <div className="grid grid-cols-7 gap-y-2 text-center text-[11px] text-[#8993a0]">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <span key={day}>{day}</span>
            ))}
            {cells.slice(0, 35).map(({ date, inMonth }) => (
              <button
                key={dateKey(date)}
                onClick={() => openForm(dateKey(date))}
                className={`mx-auto grid size-5 place-items-center rounded-full ${inMonth && date.getDate() === 8 && cursor.getMonth() === 8 ? 'bg-[#f1666d] text-white' : inMonth ? 'text-[#52606d] hover:bg-[#fff0f1]' : 'text-[#c3c9d0]'}`}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2 p-3">
          {categories.map((item, index) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`flex w-full items-center gap-3 rounded px-3 py-3 text-left text-sm ${category === item ? 'bg-[#f3f5f7]' : 'hover:bg-[#f7f8fa]'}`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-white ${['bg-[#4689e8]', 'bg-[#f1a15c]', 'bg-[#42c6a8]', 'bg-[#ed6b78]', 'bg-[#e4b329]'][index]}`}
              >
                ●
              </span>
              {item}
            </button>
          ))}
        </div>
      </aside>
      <section className="min-w-0 flex-1 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f2] px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              aria-label="上一个月"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
                )
              }
              className="border px-3 py-1 text-[#697586]"
            >
              ‹
            </button>
            <button
              aria-label="下一个月"
              onClick={() =>
                setCursor(
                  new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
                )
              }
              className="border px-3 py-1 text-[#697586]"
            >
              ›
            </button>
            <button
              onClick={() => setCursor(new Date(2026, 8, 1))}
              className="border px-3 py-1 text-sm"
            >
              今天
            </button>
            <h2 className="ml-3 text-lg font-semibold">{monthLabel}</h2>
          </div>
          <div className="flex items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="日程主题"
              className="h-9 w-56 rounded border px-3 text-sm"
            />
            <button
              onClick={() => setOnlyMine((value) => !value)}
              className={`text-sm ${onlyMine ? 'text-[#e45159]' : 'text-[#697586]'}`}
            >
              □ 只显示我参与的日程
            </button>
            <div className="flex border">
              {(['周', '月', '列表'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setView(item)}
                  className={`px-3 py-1.5 text-sm ${view === item ? 'text-[#e45159]' : 'text-[#52606d]'}`}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((open) => !open)}
                className="rounded bg-[#f1666d] px-5 py-2 text-sm text-white"
              >
                新建⌄
              </button>
              {menuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-32 border bg-white py-1 text-sm shadow-lg">
                  {['日程', '开庭日程', '会议日程'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setType(
                          item === '日程' ? '工作' : item.replace('日程', ''),
                        );
                        openForm();
                      }}
                      className="block w-full px-4 py-2 text-left hover:bg-[#fff0f1]"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {view === '列表' ? (
          <div className="p-6">
            <table className="w-full text-sm">
              <thead className="bg-[#f7f8fa] text-left text-[#697586]">
                <tr>
                  {[
                    '日期',
                    '时间',
                    '日程主题',
                    '类型',
                    '关联项目',
                    '地点',
                    '参与人员',
                  ].map((h) => (
                    <th key={h} className="px-3 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item, index) => (
                  <tr key={`${item.date}-${index}`} className="border-b">
                    <td className="px-3 py-3">{item.date}</td>
                    <td className="px-3 py-3">{item.time}</td>
                    <td className="px-3 py-3">{item.title}</td>
                    <td className="px-3 py-3">{item.type}</td>
                    <td className="px-3 py-3">{item.project}</td>
                    <td className="px-3 py-3">{item.location || '-'}</td>
                    <td className="px-3 py-3">{item.participants}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!visibleItems.length && (
              <div className="py-20 text-center text-sm text-[#a1a8b0]">
                暂无日程
              </div>
            )}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-7 border-b text-center text-sm text-[#52606d]">
              {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map(
                (day) => (
                  <div key={day} className="py-3">
                    {day}
                  </div>
                ),
              )}
            </div>
            <div
              className={`grid grid-cols-7 ${view === '周' ? 'min-h-[420px]' : 'min-h-[650px]'}`}
            >
              {(view === '周' ? cells.slice(7, 14) : cells).map(
                ({ date, inMonth }) => {
                  const dayItems = visibleItems.filter(
                    (item) => item.date === dateKey(date),
                  );
                  return (
                    <button
                      key={dateKey(date)}
                      onClick={() => openForm(dateKey(date))}
                      className={`min-h-[105px] border-b border-r p-2 text-left align-top hover:bg-[#fffafa] ${!inMonth ? 'bg-[#fafbfc] text-[#c3c9d0]' : ''}`}
                    >
                      <span
                        className={`inline-grid size-6 place-items-center rounded-full text-sm ${date.getDate() === 8 && inMonth ? 'bg-[#f1666d] text-white' : ''}`}
                      >
                        {date.getDate()}
                      </span>
                      {dayItems.map((item, index) => (
                        <span
                          key={`${item.title}-${index}`}
                          className="mt-2 block rounded bg-[#edf5ff] px-2 py-1 text-xs text-[#4680bd]"
                        >
                          <b>{item.time}</b> {item.title}
                        </span>
                      ))}
                    </button>
                  );
                },
              )}
            </div>
          </div>
        )}
      </section>
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">日程</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-xl text-[#8993a0]"
              >
                ×
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <label className="block">
                * 日程主题
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="填写日程主题"
                  className="mt-1 h-9 w-full rounded border px-3"
                />
              </label>
              <label className="block">
                日程类型
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 h-9 w-full rounded border bg-white px-3"
                >
                  <option>工作</option>
                  <option>开庭</option>
                  <option>会议</option>
                  <option>培训</option>
                  <option>外出</option>
                </select>
              </label>
              <label className="block">
                关联项目
                <input
                  value={project}
                  onChange={(e) => setProject(e.target.value)}
                  placeholder="选择关联项目/案源"
                  className="mt-1 h-9 w-full rounded border px-3"
                />
              </label>
              <div>
                <span> * 日程时间</span>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-9 rounded border px-2"
                  />
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="h-9 rounded border px-2"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-9 rounded border px-2"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="h-9 rounded border px-2"
                  />
                </div>
                <label className="mt-2 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                  />
                  全天事件
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  日程地点
                  <input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="填写日程地点"
                    className="mt-1 h-9 w-full rounded border px-3"
                  />
                </label>
                <label>
                  房号/厅室
                  <input
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="房号/厅室"
                    className="mt-1 h-9 w-full rounded border px-3"
                  />
                </label>
              </div>
              <label className="block">
                * 参与人员
                <input
                  value={mainParticipants}
                  onChange={(e) => setMainParticipants(e.target.value)}
                  placeholder="主要参与人"
                  className="mt-1 h-9 w-full rounded border px-3"
                />
              </label>
              <label className="block">
                其他参与人员
                <input
                  value={otherParticipants}
                  onChange={(e) => setOtherParticipants(e.target.value)}
                  placeholder="其他参与人员"
                  className="mt-1 h-9 w-full rounded border px-3"
                />
              </label>
              <label className="block">
                日程描述
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="填写日程描述"
                  className="mt-1 h-20 w-full rounded border px-3 py-2"
                />
              </label>
              <label className="block">
                * 日程共享
                <input
                  value={sharedTeam}
                  onChange={(e) => setSharedTeam(e.target.value)}
                  className="mt-1 h-9 w-full rounded border px-3"
                />
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notShared}
                  onChange={(e) => setNotShared(e.target.checked)}
                />
                不共享
              </label>
              <div className="rounded bg-[#fff8ed] p-2 text-xs text-[#9b7a43]">
                “忙碌状态”将同步给您的团队成员，“日程详情”仅共享给上述所选团队成员
              </div>
              <div className="grid grid-cols-2 gap-2">
                <label>
                  第一次提醒时间
                  <input
                    value={reminder1}
                    onChange={(e) => setReminder1(e.target.value)}
                    placeholder="第一次提醒时间"
                    className="mt-1 h-9 w-full rounded border px-3"
                  />
                </label>
                <label>
                  第二次提醒时间
                  <input
                    value={reminder2}
                    onChange={(e) => setReminder2(e.target.value)}
                    placeholder="第二次提醒时间"
                    className="mt-1 h-9 w-full rounded border px-3"
                  />
                </label>
              </div>
              <div>
                日程附件{' '}
                <button className="ml-2 text-[#4689e8]">上传附件</button>
                <button className="ml-3 text-[#4689e8]">选择已有文档</button>
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={create}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LogSubmodule({
  mode,
  onMode,
  logs,
  setLogs,
}: {
  mode: string;
  onMode: (value: string) => void;
  logs: string[][];
  setLogs: React.Dispatch<React.SetStateAction<string[][]>>;
}) {
  const [status, setStatus] = useState<Record<number, string>>({});
  const dynamicHours = logs.reduce<Record<string, number>>((totals, row) => {
    const match = row[3]?.match(/([0-9]+(?:\.[0-9]+)?)\s*小时/);
    if (!match) return totals;
    const key = `${row[2]}::${row[1]}`;
    totals[key] = (totals[key] ?? 0) + Number(match[1]);
    return totals;
  }, {});
  const rows =
    mode === '工时统计'
      ? [
          ['本月', 'Northstar Holdings IPO', 'Sarah Lin', '42.5 h', '$8,500'],
          ['本月', 'Orion BioTech v. Atlas', 'Michael Chen', '28 h', '$5,600'],
          ...Object.entries(dynamicHours).map(([key, hours]) => {
            const [project, person] = key.split('::');
            return [
              '本月',
              project,
              person,
              `${hours.toFixed(1)} h`,
              `$${(hours * 200).toLocaleString('en-US')}`,
            ];
          }),
        ]
      : mode === '业务协作日志'
        ? [
            [
              '2026-09-08',
              '外部协作组',
              'Northstar Holdings IPO',
              '美国诉讼策略会议纪要',
              '待同步',
            ],
          ]
        : mode === '提交给我的'
          ? logs.filter((row) => row[4]?.startsWith('待阅'))
          : [
              [
                '2026-09-07',
                'Michael Chen',
                'Orion BioTech v. Atlas',
                '完成证据材料清单',
                '已阅',
              ],
            ];
  const columns =
    mode === '工时统计'
      ? ['期间', '项目', '人员', '工时', '计费参考']
      : ['日期', '办理人', '项目/客户', '工作内容', '状态'];
  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{mode}</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            {mode === '工时统计'
              ? '按项目、人员和期间汇总工时，用于成本和绩效分析'
              : '支持筛选、审阅、评论和项目关联'}
          </p>
        </div>
        <div className="flex gap-2">
          {[
            '我写的日志',
            '业务协作日志',
            '提交给我的',
            '抄送给我的',
            '工时统计',
          ].map((item) => (
            <button
              key={item}
              onClick={() => onMode(item)}
              className={`rounded px-3 py-1.5 text-xs ${mode === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
            >
              {item}
            </button>
          ))}
          {mode !== '工时统计' && (
            <button className="rounded border border-[#dce1e6] bg-white px-3 py-1.5 text-xs">
              导出 Excel
            </button>
          )}
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          className="w-full max-w-xs rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
          placeholder="日志内容 / 项目 / 办理人"
        />
        <button className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white">
          搜索
        </button>
      </div>
      <DetailTable
        headers={columns}
        rows={rows.map((row, index) =>
          status[index] ? [...row.slice(0, -1), status[index]] : row,
        )}
        footer={
          mode === '工时统计'
            ? '工时数据可关联项目收款、成本和绩效；计费规则由律所管理员配置。'
            : '日志内容仅对授权人员可见；审阅、确认和退回动作均记录时间、人员和意见。'
        }
      />
      {mode === '提交给我的' && (
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() =>
              setLogs((items) =>
                items.map((row) =>
                  row[4]?.startsWith('待阅')
                    ? [...row.slice(0, 4), '已阅']
                    : row,
                ),
              )
            }
            className="rounded bg-[#eaf7ef] px-4 py-2 text-xs text-[#258956]"
          >
            批量确认本页工时/日志
          </button>
          <button
            onClick={() =>
              setLogs((items) =>
                items.map((row) =>
                  row[4]?.startsWith('待阅')
                    ? [...row.slice(0, 4), '已退回']
                    : row,
                ),
              )
            }
            className="rounded border border-[#efc6c8] px-4 py-2 text-xs text-[#d0525b]"
          >
            退回补充
          </button>
        </div>
      )}
    </div>
  );
}

function MyClientsWorkspace() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [customerType, setCustomerType] = useState('单位客户');
  const [createdClients, setCreatedClients] = useState<string[][]>([]);
  const [newClientName, setNewClientName] = useState('');
  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem(CUSTOMER_REGISTRY_KEY) ?? '[]',
      ) as string[][];
      if (saved.length) setCreatedClients(saved);
    } catch {
      // Keep the seed client list when browser storage is unavailable.
    }
  }, []);
  const rows = [
    ...createdClients,
    ...[
      [
        '峻佳設計有限公司',
        '正式客户',
        '未设置',
        '张博彦律师团队',
        '孙绘媛',
        '未设置',
        '未设置',
        '未设置',
        '',
        '1',
        '0',
      ],
      [
        '汉诺数智（深圳）科技有限责任公司',
        '正式客户',
        '未设置',
        '张博彦律师团队',
        '孙绘媛',
        '未设置',
        '未设置',
        '未设置',
        '',
        '2',
        '0',
      ],
      [
        '漢諾佳池控股有限公司',
        '潜在客户',
        '未设置',
        '张博彦律师团队',
        '孙绘媛',
        '未设置',
        '未设置',
        '未设置',
        'http://J6900',
        '0',
        '0',
      ],
      [
        'P.Y. Cheung & Co.',
        '正式客户',
        '未设置',
        '张博彦律师团队',
        '孙绘媛',
        '未设置',
        '未设置',
        '未设置',
        '',
        '1',
        '0',
      ],
      [
        '结他控股有限公司',
        '正式客户',
        '未设置',
        '张博彦律师团队',
        '孙绘媛',
        '未设置',
        '未设置',
        '未设置',
        '',
        '1',
        '0',
      ],
    ],
  ].filter(
    (row) =>
      row.join(' ').toLowerCase().includes(query.toLowerCase()) &&
      row.join(' ').includes(filter),
  );
  const headers = [
    '客户名称',
    '客户类别',
    '客户来源',
    '所属团队',
    '负责人',
    '人员规模',
    '重要性',
    '影响力',
    '网址',
    '项目',
    '案源',
    '操作',
  ];
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">我的客户</h2>
            <p className="mt-1 text-xs text-[#84909d]">客户/联系人</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setNewOpen((v) => !v)}
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              新建⌄
            </button>
            {newOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded border bg-white p-1 shadow-lg">
                <button
                  onClick={() => {
                    setQuickCreateOpen(true);
                    setNewOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                >
                  快速创建客户
                </button>
                <button
                  onClick={() => {
                    setNotice('团队客户查询');
                    setNewOpen(false);
                  }}
                  className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                >
                  团队客户查询
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="客户名称/电话"
            className="h-9 w-64 rounded border px-3 text-sm"
          />
          {[
            '所有制性质',
            '所属行业',
            '人员规模筛选',
            '客户来源',
            '关系亲密度',
            '重要性',
            '信用等级',
            '行业影响力',
          ].map((x) => (
            <button
              key={x}
              onClick={() => setFilter(filter === x ? '' : x)}
              className={`rounded border px-3 py-2 text-sm ${filter === x ? 'border-[#f1666d] text-[#e45159]' : 'text-[#697586]'}`}
            >
              {x}⌄
            </button>
          ))}
          <button
            onClick={() => {
              setQuery('');
              setFilter('');
            }}
            className="rounded px-3 py-2 text-sm text-[#e45159]"
          >
            清空筛选条件
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {headers.map((x) => (
                  <th key={x} className="px-3 py-3 font-medium">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#edf0f2]">
                  {row.map((cell, i) => (
                    <td key={`${row[0]}-${i}`} className="px-3 py-3">
                      {i === 0 ? (
                        <button
                          onClick={() => setNotice(`客户档案：${cell}`)}
                          className="text-[#1f5f9b] hover:underline"
                        >
                          {cell}
                        </button>
                      ) : (
                        cell || '-'
                      )}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`查看：${row[0]}`)}
                      className="text-[#1f5f9b]"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-[#8993a0]">
          共找到{rows.length}条结果，每页显示 20 条，共 1 页
        </p>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
      {quickCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">快速添加新客户</h3>
              <button onClick={() => setQuickCreateOpen(false)}>×</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                客户类型
                <div className="mt-2 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '单位客户'}
                      onChange={() => setCustomerType('单位客户')}
                    />{' '}
                    单位客户
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '个人客户'}
                      onChange={() => setCustomerType('个人客户')}
                    />{' '}
                    个人客户
                  </label>
                </div>
              </label>
              {customerType === '个人客户' ? (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户姓名"
                    className="h-9 rounded border px-3"
                  />
                  <select className="h-9 rounded border px-3" aria-label="性别">
                    <option>性别</option>
                    <option>男</option>
                    <option>女</option>
                  </select>
                  <input
                    placeholder="手机号"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="身份证号"
                    className="h-9 rounded border px-3"
                  />
                  <select
                    className="h-9 rounded border px-3"
                    aria-label="客户来源"
                  >
                    <option>请选择</option>
                    <option>续约客户</option>
                  </select>
                  <input
                    placeholder="所在单位"
                    className="h-9 rounded border px-3"
                  />
                  <label>
                    所属团队
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择团队
                    </button>
                  </label>
                  <label>
                    客户维系人
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择人员
                    </button>
                  </label>
                  <label>
                    共享人员
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择人员
                    </button>
                  </label>
                  <textarea
                    placeholder="客户简介"
                    className="rounded border p-3"
                  />
                </>
              ) : (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户名称"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="所属行业"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="客户来源"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人电话"
                    className="h-9 rounded border px-3"
                  />
                  <label>
                    所属团队
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择团队
                    </button>
                  </label>
                  <label>
                    客户维系人
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择人员
                    </button>
                  </label>
                  <label>
                    共享人员
                    <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                      + 选择人员
                    </button>
                  </label>
                  <textarea
                    placeholder="客户简介"
                    className="rounded border p-3"
                  />
                </>
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setQuickCreateOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (!newClientName.trim()) {
                    setNotice('请填写客户名称');
                    return;
                  }
                  const newRow = [
                    newClientName.trim(),
                    customerType === '个人客户' ? '个人客户' : '正式客户',
                    '未设置',
                    '未设置',
                    '未设置',
                    '未设置',
                    '未设置',
                    '未设置',
                    '',
                    '0',
                    '0',
                  ];
                  registerCustomer(newRow);
                  setCreatedClients((items) => [newRow, ...items]);
                  setNotice(`已保存${customerType}：${newClientName.trim()}`);
                  setNewClientName('');
                  setQuickCreateOpen(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存客户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnnualAdvisorWorkspace() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [notice, setNotice] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [customerType, setCustomerType] = useState('单位客户');
  const [newClientName, setNewClientName] = useState('');
  const [advisorRows, setAdvisorRows] = useState<string[][]>([]);
  const rows = advisorRows.filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  const filters = [
    '人员规模筛选',
    '重要性',
    '到期状态筛选',
    '首次服务时间',
    '选择开始日期',
    '至',
    '选择开始日期',
  ];
  const saveQuickCustomer = () => {
    if (!newClientName.trim()) {
      setNotice('请填写客户名称');
      return;
    }
    registerCustomer([
      newClientName.trim(),
      customerType === '个人客户' ? '个人客户' : '正式客户',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '',
      '0',
      '0',
    ]);
    setAdvisorRows((items) => [
      [
        newClientName.trim(),
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '0',
        '0',
      ],
      ...items,
    ]);
    setNotice(`已保存${customerType}：${newClientName.trim()}`);
    setNewClientName('');
    setQuickCreateOpen(false);
  };
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">常年顾问客户</h2>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => {
                setQuickCreateOpen(true);
                setNewOpen(false);
              }}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ✎ 快速创建客户
            </button>
            <button
              onClick={() => setNotice('团队客户查询')}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ◯ 团队客户查询
            </button>
            <div className="relative">
              <button
                onClick={() => setNewOpen((v) => !v)}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                新建⌄
              </button>
              {newOpen && (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded border bg-white p-1 shadow-lg">
                  <button
                    onClick={() => {
                      setQuickCreateOpen(true);
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    快速创建客户
                  </button>
                  <button
                    onClick={() => {
                      setNotice('团队客户查询');
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    团队客户查询
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="客户名称/电话"
            className="h-9 w-64 rounded border px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {filters.map((label, index) => (
            <button
              key={`${label}-${index}`}
              onClick={() => {
                setActiveFilter(
                  activeFilter === `${label}-${index}`
                    ? ''
                    : `${label}-${index}`,
                );
                setNotice(`当前筛选：${label}`);
              }}
              className={`rounded px-2 py-1 text-sm ${activeFilter === `${label}-${index}` ? 'bg-[#fff1f1] text-[#e45159]' : 'text-[#697586]'}`}
            >
              {label}
              {label === '至' ? '' : '⌄'}
            </button>
          ))}
          <button
            onClick={() => {
              setQuery('');
              setActiveFilter('');
              setNotice('已清空筛选条件');
            }}
            className="ml-auto text-sm text-[#e45159]"
          >
            清空筛选条件
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {[
                  '客户名称',
                  '所属团队',
                  '负责人',
                  '人员规模',
                  '重要性',
                  '首次服务时间',
                  '服务截止时间',
                  '到期状态',
                  '已合作',
                  '项目',
                  '案源',
                  '操作',
                ].map((header) => (
                  <th key={header} className="px-3 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#edf0f2]">
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`客户档案：${row[0]}`)}
                      className="text-[#1f5f9b] hover:underline"
                    >
                      {row[0]}
                    </button>
                  </td>
                  {row.slice(1).map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-3 py-3">
                      {cell || '-'}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`查看：${row[0]}`)}
                      className="text-[#1f5f9b]"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows.length && (
            <div className="py-24 text-center text-sm text-[#a1a8b0]">
              暂无客户~
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-[#8993a0]">
          <span>共找到 {rows.length} 条结果，每页显示 20 条，共 1 页</span>
          <span>当前 1/1 页&nbsp;&nbsp;上一页&nbsp;&nbsp;下一页</span>
        </div>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
      {quickCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">快速添加新客户</h3>
              <button onClick={() => setQuickCreateOpen(false)}>×</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                客户类型
                <div className="mt-2 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '单位客户'}
                      onChange={() => setCustomerType('单位客户')}
                    />{' '}
                    单位客户
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '个人客户'}
                      onChange={() => setCustomerType('个人客户')}
                    />{' '}
                    个人客户
                  </label>
                </div>
              </label>
              {customerType === '个人客户' ? (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户姓名"
                    className="h-9 rounded border px-3"
                  />
                  <select aria-label="性别" className="h-9 rounded border px-3">
                    <option>性别</option>
                    <option>男</option>
                    <option>女</option>
                  </select>
                  <input
                    placeholder="手机号"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="身份证号"
                    className="h-9 rounded border px-3"
                  />
                  <select
                    aria-label="客户来源"
                    className="h-9 rounded border px-3"
                  >
                    <option>请选择</option>
                    <option>续约客户</option>
                  </select>
                  <input
                    placeholder="所在单位"
                    className="h-9 rounded border px-3"
                  />
                </>
              ) : (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户名称"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="所属行业"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="客户来源"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人电话"
                    className="h-9 rounded border px-3"
                  />
                </>
              )}
              <label>
                所属团队
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择团队
                </button>
              </label>
              <label>
                客户维系人
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <label>
                共享人员
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <textarea placeholder="客户简介" className="rounded border p-3" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setQuickCreateOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={saveQuickCustomer}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存客户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerStageWorkspace({ kind }: { kind: '意向客户' | '潜在客户' }) {
  const isProspect = kind === '潜在客户';
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [customerType, setCustomerType] = useState('单位客户');
  const [newClientName, setNewClientName] = useState('');
  const [rows, setRows] = useState<string[][]>(
    isProspect
      ? []
      : [
          [
            '峻佳設計有限公司',
            '未设置',
            '张博彦律师团队',
            '孙绘媛',
            '未设置',
            '未设置',
            '未设置',
            '2026-08-27',
            '1',
            '0',
          ],
          [
            '汉诺数智（深圳）科技有限责任公司',
            '未设置',
            '张博彦律师团队',
            '孙绘媛',
            '未设置',
            '未设置',
            '未设置',
            '2026-07-21',
            '2',
            '0',
          ],
          [
            'P.Y. Cheung & Co.',
            '未设置',
            '张博彦律师团队',
            '孙绘媛',
            '未设置',
            '未设置',
            '未设置',
            '2026-07-21',
            '1',
            '0',
          ],
          [
            '结他控股有限公司',
            '未设置',
            '张博彦律师团队',
            '孙绘媛',
            '未设置',
            '未设置',
            '未设置',
            '2026-02-06',
            '1',
            '0',
          ],
        ],
  );
  const filteredRows = rows.filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  const filters = isProspect
    ? [
        '所有制性质',
        '所属行业',
        '人员规模筛选',
        '客户来源',
        '关系亲密度',
        '重要性',
        '信用等级',
        '行业影响力',
      ]
    : [
        '人员规模筛选',
        '重要性',
        '行业影响力',
        '首次接洽时间',
        '选择开始日期',
        '至',
        '选择开始日期',
      ];
  const headers = isProspect
    ? [
        '客户名称',
        '客户类别',
        '客户来源',
        '所属团队',
        '负责人',
        '人员规模',
        '重要性',
        '影响力',
        '网址',
        '项目',
        '案源',
        '操作',
      ]
    : [
        '客户名称',
        '客户来源',
        '所属团队',
        '负责人',
        '人员规模',
        '重要性',
        '影响力',
        '首次接洽时间',
        '项目',
        '案源',
        '操作',
      ];
  const saveQuickCustomer = () => {
    if (!newClientName.trim()) {
      setNotice('请填写客户名称');
      return;
    }
    const row = isProspect
      ? [
          newClientName.trim(),
          customerType === '个人客户' ? '个人客户' : '正式客户',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '',
          '0',
          '0',
        ]
      : [
          newClientName.trim(),
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '0',
          '0',
        ];
    registerCustomer(
      isProspect
        ? row
        : [row[0], '正式客户', ...row.slice(1, 8), '', row[8], row[9]],
    );
    setRows((items) => [row, ...items]);
    setNotice(`已保存${customerType}：${newClientName.trim()}`);
    setNewClientName('');
    setQuickCreateOpen(false);
  };
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{kind}</h2>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ✎ 快速创建客户
            </button>
            <button
              onClick={() => setNotice('团队客户查询')}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ◯ 团队客户查询
            </button>
            <div className="relative">
              <button
                onClick={() => setNewOpen((v) => !v)}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                新建⌄
              </button>
              {newOpen && (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded border bg-white p-1 shadow-lg">
                  <button
                    onClick={() => {
                      setQuickCreateOpen(true);
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    快速创建客户
                  </button>
                  <button
                    onClick={() => {
                      setNotice('团队客户查询');
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    团队客户查询
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="客户名称/电话"
            className="h-9 w-64 rounded border px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {filters.map((label, index) => (
            <button
              key={`${label}-${index}`}
              onClick={() => setNotice(`当前筛选：${label}`)}
              className="rounded px-2 py-1 text-sm text-[#697586]"
            >
              {label}
              {label === '至' ? '' : '⌄'}
            </button>
          ))}
          <button
            onClick={() => {
              setQuery('');
              setNotice('已清空筛选条件');
            }}
            className="ml-auto text-sm text-[#e45159]"
          >
            清空筛选条件
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row[0]} className="border-t border-[#edf0f2]">
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`客户档案：${row[0]}`)}
                      className="text-[#1f5f9b] hover:underline"
                    >
                      {row[0]}
                    </button>
                  </td>
                  {row.slice(1).map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-3 py-3">
                      {cell || '-'}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`查看：${row[0]}`)}
                      className="text-[#1f5f9b]"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredRows.length && (
            <div className="py-24 text-center text-sm text-[#a1a8b0]">
              暂无客户~
            </div>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-[#8993a0]">
          <span>
            共找到 {filteredRows.length} 条结果，每页显示 20 条，共 1 页
          </span>
          <span>当前 1/1 页&nbsp;&nbsp;上一页&nbsp;&nbsp;下一页</span>
        </div>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
      {quickCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">快速添加新客户</h3>
              <button onClick={() => setQuickCreateOpen(false)}>×</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                客户类型
                <div className="mt-2 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '单位客户'}
                      onChange={() => setCustomerType('单位客户')}
                    />{' '}
                    单位客户
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '个人客户'}
                      onChange={() => setCustomerType('个人客户')}
                    />{' '}
                    个人客户
                  </label>
                </div>
              </label>
              {customerType === '个人客户' ? (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户姓名"
                    className="h-9 rounded border px-3"
                  />
                  <select aria-label="性别" className="h-9 rounded border px-3">
                    <option>性别</option>
                    <option>男</option>
                    <option>女</option>
                  </select>
                  <input
                    placeholder="手机号"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="身份证号"
                    className="h-9 rounded border px-3"
                  />
                  <select
                    aria-label="客户来源"
                    className="h-9 rounded border px-3"
                  >
                    <option>请选择</option>
                    <option>续约客户</option>
                  </select>
                  <input
                    placeholder="所在单位"
                    className="h-9 rounded border px-3"
                  />
                </>
              ) : (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户名称"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="所属行业"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="客户来源"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人电话"
                    className="h-9 rounded border px-3"
                  />
                </>
              )}
              <label>
                所属团队
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择团队
                </button>
              </label>
              <label>
                客户维系人
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <label>
                共享人员
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <textarea placeholder="客户简介" className="rounded border p-3" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setQuickCreateOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={saveQuickCustomer}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存客户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SignedClientsWorkspace() {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [customerType, setCustomerType] = useState('单位客户');
  const [newClientName, setNewClientName] = useState('');
  const [signedRows, setSignedRows] = useState<string[][]>([
    [
      '峻佳設計有限公司',
      '未设置',
      '张博彦律师团队',
      '孙绘媛',
      '未设置',
      '未设置',
      '未设置',
      '2026-08-27',
      '1',
      '0',
    ],
    [
      '汉诺数智（深圳）科技有限责任公司',
      '未设置',
      '张博彦律师团队',
      '孙绘媛',
      '未设置',
      '未设置',
      '未设置',
      '2026-07-21',
      '2',
      '0',
    ],
    [
      'P.Y. Cheung & Co.',
      '未设置',
      '张博彦律师团队',
      '孙绘媛',
      '未设置',
      '未设置',
      '未设置',
      '2026-07-21',
      '1',
      '0',
    ],
    [
      '结他控股有限公司',
      '未设置',
      '张博彦律师团队',
      '孙绘媛',
      '未设置',
      '未设置',
      '未设置',
      '2026-02-06',
      '1',
      '0',
    ],
  ]);
  const rows = signedRows.filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  const saveQuickCustomer = () => {
    if (!newClientName.trim()) {
      setNotice('请填写客户名称');
      return;
    }
    registerCustomer([
      newClientName.trim(),
      customerType === '个人客户' ? '个人客户' : '正式客户',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '未设置',
      '',
      '0',
      '0',
    ]);
    setSignedRows((items) => [
      [
        newClientName.trim(),
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '未设置',
        '0',
        '0',
      ],
      ...items,
    ]);
    setNotice(`已保存${customerType}：${newClientName.trim()}`);
    setNewClientName('');
    setQuickCreateOpen(false);
  };
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">签约客户</h2>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setQuickCreateOpen(true)}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ✎ 快速创建客户
            </button>
            <button
              onClick={() => setNotice('团队客户查询')}
              className="text-[#697586] hover:text-[#e45159]"
            >
              ◯ 团队客户查询
            </button>
            <div className="relative">
              <button
                onClick={() => setNewOpen((v) => !v)}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                新建⌄
              </button>
              {newOpen && (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded border bg-white p-1 shadow-lg">
                  <button
                    onClick={() => {
                      setQuickCreateOpen(true);
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    快速创建客户
                  </button>
                  <button
                    onClick={() => {
                      setNotice('团队客户查询');
                      setNewOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    团队客户查询
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="客户名称/电话"
            className="h-9 w-64 rounded border px-3 text-sm"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {[
            '人员规模筛选',
            '重要性',
            '行业影响力',
            '首次签约时间',
            '选择开始日期',
            '至',
            '选择开始日期',
          ].map((label, index) => (
            <button
              key={`${label}-${index}`}
              onClick={() => setNotice(`当前筛选：${label}`)}
              className="rounded px-2 py-1 text-sm text-[#697586]"
            >
              {label}
              {label === '至' ? '' : '⌄'}
            </button>
          ))}
          <button
            onClick={() => {
              setQuery('');
              setNotice('已清空筛选条件');
            }}
            className="ml-auto text-sm text-[#e45159]"
          >
            清空筛选条件
          </button>
        </div>
        <div className="mt-3 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {[
                  '客户名称',
                  '客户来源',
                  '所属团队',
                  '负责人',
                  '人员规模',
                  '重要性',
                  '影响力',
                  '首次签约时间',
                  '项目',
                  '案源',
                  '操作',
                ].map((header) => (
                  <th key={header} className="px-3 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[0]} className="border-t border-[#edf0f2]">
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`客户档案：${row[0]}`)}
                      className="text-[#1f5f9b] hover:underline"
                    >
                      {row[0]}
                    </button>
                  </td>
                  {row.slice(1).map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-3 py-3">
                      {cell || '-'}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`查看：${row[0]}`)}
                      className="text-[#1f5f9b]"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-[#8993a0]">
          <span>共找到 {rows.length} 条结果，每页显示 20 条，共 1 页</span>
          <span>当前 1/1 页&nbsp;&nbsp;上一页&nbsp;&nbsp;下一页</span>
        </div>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
      {quickCreateOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">快速添加新客户</h3>
              <button onClick={() => setQuickCreateOpen(false)}>×</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <label>
                客户类型
                <div className="mt-2 flex gap-4">
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '单位客户'}
                      onChange={() => setCustomerType('单位客户')}
                    />{' '}
                    单位客户
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={customerType === '个人客户'}
                      onChange={() => setCustomerType('个人客户')}
                    />{' '}
                    个人客户
                  </label>
                </div>
              </label>
              {customerType === '个人客户' ? (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户姓名"
                    className="h-9 rounded border px-3"
                  />
                  <select aria-label="性别" className="h-9 rounded border px-3">
                    <option>性别</option>
                    <option>男</option>
                    <option>女</option>
                  </select>
                  <input
                    placeholder="手机号"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="身份证号"
                    className="h-9 rounded border px-3"
                  />
                  <select
                    aria-label="客户来源"
                    className="h-9 rounded border px-3"
                  >
                    <option>请选择</option>
                    <option>续约客户</option>
                  </select>
                  <input
                    placeholder="所在单位"
                    className="h-9 rounded border px-3"
                  />
                </>
              ) : (
                <>
                  <input
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="客户名称"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="所属行业"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="客户来源"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人"
                    className="h-9 rounded border px-3"
                  />
                  <input
                    placeholder="联系人电话"
                    className="h-9 rounded border px-3"
                  />
                </>
              )}
              <label>
                所属团队
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择团队
                </button>
              </label>
              <label>
                客户维系人
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <label>
                共享人员
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
              <textarea placeholder="客户简介" className="rounded border p-3" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setQuickCreateOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={saveQuickCustomer}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存客户
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactDirectoryWorkspace({
  kind,
}: {
  kind: '联系人' | '对方/关联当事人';
}) {
  const isOpposing = kind === '对方/关联当事人';
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [rows, setRows] = useState<string[][]>(
    isOpposing
      ? [
          [
            '峻佳設計有限公司',
            '-',
            '',
            '',
            'ROOM 1, 15/F, KEEN HUNG CO...',
            '张博彦律师团队',
            '张博彦',
            '未设置',
            '',
            '1',
            '0',
          ],
          [
            '汉诺数智（四川）科技集团有限公司',
            '19082442401',
            '',
            '',
            '四川省成都市天府新区兴隆街道天...',
            '张博彦律师团队',
            '张博彦',
            '未设置',
            '',
            '2',
            '0',
          ],
          [
            '漢諾佳池控股有限公司',
            '-',
            '',
            '',
            'UNIT 501, 5/F, BUPA CENTRE, 14...',
            '张博彦律师团队',
            '张博彦',
            '未设置',
            '',
            '0',
            '0',
          ],
          [
            '结他控股有限公司',
            '-',
            '',
            '',
            '香港宜塘路闔道26號盛茂中心19樓...',
            '张博彦律师团队',
            '张博彦',
            '未设置',
            '',
            '1',
            '0',
          ],
        ]
      : [
          [
            '11111',
            '女',
            '17568062583',
            '',
            '峻佳設計有限公司',
            '客户联系人',
            '张博彦律师团队',
            '张博彦',
            '',
          ],
          [
            '11111',
            '女',
            '111111',
            '',
            '汉诺数智（深圳）科技有限责任公司',
            '客户联系人',
            '张博彦律师团队',
            '张博彦',
            '',
          ],
          [
            '11111',
            '女',
            '111111',
            '',
            '漢諾佳池控股有限公司',
            '客户联系人',
            '张博彦律师团队',
            '张博彦',
            '',
          ],
          [
            '张博彦',
            '男',
            '17568062583',
            '',
            'P.Y. Cheung & Co.',
            '客户联系人',
            '张博彦律师团队',
            '张博彦',
            '',
          ],
        ],
  );
  const filtered = rows.filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  const save = () => {
    if (!name.trim()) {
      setNotice(isOpposing ? '请填写名称' : '请填写联系人姓名');
      return;
    }
    const row = isOpposing
      ? [
          name.trim(),
          phone || '-',
          contactMethod,
          email,
          '未设置',
          '未设置',
          '未设置',
          '未设置',
          '',
          '0',
          '0',
        ]
      : [
          name.trim(),
          '未设置',
          phone || '-',
          contactMethod || '',
          email,
          '客户联系人',
          '未设置',
          '未设置',
          '',
        ];
    setRows((items) => [row, ...items]);
    setNotice(`已新建${kind}：${name.trim()}`);
    setName('');
    setPhone('');
    setEmail('');
    setContactMethod('');
    setFormOpen(false);
  };
  const headers = isOpposing
    ? [
        '名称',
        '电话',
        '联系方式',
        '邮箱',
        '地址',
        '所属团队',
        '负责人',
        '重要性',
        '网址',
        '项目',
        '案源',
        '操作',
      ]
    : [
        '名称',
        '性别',
        '手机号',
        '联系方式',
        '邮箱',
        '所在单位',
        '联系人类型',
        '所属团队',
        '负责人',
        '操作',
      ];
  const filters = isOpposing
    ? ['所属行业', '重要性', '行业影响力', '省份', '城市', '区/县']
    : [];
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{kind}</h2>
          <div className="flex items-center gap-4 text-sm">
            <button
              onClick={() => setFormOpen(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              {isOpposing ? '新建关联当事人' : '新建联系人'}
            </button>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isOpposing ? '名称/联系电话' : '名称/手机号/所在单位'}
            className="h-9 w-64 rounded border px-3 text-sm"
          />
        </div>
        {filters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setNotice(`当前筛选：${filter}`)}
                className="rounded px-2 py-1 text-sm text-[#697586]"
              >
                {filter}⌄
              </button>
            ))}
            <button
              onClick={() => {
                setQuery('');
                setNotice('已清空筛选条件');
              }}
              className="ml-auto text-sm text-[#e45159]"
            >
              清空筛选条件
            </button>
          </div>
        )}
        <div className="mt-3 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {headers.map((header) => (
                  <th key={header} className="px-3 py-3 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={`${row[0]}-${row[2]}`}
                  className="border-t border-[#edf0f2]"
                >
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`${kind}档案：${row[0]}`)}
                      className="text-[#1f5f9b] hover:underline"
                    >
                      {row[0]}
                    </button>
                  </td>
                  {row.slice(1).map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-3 py-3">
                      {cell || '-'}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice(`查看：${row[0]}`)}
                      className="text-[#1f5f9b]"
                    >
                      查看
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="py-24 text-center text-sm text-[#a1a8b0]">
              暂无数据~
            </div>
          )}
        </div>
        <div className="mt-3 text-sm text-[#8993a0]">
          共找到 {filtered.length} 条结果，每页显示 20 条，共 1 页
        </div>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
      {formOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isOpposing ? '新建关联当事人' : '新建联系人'}
              </h3>
              <button onClick={() => setFormOpen(false)}>×</button>
            </div>
            <div className="mt-4 grid gap-3 text-sm">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isOpposing ? '名称' : '联系人姓名'}
                className="h-9 rounded border px-3"
              />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={isOpposing ? '电话' : '手机号'}
                className="h-9 rounded border px-3"
              />
              <input
                value={contactMethod}
                onChange={(e) => setContactMethod(e.target.value)}
                placeholder="联系方式"
                className="h-9 rounded border px-3"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="邮箱"
                className="h-9 rounded border px-3"
              />
              {isOpposing && (
                <input placeholder="地址" className="h-9 rounded border px-3" />
              )}
              <label>
                所属团队
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择团队
                </button>
              </label>
              <label>
                负责人
                <button className="mt-1 h-9 w-full rounded border px-3 text-left text-[#697586]">
                  + 选择人员
                </button>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setFormOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={save}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientWorkspace({ section }: { section: string }) {
  const [clientRows, setClientRows] = useState([
    ['Northstar Holdings', '企业客户', '纽约', '资本市场', 'Sarah Lin'],
    ['Orion BioTech', '企业客户', '波士顿', '诉讼', 'Michael Chen'],
    ['Aster Mobility', '企业客户', '旧金山', '公司与商事', 'Evelyn Park'],
  ]);
  const [contacts, setContacts] = useState([
    [
      'Alex Morgan',
      'Northstar Holdings',
      'General Counsel',
      '受权限保护',
      '项目成员可见',
    ],
    ['Jamie Reed', 'Northstar Holdings', 'CFO', '受权限保护', '项目成员可见'],
  ]);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<string[] | null>(null);
  const clientHydrated = useRef(false);
  const [form, setForm] = useState({
    name: '',
    type: '企业客户',
    region: '纽约',
    business: '资本市场',
    owner: 'Sarah Lin',
    contact: '',
    title: '',
  });
  const isContact = section === '联系人';
  useEffect(() => {
    try {
      const savedClients = window.localStorage.getItem('hamilton-os.clients');
      const savedContacts = window.localStorage.getItem('hamilton-os.contacts');
      if (savedClients) setClientRows(JSON.parse(savedClients));
      if (savedContacts) setContacts(JSON.parse(savedContacts));
    } catch {
      // Keep seed records when local cache is invalid.
    }
    clientHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!clientHydrated.current) return;
    window.localStorage.setItem(
      'hamilton-os.clients',
      JSON.stringify(clientRows),
    );
    window.localStorage.setItem(
      'hamilton-os.contacts',
      JSON.stringify(contacts),
    );
  }, [clientRows, contacts]);
  const rows = (isContact ? contacts : clientRows).filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  function save() {
    if (isContact) {
      if (form.contact.trim() && form.name.trim())
        setContacts((items) => [
          [
            form.contact.trim(),
            form.name.trim(),
            form.title || '联系人',
            '受权限保护',
            '项目成员可见',
          ],
          ...items,
        ]);
    } else if (form.name.trim()) {
      setClientRows((items) => [
        [form.name.trim(), form.type, form.region, form.business, form.owner],
        ...items,
      ]);
    }
    setForm({
      name: '',
      type: '企业客户',
      region: '纽约',
      business: '资本市场',
      owner: 'Sarah Lin',
      contact: '',
      title: '',
    });
    setShowForm(false);
  }
  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">{section}</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            客户、联系人、冲突检索与事项关联均基于同一主数据
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          {section === '联系人' ? '新建联系人' : '新建客户'}
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
          placeholder="名称 / 别名 / 联系人 / 编号"
        />
        <button
          onClick={() => setQuery('')}
          className="rounded border border-[#dce1e6] bg-white px-4 text-sm"
        >
          高级筛选
        </button>
      </div>
      <DetailTable
        headers={
          section === '联系人'
            ? ['姓名', '所属客户', '职务', '联系信息', '权限']
            : ['客户名称', '类型', '地区', '主要业务', '客户负责人']
        }
        rows={rows}
        footer="创建或修改客户资料前，可发起利益冲突检索；联系人字段按角色与事项权限脱敏。"
      />
      {rows.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {rows.map((row) => (
            <button
              key={row[0]}
              onClick={() => setSelected(row)}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs text-[#657181]"
            >
              查看档案 · {row[0]}
            </button>
          ))}
        </div>
      )}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {isContact ? '联系人档案' : '客户档案'}
              </h3>
              <button
                onClick={() => setSelected(null)}
                className="text-xl text-[#87929f]"
              >
                ×
              </button>
            </div>
            <p className="mt-4 font-medium">{rowLabel(isContact, selected)}</p>
            <div className="mt-3 grid gap-2 text-sm text-[#657181]">
              {selected.slice(1).map((item, index) => (
                <p key={`${item}-${index}`}>
                  字段 {index + 1}：{item}
                </p>
              ))}
            </div>
            <p className="mt-4 rounded bg-[#f6f7f8] p-3 text-xs text-[#84909d]">
              关联项目、文档、日志和任务将在正式数据接入后按权限聚合展示。
            </p>
          </div>
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">
              {isContact ? '新建联系人' : '新建客户'}
            </h3>
            {isContact ? (
              <>
                <input
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                  placeholder="姓名"
                  className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="所属客户"
                  className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="职务"
                  className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
              </>
            ) : (
              <>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="客户名称"
                  className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  >
                    <option>企业客户</option>
                    <option>个人客户</option>
                    <option>潜在客户</option>
                  </select>
                  <input
                    value={form.region}
                    onChange={(e) =>
                      setForm({ ...form, region: e.target.value })
                    }
                    placeholder="地区"
                    className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                  />
                </div>
                <input
                  value={form.business}
                  onChange={(e) =>
                    setForm({ ...form, business: e.target.value })
                  }
                  placeholder="主要业务"
                  className="mt-3 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
              </>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={save}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存并登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function rowLabel(isContact: boolean, row: string[]) {
  return isContact
    ? `${row[0]} · ${row[1]}`
    : `${row[0]} · 客户负责人：${row[4]}`;
}

function ClueWorkspace({
  initialView = '团队公共线索库',
}: {
  initialView?: string;
}) {
  const [view, setView] = useState(initialView);
  const [showCreate, setShowCreate] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [summary, setSummary] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const categories = [
    '合同纠纷',
    '知识产权',
    '民间借贷',
    '其他',
    '劳动争议',
    '交通事故',
    '婚姻家事',
  ];
  const subViews = [
    '团队公共线索库',
    '团队线索管理',
    '我负责的线索',
    '线索跟进计划',
    '线索数量统计',
    '线索转化统计',
    '接洽人业务统计',
  ];
  const tableHeaders = [
    '业务类别',
    '业务摘要',
    '联系人',
    '联系电话',
    '单位名称',
    '业务来源',
    '登记日期',
    '接洽',
    '操作',
  ];
  return (
    <div className="p-7">
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{view}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowImport(true)}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              批量导入线索
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              创建新线索
            </button>
          </div>
        </div>
        {view === '团队公共线索库' ||
        view === '团队线索管理' ||
        view === '我负责的线索' ? (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
                <option>业务类别</option>
                {categories.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <input
                className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="线索来源"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder={view === '我负责的线索' ? '业务摘要' : '业务摘要'}
              />
              <button className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white">
                搜索
              </button>
            </div>
            <div className="overflow-hidden rounded border border-[#e0e4e8] bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#f6f7f8] text-xs text-[#657181]">
                  <tr>
                    {tableHeaders.map((h) => (
                      <th key={h} className="px-3 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      colSpan={tableHeaders.length}
                      className="px-3 py-16 text-center text-sm text-[#87929f]"
                    >
                      暂无数据
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="rounded border border-[#e0e4e8] bg-white p-8 text-sm text-[#657181]">
            {view === '线索跟进计划'
              ? '跟进线索汇总　线索跟进计划　线索沟通记录　　2026年09月06日 – 12日　日历　列表'
              : view === '线索数量统计'
                ? '新增线索　按业务类别统计　按业务来源统计　线索数量统计'
                : view === '线索转化统计'
                  ? '新增转化　历年累积转化　线索转化数量统计'
                  : '新增业务　历年累积业务　接洽人新增跟进线索统计'}
          </div>
        )}
        {notice && (
          <button
            onClick={() => setNotice('')}
            className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
          >
            {notice} · 点击关闭
          </button>
        )}
        {showCreate && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">创建新线索</h3>
                <button onClick={() => setShowCreate(false)}>×</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="请输入业务摘要"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="请输入联系人名称"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入联系手机号"
                  className="rounded border px-3 py-2 text-sm"
                />
                <select className="rounded border bg-white px-3 py-2 text-sm">
                  <option>请选择业务类别</option>
                  {categories.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
                <input
                  placeholder="请输入单位名称"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="请选择业务来源"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="请输入来源说明"
                  className="rounded border px-3 py-2 text-sm"
                />
                <select className="rounded border bg-white px-3 py-2 text-sm">
                  <option>请选择团队</option>
                  <option>孙绘媛</option>
                  <option>张博彦律师团队</option>
                </select>
                <input
                  value="孙绘媛"
                  readOnly
                  placeholder="请选择"
                  className="rounded border px-3 py-2 text-sm"
                />
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" />
                  暂无
                </label>
                <input
                  placeholder="省份"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="城市"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="请输入线索标的额"
                  className="rounded border px-3 py-2 text-sm"
                />
                <input
                  placeholder="请输入联系人地址"
                  className="rounded border px-3 py-2 text-sm"
                />
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm">
                <input type="checkbox" />
                我要同时接入
              </label>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNotice(summary ? `已发布线索：${summary}` : '');
                    setSummary('');
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  发布线索
                </button>
              </div>
            </div>
          </div>
        )}
        {showImport && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">批量导入线索</h3>
                <button onClick={() => setShowImport(false)}>×</button>
              </div>
              <p className="mt-4 text-sm">* 所属团队</p>
              <input
                placeholder="选择所属团队"
                className="mt-2 w-full rounded border px-3 py-2 text-sm"
              />
              <p className="mt-2 text-xs text-[#87929f]">
                如果个别线索所属团队不是该团队，可后续对线索进行“修改”；如果较多线索不是该团队，建议分批次进行导入
              </p>
              <p className="mt-4 text-sm">线索信息</p>
              <div className="mt-2 flex gap-2">
                <button className="rounded border px-3 py-2 text-sm">
                  下载导入模板
                </button>
                <button className="rounded border px-3 py-2 text-sm">
                  Excel批量导入
                </button>
              </div>
              <div className="mt-4 rounded border">
                <div className="grid grid-cols-8 gap-2 bg-[#f6f7f8] p-2 text-xs">
                  {[
                    '排序',
                    '业务摘要',
                    '联系人',
                    '联系电话',
                    '单位名称',
                    '业务类别',
                    '业务来源',
                    '错误提示',
                  ].map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
                <p className="p-10 text-center text-sm text-[#87929f]">
                  暂无数据
                </p>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowImport(false)}
                  className="rounded border px-4 py-2 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => setShowImport(false)}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  提交
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function SourceWorkspace({
  initialView = '我的案源',
}: {
  initialView?: string;
}) {
  const [view, setView] = useState(initialView);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState('');
  const [summary, setSummary] = useState('');
  const views = ['我的案源', '暂缓跟进案源', '近期关注案源'];
  return (
    <div className="p-7">
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{view}</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setNotice('批量分配案源')}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              批量分配案源
            </button>
            <button
              onClick={() => setNotice('利益冲突检索')}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              利益冲突检索
            </button>
            <button
              onClick={() => setNotice('申请加入案源')}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              申请加入案源
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              创建新案源⌄
            </button>
          </div>
        </div>
        <div className="mb-3 flex flex-wrap gap-2">
          <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
            <option>案源状态</option>
          </select>
          <input
            className="w-full max-w-md rounded border border-[#dce1e6] px-3 py-2 text-sm"
            placeholder="案源名称/编号/客户/备注名"
          />
          <button className="rounded border border-[#dce1e6] bg-white px-4 py-2 text-sm">
            高级
          </button>
        </div>
        <div className="overflow-hidden rounded border border-[#e0e4e8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f7f8] text-xs text-[#657181]">
              <tr>
                {[
                  '案源名称',
                  '接洽时间',
                  '主办',
                  '进程阶段',
                  '预计合同金额',
                  '案源管理页',
                  '报备状态',
                ].map((x) => (
                  <th key={x} className="px-3 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-16 text-center text-sm text-[#87929f]"
                >
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {notice && (
          <button
            onClick={() => setNotice('')}
            className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
          >
            {notice} · 点击关闭
          </button>
        )}
        {showCreate && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">创建新案源</h3>
                <button onClick={() => setShowCreate(false)}>×</button>
              </div>
              <p className="mt-4 text-sm font-medium">基本信息</p>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  * 委托人/客户　
                  <button className="text-[#e45159]">+ 选择委托人/客户</button>
                  <span className="ml-2 text-xs text-[#87929f]">
                    （多个委托人/客户，可多次点击添加）
                  </span>
                </div>
                <div>
                  关联当事人　
                  <button className="text-[#e45159]">+ 选择当事人</button>
                  <span className="ml-2 text-xs text-[#87929f]">
                    （多个当事人，可多次点击添加）
                  </span>
                </div>
                <input
                  placeholder="案由/委托事项"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="业务摘要"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  placeholder="业务来源"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  placeholder="接洽时间"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  placeholder="请输入来源说明"
                  className="w-full rounded border px-3 py-2"
                />
                <p className="font-medium">联系人信息</p>
                <p className="font-medium">案源成员</p>
                {[
                  '所属团队',
                  '线索获取人',
                  '业务主管',
                  '线索接洽人',
                  '主办人员',
                  '协办人员',
                ].map((x) => (
                  <div key={x}>
                    * {x}　
                    <button className="text-[#e45159]">+ 选择人员</button>
                  </div>
                ))}
                <p className="font-medium">案源详细信息</p>
                <input
                  placeholder="预计签约时间"
                  className="w-full rounded border px-3 py-2"
                />
                <input
                  placeholder="预计合同金额"
                  className="w-full rounded border px-3 py-2"
                />
                <textarea
                  placeholder="案源背景"
                  className="w-full rounded border px-3 py-2"
                />
                <textarea
                  placeholder="案源目标"
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNotice(summary ? `已保存案源：${summary}` : '');
                    setSummary('');
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  保存案源
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function ProjectStatisticsWorkspace() {
  const [view, setView] = useState('项目进程统计');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [notice, setNotice] = useState('');
  const links = ['项目进程统计', '项目收款统计', '工作饱和度'];
  const progressRows = [
    ['1', 'Northstar Holdings IPO', '2026-09-03', 'Sarah Lin', '设置进程'],
    ['2', 'Orion BioTech v. Atlas', '2026-08-27', 'Michael Chen', '设置进程'],
    [
      '3',
      'Aster Mobility market entry',
      '2026-08-18',
      'Evelyn Park',
      '设置进程',
    ],
  ];
  const paymentRows = progressRows.map((row, i) => [
    row[0],
    row[1],
    row[2],
    row[3],
    ['$120,000', '$48,000', '$32,000'][i],
    '未收款',
  ]);
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <h2 className="text-lg font-semibold">业务项目统计</h2>
        <div className="mt-4 flex flex-wrap gap-4 border-b border-[#edf0f2] pb-3">
          {links.map((x) => (
            <button
              key={x}
              onClick={() => setView(x)}
              className={`pb-2 text-sm ${view === x ? 'border-b-2 border-[#f1666d] text-[#e45159]' : 'text-[#697586]'}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded border border-[#edf0f2] p-4">
          <p className="font-medium">查询范围筛选</p>
          <p className="mt-3 text-sm text-[#697586]">按受理登记日期查</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <input
              aria-label="选择开始日期"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              placeholder="选择开始日期"
              className="h-9 rounded border px-3 text-sm"
            />
            <span>至</span>
            <input
              aria-label="选择结束日期"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              placeholder="选择结束日期"
              className="h-9 rounded border px-3 text-sm"
            />
            <button
              onClick={() =>
                setNotice(`已查询${start || '不限'}至${end || '不限'}`)
              }
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              查询
            </button>
          </div>
        </div>
        {view === '项目进程统计' && (
          <div className="mt-5">
            <p className="text-sm text-[#697586]">项目数量（个）　合计：3个</p>
            <h3 className="mt-4 font-medium">项目进程分布</h3>
            <StatsTable
              headers={[
                '序号',
                '项目名称',
                '受理日期',
                '主管/主办',
                '进程阶段',
              ]}
              rows={progressRows}
            />
          </div>
        )}
        {view === '项目收款统计' && (
          <div className="mt-5">
            <p className="text-sm text-[#697586]">项目数量（个）　合计：3个</p>
            <h3 className="mt-4 font-medium">项目收款情况分布</h3>
            <StatsTable
              headers={[
                '序号',
                '项目名称',
                '受理日期',
                '主管/主办',
                '应收款金额',
                '收款情况',
              ]}
              rows={paymentRows}
            />
          </div>
        )}
        {view === '工作饱和度' && (
          <div className="mt-5">
            <p className="text-sm text-[#697586]">
              应收款金额（万元）　合计：20万元
            </p>
            <h3 className="mt-4 font-medium">项目收款情况分布</h3>
            <StatsTable
              headers={[
                '序号',
                '项目名称',
                '受理日期',
                '主管/主办',
                '应收款金额',
                '收款情况',
              ]}
              rows={paymentRows}
            />
          </div>
        )}
        {notice && (
          <p className="mt-3 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}

function StatsTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="mt-3 overflow-x-auto rounded border border-[#edf0f2]">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-[#f7f8fa] text-left text-[#697586]">
          <tr>
            {headers.map((x) => (
              <th key={x} className="px-3 py-3 font-medium">
                {x}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row[0]} className="border-t border-[#edf0f2]">
              {row.map((cell, i) => (
                <td key={`${row[0]}-${i}`} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PreservationWorkspace() {
  const [tab, setTab] = useState('全部');
  const [notice, setNotice] = useState('');
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const tabs = ['全部', '2个月内到期', '已到期', '已解除保全'];
  const fields = [
    '项目名称/编号/客户/备注名',
    '项目角色',
    '律师名称',
    '财产名称',
    '所有权人',
    '财产类别',
    '保全顺位',
    '保全状态',
    '执行状态',
  ];
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <h2 className="text-lg font-semibold">财产保全管理</h2>
        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#edf0f2] pb-3">
          {tabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`rounded px-3 py-2 text-sm ${tab === x ? 'bg-[#f1666d] text-white' : 'text-[#4f5965] hover:bg-[#fff1f1]'}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <button
            onClick={() => setNotice('批量续封')}
            className="rounded px-3 py-2 text-[#4f5965]"
          >
            批量续封
          </button>
          <button
            onClick={() => setNotice('批量标记')}
            className="rounded border px-3 py-2"
          >
            批量标记
          </button>
          <div className="relative">
            <button
              onClick={() => setNewMenuOpen((open) => !open)}
              className="rounded bg-[#f1666d] px-4 py-2 text-white"
            >
              新增财产保全⌄
            </button>
            {newMenuOpen && (
              <div className="absolute right-0 z-10 mt-1 w-40 rounded border border-[#edf0f2] bg-white p-1 shadow-lg">
                {['新增财产保全', '批量导入'].map((x) => (
                  <button
                    key={x}
                    onClick={() => {
                      setNotice(x);
                      setNewMenuOpen(false);
                    }}
                    className="block w-full rounded px-3 py-2 text-left text-sm hover:bg-[#fff1f1]"
                  >
                    {x}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-3">
          {fields.map((label) => (
            <input
              key={label}
              value={label === '项目名称/编号/客户/备注名' ? query : undefined}
              onChange={(e) =>
                label === '项目名称/编号/客户/备注名' &&
                setQuery(e.target.value)
              }
              placeholder={label}
              className="h-9 rounded border border-[#dce1e6] px-3 text-sm"
            />
          ))}
          <input
            placeholder="查封到期日"
            className="h-9 rounded border border-[#dce1e6] px-3 text-sm"
          />
          <input
            aria-label="开始日期"
            placeholder="开始日期"
            className="h-9 rounded border border-[#dce1e6] px-3 text-sm"
          />
          <input
            aria-label="结束日期"
            placeholder="结束日期"
            className="h-9 rounded border border-[#dce1e6] px-3 text-sm"
          />
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-[#697586]">
          <span>当前状态：{tab}</span>
          <button
            onClick={() => setNotice('导出Excel')}
            className="rounded border px-3 py-1.5"
          >
            导出Excel
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {[
                  '关联项目',
                  '主办',
                  '财产名称',
                  '所有权人',
                  '查封到期日',
                  '保全状态',
                  '执行状态',
                  '关联文档',
                  '操作',
                ].map((x) => (
                  <th key={x} className="px-3 py-3 font-medium">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={9}
                  className="px-3 py-12 text-center text-[#8993a0]"
                >
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {notice && (
          <p className="mt-3 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            已选择：{notice}
          </p>
        )}
        <p className="mt-3 text-sm text-[#8993a0]">
          当前筛选：{tab} · 已筛选0条
        </p>
      </section>
    </div>
  );
}

function AdvisorRenewalWorkspace() {
  const [tab, setTab] = useState('全部');
  const [chartOpen, setChartOpen] = useState(true);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [lawyer, setLawyer] = useState('');
  const [status, setStatus] = useState('');
  const [notice, setNotice] = useState('');
  const tabs = [
    '全部',
    '2个月内到期',
    '已到期未续约',
    '已正常续约',
    '已终止续约',
  ];
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <h2 className="text-lg font-semibold">顾问续约管理</h2>
        <div className="mt-4 flex flex-wrap gap-2 border-b border-[#edf0f2] pb-3">
          {tabs.map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              className={`rounded px-3 py-2 text-sm ${tab === x ? 'bg-[#f1666d] text-white' : 'text-[#4f5965] hover:bg-[#fff1f1]'}`}
            >
              {x}
            </button>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-[#697586]">
          <span>展开图表</span>
          <button
            onClick={() => setChartOpen((v) => !v)}
            className={`relative h-5 w-10 rounded-full ${chartOpen ? 'bg-[#f1666d]' : 'bg-[#c7ced6]'}`}
          >
            <span
              className={`absolute top-0.5 size-4 rounded-full bg-white transition ${chartOpen ? 'left-5' : 'left-0.5'}`}
            />
          </button>
        </div>
        {chartOpen && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded border border-[#edf0f2] p-4">
              <p className="font-medium">顾问合同金额统计</p>
              <p className="mt-4 text-sm text-[#697586]">
                合同金额合计：
                <span className="text-xl font-semibold text-[#25313d]">
                  0
                </span>{' '}
                万元
              </p>
              <div className="mt-4 flex items-center gap-2">
                <input
                  defaultValue="2026"
                  className="h-8 w-20 rounded border px-2 text-sm"
                />
                <span>2026年⌄</span>
              </div>
            </div>
            <div className="rounded border border-[#edf0f2] p-4">
              <p className="font-medium">顾问合同金额分布</p>
              <p className="mt-4 text-sm text-[#8993a0]">暂无数据</p>
              <p className="mt-2 text-xs text-[#8993a0]">
                所有状态下顾问合同金额均为0，请试试更换时间范围~
              </p>
            </div>
          </div>
        )}
        <div className="mt-5 rounded border border-[#edf0f2] p-4">
          <p className="font-medium">顾问截止日期</p>
          <div className="mt-3 grid gap-2 md:grid-cols-5">
            <input
              aria-label="开始日期"
              defaultValue="2026-09-01"
              className="h-9 rounded border px-2 text-sm"
            />
            <input
              aria-label="结束日期"
              defaultValue="2026-09-30"
              className="h-9 rounded border px-2 text-sm"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="项目名称/编号/客户/备注名"
              className="h-9 rounded border px-3 text-sm"
            />
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="项目角色"
              className="h-9 rounded border px-3 text-sm"
            />
            <input
              value={lawyer}
              onChange={(e) => setLawyer(e.target.value)}
              placeholder="律师名称"
              className="h-9 rounded border px-3 text-sm"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="续约状态"
              className="h-9 rounded border px-3 text-sm"
            />
            <button
              onClick={() => setStatus('未续约')}
              className="rounded border px-3 py-1.5 text-sm"
            >
              未续约
            </button>
            <button
              onClick={() => setStatus('已正常续约')}
              className="rounded border px-3 py-1.5 text-sm"
            >
              已正常续约
            </button>
            <button
              onClick={() => setStatus('已终止续约')}
              className="rounded border px-3 py-1.5 text-sm"
            >
              已终止续约
            </button>
            <button
              onClick={() => {
                setQuery('');
                setRole('');
                setLawyer('');
                setStatus('');
              }}
              className="rounded px-3 py-1.5 text-sm text-[#e45159]"
            >
              清空
            </button>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[800px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {[
                  '项目名称',
                  '主办',
                  '顾问截止日期',
                  '到期状态',
                  '合同金额',
                  '最近联系日期',
                  '项目管理页',
                ].map((x) => (
                  <th key={x} className="px-3 py-3 font-medium">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-12 text-center text-[#8993a0]"
                >
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-sm text-[#8993a0]">
          当前筛选：{tab} · 已筛选0条
        </p>
        {notice && (
          <p className="mt-2 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            {notice}
          </p>
        )}
      </section>
    </div>
  );
}

function SubprojectWorkspace() {
  const [parent, setParent] = useState('');
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [lawyer, setLawyer] = useState('');
  const [notice, setNotice] = useState('');
  const [batchOpen, setBatchOpen] = useState(false);
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">子项目管理</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              '批量生成文档',
              '批量盖章',
              '批量立案',
              '批量作废',
              '批量删除',
            ].map((x) => (
              <button
                key={x}
                onClick={() => setNotice(x)}
                className="rounded px-2 py-2 text-[#4f5965] hover:bg-[#fff1f1] hover:text-[#e45159]"
              >
                {x}
              </button>
            ))}
            <button
              onClick={() => setBatchOpen(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-white"
            >
              批量创建子项目
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <label className="text-xs text-[#7a8591]">
            上级总项目
            <input
              value={parent}
              onChange={(e) => setParent(e.target.value)}
              placeholder="项目名称/编号/律师/备注名"
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
          <label className="text-xs text-[#7a8591]">
            项目状态
            <input
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
          <label className="text-xs text-[#7a8591]">
            项目名称
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="项目名称/编号/客户/备注名"
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
          <label className="text-xs text-[#7a8591]">
            项目角色
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
          <label className="text-xs text-[#7a8591]">
            律师名称
            <input
              value={lawyer}
              onChange={(e) => setLawyer(e.target.value)}
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center gap-3 text-sm text-[#697586]">
          <span>项目状态</span>
          <button
            onClick={() => setStatus('在办项目')}
            className="rounded border border-[#dce1e6] px-3 py-1.5"
          >
            在办项目⌄
          </button>
          <span>已筛选0条</span>
          <button
            onClick={() => {
              setParent('');
              setStatus('');
              setQuery('');
              setRole('');
              setLawyer('');
            }}
            className="text-[#e45159]"
          >
            清空
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {['子项目名称', '标的额', '进程阶段', '案件状态', '操作'].map(
                  (x) => (
                    <th key={x} className="px-3 py-3 font-medium">
                      {x}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-12 text-center text-[#8993a0]"
                >
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {notice && (
          <p className="mt-3 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            已选择：{notice}
          </p>
        )}
      </section>
      {batchOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35">
          <div className="w-[520px] rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">批量创建子项目</h3>
              <button onClick={() => setBatchOpen(false)}>×</button>
            </div>
            <p className="mt-4 text-sm text-[#4f5965]">
              批量创建子项目，用于“律师与客户先签订一个总项目合同，然后在合同约定范围内，为客户办理很多相似案件”的情况
            </p>
            <p className="mt-3 text-sm text-[#4f5965]">
              注意：如果你的委托人或对方当事人是多个不同的人，而这些当事人都是同一个案件下的，则直接添加项目即可，不需要添加子项目
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm">
              <div className="rounded border border-[#dce1e6] p-4">
                同一委托人
              </div>
              <div className="rounded border border-[#dce1e6] p-4">
                多个不同对方当事人
              </div>
              <div className="rounded border border-[#dce1e6] p-4">
                多个不同委托人
              </div>
              <div className="rounded border border-[#dce1e6] p-4">
                同一对方当事人
              </div>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setBatchOpen(false)}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectOverviewWorkspace({
  projects,
  onOpenProject,
}: {
  projects: string[][];
  onOpenProject?: (project: string[]) => void;
}) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('在办项目');
  const [type, setType] = useState('项目类型');
  const [payment, setPayment] = useState('收款状态');
  const [returned, setReturned] = useState('合同交回状态');
  const [notice, setNotice] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const filtered = projects.filter((row) =>
    row.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="p-7">
      <section className="rounded-lg border border-[#edf0f2] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">业务项目</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {[
              '批量退出项目',
              '批量分配项目',
              '项目导出',
              '利益冲突检索',
              '申请加入项目',
            ].map((x) => (
              <button
                key={x}
                onClick={() => setNotice(x)}
                className="rounded px-2 py-2 text-[#4f5965] hover:bg-[#fff1f1] hover:text-[#e45159]"
              >
                {x}
              </button>
            ))}
            <button
              onClick={() => setCreateOpen(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-white"
            >
              创建新项目⌄
            </button>
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-5">
          {[
            [
              '在办项目',
              status,
              setStatus,
              ['在办项目', '全部项目', '已结案项目'],
            ],
            [
              '项目类型',
              type,
              setType,
              [
                '项目类型',
                '民事案件',
                '刑事案件',
                '行政案件',
                '非诉/专项',
                '常年顾问',
                '咨询/代书',
              ],
            ],
            [
              '收款状态',
              payment,
              setPayment,
              ['收款状态', '未收款', '部分收款', '全额收款'],
            ],
            [
              '合同交回状态',
              returned,
              setReturned,
              ['合同交回状态', '未交回', '已交回'],
            ],
          ].map(([label, value, setter, options]) => (
            <label key={label as string} className="text-xs text-[#7a8591]">
              {label as string}
              <select
                value={value as string}
                onChange={(e) =>
                  (setter as React.Dispatch<React.SetStateAction<string>>)(
                    e.target.value,
                  )
                }
                className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-2 text-sm text-[#25313d]"
              >
                {(options as string[]).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          ))}
          <label className="text-xs text-[#7a8591]">
            搜索项目
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="项目名称/编号/客户/备注名"
              className="mt-1 h-9 w-full rounded border border-[#dce1e6] px-3 text-sm text-[#25313d]"
            />
          </label>
        </div>
        <div className="overflow-x-auto rounded border border-[#edf0f2]">
          <table className="w-full min-w-[850px] text-sm">
            <thead className="bg-[#f7f8fa] text-left text-[#697586]">
              <tr>
                {[
                  '项目名称',
                  '受理时间',
                  '主办',
                  '合同金额',
                  '进程阶段',
                  '项目管理页',
                  '案件状态',
                  '操作',
                ].map((x) => (
                  <th key={x} className="px-3 py-3 font-medium">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, index) => (
                <tr
                  key={`${row[0]}-${index}`}
                  className="border-t border-[#edf0f2]"
                >
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onOpenProject?.(row)}
                      className="text-left text-[#1f5f9b] hover:underline"
                    >
                      {row[0]}
                      <span className="block text-xs text-[#8993a0]">
                        {row[1]}
                      </span>
                    </button>
                  </td>
                  <td className="px-3 py-3">{row[2] ?? '2026-09-08'}</td>
                  <td className="px-3 py-3">{row[3] ?? '当前用户'}</td>
                  <td className="px-3 py-3">
                    {row[4] ?? '待定'}
                    <span className="ml-2 text-xs text-[#e45159]">
                      {payment === '收款状态' ? '未收款' : payment}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-[#8993a0]">未设置进程</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => onOpenProject?.(row)}
                      className="rounded bg-[#f7f8fa] px-2 py-1 text-xs"
                    >
                      日志 0
                    </button>
                    <button
                      onClick={() => setNotice('项目文档')}
                      className="ml-1 rounded bg-[#f7f8fa] px-2 py-1 text-xs"
                    >
                      文档 2
                    </button>
                  </td>
                  <td className="px-3 py-3">
                    <span className="text-[#17a673]">● 已立案</span>
                    <span className="block text-xs text-[#8993a0]">
                      合同未交回
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setNotice('更多操作')}
                      className="text-[#687382]"
                    >
                      •••
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-sm text-[#8993a0]">
          共 {filtered.length} 条
        </div>
        {notice && (
          <p className="mt-3 rounded bg-[#fff7f7] px-3 py-2 text-sm text-[#c64f57]">
            已选择：{notice}
          </p>
        )}
      </section>
      {createOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/35">
          <div className="w-[440px] rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">创建新项目</h3>
              <button onClick={() => setCreateOpen(false)}>×</button>
            </div>
            <p className="mt-5 text-sm text-[#4f5965]">第一步：选择项目类型</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[
                '民事案件',
                '刑事案件',
                '行政案件',
                '非诉/专项',
                '常年顾问',
                '咨询/代书',
              ].map((x) => (
                <button
                  key={x}
                  onClick={() => setNotice(`已选择项目类型：${x}`)}
                  className="rounded border border-[#dce1e6] px-3 py-2 text-sm hover:border-[#f1666d]"
                >
                  {x}
                </button>
              ))}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setCreateOpen(false)}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => setNotice('进入第二步：填写项目信息')}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                下一步
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectOperations({
  section,
  setProjects,
  onOpenProject,
}: {
  section: string;
  setProjects?: React.Dispatch<React.SetStateAction<string[][]>>;
  onOpenProject?: (project: string[]) => void;
}) {
  const [showForm, setShowForm] = useState(false);
  const [formValue, setFormValue] = useState('');
  const [notice, setNotice] = useState('');
  if (section === '归档卷宗')
    return <ArchiveWorkspace setProjects={setProjects} />;
  if (section === '合同阶段' || section === '合同管理')
    return <ContractWorkspace onOpenProject={onOpenProject} />;
  const data: Record<
    string,
    { headers: string[]; rows: string[][]; note: string }
  > = {
    合同管理: {
      headers: ['合同名称', '关联项目', '审批状态', '用印', '原件交回', '操作'],
      rows: [
        [
          'Engagement Letter.pdf',
          'Northstar Holdings IPO',
          '已审批',
          '已盖电子章',
          '未交回',
          '查看',
        ],
        [
          'Service Agreement.pdf',
          'Orion BioTech v. Atlas',
          '已审批',
          '待用印',
          '已交回',
          '查看',
        ],
      ],
      note: '电子签、纸质签、用印、交回和卷宗归档以独立状态机管理。',
    },
    顾问续约: {
      headers: ['客户', '顾问合同', '到期日', '负责人', '状态'],
      rows: [
        [
          'Northstar Holdings',
          '2026 年度常年法律顾问',
          '2026-12-31',
          'Sarah Lin',
          '正常',
        ],
        [
          'Aster Mobility',
          '跨境市场进入专项顾问',
          '2026-10-31',
          'Evelyn Park',
          '90 天内到期',
        ],
      ],
      note: '临近到期的顾问事项会进入工作首页提醒并可发起续约审批。',
    },
    财产保全管理: {
      headers: ['项目', '保全对象', '申请日期', '到期日', '负责人', '状态'],
      rows: [
        [
          'Orion BioTech v. Atlas',
          '待补充',
          '—',
          '—',
          'Michael Chen',
          '待建立',
        ],
      ],
      note: '到期提醒、裁定文件、担保材料与执行结果需形成可审计链路。',
    },
    业务项目统计: {
      headers: ['统计期间', '立项数', '签约金额', '收款金额', '开票金额'],
      rows: [
        ['本月', '12', '$480,000', '$404,000', '$392,000'],
        ['本年', '87', '$3,240,000', '$2,710,000', '$2,480,000'],
      ],
      note: '统计仅展示当前用户拥有查看权限的项目数据。',
    },
    归档卷宗: {
      headers: [
        '卷宗名称',
        '关联项目',
        '归档状态',
        '原件状态',
        '文件数',
        '操作',
      ],
      rows: [
        [
          '项目合同原件',
          'Northstar Holdings IPO',
          '待归档',
          '未交回',
          '1',
          '管理',
        ],
        [
          '诉讼工作底稿',
          'Orion BioTech v. Atlas',
          '已归档',
          '已交回',
          '24',
          '查看',
        ],
      ],
      note: '卷宗下载、借阅、归还、归档与销毁均必须保留审计记录。',
    },
  };
  const current =
    data[section] ??
    ({
      headers: ['暂无数据'],
      rows: [],
      note: '',
    } as { headers: string[]; rows: string[][]; note: string });
  return (
    <div className="p-7">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{section}</h2>
          <p className="mt-1 text-xs text-[#84909d]">项目业务管理台</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          新建 / 申请
        </button>
      </div>
      <DetailTable
        headers={current.headers}
        rows={current.rows}
        footer={current.note}
      />
      {notice && (
        <button
          onClick={() => setNotice('')}
          className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
        >
          {notice} · 关闭
        </button>
      )}
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">{section} · 新建 / 申请</h3>
            <p className="mt-2 text-xs text-[#84909d]">
              提交后将进入相应审批流程，并在工作首页显示待办提醒。
            </p>
            <input
              value={formValue}
              onChange={(e) => setFormValue(e.target.value)}
              placeholder="事项名称或申请说明"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (formValue.trim())
                    setNotice(`已提交“${formValue.trim()}”，等待审批`);
                  setFormValue('');
                  setShowForm(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ArchiveWorkspace({
  setProjects,
}: {
  setProjects?: React.Dispatch<React.SetStateAction<string[][]>>;
}) {
  const [tab, setTab] = useState('我的卷宗');
  const [project, setProject] = useState('Northstar Holdings IPO');
  const [closed, setClosed] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [archiveView, setArchiveView] = useState('未归档项目卷宗');
  const [archiveQuery, setArchiveQuery] = useState('');
  const [showBatch, setShowBatch] = useState(false);
  const [batchSelected, setBatchSelected] = useState<string[]>([]);
  const projects = [
    'Northstar Holdings IPO',
    'Orion BioTech v. Atlas',
    'Aster Mobility market entry',
  ];
  function complete() {
    if (!closed.includes(project)) setClosed((items) => [...items, project]);
    setProjects?.((items) =>
      items.map((row) =>
        row[0] === project
          ? [row[0], row[1], row[2], row[3], '已结案', '已收款']
          : row,
      ),
    );
    setNotice(`${project} 已办结，项目状态已同步为“已结案”`);
  }
  return (
    <div className="p-7">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">归档卷宗</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            按项目管理我的卷宗，并提供律所卷宗借阅
          </p>
        </div>
        <button
          onClick={() => setShowBatch(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          批量标记已办结
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        {['我的卷宗', '律所卷宗借阅'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded px-4 py-2 text-sm ${tab === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === '我的卷宗' ? (
        <section className="rounded border border-[#e1e5e9] bg-white p-5">
          <div className="mb-4 flex gap-2">
            {['未归档项目卷宗', '已归档项目卷宗'].map((item) => (
              <button
                key={item}
                onClick={() => setArchiveView(item)}
                className={`rounded px-3 py-2 text-xs ${archiveView === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              value={archiveQuery}
              onChange={(e) => setArchiveQuery(e.target.value)}
              placeholder="项目名称/编号/客户"
              className="w-full max-w-sm rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
              <option>项目类型</option>
              <option>资本市场</option>
              <option>诉讼仲裁</option>
            </select>
            <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
              <option>合同交回状态</option>
              <option>已交回</option>
              <option>未交回</option>
            </select>
          </div>
          <label className="block text-sm">
            选择项目
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="mt-2 w-full max-w-md rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              {projects
                .filter((item) =>
                  item.toLowerCase().includes(archiveQuery.toLowerCase()),
                )
                .map((item) => (
                  <option key={item}>{item}</option>
                ))}
            </select>
          </label>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded border border-[#edf0f2] p-4">
              <p className="text-xs text-[#84909d]">卷宗状态</p>
              <p className="mt-2 font-medium">
                {archiveView === '已归档项目卷宗' || closed.includes(project)
                  ? '已办结'
                  : '整理中'}
              </p>
            </div>
            <div className="rounded border border-[#edf0f2] p-4">
              <p className="text-xs text-[#84909d]">文件数</p>
              <p className="mt-2 font-medium">
                {archiveView === '已归档项目卷宗' || closed.includes(project)
                  ? '24'
                  : '8'}
              </p>
            </div>
            <button
              onClick={complete}
              className="rounded bg-[#eef6ff] p-4 text-left text-sm text-[#3477b9]"
            >
              办结项目
              <br />
              <span className="text-xs">同步项目状态并生成归档记录</span>
            </button>
          </div>
        </section>
      ) : (
        <section className="rounded border border-[#e1e5e9] bg-white p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            <input
              value={archiveQuery}
              onChange={(e) => setArchiveQuery(e.target.value)}
              placeholder="项目名称/编号/客户"
              className="w-full max-w-sm rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
              <option>项目类型</option>
              <option>资本市场</option>
              <option>诉讼仲裁</option>
            </select>
            <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
              <option>电子卷宗上传状态</option>
              <option>已上传</option>
              <option>未上传</option>
            </select>
          </div>
          <p className="py-10 text-center text-sm text-[#8c97a4]">
            暂无可借阅卷宗
          </p>
          <p className="border-t border-[#edf0f2] pt-3 text-xs text-[#8c97a4]">
            律所卷宗借阅页面仅展示经授权的卷宗记录，具体操作遵循管理员配置。
          </p>
        </section>
      )}
      {notice && (
        <button
          onClick={() => setNotice('')}
          className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
        >
          {notice} · 关闭
        </button>
      )}
      {showBatch && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">批量标记已办结</h3>
            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <input
                placeholder="项目名称/委托人/项目编号"
                className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
                <option>项目状态</option>
                <option>已立案</option>
                <option>进行中</option>
              </select>
              <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
                <option>角色</option>
                <option>主办律师</option>
                <option>项目登记人</option>
              </select>
              <input
                placeholder="律师姓名"
                className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <select className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm">
                <option>合同交回状态</option>
                <option>已交回</option>
                <option>未交回</option>
              </select>
            </div>
            <p className="mt-4 text-sm text-[#657181]">
              共找到 {projects.length} 个项目
            </p>
            <div className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded border border-[#edf0f2] p-3">
              {projects.map((item) => (
                <label key={item} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={batchSelected.includes(item)}
                    onChange={(e) =>
                      setBatchSelected((all) =>
                        e.target.checked
                          ? [...all, item]
                          : all.filter((name) => name !== item),
                      )
                    }
                  />
                  {item}
                </label>
              ))}
            </div>
            <p className="mt-3 text-sm">已选项目 {batchSelected.length} 项</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowBatch(false);
                  setBatchSelected([]);
                }}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setClosed((all) => [...new Set([...all, ...batchSelected])]);
                  setProjects?.((items) =>
                    items.map((row) =>
                      batchSelected.includes(row[0])
                        ? [row[0], row[1], row[2], row[3], '已结案', '已收款']
                        : row,
                    ),
                  );
                  setNotice(
                    `已标记 ${batchSelected.length} 个项目办结，并同步项目状态`,
                  );
                  setShowBatch(false);
                  setBatchSelected([]);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                确认标记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContractWorkspace({
  onOpenProject,
}: {
  onOpenProject?: (project: string[]) => void;
}) {
  const [approvalFilter, setApprovalFilter] = useState('全部');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('全部');
  const [typeFilter, setTypeFilter] = useState('全部');
  const [electronicSealFilter, setElectronicSealFilter] = useState('全部');
  const [paperSealFilter, setPaperSealFilter] = useState('全部');
  const [returnFilter, setReturnFilter] = useState('全部');
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const rows = [
    {
      time: '2026-08-27 15:07:21',
      approval: '已审批',
      project: '峻佳設計有限公司与峻佳設計有限公司境外上市发行',
      number: '(2026)HS08FS001513',
      doc: 'SIGNED KYLE CHAN & ASSOCIATES DESIGN LIMITED-engagement letter-260825.pdf',
      lawyer: '张博彦',
      role: '主办律师',
      type: '委托合同',
      electronicSeal: '已盖电子章',
      paperSeal: '未盖纸质章',
      status: '未交回',
    },
    {
      time: '2026-07-21 16:25:04',
      approval: '已审批',
      project: 'P.Y. Cheung & Co.、汉诺数智（深圳）科技有限责任公司出具律师函',
      number: '(2026)HS07ZX000658',
      doc: 'P.Y. Cheung & Co.VS华商律所-专项法律服务合同-260721.pdf',
      lawyer: '张博彦',
      role: '主办律师',
      type: '委托合同',
      electronicSeal: '已盖电子章',
      paperSeal: '未盖纸质章',
      status: '未交回',
    },
    {
      time: '2026-02-06 10:58:11',
      approval: '已审批',
      project: '結他控股有限公司与結他控股有限公司IPO见证',
      number: '(2026)HS02FS000235',
      doc: 'Guitar Holdings Limited-engagement letter-260204（2）.pdf',
      lawyer: '张博彦',
      role: '主办律师',
      type: '委托合同',
      electronicSeal: '已盖电子章',
      paperSeal: '未盖纸质章',
      status: '未交回',
    },
  ];
  const visibleRows = rows.filter(
    (row) =>
      (approvalFilter === '全部' || row.approval === approvalFilter) &&
      (roleFilter === '全部' || row.role === roleFilter) &&
      (typeFilter === '全部' || row.type === typeFilter) &&
      (electronicSealFilter === '全部' ||
        row.electronicSeal === electronicSealFilter) &&
      (paperSealFilter === '全部' || row.paperSeal === paperSealFilter) &&
      (returnFilter === '全部' || row.status === returnFilter) &&
      (!search || `${row.project} ${row.number} ${row.doc}`.includes(search)),
  );
  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">合同管理</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            合同、审批、用印、原件交回和归档状态统一管理
          </p>
        </div>
        <button className="rounded border border-[#dce1e6] bg-white px-4 py-2 text-sm">
          合同交回管理
        </button>
      </div>
      <div className="mb-4 grid gap-2 md:grid-cols-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="项目名称/编号/备注名"
          className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <input
          placeholder="文档名称/文档编号"
          className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          aria-label="项目角色"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>案源开拓人</option>
          <option>业务主管</option>
          <option>业务协管</option>
          <option>主办律师</option>
          <option>协办律师</option>
          <option>其他协助人员</option>
        </select>
        <input
          placeholder="律师名称"
          className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          aria-label="合同类型"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>委托合同</option>
          <option>补充合同</option>
          <option>解约协议</option>
          <option>三方协议</option>
        </select>
        <select
          value={electronicSealFilter}
          onChange={(e) => setElectronicSealFilter(e.target.value)}
          aria-label="电子章状态"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>未盖电子章</option>
          <option>已盖电子章</option>
          <option>电子章作废</option>
          <option>已自动加印</option>
        </select>
        <select
          value={paperSealFilter}
          onChange={(e) => setPaperSealFilter(e.target.value)}
          aria-label="纸质章状态"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>未盖纸质章</option>
          <option>已盖纸质章</option>
          <option>作废已交回</option>
          <option>作废未交回</option>
        </select>
        <input
          type="date"
          className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <input
          type="date"
          className="rounded border border-[#dce1e6] px-3 py-2 text-sm"
        />
        <select
          value={approvalFilter}
          onChange={(e) => setApprovalFilter(e.target.value)}
          aria-label="审批状态"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>待审批</option>
          <option>已审批</option>
          <option>已解约</option>
          <option>已作废</option>
        </select>
        <select
          value={returnFilter}
          onChange={(e) => setReturnFilter(e.target.value)}
          aria-label="合同交回状态"
          className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
        >
          <option>全部</option>
          <option>未交回</option>
          <option>交回生效</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-lg border border-[#e7eaee] bg-white">
        <table className="min-w-[1250px] w-full text-left text-xs">
          <thead className="bg-[#f6f7f8] text-[#6d7885]">
            <tr>
              {[
                '审批时间',
                '审批状态',
                '项目名称',
                '合同文档名称',
                '主办',
                '合同类型',
                '申请用章方式',
                '用印状态',
                '合同状态',
                '交回人',
                '交回时间',
              ].map((h) => (
                <th key={h} className="px-3 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => (
              <tr
                key={row.number}
                className="border-t border-[#edf0f2] align-top"
              >
                <td className="px-3 py-3">{row.time}</td>
                <td className="px-3 py-3">
                  <span className="rounded bg-[#e9f7ee] px-2 py-1 text-[#2f8f55]">
                    {row.approval}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() =>
                      onOpenProject?.([
                        row.project,
                        row.number,
                        row.time.slice(0, 10),
                        row.lawyer,
                        '进行中',
                        '未收款',
                      ])
                    }
                    className="text-left text-[#2563eb] hover:underline"
                  >
                    {row.project}
                    <br />
                    <span className="text-[#84909d]">{row.number}</span>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => setDocPreview(row.doc)}
                    className="text-left text-[#2563eb] hover:underline"
                  >
                    {row.doc}
                  </button>
                  <div className="text-[#84909d]">{row.number}</div>
                </td>
                <td className="px-3 py-3">{row.lawyer}</td>
                <td className="px-3 py-3">{row.type}</td>
                <td className="px-3 py-3">电子章</td>
                <td className="px-3 py-3">
                  {row.paperSeal} / {row.electronicSeal}
                </td>
                <td className="px-3 py-3">{row.status}</td>
                <td className="px-3 py-3">-</td>
                <td className="px-3 py-3">-</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-[#edf0f2] px-4 py-3 text-xs text-[#84909d]">
          已筛选 {visibleRows.length} 条
        </div>
      </div>
      {docPreview && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-3xl rounded-lg bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h3 className="font-semibold">项目在线文档</h3>
              <button
                onClick={() => setDocPreview(null)}
                className="text-xl text-[#84909d]"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4 rounded border bg-[#f8fafc] px-4 py-3 text-sm">
                {docPreview}
              </div>
              <div className="grid h-72 place-items-center rounded border border-dashed text-sm text-[#84909d]">
                在线文档预览区域
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegalToolsWorkspace({ section }: { section: string }) {
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('');
  const groups: Record<string, string[]> = {
    我的工具: ['Office 文档', '在线笔记', '多维表格', '企业信息'],
    效率工具: ['文档工具', 'AI 工具', '合同模板', '计算器'],
    信息查询: ['查主体', '查征信 / 身份', '查资质', '信息披露'],
    司法网址: ['法律法规 / 政策文件', '法院 / 检察院', '案例检索'],
    诉讼仲裁: ['司法案例', '审判流程', '执行', '仲裁', '涉外'],
    知识产权: ['知识产权保护', '查商标', '查专利', '其他查询'],
    资本市场: ['SEC EDGAR', 'NYSE', 'NASDAQ', 'FINRA', '证券监管资料'],
    数据合规: ['隐私法规', '数据跨境', '网络安全', '监管执法'],
  };
  const choices = (groups[section] ?? []).filter((tool) =>
    tool.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="p-7">
      <section className="rounded border border-[#d7e5ff] bg-gradient-to-r from-[#eaf3ff] to-[#f8fbff] p-6">
        <h2 className="text-2xl font-semibold text-[#326fed]">{section}</h2>
        <p className="mt-2 text-sm text-[#5e7895]">
          法律工具一站式导航 · 所有外部数据访问需符合律所数据与供应商政策
        </p>
        <div className="mt-4 flex max-w-xl">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-l border border-[#b9cff2] bg-white px-4 py-2.5 text-sm"
            placeholder="输入关键词搜索法律工具"
          />
          <button
            onClick={() =>
              setNotice(
                query
                  ? `已筛选出 ${choices.length} 个工具`
                  : '请输入关键词后搜索',
              )
            }
            className="rounded-r bg-[#3e77ed] px-5 text-sm text-white"
          >
            搜索
          </button>
        </div>
      </section>
      {notice && (
        <button
          onClick={() => setNotice('')}
          className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
        >
          {notice} · 关闭
        </button>
      )}
      <h3 className="mt-6 text-lg font-semibold">{section}</h3>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {choices.map((tool) => (
          <button
            key={tool}
            onClick={() =>
              setNotice(`${tool} 已打开，外部访问将记录审计日志并执行权限检查`)
            }
            className="rounded border border-[#e0e4e8] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#8bb5ff]"
          >
            <div className="grid size-9 place-items-center rounded bg-[#eaf2ff] text-[#3976e8]">
              ↗
            </div>
            <p className="mt-3 font-medium">{tool}</p>
            <p className="mt-1 text-xs text-[#8a96a3]">
              已纳入平台目录 · 查看使用说明
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function SideIcon({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-1 flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm ${active ? 'bg-[#fff0f0] font-medium text-[#e45159]' : 'text-[#4b5868] hover:bg-[#f5f6f8]'}`}
    >
      <Icon className="size-[17px]" />
      {label}
    </button>
  );
}

function WorkHome({
  projects,
  logs,
  tasks,
  projectMembership,
  setProjectMembership,
  directoryRows,
  setDirectoryRows,
  positions,
  setPositions,
  onNavigate,
}: {
  projects: string[][];
  logs: string[][];
  tasks: string[][];
  projectMembership: Record<string, 'member' | 'invited'>;
  setProjectMembership: React.Dispatch<
    React.SetStateAction<Record<string, 'member' | 'invited'>>
  >;
  directoryRows: string[][];
  setDirectoryRows: React.Dispatch<React.SetStateAction<string[][]>>;
  positions: string[][];
  setPositions: React.Dispatch<React.SetStateAction<string[][]>>;
  onNavigate: (section: string) => void;
}) {
  const [reminder, setReminder] = useState('待办事项');
  const [dynamic, setDynamic] = useState('');
  const [shareScope, setShareScope] = useState('项目成员可见');
  const [dashboard, setDashboard] = useState('系统仪表盘 1');
  const [showApps, setShowApps] = useState(false);
  const [dynamics, setDynamics] = useState([
    '项目文件已更新，等待团队复核。',
    '已完成客户会议纪要整理。',
  ]);
  const reminderItems = ['开庭提醒', '顾问到期', '保全到期', '待办事项'];
  const unreadLogCount = logs.filter((row) =>
    row[4]?.startsWith('待阅'),
  ).length;
  const pendingTaskCount = tasks.filter(
    (task) => !['已完成', '已取消'].includes(task[4]),
  ).length;
  function publishDynamic() {
    if (!dynamic.trim()) return;
    setDynamics((items) => [dynamic.trim(), ...items]);
    setDynamic('');
  }
  return (
    <div className="grid gap-3 p-3 xl:grid-cols-[250px_minmax(0,1fr)_300px]">
      {Object.entries(projectMembership).some(
        ([, state]) => state === 'invited',
      ) && (
        <section className="border border-[#f3d8da] bg-[#fffafa] p-4 xl:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-[#d9525b]">项目加入邀请</p>
              <p className="mt-1 text-xs text-[#7f8995]">
                你被邀请加入：
                {Object.entries(projectMembership)
                  .filter(([, state]) => state === 'invited')
                  .map(([name]) => name)
                  .join('、')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setProjectMembership(
                    (items) =>
                      Object.fromEntries(
                        Object.entries(items).map(([name, state]) => [
                          name,
                          state === 'invited' ? 'member' : state,
                        ]),
                      ) as Record<string, 'member' | 'invited'>,
                  )
                }
                className="rounded bg-[#f1666d] px-4 py-2 text-xs text-white"
              >
                确认加入
              </button>
              <button
                onClick={() =>
                  setProjectMembership(
                    (items) =>
                      Object.fromEntries(
                        Object.entries(items).filter(
                          ([, state]) => state !== 'invited',
                        ),
                      ) as Record<string, 'member' | 'invited'>,
                  )
                }
                className="rounded border border-[#dce1e6] bg-white px-4 py-2 text-xs"
              >
                暂不加入
              </button>
            </div>
          </div>
        </section>
      )}
      <div className="space-y-3">
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-full bg-[#e6e9ed] font-semibold text-[#7b8794]">
              SL
            </div>
            <div>
              <p className="font-semibold">Sarah Lin，下午好</p>
              <p className="mt-1 text-xs text-[#86909c]">
                登录所：Hamilton Weiss PLLC
              </p>
              <button
                onClick={() =>
                  setDashboard((value) =>
                    value === '系统仪表盘 1'
                      ? '业务负责人仪表盘'
                      : '系统仪表盘 1',
                  )
                }
                className="mt-1 text-xs text-[#86909c]"
              >
                工作台：{dashboard}⌄
              </button>
            </div>
          </div>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">消息中心</h2>
            <button className="text-xs text-[#e45159]">刷新</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center text-xs text-[#657181]">
            {[
              '@/评论/赞',
              '待阅日志',
              '项目协作',
              '收款开票',
              '日程提醒',
              '待办任务',
              '流程审批',
              '案源协作',
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  onNavigate(
                    item === '待阅日志'
                      ? '日志'
                      : item === '日程提醒'
                        ? '日程'
                        : item === '待办任务'
                          ? '任务'
                          : item === '流程审批'
                            ? '流程审批'
                            : item === '案源协作'
                              ? '外所协办项目'
                              : '消息中心',
                  )
                }
                className="rounded p-2 hover:bg-[#fff4f4] hover:text-[#e45159]"
              >
                <span className="mx-auto mb-2 block size-6 rounded bg-[#f1f3f5]" />
                {item}
                {item === '待阅日志' && unreadLogCount > 0
                  ? ` (${unreadLogCount})`
                  : item === '待办任务' && pendingTaskCount > 0
                    ? ` (${pendingTaskCount})`
                    : ''}
              </button>
            ))}
          </div>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">我常用的应用</h2>
            <button
              onClick={() => setShowApps((value) => !value)}
              className="text-xs text-[#e45159]"
            >
              管理
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-xs text-[#657181]">
            {[
              '合同阶段',
              '案源阶段',
              '我的文档',
              '日志',
              '任务',
              '日程',
              '项目收款',
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  onNavigate(
                    item === '合同阶段'
                      ? '合同管理'
                      : item === '案源阶段'
                        ? '外所协办项目'
                        : item === '我的文档'
                          ? '我的文档'
                          : item,
                  )
                }
                className="rounded border border-[#edf0f2] p-2 hover:border-[#f3b0b4]"
              >
                {item}
              </button>
            ))}
          </div>
          {showApps && (
            <div className="mt-3 rounded border border-[#f3d8da] bg-[#fffafa] p-3 text-xs text-[#6f7782]">
              常用应用管理：支持排序、隐藏和添加应用入口。
            </div>
          )}
        </section>
      </div>
      <div className="space-y-3">
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">业务提醒</h2>
            <button className="text-xs text-[#e45159]">查看更多</button>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {reminderItems.map((item) => (
              <button
                onClick={() => {
                  setReminder(item);
                  if (item === '待办事项') onNavigate('日志');
                }}
                key={item}
                className={`rounded px-2 py-3 text-xs ${reminder === item ? 'bg-[#fff0f0] text-[#e45159]' : 'bg-[#f6f7f8] text-[#657181]'}`}
              >
                {item} ({item === '待办事项' ? unreadLogCount : 0})
              </button>
            ))}
          </div>
          <div className="grid h-36 place-items-center text-sm text-[#9ba4ae]">
            {reminder === '待办事项' && unreadLogCount > 0
              ? `有 ${unreadLogCount} 条日志等待团队审阅`
              : `${reminder}：暂无数据`}
          </div>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">业务动态</h2>
            <button className="text-xs text-[#e45159]">查看更多</button>
          </div>
          <textarea
            value={dynamic}
            onChange={(e) => setDynamic(e.target.value)}
            className="mt-3 h-20 w-full resize-none rounded border border-[#e0e4e8] p-3 text-sm outline-none focus:border-[#f1666d]"
            placeholder="工作中的心得体会、学习建议，都可以分享给大家哦～"
          />
          <div className="mt-2 flex justify-between">
            <button
              onClick={() =>
                setShareScope((value) =>
                  value === '项目成员可见' ? '全所可见' : '项目成员可见',
                )
              }
              className="text-xs text-[#7b8794]"
            >
              添加附件 · {shareScope}
            </button>
            <button
              onClick={publishDynamic}
              className="rounded bg-[#f1666d] px-4 py-1.5 text-xs text-white"
            >
              发布
            </button>
          </div>
          <div className="mt-4 space-y-3">
            {dynamics.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="border-t border-[#edf0f2] pt-3"
              >
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Sarah Lin{' '}
                    <span className="ml-2 text-xs font-normal text-[#8b96a3]">
                      项目成员可见
                    </span>
                  </span>
                  <button className="text-xs text-[#9ba4ae]">删除</button>
                </div>
                <p className="mt-2 text-sm text-[#5d6977]">{item}</p>
                <p className="mt-2 text-xs text-[#9ba4ae]">
                  刚刚 · 下载 · 评论
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">项目列表</h2>
            <button className="text-xs text-[#e45159]">查看更多</button>
          </div>
          <div className="mt-3 flex gap-3 border-b border-[#edf0f2] pb-2 text-sm">
            <button className="border-b-2 border-[#f1666d] pb-2 text-[#e45159]">
              我主办的
            </button>
            <button className="pb-2 text-[#7e8995]">近期关注</button>
          </div>
          <div className="mt-3 space-y-2">
            {projects.slice(0, 4).map((row) => (
              <button
                key={row[1]}
                className="block w-full rounded border border-[#edf0f2] px-3 py-2 text-left hover:bg-[#fffafa]"
              >
                <p className="text-sm font-medium">{row[0]}</p>
                <p className="mt-1 text-xs text-[#909aa6]">
                  {row[1]} · {row[3]} · {row[4]}
                </p>
              </button>
            ))}
          </div>
        </section>
      </div>
      <div className="space-y-3">
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">律所通知</h2>
            <button className="text-xs text-[#e45159]">查看更多</button>
          </div>
          <p className="mt-5 text-sm text-[#5d6977]">
            关于 Hamilton FirmOS 系统试运行的通知
          </p>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">日程提醒</h2>
            <button className="text-xs text-[#e45159]">今日日程</button>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-xs text-[#707c89]">
            {['日', '一', '二', '三', '四', '五', '六'].map((day, index) => (
              <div
                key={day}
                className={`rounded py-2 ${index === 2 ? 'bg-[#f1666d] text-white' : 'bg-[#f6f7f8]'}`}
              >
                {day}
                <br />
                {6 + index}
              </div>
            ))}
          </div>
          <div className="grid h-36 place-items-center text-sm text-[#9ba4ae]">
            暂无日程
          </div>
        </section>
        <section className="border border-[#e0e4e8] bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">业务看板</h2>
            <button className="text-xs text-[#e45159]">刷新</button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            {[
              ['项目', '12'],
              ['签约金额', '$480k'],
              ['收款金额', '$404k'],
              ['开票金额', '$392k'],
            ].map(([label, amount]) => (
              <div key={label} className="rounded bg-[#f6f7f8] p-3">
                <p className="text-xs text-[#8b96a3]">{label}</p>
                <p className="mt-1 font-semibold">{amount}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function MyDocumentsWorkspace({ files }: { files: string[][] }) {
  const seedRows = [
    ['20260907151308829（1）.pdf', '', '311.28K', '2026-09-07'],
    ['20260907151308829.pdf', '', '311.28K', '2026-09-07'],
    [
      '律师函第二封-汉诺数智（四川）科技集团有限公司-华商-20260825(1).pdf',
      '（2026）HS07ZX000658-其他法律文书01',
      '145.94K',
      '2026-08-28',
    ],
    [
      'SIGNED KYLE CHAN & ASSOCIATES DESIGN LIMITED-engagement letter-260825（1）.pdf',
      '',
      '225.37K',
      '2026-08-27',
    ],
    [
      'SIGNED KYLE CHAN & ASSOCIATES DESIGN LIMITED-engagement letter-260825.pdf',
      '（2026）HS08FS001513',
      '813.48K',
      '2026-08-27',
    ],
    [
      '深圳市汉诺数智（深圳）科技有限责任公司VS华商律所-专项法律服务合同-260821(1).doc',
      '',
      '230.50K',
      '2026-08-24',
    ],
    [
      '律师函-汉诺数智（四川）科技集团有限公司-华商-20260721.pdf',
      '（2026）HS07律函第002392号',
      '724.29K',
      '2026-07-21',
    ],
    [
      '律师函-汉诺数智（四川）科技集团有限公司-华商律所-20260716（1）.pdf',
      '',
      '143.28K',
      '2026-07-21',
    ],
    [
      'P.Y. Cheung & Co.VS华商律所-专项法律服务合同-260721.pdf',
      '（2026）HS07ZX000658',
      '785.01K',
      '2026-07-21',
    ],
    [
      '律师函-汉诺数智（四川）科技集团有限公司-华商律所-20260716.pdf',
      '',
      '143.28K',
      '2026-07-20',
    ],
    [
      'P.Y. Cheung & Co.VS华商律所-专项法律服务合同-260716.pdf',
      '',
      '199.35K',
      '2026-07-16',
    ],
    ['代付函.pdf', '', '67.47K', '2026-03-07'],
    [
      '其他工作文书-結他控股有限公司与結他控股有限公司IPO见证（1）.docx',
      '',
      '11.46K',
      '2026-03-02',
    ],
    [
      '其他工作文书-結他控股有限公司与結他控股有限公司IPO见证.docx',
      '',
      '11.11K',
      '2026-03-02',
    ],
    [
      'Guitar Holdings Limited-engagement letter-260204(1).pdf',
      '',
      '998.97K',
      '2026-02-09',
    ],
    [
      'Guitar Holdings Limited-engagement letter-260204（2）.pdf',
      '（2026）HS02FS000235',
      '788.56K',
      '2026-02-06',
    ],
    [
      'Guitar Holdings Limited-engagement letter-260204（1）.doc',
      '',
      '238.50K',
      '2026-02-05',
    ],
    [
      'Guitar Holdings Limited-engagement letter-260204.doc',
      '',
      '238.50K',
      '2026-02-05',
    ],
  ];
  const [rows, setRows] = useState<string[][]>(
    seedRows.length ? seedRows : files,
  );
  const [query, setQuery] = useState('');
  const [includeChildren, setIncludeChildren] = useState(true);
  const [newMenu, setNewMenu] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [activeFolder, setActiveFolder] = useState('我的文件夹');
  const [docType, setDocType] = useState('业务文档');
  const [notice, setNotice] = useState('');
  const [preview, setPreview] = useState<string[] | null>(null);
  const filtered = (activeFolder === '我的文件夹' ? rows : []).filter((r) =>
    r.join(' ').toLowerCase().includes(query.toLowerCase()),
  );
  const addDoc = (name: string) => {
    setRows((items) => [
      [name, '', '—', new Date().toISOString().slice(0, 10)],
      ...items,
    ]);
    setShowDoc(false);
    setNotice(`已创建 ${name}`);
  };
  return (
    <div className="grid gap-5 p-7 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="border border-[#e0e4e8] bg-white p-3">
        <p className="mb-2 px-3 text-xs text-[#87929f]">我的文档</p>
        <div className="rounded bg-[#fff0f0] px-3 py-2.5 text-sm text-[#e45159]">
          ▾ 我的文件夹
        </div>
        <div className="ml-5 px-3 py-2 text-xs text-[#657181]">
          点击右键试试~
        </div>
        {customFolders.map((item) => (
          <div key={item} className="ml-5 px-3 py-2 text-xs text-[#657181]">
            {item}
          </div>
        ))}
        {['我协助修订的版本', '业务协作的文档', '提醒我看的文档'].map(
          (item) => (
            <button
              key={item}
              onClick={() => setActiveFolder(item)}
              className="block w-full px-3 py-2.5 text-left text-sm hover:bg-[#f6f7f8]"
            >
              ▾ {item}
            </button>
          ),
        )}
      </aside>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">{activeFolder}</h2>
            <p className="mt-1 text-xs text-[#84909d]">
              文件和文件夹支持拖动整理
            </p>
          </div>
          <div className="relative flex gap-2">
            {activeFolder === '我的文件夹' && (
              <>
                <button
                  onClick={() => setNotice('请选择要上传的文件')}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  上传
                </button>
                <button
                  onClick={() => setNewMenu((v) => !v)}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  新建
                </button>
              </>
            )}
            {newMenu && (
              <div className="absolute right-0 top-11 z-20 w-44 border border-[#e0e4e8] bg-white py-1 text-sm shadow-lg">
                {[
                  'Office文档',
                  '文字',
                  '演示',
                  '表格',
                  '智能文档',
                  '轻文档',
                  '多维表格',
                  '更多',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setNewMenu(false);
                      setShowDoc(true);
                    }}
                    className="block w-full px-4 py-2 text-left hover:bg-[#f6f7f8]"
                  >
                    {item}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setNewMenu(false);
                    setNotice('请选择要上传的文件');
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-[#f6f7f8]"
                >
                  上传
                </button>
                <button
                  onClick={() => {
                    setNewMenu(false);
                    setShowFolder(true);
                  }}
                  className="block w-full px-4 py-2 text-left hover:bg-[#f6f7f8]"
                >
                  文件夹
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="mb-3 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeChildren}
              onChange={(e) => setIncludeChildren(e.target.checked)}
            />
            含子文件夹
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            placeholder={
              activeFolder === '我协助修订的版本'
                ? '搜索文件名'
                : '文档名称/类型'
            }
          />
        </div>
        <div className="overflow-hidden rounded border border-[#e0e4e8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f7f8] text-xs text-[#657181]">
              <tr>
                <th colSpan={2} className="px-3 py-3">
                  <input type="checkbox" aria-label="全选/反选" />{' '}
                  <span className="ml-2">全选/反选</span>
                </th>
                <th className="px-3 py-3">大小</th>
                <th className="px-3 py-3">创建时间</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r[0]} className="border-t border-[#edf0f2]">
                  <td className="px-3 py-3">
                    <input type="checkbox" />
                  </td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setPreview(r)}
                      className="text-left hover:text-[#e45159]"
                    >
                      {r[0]}
                      {r[1] && (
                        <span className="ml-2 text-xs text-[#87929f]">
                          {r[1]}
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-3 py-3">{r[2]}</td>
                  <td className="px-3 py-3">{r[3]}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setPreview(r)}
                      className="text-xs text-[#657181]"
                    >
                      
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-[#87929f]">共 {filtered.length} 条</p>
        {notice && (
          <button
            onClick={() => setNotice('')}
            className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
          >
            {notice} · 点击关闭
          </button>
        )}
        {showFolder && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold">新建文件夹</h3>
              <div className="mt-4">
                <input
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="请输入文件夹名称"
                  className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    const name = folderName.trim();
                    if (name && !customFolders.includes(name)) {
                      setCustomFolders((items) => [...items, name]);
                    }
                    setShowFolder(false);
                    setFolderName('');
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  确 定
                </button>
              </div>
            </div>
          </div>
        )}
        {showDoc && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">新建文档</h3>
                <button onClick={() => setShowDoc(false)}>×</button>
              </div>
              <p className="mt-4 text-sm">* 文书类别</p>
              <div className="mt-2 flex gap-6 text-sm">
                <label>
                  <input
                    type="radio"
                    checked={docType === '业务文档'}
                    onChange={() => setDocType('业务文档')}
                  />{' '}
                  业务文档
                </label>
                <label>
                  <input
                    type="radio"
                    checked={docType === '所务文档'}
                    onChange={() => setDocType('所务文档')}
                  />{' '}
                  所务文档
                </label>
              </div>
              <p className="mt-4 text-sm">* 关联项目/案源</p>
              <input
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="选择关联项目"
              />
              <div className="mt-4 flex gap-4 border-b pb-2 text-sm">
                <span>全部</span>
                <span>团队模板</span>
                <span>所内模板</span>
                <span>平台模板</span>
              </div>
              <input
                className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="请输入关键词检索"
              />
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {[
                  '委托合同',
                  '所函',
                  '介绍信',
                  '会见信',
                  '见证书',
                  '空白文档',
                  '（风险收费）委托代理合同-模板2026.6.3',
                  '（固定收费）委托代理合同-模板2026.1.8',
                  '代付款说明',
                  '民事所函',
                  '刑事案件委托辩护合同（清洁）',
                  '刑事所函(被告、嫌疑人)',
                  '刑事所函(原告、受害人)',
                  '专项法律服务合同_非诉_范本（清洁）',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => addDoc(item)}
                    className="rounded border border-[#edf0f2] px-3 py-2 text-left hover:bg-[#f6f7f8]"
                  >
                    {item}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-xs text-[#87929f]">文档模板详情</p>
            </div>
          </div>
        )}
        {preview && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex justify-between">
                <h3 className="text-lg font-semibold">{preview[0]}</h3>
                <button onClick={() => setPreview(null)}>×</button>
              </div>
              <p className="mt-3 text-sm text-[#657181]">
                {preview[1]} {preview[2]} · {preview[3]}
              </p>
              <div className="mt-6 rounded bg-[#f6f7f8] p-6 text-sm text-[#87929f]">
                文档预览区域
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function TeamDocumentsWorkspace() {
  const [view, setView] = useState('张博彦律师团队');
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [notice, setNotice] = useState('');
  return (
    <div className="grid gap-5 p-7 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="border border-[#e0e4e8] bg-white p-3">
        <button
          onClick={() => setView('张博彦律师团队')}
          className={`block w-full rounded px-3 py-2.5 text-left text-sm ${view === '张博彦律师团队' ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
        >
          ▾ 张博彦律师团队
        </button>
        <button
          onClick={() => setView('我的贡献')}
          className={`block w-full rounded px-3 py-2.5 text-left text-sm ${view === '我的贡献' ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
        >
          ▾ 我的贡献
        </button>
      </aside>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{view}</h2>
          <button
            onClick={() => setShowUpload(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            上传团队资料
          </button>
        </div>
        <div className="mb-3 flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" defaultChecked />
            含子文件夹
          </label>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            placeholder="搜索文件名"
          />
        </div>
        <div className="overflow-hidden rounded border border-[#e0e4e8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f7f8] text-xs text-[#657181]">
              <tr>
                <th className="px-3 py-3">文档名称</th>
                <th className="px-3 py-3">贡献人</th>
                <th className="px-3 py-3">贡献时间</th>
                <th className="px-3 py-3">大小</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-16 text-center text-sm text-[#87929f]"
                >
                  暂无数据
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        {notice && (
          <button
            onClick={() => setNotice('')}
            className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
          >
            {notice} · 点击关闭
          </button>
        )}
        {showUpload && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">上传团队资料</h3>
                <button onClick={() => setShowUpload(false)}>×</button>
              </div>
              <p className="mt-4 text-sm">* 选择上传文档</p>
              <div className="mt-2 rounded border border-dashed border-[#cfd6dd] p-8 text-center text-sm text-[#87929f]">
                请选择文件上传，或将文件拖拽到下方区域内上传
                <br />
                上传文档
                <br />
                将文件拖至此区域上传
              </div>
              <p className="mt-4 text-sm">* 分享范围</p>
              <input
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="请选择可共享团队"
              />
              <p className="mt-4 text-sm">* 存放文件夹</p>
              <input
                className="mt-2 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="请选择文件夹"
              />
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => {
                    setShowUpload(false);
                    setNotice('已保存文档');
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  保存文档
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function CompanyDocumentsWorkspace() {
  const rows = [
    ['华商执业许可证副本.pdf', '赖静怡', '2026-05-19', '6.96M'],
    [
      'D005《如何查找律所公共资料-企业微信“微盘”》.png',
      '张舒路',
      '2026-03-16',
      '485.74K',
    ],
    ['华商执业许可证正本.pdf', '赖静怡', '2025-08-22', '338.07K'],
    ['华商律所宣传册最新版.pdf', '张铃桢', '2025-02-27', '70.94M'],
    ['综合网络查询+实地调查（模板）.pdf', '张铃桢', '2025-01-15', '159.49K'],
    ['综合网络查询+实地调查（模板）.docx', '张铃桢', '2025-01-15', '24.20K'],
    ['积分明细表（积分详细规则）.pdf', '张铃桢', '2024-12-30', '1.13M'],
    ['2023年审计报告.pdf', '张铃桢', '2024-12-13', '10.55M'],
    ['2021年审计报告.pdf', '张铃桢', '2024-12-13', '3.48M'],
    ['2022年审计报告.pdf', '张铃桢', '2024-12-13', '11.14M'],
    ['部门架构及岗位信息.xlsx', '张铃桢', '2024-12-10', '18.93K'],
    [
      '关于更新证券法律业务风险控制制度的通知_20241210.pdf',
      '张铃桢',
      '2024-12-10',
      '628.42K',
    ],
  ];
  const [view, setView] = useState('律所公共资料');
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const filtered =
    view === '律所公共资料' ? rows.filter((r) => r[0].includes(query)) : [];
  return (
    <div className="grid gap-5 p-7 lg:grid-cols-[210px_minmax(0,1fr)]">
      <aside className="border border-[#e0e4e8] bg-white p-3">
        <p className="px-3 py-2 text-xs text-[#87929f]">律所资料</p>
        <div className="rounded px-3 py-2.5 text-sm font-medium">
          ▾ 广东华商律师事务所
        </div>
        <button
          onClick={() => setView('律所公共资料')}
          className={`ml-4 block w-[calc(100%-1rem)] rounded px-3 py-2.5 text-left text-sm ${view === '律所公共资料' ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
        >
          ▾ 律所公共资料
        </button>
        <button
          onClick={() => setView('我贡献的律所资料')}
          className={`block w-full rounded px-3 py-2.5 text-left text-sm ${view === '我贡献的律所资料' ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
        >
          ▾ 我贡献的律所资料
        </button>
      </aside>
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{view}</h2>
          <button
            onClick={() => setShowUpload(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            上传律所资料
          </button>
        </div>
        <div className="mb-3 flex items-center gap-4">
          {view === '律所公共资料' && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked />
              含子文件夹
            </label>
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            placeholder="搜索文件名"
          />
        </div>
        <div className="overflow-hidden rounded border border-[#e0e4e8] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f7f8] text-xs text-[#657181]">
              <tr>
                <th className="px-3 py-3">文档名称</th>
                <th className="px-3 py-3">贡献人</th>
                <th className="px-3 py-3">贡献时间</th>
                <th className="px-3 py-3">大小</th>
                <th className="px-3 py-3">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r[0]} className="border-t border-[#edf0f2]">
                  <td className="px-3 py-3">{r[0]}</td>
                  <td className="px-3 py-3">{r[1]}</td>
                  <td className="px-3 py-3">{r[2]}</td>
                  <td className="px-3 py-3">{r[3]}</td>
                  <td className="px-3 py-3">
                    <button
                      onClick={() => setShowUpload(false)}
                      className="text-xs text-[#657181]"
                    >
                      预览下载
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {view !== '律所公共资料' || filtered.length === 0 ? (
            <p className="px-3 py-16 text-center text-sm text-[#87929f]">
              暂无数据
            </p>
          ) : (
            <p className="px-3 py-3 text-xs text-[#87929f]">共 107 条</p>
          )}
        </div>
        {showUpload && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">上传律所资料</h3>
                <button onClick={() => setShowUpload(false)}>×</button>
              </div>
              <p className="mt-4 text-sm">
                请选择文件上传，或将文件拖拽到下方区域内上传
              </p>
              <div className="mt-2 rounded border border-dashed border-[#cfd6dd] p-8 text-center text-sm text-[#87929f]">
                上传文档
                <br />
                将文件拖至此区域上传
              </div>
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setShowUpload(false)}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  贡献律所资料
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function DocumentsWorkspace({
  section,
  files,
}: {
  section: string;
  files: string[][];
}) {
  if (section === '我的文档') return <MyDocumentsWorkspace files={files} />;
  if (section === '团队资料') return <TeamDocumentsWorkspace />;
  if (section === '律所资料') return <CompanyDocumentsWorkspace />;
  const [folder, setFolder] = useState('全部文件');
  const [query, setQuery] = useState('');
  const [docRows, setDocRows] = useState(files);
  const docHydrated = useRef(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showFolder, setShowFolder] = useState(false);
  const [newFile, setNewFile] = useState('');
  const [newFolder, setNewFolder] = useState('');
  const [previewFile, setPreviewFile] = useState<string[] | null>(null);
  const [docNotice, setDocNotice] = useState('');
  const [folders, setFolders] = useState([
    '全部文件',
    '我创建的',
    '与我协作',
    '待我审阅',
    '已归档',
  ]);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('hamilton-os.documents');
      if (saved) setDocRows(JSON.parse(saved));
      const savedFolders = window.localStorage.getItem(
        'hamilton-os.document-folders',
      );
      if (savedFolders) setFolders(JSON.parse(savedFolders));
    } catch {
      // Ignore malformed local demo data and keep the seed rows.
    }
    docHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!docHydrated.current) return;
    window.localStorage.setItem(
      'hamilton-os.documents',
      JSON.stringify(docRows),
    );
    window.localStorage.setItem(
      'hamilton-os.document-folders',
      JSON.stringify(folders),
    );
  }, [docRows, folders]);
  const filtered = docRows.filter((row) => {
    const inFolder =
      folder === '全部文件' ||
      (folder === '我创建的' && row[3] === 'Sarah Lin') ||
      (folder === '与我协作' && row[4] === 'WPS 编辑中') ||
      (folder === '待我审阅' && row[4] === '等待审阅') ||
      (folder === '已归档' && row[4] === '已归档');
    return (
      inFolder && row.join(' ').toLowerCase().includes(query.toLowerCase())
    );
  });
  return (
    <div className="grid gap-5 p-7 lg:grid-cols-[190px_minmax(0,1fr)]">
      <aside className="border border-[#e0e4e8] bg-white p-3">
        <p className="px-3 py-2 text-xs font-semibold text-[#87929f]">
          文档空间
        </p>
        {folders.map((item) => (
          <button
            key={item}
            onClick={() => setFolder(item)}
            className={`block w-full rounded px-3 py-2.5 text-left text-sm ${folder === item ? 'bg-[#fff0f0] text-[#e45159]' : 'hover:bg-[#f6f7f8]'}`}
          >
            {item}
          </button>
        ))}
        <p className="mt-5 border-t border-[#edf0f2] px-3 pt-4 text-xs text-[#87929f]">
          {section}
        </p>
      </aside>
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{section}</h2>
            <p className="mt-1 text-xs text-[#84909d]">
              {folder} · 版本、协作、审阅和提醒
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFolder(true)}
              className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              新建文件夹
            </button>
            <button
              onClick={() => setShowUpload(true)}
              className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
            >
              上传
            </button>
          </div>
        </div>
        <div className="mb-3 flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-sm rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            placeholder="文档名称"
          />
          <button className="rounded border border-[#dce1e6] bg-white px-4 text-sm">
            高级筛选
          </button>
        </div>
        <DetailTable
          headers={['文件名', '类型', '版本', '上传人', '状态']}
          rows={filtered}
          footer="支持预览、下载、版本对比、在线协作和 WPS WebOffice 编辑；权限由文档空间、客户和项目成员共同决定。"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {filtered.map((row) => (
            <div key={row[0]} className="flex gap-1">
              <button
                onClick={() => setPreviewFile(row)}
                className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs text-[#657181]"
              >
                预览 · {row[0]}
              </button>
              <button
                onClick={() => setDocNotice(`已生成 ${row[0]} 的下载副本`)}
                className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs text-[#657181]"
              >
                下载
              </button>
              <button
                onClick={() => setDocNotice(`已打开 ${row[0]} 的版本对比`)}
                className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs text-[#657181]"
              >
                版本对比
              </button>
            </div>
          ))}
        </div>
        {docNotice && (
          <button
            onClick={() => setDocNotice('')}
            className="mt-3 rounded bg-[#eef6ff] px-3 py-2 text-xs text-[#3477b9]"
          >
            {docNotice} · 点击关闭
          </button>
        )}
        {showUpload && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold">上传文档</h3>
              <p className="mt-2 text-xs text-[#84909d]">
                上传后可进入版本管理、审阅和 WPS WebOffice 编辑。
              </p>
              <input
                value={newFile}
                onChange={(e) => setNewFile(e.target.value)}
                placeholder="文件名，例如 Due diligence checklist.docx"
                className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowUpload(false)}
                  className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (newFile.trim())
                      setDocRows((items) => [
                        [newFile.trim(), 'DOCX', 'v1', 'Sarah Lin', '等待审阅'],
                        ...items,
                      ]);
                    setNewFile('');
                    setShowUpload(false);
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  上传并登记
                </button>
              </div>
            </div>
          </div>
        )}
        {showFolder && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h3 className="text-lg font-semibold">新建文件夹</h3>
              <p className="mt-2 text-xs text-[#84909d]">
                文件夹用于按客户、项目或审阅阶段组织文档。
              </p>
              <input
                value={newFolder}
                onChange={(e) => setNewFolder(e.target.value)}
                placeholder="文件夹名称"
                className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowFolder(false)}
                  className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    const name = newFolder.trim();
                    if (name && !folders.includes(name)) {
                      setFolders((items) => [...items, name]);
                      setFolder(name);
                    }
                    setNewFolder('');
                    setShowFolder(false);
                  }}
                  className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
                >
                  创建文件夹
                </button>
              </div>
            </div>
          </div>
        )}
        {previewFile && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">文档预览</h3>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="text-xl text-[#87929f]"
                >
                  ×
                </button>
              </div>
              <p className="mt-4 font-medium">{previewFile[0]}</p>
              <p className="mt-2 text-sm text-[#657181]">
                类型：{previewFile[1]} · 版本：{previewFile[2]} · 上传人：
                {previewFile[3]}
              </p>
              <div className="mt-5 rounded bg-[#f6f7f8] p-5 text-sm text-[#7b8794]">
                预览区域（正式环境可接 WPS WebOffice 在线编辑、评论和版本对比）
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="mt-5 rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                关闭预览
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function GeneralWorkspace({ section }: { section: string }) {
  const [items, setItems] = useState<string[][]>(
    section === '通知公告'
      ? [
          [
            '关于 Hamilton FirmOS 试运行的通知',
            '行政部',
            '2026-09-08',
            '全所可见',
            '待阅',
          ],
          [
            '数据安全与外部模型使用规范',
            '合规委员会',
            '2026-09-05',
            '律师可见',
            '已阅',
          ],
        ]
      : [
          [
            '年度知识库更新计划',
            'AI 工作组',
            '进行中',
            'Sarah Lin',
            '项目成员可见',
          ],
          [
            '律所网站与客户门户改版',
            '运营组',
            '待启动',
            'Michael Chen',
            '项目成员可见',
          ],
        ],
  );
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [scope, setScope] = useState('全所可见');
  const rows = items;
  return (
    <div className="p-7">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{section}</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            跨团队协作与行政信息统一入口
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          {section === '通知公告' ? '发布公告' : '新建内部项目'}
        </button>
      </div>
      <DetailTable
        headers={
          section === '通知公告'
            ? ['标题', '发布部门', '发布时间', '可见范围', '阅读状态']
            : ['项目名称', '负责团队', '状态', '项目负责人', '可见范围']
        }
        rows={rows.map((row) => row)}
        footer="公告与内部项目可设置可见范围、阅读状态、负责人和截止时间；重要事项进入消息中心提醒。"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {rows.map(
          (row, index) =>
            section === '通知公告' && (
              <button
                key={row[0]}
                onClick={() =>
                  setItems((all) =>
                    all.map((item, i) =>
                      i === index ? [...item.slice(0, 4), '已阅'] : item,
                    ),
                  )
                }
                className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-xs"
              >
                {row[4] === '待阅'
                  ? `标记已阅 · ${row[0]}`
                  : `已阅 · ${row[0]}`}
              </button>
            ),
        )}
      </div>
      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">
              {section === '通知公告' ? '发布公告' : '新建内部项目'}
            </h3>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="标题或项目名称"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="mt-3 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
            >
              <option>全所可见</option>
              <option>律师可见</option>
              <option>项目成员可见</option>
              <option>仅管理层可见</option>
            </select>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (title.trim()) {
                    setItems((all) => [
                      [
                        title.trim(),
                        section === '通知公告' ? '行政部' : '运营组',
                        '2026-09-08',
                        scope,
                        section === '通知公告' ? '待阅' : '待启动',
                      ],
                      ...all,
                    ]);
                    publishNotification({
                      title:
                        section === '通知公告'
                          ? '新公告待阅'
                          : '内部项目已创建',
                      body: title.trim(),
                      category: section === '通知公告' ? '公告' : '项目',
                      target: section,
                    });
                  }
                  setTitle('');
                  setShowForm(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                发布并登记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplicationHallWorkspace({ initialView }: { initialView: string }) {
  const [view, setView] = useState(initialView);
  const [selectedFlow, setSelectedFlow] = useState('');
  const [submitted, setSubmitted] = useState<string[]>([]);
  const [notice, setNotice] = useState('');
  const [ccSubmitted, setCcSubmitted] = useState<string[]>([]);
  const [ccCurrentUser, setCcCurrentUser] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [pendingTab, setPendingTab] = useState('全部');
  const [changeCategoryOpen, setChangeCategoryOpen] = useState(false);
  const [changeCategory, setChangeCategory] = useState('审批类别');
  useEffect(() => {
    try {
      const saved = JSON.parse(
        window.localStorage.getItem('hamilton-os.approval-submitted') ?? '[]',
      ) as string[];
      if (Array.isArray(saved)) setSubmitted(saved);
      const ccSaved = JSON.parse(
        window.localStorage.getItem('hamilton-os.approval-cc') ?? '[]',
      ) as string[];
      if (Array.isArray(ccSaved)) setCcSubmitted(ccSaved);
    } catch {
      // Keep the current session when browser storage is unavailable.
    }
  }, []);
  const business = [
    '项目立案',
    '批量子项目立案',
    '案件变更',
    '案件作废',
    '结案归档',
    '案源报备',
    '案源变更',
    '案源终止跟进',
    '客户更名',
    '卷宗借阅',
    '文书用印',
    '文档变更',
    '文档作废',
    '批量子项目用印',
    '批量项目作废',
  ];
  const finance = [
    '开票',
    '退票/冲红',
    '解约/退款',
    '取消解约',
    '报销',
    '支付',
    '台账提款',
  ];
  const admin = ['日常申请', '外勤', '出差', '请假', '采购', '其他'];
  const nav = [
    '申请大厅',
    '待处理的',
    '我发起的',
    '已处理的',
    '抄送我的',
    '变更审批人',
  ];
  const pick = (flow: string) => setSelectedFlow(flow);
  const submit = () => {
    if (!selectedFlow) return;
    publishNotification({
      title: '审批申请已提交',
      body: `${selectedFlow}申请已进入审批流程`,
      category: '审批',
      target: '我发起的',
    });
    setSubmitted((items) => {
      const next = [...items, selectedFlow];
      window.localStorage.setItem(
        'hamilton-os.approval-submitted',
        JSON.stringify(next),
      );
      return next;
    });
    if (ccCurrentUser) {
      setCcSubmitted((items) => {
        const next = [...items, selectedFlow];
        window.localStorage.setItem(
          'hamilton-os.approval-cc',
          JSON.stringify(next),
        );
        return next;
      });
    }
    setCcCurrentUser(false);
    setSelectedFlow('');
  };
  const card = (label: string) => (
    <button
      key={label}
      onClick={() => pick(label)}
      className="flex items-center gap-3 rounded-lg border border-[#edf0f2] bg-white p-3 text-left hover:border-[#f1666d] hover:bg-[#fff8f8]"
    >
      <span className="grid size-10 place-items-center rounded-xl bg-[#e9f8fb] text-[#2bb6c8]">
        ▣
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
  return (
    <div className="p-6">
      <div className="flex min-h-[calc(100vh-130px)] rounded-lg border border-[#edf0f2] bg-white">
        <aside className="w-44 shrink-0 border-r border-[#edf0f2] p-3">
          <p className="mb-3 px-2 text-lg font-medium">流程审批</p>
          {nav.map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={`mb-1 flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm ${view === item ? 'bg-[#fff0f1] text-[#e45159]' : 'text-[#52606d] hover:bg-[#f7f8fa]'}`}
            >
              ▣ {item}
            </button>
          ))}
        </aside>
        <main className="min-w-0 flex-1 bg-[#f7f8fa] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                {view === '申请大厅' ? '申请大厅' : view}
              </h1>
              <p className="mt-1 text-xs text-[#8993a0]">广东华商律师事务所</p>
            </div>
            {view === '申请大厅' ? (
              <span className="text-sm text-[#8993a0]">
                {submitted.length} 项已提交
              </span>
            ) : (
              <button
                onClick={() => setView('申请大厅')}
                className="rounded bg-[#f1666d] px-5 py-2 text-sm text-white"
              >
                发起新申请
              </button>
            )}
          </div>
          {view === '申请大厅' ? (
            <>
              <div className="mb-5 grid grid-cols-4 gap-3">
                {[
                  ['待处理的', '0'],
                  [
                    '我发起的',
                    `${submitted.length}处理中   ${submitted.length}已处理   0被退回`,
                  ],
                  ['我处理过的', '0'],
                  ['抄送给我的', '0/0'],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="rounded border border-[#edf0f2] bg-white p-4"
                  >
                    <p className="text-sm text-[#697586]">{label}</p>
                    <p className="mt-2 text-lg font-semibold">{count}</p>
                  </div>
                ))}
              </div>
              <h2 className="mb-3 text-base font-semibold">业务类</h2>
              <div className="grid grid-cols-5 gap-3">{business.map(card)}</div>
              <h2 className="mb-3 mt-6 text-base font-semibold">财务类</h2>
              <div className="grid grid-cols-5 gap-3">{finance.map(card)}</div>
              <h2 className="mb-3 mt-6 text-base font-semibold">行政类</h2>
              <div className="grid grid-cols-5 gap-3">{admin.map(card)}</div>
            </>
          ) : view === '待处理的' ? (
            <div className="rounded border border-[#edf0f2] bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder="工作名"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <input
                  placeholder="申请人"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                {['全部', '立案', '文档', '结案', '案件变更', '案源报备'].map(
                  (tab) => (
                    <button
                      key={tab}
                      onClick={() => setPendingTab(tab)}
                      className={`rounded px-3 py-2 text-sm ${pendingTab === tab ? 'bg-[#f1666d] text-white' : 'border text-[#697586]'}`}
                    >
                      {tab}
                    </button>
                  ),
                )}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f7f8fa] text-left text-[#697586]">
                    <tr>
                      {[
                        '获取时间',
                        '类别',
                        '工作名',
                        '申请人',
                        '申请时间',
                        '审批状态',
                        '操作',
                      ].map((header) => (
                        <th key={header} className="px-3 py-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody />
                </table>
                <div className="py-24 text-center text-sm text-[#a1a8b0]">
                  暂无数据
                </div>
              </div>
            </div>
          ) : view === '我发起的' ? (
            <div className="rounded border border-[#edf0f2] bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder="工作名"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <button
                  onClick={() =>
                    setPendingTab(pendingTab === '审批类别' ? '' : '审批类别')
                  }
                  className="h-9 w-48 rounded border px-3 text-left text-sm text-[#697586]"
                >
                  审批类别⌄
                </button>
                <button
                  onClick={() =>
                    setPendingTab(pendingTab === '审批状态' ? '' : '审批状态')
                  }
                  className="h-9 w-48 rounded border px-3 text-left text-sm text-[#697586]"
                >
                  审批状态⌄
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f7f8fa] text-left text-[#697586]">
                    <tr>
                      {[
                        '申请时间',
                        '类别',
                        '工作名',
                        '审批时间',
                        '审批状态',
                        '操作',
                      ].map((header) => (
                        <th key={header} className="px-3 py-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {submitted
                      .filter((item) => item.includes(pendingQuery))
                      .map((item, index) => (
                        <tr
                          key={`${item}-${index}`}
                          className="border-t border-[#edf0f2]"
                        >
                          <td className="px-3 py-3">2026-09-08 10:00:00</td>
                          <td className="px-3 py-3">业务申请</td>
                          <td className="px-3 py-3">{item}申请</td>
                          <td className="px-3 py-3">-</td>
                          <td className="px-3 py-3 text-[#e19a3c]">审批中</td>
                          <td className="px-3 py-3">
                            <button
                              onClick={() => setNotice(`查看：${item}申请`)}
                              className="text-[#1f5f9b]"
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!submitted.length && (
                  <div className="py-24 text-center text-sm text-[#a1a8b0]">
                    暂无数据
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-[#8993a0]">
                共 {submitted.length} 条，每页显示 20 条，共 1 页
              </p>
            </div>
          ) : view === '抄送我的' ? (
            <div className="rounded border border-[#edf0f2] bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder="工作名"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <input
                  placeholder="申请人"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <button
                  onClick={() => setPendingTab('审批类别')}
                  className="h-9 w-40 rounded border px-3 text-left text-sm text-[#697586]"
                >
                  审批类别⌄
                </button>
                <button
                  onClick={() => setPendingTab('查阅状态')}
                  className="h-9 w-40 rounded border px-3 text-left text-sm text-[#697586]"
                >
                  查阅状态⌄
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-[#8993a0]">
                <span className="rounded bg-[#f3f4f6] px-2 py-1">送达时间</span>
                <button className="text-[#8993a0]">开始日期</button>
                <span>~</span>
                <button className="text-[#8993a0]">结束日期</button>
                <span className="rounded bg-[#f3f4f6] px-2 py-1">
                  查阅状态 未读 ×
                </span>
                <span>已筛选 {ccSubmitted.length} 条</span>
                <button
                  onClick={() => {
                    setPendingQuery('');
                    setPendingTab('全部');
                  }}
                  className="text-[#697586]"
                >
                  ♢ 清空
                </button>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f7f8fa] text-left text-[#697586]">
                    <tr>
                      {[
                        '送达时间',
                        '类别',
                        '申请人',
                        '工作名',
                        '抄送人',
                        '查阅状态',
                        '阅读时间',
                      ].map((header) => (
                        <th key={header} className="px-3 py-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ccSubmitted
                      .filter((item) => item.includes(pendingQuery))
                      .map((item, index) => (
                        <tr
                          key={`${item}-${index}`}
                          className="border-t border-[#edf0f2]"
                        >
                          <td className="px-3 py-3">2026-09-08 10:00:00</td>
                          <td className="px-3 py-3">业务申请</td>
                          <td className="px-3 py-3">Sarah Lin</td>
                          <td className="px-3 py-3">{item}申请</td>
                          <td className="px-3 py-3">当前账号</td>
                          <td className="px-3 py-3 text-[#e19a3c]">未读</td>
                          <td className="px-3 py-3">-</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {!ccSubmitted.length && (
                  <div className="py-24 text-center text-sm text-[#a1a8b0]">
                    暂无数据
                  </div>
                )}
              </div>
              <p className="mt-3 text-sm text-[#8993a0]">
                共 {ccSubmitted.length} 条，每页显示 20 条，共 1 页
              </p>
            </div>
          ) : view === '变更审批人' ? (
            <div className="rounded border border-[#edf0f2] bg-white p-4">
              <div className="relative flex flex-wrap gap-2">
                <input
                  value={pendingQuery}
                  onChange={(e) => setPendingQuery(e.target.value)}
                  placeholder="工作名"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <input
                  placeholder="申请人"
                  className="h-9 w-48 rounded border px-3 text-sm"
                />
                <button
                  onClick={() => setChangeCategoryOpen((open) => !open)}
                  className="h-9 w-48 rounded border px-3 text-left text-sm text-[#697586]"
                >
                  {changeCategory}⌄
                </button>
                {changeCategoryOpen && (
                  <div className="absolute left-[392px] top-10 z-20 w-64 rounded border border-[#e5e7eb] bg-white p-3 text-sm shadow-lg">
                    <p className="mb-2 font-medium text-[#52606d]">业务类</p>
                    <div className="grid grid-cols-2 gap-2 text-[#697586]">
                      {[
                        '立案',
                        '案件变更',
                        '案件作废',
                        '客户更名',
                        '结案',
                        '案源报备',
                        '案源变更',
                        '案源终止跟进',
                        '卷宗借阅',
                        '文档',
                        '业务文档',
                        '行政文档',
                        '文档变更',
                        '文档作废',
                        '批量申请立案',
                        '批量文档审批',
                        '批量项目作废',
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setChangeCategory(item);
                            setChangeCategoryOpen(false);
                          }}
                          className="rounded px-2 py-1 text-left hover:bg-[#fff0f1]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-3 font-medium text-[#52606d]">
                      财务类
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[#697586]">
                      {[
                        '开票',
                        '发票冲红/作废',
                        '报销',
                        '支付',
                        '解约/退款',
                        '退款支付',
                        '取消解约',
                        '提款',
                        '成本票申报',
                      ].map((item) => (
                        <button
                          key={item}
                          onClick={() => {
                            setChangeCategory(item);
                            setChangeCategoryOpen(false);
                          }}
                          className="rounded px-2 py-1 text-left hover:bg-[#fff0f1]"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <p className="mb-2 mt-3 font-medium text-[#52606d]">
                      行政类
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[#697586]">
                      {['日常', '采购', '外勤', '出差', '请假', '其他'].map(
                        (item) => (
                          <button
                            key={item}
                            onClick={() => {
                              setChangeCategory(item);
                              setChangeCategoryOpen(false);
                            }}
                            className="rounded px-2 py-1 text-left hover:bg-[#fff0f1]"
                          >
                            {item}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[900px] text-sm">
                  <thead className="bg-[#f7f8fa] text-left text-[#697586]">
                    <tr>
                      {[
                        '类别',
                        '申请人',
                        '工作名',
                        '当前任务',
                        '审批人',
                        '送达时间',
                        '操作',
                      ].map((header) => (
                        <th key={header} className="px-3 py-3">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody />
                </table>
                <div className="py-24 text-center text-sm text-[#a1a8b0]">
                  暂无数据
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded border border-[#edf0f2] bg-white p-8 text-center text-sm text-[#8993a0]">
              {view === '我发起的' && submitted.length
                ? submitted.map((item) => (
                    <p key={item} className="mb-2 text-left text-[#52606d]">
                      {item} · 处理中
                    </p>
                  ))
                : '暂无数据'}
            </div>
          )}
        </main>
      </div>
      {selectedFlow && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{selectedFlow}</h3>
              <button onClick={() => setSelectedFlow('')}>×</button>
            </div>
            <p className="mt-3 text-sm text-[#697586]">
              已选择申请流程，请确认后提交。
            </p>
            <textarea
              placeholder="申请说明"
              className="mt-4 h-24 w-full rounded border p-3 text-sm"
            />
            <label className="mt-3 flex items-center gap-2 text-sm text-[#52606d]">
              <input
                type="checkbox"
                checked={ccCurrentUser}
                onChange={(e) => setCcCurrentUser(e.target.checked)}
              />
              抄送当前账号
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setSelectedFlow('')}
                className="rounded border px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={submit}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalWorkspace({
  tasks,
  setTasks,
}: {
  tasks: string[][];
  setTasks: React.Dispatch<React.SetStateAction<string[][]>>;
}) {
  const [view, setView] = useState('待我审批');
  const [showRequest, setShowRequest] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectIndex, setRejectIndex] = useState(0);
  const [rejectReason, setRejectReason] = useState('');
  const [requestType, setRequestType] = useState('项目立项申请');
  const [requestProject, setRequestProject] = useState(
    'Northstar Holdings IPO',
  );
  const [requestNote, setRequestNote] = useState('');
  const [items, setItems] = useState([
    ['外部律师协作发布', 'Northstar Holdings IPO', 'Sarah Lin', '待审批'],
    ['合同文档审批', 'Orion BioTech v. Atlas', 'Michael Chen', '待审批'],
    ['项目立案申请', 'Aster Mobility market entry', 'Evelyn Park', '已通过'],
  ]);
  const approvalHydrated = useRef(false);
  useEffect(() => {
    const saved = window.localStorage.getItem('hamilton-os.approvals');
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // Keep seed approvals when the local cache is invalid.
      }
    }
    approvalHydrated.current = true;
  }, []);
  useEffect(() => {
    if (approvalHydrated.current)
      window.localStorage.setItem(
        'hamilton-os.approvals',
        JSON.stringify(items),
      );
  }, [items]);
  function decide(index: number, status: string) {
    setItems((rows) =>
      rows.map((row, rowIndex) =>
        rowIndex === index ? [row[0], row[1], row[2], status] : row,
      ),
    );
    const target = items[index];
    if (target)
      setTasks((rows) =>
        rows.map((task) =>
          task[0] === `审批：${target[0]}`
            ? [...task.slice(0, 4), status === '已通过' ? '已完成' : '需补充']
            : task,
        ),
      );
  }
  const visibleItems = items.filter((row) =>
    view === '待我审批'
      ? row[3] === '待审批'
      : view === '已处理'
        ? row[3] !== '待审批'
        : true,
  );
  return (
    <div className="p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">流程审批</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            业务、合同、财务和行政流程统一处理
          </p>
        </div>
        <button
          onClick={() => setShowRequest(true)}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          发起申请
        </button>
      </div>
      <div className="mb-5 grid gap-3 md:grid-cols-3">
        {[
          ['我的申请', String(items.length)],
          [
            '待我审批',
            String(items.filter((row) => row[3] === '待审批').length),
          ],
          ['已处理', String(items.filter((row) => row[3] !== '待审批').length)],
        ].map(([label, count]) => (
          <div
            key={label}
            className="rounded border border-[#e0e4e8] bg-white p-4"
          >
            <p className="text-sm text-[#7c8794]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[#e45159]">
              {count}
            </p>
          </div>
        ))}
      </div>
      <div className="mb-4 flex gap-2">
        {['待我审批', '我的申请', '已处理', '抄送我的'].map((item) => (
          <button
            key={item}
            onClick={() => setView(item)}
            className={`rounded px-4 py-2 text-sm ${view === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <section className="rounded border border-[#e0e4e8] bg-white">
        <div className="divide-y divide-[#edf0f2]">
          {visibleItems.map((row) => {
            const index = items.indexOf(row);
            return (
              <div
                key={`${row[0]}-${index}`}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium">{row[0]}</p>
                  <p className="mt-1 text-xs text-[#84909d]">
                    {row[1]} · 申请人：{row[2]}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span
                    className={
                      row[3] === '已通过'
                        ? 'text-[#2a9b67]'
                        : row[3] === '已驳回'
                          ? 'text-[#d0525b]'
                          : 'text-[#e19a3c'
                    }
                  >
                    {row[3]}
                  </span>
                  {row[3] === '待审批' && (
                    <>
                      <button
                        onClick={() => decide(index, '已通过')}
                        className="rounded bg-[#eaf7ef] px-3 py-1 text-xs text-[#258956]"
                      >
                        通过
                      </button>
                      <button
                        onClick={() => {
                          setRejectIndex(index);
                          setShowReject(true);
                        }}
                        className="rounded bg-[#fff0f0] px-3 py-1 text-xs text-[#d0525b]"
                      >
                        驳回
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="border-t border-[#edf0f2] px-4 py-3 text-xs text-[#8c97a4]">
          当前视图：{view}。审批动作需记录审批人、时间、意见和前后状态。
        </p>
      </section>
      {showRequest && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">发起审批申请</h3>
            <div className="mt-4 space-y-3">
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>项目立项申请</option>
                <option>合同文档审批</option>
                <option>文档盖章申请</option>
                <option>客户入库申请</option>
              </select>
              <select
                value={requestProject}
                onChange={(e) => setRequestProject(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>Northstar Holdings IPO</option>
                <option>Orion BioTech v. Atlas</option>
                <option>Aster Mobility market entry</option>
              </select>
              <textarea
                value={requestNote}
                onChange={(e) => setRequestNote(e.target.value)}
                placeholder="申请说明 / 附件说明"
                className="h-24 w-full rounded border border-[#dce1e6] p-3 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRequest(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (requestNote.trim()) {
                    setItems((rows) => [
                      [requestType, requestProject, 'Sarah Lin', '待审批'],
                      ...rows,
                    ]);
                    setTasks((rows) => [
                      [
                        `审批：${requestType}`,
                        requestProject,
                        'Sarah Lin',
                        '2026-09-12',
                        '进行中',
                        'Sarah Lin',
                        '审批',
                      ],
                      ...rows,
                    ]);
                  }
                  setRequestNote('');
                  setShowRequest(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
      {showReject && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">填写退回原因</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="请填写退回原因，申请人将收到通知"
              className="mt-4 h-24 w-full rounded border border-[#dce1e6] p-3 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowReject(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    decide(rejectIndex, '已驳回');
                    setShowReject(false);
                    setRejectReason('');
                  }
                }}
                className="rounded bg-[#d0525b] px-4 py-2 text-sm text-white"
              >
                确认退回
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CollaborationWorkspace() {
  const [filter, setFilter] = useState('全部');
  const [bidState, setBidState] = useState<Record<string, string>>({});
  const [showRegister, setShowRegister] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [publishText, setPublishText] = useState('');
  const [registered, setRegistered] = useState(false);
  const collaborationHydrated = useRef(false);
  const matters = [
    [
      'US litigation support · New York State Court',
      '纽约州商事诉讼 · 需要出庭律师',
      '出庭 / 商事诉讼',
      '2026-09-18',
      'USD 8,000–15,000',
    ],
    [
      'SEC filing review · Delaware corporation',
      '特拉华公司 SEC 文件审阅及意见回复',
      '资本市场 / SEC',
      '2026-09-25',
      'USD 4,000–8,000',
    ],
    [
      'Cross-border trademark dispute',
      '跨境商标争议 · 需要美国知识产权律师',
      '知识产权',
      '2026-10-02',
      'USD 3,000–6,000',
    ],
  ];
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(
        'hamilton-os.collaboration-bids',
      );
      if (saved) setBidState(JSON.parse(saved));
      if (
        window.localStorage.getItem(
          'hamilton-os.external-lawyer-registered',
        ) === '1'
      )
        setRegistered(true);
    } catch {
      // Keep the demo seed state when local cache is invalid.
    }
    collaborationHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!collaborationHydrated.current) return;
    window.localStorage.setItem(
      'hamilton-os.collaboration-bids',
      JSON.stringify(bidState),
    );
    window.localStorage.setItem(
      'hamilton-os.external-lawyer-registered',
      registered ? '1' : '0',
    );
  }, [bidState, registered]);
  return (
    <div className="p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">外所协办项目</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            AI 将案源律师的中文需求整理并翻译为英文，供经认证的外部律师投标
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRegister(true)}
            className="rounded border border-[#dce1e6] bg-white px-4 py-2 text-sm"
          >
            {registered ? '已提交认证资料' : '律师注册 / 认证'}
          </button>
          <button
            onClick={() => setShowPublish(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            发布协作需求
          </button>
        </div>
      </div>
      <section className="mb-5 rounded border border-[#d7e5ff] bg-[#f5f9ff] p-4 text-sm text-[#506d91]">
        <p className="font-medium">协作安全提示</p>
        <p className="mt-1 text-xs leading-6">
          公开列表只展示脱敏后的案件摘要；客户身份、原始材料和完整案情需在选定协作律师并完成权限审批后开放。
        </p>
      </section>
      <div className="mb-4 flex gap-2">
        {['全部', '待投标', '评审中', '已选定'].map((item) => (
          <button
            key={item}
            onClick={() => setFilter(item)}
            className={`rounded px-4 py-2 text-sm ${filter === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {matters
          .filter(
            (matter) =>
              filter === '全部' ||
              (filter === '待投标' && !bidState[matter[0]]) ||
              (filter === '评审中' && bidState[matter[0]] === '已提交投标'),
          )
          .map((matter, index) => {
            const state = bidState[matter[0]] || '待投标';
            return (
              <article
                key={matter[0]}
                className="rounded border border-[#e0e4e8] bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-[#eef4ff] px-2 py-1 text-xs text-[#3976e8]">
                        AI 英文需求
                      </span>
                      <span className="text-xs text-[#8b96a3]">
                        {matter[2]}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold">{matter[0]}</h3>
                    <p className="mt-2 text-sm text-[#687686]">{matter[1]}</p>
                  </div>
                  <span className="rounded bg-[#fff5e8] px-2.5 py-1 text-xs text-[#b87824]">
                    {state}
                  </span>
                </div>
                <div className="mt-4 grid gap-2 text-xs text-[#7b8794] sm:grid-cols-3">
                  <span>截止：{matter[3]}</span>
                  <span>预算：{matter[4]}</span>
                  <span>已收到 {index + 2} 份投标</span>
                </div>
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <button className="rounded border border-[#dce1e6] px-3 py-1.5 text-xs">
                    查看英文需求
                  </button>
                  <button
                    onClick={() =>
                      setBidState((s) => ({ ...s, [matter[0]]: '已提交投标' }))
                    }
                    className="rounded bg-[#f1666d] px-3 py-1.5 text-xs text-white"
                  >
                    提交投标
                  </button>
                </div>
              </article>
            );
          })}
      </div>
      <p className="mt-4 text-xs text-[#8c97a4]">
        外部律师可凭执业地区与 Bar Number
        注册；平台审核账号后方可查看公开需求。合同与付款状态留存在平台，结算可线下完成。
      </p>
      {showRegister && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">外部律师注册与认证</h3>
              <button
                onClick={() => setShowRegister(false)}
                className="text-xl text-[#87929f]"
              >
                ×
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-[#7f8b98]">
              仅需填写执业地区和 Bar
              Number；提交后由平台管理员审核，审核通过才可查看完整需求。
            </p>
            <div className="mt-5 space-y-3">
              <input
                className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="执业地区，例如 New York"
              />
              <input
                className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="Bar Number"
              />
              <input
                className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                placeholder="律师姓名 / 律所名称"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowRegister(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setRegistered(true);
                  setShowRegister(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                提交认证
              </button>
            </div>
          </div>
        </div>
      )}
      {showPublish && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">发布跨境协作需求</h3>
            <p className="mt-2 text-xs text-[#84909d]">
              AI 将中文案情凝练为英文摘要，发布前由案源律师确认并完成脱敏。
            </p>
            <textarea
              value={publishText}
              onChange={(e) => setPublishText(e.target.value)}
              className="mt-4 h-28 w-full rounded border border-[#dce1e6] p-3 text-sm"
              placeholder="请输入案件方向、所需执业地区、工作范围和预算"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowPublish(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setPublishText('');
                  setShowPublish(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                AI 整理并提交审核
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DirectoryWorkspace({
  rows,
  setRows,
  positions,
  setPositions,
}: {
  rows: string[][];
  setRows: React.Dispatch<React.SetStateAction<string[][]>>;
  positions: string[][];
  setPositions: React.Dispatch<React.SetStateAction<string[][]>>;
}) {
  const [tab, setTab] = useState('组织架构');
  const [showMember, setShowMember] = useState(false);
  const [showPosition, setShowPosition] = useState(false);
  const [name, setName] = useState('');
  const [firm, setFirm] = useState('Hamilton Weiss PLLC');
  const [office, setOffice] = useState('New York Office');
  const [department, setDepartment] = useState('Capital Markets');
  const [team, setTeam] = useState('Capital Markets Team');
  const [position, setPosition] = useState('律师');
  const [manager, setManager] = useState('Sarah Lin');
  const [newPosition, setNewPosition] = useState('');
  const [showPolicy, setShowPolicy] = useState(false);
  const [policyPosition, setPolicyPosition] = useState('律师');
  const [approvalScope, setApprovalScope] = useState('本团队');
  const [dataScope, setDataScope] = useState('项目成员可见');
  const [canAssign, setCanAssign] = useState(false);
  const [canApprove, setCanApprove] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(true);
  const [profile, setProfile] = useState({
    email: '',
    phone: '',
    bar: '',
    education: '',
    bio: '',
  });
  const directoryHydrated = useRef(false);
  const businessLines: Record<string, string[]> = {
    'New York Office': ['Capital Markets', 'Litigation', 'Corporate Services'],
    'Hong Kong Office': ['Capital Markets', 'Corporate Services'],
    'Shenzhen Office': ['Capital Markets', 'Corporate Services'],
  };
  const teams: Record<string, string[]> = {
    'Capital Markets': ['Capital Markets Team', 'IPO Team', 'Securities Team'],
    Litigation: ['Commercial Litigation Team', 'IP Team'],
    'Corporate Services': ['M&A Team', 'General Counsel Team'],
  };
  useEffect(() => {
    try {
      const savedRows = window.localStorage.getItem('hamilton-os.directory');
      if (savedRows) setRows(JSON.parse(savedRows));
      const savedPositions = window.localStorage.getItem(
        'hamilton-os.positions',
      );
      if (savedPositions) setPositions(JSON.parse(savedPositions));
    } catch {
      // Keep seeded directory data when local cache is unavailable.
    }
    directoryHydrated.current = true;
  }, []);
  useEffect(() => {
    if (!directoryHydrated.current) return;
    window.localStorage.setItem('hamilton-os.directory', JSON.stringify(rows));
    window.localStorage.setItem(
      'hamilton-os.positions',
      JSON.stringify(positions),
    );
  }, [rows, positions]);
  useEffect(() => {
    const savedProfile = window.localStorage.getItem('hamilton-os.profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && typeof parsed === 'object')
          setProfile((value) => ({ ...value, ...parsed }));
      } catch {
        // Ignore an invalid local profile cache.
      }
    }
    if (window.localStorage.getItem('hamilton-os.profile.complete') === '1')
      setShowProfileSetup(false);
  }, []);

  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">通讯录</h2>
          <p className="mt-1 text-xs text-[#84909d]">
            律所 → 办公室 → 业务线 → 团队 → 职位 → 成员
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProfileSetup(true)}
            className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
          >
            个人资料
          </button>
          <button
            onClick={() => setShowPosition(true)}
            className="rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
          >
            新建职位
          </button>
          <button
            onClick={() => setShowMember(true)}
            className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
          >
            添加成员
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        {['组织架构', '成员列表', '职位与汇报关系'].map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded px-4 py-2 text-sm ${tab === item ? 'bg-[#f1666d] text-white' : 'border border-[#dce1e6] bg-white'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === '组织架构' && (
        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="border border-[#e0e4e8] bg-white p-4 text-sm">
            <p className="font-semibold">Hamilton Weiss PLLC</p>
            {[
              'New York Office',
              'Capital Markets',
              'Litigation',
              'Corporate Services',
            ].map((item) => (
              <div
                key={item}
                className="mt-3 border-l-2 border-[#f1666d] pl-3 text-[#657181]"
              >
                {item}
              </div>
            ))}
          </div>
          <DetailTable
            headers={[
              '成员',
              '办公室',
              '业务线',
              '职位',
              '直属上级',
              '账号状态',
            ]}
            rows={rows}
            footer="组织关系将作为项目、任务、日志、审批和客户档案权限的统一来源。"
          />
        </section>
      )}
      {tab === '成员列表' && (
        <DetailTable
          headers={['成员', '办公室', '业务线', '职位', '直属上级', '账号状态']}
          rows={rows}
          footer="成员可被邀请加入项目，并依据职位和汇报关系获得相应审批权限。"
        />
      )}
      {tab === '职位与汇报关系' && (
        <section className="rounded border border-[#e1e5e9] bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f6f7f8] text-xs text-[#73808e]">
              <tr>
                <th className="px-4 py-3">职位</th>
                <th className="px-4 py-3">适用层级</th>
                <th className="px-4 py-3">默认权限</th>
                <th className="px-4 py-3">配置</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((row) => (
                <tr key={row[0]} className="border-t border-[#edf0f2]">
                  <td className="px-4 py-3">{row[0]}</td>
                  <td className="px-4 py-3 text-[#657181]">{row[1]}</td>
                  <td className="px-4 py-3 text-[#657181]">{row[2]}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => {
                        setPolicyPosition(row[0]);
                        setShowPolicy(true);
                      }}
                      className="text-[#d9525b]"
                    >
                      配置权限
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[#edf0f2] px-4 py-3 text-xs text-[#8c97a4]">
            职位是权限模板；具体权限可由管理员按律所、办公室、团队和项目进一步收紧。
          </p>
        </section>
      )}
      {showPolicy && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">
              配置职位权限 · {policyPosition}
            </h3>
            <div className="mt-4 space-y-3">
              <label className="block text-sm">
                审批范围
                <select
                  value={approvalScope}
                  onChange={(e) => setApprovalScope(e.target.value)}
                  className="mt-1 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>本团队</option>
                  <option>本办公室</option>
                  <option>全所</option>
                </select>
              </label>
              <label className="block text-sm">
                数据可见范围
                <select
                  value={dataScope}
                  onChange={(e) => setDataScope(e.target.value)}
                  className="mt-1 w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
                >
                  <option>仅本人</option>
                  <option>项目成员可见</option>
                  <option>本办公室可见</option>
                  <option>全所可见</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={canAssign}
                  onChange={(e) => setCanAssign(e.target.checked)}
                />{' '}
                可向下级职位分配任务
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={canApprove}
                  onChange={(e) => setCanApprove(e.target.checked)}
                />{' '}
                可审批日志、项目和文档
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowPolicy(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setPositions((items) =>
                    items.map((row) =>
                      row[0] === policyPosition
                        ? [
                            row[0],
                            row[1],
                            `${approvalScope} · ${dataScope}${canAssign ? ' · 可分配任务' : ''}${canApprove ? ' · 可审批' : ''}`,
                          ]
                        : row,
                    ),
                  );
                  setShowPolicy(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存权限
              </button>
            </div>
          </div>
        </div>
      )}
      {profile.email && (
        <section className="mt-4 border border-[#e0e4e8] bg-white p-4 text-sm">
          <p className="font-semibold">当前用户档案 · Sarah Lin</p>
          <p className="mt-2 text-xs text-[#657181]">
            {profile.email} · {profile.phone} · Bar {profile.bar}
          </p>
          <p className="mt-1 text-xs text-[#8c97a4]">
            教育经历：{profile.education || '未填写'}　专业简介：
            {profile.bio || '未填写'}
          </p>
        </section>
      )}
      {showProfileSetup && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">首次使用 · 完善个人资料</h3>
            <p className="mt-2 text-xs text-[#7f8995]">
              个人资料用于账号建档、项目邀请、任务分配和审批权限匹配。
            </p>
            <div className="mt-4 space-y-3">
              {(
                [
                  ['email', '工作邮箱'],
                  ['phone', '联系电话'],
                  ['bar', '执业地区 / Bar Number'],
                  ['education', '教育经历'],
                ] as const
              ).map(([key, placeholder]) => (
                <input
                  key={key}
                  value={profile[key]}
                  onChange={(e) =>
                    setProfile((v) => ({ ...v, [key]: e.target.value }))
                  }
                  placeholder={placeholder}
                  className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
                />
              ))}
              <textarea
                value={profile.bio}
                onChange={(e) =>
                  setProfile((v) => ({ ...v, bio: e.target.value }))
                }
                placeholder="个人简历 / 专业方向 / 语言能力"
                className="h-24 w-full rounded border border-[#dce1e6] p-3 text-sm"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowProfileSetup(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                稍后填写
              </button>
              <button
                onClick={() => {
                  if (
                    profile.email.trim() &&
                    profile.phone.trim() &&
                    profile.bar.trim()
                  ) {
                    window.localStorage.setItem(
                      'hamilton-os.profile',
                      JSON.stringify(profile),
                    );
                    window.localStorage.setItem(
                      'hamilton-os.profile.complete',
                      '1',
                    );
                    setShowProfileSetup(false);
                  }
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存并完成登记
              </button>
            </div>
          </div>
        </div>
      )}
      {showMember && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">添加成员</h3>
            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="姓名 / 登录账号"
                className="w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
              />
              <select
                value={firm}
                onChange={(e) => setFirm(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>Hamilton Weiss PLLC</option>
                <option>Hamilton Weiss 联营所</option>
              </select>
              <select
                value={office}
                onChange={(e) => {
                  setOffice(e.target.value);
                  const first = businessLines[e.target.value]?.[0] ?? '';
                  setDepartment(first);
                  setTeam(teams[first]?.[0] ?? '');
                }}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>New York Office</option>
                <option>Hong Kong Office</option>
                <option>Shenzhen Office</option>
              </select>
              <select
                value={department}
                onChange={(e) => {
                  setDepartment(e.target.value);
                  setTeam(teams[e.target.value]?.[0] ?? '');
                }}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                {(businessLines[office] ?? []).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                {(teams[department] ?? []).map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                {positions.map((item) => (
                  <option key={item[0]}>{item[0]}</option>
                ))}
              </select>
              <select
                value={manager}
                onChange={(e) => setManager(e.target.value)}
                className="w-full rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
              >
                <option>Sarah Lin</option>
                <option>Michael Chen</option>
                <option>无直属上级</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowMember(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (name.trim())
                    setRows((items) => [
                      [
                        name.trim(),
                        `${firm} · ${office}`,
                        `${department} · ${team}`,
                        position,
                        manager,
                        '待激活',
                      ],
                      ...items,
                    ]);
                  setName('');
                  setShowMember(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存成员
              </button>
            </div>
          </div>
        </div>
      )}
      {showPosition && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">新建职位</h3>
            <input
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="职位名称"
              className="mt-4 w-full rounded border border-[#dce1e6] px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowPosition(false)}
                className="rounded border border-[#dce1e6] px-4 py-2 text-sm"
              >
                取消
              </button>
              <button
                onClick={() => {
                  if (newPosition.trim())
                    setPositions((items) => [
                      ...items,
                      [newPosition.trim(), '自定义层级', '待配置'],
                    ]);
                  setNewPosition('');
                  setShowPosition(false);
                }}
                className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
              >
                保存职位
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Content({
  section,
  projects,
  setProjects,
  files,
  logs,
  setLogs,
  tasks,
  setTasks,
  projectMembership,
  setProjectMembership,
  directoryRows,
  setDirectoryRows,
  positions,
  setPositions,
  onNavigate,
  onOpenProject,
  onNew,
  projectSubview,
}: {
  section: string;
  projects: string[][];
  setProjects: React.Dispatch<React.SetStateAction<string[][]>>;
  files: string[][];
  logs: string[][];
  setLogs: React.Dispatch<React.SetStateAction<string[][]>>;
  tasks: string[][];
  setTasks: React.Dispatch<React.SetStateAction<string[][]>>;
  projectMembership: Record<string, 'member' | 'invited'>;
  setProjectMembership: React.Dispatch<
    React.SetStateAction<Record<string, 'member' | 'invited'>>
  >;
  directoryRows: string[][];
  setDirectoryRows: React.Dispatch<React.SetStateAction<string[][]>>;
  positions: string[][];
  setPositions: React.Dispatch<React.SetStateAction<string[][]>>;
  onNavigate: (section: string) => void;
  onOpenProject: (project: string[]) => void;
  onNew: () => void;
  projectSubview?: string | null;
}) {
  const [selectedProject, setSelectedProject] = useState<string[] | null>(null);
  const [projectQuery, setProjectQuery] = useState('');
  const [projectStatus, setProjectStatus] = useState('全部状态');
  if (selectedProject)
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => setSelectedProject(null)}
      />
    );
  if (
    section === '我的文档' ||
    section === '团队资料' ||
    section === '律所资料'
  )
    return <DocumentsWorkspace section={section} files={files} />;
  if (section === '线索阶段')
    return (
      <ClueWorkspace
        key={projectSubview ?? 'clue-default'}
        initialView={projectSubview ?? '团队公共线索库'}
      />
    );
  if (section === '案源阶段')
    return (
      <SourceWorkspace
        key={projectSubview ?? 'source-default'}
        initialView={projectSubview ?? '我的案源'}
      />
    );
  if (section === '合同阶段' && !projectSubview)
    return (
      <ProjectOverviewWorkspace
        projects={projects}
        onOpenProject={(project) => setSelectedProject(project)}
      />
    );
  if (section === '合同阶段' && projectSubview)
    if (projectSubview === '顾问续约') return <AdvisorRenewalWorkspace />;
  if (section === '合同阶段' && projectSubview)
    if (projectSubview === '财产保全管理') return <PreservationWorkspace />;
  if (section === '合同阶段' && projectSubview)
    if (projectSubview === '业务项目统计')
      return <ProjectStatisticsWorkspace />;
  if (section === '合同阶段' && projectSubview)
    if (projectSubview === '子项目管理') return <SubprojectWorkspace />;
  if (section === '合同阶段' && projectSubview)
    if (projectSubview === '业务项目' || projectSubview === '项目综合')
      return (
        <ProjectOverviewWorkspace
          projects={projects}
          onOpenProject={(project) => setSelectedProject(project)}
        />
      );
  if (section === '合同阶段' && projectSubview)
    return (
      <ProjectOperations
        section={projectSubview}
        setProjects={setProjects}
        onOpenProject={(project) => setSelectedProject(project)}
      />
    );
  if (section === '项目收款' && projectSubview)
    return (
      <ProjectOperations section={projectSubview} setProjects={setProjects} />
    );
  if (section === '通讯录')
    return (
      <DirectoryWorkspace
        rows={directoryRows}
        setRows={setDirectoryRows}
        positions={positions}
        setPositions={setPositions}
      />
    );
  if (
    [
      '申请大厅',
      '待处理的',
      '我发起的',
      '已处理的',
      '抄送我的',
      '变更审批人',
    ].includes(section)
  )
    return <ApplicationHallWorkspace key={section} initialView={section} />;
  if (section === '流程审批')
    return <ApplicationHallWorkspace key="申请大厅" initialView="申请大厅" />;
  if (['通知公告', '内部项目'].includes(section))
    return <GeneralWorkspace section={section} />;
  if (section === '外所协办项目') return <CollaborationWorkspace />;
  if (['日志', '任务', '日程'].includes(section))
    return (
      <WorkOperations
        section={section}
        logs={logs}
        setLogs={setLogs}
        tasks={tasks}
        setTasks={setTasks}
        projects={projects}
        projectMembership={projectMembership}
        setProjectMembership={setProjectMembership}
      />
    );
  if (section === '消息中心')
    return <MessageCenter logs={logs} tasks={tasks} />;
  if (section === '我的客户') return <MyClientsWorkspace />;
  if (section === '常年顾问客户') return <AnnualAdvisorWorkspace />;
  if (section === '签约客户') return <SignedClientsWorkspace />;
  if (section === '意向客户' || section === '潜在客户')
    return <CustomerStageWorkspace key={section} kind={section} />;
  if (section === '联系人' || section === '对方/关联当事人')
    return <ContactDirectoryWorkspace key={section} kind={section} />;
  if (
    [
      '客户管理',
      '客户查询',
      '常年顾问客户',
      '签约客户',
      '意向客户',
      '潜在客户',
      '联系人',
      '对方/关联当事人',
    ].includes(section)
  )
    return <ClientWorkspace section={section} />;
  if (
    [
      '我的工具',
      '效率工具',
      '信息查询',
      '司法网址',
      '诉讼仲裁',
      '知识产权',
      '资本市场',
      '数据合规',
    ].includes(section)
  )
    return <LegalToolsWorkspace section={section} />;
  if (
    [
      '合同阶段',
      '合同管理',
      '项目收款',
      '个人台账',
      '顾问续约',
      '财产保全管理',
      '业务项目统计',
      '归档卷宗',
      '项目综合',
      '业务项目',
      '子项目管理',
      '近期关注项目',
      '合同应收款',
      '项目收/退款',
      '已开发票',
      '公开招领款项',
      '预计收款统计',
      '已开票未到账款项',
      '已到账未开票款项',
      '已立案3个月未收款项目',
    ].includes(section)
  )
    return (
      <ProjectOperations
        section={section}
        setProjects={setProjects}
        onOpenProject={(project) => setSelectedProject(project)}
      />
    );
  if (section === '工作首页')
    return (
      <WorkHome
        projects={projects}
        logs={logs}
        tasks={tasks}
        projectMembership={projectMembership}
        setProjectMembership={setProjectMembership}
        onNavigate={onNavigate}
      />
    );
  return (
    <div className="p-7">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white">
            在办项目
          </button>
          <select className="rounded border border-[#d8dde3] bg-white px-3 py-2 text-sm">
            <option>项目类型：全部</option>
            <option>境外资本市场</option>
            <option>诉讼仲裁</option>
          </select>
          <select
            value={projectStatus}
            onChange={(e) => setProjectStatus(e.target.value)}
            className="rounded border border-[#d8dde3] bg-white px-3 py-2 text-sm"
          >
            <option>全部状态</option>
            <option>进行中</option>
            <option>已立案</option>
            <option>待审批</option>
            <option>已结案</option>
          </select>
        </div>
        <button
          onClick={onNew}
          className="rounded bg-[#f1666d] px-4 py-2 text-sm text-white"
        >
          创建新项目
        </button>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={projectQuery}
          onChange={(e) => setProjectQuery(e.target.value)}
          className="w-full max-w-md rounded border border-[#dce1e6] bg-white px-3 py-2 text-sm"
          placeholder="项目名称 / 编号 / 客户"
        />
        <button
          onClick={() => {
            setProjectQuery('');
            setProjectStatus('全部状态');
          }}
          className="rounded border border-[#dce1e6] bg-white px-4 text-sm"
        >
          重置
        </button>
      </div>
      <div className="rounded-lg border border-[#e0e4e8] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f6f7f8] text-xs text-[#748091]">
            <tr>
              {[
                '项目名称',
                '受理时间',
                '主办',
                '合同金额',
                '进程阶段',
                '案件状态',
                '操作',
              ].map((h) => (
                <th key={h} className="px-4 py-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {projects
              .filter(
                (row) =>
                  row
                    .join(' ')
                    .toLowerCase()
                    .includes(projectQuery.toLowerCase()) &&
                  (projectStatus === '全部状态' || row[4] === projectStatus),
              )
              .map((row, index) => (
                <tr
                  key={row[1]}
                  className="border-t border-[#edf0f2] hover:bg-[#fffafa]"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium">{row[0]}</p>
                    <p className="mt-1 text-xs text-[#8d98a5]">{row[1]}</p>
                  </td>
                  <td className="px-4 py-4 text-[#596675]">{row[2]}</td>
                  <td className="px-4 py-4">{row[3]}</td>
                  <td className="px-4 py-4">$ {(index + 2) * 25},000</td>
                  <td className="px-4 py-4 text-[#7c8794]">未设置进程</td>
                  <td className="px-4 py-4">
                    <span className="mr-1 inline-block size-2 rounded-full bg-[#36ae76]" />
                    {row[4]}
                    <p className="mt-1 text-xs text-[#8d98a5]">{row[5]}</p>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => setSelectedProject(row)}
                      className="text-[#e45159] hover:underline"
                    >
                      详情
                    </button>
                    <span className="px-2 text-[#c9cfd6]">·</span>
                    <button className="text-[#7b8794]">更多</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        <div className="border-t border-[#edf0f2] px-4 py-4 text-xs text-[#8d98a5]">
          共{' '}
          {
            projects.filter(
              (row) =>
                row
                  .join(' ')
                  .toLowerCase()
                  .includes(projectQuery.toLowerCase()) &&
                (projectStatus === '全部状态' || row[4] === projectStatus),
            ).length
          }{' '}
          条 · 20 条/页
        </div>
      </div>
    </div>
  );
}

