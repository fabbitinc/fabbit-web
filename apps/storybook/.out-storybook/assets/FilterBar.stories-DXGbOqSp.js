import{j as e}from"./index-DRJbD1WP.js";import{r as n}from"./iframe-1IsFew62.js";import{t as o}from"./gltf-viewer-screen-BDJMhtPo.js";import{B as m}from"./user-avatar-DUF4fm1-.js";import{S as d}from"./sliders-horizontal-DogKvDIS.js";import"./index-DlmQN4rJ.js";import"./preload-helper-PPVm8Dsz.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const A={title:"Components/FilterBar",component:o,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>{const[a,t]=n.useState("");return e.jsx("div",{className:"w-[600px]",children:e.jsx(o,{searchValue:a,searchPlaceholder:"작업지시 번호, 품목명으로 검색...",onSearchChange:t})})}},s={render:()=>{const[a,t]=n.useState(""),[c,i]=n.useState([{id:"process",label:"공정: CNC 밀링"},{id:"status",label:"상태: 진행중"},{id:"line",label:"라인: A동 2라인"}]);return e.jsx("div",{className:"w-[600px]",children:e.jsx(o,{searchValue:a,searchPlaceholder:"작업지시 번호, 품목명으로 검색...",chips:c,onSearchChange:t,onChipRemove:l=>i(h=>h.filter(p=>p.id!==l)),onClearAll:()=>i([]),actions:e.jsxs(m,{variant:"outline",size:"sm",children:[e.jsx(d,{className:"mr-2 size-4"}),"필터"]})})})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const F=["Default","WithChips"];export{r as Default,s as WithChips,F as __namedExportsOrder,A as default};
