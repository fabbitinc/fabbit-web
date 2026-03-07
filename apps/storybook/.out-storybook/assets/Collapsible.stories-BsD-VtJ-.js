import{j as e}from"./index-B4avf9CM.js";import{r}from"./iframe-DjFiVPSj.js";import{N as t,O as l,B as o,P as i}from"./user-avatar-CJtlkw0_.js";import{C as m}from"./chevrons-up-down-cjEB4Cse.js";const x={title:"UI/Collapsible",component:t,tags:["autodocs"],parameters:{layout:"centered"}},s={render:()=>{const[a,d]=r.useState(!1);return e.jsxs(t,{open:a,onOpenChange:d,className:"w-[350px] space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-md border px-4 py-2",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"상세 필터"}),e.jsx(l,{asChild:!0,children:e.jsx(o,{variant:"ghost",size:"sm",children:e.jsx(m,{className:"size-4"})})})]}),e.jsxs(i,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"공정: CNC 밀링"}),e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"설비: CNC-001 ~ CNC-005"}),e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"기간: 2026-03-01 ~ 2026-03-07"})]})]})}},n={render:()=>{const[a,d]=r.useState(!1),[p,c]=r.useState(!0);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px",width:"350px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"필터 패널"}),e.jsxs(t,{open:a,onOpenChange:d,className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-md border px-4 py-2",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"상세 필터"}),e.jsx(l,{asChild:!0,children:e.jsx(o,{variant:"ghost",size:"sm",children:e.jsx(m,{className:"size-4"})})})]}),e.jsxs(i,{className:"space-y-2",children:[e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"공정: CNC 밀링"}),e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"설비: CNC-001 ~ CNC-005"}),e.jsx("div",{className:"rounded-md border px-4 py-2 text-sm",children:"기간: 2026-03-01 ~ 2026-03-07"})]})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"부가 정보 (기본 열림)"}),e.jsxs(t,{open:p,onOpenChange:c,className:"space-y-2",children:[e.jsxs("div",{className:"flex items-center justify-between rounded-md border px-4 py-2",children:[e.jsx("h4",{className:"text-sm font-semibold",children:"검사 이력"}),e.jsx(l,{asChild:!0,children:e.jsx(o,{variant:"ghost",size:"sm",children:e.jsx(m,{className:"size-4"})})})]}),e.jsxs(i,{className:"space-y-2",children:[e.jsxs("div",{className:"rounded-md border px-4 py-2 text-sm",children:[e.jsx("p",{className:"font-medium",children:"수입 검사 #QC-0412"}),e.jsx("p",{className:"text-muted-foreground",children:"2026-03-05 합격 (전량)"})]}),e.jsxs("div",{className:"rounded-md border px-4 py-2 text-sm",children:[e.jsx("p",{className:"font-medium",children:"공정 검사 #QC-0415"}),e.jsx("p",{className:"text-muted-foreground",children:"2026-03-06 합격 (샘플링 n=5)"})]})]})]})]})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [open, setOpen] = useState(false);
    return <Collapsible open={open} onOpenChange={setOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between rounded-md border px-4 py-2">
          <h4 className="text-sm font-semibold">상세 필터</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <ChevronsUpDown className="size-4" />
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">공정: CNC 밀링</div>
          <div className="rounded-md border px-4 py-2 text-sm">설비: CNC-001 ~ CNC-005</div>
          <div className="rounded-md border px-4 py-2 text-sm">기간: 2026-03-01 ~ 2026-03-07</div>
        </CollapsibleContent>
      </Collapsible>;
  }
}`,...s.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [filter, setFilter] = useState(false);
    const [detail, setDetail] = useState(true);
    return <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      width: "350px"
    }}>
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">필터 패널</p>
          <Collapsible open={filter} onOpenChange={setFilter} className="space-y-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-2">
              <h4 className="text-sm font-semibold">상세 필터</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-md border px-4 py-2 text-sm">공정: CNC 밀링</div>
              <div className="rounded-md border px-4 py-2 text-sm">설비: CNC-001 ~ CNC-005</div>
              <div className="rounded-md border px-4 py-2 text-sm">기간: 2026-03-01 ~ 2026-03-07</div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">부가 정보 (기본 열림)</p>
          <Collapsible open={detail} onOpenChange={setDetail} className="space-y-2">
            <div className="flex items-center justify-between rounded-md border px-4 py-2">
              <h4 className="text-sm font-semibold">검사 이력</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronsUpDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-2">
              <div className="rounded-md border px-4 py-2 text-sm">
                <p className="font-medium">수입 검사 #QC-0412</p>
                <p className="text-muted-foreground">2026-03-05 합격 (전량)</p>
              </div>
              <div className="rounded-md border px-4 py-2 text-sm">
                <p className="font-medium">공정 검사 #QC-0415</p>
                <p className="text-muted-foreground">2026-03-06 합격 (샘플링 n=5)</p>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>;
  }
}`,...n.parameters?.docs?.source}}};const u=["Default","Showcase"],f=Object.freeze(Object.defineProperty({__proto__:null,Default:s,Showcase:n,__namedExportsOrder:u,default:x},Symbol.toStringTag,{value:"Module"}));export{f as _};
