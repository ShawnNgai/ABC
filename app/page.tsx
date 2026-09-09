'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUp,
  BookOpen,
  Bot,
  ChevronDown,
  FileText,
  FolderOpen,
  Gavel,
  History,
  Library,
  Loader2,
  MessageSquareText,
  Paperclip,
  Plus,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Citation = {
  sourceId: string;
  label: string;
  locator?: string;
  url?: string;
  kind?: 'official' | 'matter' | 'firm' | 'web';
};
type Message = {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  citations?: Citation[];
  recordId?: string;
  feedback?: 'accepted' | 'needs_edit';
};
type InteractionRecord = {
  id: string;
  createdAt: string;
  matterId: string;
  mode: string;
  model: string;
  prompt: string;
  answer: string;
  live: boolean;
  feedback?: 'accepted' | 'needs_edit';
  intent?: string;
  knowledgeUsed?: string[];
};

function redactForTraining(value: string) {
  return value
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[EMAIL]')
    .replace(/(?:\+?\d[\d\s().-]{7,}\d)/g, '[PHONE]')
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[ID]');
}

const initialMatters = [
  {
    id: 'HW-2026-0148',
    name: 'Orion BioTech v. Atlas',
    meta: 'Commercial litigation · Active',
  },
  {
    id: 'HW-2026-0139',
    name: 'Northstar Holdings',
    meta: 'SEC disclosure review · Pending approval',
  },
  {
    id: 'HW-2026-0127',
    name: 'Aster Mobility',
    meta: 'US market entry · Conflict check',
  },
];
const sources = [
  { name: 'Orion_Answer.pdf', type: 'Matter file', pages: 'pp. 14–18' },
  { name: 'NY CPLR § 3211', type: 'NY statute', pages: 'current' },
  {
    name: 'Hamilton Litigation Playbook',
    type: 'Firm knowledge',
    pages: 'v2.4',
  },
];

