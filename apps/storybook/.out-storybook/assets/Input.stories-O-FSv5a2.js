import{j as e}from"./index-CLb2Jpcn.js";import"./iframe-DHLUtKTr.js";import{v as a,L as l}from"./user-avatar-BVB2u2kD.js";const t={component:a,tags:["autodocs"],args:{placeholder:"프로젝트 이름을 입력하세요",disabled:!1},parameters:{layout:"centered"}},s={render:r=>e.jsxs("div",{className:"flex w-[320px] flex-col gap-2",children:[e.jsx(l,{htmlFor:"project-name",children:"프로젝트 이름"}),e.jsx(a,{id:"project-name",...r})]})},d={args:{defaultValue:"Fabbit Alpha"},render:r=>e.jsxs("div",{className:"flex w-[320px] flex-col gap-2",children:[e.jsx(l,{htmlFor:"project-slug",children:"프로젝트 코드"}),e.jsx(a,{id:"project-slug",...r})]})},n={args:{defaultValue:"읽기 전용 값",disabled:!0},render:r=>e.jsxs("div",{className:"flex w-[320px] flex-col gap-2",children:[e.jsx(l,{htmlFor:"readonly-field",children:"읽기 전용"}),e.jsx(a,{id:"readonly-field",...r})]})},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"320px"},children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(l,{children:"기본"}),e.jsx(a,{placeholder:"프로젝트 이름을 입력하세요"})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(l,{children:"값 입력됨"}),e.jsx(a,{defaultValue:"Fabbit Alpha"})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(l,{children:"비활성"}),e.jsx(a,{defaultValue:"읽기 전용 값",disabled:!0})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-name">프로젝트 이름</Label>
      <Input id="project-name" {...args} />
    </div>
}`,...s.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "Fabbit Alpha"
  },
  render: args => <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="project-slug">프로젝트 코드</Label>
      <Input id="project-slug" {...args} />
    </div>
}`,...d.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "읽기 전용 값",
    disabled: true
  },
  render: args => <div className="flex w-[320px] flex-col gap-2">
      <Label htmlFor="readonly-field">읽기 전용</Label>
      <Input id="readonly-field" {...args} />
    </div>
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "320px"
  }}>
      <div className="flex flex-col gap-2">
        <Label>기본</Label>
        <Input placeholder="프로젝트 이름을 입력하세요" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>값 입력됨</Label>
        <Input defaultValue="Fabbit Alpha" />
      </div>
      <div className="flex flex-col gap-2">
        <Label>비활성</Label>
        <Input defaultValue="읽기 전용 값" disabled />
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};const c=["Default","WithValue","Disabled","Showcase"],u=Object.freeze(Object.defineProperty({__proto__:null,Default:s,Disabled:n,Showcase:o,WithValue:d,__namedExportsOrder:c,default:t},Symbol.toStringTag,{value:"Module"}));export{u as _};
