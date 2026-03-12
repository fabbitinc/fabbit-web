import{j as e}from"./index-DRJbD1WP.js";import{an as s,ao as m,ap as p,aq as x,P as u}from"./gltf-viewer-screen-BDJMhtPo.js";import{z as t,E as d,F as i,H as o,a as l,B as r}from"./user-avatar-DUF4fm1-.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const c=[{id:"profile",label:"프로필",icon:m},{id:"security",label:"보안",icon:p},{id:"notifications",label:"알림",icon:x},{id:"parts",label:"부품",icon:u}],H={title:"Components/SettingsShell",component:s,tags:["autodocs"],parameters:{layout:"fullscreen"}},a={render:()=>e.jsx("div",{className:"min-h-screen bg-background p-6",children:e.jsx(s,{activeTab:"profile",description:"조직 운영에 필요한 설정을 영역별로 나누어 관리합니다.",tabs:c,title:"조직 설정",onTabChange:()=>{},children:e.jsxs(t,{className:"border-border/70",children:[e.jsx(d,{children:e.jsx(i,{children:"일반 정보"})}),e.jsxs(o,{className:"space-y-4",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(l,{variant:"accent",children:"활성"}),e.jsx("span",{className:"text-sm text-muted-foreground",children:"조직 프로필과 기본 정책을 수정할 수 있습니다."})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(r,{variant:"outline",children:"취소"}),e.jsx(r,{children:"저장"})]})]})]})})})},n={parameters:{layout:"fullscreen"},render:()=>e.jsxs("div",{className:"min-h-screen space-y-10 bg-background p-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"사용자 설정 구조"}),e.jsx(s,{activeTab:"notifications",description:"개인 알림, 보안, 사용 환경을 한 화면 구조로 정리합니다.",tabs:c,title:"사용자 설정",onTabChange:()=>{},children:e.jsxs(t,{className:"border-border/70",children:[e.jsx(d,{children:e.jsx(i,{children:"알림 규칙"})}),e.jsxs(o,{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3",children:[e.jsx("span",{className:"text-sm font-medium text-foreground",children:"변경 요청 멘션 알림"}),e.jsx(l,{variant:"success",children:"즉시 발송"})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3",children:[e.jsx("span",{className:"text-sm font-medium text-foreground",children:"BOM 업로드 실패 알림"}),e.jsx(l,{variant:"outline",children:"메일만"})]})]})]})})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"프로젝트 설정 구조"}),e.jsx(s,{activeTab:"parts",description:"프로젝트 공통 정책, 라벨, 보안 설정을 동일한 레이아웃으로 감쌉니다.",tabs:c,title:"프로젝트 설정",onTabChange:()=>{},children:e.jsxs(t,{className:"border-border/70",children:[e.jsx(d,{children:e.jsx(i,{children:"부품 운영 정책"})}),e.jsxs(o,{className:"space-y-3",children:[e.jsx("p",{className:"text-sm text-muted-foreground",children:"부품 승인 플로우와 자동 담당 규칙을 설정할 수 있습니다."}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(r,{variant:"outline",children:"초기화"}),e.jsx(r,{children:"정책 저장"})]})]})]})})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="min-h-screen bg-background p-6">
      <SettingsShell activeTab="profile" description="조직 운영에 필요한 설정을 영역별로 나누어 관리합니다." tabs={tabs} title="조직 설정" onTabChange={() => undefined}>
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>일반 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="accent">활성</Badge>
              <span className="text-sm text-muted-foreground">조직 프로필과 기본 정책을 수정할 수 있습니다.</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">취소</Button>
              <Button>저장</Button>
            </div>
          </CardContent>
        </Card>
      </SettingsShell>
    </div>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: "fullscreen"
  },
  render: () => <div className="min-h-screen space-y-10 bg-background p-6">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">사용자 설정 구조</p>
        <SettingsShell activeTab="notifications" description="개인 알림, 보안, 사용 환경을 한 화면 구조로 정리합니다." tabs={tabs} title="사용자 설정" onTabChange={() => undefined}>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>알림 규칙</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium text-foreground">변경 요청 멘션 알림</span>
                <Badge variant="success">즉시 발송</Badge>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/70 px-4 py-3">
                <span className="text-sm font-medium text-foreground">BOM 업로드 실패 알림</span>
                <Badge variant="outline">메일만</Badge>
              </div>
            </CardContent>
          </Card>
        </SettingsShell>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">프로젝트 설정 구조</p>
        <SettingsShell activeTab="parts" description="프로젝트 공통 정책, 라벨, 보안 설정을 동일한 레이아웃으로 감쌉니다." tabs={tabs} title="프로젝트 설정" onTabChange={() => undefined}>
          <Card className="border-border/70">
            <CardHeader>
              <CardTitle>부품 운영 정책</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">부품 승인 플로우와 자동 담당 규칙을 설정할 수 있습니다.</p>
              <div className="flex gap-2">
                <Button variant="outline">초기화</Button>
                <Button>정책 저장</Button>
              </div>
            </CardContent>
          </Card>
        </SettingsShell>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const w=["Default","Showcase"];export{a as Default,n as Showcase,w as __namedExportsOrder,H as default};