export default function Home() {
  const [activeNav, setActiveNav] = useState('AI 工作台');
  const [openTopMenu, setOpenTopMenu] = useState<string | null>(null);
  const [matterList, setMatterList] = useState(initialMatters);
  const [activeMatter, setActiveMatter] = useState(initialMatters[0]);
  const [matterOpen, setMatterOpen] = useState(false);
  const [newMatterOpen, setNewMatterOpen] = useState(false);
  const [newMatterName, setNewMatterName] = useState('');
  const [mode, setMode] = useState<'咨询' | '起草' | '审阅'>('咨询');
  const [model, setModel] = useState('Hamilton Legal Router');
  const [prompt, setPrompt] = useState('');
  const [showSources, setShowSources] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [interactionRecords, setInteractionRecords] = useState<
    InteractionRecord[]
  >([]);
  const [activeCitations, setActiveCitations] = useState<Citation[]>(
    sources.map((source, index) => ({
      sourceId: `demo-${index}`,
      label: source.name,
      locator: source.pages,
      kind: index === 2 ? 'firm' : 'matter',
    })),
  );
  const loadingStages = [
    '检索 Matter 文件',
    '分析问题与相关规则',
    '整理来源与律师复核提示',
  ];
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('hamilton-os-ai-records');
      if (saved)
        setInteractionRecords(JSON.parse(saved) as InteractionRecord[]);
    } catch {
      // Local history is best-effort in the prototype.
    }
  }, []);
  useEffect(() => {
    if (!isSending) {
      setLoadingStage(0);
      return;
    }
    const timer = window.setInterval(
      () => setLoadingStage((stage) => (stage + 1) % loadingStages.length),
      1200,
    );
    return () => window.clearInterval(timer);
  }, [isSending, loadingStages.length]);
  function saveInteraction(record: InteractionRecord) {
    setInteractionRecords((previous) => {
      const next = [record, ...previous].slice(0, 500);
      try {
        window.localStorage.setItem(
          'hamilton-os-ai-records',
          JSON.stringify(next),
        );
      } catch {
        /* storage may be unavailable */
      }
      return next;
    });
  }
  function exportTrainingData() {
    const payload = interactionRecords.map((record) => ({
      ...record,
      prompt: redactForTraining(record.prompt),
      answer: redactForTraining(record.answer),
      feedback: record.feedback ?? 'needs_lawyer_review',
      datasetSplit: 'candidate',
      trainingStatus: 'lawyer_review_required',
    }));
    const blob = new Blob(
      [payload.map((item) => JSON.stringify(item)).join('\n')],
      { type: 'application/jsonl' },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hamilton-os-training-${new Date().toISOString().slice(0, 10)}.jsonl`;
    link.click();
    URL.revokeObjectURL(url);
  }
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content:
        '基于当前案件材料，概括被告可以提出的管辖权异议，并列出需要进一步核实的事实。',
    },
    {
      role: 'assistant',
      model: 'Hamilton Legal Router',
      content:
        '根据当前 Matter 中的答辩状、送达记录与纽约州程序规则，初步判断可围绕三条路径展开：\n\n1. 个人管辖权：核对被告在纽约的最低联系与送达地址。\n2. 诉因充分性：确认原告是否具体陈述损害、因果关系及救济请求。\n3. 论坛不便：如事实与证据主要在外州，可评估 forum non conveniens。\n\n以下结论仍需律师复核。建议先补齐送达证明、合同适用法律条款和关键交易邮件。',
    },
  ]);
  const navItems = [
    { label: 'AI 工作台', icon: Bot },
    { label: '客户与 Matter', icon: FolderOpen },
    { label: '知识库', icon: Library },
    { label: '文档协作', icon: FileText },
    { label: '流程与审批', icon: ShieldCheck, count: 6 },
    { label: '外部律师协作', icon: Users },
    { label: '管理与审计', icon: Settings2 },
  ];
  const topMenus = [
    { label: '工作', items: ['工作首页', '日志', '任务', '日程'] },
    { label: '文档', items: ['我的文档', '团队资料', '律所资料'] },
    {
      label: '项目',
      items: ['项目综合', '业务项目', '合同管理', '归档卷宗', '项目统计'],
    },
    { label: '客户', items: ['客户列表', '联系人', '客户查询'] },
    { label: '综合', items: ['流程审批', '通知公告', '内部项目'] },
    {
      label: '法律工具',
      items: ['我的工具', '文档工具', 'AI工具', '法律法规', '资本市场'],
    },
  ];
  function selectTopItem(item: string) {
    const aliases: Record<string, string> = {
      工作首页: 'AI 工作台',
      日志: '管理与审计',
      任务: '流程与审批',
      日程: '流程与审批',
      我的文档: '文档协作',
      团队资料: '文档协作',
      律所资料: '文档协作',
      项目综合: '客户与 Matter',
      业务项目: '客户与 Matter',
      合同管理: '文档协作',
      归档卷宗: '文档协作',
      项目统计: '管理与审计',
      客户列表: '客户与 Matter',
      联系人: '客户与 Matter',
      客户查询: '客户与 Matter',
      流程审批: '流程与审批',
      通知公告: '管理与审计',
      内部项目: '客户与 Matter',
      我的工具: '知识库',
      文档工具: '文档协作',
      AI工具: 'AI 工作台',
      法律法规: '知识库',
      资本市场: '知识库',
    };
    setActiveNav(aliases[item] ?? item);
    setOpenTopMenu(null);
  }
  const quickPrompts = useMemo(
    () =>
      mode === '审阅'
        ? ['找出责任上限和赔偿排除', '列出缺失的定义条款', '生成红线修改建议']
        : mode === '起草'
          ? [
              '起草一份保密协议条款',
              '生成纽约州诉讼时间表',
              '把要点整理成客户邮件',
            ]
          : [
              '梳理案件争议焦点',
              '对比两个模型的意见',
              '基于资料给出下一步行动',
            ],
    [mode],
  );
  const workspaceCards: Record<
    string,
    { title: string; description: string; columns: string[]; rows: string[][] }
  > = {
    '客户与 Matter': {
      title: '客户与 Matter',
      description: '以客户和事项为中心组织团队、文件、AI 工作与业务状态。',
      columns: ['事项', '客户 / 法域', '负责人', '状态'],
      rows: [
        ['Northstar Holdings', 'Northstar · US', 'Sarah Lin', '待审批'],
        ['Orion BioTech v. Atlas', 'Orion · NY', 'Michael Chen', '进行中'],
        ['Aster Mobility', 'Aster · Delaware', 'Sarah Lin', '利益冲突核查'],
      ],
    },
    知识库: {
      title: '知识库',
      description: '模块化法律知识与研究来源，首期聚焦美国资本市场。',
      columns: ['知识模块', '文档数', '最近更新', '状态'],
      rows: [
        ['Capital Markets / SEC', '1,248', '今天 09:20', '已发布'],
        ['Corporate Services', '—', '待建立', '规划中'],
        ['Litigation / NY', '—', '待建立', '规划中'],
      ],
    },
    文档协作: {
      title: '文档协作',
      description: '文件版本、在线编辑、评论和事项关联统一管理。',
      columns: ['文件', '关联事项', '版本', '协作状态'],
      rows: [
        ['Northstar 10-K review.docx', 'Northstar Holdings', 'v4', '等待审阅'],
        ['SEC comment response.pdf', 'Northstar Holdings', 'v2', '已归档'],
        ['Engagement letter.docx', 'Orion BioTech', 'v1', 'WPS 编辑中'],
      ],
    },
    流程与审批: {
      title: '流程与审批',
      description: '开案、利益冲突、文书、外部协作和费用审批集中处理。',
      columns: ['审批事项', '申请人', '节点', '状态'],
      rows: [
        ['Northstar 开案申请', 'Sarah Lin', '利益冲突核查', '待处理'],
        ['外部律师协作发布', 'Michael Chen', '合伙人批准', '待处理'],
        ['合同审阅意见', 'Evelyn Park', '团队负责人', '已通过'],
      ],
    },
    外部律师协作: {
      title: '外部律师协作',
      description: '将跨境协作需求脱敏、英文化，并由平台审核后的律师投标。',
      columns: ['需求', '法域', '投标数', '状态'],
      rows: [
        ['US securities litigation support', 'New York', '4', '投标中'],
        ['Delaware corporate filing', 'Delaware', '2', '待选择'],
        ['IP discovery counsel', 'California', '—', '草稿'],
      ],
    },
    管理与审计: {
      title: '管理与审计',
      description: '查看租户、成员、模型调用、知识库变更和敏感文件访问记录。',
      columns: ['审计事件', '操作者', '资源', '时间'],
      rows: [
        ['AI 调用已记录', 'Sarah Lin', 'Northstar Matter', '刚刚'],
        ['知识库文档发布', 'Admin', 'SEC Collection', '今天 09:20'],
        ['WPS 文档保存', 'Evelyn Park', 'Engagement letter', '昨天 16:42'],
      ],
    },
  };
  function renderWorkspacePanel() {
    if (activeNav === 'AI 工作台') return null;
    const card = workspaceCards[activeNav] ?? workspaceCards['客户与 Matter'];
    return (
      <section className="mb-5 rounded-2xl border border-[#dce4ec] bg-white p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#147b9b]">
              Hamilton OS workspace
            </p>
            <h2 className="mt-1 text-xl font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm text-[#6d7c8c]">{card.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-9 rounded-lg border-[#dce4ec] text-xs"
            >
              导出视图
            </Button>
            <Button className="h-9 rounded-lg bg-[#147b9b] text-xs hover:bg-[#106b86]">
              <Plus className="size-3.5" />
              新建
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl bg-[#f5fafb] p-3">
            <p className="text-xs text-[#8291a0]">全部</p>
            <p className="mt-1 text-xl font-semibold">
              {activeNav === '知识库'
                ? '1,248'
                : activeNav === '管理与审计'
                  ? '2,431'
                  : '24'}
            </p>
          </div>
          <div className="rounded-xl bg-[#f8f9fb] p-3">
            <p className="text-xs text-[#8291a0]">待处理</p>
            <p className="mt-1 text-xl font-semibold text-[#c17b2d]">
              {activeNav === '流程与审批' ? '6' : '8'}
            </p>
          </div>
          <div className="rounded-xl bg-[#f8f9fb] p-3">
            <p className="text-xs text-[#8291a0]">本周新增</p>
            <p className="mt-1 text-xl font-semibold">12</p>
          </div>
          <div className="rounded-xl bg-[#f8f9fb] p-3">
            <p className="text-xs text-[#8291a0]">需律师复核</p>
            <p className="mt-1 text-xl font-semibold text-[#b85b5b]">3</p>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto rounded-xl border border-[#e7edf2]">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-[#f7f9fb] text-xs text-[#718294]">
              <tr>
                {card.columns.map((column) => (
                  <th key={column} className="px-4 py-3 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {card.rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-[#edf1f4] hover:bg-[#fbfdfe]"
                >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`px-4 py-3 ${cellIndex === row.length - 1 ? 'font-medium text-[#147b9b]' : 'text-[#3e5265]'}`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-[#8291a0]">
          <span>演示数据 · 真实环境将按租户和事项权限过滤</span>
          <button className="font-medium text-[#147b9b]">查看全部 →</button>
        </div>
      </section>
    );
  }
  async function submitPrompt() {
    const text = prompt.trim();
    if (!text || isSending) return;
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setPrompt('');
    setIsSending(true);
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          matterId: activeMatter.id,
          mode:
            mode === '咨询' ? 'consult' : mode === '起草' ? 'draft' : 'review',
          model,
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        model?: string;
        live?: boolean;
        error?: string;
        citations?: Citation[];
        intent?: string;
        knowledgeUsed?: string[];
      };
      const answer = data.error
        ? `调用失败：${data.error}`
        : `${data.answer ?? '模型未返回内容。'}${data.live ? '' : '\n\n当前为演示响应；配置有效模型 Key 后将调用真实模型。'}`;
      const recordId = crypto.randomUUID();
      setActiveCitations(data.citations ?? []);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          model: data.model ?? model,
          content: answer,
          citations: data.citations,
          recordId,
        },
      ]);
      saveInteraction({
        id: recordId,
        createdAt: new Date().toISOString(),
        matterId: activeMatter.id,
        mode,
        model: data.model ?? model,
        prompt: text,
        answer,
        live: Boolean(data.live),
        intent: data.intent,
        knowledgeUsed: data.knowledgeUsed,
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          model,
          content: '暂时无法连接 AI 网关，请检查服务状态。',
          recordId: crypto.randomUUID(),
        },
      ]);
      saveInteraction({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        matterId: activeMatter.id,
        mode,
        model,
        prompt: text,
        answer: '暂时无法连接 AI 网关，请检查服务状态。',
        live: false,
      });
    } finally {
      setIsSending(false);
    }
  }
  function recordFeedback(
    recordId: string,
    feedback: 'accepted' | 'needs_edit',
  ) {
    setMessages((previous) =>
      previous.map((message) =>
        message.recordId === recordId ? { ...message, feedback } : message,
      ),
    );
    setInteractionRecords((previous) => {
      const next = previous.map((record) =>
        record.id === recordId ? { ...record, feedback } : record,
      );
      try {
        window.localStorage.setItem(
          'hamilton-os-ai-records',
          JSON.stringify(next),
        );
      } catch {
        /* best effort */
      }
      return next;
    });
  }
  function createMatter() {
    const name = newMatterName.trim();
    if (!name) return;
    const created = {
      id: `HW-2026-${String(matterList.length + 148).padStart(4, '0')}`,
      name,
      meta: 'New matter · Pending approval',
    };
    setMatterList((previous) => [created, ...previous]);
    setActiveMatter(created);
    setNewMatterName('');
    setNewMatterOpen(false);
    setActiveNav('AI 工作台');
  }
  return (
    <main className="min-h-screen bg-[#f5f7fa] text-[#172536]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-[#dce4ec] bg-[#112235] text-white lg:flex">
        <div className="flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
          <div className="grid size-10 place-items-center rounded-xl bg-[#53b4d4] text-lg font-bold text-[#112235]">
            H
          </div>
          <div>
            <p className="font-semibold tracking-tight">Hamilton OS</p>
            <p className="text-xs text-[#aabacb]">Hamilton Weiss · New York</p>
          </div>
        </div>
        <div className="flex-1 px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-[#8295a9]">
            Workspace
          </p>
          <nav className="space-y-1" aria-label="主导航">
            {navItems.map(({ label, icon: Icon, count }) => (
              <button
                key={label}
                onClick={() => setActiveNav(label)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${activeNav === label ? 'bg-white text-[#112235]' : 'text-[#cad5e0] hover:bg-white/10'}`}
              >
                <Icon
                  className={`size-[17px] ${activeNav === label ? 'text-[#147b9b]' : 'text-[#9cb0c4]'}`}
                />
                {label}
                {count && (
                  <span className="ml-auto rounded-full bg-[#ef6b73] px-1.5 py-0.5 text-[10px] text-white">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <p className="px-3 pb-2 pt-8 text-[11px] font-semibold uppercase tracking-[.14em] text-[#8295a9]">
            Recent Matters
          </p>
          <div className="space-y-1">
            {matterList.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setActiveMatter(m);
                  setActiveNav('AI 工作台');
                }}
                className="w-full rounded-lg px-3 py-2 text-left hover:bg-white/10"
              >
                <p className="truncate text-xs text-[#e3ebf3]">{m.name}</p>
                <p className="mt-1 text-[10px] text-[#8095a9]">{m.id}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="m-3 rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="size-2 rounded-full bg-emerald-400" /> Data region:
            Singapore · test
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#9fb1c3]">
            MFA enabled · audit logging on
            <br />
            Production region can be isolated per tenant
          </p>
        </div>
      </aside>
      <section className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-4 border-b border-[#dce4ec] bg-white/90 px-5 backdrop-blur-xl md:px-8">
          <nav
            className="hidden h-full items-center gap-1 xl:flex"
            aria-label="华商式主导航"
          >
            {topMenus.map((menu) => (
              <div
                key={menu.label}
                className="relative h-full flex items-center"
              >
                <button
                  onClick={() =>
                    setOpenTopMenu(
                      openTopMenu === menu.label ? null : menu.label,
                    )
                  }
                  className={`flex h-10 items-center gap-1 rounded-lg px-3 text-sm font-medium transition ${openTopMenu === menu.label ? 'bg-[#112235] text-white' : 'text-[#34495b] hover:bg-[#eef4f7]'}`}
                >
                  {menu.label}
                  <ChevronDown className="size-3.5" />
                </button>
                {openTopMenu === menu.label && (
                  <div className="absolute left-0 top-[58px] z-50 min-w-[168px] rounded-xl border border-[#dce4ec] bg-white p-1.5 shadow-xl">
                    {menu.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => selectTopItem(item)}
                        className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-[#34495b] hover:bg-[#edf7f9] hover:text-[#147b9b]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="relative max-w-xl flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#90a0b0]" />
              <Input
                className="h-10 rounded-lg border-[#dce4ec] bg-[#f7f9fb] pl-9 text-sm shadow-none"
                placeholder="Search matters, documents or knowledge…"
              />
            </div>
            <Badge
              variant="outline"
              className="hidden rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 sm:flex"
            >
              <span className="mr-1.5 size-1.5 rounded-full bg-emerald-500" />
              AI services operational
            </Badge>
          </div>
          <button className="hidden items-center gap-2 text-left sm:flex">
            <div className="grid size-9 place-items-center rounded-lg bg-[#dff1f6] text-xs font-bold text-[#147b9b]">
              SL
            </div>
            <div>
              <p className="text-xs font-semibold">Sarah Lin</p>
              <p className="text-[11px] text-[#8291a0]">Partner · NY</p>
            </div>
            <ChevronDown className="size-4 text-[#8c9aa8]" />
          </button>
        </header>
        <div className="mx-auto max-w-[1480px] px-5 py-6 md:px-8">
          <div className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[.15em] text-[#147b9b]">
                Legal AI workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-[-.03em] md:text-[30px]">
                {activeNav}
              </h1>
              <p className="mt-1.5 text-sm text-[#6d7c8c]">
                Ask, draft and review with matter-aware context. Every answer
                remains traceable.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="h-10 rounded-lg border-[#dce4ec] bg-white"
              >
                <History className="size-4" />
                历史记录
              </Button>
              <Button
                variant="outline"
                onClick={exportTrainingData}
                disabled={!interactionRecords.length}
                className="h-10 rounded-lg border-[#dce4ec] bg-white"
              >
                <FileText className="size-4" />
                导出脱敏训练集 ({interactionRecords.length})
              </Button>
              <Button
                onClick={() => setNewMatterOpen(true)}
                className="h-10 rounded-lg bg-[#147b9b] hover:bg-[#106b86]"
              >
                <Plus className="size-4" />
                新建 Matter
              </Button>
            </div>
          </div>
          {renderWorkspacePanel()}
          <div
            className={`${activeNav === 'AI 工作台' ? '' : 'hidden'} mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#dce4ec] bg-white px-4 py-3 shadow-sm`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#607384]">
              <FolderOpen className="size-4 text-[#147b9b]" />
              当前 Matter
            </div>
            <div className="relative">
              <button
                onClick={() => setMatterOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg border border-[#dce4ec] bg-[#f8fafc] px-3 py-2 text-sm font-medium hover:bg-[#f1f5f8]"
              >
                <span>{activeMatter.name}</span>
                <ChevronDown className="size-4 text-[#8291a0]" />
              </button>
              {matterOpen && (
                <div className="absolute left-0 top-11 z-40 w-80 rounded-xl border border-[#dce4ec] bg-white p-1.5 shadow-xl">
                  {matterList.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMatter(m);
                        setMatterOpen(false);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left hover:bg-[#f3f7f9]"
                    >
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="mt-1 text-xs text-[#8291a0]">
                        {m.id} · {m.meta}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Badge variant="secondary" className="bg-[#e8f5f8] text-[#147b9b]">
              {activeMatter.id}
            </Badge>
            <div className="ml-auto hidden items-center gap-2 text-xs text-[#8291a0] md:flex">
              <ShieldCheck className="size-4 text-emerald-600" />
              Context access: private to you
            </div>
          </div>
          <div
            className={`${activeNav === 'AI 工作台' ? '' : 'hidden'} grid gap-5 xl:grid-cols-[minmax(0,1fr)_310px]`}
          >
            <section className="flex min-h-[680px] flex-col overflow-hidden rounded-2xl border border-[#dce4ec] bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7edf2] px-5 py-4">
                <div className="flex items-center gap-2">
                  <div className="grid size-9 place-items-center rounded-lg bg-[#e7f5f8]">
                    <Sparkles className="size-4 text-[#147b9b]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      Hamilton Legal Agent
                    </p>
                    <p className="text-[11px] text-[#8291a0]">
                      Matter-aware · source-cited · human approval required
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-[#f3f6f8] p-1">
                  {(['咨询', '起草', '审阅'] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setMode(item)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium ${mode === item ? 'bg-white text-[#147b9b] shadow-sm' : 'text-[#728293]'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-5 overflow-auto px-5 py-6 md:px-8">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-7 ${message.role === 'user' ? 'rounded-br-sm bg-[#e8f5f8] text-[#173f4f]' : 'rounded-bl-sm border border-[#e5ebef] bg-[#fbfcfd] text-[#2c3e50]'}`}
                    >
                      {message.role === 'assistant' && (
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold text-[#147b9b]">
                          <Bot className="size-3.5" />
                          {message.model}
                        </div>
                      )}
                      <p className="whitespace-pre-line">{message.content}</p>
                      {message.role === 'assistant' && (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="outline"
                            className="border-emerald-200 bg-emerald-50 text-emerald-700"
                          >
                            {message.citations?.length ?? 0} sources
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-[#d8e5eb] text-[#607384]"
                          >
                            Needs lawyer review
                          </Badge>
                          {message.recordId && (
                            <>
                              <button
                                onClick={() =>
                                  recordFeedback(message.recordId!, 'accepted')
                                }
                                className={`rounded-md px-2 py-1 text-[11px] ${message.feedback === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'text-[#8291a0] hover:bg-[#eef7f2]'}`}
                              >
                                采纳
                              </button>
                              <button
                                onClick={() =>
                                  recordFeedback(
                                    message.recordId!,
                                    'needs_edit',
                                  )
                                }
                                className={`rounded-md px-2 py-1 text-[11px] ${message.feedback === 'needs_edit' ? 'bg-amber-100 text-amber-700' : 'text-[#8291a0] hover:bg-[#fff8eb]'}`}
                              >
                                需要修改
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isSending && (
                  <div className="flex gap-3">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-[#cfe4ea] bg-[#f7fcfd] px-4 py-3 text-sm text-[#486271]">
                      <div className="flex items-center gap-2 font-medium text-[#147b9b]">
                        <Loader2 className="size-4 animate-spin" />
                        {loadingStages[loadingStage]}
                        <span className="inline-flex w-5 gap-0.5">
                          <span className="animate-pulse">·</span>
                          <span className="animate-pulse [animation-delay:150ms]">
                            ·
                          </span>
                          <span className="animate-pulse [animation-delay:300ms]">
                            ·
                          </span>
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-[#8291a0]">
                        正在生成回答，完成后仍需律师复核
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="border-t border-[#e7edf2] px-5 py-4 md:px-8">
                <div className="mb-3 flex flex-wrap gap-2">
                  {quickPrompts.map((q) => (
                    <button
                      key={q}
                      onClick={() => setPrompt(q)}
                      className="rounded-full border border-[#dce4ec] px-3 py-1.5 text-xs text-[#607384] hover:border-[#8cc9d8] hover:bg-[#f1fafb]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-[#cbd9e2] bg-white p-2 shadow-sm focus-within:border-[#54aabd] focus-within:ring-2 focus-within:ring-[#dff3f7]">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void submitPrompt();
                      }
                    }}
                    placeholder={`在「${activeMatter.name}」上下文中${mode}…`}
                    className="min-h-[62px] resize-none border-0 px-2 py-1 text-sm leading-6 shadow-none focus-visible:ring-0"
                  />
                  <div className="flex items-center justify-between px-1 pt-1">
                    <div className="flex items-center gap-1">
                      <button className="rounded-md p-2 text-[#8291a0] hover:bg-[#f3f6f8]">
                        <Paperclip className="size-4" />
                      </button>
                      <button className="rounded-md p-2 text-[#8291a0] hover:bg-[#f3f6f8]">
                        <BookOpen className="size-4" />
                      </button>
                      <span className="ml-2 text-[11px] text-[#9aa8b4]">
                        Enter to send · Shift+Enter for new line
                      </span>
                    </div>
                    <Button
                      onClick={() => void submitPrompt()}
                      disabled={isSending}
                      size="icon"
                      className="size-9 rounded-lg bg-[#147b9b] hover:bg-[#106b86]"
                    >
                      <ArrowUp className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>
            <aside className="space-y-5">
              <section className="rounded-2xl border border-[#dce4ec] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">模型路由</p>
                    <p className="mt-1 text-[11px] text-[#8291a0]">
                      Select one or compare several
                    </p>
                  </div>
                  <Scale className="size-4 text-[#147b9b]" />
                </div>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="h-10 w-full rounded-lg border border-[#dce4ec] bg-[#f8fafc] px-3 text-sm outline-none focus:border-[#54aabd]"
                >
                  <option>Hamilton Legal Router</option>
                  <option>GPT · high reasoning</option>
                  <option>Kimi · cost efficient</option>
                  <option>Qwen · Chinese legal context</option>
                  <option>qwen3.7-plus</option>
                  <option>Harvey · independent account</option>
                </select>
                <div className="mt-3 flex items-center justify-between text-[11px] text-[#8291a0]">
                  <span>Mode: {mode}</span>
                  <button className="font-medium text-[#147b9b]">
                    Compare models
                  </button>
                </div>
              </section>
              <section className="rounded-2xl border border-[#dce4ec] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">证据与引用</p>
                    <p className="mt-1 text-[11px] text-[#8291a0]">
                      回答依据的材料 · {activeCitations.length} 条
                    </p>
                  </div>
                  <button
                    onClick={() => setShowSources((v) => !v)}
                    className="text-xs font-medium text-[#147b9b]"
                  >
                    {showSources ? '收起' : '展开'}
                  </button>
                </div>
                {showSources && (
                  <div className="space-y-2">
                    {activeCitations.map((source, i) => (
                      <a
                        href={source.url ?? '#'}
                        target={source.url ? '_blank' : undefined}
                        rel={source.url ? 'noreferrer' : undefined}
                        key={`${source.sourceId}-${i}`}
                        className="flex gap-2 rounded-lg bg-[#f7f9fb] p-2.5 hover:bg-[#eef8fa]"
                      >
                        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-white text-[10px] font-bold text-[#147b9b] shadow-sm">
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-[#34495b]">
                            {source.label}
                          </p>
                          <p className="mt-1 truncate text-[10px] text-[#8291a0]">
                            {source.locator ?? source.url ?? '内部知识库'}
                          </p>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </section>
              <section className="rounded-2xl border border-[#dce4ec] bg-[#112235] p-4 text-white shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Gavel className="size-4 text-[#77c9dc]" />
                  <p className="text-sm font-semibold">律师控制台</p>
                </div>
                <p className="text-xs leading-5 text-[#b9c8d6]">
                  AI
                  输出仅作为工作草稿。提交客户、签发文书或对外发布前，必须由授权律师确认。
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-[#7ed3b4]">
                  <span className="size-1.5 rounded-full bg-[#58c69e]" />
                  Audit trail active · 脱敏训练集可导出
                </div>
              </section>
              <section className="rounded-2xl border border-[#dce4ec] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <MessageSquareText className="size-4 text-[#147b9b]" />
                  <p className="text-sm font-semibold">本 Matter 文件</p>
                </div>
                {[
                  'Complaint_and_Answer.pdf',
                  'Service_records.docx',
                  'Client_interview_notes.docx',
                ].map((file) => (
                  <div
                    key={file}
                    className="flex items-center gap-2 border-t border-[#edf1f4] py-2 first:border-0"
                  >
                    <FileText className="size-4 text-[#8291a0]" />
                    <span className="truncate text-xs text-[#607384]">
                      {file}
                    </span>
                    <X className="ml-auto size-3.5 text-[#c2ccd4]" />
                  </div>
                ))}
                <Button
                  variant="outline"
                  className="mt-2 h-8 w-full rounded-lg text-xs"
                >
                  <Plus className="size-3.5" />
                  添加文件
                </Button>
              </section>
            </aside>
          </div>
        </div>
      </section>
      {newMatterOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[#112235]/40 px-4"
          role="dialog"
          aria-modal="true"
          aria-label="新建 Matter"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#dce4ec] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#147b9b]">
                  Create workspace record
                </p>
                <h2 className="mt-1 text-xl font-semibold">新建 Matter</h2>
                <p className="mt-1 text-sm text-[#6d7c8c]">
                  创建后默认进入待审批状态，可继续补充客户、团队和冲突核查。
                </p>
              </div>
              <button
                onClick={() => setNewMatterOpen(false)}
                className="rounded-lg p-2 text-[#8291a0] hover:bg-[#f3f6f8]"
                aria-label="关闭"
              >
                <X className="size-4" />
              </button>
            </div>
            <label className="mt-5 block text-sm font-medium text-[#3e5265]">
              Matter 名称
              <input
                value={newMatterName}
                onChange={(event) => setNewMatterName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') createMatter();
                }}
                autoFocus
                placeholder="例如：Atlas Securities offering"
                className="mt-2 h-11 w-full rounded-lg border border-[#dce4ec] px-3 text-sm outline-none focus:border-[#54aabd] focus:ring-2 focus:ring-[#dff3f7]"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setNewMatterOpen(false)}
                className="rounded-lg"
              >
                取消
              </Button>
              <Button
                onClick={createMatter}
                disabled={!newMatterName.trim()}
                className="rounded-lg bg-[#147b9b] hover:bg-[#106b86]"
              >
                创建 Matter
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

