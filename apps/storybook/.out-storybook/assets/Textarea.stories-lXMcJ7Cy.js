import{j as e}from"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import{i as a,L as o}from"./user-avatar-Cz1MQ_Sd.js";const c={component:a,tags:["autodocs"],args:{placeholder:"설명을 입력하세요",disabled:!1,rows:5},parameters:{layout:"centered"}},r={render:t=>e.jsxs("div",{className:"flex w-[360px] flex-col gap-2",children:[e.jsx(o,{htmlFor:"project-description",children:"프로젝트 설명"}),e.jsx(a,{id:"project-description",...t})]})},s={args:{defaultValue:"도면 검토 워크플로를 정리하고, 검토 결과를 공유하기 위한 내부 프로젝트입니다."},render:t=>e.jsxs("div",{className:"flex w-[360px] flex-col gap-2",children:[e.jsx(o,{htmlFor:"project-notes",children:"비고"}),e.jsx(a,{id:"project-notes",...t})]})},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"12px",width:"360px"},children:[e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(o,{children:"기본"}),e.jsx(a,{placeholder:"설명을 입력하세요",rows:3})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(o,{children:"값 입력됨"}),e.jsx(a,{defaultValue:"도면 검토 워크플로를 정리하고, 검토 결과를 공유합니다.",rows:3})]}),e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx(o,{children:"비활성"}),e.jsx(a,{defaultValue:"읽기 전용",rows:2,disabled:!0})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: args => <div className="flex w-[360px] flex-col gap-2">
      <Label htmlFor="project-description">프로젝트 설명</Label>
      <Textarea id="project-description" {...args} />
    </div>
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: "도면 검토 워크플로를 정리하고, 검토 결과를 공유하기 위한 내부 프로젝트입니다."
  },
  render: args => <div className="flex w-[360px] flex-col gap-2">
      <Label htmlFor="project-notes">비고</Label>
      <Textarea id="project-notes" {...args} />
    </div>
}`,...s.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    width: "360px"
  }}>
      <div className="flex flex-col gap-2">
        <Label>기본</Label>
        <Textarea placeholder="설명을 입력하세요" rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>값 입력됨</Label>
        <Textarea defaultValue="도면 검토 워크플로를 정리하고, 검토 결과를 공유합니다." rows={3} />
      </div>
      <div className="flex flex-col gap-2">
        <Label>비활성</Label>
        <Textarea defaultValue="읽기 전용" rows={2} disabled />
      </div>
    </div>
}`,...l.parameters?.docs?.source}}};const n=["Default","WithValue","Showcase"],x=Object.freeze(Object.defineProperty({__proto__:null,Default:r,Showcase:l,WithValue:s,__namedExportsOrder:n,default:c},Symbol.toStringTag,{value:"Module"}));export{x as _};
