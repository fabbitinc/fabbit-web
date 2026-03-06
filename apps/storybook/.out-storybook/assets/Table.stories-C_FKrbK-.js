import{j as e}from"./index-BC33NHKD.js";import{a_ as i,a$ as u,b0 as o,b1 as t,b2 as l,b3 as c,b4 as s,b,b5 as T}from"./user-avatar-Cz1MQ_Sd.js";const p={title:"UI/Table",component:i,tags:["autodocs"]},m=[{id:"PO-001",status:"승인",method:"카드결제",amount:"₩250,000"},{id:"PO-002",status:"대기",method:"계좌이체",amount:"₩150,000"},{id:"PO-003",status:"미결",method:"계좌이체",amount:"₩350,000"},{id:"PO-004",status:"승인",method:"카드결제",amount:"₩450,000"},{id:"PO-005",status:"승인",method:"계좌이체",amount:"₩550,000"}],x=n=>n==="승인"?"success":n==="대기"?"warning":"outline",r={render:()=>e.jsxs(i,{children:[e.jsx(u,{children:"최근 구매 발주 목록"}),e.jsx(o,{children:e.jsxs(t,{children:[e.jsx(l,{className:"w-[100px]",children:"발주번호"}),e.jsx(l,{children:"상태"}),e.jsx(l,{children:"결제방식"}),e.jsx(l,{className:"text-right",children:"금액"})]})}),e.jsx(c,{children:m.map(n=>e.jsxs(t,{children:[e.jsx(s,{className:"font-medium",children:n.id}),e.jsx(s,{children:e.jsx(b,{variant:x(n.status),children:n.status})}),e.jsx(s,{children:n.method}),e.jsx(s,{className:"text-right",children:n.amount})]},n.id))}),e.jsx(T,{children:e.jsxs(t,{children:[e.jsx(s,{colSpan:3,children:"합계"}),e.jsx(s,{className:"text-right",children:"₩1,750,000"})]})})]})},d={render:()=>{const n=[{id:"WO-2401",product:"하우징 A",process:"CNC 가공",qty:500,status:"진행중",progress:"62%",due:"2026-03-10"},{id:"WO-2402",product:"브라켓 B",process:"프레스",qty:1200,status:"대기",progress:"0%",due:"2026-03-12"},{id:"WO-2403",product:"샤프트 C",process:"선반",qty:300,status:"완료",progress:"100%",due:"2026-03-08"},{id:"WO-2404",product:"기어 D",process:"연삭",qty:800,status:"진행중",progress:"45%",due:"2026-03-11"},{id:"WO-2405",product:"커버 E",process:"사출",qty:2e3,status:"보류",progress:"30%",due:"2026-03-15"}],h=a=>a==="완료"?"success":a==="진행중"?"info":a==="대기"?"neutral":"warning";return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:"32px"},children:[e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"구매 발주 테이블"}),e.jsxs(i,{children:[e.jsx(o,{children:e.jsxs(t,{children:[e.jsx(l,{className:"w-[100px]",children:"발주번호"}),e.jsx(l,{children:"상태"}),e.jsx(l,{children:"결제방식"}),e.jsx(l,{className:"text-right",children:"금액"})]})}),e.jsx(c,{children:m.map(a=>e.jsxs(t,{children:[e.jsx(s,{className:"font-medium",children:a.id}),e.jsx(s,{children:e.jsx(b,{variant:x(a.status),children:a.status})}),e.jsx(s,{children:a.method}),e.jsx(s,{className:"text-right",children:a.amount})]},a.id))}),e.jsx(T,{children:e.jsxs(t,{children:[e.jsx(s,{colSpan:3,children:"합계"}),e.jsx(s,{className:"text-right",children:"₩1,750,000"})]})})]})]}),e.jsxs("div",{children:[e.jsx("p",{className:"mb-3 text-sm font-medium text-muted-foreground",children:"작업지시 테이블 (MES)"}),e.jsxs(i,{children:[e.jsx(u,{children:"2026년 3월 작업지시 목록"}),e.jsx(o,{children:e.jsxs(t,{children:[e.jsx(l,{className:"w-[100px]",children:"작업지시"}),e.jsx(l,{children:"제품"}),e.jsx(l,{children:"공정"}),e.jsx(l,{className:"text-right",children:"수량"}),e.jsx(l,{children:"상태"}),e.jsx(l,{className:"text-right",children:"진행률"}),e.jsx(l,{className:"text-right",children:"납기일"})]})}),e.jsx(c,{children:n.map(a=>e.jsxs(t,{children:[e.jsx(s,{className:"font-medium",children:a.id}),e.jsx(s,{children:a.product}),e.jsx(s,{children:a.process}),e.jsx(s,{className:"text-right",children:a.qty.toLocaleString()}),e.jsx(s,{children:e.jsx(b,{variant:h(a.status),children:a.status})}),e.jsx(s,{className:"text-right",children:a.progress}),e.jsx(s,{className:"text-right",children:a.due})]},a.id))})]})]})]})}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <Table>
      <TableCaption>최근 구매 발주 목록</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">발주번호</TableHead>
          <TableHead>상태</TableHead>
          <TableHead>결제방식</TableHead>
          <TableHead className="text-right">금액</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchases.map(item => <TableRow key={item.id}>
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(item.status)}>
                {item.status}
              </Badge>
            </TableCell>
            <TableCell>{item.method}</TableCell>
            <TableCell className="text-right">{item.amount}</TableCell>
          </TableRow>)}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>합계</TableCell>
          <TableCell className="text-right">₩1,750,000</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
}`,...r.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const workOrders = [{
      id: "WO-2401",
      product: "하우징 A",
      process: "CNC 가공",
      qty: 500,
      status: "진행중",
      progress: "62%",
      due: "2026-03-10"
    }, {
      id: "WO-2402",
      product: "브라켓 B",
      process: "프레스",
      qty: 1200,
      status: "대기",
      progress: "0%",
      due: "2026-03-12"
    }, {
      id: "WO-2403",
      product: "샤프트 C",
      process: "선반",
      qty: 300,
      status: "완료",
      progress: "100%",
      due: "2026-03-08"
    }, {
      id: "WO-2404",
      product: "기어 D",
      process: "연삭",
      qty: 800,
      status: "진행중",
      progress: "45%",
      due: "2026-03-11"
    }, {
      id: "WO-2405",
      product: "커버 E",
      process: "사출",
      qty: 2000,
      status: "보류",
      progress: "30%",
      due: "2026-03-15"
    }];
    const woStatusVariant = (s: string) => {
      if (s === "완료") return "success" as const;
      if (s === "진행중") return "info" as const;
      if (s === "대기") return "neutral" as const;
      return "warning" as const;
    };
    return <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "32px"
    }}>
        {/* 구매 발주 테이블 */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">구매 발주 테이블</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">발주번호</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>결제방식</TableHead>
                <TableHead className="text-right">금액</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map(item => <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.id}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.method}</TableCell>
                  <TableCell className="text-right">{item.amount}</TableCell>
                </TableRow>)}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>합계</TableCell>
                <TableCell className="text-right">₩1,750,000</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* 작업지시 테이블 */}
        <div>
          <p className="mb-3 text-sm font-medium text-muted-foreground">작업지시 테이블 (MES)</p>
          <Table>
            <TableCaption>2026년 3월 작업지시 목록</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">작업지시</TableHead>
                <TableHead>제품</TableHead>
                <TableHead>공정</TableHead>
                <TableHead className="text-right">수량</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">진행률</TableHead>
                <TableHead className="text-right">납기일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workOrders.map(wo => <TableRow key={wo.id}>
                  <TableCell className="font-medium">{wo.id}</TableCell>
                  <TableCell>{wo.product}</TableCell>
                  <TableCell>{wo.process}</TableCell>
                  <TableCell className="text-right">{wo.qty.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={woStatusVariant(wo.status)}>{wo.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{wo.progress}</TableCell>
                  <TableCell className="text-right">{wo.due}</TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </div>;
  }
}`,...d.parameters?.docs?.source}}};const j=["Default","Showcase"],N=Object.freeze(Object.defineProperty({__proto__:null,Default:r,Showcase:d,__namedExportsOrder:j,default:p},Symbol.toStringTag,{value:"Module"}));export{N as _};
