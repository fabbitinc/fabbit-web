import{j as e}from"./index-QYnQWpJ5.js";import{r as n}from"./iframe-uSZs8WMR.js";import{r as o}from"./change-request-detail-screen-BXoKcBb5.js";import{B as m}from"./user-avatar-DJpZquVq.js";import{S as d}from"./sliders-horizontal-COWx5zOl.js";import"./index-D-xEXGrX.js";import"./preload-helper-PPVm8Dsz.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const w={title:"Components/FilterBar",component:o,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>{const[a,t]=n.useState("");return e.jsx("div",{className:"w-[600px]",children:e.jsx(o,{searchValue:a,searchPlaceholder:"작업지시 번호, 품목명으로 검색...",onSearchChange:t})})}},s={render:()=>{const[a,t]=n.useState(""),[i,c]=n.useState([{id:"process",label:"공정: CNC 밀링"},{id:"status",label:"상태: 진행중"},{id:"line",label:"라인: A동 2라인"}]);return e.jsx("div",{className:"w-[600px]",children:e.jsx(o,{searchValue:a,searchPlaceholder:"작업지시 번호, 품목명으로 검색...",chips:i,onSearchChange:t,onChipRemove:l=>c(h=>h.filter(p=>p.id!==l)),onClearAll:()=>c([]),actions:e.jsxs(m,{variant:"outline",size:"sm",children:[e.jsx(d,{className:"mr-2 size-4"}),"필터"]})})})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState("");
    return <div className="w-[600px]">
        <FilterBar searchValue={search} searchPlaceholder="작업지시 번호, 품목명으로 검색..." onSearchChange={setSearch} />
      </div>;
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [search, setSearch] = useState("");
    const [chips, setChips] = useState([{
      id: "process",
      label: "공정: CNC 밀링"
    }, {
      id: "status",
      label: "상태: 진행중"
    }, {
      id: "line",
      label: "라인: A동 2라인"
    }]);
    return <div className="w-[600px]">
        <FilterBar searchValue={search} searchPlaceholder="작업지시 번호, 품목명으로 검색..." chips={chips} onSearchChange={setSearch} onChipRemove={id => setChips(prev => prev.filter(c => c.id !== id))} onClearAll={() => setChips([])} actions={<Button variant="outline" size="sm">
              <SlidersHorizontal className="mr-2 size-4" />
              필터
            </Button>} />
      </div>;
  }
}`,...s.parameters?.docs?.source}}};const A=["Default","WithChips"];export{r as Default,s as WithChips,A as __namedExportsOrder,w as default};
