import { useEffect, useRef, useState } from "react";
import { Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { Button, cn } from "@fabbit/ui";
import {
  Box3,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  HemisphereLight,
  LoadingManager,
  MOUSE,
  Mesh,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface GltfViewerProps {
  src: string;
  className?: string;
  title?: string;
  description?: string;
  resourceUrls?: Record<string, string>;
  showGrid?: boolean;
}

function disposeMaterial(material: Material | Material[]) {
  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    item.dispose();
  }
}

function disposeObject(root: Object3D) {
  root.traverse((child) => {
    if (child instanceof Mesh) {
      child.geometry.dispose();
      disposeMaterial(child.material);
    }
  });
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "모델 파일을 불러오지 못했습니다.";
}

function normalizeResourceKey(value: string) {
  return decodeURIComponent(value)
    .replace(/[?#].*$/, "")
    .replace(/\\/g, "/")
    .replace(/^(\.?\/)+/, "");
}

function resolveResourceUrl(url: string, resourceUrls: Record<string, string> | undefined) {
  if (!resourceUrls) {
    return url;
  }

  const normalized = normalizeResourceKey(url);

  if (resourceUrls[normalized]) {
    return resourceUrls[normalized];
  }

  const basename = normalized.split("/").pop();

  if (basename && resourceUrls[basename]) {
    return resourceUrls[basename];
  }

  return url;
}

function fitCameraToObject(camera: PerspectiveCamera, controls: OrbitControls, object: Object3D) {
  const bounds = new Box3().setFromObject(object);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const minDistance = Math.max(maxDimension / 40, 0.02);
  const maxDistance = Math.max(maxDimension * 40, 20);

  object.position.sub(center);

  const reset = () => {
    camera.position.set(
      maxDimension * 0.85,
      Math.max(size.y * 0.72, maxDimension * 0.55),
      maxDimension * 1.9,
    );
    camera.near = Math.max(maxDimension / 400, 0.001);
    camera.far = Math.max(maxDimension * 40, 20);
    camera.updateProjectionMatrix();
    controls.target.set(0, size.y * 0.08, 0);
    controls.update();
  };

  return {
    floorOffset: Math.max(size.y / 2, maxDimension * 0.08),
    maxDistance,
    minDistance,
    reset,
  };
}

export function GltfViewer({
  src,
  className,
  title = "GLTF 뷰어",
  description = "마우스로 회전하고 확대하며 3D 모델 구성을 확인할 수 있습니다.",
  resourceUrls,
  showGrid = true,
}: GltfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resetCameraRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!src.trim()) {
      setStatus("error");
      setErrorMessage("GLTF 파일 주소가 비어 있습니다.");
      return;
    }

    let disposed = false;
    let modelRoot: Object3D | null = null;

    setStatus("loading");
    setErrorMessage(null);
    resetCameraRef.current = null;

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 1000);
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearAlpha(0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = "h-full w-full touch-none";

    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.zoomSpeed = 1.15;
    controls.minDistance = 0.02;
    controls.maxDistance = 80;
    controls.mouseButtons.LEFT = MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = MOUSE.PAN;

    camera.position.set(2.5, 1.8, 2.8);
    controls.target.set(0, 0, 0);
    controls.update();

    const hemisphereLight = new HemisphereLight("white", "gainsboro", 1.35);
    const keyLight = new DirectionalLight("white", 1.1);
    const rimLight = new DirectionalLight("white", 0.45);
    keyLight.position.set(4, 5, 6);
    rimLight.position.set(-3, 2, -4);
    scene.add(hemisphereLight, keyLight, rimLight);

    const gridHelper = showGrid ? new GridHelper(10, 10, "white", "silver") : null;

    if (gridHelper) {
      gridHelper.position.y = -1;
      scene.add(gridHelper);
    }

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    resize();

    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);
    resizeObserver?.observe(container);

    const loadingManager = new LoadingManager();
    loadingManager.setURLModifier((url) => resolveResourceUrl(url, resourceUrls));

    const loader = new GLTFLoader(loadingManager);

    loader.load(
      src,
      (gltf) => {
        const loadedScene = gltf.scene || gltf.scenes[0];

        if (!loadedScene) {
          setStatus("error");
          setErrorMessage("GLTF 씬 데이터를 찾지 못했습니다.");
          return;
        }

        if (disposed) {
          disposeObject(loadedScene);
          return;
        }

        modelRoot = loadedScene;

        modelRoot.traverse((child) => {
          if (child instanceof Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            if (!child.geometry.attributes.normal) {
              child.geometry.computeVertexNormals();
            }

            const materials = Array.isArray(child.material) ? child.material : [child.material];

            for (const material of materials) {
              (material as Material & { side?: number }).side = DoubleSide;
              material.needsUpdate = true;
            }
          }
        });

        scene.add(modelRoot);

        const { floorOffset, maxDistance, minDistance, reset } = fitCameraToObject(camera, controls, modelRoot);

        if (gridHelper) {
          gridHelper.position.y = -floorOffset;
        }

        controls.minDistance = minDistance;
        controls.maxDistance = maxDistance;
        resetCameraRef.current = reset;
        reset();
        setStatus("ready");
        setErrorMessage(null);
      },
      undefined,
      (error) => {
        if (disposed) {
          return;
        }

        setStatus("error");
        setErrorMessage(getErrorMessage(error));
      },
    );

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      resetCameraRef.current = null;
      resizeObserver?.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();

      if (modelRoot) {
        scene.remove(modelRoot);
        disposeObject(modelRoot);
      }

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
    };
  }, [resourceUrls, showGrid, src]);

  const statusLabel =
    status === "ready" ? "모델 준비 완료" : status === "loading" ? "모델 로딩 중" : "불러오기 실패";

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-card shadow-sm", className)}>
      <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button
          className="self-start cursor-pointer sm:self-auto"
          disabled={status !== "ready"}
          size="sm"
          type="button"
          variant="outline"
          onClick={() => resetCameraRef.current?.()}
        >
          <RotateCcw className="h-4 w-4" />
          시점 초기화
        </Button>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden bg-muted/20">
        <div className="absolute inset-0 bg-gradient-to-b from-muted/40 via-background/15 to-background/60" />
        <div className="absolute left-6 top-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-accent/40 blur-3xl" />
        <div
          ref={containerRef}
          aria-busy={status === "loading"}
          aria-label={title}
          className="absolute inset-0"
        />

        {status !== "ready" ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border bg-background/90 px-5 py-4 text-center shadow-sm backdrop-blur">
              {status === "loading" ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">GLTF 모델을 불러오는 중입니다.</p>
                    <p className="text-xs text-muted-foreground">
                      메시가 준비되면 회전과 확대를 바로 확인할 수 있습니다.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <TriangleAlert className="h-6 w-6 text-destructive" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">모델을 표시하지 못했습니다.</p>
                    <p className="text-xs text-muted-foreground">
                      {errorMessage ?? "파일 형식 또는 경로를 다시 확인해 주세요."}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : null}

        <div className="absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            왼쪽 드래그로 회전, 휠로 확대, Shift+왼쪽 또는 오른쪽 드래그로 이동
          </div>
          <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
            {statusLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
