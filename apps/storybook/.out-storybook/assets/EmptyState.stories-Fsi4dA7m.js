import{F as r,q as a,E as n}from"./gltf-viewer-screen-BDJMhtPo.js";import{S as s}from"./user-avatar-DUF4fm1-.js";import"./index-DRJbD1WP.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const E={title:"Components/EmptyState",component:n,tags:["autodocs"],parameters:{layout:"centered"}},t={args:{icon:r,title:"프로젝트가 아직 없습니다",description:"첫 프로젝트를 만들어 부품과 변경 흐름을 묶어 관리하세요.",actionLabel:"프로젝트 생성",onAction:()=>{}}},o={args:{icon:s,title:"검색 결과가 없습니다",description:"검색어를 조정하거나 필터를 변경해 보세요."}},e={args:{icon:a,title:"등록된 도면이 없습니다",description:"CAD 파일을 업로드하면 자동으로 BOM이 생성됩니다.",actionLabel:"도면 업로드",onAction:()=>{}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    icon: FolderKanban,
    title: "프로젝트가 아직 없습니다",
    description: "첫 프로젝트를 만들어 부품과 변경 흐름을 묶어 관리하세요.",
    actionLabel: "프로젝트 생성",
    onAction: () => {}
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    icon: Search,
    title: "검색 결과가 없습니다",
    description: "검색어를 조정하거나 필터를 변경해 보세요."
  }
}`,...o.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    icon: FileX,
    title: "등록된 도면이 없습니다",
    description: "CAD 파일을 업로드하면 자동으로 BOM이 생성됩니다.",
    actionLabel: "도면 업로드",
    onAction: () => {}
  }
}`,...e.parameters?.docs?.source}}};const f=["Default","SearchEmpty","NoDocument"];export{t as Default,e as NoDocument,o as SearchEmpty,f as __namedExportsOrder,E as default};
