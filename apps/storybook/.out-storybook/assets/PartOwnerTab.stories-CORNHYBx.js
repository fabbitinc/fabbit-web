import{j as o}from"./index-DRJbD1WP.js";import{$ as s}from"./gltf-viewer-screen-BDJMhtPo.js";import"./iframe-1IsFew62.js";import"./preload-helper-PPVm8Dsz.js";import"./index-DlmQN4rJ.js";import"./user-avatar-DUF4fm1-.js";import"./circle-alert-7zZvF5ip.js";import"./chevrons-up-down-Lo45OW50.js";import"./sparkles-DR0EIcjG.js";import"./settings-C_MU7ihM.js";import"./tag-BOBLkXxb.js";import"./info-Em3TPLDt.js";const m=[{userId:"user-1",fullName:"김도윤",email:"doyoon.kim@fabbit.ai",profileImageUrl:null},{userId:"user-2",fullName:"박서연",email:"seoyeon.park@fabbit.ai",profileImageUrl:null},{userId:"user-3",fullName:"이준호",email:"junho.lee@fabbit.ai",profileImageUrl:null}],l=[{id:"team-1",name:"생산기술팀",memberCount:8},{id:"team-2",name:"품질보증팀",memberCount:5}],N={title:"Components/PartOwnerTab",component:s,tags:["autodocs"],parameters:{layout:"padded"},args:{members:m,owner:{ownerId:"user-1",ownerImageUrl:null,ownerName:"김도윤",ownerTeamId:"team-1",ownerTeamName:"생산기술팀"},teams:l,isMembersLoading:!1,isOwnerLoading:!1,isTeamsLoading:!1,isUpdating:!1,onOwnerChange:e=>{},onOwnerTeamChange:e=>{}}},r={},a={args:{owner:{ownerId:null,ownerImageUrl:null,ownerName:null,ownerTeamId:null,ownerTeamName:null}}},n={render:e=>o.jsxs("div",{className:"space-y-8",children:[o.jsx(s,{...e}),o.jsx(s,{...e,owner:{ownerId:null,ownerImageUrl:null,ownerName:null,ownerTeamId:null,ownerTeamName:null},isMembersLoading:!0,isTeamsLoading:!0})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    owner: {
      ownerId: null,
      ownerImageUrl: null,
      ownerName: null,
      ownerTeamId: null,
      ownerTeamName: null
    }
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: args => <div className="space-y-8">
      <PartOwnerTab {...args} />
      <PartOwnerTab {...args} owner={{
      ownerId: null,
      ownerImageUrl: null,
      ownerName: null,
      ownerTeamId: null,
      ownerTeamName: null
    }} isMembersLoading={true} isTeamsLoading={true} />
    </div>
}`,...n.parameters?.docs?.source}}};const U=["Default","Unassigned","Showcase"];export{r as Default,n as Showcase,a as Unassigned,U as __namedExportsOrder,N as default};
