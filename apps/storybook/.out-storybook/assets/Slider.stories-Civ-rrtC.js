import{j as e}from"./index-DRJbD1WP.js";import{aW as l,L as r}from"./user-avatar-DUF4fm1-.js";const t={title:"UI/Slider",component:l,tags:["autodocs"],parameters:{layout:"centered"}},a={render:()=>e.jsx("div",{className:"w-[300px]",children:e.jsx(l,{defaultValue:[50],max:100,step:1})})},s={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"300px"},children:[e.jsxs("div",{className:"space-y-3",children:[e.jsx(r,{children:"가동률 목표 (%)"}),e.jsx(l,{defaultValue:[90],max:100,step:1})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(r,{children:"허용 불량률 (%)"}),e.jsx(l,{defaultValue:[2],max:10,step:.1})]}),e.jsxs("div",{className:"space-y-3",children:[e.jsx(r,{children:"알림 임계값 (개)"}),e.jsx(l,{defaultValue:[50],max:200,step:10})]})]})};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    width: "300px"
  }}>
      <div className="space-y-3">
        <Label>가동률 목표 (%)</Label>
        <Slider defaultValue={[90]} max={100} step={1} />
      </div>

      <div className="space-y-3">
        <Label>허용 불량률 (%)</Label>
        <Slider defaultValue={[2]} max={10} step={0.1} />
      </div>

      <div className="space-y-3">
        <Label>알림 임계값 (개)</Label>
        <Slider defaultValue={[50]} max={200} step={10} />
      </div>
    </div>
}`,...s.parameters?.docs?.source}}};const d=["Default","Showcase"],i=Object.freeze(Object.defineProperty({__proto__:null,Default:a,Showcase:s,__namedExportsOrder:d,default:t},Symbol.toStringTag,{value:"Module"}));export{i as _};
