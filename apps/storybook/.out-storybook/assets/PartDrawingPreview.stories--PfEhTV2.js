import{j as r}from"./index-DRJbD1WP.js";import{X as a}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const e={partNumber:"DRV-PLATE-0142",drawing:{drawingNumber:"DWG-0142",name:"드라이브 유닛 베이스 플레이트",version:"4",status:"승인됨",conversionStatus:"COMPLETED",viewerType:"PDF",viewerUrl:"https://example.com/drawing.pdf",previewUrl:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",originalFileUrl:"https://example.com/drawing.dxf"}},x={title:"Components/PartDrawingPreview",component:a,tags:["autodocs"],parameters:{layout:"padded"},args:{part:e,isDeleting:!1,isUploading:!1,onDelete:()=>{},onUpload:()=>{}}};function s({children:n,title:m}){return r.jsxs("div",{className:"space-y-3 rounded-2xl border border-border/60 bg-muted/10 p-4",children:[r.jsx("div",{children:r.jsx("p",{className:"text-sm font-medium text-foreground",children:m})}),n]})}const i={},t={args:{part:{partNumber:e.partNumber,drawing:null}}},l={args:{part:{...e,drawing:{...e.drawing,conversionStatus:"PROCESSING",previewUrl:null}}}},o={args:{part:{partNumber:"HSG-FRM-8801",drawing:{drawingNumber:"DWG-8801",name:"하우징 프레임",version:"D",status:"원본 등록",conversionStatus:"MANUAL_REQUIRED",viewerType:null,viewerUrl:null,previewUrl:null,originalFileUrl:"https://example.com/housing-frame.dwg",webViewRequirement:{title:"웹에서 보기 위한 파일이 필요합니다.",description:"원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."}}}}},p={args:{part:{...e,drawing:{...e.drawing,conversionStatus:"FAILED",failureMessage:"지원하지 않는 도면 형식입니다.",previewUrl:null,viewerUrl:null}}}},d={render:n=>r.jsxs("div",{className:"grid gap-6 lg:grid-cols-2",children:[r.jsx(s,{title:"기본 미리보기",children:r.jsx(a,{...n})}),r.jsx(s,{title:"등록 전",children:r.jsx(a,{...n,part:{partNumber:e.partNumber,drawing:null}})}),r.jsx(s,{title:"산출물 생성 중",children:r.jsx(a,{...n,part:{...e,drawing:{...e.drawing,conversionStatus:"PROCESSING",previewUrl:null}}})}),r.jsx(s,{title:"웹 확인용 파일 필요",children:r.jsx(a,{...n,part:{partNumber:"DRV-ASSY-3100",drawing:{drawingNumber:"ASSY-3100",name:"드라이브 유닛 어셈블리",version:"A",status:"원본 등록",conversionStatus:"MANUAL_REQUIRED",viewerType:null,viewerUrl:null,previewUrl:null,originalFileUrl:"https://example.com/drive-unit.sldasm",webViewRequirement:{title:"웹에서 보기 위한 파일이 필요합니다.",description:"원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."}}}})}),r.jsx(s,{title:"실패 후 재업로드",children:r.jsx(a,{...n,part:{...e,drawing:{...e.drawing,conversionStatus:"FAILED",failureMessage:"지원하지 않는 도면 형식입니다.",previewUrl:null,viewerUrl:null}}})})]})};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:"{}",...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      partNumber: samplePart.partNumber,
      drawing: null
    }
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...samplePart,
      drawing: {
        ...samplePart.drawing,
        conversionStatus: "PROCESSING",
        previewUrl: null
      }
    }
  }
}`,...l.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      partNumber: "HSG-FRM-8801",
      drawing: {
        drawingNumber: "DWG-8801",
        name: "하우징 프레임",
        version: "D",
        status: "원본 등록",
        conversionStatus: "MANUAL_REQUIRED",
        viewerType: null,
        viewerUrl: null,
        previewUrl: null,
        originalFileUrl: "https://example.com/housing-frame.dwg",
        webViewRequirement: {
          title: "웹에서 보기 위한 파일이 필요합니다.",
          description: "원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."
        }
      }
    }
  }
}`,...o.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    part: {
      ...samplePart,
      drawing: {
        ...samplePart.drawing,
        conversionStatus: "FAILED",
        failureMessage: "지원하지 않는 도면 형식입니다.",
        previewUrl: null,
        viewerUrl: null
      }
    }
  }
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => <div className="grid gap-6 lg:grid-cols-2">
      <ShowcaseCard title="기본 미리보기">
        <PartDrawingPreview {...args} />
      </ShowcaseCard>

      <ShowcaseCard title="등록 전">
        <PartDrawingPreview {...args} part={{
        partNumber: samplePart.partNumber,
        drawing: null
      }} />
      </ShowcaseCard>

      <ShowcaseCard title="산출물 생성 중">
        <PartDrawingPreview {...args} part={{
        ...samplePart,
        drawing: {
          ...samplePart.drawing,
          conversionStatus: "PROCESSING",
          previewUrl: null
        }
      }} />
      </ShowcaseCard>

      <ShowcaseCard title="웹 확인용 파일 필요">
        <PartDrawingPreview {...args} part={{
        partNumber: "DRV-ASSY-3100",
        drawing: {
          drawingNumber: "ASSY-3100",
          name: "드라이브 유닛 어셈블리",
          version: "A",
          status: "원본 등록",
          conversionStatus: "MANUAL_REQUIRED",
          viewerType: null,
          viewerUrl: null,
          previewUrl: null,
          originalFileUrl: "https://example.com/drive-unit.sldasm",
          webViewRequirement: {
            title: "웹에서 보기 위한 파일이 필요합니다.",
            description: "원본 파일은 저장되었습니다. 웹에서 확인하려면 추가 파일을 올려 주세요."
          }
        }
      }} />
      </ShowcaseCard>

      <ShowcaseCard title="실패 후 재업로드">
        <PartDrawingPreview {...args} part={{
        ...samplePart,
        drawing: {
          ...samplePart.drawing,
          conversionStatus: "FAILED",
          failureMessage: "지원하지 않는 도면 형식입니다.",
          previewUrl: null,
          viewerUrl: null
        }
      }} />
      </ShowcaseCard>
    </div>
}`,...d.parameters?.docs?.source}}};const R=["WithDrawing","Empty","Processing","RequiresWebViewFile","Failed","Showcase"];export{t as Empty,p as Failed,l as Processing,o as RequiresWebViewFile,d as Showcase,i as WithDrawing,R as __namedExportsOrder,x as default};
