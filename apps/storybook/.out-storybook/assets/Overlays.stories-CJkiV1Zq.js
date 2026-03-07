import{j as e}from"./index-B4avf9CM.js";import"./iframe-DjFiVPSj.js";import{ar as i,as as d,at as p,B as n,au as l,av as o,aw as c,ax as u,ay as x,az as m,aA as v,aB as h,aC as j,aD as D,aE as g}from"./user-avatar-CJtlkw0_.js";const w={component:i,tags:["autodocs"],parameters:{layout:"centered"}},r={render:()=>e.jsxs("div",{style:{display:"flex",gap:"12px",alignItems:"center",flexWrap:"wrap"},children:[e.jsxs(i,{children:[e.jsx(u,{asChild:!0,children:e.jsx(n,{variant:"outline",children:"팝오버"})}),e.jsx(x,{children:e.jsxs(m,{children:[e.jsx(v,{children:"도면 분석 상태"}),e.jsx(h,{children:"12개 파일 중 9개 분석 완료."})]})})]}),e.jsxs(j,{children:[e.jsx(D,{asChild:!0,children:e.jsx(n,{variant:"outline",size:"icon",children:e.jsx("span",{className:"text-sm font-semibold",children:"N"})})}),e.jsx(g,{sideOffset:8,children:"새로운 변경 요청 4건"})]}),e.jsxs(d,{children:[e.jsx(p,{asChild:!0,children:e.jsx(n,{variant:"outline",children:"메뉴"})}),e.jsxs(l,{children:[e.jsx(o,{children:"결과 다운로드"}),e.jsx(o,{children:"자동화 설정"}),e.jsx(c,{}),e.jsx(o,{variant:"destructive",children:"프로젝트 삭제"})]})]})]})},t={render:()=>e.jsxs(i,{children:[e.jsx(u,{asChild:!0,children:e.jsx(n,{variant:"outline",children:"요약 보기"})}),e.jsx(x,{children:e.jsxs(m,{children:[e.jsx(v,{children:"도면 분석 상태"}),e.jsx(h,{children:"12개 파일 중 9개 분석 완료. 3개는 품질 검토 대기 중입니다."})]})})]})},s={render:()=>e.jsxs(j,{children:[e.jsx(D,{asChild:!0,children:e.jsx(n,{variant:"outline",size:"icon",children:e.jsx("span",{className:"text-sm font-semibold",children:"N"})})}),e.jsx(g,{sideOffset:8,children:"새로운 변경 요청 4건이 도착했습니다."})]})},a={render:()=>e.jsxs(d,{children:[e.jsx(p,{asChild:!0,children:e.jsx(n,{variant:"outline",children:"작업 메뉴"})}),e.jsxs(l,{children:[e.jsxs(o,{children:[e.jsx("span",{className:"text-xs font-semibold",children:"DL"}),"결과 다운로드"]}),e.jsxs(o,{children:[e.jsx("span",{className:"text-xs font-semibold",children:"CFG"}),"자동화 설정"]}),e.jsx(c,{}),e.jsxs(o,{variant:"destructive",children:[e.jsx("span",{className:"text-xs font-semibold",children:"DEL"}),"프로젝트 삭제"]})]})]})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap"
  }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">팝오버</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverHeader>
            <PopoverTitle>도면 분석 상태</PopoverTitle>
            <PopoverDescription>12개 파일 중 9개 분석 완료.</PopoverDescription>
          </PopoverHeader>
        </PopoverContent>
      </Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon"><span className="text-sm font-semibold">N</span></Button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>새로운 변경 요청 4건</TooltipContent>
      </Tooltip>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">메뉴</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>결과 다운로드</DropdownMenuItem>
          <DropdownMenuItem>자동화 설정</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">프로젝트 삭제</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">요약 보기</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>도면 분석 상태</PopoverTitle>
          <PopoverDescription>
            12개 파일 중 9개 분석 완료. 3개는 품질 검토 대기 중입니다.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
}`,...t.parameters?.docs?.source}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-sm font-semibold">N</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent sideOffset={8}>
        새로운 변경 요청 4건이 도착했습니다.
      </TooltipContent>
    </Tooltip>
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">작업 메뉴</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <span className="text-xs font-semibold">DL</span>
          결과 다운로드
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span className="text-xs font-semibold">CFG</span>
          자동화 설정
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <span className="text-xs font-semibold">DEL</span>
          프로젝트 삭제
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
}`,...a.parameters?.docs?.source}}};const T=["Showcase","PopoverCard","TooltipPreview","DropdownMenuPreview"],f=Object.freeze(Object.defineProperty({__proto__:null,DropdownMenuPreview:a,PopoverCard:t,Showcase:r,TooltipPreview:s,__namedExportsOrder:T,default:w},Symbol.toStringTag,{value:"Module"}));export{f as _};
