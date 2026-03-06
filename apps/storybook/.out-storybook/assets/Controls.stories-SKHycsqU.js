import{j as e}from"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import{a0 as c,L as i,a1 as m,a2 as o,a3 as t,a4 as x,d as p,e as u,f as h,g as j,h as s,a5 as f}from"./user-avatar-Cz1MQ_Sd.js";const S={component:c,tags:["autodocs"],parameters:{layout:"centered"}},n={render:()=>e.jsxs("label",{className:"flex min-w-[320px] items-start gap-3 rounded-lg border p-4",children:[e.jsx(c,{defaultChecked:!0,className:"mt-0.5"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium",children:"리뷰 완료 알림 받기"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"도면 검토가 끝나면 이메일과 인앱 알림을 동시에 보냅니다."})]})]})},l={render:()=>e.jsxs("div",{className:"flex min-w-[320px] items-center justify-between rounded-lg border p-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium",children:"자동 보관"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"30일 동안 변경이 없으면 프로젝트를 보관합니다."})]}),e.jsx(f,{defaultChecked:!0})]})},a={render:()=>e.jsxs("div",{className:"flex w-[320px] flex-col gap-2",children:[e.jsx(i,{htmlFor:"project-role",children:"권한"}),e.jsxs(p,{defaultValue:"editor",children:[e.jsx(u,{id:"project-role",children:e.jsx(h,{placeholder:"권한을 선택하세요"})}),e.jsxs(j,{children:[e.jsx(s,{value:"viewer",children:"뷰어"}),e.jsx(s,{value:"editor",children:"편집자"}),e.jsx(s,{value:"admin",children:"관리자"})]})]})]})},r={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(i,{htmlFor:"invite-code",children:"초대 코드"}),e.jsxs(m,{id:"invite-code",maxLength:6,defaultValue:"24A9B1",children:[e.jsxs(o,{children:[e.jsx(t,{index:0}),e.jsx(t,{index:1}),e.jsx(t,{index:2})]}),e.jsx(x,{}),e.jsxs(o,{children:[e.jsx(t,{index:3}),e.jsx(t,{index:4}),e.jsx(t,{index:5})]})]})]})},d={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"360px"},children:[e.jsxs("label",{className:"flex items-start gap-3 rounded-lg border p-4",children:[e.jsx(c,{defaultChecked:!0,className:"mt-0.5"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium",children:"리뷰 완료 알림 받기"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"도면 검토가 끝나면 알림을 보냅니다."})]})]}),e.jsxs("label",{className:"flex items-start gap-3 rounded-lg border p-4",children:[e.jsx(c,{className:"mt-0.5"}),e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium",children:"미확인 (체크 안됨)"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"체크되지 않은 상태입니다."})]})]}),e.jsxs("div",{className:"flex items-center justify-between rounded-lg border p-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx("p",{className:"text-sm font-medium",children:"자동 보관"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"30일 후 프로젝트를 보관합니다."})]}),e.jsx(f,{defaultChecked:!0})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(i,{children:"권한"}),e.jsxs(p,{defaultValue:"editor",children:[e.jsx(u,{children:e.jsx(h,{placeholder:"권한을 선택하세요"})}),e.jsxs(j,{children:[e.jsx(s,{value:"viewer",children:"뷰어"}),e.jsx(s,{value:"editor",children:"편집자"}),e.jsx(s,{value:"admin",children:"관리자"})]})]})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(i,{children:"초대 코드"}),e.jsxs(m,{maxLength:6,defaultValue:"24A9B1",children:[e.jsxs(o,{children:[e.jsx(t,{index:0}),e.jsx(t,{index:1}),e.jsx(t,{index:2})]}),e.jsx(x,{}),e.jsxs(o,{children:[e.jsx(t,{index:3}),e.jsx(t,{index:4}),e.jsx(t,{index:5})]})]})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <label className="flex min-w-[320px] items-start gap-3 rounded-lg border p-4">
      <Checkbox defaultChecked className="mt-0.5" />
      <div className="space-y-1">
        <p className="text-sm font-medium">리뷰 완료 알림 받기</p>
        <p className="text-muted-foreground text-sm">
          도면 검토가 끝나면 이메일과 인앱 알림을 동시에 보냅니다.
        </p>
      </div>
    </label>
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex min-w-[320px] items-center justify-between rounded-lg border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium">자동 보관</p>
        <p className="text-muted-foreground text-sm">
          30일 동안 변경이 없으면 프로젝트를 보관합니다.
        </p>
      </div>
      <Switch defaultChecked />
    </div>
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-role">권한</Label>
      <Select defaultValue="editor">
        <SelectTrigger id="project-role">
          <SelectValue placeholder="권한을 선택하세요" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="viewer">뷰어</SelectItem>
          <SelectItem value="editor">편집자</SelectItem>
          <SelectItem value="admin">관리자</SelectItem>
        </SelectContent>
      </Select>
    </div>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <Label htmlFor="invite-code">초대 코드</Label>
      <InputOTP id="invite-code" maxLength={6} defaultValue="24A9B1">
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
}`,...r.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "360px"
  }}>
      <label className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox defaultChecked className="mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">리뷰 완료 알림 받기</p>
          <p className="text-muted-foreground text-sm">도면 검토가 끝나면 알림을 보냅니다.</p>
        </div>
      </label>
      <label className="flex items-start gap-3 rounded-lg border p-4">
        <Checkbox className="mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium">미확인 (체크 안됨)</p>
          <p className="text-muted-foreground text-sm">체크되지 않은 상태입니다.</p>
        </div>
      </label>
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium">자동 보관</p>
          <p className="text-muted-foreground text-sm">30일 후 프로젝트를 보관합니다.</p>
        </div>
        <Switch defaultChecked />
      </div>
      <div className="flex flex-col gap-2">
        <Label>권한</Label>
        <Select defaultValue="editor">
          <SelectTrigger>
            <SelectValue placeholder="권한을 선택하세요" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">뷰어</SelectItem>
            <SelectItem value="editor">편집자</SelectItem>
            <SelectItem value="admin">관리자</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label>초대 코드</Label>
        <InputOTP maxLength={6} defaultValue="24A9B1">
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};const g=["CheckboxField","SwitchField","SelectField","InputOtpField","Showcase"],b=Object.freeze(Object.defineProperty({__proto__:null,CheckboxField:n,InputOtpField:r,SelectField:a,Showcase:d,SwitchField:l,__namedExportsOrder:g,default:S},Symbol.toStringTag,{value:"Module"}));export{b as _};
