import{j as e}from"./index-DRJbD1WP.js";import{r as d}from"./iframe-1IsFew62.js";import{C as s,y as l}from"./user-avatar-DUF4fm1-.js";const c={title:"UI/Calendar",component:s,tags:["autodocs"],parameters:{layout:"centered"}},n={render:()=>{const[r,a]=d.useState(new Date);return e.jsx(s,{mode:"single",selected:r,onSelect:a,className:"rounded-md border"})}},t={render:()=>{const[r,a]=d.useState(new Date),[o,m]=d.useState({from:new Date,to:l(new Date,6)});return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",alignItems:"center"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"단일 날짜 선택 (납기일)"}),e.jsx(s,{mode:"single",selected:r,onSelect:a,className:"rounded-md border"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"범위 선택 (생산 계획 기간)"}),e.jsx(s,{mode:"range",selected:o,onSelect:m,numberOfMonths:2,className:"rounded-md border"})]})]})}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [date, setDate] = useState<Date | undefined>(new Date());
    return <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />;
  }
}`,...n.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [single, setSingle] = useState<Date | undefined>(new Date());
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(),
      to: addDays(new Date(), 6)
    });
    return <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      alignItems: "center"
    }}>
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            단일 날짜 선택 (납기일)
          </p>
          <Calendar mode="single" selected={single} onSelect={setSingle} className="rounded-md border" />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            범위 선택 (생산 계획 기간)
          </p>
          <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} className="rounded-md border" />
        </div>
      </div>;
  }
}`,...t.parameters?.docs?.source}}};const i=["Default","Showcase"],f=Object.freeze(Object.defineProperty({__proto__:null,Default:n,Showcase:t,__namedExportsOrder:i,default:c},Symbol.toStringTag,{value:"Module"}));export{f as _};
