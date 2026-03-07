import{j as t}from"./index-B4avf9CM.js";import{T as s}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const n={partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",revision:"C",lifecycleState:"양산",category:"기구",material:"AL6061-T6",unit:"EA",leadTimeDays:12,isPhantom:!1,description:"인버터 하우징 하부에 장착되는 베이스 플레이트입니다.",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",thumbnailUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",pdfUrl:"https://example.com/drawing.pdf",originalFileUrl:"https://example.com/drawing.dwg"}},w={title:"Components/PartPropertiesTab",component:s,tags:["autodocs"],parameters:{layout:"padded"},args:{isDeletingDrawing:!1,isUploadingDrawing:!1,part:n,onDeleteDrawing:()=>{},onUploadDrawing:()=>{}}},e={},r={args:{part:{...n,description:null,drawing:null,lifecycleState:null}}},a={render:o=>t.jsxs("div",{className:"space-y-8",children:[t.jsx(s,{...o}),t.jsx(s,{...o,part:{...n,category:"전장",isPhantom:!0,lifecycleState:"중단",material:null,name:"모터 제어 PCB",partNumber:"CTRL-PCB-0207",revision:"F",unit:null}})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
