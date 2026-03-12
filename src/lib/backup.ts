import { applyLocalSyncSnapshot, getLocalSyncSnapshot, migrateSyncData, type SyncableDataV2 } from "@/lib/sync";

const APP_VERSION = "1.0.0";
const BACKUP_VERSION = 1;

export type BackupPayloadV1 = {
    version: typeof BACKUP_VERSION;
    appVersion: string;
    exportedAt: string;
    data: SyncableDataV2;
};

export function createBackupPayload(): BackupPayloadV1 {
    return {
        version: BACKUP_VERSION,
        appVersion: APP_VERSION,
        exportedAt: new Date().toISOString(),
        data: getLocalSyncSnapshot(),
    };
}

export function downloadBackup() {
    const payload = createBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const dateKey = payload.exportedAt.slice(0, 10);
    anchor.href = url;
    anchor.download = `focus-valley-backup-${dateKey}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    return payload;
}

export async function restoreBackup(file: File): Promise<BackupPayloadV1> {
    const text = await file.text();
    const parsed = JSON.parse(text) as Partial<BackupPayloadV1>;
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup file.");
    }

    const syncSnapshot = migrateSyncData(parsed.data, typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString());
    const payload: BackupPayloadV1 = {
        version: BACKUP_VERSION,
        appVersion: typeof parsed.appVersion === "string" ? parsed.appVersion : APP_VERSION,
        exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
        data: syncSnapshot,
    };

    applyLocalSyncSnapshot(syncSnapshot);
    return payload;
}
