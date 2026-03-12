import{j as e}from"./index-DRJbD1WP.js";import{P as s,b5 as l,b6 as n,b7 as i,b8 as d,b9 as a,ba as c}from"./user-avatar-DUF4fm1-.js";const g=[["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 12h18",key:"1i2n21"}],["rect",{x:"3",y:"3",width:"18",height:"18",rx:"2",key:"h1oib"}]],m=s("grid-2x2",g);const p=[["rect",{width:"7",height:"7",x:"3",y:"3",rx:"1",key:"1g98yp"}],["rect",{width:"7",height:"7",x:"3",y:"14",rx:"1",key:"1bb6yr"}],["path",{d:"M14 4h7",key:"3xa0d5"}],["path",{d:"M14 9h7",key:"1icrd9"}],["path",{d:"M14 15h7",key:"1mj8o2"}],["path",{d:"M14 20h7",key:"11slyb"}]],x=s("layout-list",p);const b=[["path",{d:"M6 4v6a6 6 0 0 0 12 0V4",key:"9kb039"}],["line",{x1:"4",x2:"20",y1:"20",y2:"20",key:"nun2al"}]],u=s("underline",b),h={title:"UI/Toggle",component:l,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsx(l,{"aria-label":"굵게",children:e.jsx(n,{})})},t={render:()=>e.jsx(l,{variant:"outline","aria-label":"기울임",children:e.jsx(i,{})})},o={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"단일 토글"}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(l,{"aria-label":"굵게",children:e.jsx(n,{})}),e.jsx(l,{"aria-label":"기울임",children:e.jsx(i,{})}),e.jsx(l,{"aria-label":"밑줄",children:e.jsx(u,{})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"토글 그룹 (단일 선택)"}),e.jsxs(d,{type:"single",defaultValue:"list",variant:"outline",children:[e.jsx(a,{value:"list","aria-label":"리스트 뷰",children:e.jsx(x,{})}),e.jsx(a,{value:"grid","aria-label":"그리드 뷰",children:e.jsx(m,{})}),e.jsx(a,{value:"board","aria-label":"보드 뷰",children:e.jsx(c,{})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"토글 그룹 (복수 선택)"}),e.jsxs(d,{type:"multiple",variant:"outline",children:[e.jsx(a,{value:"bold","aria-label":"굵게",children:e.jsx(n,{})}),e.jsx(a,{value:"italic","aria-label":"기울임",children:e.jsx(i,{})}),e.jsx(a,{value:"underline","aria-label":"밑줄",children:e.jsx(u,{})})]})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Toggle aria-label="굵게">
      <Bold />
    </Toggle>
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Toggle variant="outline" aria-label="기울임">
      <Italic />
    </Toggle>
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">단일 토글</p>
        <div className="flex gap-2">
          <Toggle aria-label="굵게"><Bold /></Toggle>
          <Toggle aria-label="기울임"><Italic /></Toggle>
          <Toggle aria-label="밑줄"><Underline /></Toggle>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">토글 그룹 (단일 선택)</p>
        <ToggleGroup type="single" defaultValue="list" variant="outline">
          <ToggleGroupItem value="list" aria-label="리스트 뷰">
            <LayoutList />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="그리드 뷰">
            <Grid2x2 />
          </ToggleGroupItem>
          <ToggleGroupItem value="board" aria-label="보드 뷰">
            <List />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">토글 그룹 (복수 선택)</p>
        <ToggleGroup type="multiple" variant="outline">
          <ToggleGroupItem value="bold" aria-label="굵게"><Bold /></ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="기울임"><Italic /></ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="밑줄"><Underline /></ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};const j=["Default","Outline","Showcase"],T=Object.freeze(Object.defineProperty({__proto__:null,Default:r,Outline:t,Showcase:o,__namedExportsOrder:j,default:h},Symbol.toStringTag,{value:"Module"}));export{T as _};
