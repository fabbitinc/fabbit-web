import{j as e}from"./index-DRJbD1WP.js";import{o as a,p as r,q as l}from"./user-avatar-DUF4fm1-.js";const i=Object.keys(l),x={title:"UI/Brand",tags:["autodocs"],parameters:{layout:"centered"}},n={name:"Marks (10 themes)",render:()=>e.jsx("div",{className:"grid grid-cols-5 gap-4",children:i.map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(r,{size:"lg",theme:s}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:l[s].name})]},s))})},c={"theme-primary-1":"Inter","theme-primary-2":"Montserrat","theme-primary-3":"Poppins","theme-primary-4":"Roboto","theme-primary-5":"Open Sans","theme-primary-6":"Lato","theme-primary-7":"Ubuntu","theme-primary-8":"JetBrains Mono","theme-primary-9":"Libre Franklin","theme-primary-10":"Noto Sans"},t={name:"Logos (10 fonts)",render:()=>e.jsx("div",{className:"flex flex-col gap-4",children:i.map(s=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(a,{size:"md",theme:s}),e.jsx("span",{className:"text-xs text-muted-foreground",children:c[s]})]},s))})},m={name:"Size variants",render:()=>e.jsxs("div",{className:"flex flex-col gap-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"Mark"}),e.jsxs("div",{className:"flex items-end gap-4",children:[e.jsx(r,{size:"xs"}),e.jsx(r,{size:"sm"}),e.jsx(r,{size:"md"}),e.jsx(r,{size:"lg"}),e.jsx(r,{size:"xl"})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"Logo"}),e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx(a,{size:"sm"}),e.jsx(a,{size:"md"}),e.jsx(a,{size:"lg"}),e.jsx(a,{size:"xl"})]})]})]})},d={render:()=>e.jsx("div",{className:"flex flex-col gap-4 rounded-xl bg-foreground p-8",children:i.slice(0,5).map(s=>e.jsx(a,{size:"md",theme:s,textClassName:"text-background"},s))})},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-10",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-4 text-sm font-medium text-muted-foreground",children:"10 Brand Marks"}),e.jsx("div",{className:"grid grid-cols-5 gap-6",children:i.map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(r,{size:"xl",theme:s}),e.jsx("span",{className:"text-xs font-medium",children:c[s]}),e.jsx("span",{className:"text-[10px] text-muted-foreground",children:s.replace("theme-primary-","#")})]},s))})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-4 text-sm font-medium text-muted-foreground",children:"Active Theme (auto-detect)"}),e.jsxs("div",{className:"flex flex-col gap-3",children:[e.jsx(a,{size:"lg"}),e.jsx(a,{size:"md"}),e.jsx(a,{size:"sm"})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-4 text-sm font-medium text-muted-foreground",children:"On Dark"}),e.jsx("div",{className:"rounded-xl bg-foreground p-6",children:e.jsx(a,{size:"lg",textClassName:"text-background"})})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  name: "Marks (10 themes)",
  render: () => <div className="grid grid-cols-5 gap-4">
      {themeKeys.map(key => <div key={key} className="flex flex-col items-center gap-2">
          <BrandMark size="lg" theme={key} />
          <span className="text-[10px] text-muted-foreground">
            {brandThemes[key].name}
          </span>
        </div>)}
    </div>
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  name: "Logos (10 fonts)",
  render: () => <div className="flex flex-col gap-4">
      {themeKeys.map(key => <div key={key} className="flex items-center gap-4">
          <BrandLogo size="md" theme={key} />
          <span className="text-xs text-muted-foreground">
            {fontLabels[key]}
          </span>
        </div>)}
    </div>
}`,...t.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "Size variants",
  render: () => <div className="flex flex-col gap-6">
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Mark</p>
        <div className="flex items-end gap-4">
          <BrandMark size="xs" />
          <BrandMark size="sm" />
          <BrandMark size="md" />
          <BrandMark size="lg" />
          <BrandMark size="xl" />
        </div>
      </div>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Logo</p>
        <div className="flex flex-col gap-3">
          <BrandLogo size="sm" />
          <BrandLogo size="md" />
          <BrandLogo size="lg" />
          <BrandLogo size="xl" />
        </div>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4 rounded-xl bg-foreground p-8">
      {themeKeys.slice(0, 5).map(key => <BrandLogo key={key} size="md" theme={key} textClassName="text-background" />)}
    </div>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-10">
      {/* All 10 marks */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          10 Brand Marks
        </p>
        <div className="grid grid-cols-5 gap-6">
          {themeKeys.map(key => <div key={key} className="flex flex-col items-center gap-2">
              <BrandMark size="xl" theme={key} />
              <span className="text-xs font-medium">{fontLabels[key]}</span>
              <span className="text-[10px] text-muted-foreground">
                {key.replace("theme-primary-", "#")}
              </span>
            </div>)}
        </div>
      </div>

      {/* Active theme (auto-detect) */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          Active Theme (auto-detect)
        </p>
        <div className="flex flex-col gap-3">
          <BrandLogo size="lg" />
          <BrandLogo size="md" />
          <BrandLogo size="sm" />
        </div>
      </div>

      {/* On dark */}
      <div>
        <p className="mb-4 text-sm font-medium text-muted-foreground">
          On Dark
        </p>
        <div className="rounded-xl bg-foreground p-6">
          <BrandLogo size="lg" textClassName="text-background" />
        </div>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};const p=["AllMarks","AllLogos","Sizes","OnDark","Showcase"],f=Object.freeze(Object.defineProperty({__proto__:null,AllLogos:t,AllMarks:n,OnDark:d,Showcase:o,Sizes:m,__namedExportsOrder:p,default:x},Symbol.toStringTag,{value:"Module"}));export{f as _};
