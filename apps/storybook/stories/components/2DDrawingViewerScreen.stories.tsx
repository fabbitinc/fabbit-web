import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { PdfViewerScreen } from "@fabbit/components";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

async function createSamplePdf(): Promise<string> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const boldFont = await doc.embedFont(StandardFonts.HelveticaBold);

  // 페이지 1: 도면 표지
  const page1 = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page1.getSize();

  // 외곽 테두리
  page1.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  // 내부 테두리
  page1.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  // 제목 영역
  page1.drawRectangle({
    x: 30,
    y: height - 180,
    width: width - 60,
    height: 120,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  page1.drawText("ASSEMBLY BRACKET DRAWING", {
    x: 60,
    y: height - 100,
    size: 24,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  page1.drawText("Part No: ASSY-BRKT-014", {
    x: 60,
    y: height - 130,
    size: 12,
    font,
    color: rgb(0.3, 0.3, 0.3),
  });

  page1.drawText("Rev: B  |  Scale: 1:2  |  Sheet 1 of 2", {
    x: 60,
    y: height - 150,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 중앙 도면 영역 - 간단한 브래킷 형상
  const cx = width / 2;
  const cy = height / 2 - 40;

  // 메인 사각형 (본체)
  page1.drawRectangle({
    x: cx - 120,
    y: cy - 80,
    width: 240,
    height: 160,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5,
  });

  // 내부 홀 표시 (원)
  for (const [ox, oy] of [
    [-60, 40],
    [60, 40],
    [-60, -40],
    [60, -40],
  ] as const) {
    page1.drawCircle({
      x: cx + ox,
      y: cy + oy,
      size: 12,
      borderColor: rgb(0, 0, 0),
      borderWidth: 1,
    });
    // 십자 중심선
    page1.drawLine({
      start: { x: cx + ox - 16, y: cy + oy },
      end: { x: cx + ox + 16, y: cy + oy },
      color: rgb(0.6, 0.6, 0.6),
      thickness: 0.3,
      dashArray: [4, 2],
    });
    page1.drawLine({
      start: { x: cx + ox, y: cy + oy - 16 },
      end: { x: cx + ox, y: cy + oy + 16 },
      color: rgb(0.6, 0.6, 0.6),
      thickness: 0.3,
      dashArray: [4, 2],
    });
  }

  // 치수선 (상단 폭)
  page1.drawLine({
    start: { x: cx - 120, y: cy + 100 },
    end: { x: cx + 120, y: cy + 100 },
    color: rgb(0, 0, 0.8),
    thickness: 0.5,
  });
  page1.drawText("240", {
    x: cx - 10,
    y: cy + 104,
    size: 9,
    font,
    color: rgb(0, 0, 0.8),
  });

  // 치수선 (우측 높이)
  page1.drawLine({
    start: { x: cx + 140, y: cy - 80 },
    end: { x: cx + 140, y: cy + 80 },
    color: rgb(0, 0, 0.8),
    thickness: 0.5,
  });
  page1.drawText("160", {
    x: cx + 144,
    y: cy - 4,
    size: 9,
    font,
    color: rgb(0, 0, 0.8),
  });

  // 타이틀 블록 (하단)
  page1.drawRectangle({
    x: width - 230,
    y: 30,
    width: 200,
    height: 80,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.5,
  });

  page1.drawLine({
    start: { x: width - 230, y: 70 },
    end: { x: width - 30, y: 70 },
    color: rgb(0, 0, 0),
    thickness: 0.5,
  });

  page1.drawText("Fabbit Manufacturing Co.", {
    x: width - 220,
    y: 80,
    size: 10,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  page1.drawText("Drawn: 2026-03-10  |  Approved: 2026-03-15", {
    x: width - 220,
    y: 48,
    size: 7,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 페이지 2: 상세도
  const page2 = doc.addPage([595.28, 841.89]);

  page2.drawRectangle({
    x: 20,
    y: 20,
    width: width - 40,
    height: height - 40,
    borderColor: rgb(0, 0, 0),
    borderWidth: 2,
  });

  page2.drawText("DETAIL VIEW - MOUNTING HOLES", {
    x: 60,
    y: height - 80,
    size: 18,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  });

  page2.drawText("Sheet 2 of 2  |  Scale 2:1", {
    x: 60,
    y: height - 105,
    size: 10,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 확대된 홀 상세도
  const dcx = width / 2;
  const dcy = height / 2;

  page2.drawCircle({
    x: dcx,
    y: dcy,
    size: 80,
    borderColor: rgb(0, 0, 0),
    borderWidth: 1.5,
  });

  page2.drawCircle({
    x: dcx,
    y: dcy,
    size: 60,
    borderColor: rgb(0, 0, 0),
    borderWidth: 0.8,
  });

  // 중심선
  page2.drawLine({
    start: { x: dcx - 100, y: dcy },
    end: { x: dcx + 100, y: dcy },
    color: rgb(0.5, 0.5, 0.5),
    thickness: 0.3,
    dashArray: [8, 3],
  });

  page2.drawLine({
    start: { x: dcx, y: dcy - 100 },
    end: { x: dcx, y: dcy + 100 },
    color: rgb(0.5, 0.5, 0.5),
    thickness: 0.3,
    dashArray: [8, 3],
  });

  // 치수 (지름)
  page2.drawText("M12 x 1.75", {
    x: dcx + 50,
    y: dcy + 50,
    size: 11,
    font,
    color: rgb(0, 0, 0.8),
  });

  page2.drawText("THRU HOLE", {
    x: dcx + 50,
    y: dcy + 35,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });

  // 노트
  const notes = [
    "NOTES:",
    "1. ALL DIMENSIONS IN MILLIMETERS",
    "2. TOLERANCES UNLESS OTHERWISE SPECIFIED: +/- 0.1mm",
    "3. SURFACE FINISH: Ra 1.6",
    "4. MATERIAL: SUS304 STAINLESS STEEL",
    "5. DEBURR ALL EDGES",
  ];

  notes.forEach((note, i) => {
    page2.drawText(note, {
      x: 60,
      y: 240 - i * 16,
      size: i === 0 ? 10 : 8,
      font: i === 0 ? boldFont : font,
      color: rgb(0.2, 0.2, 0.2),
    });
  });

  const bytes = await doc.save();
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

function PdfViewerScreenStoryShell(
  props: React.ComponentProps<typeof PdfViewerScreen>,
) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    let revoked = false;

    createSamplePdf().then((url) => {
      if (!revoked) {
        setPdfUrl(url);
      }
    });

    return () => {
      revoked = true;
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, []);

  if (!pdfUrl) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background text-muted-foreground">
        샘플 PDF를 생성하고 있습니다...
      </div>
    );
  }

  return <PdfViewerScreen {...props} src={pdfUrl} />;
}

const meta = {
  title: "Components/2DDrawingViewerScreen",
  component: PdfViewerScreen,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  render: (args) => <PdfViewerScreenStoryShell {...args} />,
  args: {
    src: "",
    title: "ASSY-BRKT-014 / 조립 브래킷",
    description:
      "2D 도면 검토 뷰어입니다. 마크업 도구로 펜, 직선, 사각형, 텍스트, 화살표를 도면 위에 표시하고, 마크업이 포함된 인쇄가 가능합니다.",
    partNumber: "ASSY-BRKT-014",
    revision: "B",
    category: "조립 부품",
    fileName: "ASSY-BRKT-014_RevB.pdf",
  },
} satisfies Meta<typeof PdfViewerScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Workspace: Story = {};

export const MarkupReview: Story = {
  args: {
    title: "MTG-PLATE-007 / 장착 플레이트",
    description:
      "검토자가 마크업을 추가한 뒤 인쇄하는 시나리오입니다. 펜 도구로 문제 영역을 표시하고 텍스트로 코멘트를 남길 수 있습니다.",
    partNumber: "MTG-PLATE-007",
    revision: "A",
    category: "판금 부품",
    fileName: "MTG-PLATE-007_RevA.pdf",
  },
};

export const ErrorState: Story = {
  render: (args) => <PdfViewerScreen {...args} />,
  args: {
    src: "",
    title: "손상된 문서 경로",
    description: "오류 상태를 확인합니다.",
  },
};
