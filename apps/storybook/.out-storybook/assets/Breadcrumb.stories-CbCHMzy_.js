import{j as r}from"./index-B4avf9CM.js";import{s as a,t as m,u as e,v as d,w as n,x as c,y as i}from"./user-avatar-CJtlkw0_.js";const b={title:"UI/Breadcrumb",component:a,tags:["autodocs"],parameters:{layout:"centered"}},s={render:()=>r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"생산 관리"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"WO-1234"})})]})})},u={render:()=>r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(i,{})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"설비 관리"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"CNC-001"})})]})})},t={render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[r.jsxs("div",{children:[r.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본"}),r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"대시보드"})})]})})]}),r.jsxs("div",{children:[r.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"3단계"}),r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"설비 관리"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"CNC-001"})})]})})]}),r.jsxs("div",{children:[r.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"깊은 경로 (생략)"}),r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(i,{})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"품질 관리"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"검사 이력"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"QC-20260306-001"})})]})})]}),r.jsxs("div",{children:[r.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"작업지시 경로"}),r.jsx(a,{children:r.jsxs(m,{children:[r.jsx(e,{children:r.jsx(d,{href:"#",children:"홈"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"생산 관리"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(d,{href:"#",children:"작업지시"})}),r.jsx(n,{}),r.jsx(e,{children:r.jsx(c,{children:"WO-2401"})})]})})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">생산 관리</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>WO-1234</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
}`,...s.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">홈</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbEllipsis />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">설비 관리</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>CNC-001</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
}`,...u.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  }}>
      {/* 기본 경로 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본</p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>대시보드</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 3단계 경로 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">3단계</p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">설비 관리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>CNC-001</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 깊은 경로 (생략 포함) */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">깊은 경로 (생략)</p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbEllipsis />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">품질 관리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">검사 이력</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>QC-20260306-001</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 작업지시 경로 */}
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">작업지시 경로</p>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="#">홈</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">생산 관리</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="#">작업지시</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>WO-2401</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};const B=["Default","WithEllipsis","Showcase"],o=Object.freeze(Object.defineProperty({__proto__:null,Default:s,Showcase:t,WithEllipsis:u,__namedExportsOrder:B,default:b},Symbol.toStringTag,{value:"Module"}));export{o as _};
