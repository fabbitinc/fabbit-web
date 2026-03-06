import{j as e}from"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import{am as i,an as d,ao as s,ap as a,aq as c,ar as m}from"./user-avatar-Cz1MQ_Sd.js";const o={component:i,tags:["autodocs"],parameters:{layout:"centered"}},t={render:()=>e.jsx("div",{style:{width:"420px"},children:e.jsx("div",{className:"rounded-2xl border bg-background p-4 shadow-sm",children:e.jsxs(i,{defaultValue:"overview",children:[e.jsxs(d,{children:[e.jsx(s,{value:"overview",children:"개요"}),e.jsx(s,{value:"timeline",children:"타임라인"}),e.jsx(s,{value:"members",children:"멤버"})]}),e.jsx(a,{value:"overview",className:"pt-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("p",{className:"text-sm font-medium",children:"프로젝트 개요"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"최신 변경 요청, 분석 상태, 검토 현황을 한 화면에서 확인합니다."})]})}),e.jsx(a,{value:"timeline",className:"pt-4",children:e.jsx(c,{className:"h-32 rounded-xl border",children:e.jsx("div",{className:"space-y-3 p-4",children:["도면 업로드","속성 매핑 검토","BOM 비교 완료"].map((n,r)=>e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:n}),e.jsxs("span",{className:"text-muted-foreground",children:[r+1,"단계"]})]}),r<2&&e.jsx(m,{})]},n))})})}),e.jsx(a,{value:"members",className:"pt-4",children:e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"디자인 팀"}),e.jsx("span",{className:"text-muted-foreground",children:"4명"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"품질 팀"}),e.jsx("span",{className:"text-muted-foreground",children:"2명"})]})]})})]})})})},l={render:()=>e.jsx("div",{className:"w-[420px] rounded-2xl border bg-background p-4 shadow-sm",children:e.jsxs(i,{defaultValue:"overview",children:[e.jsxs(d,{children:[e.jsx(s,{value:"overview",children:"개요"}),e.jsx(s,{value:"timeline",children:"타임라인"}),e.jsx(s,{value:"members",children:"멤버"})]}),e.jsx(a,{value:"overview",className:"pt-4",children:e.jsxs("div",{className:"space-y-3",children:[e.jsx("p",{className:"text-sm font-medium",children:"프로젝트 개요"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"최신 변경 요청, 분석 상태, 검토 현황을 한 화면에서 빠르게 확인합니다."})]})}),e.jsx(a,{value:"timeline",className:"pt-4",children:e.jsx(c,{className:"h-44 rounded-xl border",children:e.jsx("div",{className:"space-y-4 p-4",children:["도면 업로드","속성 매핑 검토","BOM 비교 완료","변경 요청 발행","최종 승인"].map((n,r)=>e.jsxs("div",{className:"space-y-3",children:[e.jsxs("div",{className:"flex items-center justify-between text-sm",children:[e.jsx("span",{children:n}),e.jsxs("span",{className:"text-muted-foreground",children:[r+1,"단계"]})]}),r<4&&e.jsx(m,{})]},n))})})}),e.jsx(a,{value:"members",className:"pt-4",children:e.jsxs("div",{className:"space-y-3 text-sm",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"디자인 팀"}),e.jsx("span",{className:"text-muted-foreground",children:"4명"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"품질 팀"}),e.jsx("span",{className:"text-muted-foreground",children:"2명"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{children:"외부 협력사"}),e.jsx("span",{className:"text-muted-foreground",children:"1명"})]})]})})]})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    width: "420px"
  }}>
      <div className="rounded-2xl border bg-background p-4 shadow-sm">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="timeline">타임라인</TabsTrigger>
            <TabsTrigger value="members">멤버</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="pt-4">
            <div className="space-y-3">
              <p className="text-sm font-medium">프로젝트 개요</p>
              <p className="text-muted-foreground text-sm">최신 변경 요청, 분석 상태, 검토 현황을 한 화면에서 확인합니다.</p>
            </div>
          </TabsContent>
          <TabsContent value="timeline" className="pt-4">
            <ScrollArea className="h-32 rounded-xl border">
              <div className="space-y-3 p-4">
                {["도면 업로드", "속성 매핑 검토", "BOM 비교 완료"].map((item, i) => <div key={item} className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item}</span>
                      <span className="text-muted-foreground">{i + 1}단계</span>
                    </div>
                    {i < 2 && <Separator />}
                  </div>)}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="members" className="pt-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>디자인 팀</span>
                <span className="text-muted-foreground">4명</span>
              </div>
              <div className="flex items-center justify-between">
                <span>품질 팀</span>
                <span className="text-muted-foreground">2명</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[420px] rounded-2xl border bg-background p-4 shadow-sm">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
          <TabsTrigger value="members">멤버</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="pt-4">
          <div className="space-y-3">
            <p className="text-sm font-medium">프로젝트 개요</p>
            <p className="text-muted-foreground text-sm">
              최신 변경 요청, 분석 상태, 검토 현황을 한 화면에서 빠르게 확인합니다.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="timeline" className="pt-4">
          <ScrollArea className="h-44 rounded-xl border">
            <div className="space-y-4 p-4">
              {["도면 업로드", "속성 매핑 검토", "BOM 비교 완료", "변경 요청 발행", "최종 승인"].map((item, index) => <div key={item} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{item}</span>
                    <span className="text-muted-foreground">{index + 1}단계</span>
                  </div>
                  {index < 4 && <Separator />}
                </div>)}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="members" className="pt-4">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>디자인 팀</span>
              <span className="text-muted-foreground">4명</span>
            </div>
            <div className="flex items-center justify-between">
              <span>품질 팀</span>
              <span className="text-muted-foreground">2명</span>
            </div>
            <div className="flex items-center justify-between">
              <span>외부 협력사</span>
              <span className="text-muted-foreground">1명</span>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
}`,...l.parameters?.docs?.source}}};const p=["Showcase","ProjectWorkspace"],b=Object.freeze(Object.defineProperty({__proto__:null,ProjectWorkspace:l,Showcase:t,__namedExportsOrder:p,default:o},Symbol.toStringTag,{value:"Module"}));export{b as _};
