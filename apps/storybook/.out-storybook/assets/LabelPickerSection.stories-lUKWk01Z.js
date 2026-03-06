import{j as l}from"./index-QYnQWpJ5.js";import{u as t}from"./change-request-detail-screen-BXoKcBb5.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./user-avatar-DJpZquVq.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const n=[{id:"l1",name:"긴급",colorHex:"#ef4444"},{id:"l2",name:"양산 영향",colorHex:"#2563eb"},{id:"l3",name:"설계변경",colorHex:"#10b981"},{id:"l4",name:"공급사",colorHex:"#f59e0b"},{id:"l5",name:"시험검증",colorHex:"#6b7280"}],f={title:"Components/LabelPickerSection",component:t,tags:["autodocs"],parameters:{layout:"padded"},decorators:[r=>l.jsx("div",{className:"w-70",children:l.jsx(r,{})})],args:{availableLabels:n,selectedIds:["l1","l3"],displayLabels:[{id:"l1",name:"긴급",colorHex:"#ef4444"},{id:"l3",name:"설계변경",colorHex:"#10b981"}],onSync:r=>console.log("sync:",r),onRequestLabels:()=>console.log("request labels")}},e={},a={args:{selectedIds:["l1","l2","l3","l4","l5"],displayLabels:n}},s={args:{onSync:void 0,displayLabels:[{id:"l1",name:"긴급",colorHex:"#ef4444"}]}},o={args:{selectedIds:[],displayLabels:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const H=["Default","ManyLabels","ReadOnly","Empty"];export{e as Default,o as Empty,a as ManyLabels,s as ReadOnly,H as __namedExportsOrder,f as default};
