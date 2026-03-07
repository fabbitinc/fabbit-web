import{j as e}from"./index-B4avf9CM.js";import{aV as s,E as m,F as d,J as t}from"./user-avatar-CJtlkw0_.js";const r={title:"UI/Skeleton",component:s,tags:["autodocs"],parameters:{layout:"centered"}},a={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(s,{className:"h-12 w-12 rounded-full"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{className:"h-4 w-[250px]"}),e.jsx(s,{className:"h-4 w-[200px]"})]})]})},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"프로필"}),e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(s,{className:"h-12 w-12 rounded-full"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(s,{className:"h-4 w-[180px]"}),e.jsx(s,{className:"h-3 w-[120px]"})]})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"카드 로딩"}),e.jsxs(m,{className:"w-[350px]",children:[e.jsxs(d,{className:"gap-2",children:[e.jsx(s,{className:"h-5 w-1/2"}),e.jsx(s,{className:"h-4 w-4/5"})]}),e.jsxs(t,{className:"space-y-3",children:[e.jsx(s,{className:"h-4 w-full"}),e.jsx(s,{className:"h-4 w-full"}),e.jsx(s,{className:"h-4 w-3/4"})]})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"KPI 카드 로딩"}),e.jsx("div",{className:"flex gap-4",children:Array.from({length:3}).map((c,l)=>e.jsxs(m,{className:"w-[180px]",children:[e.jsxs(d,{className:"gap-2 pb-2",children:[e.jsx(s,{className:"h-3 w-12"}),e.jsx(s,{className:"h-7 w-16"})]}),e.jsx(t,{children:e.jsx(s,{className:"h-5 w-14 rounded-full"})})]},l))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"테이블 로딩"}),e.jsxs("div",{className:"w-[500px] space-y-3",children:[e.jsx(s,{className:"h-8 w-full"}),Array.from({length:5}).map((c,l)=>e.jsxs("div",{className:"flex gap-4",children:[e.jsx(s,{className:"h-6 w-[100px]"}),e.jsx(s,{className:"h-6 w-[80px]"}),e.jsx(s,{className:"h-6 flex-1"}),e.jsx(s,{className:"h-6 w-[80px]"})]},l))]})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  }}>
      {/* 프로필 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">프로필</p>
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[180px]" />
            <Skeleton className="h-3 w-[120px]" />
          </div>
        </div>
      </div>

      {/* 카드 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">카드 로딩</p>
        <Card className="w-[350px]">
          <CardHeader className="gap-2">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>

      {/* KPI 카드 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">KPI 카드 로딩</p>
        <div className="flex gap-4">
          {Array.from({
          length: 3
        }).map((_, i) => <Card key={i} className="w-[180px]">
              <CardHeader className="gap-2 pb-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-7 w-16" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-5 w-14 rounded-full" />
              </CardContent>
            </Card>)}
        </div>
      </div>

      {/* 테이블 스켈레톤 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">테이블 로딩</p>
        <div className="w-[500px] space-y-3">
          <Skeleton className="h-8 w-full" />
          {Array.from({
          length: 5
        }).map((_, i) => <div key={i} className="flex gap-4">
              <Skeleton className="h-6 w-[100px]" />
              <Skeleton className="h-6 w-[80px]" />
              <Skeleton className="h-6 flex-1" />
              <Skeleton className="h-6 w-[80px]" />
            </div>)}
        </div>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const o=["Default","Showcase"],p=Object.freeze(Object.defineProperty({__proto__:null,Default:a,Showcase:n,__namedExportsOrder:o,default:r},Symbol.toStringTag,{value:"Module"}));export{p as _};
