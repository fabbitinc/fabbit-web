import{j as r}from"./index-QYnQWpJ5.js";import{b as a,T as S,M as y}from"./user-avatar-DJpZquVq.js";import{S as I,C as W,a as w}from"./sparkles-CZ0Co1E_.js";import{I as _}from"./info-C21M2-ze.js";const C={component:a,tags:["autodocs"],args:{children:"Badge",variant:"default"},argTypes:{children:{control:"text"}},parameters:{layout:"centered"}},n={args:{children:"운영중"}},s={args:{children:"초안",variant:"secondary"}},t={args:{children:"검토 필요",variant:"outline"}},c={args:{children:"삭제됨",variant:"destructive"}},o={args:{children:"숨김",variant:"ghost"}},i={args:{children:"열림",variant:"success"}},d={args:{children:"대기",variant:"warning"}},g={args:{children:"오류",variant:"danger"}},l={args:{children:"진행중",variant:"info"}},p={args:{children:"초안",variant:"neutral"}},u={args:{children:"병합됨",variant:"accent"}},m={args:{variant:"success"},render:e=>r.jsxs(a,{...e,children:[r.jsx(W,{})," 열림"]})},v={args:{variant:"warning"},render:e=>r.jsxs(a,{...e,children:[r.jsx(w,{})," 대기"]})},h={args:{variant:"danger"},render:e=>r.jsxs(a,{...e,children:[r.jsx(S,{})," 오류"]})},x={args:{variant:"info"},render:e=>r.jsxs(a,{...e,children:[r.jsx(_,{})," 진행중"]})},f={args:{variant:"neutral"},render:e=>r.jsxs(a,{...e,children:[r.jsx(y,{})," 초안"]})},j={args:{variant:"accent"},render:e=>r.jsxs(a,{...e,children:[r.jsx(I,{})," 병합됨"]})},B={parameters:{layout:"centered"},render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"16px"},children:[r.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"},children:[r.jsx("span",{style:{fontSize:"12px",color:"var(--muted-foreground)",width:"60px"},children:"Text"}),r.jsx(a,{variant:"success",children:"열림"}),r.jsx(a,{variant:"warning",children:"대기"}),r.jsx(a,{variant:"danger",children:"오류"}),r.jsx(a,{variant:"info",children:"진행중"}),r.jsx(a,{variant:"neutral",children:"초안"}),r.jsx(a,{variant:"accent",children:"병합됨"})]}),r.jsxs("div",{style:{display:"flex",gap:"8px",alignItems:"center",flexWrap:"wrap"},children:[r.jsx("span",{style:{fontSize:"12px",color:"var(--muted-foreground)",width:"60px"},children:"Icon"}),r.jsxs(a,{variant:"success",children:[r.jsx(W,{})," 열림"]}),r.jsxs(a,{variant:"warning",children:[r.jsx(w,{})," 대기"]}),r.jsxs(a,{variant:"danger",children:[r.jsx(S,{})," 오류"]}),r.jsxs(a,{variant:"info",children:[r.jsx(_,{})," 진행중"]}),r.jsxs(a,{variant:"neutral",children:[r.jsx(y,{})," 초안"]}),r.jsxs(a,{variant:"accent",children:[r.jsx(I,{})," 병합됨"]})]})]})};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    children: "운영중"
  }
}`,...n.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    children: "초안",
    variant: "secondary"
  }
}`,...s.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    children: "검토 필요",
    variant: "outline"
  }
}`,...t.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    children: "삭제됨",
    variant: "destructive"
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    children: "숨김",
    variant: "ghost"
  }
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: "열림",
    variant: "success"
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: "대기",
    variant: "warning"
  }
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    children: "오류",
    variant: "danger"
  }
}`,...g.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: "진행중",
    variant: "info"
  }
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    children: "초안",
    variant: "neutral"
  }
}`,...p.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    children: "병합됨",
    variant: "accent"
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "success"
  },
  render: args => <Badge {...args}>
      <CircleCheck /> 열림
    </Badge>
}`,...m.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "warning"
  },
  render: args => <Badge {...args}>
      <Clock /> 대기
    </Badge>
}`,...v.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "danger"
  },
  render: args => <Badge {...args}>
      <AlertTriangle /> 오류
    </Badge>
}`,...h.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "info"
  },
  render: args => <Badge {...args}>
      <Info /> 진행중
    </Badge>
}`,...x.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "neutral"
  },
  render: args => <Badge {...args}>
      <Minus /> 초안
    </Badge>
}`,...f.parameters?.docs?.source}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    variant: "accent"
  },
  render: args => <Badge {...args}>
      <Sparkles /> 병합됨
    </Badge>
}`,...j.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  parameters: {
    layout: "centered"
  },
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  }}>
      <div style={{
      display: "flex",
      gap: "8px",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
        <span style={{
        fontSize: "12px",
        color: "var(--muted-foreground)",
        width: "60px"
      }}>Text</span>
        <Badge variant="success">열림</Badge>
        <Badge variant="warning">대기</Badge>
        <Badge variant="danger">오류</Badge>
        <Badge variant="info">진행중</Badge>
        <Badge variant="neutral">초안</Badge>
        <Badge variant="accent">병합됨</Badge>
      </div>
      <div style={{
      display: "flex",
      gap: "8px",
      alignItems: "center",
      flexWrap: "wrap"
    }}>
        <span style={{
        fontSize: "12px",
        color: "var(--muted-foreground)",
        width: "60px"
      }}>Icon</span>
        <Badge variant="success"><CircleCheck /> 열림</Badge>
        <Badge variant="warning"><Clock /> 대기</Badge>
        <Badge variant="danger"><AlertTriangle /> 오류</Badge>
        <Badge variant="info"><Info /> 진행중</Badge>
        <Badge variant="neutral"><Minus /> 초안</Badge>
        <Badge variant="accent"><Sparkles /> 병합됨</Badge>
      </div>
    </div>
}`,...B.parameters?.docs?.source}}};const D=["Default","Secondary","Outline","Destructive","Ghost","Success","Warning","Danger","InfoStatus","Neutral","Accent","SuccessWithIcon","WarningWithIcon","DangerWithIcon","InfoWithIcon","NeutralWithIcon","AccentWithIcon","Showcase"],z=Object.freeze(Object.defineProperty({__proto__:null,Accent:u,AccentWithIcon:j,Danger:g,DangerWithIcon:h,Default:n,Destructive:c,Ghost:o,InfoStatus:l,InfoWithIcon:x,Neutral:p,NeutralWithIcon:f,Outline:t,Secondary:s,Showcase:B,Success:i,SuccessWithIcon:m,Warning:d,WarningWithIcon:v,__namedExportsOrder:D,default:C},Symbol.toStringTag,{value:"Module"}));export{z as _};
