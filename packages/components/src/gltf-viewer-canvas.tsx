// @ts-nocheck
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@fabbit/ui";
import {
  ACESFilmicToneMapping,
  AxesHelper,
  Box3,
  Color,
  DirectionalLight,
  DoubleSide,
  GridHelper,
  HemisphereLight,
  Light,
  LoadingManager,
  MOUSE,
  Mesh,
  OrthographicCamera,
  PMREMGenerator,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Sphere,
  Vector3,
  WebGLRenderer,
  type Camera,
  type Material,
  type Object3D,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export type GltfViewerRenderMode = "solid" | "wireframe";
export type GltfViewerStatus = "loading" | "ready" | "error";
export type GltfViewerProjectionMode = "perspective" | "orthographic";
export type GltfViewerStandardView = "iso" | "front" | "right" | "top";

export interface GltfViewerSceneStats {
  dimensions: {
    x: number;
    y: number;
    z: number;
  };
  materialCount: number;
  meshCount: number;
  nodeCount: number;
  triangleCount: number;
}

export interface GltfViewerStatusChange {
  errorMessage: string | null;
  status: GltfViewerStatus;
}

export interface GltfViewerCanvasHandle {
  fitView: () => void;
  resetView: () => void;
  setView: (view: GltfViewerStandardView) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export interface GltfViewerCanvasProps {
  ariaLabel: string;
  src: string;
  autoRotate?: boolean;
  className?: string;
  onSceneStatsChange?: (stats: GltfViewerSceneStats | null) => void;
  onStatusChange?: (change: GltfViewerStatusChange) => void;
  projectionMode?: GltfViewerProjectionMode;
  renderMode?: GltfViewerRenderMode;
  resourceUrls?: Record<string, string>;
  showAxesGizmo?: boolean;
  showBackgroundDecorations?: boolean;
  showGrid?: boolean;
  showInteractionHint?: boolean;
  showStatusBadge?: boolean;
}

interface GltfViewerScaleBar {
  label: string;
  widthPx: number;
}

interface GltfViewerFrameConfig {
  bounds: Box3;
  fitDistance: number;
  floorOffset: number;
  maxDistance: number;
  maxDimension: number;
  minDistance: number;
  orthographicZoom: number;
  target: Vector3;
}

interface GltfViewerWireframeMaterialState {
  colorHex?: number;
  emissiveHex?: number;
  opacity?: number;
  toneMapped?: boolean;
  transparent?: boolean;
}

interface LoadedGltfScene {
  scene?: Object3D;
  scenes: Object3D[];
}

const VIEW_PRESETS: Record<
  GltfViewerStandardView,
  {
    direction: Vector3;
    up: Vector3;
  }
> = {
  iso: {
    direction: new Vector3(0.95, 0.72, 1.45).normalize(),
    up: new Vector3(0, 1, 0),
  },
  front: {
    direction: new Vector3(0, 0, 1),
    up: new Vector3(0, 1, 0),
  },
  right: {
    direction: new Vector3(1, 0, 0),
    up: new Vector3(0, 1, 0),
  },
  top: {
    direction: new Vector3(0, 1, 0),
    up: new Vector3(0, 0, -1),
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function disposeMaterial(material: Material | Material[]) {
  const materials = Array.isArray(material) ? material : [material];

  for (const item of materials) {
    item.dispose();
  }
}

function disposeObject(root: Object3D) {
  root.traverse((child: Object3D) => {
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

function resolveResourceUrl(
  url: string,
  resourceUrls: Record<string, string> | undefined,
) {
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

function applyRenderMode(object: Object3D, renderMode: GltfViewerRenderMode) {
  object.traverse((child: Object3D) => {
    if (!(child instanceof Mesh)) {
      return;
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      const wireframeMaterial = material as Material & {
        color?: Color;
        emissive?: Color;
        opacity?: number;
        toneMapped?: boolean;
        transparent?: boolean;
        userData: {
          __gltfViewerWireframeState?: GltfViewerWireframeMaterialState;
        };
        wireframe?: boolean;
      };

      if (renderMode === "wireframe") {
        if (!wireframeMaterial.userData.__gltfViewerWireframeState) {
          wireframeMaterial.userData.__gltfViewerWireframeState = {
            colorHex: wireframeMaterial.color?.getHex(),
            emissiveHex: wireframeMaterial.emissive?.getHex(),
            opacity: wireframeMaterial.opacity,
            toneMapped: wireframeMaterial.toneMapped,
            transparent: wireframeMaterial.transparent,
          };
        }

        if (wireframeMaterial.color) {
          wireframeMaterial.color.set("#334155");
        }

        if (wireframeMaterial.emissive) {
          wireframeMaterial.emissive.set("#000000");
        }

        wireframeMaterial.opacity = 1;
        wireframeMaterial.toneMapped = false;
        wireframeMaterial.transparent = false;
      } else {
        const savedState = wireframeMaterial.userData.__gltfViewerWireframeState;

        if (savedState) {
          if (
            wireframeMaterial.color &&
            typeof savedState.colorHex === "number"
          ) {
            wireframeMaterial.color.setHex(savedState.colorHex);
          }

          if (
            wireframeMaterial.emissive &&
            typeof savedState.emissiveHex === "number"
          ) {
            wireframeMaterial.emissive.setHex(savedState.emissiveHex);
          }

          if (typeof savedState.opacity === "number") {
            wireframeMaterial.opacity = savedState.opacity;
          }

          if (typeof savedState.toneMapped === "boolean") {
            wireframeMaterial.toneMapped = savedState.toneMapped;
          }

          if (typeof savedState.transparent === "boolean") {
            wireframeMaterial.transparent = savedState.transparent;
          }
        }
      }

      wireframeMaterial.wireframe = renderMode === "wireframe";
      material.needsUpdate = true;
    }
  });
}

function collectSceneStats(object: Object3D): GltfViewerSceneStats {
  const bounds = new Box3().setFromObject(object);
  const size = bounds.getSize(new Vector3());
  const uniqueMaterials = new Set<Material>();
  let meshCount = 0;
  let nodeCount = 0;
  let triangleCount = 0;

  object.traverse((child: Object3D) => {
    nodeCount += 1;

    if (!(child instanceof Mesh)) {
      return;
    }

    meshCount += 1;

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];

    for (const material of materials) {
      uniqueMaterials.add(material);
    }

    if (child.geometry.index) {
      triangleCount += child.geometry.index.count / 3;
      return;
    }

    if (child.geometry.attributes.position) {
      triangleCount += child.geometry.attributes.position.count / 3;
    }
  });

  return {
    dimensions: {
      x: size.x,
      y: size.y,
      z: size.z,
    },
    materialCount: uniqueMaterials.size,
    meshCount,
    nodeCount,
    triangleCount: Math.round(triangleCount),
  };
}

function getNiceScale(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return 1;
  }

  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function getGridSize(size: Vector3) {
  const footprint = Math.max(size.x, size.z, 1);
  return getNiceScale(footprint * 1.6);
}

function getOriginAxesSize(size: Vector3, gridSize: number) {
  const maxDimension = Math.max(size.x, size.y, size.z, 1);
  const preferredSize = Math.max(maxDimension * 0.3, gridSize * 0.18);

  return clamp(preferredSize, 0.28, gridSize * 0.28);
}

function hasEmbeddedLights(object: Object3D) {
  let detected = false;

  object.traverse((child: Object3D) => {
    if (child instanceof Light) {
      detected = true;
    }
  });

  return detected;
}

function formatViewerLength(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "0 mm";
  }

  if (value >= 1) {
    return `${Number(value.toFixed(value >= 10 ? 1 : 2)).toLocaleString("ko-KR")} m`;
  }

  const millimeters = value * 1000;

  if (millimeters >= 100) {
    return `${Math.round(millimeters).toLocaleString("ko-KR")} mm`;
  }

  return `${Number(millimeters.toFixed(1)).toLocaleString("ko-KR")} mm`;
}

function getScaleBar(
  camera: PerspectiveCamera | OrthographicCamera,
  controls: OrbitControls,
  containerWidth: number,
): GltfViewerScaleBar | null {
  if (containerWidth <= 0) {
    return null;
  }

  let visibleWidth = 0;

  if (camera instanceof PerspectiveCamera) {
    const distance = camera.position.distanceTo(controls.target);

    if (!Number.isFinite(distance) || distance <= 0) {
      return null;
    }

    const visibleHeight = 2 * distance * Math.tan((camera.fov * Math.PI) / 360);

    visibleWidth = visibleHeight * camera.aspect;
  } else {
    visibleWidth = (camera.right - camera.left) / Math.max(camera.zoom, 0.0001);
  }

  const worldPerPixel = visibleWidth / containerWidth;

  if (!Number.isFinite(worldPerPixel) || worldPerPixel <= 0) {
    return null;
  }

  const targetPixelWidth = clamp(containerWidth * 0.14, 88, 156);
  const desiredWorldLength = worldPerPixel * targetPixelWidth;
  const preferredExponent = Math.floor(Math.log10(desiredWorldLength || 1));
  const candidates: number[] = [];

  for (
    let exponent = preferredExponent - 1;
    exponent <= preferredExponent + 2;
    exponent += 1
  ) {
    const magnitude = 10 ** exponent;
    candidates.push(1 * magnitude, 2 * magnitude, 5 * magnitude);
  }

  const bestLength = candidates.reduce((best, candidate) => {
    const candidateWidth = candidate / worldPerPixel;
    const bestWidth = best / worldPerPixel;
    const candidatePenalty =
      Math.abs(candidateWidth - targetPixelWidth) +
      (candidateWidth < 64 || candidateWidth > 192 ? 1000 : 0);
    const bestPenalty =
      Math.abs(bestWidth - targetPixelWidth) +
      (bestWidth < 64 || bestWidth > 192 ? 1000 : 0);

    return candidatePenalty < bestPenalty ? candidate : best;
  }, getNiceScale(desiredWorldLength));

  return {
    label: formatViewerLength(bestLength),
    widthPx: bestLength / worldPerPixel,
  };
}

function getOrthographicZoom(
  camera: OrthographicCamera,
  radius: number,
  margin = 1.35,
) {
  const safeRadius = Math.max(radius, 0.05);
  const fitSize = safeRadius * 2 * margin;
  const visibleWidth = camera.right - camera.left;
  const visibleHeight = camera.top - camera.bottom;

  return Math.min(visibleWidth / fitSize, visibleHeight / fitSize);
}

function getFrameConfig(
  camera: PerspectiveCamera,
  orthographicCamera: OrthographicCamera,
  object: Object3D,
) {
  const bounds = new Box3().setFromObject(object);
  const size = bounds.getSize(new Vector3());
  const center = bounds.getCenter(new Vector3());
  const sphere = bounds.getBoundingSphere(new Sphere());
  const radius = Math.max(sphere.radius, 0.05);
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const minDistance = Math.max(maxDimension / 40, 0.02);
  const maxDistance = Math.max(maxDimension * 40, 20);
  const verticalFov = (camera.fov * Math.PI) / 180;
  const horizontalFov =
    2 * Math.atan(Math.tan(verticalFov / 2) * Math.max(camera.aspect, 1));
  const fitDistance =
    Math.max(
      radius / Math.sin(Math.max(verticalFov / 2, 0.0001)),
      radius / Math.sin(Math.max(horizontalFov / 2, 0.0001)),
    ) * 1.08;

  object.position.sub(center);

  return {
    bounds: new Box3().setFromObject(object),
    floorOffset: Math.max(size.y / 2, maxDimension * 0.08),
    fitDistance,
    maxDistance,
    maxDimension,
    minDistance,
    orthographicZoom: getOrthographicZoom(orthographicCamera, radius),
    target: new Vector3(0, size.y * 0.08, 0),
  };
}

export const GltfViewerCanvas = forwardRef<
  GltfViewerCanvasHandle,
  GltfViewerCanvasProps
>(function GltfViewerCanvas(
  {
    ariaLabel,
    src,
    autoRotate = false,
    className,
    onSceneStatsChange,
    onStatusChange,
    projectionMode = "perspective",
    renderMode = "solid",
    resourceUrls,
    showAxesGizmo = false,
    showBackgroundDecorations = true,
    showGrid = true,
    showInteractionHint = true,
    showStatusBadge = true,
  },
  ref,
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const axesHelperRef = useRef<AxesHelper | null>(null);
  const gridHelperRef = useRef<GridHelper | null>(null);
  const modelRootRef = useRef<Object3D | null>(null);
  const frameConfigRef = useRef<GltfViewerFrameConfig | null>(null);
  const projectionModeRef = useRef<GltfViewerProjectionMode>(projectionMode);
  const viewPresetRef = useRef<GltfViewerStandardView>("iso");
  const resetCameraRef = useRef<(() => void) | null>(null);
  const [status, setStatus] = useState<GltfViewerStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sceneStats, setSceneStats] = useState<GltfViewerSceneStats | null>(
    null,
  );
  const [scaleBar, setScaleBar] = useState<GltfViewerScaleBar | null>(null);

  function updateZoom(factor: number) {
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!camera || !controls) {
      return;
    }

    if (camera instanceof OrthographicCamera) {
      camera.zoom = clamp(camera.zoom / factor, 0.2, 24);
      camera.updateProjectionMatrix();
      controls.update();
      return;
    }

    const offset = new Vector3().copy(camera.position).sub(controls.target);
    const currentDistance = Math.max(offset.length(), 0.001);
    const nextDistance = clamp(
      currentDistance * factor,
      controls.minDistance,
      controls.maxDistance,
    );

    offset.setLength(nextDistance);
    camera.position.copy(controls.target).add(offset);
    camera.updateProjectionMatrix();
    controls.update();
  }

  useImperativeHandle(
    ref,
    () => ({
      fitView: () => resetCameraRef.current?.(),
      resetView: () => {
        viewPresetRef.current = "iso";
        resetCameraRef.current?.();
      },
      setView: (view) => {
        viewPresetRef.current = view;
        resetCameraRef.current?.();
      },
      zoomIn: () => updateZoom(0.84),
      zoomOut: () => updateZoom(1.18),
    }),
    [],
  );

  useEffect(() => {
    onStatusChange?.({
      errorMessage,
      status,
    });
  }, [errorMessage, onStatusChange, status]);

  useEffect(() => {
    onSceneStatsChange?.(sceneStats);
  }, [onSceneStatsChange, sceneStats]);

  useEffect(() => {
    projectionModeRef.current = projectionMode;
    resetCameraRef.current?.();
  }, [projectionMode]);

  useEffect(() => {
    if (!axesHelperRef.current) {
      return;
    }

    axesHelperRef.current.visible = showAxesGizmo;
  }, [showAxesGizmo]);

  useEffect(() => {
    const controls = controlsRef.current;

    if (!controls) {
      return;
    }

    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.4;
  }, [autoRotate]);

  useEffect(() => {
    if (!gridHelperRef.current) {
      return;
    }

    gridHelperRef.current.visible = showGrid;
  }, [showGrid]);

  useEffect(() => {
    if (!modelRootRef.current) {
      return;
    }

    applyRenderMode(modelRootRef.current, renderMode);
  }, [renderMode]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    if (!src.trim()) {
      setStatus("error");
      setErrorMessage("GLTF 파일 주소가 비어 있습니다.");
      setSceneStats(null);
      return;
    }

    let disposed = false;
    let modelRoot: Object3D | null = null;
    let lastScaleBarSnapshot = "";

    setStatus("loading");
    setErrorMessage(null);
    setSceneStats(null);
    setScaleBar(null);
    resetCameraRef.current = null;

    const scene = new Scene();
    const perspectiveCamera = new PerspectiveCamera(42, 1, 0.1, 1000);
    const orthographicCamera = new OrthographicCamera(
      -1,
      1,
      1,
      -1,
      0.001,
      1000,
    );
    const renderer = new WebGLRenderer({
      alpha: showBackgroundDecorations,
      antialias: true,
      powerPreference: "high-performance",
    });

    cameraRef.current = perspectiveCamera;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.autoClear = false;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(
      new Color(showBackgroundDecorations ? "white" : "whitesmoke"),
      showBackgroundDecorations ? 0 : 1,
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.domElement.className = "h-full w-full touch-none";

    container.appendChild(renderer.domElement);

    const pmremGenerator = new PMREMGenerator(renderer);
    const environmentRenderTarget = pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04,
    );

    scene.environment = environmentRenderTarget.texture;

    const controls = new OrbitControls(perspectiveCamera, renderer.domElement);

    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.zoomSpeed = 1.15;
    controls.minDistance = 0.02;
    controls.maxDistance = 80;
    controls.mouseButtons.LEFT = MOUSE.ROTATE;
    controls.mouseButtons.MIDDLE = MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = MOUSE.PAN;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.4;
    controls.minZoom = 0.2;
    controls.maxZoom = 24;

    perspectiveCamera.position.set(2.5, 1.8, 2.8);
    orthographicCamera.position.set(2.5, 1.8, 2.8);
    controls.target.set(0, 0, 0);
    controls.update();

    const hemisphereLight = new HemisphereLight("white", "gainsboro", 0.45);
    const keyLight = new DirectionalLight("white", 0.85);
    const rimLight = new DirectionalLight("white", 0.3);

    keyLight.position.set(5, 7, 6);
    rimLight.position.set(-4, 3, -5);
    scene.add(hemisphereLight, keyLight, rimLight);

    const gridHelper = new GridHelper(10, 10, "slategray", "darkgray");
    const gridMaterials = Array.isArray(gridHelper.material)
      ? gridHelper.material
      : [gridHelper.material];

    for (const material of gridMaterials) {
      material.transparent = true;
      material.opacity = showBackgroundDecorations ? 0.34 : 0.58;
      material.depthWrite = false;
    }

    gridHelper.visible = showGrid;
    gridHelper.renderOrder = -1;
    gridHelper.position.y = -1;
    gridHelperRef.current = gridHelper;
    scene.add(gridHelper);

    const axesHelper = new AxesHelper(1);
    const axesMaterials = Array.isArray(axesHelper.material)
      ? axesHelper.material
      : [axesHelper.material];

    for (const material of axesMaterials) {
      material.depthTest = false;
      material.depthWrite = false;
      material.opacity = showBackgroundDecorations ? 0.92 : 1;
      material.transparent = true;
      material.toneMapped = false;
    }

    axesHelper.visible = showAxesGizmo;
    axesHelper.renderOrder = 2;
    axesHelperRef.current = axesHelper;
    scene.add(axesHelper);

    const getActiveCamera = () =>
      projectionModeRef.current === "orthographic"
        ? orthographicCamera
        : perspectiveCamera;

    const applyView = (
      view: GltfViewerStandardView = viewPresetRef.current,
    ) => {
      const frameConfig = frameConfigRef.current;

      if (!frameConfig) {
        return;
      }

      const preset = VIEW_PRESETS[view];
      const activeCamera = getActiveCamera();

      controls.object = activeCamera;
      cameraRef.current = activeCamera;
      activeCamera.up.copy(preset.up);
      activeCamera.position
        .copy(frameConfig.target)
        .addScaledVector(preset.direction, frameConfig.fitDistance);
      activeCamera.near = Math.max(frameConfig.maxDimension / 400, 0.001);
      activeCamera.far = Math.max(frameConfig.maxDimension * 40, 20);

      if (activeCamera instanceof PerspectiveCamera) {
        activeCamera.updateProjectionMatrix();
        controls.minDistance = frameConfig.minDistance;
        controls.maxDistance = frameConfig.maxDistance;
      } else {
        activeCamera.zoom = frameConfig.orthographicZoom;
        activeCamera.updateProjectionMatrix();
        controls.minZoom = Math.max(frameConfig.orthographicZoom * 0.2, 0.05);
        controls.maxZoom = Math.max(frameConfig.orthographicZoom * 12, 2);
      }

      controls.target.copy(frameConfig.target);
      activeCamera.lookAt(frameConfig.target);
      controls.update();
      updateScaleBar();
    };

    const resize = () => {
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      const aspect = width / height;

      perspectiveCamera.aspect = aspect;
      perspectiveCamera.updateProjectionMatrix();
      orthographicCamera.left = -aspect;
      orthographicCamera.right = aspect;
      orthographicCamera.top = 1;
      orthographicCamera.bottom = -1;
      orthographicCamera.updateProjectionMatrix();
      renderer.setSize(width, height, false);

      if (
        frameConfigRef.current &&
        projectionModeRef.current === "orthographic"
      ) {
        frameConfigRef.current = {
          ...frameConfigRef.current,
          orthographicZoom: getOrthographicZoom(
            orthographicCamera,
            frameConfigRef.current.bounds.getBoundingSphere(new Sphere())
              .radius,
          ),
        };
        applyView();
      }
    };

    const updateScaleBar = () => {
      if (!modelRoot) {
        if (lastScaleBarSnapshot) {
          lastScaleBarSnapshot = "";
          setScaleBar(null);
        }
        return;
      }

      const nextScaleBar = getScaleBar(
        getActiveCamera(),
        controls,
        container.clientWidth,
      );

      if (!nextScaleBar) {
        if (lastScaleBarSnapshot) {
          lastScaleBarSnapshot = "";
          setScaleBar(null);
        }
        return;
      }

      const roundedWidth = Math.round(nextScaleBar.widthPx);
      const nextSnapshot = `${nextScaleBar.label}:${roundedWidth}`;

      if (nextSnapshot === lastScaleBarSnapshot) {
        return;
      }

      lastScaleBarSnapshot = nextSnapshot;
      setScaleBar({
        label: nextScaleBar.label,
        widthPx: roundedWidth,
      });
    };

    resize();

    const resizeObserver =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(resize);

    resizeObserver?.observe(container);

    const loadingManager = new LoadingManager();

    loadingManager.setURLModifier((url: string) =>
      resolveResourceUrl(url, resourceUrls),
    );

    const loader = new GLTFLoader(loadingManager);

    loader.load(
      src,
      (gltf: LoadedGltfScene) => {
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
        modelRootRef.current = loadedScene;

        modelRoot.traverse((child: Object3D) => {
          if (!(child instanceof Mesh)) {
            return;
          }

          child.castShadow = true;
          child.receiveShadow = true;

          if (!child.geometry.attributes.normal) {
            child.geometry.computeVertexNormals();
          }

          const materials = Array.isArray(child.material)
            ? child.material
            : [child.material];

          for (const material of materials) {
            (material as Material & { side?: number }).side = DoubleSide;
            material.needsUpdate = true;
          }
        });

        applyRenderMode(modelRoot, renderMode);
        scene.add(modelRoot);

        const embeddedLights = hasEmbeddedLights(modelRoot);

        hemisphereLight.visible = !embeddedLights;
        keyLight.visible = !embeddedLights;
        rimLight.visible = !embeddedLights;

        const modelBounds = new Box3().setFromObject(modelRoot);
        const modelSize = modelBounds.getSize(new Vector3());
        const frameConfig = getFrameConfig(
          perspectiveCamera,
          orthographicCamera,
          modelRoot,
        );
        const gridSize = getGridSize(modelSize);

        frameConfigRef.current = frameConfig;
        gridHelper.position.y = -frameConfig.floorOffset;
        gridHelper.scale.setScalar(gridSize / 10);
        axesHelper.position.set(0, -frameConfig.floorOffset, 0);
        axesHelper.scale.setScalar(getOriginAxesSize(modelSize, gridSize));
        controls.minDistance = frameConfig.minDistance;
        controls.maxDistance = frameConfig.maxDistance;
        resetCameraRef.current = () => applyView();
        applyView();
        updateScaleBar();
        setSceneStats(collectSceneStats(modelRoot));
        setStatus("ready");
        setErrorMessage(null);
      },
      undefined,
      (error: unknown) => {
        if (disposed) {
          return;
        }

        setStatus("error");
        setErrorMessage(getErrorMessage(error));
        setSceneStats(null);
        setScaleBar(null);
      },
    );

    renderer.setAnimationLoop(() => {
      controls.update();
      updateScaleBar();
      renderer.clear();
      renderer.render(scene, getActiveCamera());
    });

    return () => {
      disposed = true;
      resetCameraRef.current = null;
      modelRootRef.current = null;
      frameConfigRef.current = null;
      axesHelperRef.current = null;
      gridHelperRef.current = null;
      controlsRef.current = null;
      cameraRef.current = null;
      setScaleBar(null);
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

      environmentRenderTarget.dispose();
      pmremGenerator.dispose();
      axesHelper.geometry.dispose();
      for (const material of axesMaterials) {
        material.dispose();
      }
      renderer.dispose();
    };
  }, [resourceUrls, showBackgroundDecorations, src]);

  const statusLabel =
    status === "ready"
      ? "모델 준비 완료"
      : status === "loading"
        ? "모델 로딩 중"
        : "불러오기 실패";

  return (
    <div
      className={cn(
        "relative min-h-[18rem] overflow-hidden bg-muted/20",
        className,
      )}
    >
      {showBackgroundDecorations ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-muted/45 via-background/15 to-background/60" />
          <div className="absolute left-6 top-4 h-32 w-32 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-accent/40 blur-3xl" />
        </>
      ) : null}

      <div
        ref={containerRef}
        aria-busy={status === "loading"}
        aria-label={ariaLabel}
        className="absolute inset-0"
      />

      {status !== "ready" ? (
        <div className="absolute inset-0 flex items-center justify-center p-6">
          <div className="flex max-w-sm flex-col items-center gap-3 rounded-2xl border bg-background/90 px-5 py-4 text-center shadow-sm backdrop-blur">
            {status === "loading" ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    GLTF 모델을 불러오는 중입니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    메시가 준비되면 회전과 확대를 바로 확인할 수 있습니다.
                  </p>
                </div>
              </>
            ) : (
              <>
                <TriangleAlert className="h-6 w-6 text-destructive" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    모델을 표시하지 못했습니다.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {errorMessage ??
                      "파일 형식 또는 경로를 다시 확인해 주세요."}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

      {showInteractionHint ||
      showStatusBadge ||
      (status === "ready" && scaleBar) ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-2">
            {showInteractionHint ? (
              <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
                왼쪽 드래그로 회전, 휠로 확대, Shift+왼쪽 또는 오른쪽 드래그로
                이동
              </div>
            ) : null}

            {status === "ready" && scaleBar ? (
              <div className="w-fit text-[11px] text-foreground/80 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                <div className="mb-1 font-medium">{scaleBar.label}</div>
                <div
                  className="relative h-3"
                  style={{ width: `${scaleBar.widthPx}px` }}
                >
                  <div className="absolute inset-x-0 bottom-0 border-t-2 border-foreground/80" />
                  <div className="absolute bottom-0 left-0 h-3 border-l-2 border-foreground/80" />
                  <div className="absolute bottom-0 right-0 h-3 border-r-2 border-foreground/80" />
                  <div className="absolute left-1/2 bottom-0 h-2 border-l border-foreground/50" />
                </div>
              </div>
            ) : null}
          </div>

          {showStatusBadge ? (
            <div className="rounded-full border bg-background/85 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur">
              {statusLabel}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
});
