import{j as n}from"./index-QYnQWpJ5.js";import{aG as o,aH as r,aI as i,aJ as s,aK as a,aL as g,aM as P}from"./user-avatar-DJpZquVq.js";const m={title:"UI/Pagination",component:o,tags:["autodocs"],parameters:{layout:"centered"}},e={render:()=>n.jsx(o,{children:n.jsxs(r,{children:[n.jsx(i,{children:n.jsx(s,{href:"#"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"1"})}),n.jsx(i,{children:n.jsx(a,{href:"#",isActive:!0,children:"2"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"3"})}),n.jsx(i,{children:n.jsx(g,{href:"#"})})]})})},t={render:()=>n.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"24px"},children:[n.jsxs("div",{children:[n.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"기본"}),n.jsx(o,{children:n.jsxs(r,{children:[n.jsx(i,{children:n.jsx(s,{href:"#"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"1"})}),n.jsx(i,{children:n.jsx(a,{href:"#",isActive:!0,children:"2"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"3"})}),n.jsx(i,{children:n.jsx(g,{href:"#"})})]})})]}),n.jsxs("div",{children:[n.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"생략 포함"}),n.jsx(o,{children:n.jsxs(r,{children:[n.jsx(i,{children:n.jsx(s,{href:"#"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"1"})}),n.jsx(i,{children:n.jsx(P,{})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"4"})}),n.jsx(i,{children:n.jsx(a,{href:"#",isActive:!0,children:"5"})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"6"})}),n.jsx(i,{children:n.jsx(P,{})}),n.jsx(i,{children:n.jsx(a,{href:"#",children:"20"})}),n.jsx(i,{children:n.jsx(g,{href:"#"})})]})})]})]})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  render: () => <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#" isActive>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
}`,...e.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  }}>
      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">기본</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">생략 포함</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">4</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>5</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">6</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">20</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};const d=["Default","Showcase"],l=Object.freeze(Object.defineProperty({__proto__:null,Default:e,Showcase:t,__namedExportsOrder:d,default:m},Symbol.toStringTag,{value:"Module"}));export{l as _};
