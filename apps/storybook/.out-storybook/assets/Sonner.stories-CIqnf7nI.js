import{j as n}from"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import{aX as p,B as r,aY as e}from"./user-avatar-CJtlkw0_.js";const B={title:"UI/Sonner",component:p,tags:["autodocs"],parameters:{layout:"centered"},decorators:[t=>n.jsxs(n.Fragment,{children:[n.jsx(t,{}),n.jsx(p,{position:"bottom-right",richColors:!0})]})]},o={render:()=>n.jsx(r,{variant:"outline",onClick:()=>e("기본 알림입니다."),children:"기본 토스트"})},a={render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.success("변경 사항이 저장되었습니다."),children:"성공 토스트"})},s={render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.error("저장에 실패했습니다. 다시 시도해 주세요."),children:"에러 토스트"})},i={render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.warning("저장 공간이 80%를 초과했습니다."),children:"경고 토스트"})},c={render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.info("새로운 업데이트가 있습니다."),children:"정보 토스트"})},l={name:"설명 포함",render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.success("도면 업로드 완료",{description:"3개 파일이 성공적으로 업로드되었습니다."}),children:"설명 포함 토스트"})},u={name:"액션 버튼",render:()=>n.jsx(r,{variant:"outline",onClick:()=>e("부품이 삭제되었습니다.",{action:{label:"되돌리기",onClick:()=>e.success("삭제가 취소되었습니다.")}}),children:"액션 포함 토스트"})},d={name:"비동기 처리",render:()=>n.jsx(r,{variant:"outline",onClick:()=>e.promise(new window.Promise(t=>setTimeout(()=>t({name:"BOM-2024-001"}),2e3)),{loading:"BOM을 분석하고 있습니다...",success:t=>`${t.name} 분석이 완료되었습니다.`,error:"BOM 분석에 실패했습니다."}),children:"비동기 토스트"})},m={name:"모든 변형",render:()=>n.jsxs("div",{className:"flex flex-wrap gap-2",children:[n.jsx(r,{variant:"outline",onClick:()=>e("기본 알림"),children:"기본"}),n.jsx(r,{variant:"outline",onClick:()=>e.success("성공했습니다."),children:"성공"}),n.jsx(r,{variant:"outline",onClick:()=>e.error("실패했습니다."),children:"에러"}),n.jsx(r,{variant:"outline",onClick:()=>e.warning("주의가 필요합니다."),children:"경고"}),n.jsx(r,{variant:"outline",onClick:()=>e.info("참고 사항입니다."),children:"정보"})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="outline" onClick={() => toast("기본 알림입니다.")}>
      기본 토스트
    </Button>
}`,...o.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="outline" onClick={() => toast.success("변경 사항이 저장되었습니다.")}>
      성공 토스트
    </Button>
}`,...a.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="outline" onClick={() => toast.error("저장에 실패했습니다. 다시 시도해 주세요.")}>
      에러 토스트
    </Button>
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="outline" onClick={() => toast.warning("저장 공간이 80%를 초과했습니다.")}>
      경고 토스트
    </Button>
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <Button variant="outline" onClick={() => toast.info("새로운 업데이트가 있습니다.")}>
      정보 토스트
    </Button>
}`,...c.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  name: "설명 포함",
  render: () => <Button variant="outline" onClick={() => toast.success("도면 업로드 완료", {
    description: "3개 파일이 성공적으로 업로드되었습니다."
  })}>
      설명 포함 토스트
    </Button>
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: "액션 버튼",
  render: () => <Button variant="outline" onClick={() => toast("부품이 삭제되었습니다.", {
    action: {
      label: "되돌리기",
      onClick: () => toast.success("삭제가 취소되었습니다.")
    }
  })}>
      액션 포함 토스트
    </Button>
}`,...u.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: "비동기 처리",
  render: () => <Button variant="outline" onClick={() => toast.promise(new window.Promise<{
    name: string;
  }>(resolve => setTimeout(() => resolve({
    name: "BOM-2024-001"
  }), 2000)), {
    loading: "BOM을 분석하고 있습니다...",
    success: data => \`\${data.name} 분석이 완료되었습니다.\`,
    error: "BOM 분석에 실패했습니다."
  })}>
      비동기 토스트
    </Button>
}`,...d.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  name: "모든 변형",
  render: () => <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => toast("기본 알림")}>
        기본
      </Button>
      <Button variant="outline" onClick={() => toast.success("성공했습니다.")}>
        성공
      </Button>
      <Button variant="outline" onClick={() => toast.error("실패했습니다.")}>
        에러
      </Button>
      <Button variant="outline" onClick={() => toast.warning("주의가 필요합니다.")}>
        경고
      </Button>
      <Button variant="outline" onClick={() => toast.info("참고 사항입니다.")}>
        정보
      </Button>
    </div>
}`,...m.parameters?.docs?.source}}};const v=["Default","Success","Error","Warning","Info","WithDescription","WithAction","Promise","AllVariants"],x=Object.freeze(Object.defineProperty({__proto__:null,AllVariants:m,Default:o,Error:s,Info:c,Promise:d,Success:a,Warning:i,WithAction:u,WithDescription:l,__namedExportsOrder:v,default:B},Symbol.toStringTag,{value:"Module"}));export{x as _};
