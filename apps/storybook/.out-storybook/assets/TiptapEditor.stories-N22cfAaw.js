import{j as e}from"./index-DRJbD1WP.js";import{T as t}from"./user-avatar-DUF4fm1-.js";const m={title:"ui/TiptapEditor",component:t,tags:["autodocs"],parameters:{layout:"padded"},args:{placeholder:"내용을 입력하세요...",editable:!0,minHeight:120}},r={},o={args:{content:"<p>설계 변경 사유: 인버터 하우징 간섭으로 인해 <strong>브레이크 조립체</strong> 위치를 15mm 이동합니다.</p><ul><li>도면 수정 필요</li><li>시뮬레이션 재검증 필요</li></ul>"}},s={args:{content:"<p>이 내용은 <strong>읽기 전용</strong>입니다. 편집할 수 없습니다.</p>",editable:!1}},a={args:{hideToolbar:!0,placeholder:"툴바 없이 입력..."}},n={args:{minHeight:60,placeholder:"댓글을 작성하세요..."}},d={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm font-medium text-muted-foreground",children:"편집 모드"}),e.jsx(t,{placeholder:"내용을 입력하세요..."})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm font-medium text-muted-foreground",children:"내용 포함"}),e.jsx(t,{content:"<p>AL-6061 소재의 <strong>열처리 공정</strong>을 T6에서 T651로 변경합니다.</p><blockquote>공급사 협의 완료</blockquote>"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm font-medium text-muted-foreground",children:"읽기 전용"}),e.jsx(t,{content:"<p>CNC 가공 조건: 주축 회전수 <strong>12,000 RPM</strong>, 이송속도 800mm/min</p>",editable:!1})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-2 text-sm font-medium text-muted-foreground",children:"툴바 숨김"}),e.jsx(t,{hideToolbar:!0,placeholder:"댓글을 작성하세요...",minHeight:60})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:"{}",...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    content: "<p>설계 변경 사유: 인버터 하우징 간섭으로 인해 <strong>브레이크 조립체</strong> 위치를 15mm 이동합니다.</p><ul><li>도면 수정 필요</li><li>시뮬레이션 재검증 필요</li></ul>"
  }
}`,...o.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    content: "<p>이 내용은 <strong>읽기 전용</strong>입니다. 편집할 수 없습니다.</p>",
    editable: false
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    hideToolbar: true,
    placeholder: "툴바 없이 입력..."
  }
}`,...a.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    minHeight: 60,
    placeholder: "댓글을 작성하세요..."
  }
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">편집 모드</p>
        <TiptapEditor placeholder="내용을 입력하세요..." />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">내용 포함</p>
        <TiptapEditor content="<p>AL-6061 소재의 <strong>열처리 공정</strong>을 T6에서 T651로 변경합니다.</p><blockquote>공급사 협의 완료</blockquote>" />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">읽기 전용</p>
        <TiptapEditor content="<p>CNC 가공 조건: 주축 회전수 <strong>12,000 RPM</strong>, 이송속도 800mm/min</p>" editable={false} />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-muted-foreground">툴바 숨김</p>
        <TiptapEditor hideToolbar placeholder="댓글을 작성하세요..." minHeight={60} />
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};const i=["Default","WithContent","ReadOnly","HiddenToolbar","SmallHeight","Showcase"],p=Object.freeze(Object.defineProperty({__proto__:null,Default:r,HiddenToolbar:a,ReadOnly:s,Showcase:d,SmallHeight:n,WithContent:o,__namedExportsOrder:i,default:m},Symbol.toStringTag,{value:"Module"}));export{p as _};
