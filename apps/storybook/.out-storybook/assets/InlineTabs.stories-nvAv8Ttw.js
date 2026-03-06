import{j as e}from"./index-QYnQWpJ5.js";import{r as o}from"./iframe-uSZs8WMR.js";import{ak as t,C as c,l as i}from"./user-avatar-DJpZquVq.js";const d={title:"UI/InlineTabs",component:t,tags:["autodocs"],parameters:{layout:"centered"}},m=[{key:"overview",label:"개요"},{key:"details",label:"상세"},{key:"history",label:"이력"}],s={render:()=>{const[n,r]=o.useState("overview");return e.jsxs("div",{className:"w-[420px] space-y-4",children:[e.jsx(t,{activeKey:n,items:m,onChange:r}),e.jsx(c,{children:e.jsxs(i,{className:"pt-6 text-sm text-muted-foreground",children:["현재 선택된 탭: ",e.jsx("span",{className:"font-medium text-foreground",children:n})]})})]})}},a={render:()=>e.jsxs("div",{className:"w-[720px] space-y-8",children:[e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"설정 서브탭"}),e.jsx(t,{activeKey:"users",items:[{key:"users",label:"사용자"},{key:"teams",label:"팀"}],onChange:()=>{}})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-sm font-medium text-muted-foreground",children:"사용량 서브탭"}),e.jsx(t,{activeKey:"storage",items:[{key:"storage",label:"스토리지"},{key:"ai",label:"AI 사용량"}],onChange:()=>{}})]})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [activeKey, setActiveKey] = useState("overview");
    return <div className="w-[420px] space-y-4">
        <InlineTabs activeKey={activeKey} items={tabItems} onChange={setActiveKey} />
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            현재 선택된 탭: <span className="font-medium text-foreground">{activeKey}</span>
          </CardContent>
        </Card>
      </div>;
  }
}`,...s.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-[720px] space-y-8">
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">설정 서브탭</p>
        <InlineTabs activeKey="users" items={[{
        key: "users",
        label: "사용자"
      }, {
        key: "teams",
        label: "팀"
      }]} onChange={() => undefined} />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground">사용량 서브탭</p>
        <InlineTabs activeKey="storage" items={[{
        key: "storage",
        label: "스토리지"
      }, {
        key: "ai",
        label: "AI 사용량"
      }]} onChange={() => undefined} />
      </div>
    </div>
}`,...a.parameters?.docs?.source}}};const l=["Default","Showcase"],y=Object.freeze(Object.defineProperty({__proto__:null,Default:s,Showcase:a,__namedExportsOrder:l,default:d},Symbol.toStringTag,{value:"Module"}));export{y as _};
