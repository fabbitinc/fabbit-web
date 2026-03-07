import{j as e}from"./index-B4avf9CM.js";import{r as s}from"./production-result-detail-screen-kTjdDYfl.js";import"./iframe-DjFiVPSj.js";import{L as t,I as a,b as n,d as c,e as o,f as i,g as l,h as d}from"./user-avatar-CJtlkw0_.js";import"./index-CqusOY6v.js";import"./circle-alert-7HBXfu_Z.js";import"./chevrons-up-down-cjEB4Cse.js";import"./settings-BbypiVPi.js";import"./sparkles-BrCodocr.js";import"./tag-BpztlO3h.js";import"./preload-helper-PPVm8Dsz.js";const I={title:"Components/FormSection",component:s,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsxs("div",{className:"w-[500px] space-y-8",children:[e.jsxs(s,{title:"기본 정보",description:"작업지시의 기본 항목을 입력하세요.",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"wo-number",children:"작업지시 번호"}),e.jsx(a,{id:"wo-number",placeholder:"WO-2026-0000"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"product",children:"생산 품목"}),e.jsxs(n,{children:[e.jsx(c,{id:"product",children:e.jsx(o,{placeholder:"품목 선택"})}),e.jsxs(i,{children:[e.jsx(l,{value:"bracket",children:"AL-BRACKET-V3"}),e.jsx(l,{value:"housing",children:"MOTOR-HOUSING-A1"}),e.jsx(l,{value:"shaft",children:"DRIVE-SHAFT-S2"})]})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"qty",children:"목표 수량"}),e.jsx(a,{id:"qty",type:"number",placeholder:"0"})]})]}),e.jsx(s,{title:"비고",children:e.jsxs("div",{className:"space-y-2",children:[e.jsx(t,{htmlFor:"note",children:"메모"}),e.jsx(d,{id:"note",placeholder:"특이사항을 입력하세요..."})]})})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[500px] space-y-8">
      <FormSection title="기본 정보" description="작업지시의 기본 항목을 입력하세요.">
        <div className="space-y-2">
          <Label htmlFor="wo-number">작업지시 번호</Label>
          <Input id="wo-number" placeholder="WO-2026-0000" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="product">생산 품목</Label>
          <Select>
            <SelectTrigger id="product">
              <SelectValue placeholder="품목 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bracket">AL-BRACKET-V3</SelectItem>
              <SelectItem value="housing">MOTOR-HOUSING-A1</SelectItem>
              <SelectItem value="shaft">DRIVE-SHAFT-S2</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="qty">목표 수량</Label>
          <Input id="qty" type="number" placeholder="0" />
        </div>
      </FormSection>

      <FormSection title="비고">
        <div className="space-y-2">
          <Label htmlFor="note">메모</Label>
          <Textarea id="note" placeholder="특이사항을 입력하세요..." />
        </div>
      </FormSection>
    </div>
}`,...r.parameters?.docs?.source}}};const L=["Default"];export{r as Default,L as __namedExportsOrder,I as default};
