import{j as e}from"./index-QYnQWpJ5.js";import{p as r}from"./change-request-detail-screen-BXoKcBb5.js";import{b as s}from"./user-avatar-DJpZquVq.js";import"./iframe-uSZs8WMR.js";import"./preload-helper-PPVm8Dsz.js";import"./index-D-xEXGrX.js";import"./circle-alert-e60hHxQt.js";import"./chevrons-up-down-DeU1l3Vt.js";import"./sparkles-CZ0Co1E_.js";import"./settings-B-L1BAJU.js";import"./tag-YK-1BDS0.js";const x={title:"Components/DescriptionList",component:r,tags:["autodocs"],parameters:{layout:"centered"}},l={render:()=>e.jsx("div",{className:"w-[500px]",children:e.jsx(r,{items:[{label:"작업지시 번호",value:"WO-2026-0198"},{label:"품목",value:"AL-BRACKET-V3"},{label:"목표 수량",value:"500개"},{label:"납기일",value:"2026-03-15"},{label:"상태",value:e.jsx(s,{variant:"info",children:"진행중"})},{label:"담당자",value:"박기계"}]})})},a={render:()=>e.jsx("div",{className:"w-[700px]",children:e.jsx(r,{columns:3,items:[{label:"설비 코드",value:"CNC-003"},{label:"설비명",value:"5축 CNC 밀링"},{label:"제조사",value:"DMG MORI"},{label:"모델",value:"DMU 50 3rd Gen"},{label:"설치일",value:"2024-06-15"},{label:"최근 정비일",value:"2026-03-06"},{label:"가동 상태",value:e.jsx(s,{variant:"success",children:"가동중"})},{label:"가동률",value:"94.2%"},{label:"누적 가동시간",value:"12,480시간"}]})})},n={render:()=>e.jsx("div",{className:"w-[400px]",children:e.jsx(r,{columns:1,items:[{label:"불량 유형",value:"치수 초과 (Over-tolerance)"},{label:"발생 공정",value:"2차 가공 (CNC 밀링)"},{label:"검출 방법",value:"CMM 자동 검사"},{label:"불량 수량",value:"3개 / 500개 (0.6%)"},{label:"조치 사항",value:"공구 마모 확인 → T3 엔드밀 교체 후 재가공"}]})})};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[500px]">
      <DescriptionList items={[{
      label: "작업지시 번호",
      value: "WO-2026-0198"
    }, {
      label: "품목",
      value: "AL-BRACKET-V3"
    }, {
      label: "목표 수량",
      value: "500개"
    }, {
      label: "납기일",
      value: "2026-03-15"
    }, {
      label: "상태",
      value: <Badge variant="info">진행중</Badge>
    }, {
      label: "담당자",
      value: "박기계"
    }]} />
    </div>
}`,...l.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[700px]">
      <DescriptionList columns={3} items={[{
      label: "설비 코드",
      value: "CNC-003"
    }, {
      label: "설비명",
      value: "5축 CNC 밀링"
    }, {
      label: "제조사",
      value: "DMG MORI"
    }, {
      label: "모델",
      value: "DMU 50 3rd Gen"
    }, {
      label: "설치일",
      value: "2024-06-15"
    }, {
      label: "최근 정비일",
      value: "2026-03-06"
    }, {
      label: "가동 상태",
      value: <Badge variant="success">가동중</Badge>
    }, {
      label: "가동률",
      value: "94.2%"
    }, {
      label: "누적 가동시간",
      value: "12,480시간"
    }]} />
    </div>
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[400px]">
      <DescriptionList columns={1} items={[{
      label: "불량 유형",
      value: "치수 초과 (Over-tolerance)"
    }, {
      label: "발생 공정",
      value: "2차 가공 (CNC 밀링)"
    }, {
      label: "검출 방법",
      value: "CMM 자동 검사"
    }, {
      label: "불량 수량",
      value: "3개 / 500개 (0.6%)"
    }, {
      label: "조치 사항",
      value: "공구 마모 확인 → T3 엔드밀 교체 후 재가공"
    }]} />
    </div>
}`,...n.parameters?.docs?.source}}};const N=["Default","ThreeColumns","SingleColumn"];export{l as Default,n as SingleColumn,a as ThreeColumns,N as __namedExportsOrder,x as default};
