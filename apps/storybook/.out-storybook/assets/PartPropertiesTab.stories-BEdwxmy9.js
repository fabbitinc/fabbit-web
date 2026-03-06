import{j as t}from"./index-BC33NHKD.js";import{T as s}from"./change-request-detail-screen-BB3V5S0M.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const n={partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",revision:"C",lifecycleState:"양산",category:"기구",material:"AL6061-T6",unit:"EA",leadTimeDays:12,isPhantom:!1,description:"인버터 하우징 하부에 장착되는 베이스 플레이트입니다.",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",thumbnailUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",pdfUrl:"https://example.com/drawing.pdf",originalFileUrl:"https://example.com/drawing.dwg"}},w={title:"Components/PartPropertiesTab",component:s,tags:["autodocs"],parameters:{layout:"padded"},args:{isDeletingDrawing:!1,isUploadingDrawing:!1,part:n,onDeleteDrawing:()=>{},onUploadDrawing:()=>{}}},e={},r={args:{part:{...n,description:null,drawing:null,lifecycleState:null}}},a={render:o=>t.jsxs("div",{className:"space-y-8",children:[t.jsx(s,{...o}),t.jsx(s,{...o,part:{...n,category:"전장",isPhantom:!0,lifecycleState:"중단",material:null,name:"모터 제어 PCB",partNumber:"CTRL-PCB-0207",revision:"F",unit:null}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...samplePart,
      description: null,
      drawing: null,
      lifecycleState: null
    }
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: args => <div className="space-y-8">
      <PartPropertiesTab {...args} />
      <PartPropertiesTab {...args} part={{
      ...samplePart,
      category: "전장",
      isPhantom: true,
      lifecycleState: "중단",
      material: null,
      name: "모터 제어 PCB",
      partNumber: "CTRL-PCB-0207",
      revision: "F",
      unit: null
    }} />
    </div>
}`,...a.parameters?.docs?.source}}};const D=["Default","WithoutDescription","Showcase"];export{e as Default,a as Showcase,r as WithoutDescription,D as __namedExportsOrder,w as default};
