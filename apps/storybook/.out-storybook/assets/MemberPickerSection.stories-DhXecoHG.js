import{j as n}from"./index-BC33NHKD.js";import{w as t}from"./change-request-detail-screen-BB3V5S0M.js";import"./iframe-BDY6rKdT.js";import"./preload-helper-PPVm8Dsz.js";import"./index-C3SxMwu4.js";import"./user-avatar-Cz1MQ_Sd.js";import"./circle-alert-Df3U-mR7.js";import"./chevrons-up-down-BJxNzKgS.js";import"./sparkles-CdpkT6Re.js";import"./settings-CQ3R25cq.js";import"./tag-gRIXPjqS.js";const m=[{id:"u1",name:"문서연",email:"seoyeon.moon@fabbit.dev"},{id:"u2",name:"김하준",email:"hajun.kim@fabbit.dev"},{id:"u3",name:"이수진",email:"sujin.lee@fabbit.dev"},{id:"u4",name:"박도현",email:"dohyun.park@fabbit.dev"}],S={title:"Components/MemberPickerSection",component:t,tags:["autodocs"],parameters:{layout:"padded"},decorators:[o=>n.jsx("div",{className:"w-70",children:n.jsx(o,{})})],args:{label:"담당자",applyLabel:"담당자 적용",availableMembers:m,selectedIds:["u1"],displayItems:[{id:"u1",name:"문서연",profileImageUrl:null}],onSync:o=>console.log("sync:",o),onRequestMembers:()=>console.log("request members")}},e={},a={args:{selectedIds:["u1","u2"],displayItems:[{id:"u1",name:"문서연",profileImageUrl:null},{id:"u2",name:"김하준",profileImageUrl:null}]}},r={args:{onSync:void 0,displayItems:[{id:"u1",name:"문서연",profileImageUrl:null}]}},s={args:{selectedIds:[],displayItems:[]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
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
}`,...s.parameters?.docs?.source}}};const v=["Default","MultipleSelected","ReadOnly","Empty"];export{e as Default,s as Empty,a as MultipleSelected,r as ReadOnly,v as __namedExportsOrder,S as default};
