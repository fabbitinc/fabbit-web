import{j as e}from"./index-B4avf9CM.js";import{aM as l,aN as a,L as i}from"./user-avatar-CJtlkw0_.js";const r={title:"UI/RadioGroup",component:l,tags:["autodocs"],parameters:{layout:"centered"}},s={render:()=>e.jsxs(l,{defaultValue:"option-1",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"option-1",id:"r1"}),e.jsx(i,{htmlFor:"r1",children:"자동 배정"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"option-2",id:"r2"}),e.jsx(i,{htmlFor:"r2",children:"수동 배정"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"option-3",id:"r3"}),e.jsx(i,{htmlFor:"r3",children:"우선순위 기반"})]})]})},n={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"300px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"작업자 배정 방식"}),e.jsxs(l,{defaultValue:"auto",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"auto",id:"assign-auto"}),e.jsx(i,{htmlFor:"assign-auto",children:"자동 배정"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"manual",id:"assign-manual"}),e.jsx(i,{htmlFor:"assign-manual",children:"수동 배정"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"priority",id:"assign-priority"}),e.jsx(i,{htmlFor:"assign-priority",children:"우선순위 기반"})]})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"검사 유형"}),e.jsxs(l,{defaultValue:"incoming",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"incoming",id:"qc-incoming"}),e.jsx(i,{htmlFor:"qc-incoming",children:"수입 검사"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"process",id:"qc-process"}),e.jsx(i,{htmlFor:"qc-process",children:"공정 검사"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"final",id:"qc-final"}),e.jsx(i,{htmlFor:"qc-final",children:"최종 검사"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(a,{value:"outgoing",id:"qc-outgoing"}),e.jsx(i,{htmlFor:"qc-outgoing",children:"출하 검사"})]})]})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <RadioGroup defaultValue="option-1">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-1" id="r1" />
        <Label htmlFor="r1">자동 배정</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-2" id="r2" />
        <Label htmlFor="r2">수동 배정</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="option-3" id="r3" />
        <Label htmlFor="r3">우선순위 기반</Label>
      </div>
    </RadioGroup>
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "300px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">작업자 배정 방식</p>
        <RadioGroup defaultValue="auto">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="auto" id="assign-auto" />
            <Label htmlFor="assign-auto">자동 배정</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="manual" id="assign-manual" />
            <Label htmlFor="assign-manual">수동 배정</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="priority" id="assign-priority" />
            <Label htmlFor="assign-priority">우선순위 기반</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">검사 유형</p>
        <RadioGroup defaultValue="incoming">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="incoming" id="qc-incoming" />
            <Label htmlFor="qc-incoming">수입 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="process" id="qc-process" />
            <Label htmlFor="qc-process">공정 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="final" id="qc-final" />
            <Label htmlFor="qc-final">최종 검사</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="outgoing" id="qc-outgoing" />
            <Label htmlFor="qc-outgoing">출하 검사</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};const t=["Default","Showcase"],c=Object.freeze(Object.defineProperty({__proto__:null,Default:s,Showcase:n,__namedExportsOrder:t,default:r},Symbol.toStringTag,{value:"Module"}));export{c as _};
