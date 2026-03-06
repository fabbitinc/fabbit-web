import{j as n}from"./index-BC33NHKD.js";import{c as r,Q as s,R as t,U as c,V as h,W as o,Y as e,Z as a,S as l,_ as p}from"./user-avatar-Cz1MQ_Sd.js";import{F as i,S as x}from"./settings-CQ3R25cq.js";const u=[["rect",{width:"16",height:"20",x:"4",y:"2",rx:"2",key:"1nb95v"}],["line",{x1:"8",x2:"16",y1:"6",y2:"6",key:"x4nwl0"}],["line",{x1:"16",x2:"16",y1:"14",y2:"18",key:"wjye3r"}],["path",{d:"M16 10h.01",key:"1m94wz"}],["path",{d:"M12 10h.01",key:"1nrarc"}],["path",{d:"M8 10h.01",key:"19clt8"}],["path",{d:"M12 14h.01",key:"1etili"}],["path",{d:"M8 14h.01",key:"6423bh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M8 18h.01",key:"lrp35t"}]],j=r("calculator",u);const y=[["path",{d:"M8 2v4",key:"1cmpym"}],["path",{d:"M16 2v4",key:"4m81vk"}],["rect",{width:"18",height:"18",x:"3",y:"4",rx:"2",key:"1hopcy"}],["path",{d:"M3 10h18",key:"8toen8"}]],C=r("calendar",y),S={title:"UI/Command",component:s,tags:["autodocs"],parameters:{layout:"centered"}},m={render:()=>n.jsxs(s,{className:"w-[400px] rounded-lg border shadow-md",children:[n.jsx(t,{placeholder:"명령어를 입력하세요..."}),n.jsxs(c,{children:[n.jsx(h,{children:"검색 결과가 없습니다."}),n.jsxs(o,{heading:"빠른 이동",children:[n.jsxs(e,{children:[n.jsx(C,{}),n.jsx("span",{children:"생산 계획"}),n.jsx(a,{children:"⌘P"})]}),n.jsxs(e,{children:[n.jsx(l,{}),n.jsx("span",{children:"설비 검색"}),n.jsx(a,{children:"⌘K"})]}),n.jsxs(e,{children:[n.jsx(i,{}),n.jsx("span",{children:"작업지시 목록"}),n.jsx(a,{children:"⌘W"})]})]}),n.jsx(p,{}),n.jsxs(o,{heading:"설정",children:[n.jsxs(e,{children:[n.jsx(x,{}),n.jsx("span",{children:"시스템 설정"}),n.jsx(a,{children:"⌘,"})]}),n.jsxs(e,{children:[n.jsx(j,{}),n.jsx("span",{children:"수율 계산기"})]})]})]})]})},d={render:()=>n.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:n.jsxs("div",{children:[n.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"명령 팔레트"}),n.jsxs(s,{className:"w-[400px] rounded-lg border shadow-md",children:[n.jsx(t,{placeholder:"명령어를 입력하세요..."}),n.jsxs(c,{children:[n.jsx(h,{children:"검색 결과가 없습니다."}),n.jsxs(o,{heading:"빠른 이동",children:[n.jsxs(e,{children:[n.jsx(C,{}),n.jsx("span",{children:"생산 계획"}),n.jsx(a,{children:"⌘P"})]}),n.jsxs(e,{children:[n.jsx(l,{}),n.jsx("span",{children:"설비 검색"}),n.jsx(a,{children:"⌘K"})]}),n.jsxs(e,{children:[n.jsx(i,{}),n.jsx("span",{children:"작업지시 목록"})]})]}),n.jsx(p,{}),n.jsx(o,{heading:"설정",children:n.jsxs(e,{children:[n.jsx(x,{}),n.jsx("span",{children:"시스템 설정"}),n.jsx(a,{children:"⌘,"})]})})]})]})]})})};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Command className="w-[400px] rounded-lg border shadow-md">
      <CommandInput placeholder="명령어를 입력하세요..." />
      <CommandList>
        <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
        <CommandGroup heading="빠른 이동">
          <CommandItem>
            <Calendar />
            <span>생산 계획</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Search />
            <span>설비 검색</span>
            <CommandShortcut>⌘K</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileText />
            <span>작업지시 목록</span>
            <CommandShortcut>⌘W</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="설정">
          <CommandItem>
            <Settings />
            <span>시스템 설정</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Calculator />
            <span>수율 계산기</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">명령 팔레트</p>
        <Command className="w-[400px] rounded-lg border shadow-md">
          <CommandInput placeholder="명령어를 입력하세요..." />
          <CommandList>
            <CommandEmpty>검색 결과가 없습니다.</CommandEmpty>
            <CommandGroup heading="빠른 이동">
              <CommandItem>
                <Calendar />
                <span>생산 계획</span>
                <CommandShortcut>⌘P</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <Search />
                <span>설비 검색</span>
                <CommandShortcut>⌘K</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <FileText />
                <span>작업지시 목록</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="설정">
              <CommandItem>
                <Settings />
                <span>시스템 설정</span>
                <CommandShortcut>⌘,</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};const g=["Default","Showcase"],k=Object.freeze(Object.defineProperty({__proto__:null,Default:m,Showcase:d,__namedExportsOrder:g,default:S},Symbol.toStringTag,{value:"Module"}));export{k as _};
