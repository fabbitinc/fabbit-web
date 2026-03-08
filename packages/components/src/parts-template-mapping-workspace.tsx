import {
  MappingSaveDialog,
  type MappingSaveDialogProps,
} from "./mapping-save-dialog";
import {
  PartsTemplateMappingBoard,
  type PartsTemplateMappingBoardProps,
} from "./parts-template-mapping-board";
import {
  PartsTemplateMappingScreen,
  type PartsTemplateMappingScreenProps,
} from "./parts-template-mapping-screen";

export interface PartsTemplateMappingWorkspaceProps
  extends Omit<
    PartsTemplateMappingScreenProps,
    "boardContent" | "saveDialogContent"
  > {
  boardProps?: PartsTemplateMappingBoardProps;
  saveDialogKey?: string;
  saveDialogProps?: MappingSaveDialogProps;
}

export function PartsTemplateMappingWorkspace({
  boardProps,
  saveDialogKey,
  saveDialogProps,
  ...screenProps
}: PartsTemplateMappingWorkspaceProps) {
  return (
    <PartsTemplateMappingScreen
      {...screenProps}
      boardContent={boardProps ? <PartsTemplateMappingBoard {...boardProps} /> : null}
      saveDialogContent={
        saveDialogProps ? (
          <MappingSaveDialog
            key={saveDialogKey}
            {...saveDialogProps}
          />
        ) : null
      }
    />
  );
}
