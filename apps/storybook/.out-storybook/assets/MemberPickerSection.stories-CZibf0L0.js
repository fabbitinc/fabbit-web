import{j as n}from"./index-DRJbD1WP.js";import{J as t}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const m=[{id:"u1",name:"문서연",email:"seoyeon.moon@fabbit.dev"},{id:"u2",name:"김하준",email:"hajun.kim@fabbit.dev"},{id:"u3",name:"이수진",email:"sujin.lee@fabbit.dev"},{id:"u4",name:"박도현",email:"dohyun.park@fabbit.dev"}],v={title:"Components/MemberPickerSection",component:t,tags:["autodocs"],parameters:{layout:"padded"},decorators:[o=>n.jsx("div",{className:"w-70",children:n.jsx(o,{})})],args:{label:"담당자",applyLabel:"담당자 적용",availableMembers:m,selectedIds:["u1"],displayItems:[{id:"u1",name:"문서연",profileImageUrl:null}],onSync:o=>console.log("sync:",o),onRequestMembers:()=>console.log("request members")}},e={},a={args:{selectedIds:["u1","u2"],displayItems:[{id:"u1",name:"문서연",profileImageUrl:null},{id:"u2",name:"김하준",profileImageUrl:null}]}},r={args:{onSync:void 0,displayItems:[{id:"u1",name:"문서연",profileImageUrl:null}]}},s={args:{selectedIds:[],displayItems:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: ["u1", "u2"],
    displayItems: [{
      id: "u1",
      name: "문서연",
      profileImageUrl: null
    }, {
      id: "u2",
      name: "김하준",
      profileImageUrl: null
    }]
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    onSync: undefined,
    displayItems: [{
      id: "u1",
      name: "문서연",
      profileImageUrl: null
    }]
  }
}`,...r.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    selectedIds: [],
    displayItems: []
  }
}`,...s.parameters?.docs?.source}}};const U=["Default","MultipleSelected","ReadOnly","Empty"];export{e as Default,s as Empty,a as MultipleSelected,r as ReadOnly,U as __namedExportsOrder,v as default};
