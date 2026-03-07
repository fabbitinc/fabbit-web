import{J as o}from"./production-result-detail-screen-kTjdDYfl.js";import"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import"./user-avatar-CJtlkw0_.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./index-CqusOY6v.js";import"./preload-helper-PPVm8Dsz.js";const e={partNumber:"DRV-PLATE-0142",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",thumbnailUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",pdfUrl:"https://example.com/drawing.pdf",originalFileUrl:"https://example.com/drawing.dwg"}},P={title:"Components/PartDrawingPreview",component:o,tags:["autodocs"],parameters:{layout:"padded"},args:{part:e,isDeleting:!1,isUploading:!1,onDelete:()=>{},onUpload:()=>{}}},r={},a={args:{part:{partNumber:e.partNumber,drawing:null}}},t={args:{part:{...e,drawing:{...e.drawing,conversionStatus:"PENDING",thumbnailUrl:null}}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
