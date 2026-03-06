import{j as e}from"./index-QYnQWpJ5.js";import{C as t,j as a,k as s,J as o,l as i,K as l,B as d}from"./user-avatar-DJpZquVq.js";const c={title:"UI/Card",component:t,tags:["autodocs"],parameters:{layout:"centered"}},n={render:()=>e.jsxs(t,{className:"w-[350px]",children:[e.jsxs(a,{children:[e.jsx(s,{children:"카드 제목"}),e.jsx(o,{children:"카드 설명 영역입니다"})]}),e.jsx(i,{children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"카드 본문 영역입니다. 헤더, 본문, 푸터로 구성된 기본 카드입니다."})}),e.jsxs(l,{className:"justify-between",children:[e.jsx(d,{variant:"outline",children:"취소"}),e.jsx(d,{children:"저장"})]})]})},r={parameters:{layout:"padded"},render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"헤더 + 본문 + 푸터"}),e.jsxs(t,{className:"w-[350px]",children:[e.jsxs(a,{children:[e.jsx(s,{children:"설비 등록"}),e.jsx(o,{children:"새 설비 정보를 입력하세요"})]}),e.jsx(i,{children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"설비명, 모델, 설치 위치 등의 정보를 등록합니다."})}),e.jsxs(l,{className:"justify-between",children:[e.jsx(d,{variant:"outline",children:"취소"}),e.jsx(d,{children:"저장"})]})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"심플 카드 (푸터 없음)"}),e.jsxs(t,{className:"w-[350px]",children:[e.jsx(a,{children:e.jsx(s,{children:"공지사항"})}),e.jsx(i,{children:e.jsx("p",{className:"text-sm text-muted-foreground",children:"3월 15일 정기 점검으로 인해 시스템 사용이 제한됩니다."})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"설명만 있는 카드"}),e.jsx(t,{className:"w-[350px]",children:e.jsxs(a,{children:[e.jsx(s,{children:"작업지시 요약"}),e.jsx(o,{children:"이번 주 생산 계획에 포함된 작업지시 현황을 요약합니다."})]})})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>카드 제목</CardTitle>
        <CardDescription>카드 설명 영역입니다</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          카드 본문 영역입니다. 헤더, 본문, 푸터로 구성된 기본 카드입니다.
        </p>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline">취소</Button>
        <Button>저장</Button>
      </CardFooter>
    </Card>
}`,...n.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: "padded"
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "32px"
  }}>
      {/* 헤더 + 본문 + 푸터 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">헤더 + 본문 + 푸터</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>설비 등록</CardTitle>
            <CardDescription>새 설비 정보를 입력하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              설비명, 모델, 설치 위치 등의 정보를 등록합니다.
            </p>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="outline">취소</Button>
            <Button>저장</Button>
          </CardFooter>
        </Card>
      </div>

      {/* 심플 카드 (푸터 없음) */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">심플 카드 (푸터 없음)</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>공지사항</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              3월 15일 정기 점검으로 인해 시스템 사용이 제한됩니다.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 설명만 있는 카드 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">설명만 있는 카드</p>
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>작업지시 요약</CardTitle>
            <CardDescription>
              이번 주 생산 계획에 포함된 작업지시 현황을 요약합니다.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
}`,...r.parameters?.docs?.source}}};const m=["Default","Showcase"],p=Object.freeze(Object.defineProperty({__proto__:null,Default:n,Showcase:r,__namedExportsOrder:m,default:c},Symbol.toStringTag,{value:"Module"}));export{p as _};
