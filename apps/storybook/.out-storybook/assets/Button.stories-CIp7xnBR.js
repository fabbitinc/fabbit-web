import{j as e}from"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import{B as n}from"./user-avatar-CJtlkw0_.js";const d={component:n,tags:["autodocs"],args:{children:"새 항목 만들기",variant:"default",size:"default",disabled:!1},argTypes:{children:{control:"text"}},parameters:{layout:"centered"}},t={},s={args:{variant:"outline"}},r={args:{children:"프로젝트 추가"},render:o=>e.jsxs(n,{...o,children:[e.jsx("span",{className:"text-base leading-none",children:"+"}),o.children]})},a={args:{children:"삭제",variant:"destructive"}},i={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"variant"}),e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center"},children:[e.jsx(n,{children:"새 항목 만들기"}),e.jsx(n,{variant:"secondary",children:"보조 작업"}),e.jsx(n,{variant:"outline",children:"아웃라인"}),e.jsx(n,{variant:"ghost",children:"고스트"}),e.jsx(n,{variant:"destructive",children:"삭제"}),e.jsx(n,{variant:"link",children:"링크"})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"size"}),e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center"},children:[e.jsx(n,{size:"sm",children:"작은 버튼"}),e.jsx(n,{children:"기본 버튼"}),e.jsx(n,{size:"lg",children:"큰 버튼"}),e.jsx(n,{size:"icon",children:e.jsx("span",{className:"text-base leading-none",children:"+"})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"상태"}),e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:"8px",alignItems:"center"},children:[e.jsx(n,{children:"활성"}),e.jsx(n,{disabled:!0,children:"비활성"})]})]})]})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:"{}",...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "outline"
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    children: "프로젝트 추가"
  },
  render: args => <Button {...args}>
      <span className="text-base leading-none">+</span>
      {args.children}
    </Button>
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    children: "삭제",
    variant: "destructive"
  }
}`,...a.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">variant</p>
        <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center"
      }}>
          <Button>새 항목 만들기</Button>
          <Button variant="secondary">보조 작업</Button>
          <Button variant="outline">아웃라인</Button>
          <Button variant="ghost">고스트</Button>
          <Button variant="destructive">삭제</Button>
          <Button variant="link">링크</Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">size</p>
        <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center"
      }}>
          <Button size="sm">작은 버튼</Button>
          <Button>기본 버튼</Button>
          <Button size="lg">큰 버튼</Button>
          <Button size="icon"><span className="text-base leading-none">+</span></Button>
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">상태</p>
        <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px",
        alignItems: "center"
      }}>
          <Button>활성</Button>
          <Button disabled>비활성</Button>
        </div>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};const l=["Default","Outline","WithIcon","Destructive","Showcase"],m=Object.freeze(Object.defineProperty({__proto__:null,Default:t,Destructive:a,Outline:s,Showcase:i,WithIcon:r,__namedExportsOrder:l,default:d},Symbol.toStringTag,{value:"Module"}));export{m as _};
