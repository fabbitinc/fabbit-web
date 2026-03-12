import{j as l}from"./index-DRJbD1WP.js";import{y as t}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const n=[{id:"l1",name:"긴급",colorHex:"#ef4444"},{id:"l2",name:"양산 영향",colorHex:"#2563eb"},{id:"l3",name:"설계변경",colorHex:"#10b981"},{id:"l4",name:"공급사",colorHex:"#f59e0b"},{id:"l5",name:"시험검증",colorHex:"#6b7280"}],H={title:"Components/LabelPickerSection",component:t,tags:["autodocs"],parameters:{layout:"padded"},decorators:[r=>l.jsx("div",{className:"w-70",children:l.jsx(r,{})})],args:{availableLabels:n,selectedIds:["l1","l3"],displayLabels:[{id:"l1",name:"긴급",colorHex:"#ef4444"},{id:"l3",name:"설계변경",colorHex:"#10b981"}],onSync:r=>console.log("sync:",r),onRequestLabels:()=>console.log("request labels")}},e={},a={args:{selectedIds:["l1","l2","l3","l4","l5"],displayLabels:n}},s={args:{onSync:void 0,displayLabels:[{id:"l1",name:"긴급",colorHex:"#ef4444"}]}},o={args:{selectedIds:[],displayLabels:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: ["l1", "l2", "l3", "l4", "l5"],
    displayLabels: availableLabels
  }
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    onSync: undefined,
    displayLabels: [{
      id: "l1",
      name: "긴급",
      colorHex: "#ef4444"
    }]
  }
}`,...s.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: [],
    displayLabels: []
  }
}`,...o.parameters?.docs?.source}}};const S=["Default","ManyLabels","ReadOnly","Empty"];export{e as Default,o as Empty,a as ManyLabels,s as ReadOnly,S as __namedExportsOrder,H as default};
