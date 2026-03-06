import{J as o}from"./change-request-detail-screen-BB3V5S0M.js";import"./index-BC33NHKD.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const e={partNumber:"DRV-PLATE-0142",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",thumbnailUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",pdfUrl:"https://example.com/drawing.pdf",originalFileUrl:"https://example.com/drawing.dwg"}},P={title:"Components/PartDrawingPreview",component:o,tags:["autodocs"],parameters:{layout:"padded"},args:{part:e,isDeleting:!1,isUploading:!1,onDelete:()=>{},onUpload:()=>{}}},r={},a={args:{part:{partNumber:e.partNumber,drawing:null}}},t={args:{part:{...e,drawing:{...e.drawing,conversionStatus:"PENDING",thumbnailUrl:null}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      partNumber: samplePart.partNumber,
      drawing: null
    }
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...samplePart,
      drawing: {
        ...samplePart.drawing,
        conversionStatus: "PENDING",
        thumbnailUrl: null
      }
    }
  }
}`,...t.parameters?.docs?.source}}};const D=["WithDrawing","Empty","Processing"];export{a as Empty,t as Processing,r as WithDrawing,D as __namedExportsOrder,P as default};
