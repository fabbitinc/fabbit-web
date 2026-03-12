import{j as r}from"./index-DRJbD1WP.js";import{a2 as a}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const e={partNumber:"DRV-PLATE-0142",name:"드라이브 유닛 베이스 플레이트",revision:"C",lifecycleState:"양산",category:"기구",material:"AL6061-T6",unit:"EA",leadTimeDays:12,isPhantom:!1,description:"인버터 하우징 하부에 장착되는 베이스 플레이트입니다.",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",viewerType:"PDF",viewerUrl:"https://example.com/drawing.pdf",previewUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",originalFileUrl:"https://example.com/drawing.dxf"}},c={...e,name:"하우징 프레임",partNumber:"HSG-FRM-8801",revision:"D",lifecycleState:"검토",material:"AL5052",drawing:{drawingNumber:"DWG-8801",name:"하우징 프레임",version:"D",status:"원본 등록",conversionStatus:"MANUAL_REQUIRED",viewerType:null,viewerUrl:null,previewUrl:null,originalFileUrl:"https://example.com/housing-frame.dwg",webViewRequirement:{title:"웹에서 보기 위한 파일이 필요합니다.",description:"원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."}}},u={...e,category:"조립품",name:"드라이브 유닛 어셈블리",partNumber:"DRV-ASSY-3100",revision:"A",lifecycleState:"개발",material:"복합 조립",unit:"SET",drawing:{drawingNumber:"ASSY-3100",name:"드라이브 유닛 어셈블리",version:"A",status:"원본 등록",conversionStatus:"MANUAL_REQUIRED",viewerType:null,viewerUrl:null,previewUrl:null,originalFileUrl:"https://example.com/drive-unit.sldasm",webViewRequirement:{title:"웹에서 보기 위한 파일이 필요합니다.",description:"원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."}}},m={...e,category:"전장",name:"모터 커버",partNumber:"MTR-COVER-1108",revision:"F",drawing:{drawingNumber:"MTR-COVER-1108",name:"모터 커버 3D",version:"F",status:"변환 중",conversionStatus:"PROCESSING",viewerType:"GLB",viewerUrl:null,previewUrl:null,originalFileUrl:"https://example.com/motor-cover.step"}},F={title:"Components/PartPropertiesTab",component:a,tags:["autodocs"],parameters:{layout:"padded"},args:{isDeletingDrawing:!1,isUploadingDrawing:!1,part:e,onDeleteDrawing:()=>{},onUploadDrawing:()=>{}}},s={},i={args:{part:c}},o={args:{part:u}},n={args:{part:m}},l={args:{part:{...e,description:null,drawing:null,lifecycleState:null}}},p={render:t=>r.jsxs("div",{className:"space-y-8",children:[r.jsx(a,{...t}),r.jsx(a,{...t,part:c}),r.jsx(a,{...t,part:m}),r.jsx(a,{...t,part:{...e,category:"전장",isPhantom:!0,lifecycleState:"중단",material:null,name:"모터 제어 PCB",partNumber:"CTRL-PCB-0207",revision:"F",unit:null}})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:"{}",...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    part: dwgActionRequiredPart
  }
}`,...i.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    part: solidWorksActionRequiredPart
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    part: processingPart
  }
}`,...n.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...readyPart,
      description: null,
      drawing: null,
      lifecycleState: null
    }
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: args => <div className="space-y-8">
      <PartPropertiesTab {...args} />
      <PartPropertiesTab {...args} part={dwgActionRequiredPart} />
      <PartPropertiesTab {...args} part={processingPart} />
      <PartPropertiesTab {...args} part={{
      ...readyPart,
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
}`,...p.parameters?.docs?.source}}};const U=["Default","RequiresWebViewFileForDWG","RequiresWebViewFileForSolidWorks","Processing","WithoutDescription","Showcase"];export{s as Default,n as Processing,i as RequiresWebViewFileForDWG,o as RequiresWebViewFileForSolidWorks,p as Showcase,l as WithoutDescription,U as __namedExportsOrder,F as default};
