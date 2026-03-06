import{j as e}from"./index-BC33NHKD.js";import{aP as n,aQ as l,B as t,aR as c,aS as d,aT as o,aU as h,L as x,I as m,aV as j,b as p,ar as u}from"./user-avatar-Cz1MQ_Sd.js";const S={title:"UI/Sheet",component:n,tags:["autodocs"],parameters:{layout:"centered"}},a={render:()=>e.jsxs(n,{children:[e.jsx(l,{asChild:!0,children:e.jsx(t,{variant:"outline",children:"시트 열기"})}),e.jsxs(c,{children:[e.jsxs(d,{children:[e.jsx(o,{children:"프로필 수정"}),e.jsx(h,{children:"프로필 정보를 변경하세요."})]}),e.jsxs("div",{className:"grid gap-4 py-4",children:[e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(x,{className:"text-right",children:"이름"}),e.jsx(m,{className:"col-span-3",placeholder:"이름"})]}),e.jsxs("div",{className:"grid grid-cols-4 items-center gap-4",children:[e.jsx(x,{className:"text-right",children:"이메일"}),e.jsx(m,{className:"col-span-3",placeholder:"이메일"})]})]}),e.jsx(j,{children:e.jsx(t,{type:"submit",children:"변경사항 저장"})})]})]})},r={render:()=>e.jsxs(n,{children:[e.jsx(l,{asChild:!0,children:e.jsx(t,{variant:"outline",children:"왼쪽 열기"})}),e.jsxs(c,{side:"left",children:[e.jsxs(d,{children:[e.jsx(o,{children:"네비게이션"}),e.jsx(h,{children:"사이드 네비게이션 패널"})]}),e.jsx("nav",{className:"flex flex-col gap-2 py-4",children:["대시보드","작업지시","설비 관리","품질 관리"].map(s=>e.jsx(t,{variant:"ghost",className:"justify-start",children:s},s))})]})]})},i={render:()=>e.jsxs("div",{style:{display:"flex",gap:"12px",flexWrap:"wrap"},children:[e.jsxs(n,{children:[e.jsx(l,{asChild:!0,children:e.jsx(t,{variant:"outline",children:"설비 상세"})}),e.jsxs(c,{children:[e.jsxs(d,{children:[e.jsx(o,{children:"CNC-001"}),e.jsx(h,{children:"5축 CNC 밀링머신"})]}),e.jsxs("div",{className:"flex flex-col gap-4 py-4",children:[e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"상태"}),e.jsx(p,{variant:"success",children:"가동"})]}),e.jsx(u,{}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"라인"}),e.jsx("span",{className:"text-sm",children:"A동 1라인"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"모델"}),e.jsx("span",{className:"text-sm",children:"DMG MORI NHX 5000"})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"최근 정비"}),e.jsx("span",{className:"text-sm",children:"2026-02-28"})]}),e.jsx(u,{}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"text-sm text-muted-foreground",children:"가동률"}),e.jsx("span",{className:"text-sm font-semibold",children:"94.2%"})]})]}),e.jsxs(j,{children:[e.jsx(t,{variant:"outline",children:"정비 기록"}),e.jsx(t,{children:"편집"})]})]})]}),e.jsxs(n,{children:[e.jsx(l,{asChild:!0,children:e.jsx(t,{variant:"outline",children:"네비게이션"})}),e.jsxs(c,{side:"left",children:[e.jsxs(d,{children:[e.jsx(o,{children:"메뉴"}),e.jsx(h,{children:"페이지를 선택하세요"})]}),e.jsx("nav",{className:"flex flex-col gap-1 py-4",children:["대시보드","작업지시","설비 관리","품질 관리","재고 관리","리포트"].map(s=>e.jsx(t,{variant:"ghost",className:"justify-start",children:s},s))})]})]}),e.jsxs(n,{children:[e.jsx(l,{asChild:!0,children:e.jsx(t,{variant:"outline",children:"하단 패널"})}),e.jsxs(c,{side:"bottom",children:[e.jsxs(d,{children:[e.jsx(o,{children:"빠른 필터"}),e.jsx(h,{children:"조건을 선택하세요"})]}),e.jsx("div",{className:"flex gap-2 py-4",children:["전체","가동","정지","정비중","고장"].map(s=>e.jsx(p,{variant:"outline",className:"cursor-pointer",children:s},s))})]})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">시트 열기</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>프로필 수정</SheetTitle>
          <SheetDescription>
            프로필 정보를 변경하세요.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">이름</Label>
            <Input className="col-span-3" placeholder="이름" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">이메일</Label>
            <Input className="col-span-3" placeholder="이메일" />
          </div>
        </div>
        <SheetFooter>
          <Button type="submit">변경사항 저장</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">왼쪽 열기</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>네비게이션</SheetTitle>
          <SheetDescription>사이드 네비게이션 패널</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 py-4">
          {["대시보드", "작업지시", "설비 관리", "품질 관리"].map(item => <Button key={item} variant="ghost" className="justify-start">
              {item}
            </Button>)}
        </nav>
      </SheetContent>
    </Sheet>
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  }}>
      {/* 우측 상세 패널 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">설비 상세</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>CNC-001</SheetTitle>
            <SheetDescription>5축 CNC 밀링머신</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">상태</span>
              <Badge variant="success">가동</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">라인</span>
              <span className="text-sm">A동 1라인</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">모델</span>
              <span className="text-sm">DMG MORI NHX 5000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">최근 정비</span>
              <span className="text-sm">2026-02-28</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">가동률</span>
              <span className="text-sm font-semibold">94.2%</span>
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline">정비 기록</Button>
            <Button>편집</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* 좌측 네비게이션 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">네비게이션</Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>메뉴</SheetTitle>
            <SheetDescription>페이지를 선택하세요</SheetDescription>
          </SheetHeader>
          <nav className="flex flex-col gap-1 py-4">
            {["대시보드", "작업지시", "설비 관리", "품질 관리", "재고 관리", "리포트"].map(item => <Button key={item} variant="ghost" className="justify-start">
                {item}
              </Button>)}
          </nav>
        </SheetContent>
      </Sheet>

      {/* 하단 패널 */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">하단 패널</Button>
        </SheetTrigger>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>빠른 필터</SheetTitle>
            <SheetDescription>조건을 선택하세요</SheetDescription>
          </SheetHeader>
          <div className="flex gap-2 py-4">
            {["전체", "가동", "정지", "정비중", "고장"].map(f => <Badge key={f} variant="outline" className="cursor-pointer">
                {f}
              </Badge>)}
          </div>
        </SheetContent>
      </Sheet>
    </div>
}`,...i.parameters?.docs?.source}}};const g=["Right","Left","Showcase"],v=Object.freeze(Object.defineProperty({__proto__:null,Left:r,Right:a,Showcase:i,__namedExportsOrder:g,default:S},Symbol.toStringTag,{value:"Module"}));export{v as _};
