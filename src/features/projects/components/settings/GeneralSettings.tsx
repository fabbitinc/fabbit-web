import { useState } from "react";
import { Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProjectStatus } from "../../types/settings.types";

interface GeneralSettingsProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
}

export function GeneralSettings({ project }: GeneralSettingsProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || "");
  const [projectCode, setProjectCode] = useState(project.id.toUpperCase());
  const [status, setStatus] = useState<ProjectStatus>("active");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
  };

  const handleSave = () => {
    // TODO: API 연동
    console.log("저장:", { name, description, projectCode, status });
  };

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6">
      <h2 className="text-lg font-medium text-[#0f172a]">일반 설정</h2>
      <p className="mt-1 text-sm text-[#64748b]">
        프로젝트의 기본 정보를 관리합니다.
      </p>

      <div className="mt-6 space-y-5">
        {/* 프로젝트 대표 이미지 */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">
            프로젝트 이미지
          </label>
          <div className="mt-2 flex items-center gap-4">
            {imagePreview ? (
              <div className="relative h-24 w-24">
                <img
                  src={imagePreview}
                  alt="프로젝트 이미지"
                  className="h-24 w-24 rounded-lg object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4444] text-white shadow-sm hover:bg-[#dc2626]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#e2e8f0] bg-[#f8fafc] transition-colors hover:border-[#3b82f6] hover:bg-[#eff6ff]">
                <Upload className="h-6 w-6 text-[#94a3b8]" />
                <span className="mt-1 text-xs text-[#94a3b8]">업로드</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            )}
            <div className="text-sm text-[#64748b]">
              <p>권장 크기: 256x256 픽셀</p>
              <p>지원 형식: PNG, JPG, GIF</p>
            </div>
          </div>
        </div>

        {/* 프로젝트 이름 */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">
            프로젝트 이름
          </label>
          <Input
            className="mt-1.5"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="프로젝트 이름"
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">
            설명
          </label>
          <Textarea
            className="mt-1.5 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="프로젝트에 대한 설명을 입력하세요"
            rows={3}
          />
        </div>

        {/* 프로젝트 코드 */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">
            프로젝트 코드
          </label>
          <Input
            className="mt-1.5"
            value={projectCode}
            onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
            placeholder="PRJ-001"
          />
          <p className="mt-1 text-xs text-[#94a3b8]">
            품번 자동 생성에 사용됩니다.
          </p>
        </div>

        {/* 프로젝트 상태 */}
        <div>
          <label className="block text-sm font-medium text-[#0f172a]">
            프로젝트 상태
          </label>
          <Select
            value={status}
            onValueChange={(value: ProjectStatus) => setStatus(value)}
          >
            <SelectTrigger className="mt-1.5 w-48">
              <SelectValue placeholder="상태 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
                  활성
                </div>
              </SelectItem>
              <SelectItem value="archived">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#94a3b8]" />
                  보관됨
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="mt-1 text-xs text-[#94a3b8]">
            보관된 프로젝트는 목록에서 숨겨집니다.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSave}
          className="bg-[#3b82f6] hover:bg-[#2563eb]"
        >
          <Save className="mr-2 h-4 w-4" />
          저장
        </Button>
      </div>
    </div>
  );
}
