import{j as t}from"./index-BC33NHKD.js";import{r as l}from"./iframe-BDY6rKdT.js";import{al as n,B as P,b as j}from"./user-avatar-Cz1MQ_Sd.js";import{T}from"./tag-gRIXPjqS.js";const c=[{value:"improvement",label:"개선",color:"#14b8a6"},{value:"supplier",label:"공급사",color:"#f97316"},{value:"design-change",label:"설계변경",color:"#3b82f6"},{value:"test",label:"시험검증",color:"#64748b"},{value:"priority-low",label:"우선순위:낮음",color:"#22c55e"},{value:"priority-high",label:"우선순위:높음",color:"#ef4444"},{value:"review",label:"검토중",color:"#8b5cf6"},{value:"production",label:"양산",color:"#06b6d4"},{value:"prototype",label:"시작품",color:"#eab308"},{value:"cost-down",label:"원가절감",color:"#ec4899"}],r=["supplier","design-change","priority-low"];function d(e){return t.jsxs(P,{variant:"outline",size:"sm",children:[t.jsx(T,{className:"size-4"}),"라벨",e>0&&t.jsx(j,{variant:"secondary",className:"ml-1 size-5 p-0 text-[10px]",children:e})]})}const A={component:n,tags:["autodocs"],parameters:{layout:"centered"}},o={render:()=>{const[e,s]=l.useState(r);return t.jsx(n,{items:c,selectedValues:e,onSelectedChange:s,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:"default",trigger:d(e.length)})}},i={render:()=>{const[e,s]=l.useState(r);return t.jsx(n,{items:c,selectedValues:e,onSelectedChange:s,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:"minimal",trigger:d(e.length)})}},g={render:()=>{const[e,s]=l.useState(r);return t.jsx(n,{items:c,selectedValues:e,onSelectedChange:s,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:"chip",trigger:d(e.length)})}},m={render:()=>{const[e,s]=l.useState(r);return t.jsx(n,{items:c,selectedValues:e,onSelectedChange:s,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:"bordered",trigger:d(e.length)})}},u={render:()=>{const[e,s]=l.useState(r);return t.jsx(n,{items:c,selectedValues:e,onSelectedChange:s,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:"pill",trigger:d(e.length)})}},p={parameters:{layout:"padded"},render:()=>{const[e,s]=l.useState(r),[S,h]=l.useState(r),[v,b]=l.useState(r),[x,L]=l.useState(r),[f,I]=l.useState(r),N=[{name:"Default",desc:"컬러 배지 + 체크박스 + 확인 버튼",design:"default",val:e,set:s},{name:"Minimal",desc:"컬러 텍스트 + 체크마크 + 구분선",design:"minimal",val:S,set:h},{name:"Chip",desc:"사각 컬러 칩 + 테두리 배지",design:"chip",val:v,set:b},{name:"Bordered",desc:"색상 도트 + 두꺼운 테두리 + 하이라이트",design:"bordered",val:x,set:L},{name:"Pill",desc:"솔리드 둥근 배지 + 원형 체크",design:"pill",val:f,set:I}];return t.jsxs("div",{className:"flex flex-col gap-8",children:[t.jsxs("div",{children:[t.jsx("h2",{className:"text-lg font-semibold",children:"MultiSelectPopover 디자인 변형"}),t.jsx("p",{className:"text-muted-foreground text-sm",children:"동일한 데이터/트리거에 팝오버 내부 디자인만 다릅니다. 각 버튼을 클릭해 비교해보세요."})]}),t.jsx("div",{className:"grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",children:N.map(a=>t.jsxs("div",{className:"flex flex-col gap-3 rounded-lg border p-4",children:[t.jsxs("div",{children:[t.jsx("span",{className:"text-sm font-medium",children:a.name}),t.jsx("p",{className:"text-muted-foreground text-xs",children:a.desc})]}),t.jsx(n,{items:c,selectedValues:a.val,onSelectedChange:a.set,title:"라벨 추가",searchPlaceholder:"라벨 검색",submitLabel:"라벨 적용",design:a.design,trigger:d(a.val.length)})]},a.name))})]})}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return <MultiSelectPopover items={LABELS} selectedValues={selected} onSelectedChange={setSelected} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design="default" trigger={renderTrigger(selected.length)} />;
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return <MultiSelectPopover items={LABELS} selectedValues={selected} onSelectedChange={setSelected} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design="minimal" trigger={renderTrigger(selected.length)} />;
  }
}`,...i.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return <MultiSelectPopover items={LABELS} selectedValues={selected} onSelectedChange={setSelected} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design="chip" trigger={renderTrigger(selected.length)} />;
  }
}`,...g.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return <MultiSelectPopover items={LABELS} selectedValues={selected} onSelectedChange={setSelected} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design="bordered" trigger={renderTrigger(selected.length)} />;
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selected, setSelected] = React.useState(INITIAL);
    return <MultiSelectPopover items={LABELS} selectedValues={selected} onSelectedChange={setSelected} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design="pill" trigger={renderTrigger(selected.length)} />;
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: "padded"
  },
  render: () => {
    const [s1, setS1] = React.useState(INITIAL);
    const [s2, setS2] = React.useState(INITIAL);
    const [s3, setS3] = React.useState(INITIAL);
    const [s4, setS4] = React.useState(INITIAL);
    const [s5, setS5] = React.useState(INITIAL);
    const designs = [{
      name: "Default",
      desc: "컬러 배지 + 체크박스 + 확인 버튼",
      design: "default" as const,
      val: s1,
      set: setS1
    }, {
      name: "Minimal",
      desc: "컬러 텍스트 + 체크마크 + 구분선",
      design: "minimal" as const,
      val: s2,
      set: setS2
    }, {
      name: "Chip",
      desc: "사각 컬러 칩 + 테두리 배지",
      design: "chip" as const,
      val: s3,
      set: setS3
    }, {
      name: "Bordered",
      desc: "색상 도트 + 두꺼운 테두리 + 하이라이트",
      design: "bordered" as const,
      val: s4,
      set: setS4
    }, {
      name: "Pill",
      desc: "솔리드 둥근 배지 + 원형 체크",
      design: "pill" as const,
      val: s5,
      set: setS5
    }];
    return <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-lg font-semibold">MultiSelectPopover 디자인 변형</h2>
          <p className="text-muted-foreground text-sm">
            동일한 데이터/트리거에 팝오버 내부 디자인만 다릅니다. 각 버튼을 클릭해 비교해보세요.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map(d => <div key={d.name} className="flex flex-col gap-3 rounded-lg border p-4">
              <div>
                <span className="text-sm font-medium">{d.name}</span>
                <p className="text-muted-foreground text-xs">{d.desc}</p>
              </div>
              <MultiSelectPopover items={LABELS} selectedValues={d.val} onSelectedChange={d.set} title="라벨 추가" searchPlaceholder="라벨 검색" submitLabel="라벨 적용" design={d.design} trigger={renderTrigger(d.val.length)} />
            </div>)}
        </div>
      </div>;
  }
}`,...p.parameters?.docs?.source}}};const C=["Default","Minimal","Chip","Bordered","Pill","Showcase"],y=Object.freeze(Object.defineProperty({__proto__:null,Bordered:m,Chip:g,Default:o,Minimal:i,Pill:u,Showcase:p,__namedExportsOrder:C,default:A},Symbol.toStringTag,{value:"Module"}));export{y as _};
