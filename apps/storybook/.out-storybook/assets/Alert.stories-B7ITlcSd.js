import{j as e}from"./index-DRJbD1WP.js";import{k as t,l as s,m as r,n as a}from"./user-avatar-DUF4fm1-.js";import{I as l}from"./info-Em3TPLDt.js";import{C as c}from"./circle-check-big-C29FOg5M.js";import{C as m}from"./circle-alert-7zZvF5ip.js";const d={title:"UI/Alert",component:t,tags:["autodocs"],parameters:{layout:"centered"}},n={render:()=>e.jsxs(t,{className:"w-[450px]",children:[e.jsx(l,{className:"size-4"}),e.jsx(s,{children:"안내"}),e.jsx(r,{children:"시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다."})]})},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px",width:"450px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본"}),e.jsxs(t,{children:[e.jsx(l,{className:"size-4"}),e.jsx(s,{children:"안내"}),e.jsx(r,{children:"시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다."})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"성공"}),e.jsxs(t,{variant:"success",children:[e.jsx(c,{className:"size-4"}),e.jsx(s,{children:"입고 완료"}),e.jsx(r,{children:"PO-2026-0087 발주 건 전량 입고 처리되었습니다."})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"경고"}),e.jsxs(t,{variant:"warning",children:[e.jsx(a,{className:"size-4"}),e.jsx(s,{children:"재고 부족 경고"}),e.jsx(r,{children:"AL-6061 원자재 재고가 안전 재고(100kg) 이하입니다. 발주를 검토하세요."})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"위험"}),e.jsxs(t,{variant:"destructive",children:[e.jsx(m,{className:"size-4"}),e.jsx(s,{children:"설비 이상 감지"}),e.jsx(r,{children:"CNC-003 주축 온도가 임계값(85°C)을 초과했습니다. 즉시 점검이 필요합니다."})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"정보"}),e.jsxs(t,{variant:"info",children:[e.jsx(l,{className:"size-4"}),e.jsx(s,{children:"ECN 적용 알림"}),e.jsx(r,{children:"ECN-0023이 승인되어 BOM Rev.3이 활성화되었습니다."})]})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <Alert className="w-[450px]">
      <Info className="size-4" />
      <AlertTitle>안내</AlertTitle>
      <AlertDescription>
        시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다.
      </AlertDescription>
    </Alert>
}`,...n.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    width: "450px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본</p>
        <Alert>
          <Info className="size-4" />
          <AlertTitle>안내</AlertTitle>
          <AlertDescription>
            시스템 점검이 03/10(월) 02:00~06:00에 예정되어 있습니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">성공</p>
        <Alert variant="success">
          <CheckCircle className="size-4" />
          <AlertTitle>입고 완료</AlertTitle>
          <AlertDescription>
            PO-2026-0087 발주 건 전량 입고 처리되었습니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">경고</p>
        <Alert variant="warning">
          <TriangleAlert className="size-4" />
          <AlertTitle>재고 부족 경고</AlertTitle>
          <AlertDescription>
            AL-6061 원자재 재고가 안전 재고(100kg) 이하입니다. 발주를 검토하세요.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">위험</p>
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>설비 이상 감지</AlertTitle>
          <AlertDescription>
            CNC-003 주축 온도가 임계값(85°C)을 초과했습니다. 즉시 점검이 필요합니다.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">정보</p>
        <Alert variant="info">
          <Info className="size-4" />
          <AlertTitle>ECN 적용 알림</AlertTitle>
          <AlertDescription>
            ECN-0023이 승인되어 BOM Rev.3이 활성화되었습니다.
          </AlertDescription>
        </Alert>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};const o=["Default","Showcase"],j=Object.freeze(Object.defineProperty({__proto__:null,Default:n,Showcase:i,__namedExportsOrder:o,default:d},Symbol.toStringTag,{value:"Module"}));export{j as _};
